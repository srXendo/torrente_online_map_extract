/**
 * Centrar modelos base antes de aplicar translación
 * Los modelos base tienen posición "baked", hay que restar su centro
 */
const fs = require('fs')
const path = require('path')
const input_file_name = process.argv[2] || 'mp_dm_vertigo.opt'
const output_file_name = input_file_name.replace('.opt', '.obj').replace('.OPT', '.obj')

const input_file = fs.readFileSync(input_file_name)

class Reader {
    pointer = 0x00
    buffer_file = null
    constructor(file_buffer){ this.buffer_file = file_buffer }
    get_chunk(offset = 4){
        if(this.pointer + offset > this.buffer_file.length) return false
        const res = this.buffer_file.slice(this.pointer, this.pointer + offset)
        this.pointer = this.pointer + offset
        return res
    }
}

const reader = new Reader(input_file)

reader.get_chunk() // VTO1
reader.get_chunk(4)
const numModels = reader.get_chunk(4).readUInt32LE()
const numSecondary = reader.get_chunk(4).readUInt32LE()
reader.get_chunk(4*5)

console.log(`Modelos: ${numModels}, Secundarias: ${numSecondary}`)

// Parsear modelos y calcular centro X/Z y minY (base)
const models = []
for(let i = 0; i < numModels; i++){
    const model = parseModel()


    models.push(model)
}

// Parsear secundarias
const secondaryInstances = []

for(let i = 0; i < numSecondary; i++){
    const baseModelIdx = reader.get_chunk(4).readUInt32LE()
    const matBuf = reader.get_chunk(0x40)
    const box = reader.get_chunk(0x60)

    secondaryInstances.push({
        baseModelIdx,
        matBuf,
        box
    })
}


// Exportar
let obj = `# Modelos centrados + translación\n\n`
let mtl = ``
let materialIndex = 0;
let vOffset = 1

let totalV = 0

// Modelos base (sin transformación - ya están en posición)
console.log('Exportando modelos base...')
for(let i = 0; i < numModels; i++){
    exportModelRaw(models[i])
}

// Secundarias: centrar modelo y mover a posición de matriz
console.log('Exportando secundarias centradas...')
for(let i=0;i<secondaryInstances.length;i++){
    const sec = secondaryInstances[i]
    const model = models[sec.baseModelIdx]

    exportModelInstance(
        model,
        model.matrixData,
        sec,
        i
    )
}



console.log(`\nArchivo: ${output_file_name}`)
console.log(`Vértices: ${totalV}`)

// Exportar sin modificar (para modelos base)
function exportModelRaw(model){

    if(!model) return
    if(model.textures.length > 0){
        materialIndex = materialIndex +1 
        const texture = model.textures[0] 
        const tex = texture.texture;
        const texName = texture.name_texture
            ? tex.name_texture.replace('.tex', '.dds')
            : null;

        mtl += `newmtl mat_${materialIndex}\n`;
        mtl += `Ka 1 1 1\nKd 1 1 1\nKs 0 0 0\nillum 2\n`;
        if (texName) mtl += `map_Kd export/${texName}\n`;
        mtl += `\n`;
        
    }
    for(const mesh of model.meshes){
        const { vb, ib, vCount, fCount, stride } = mesh
        if(!vb || !ib) continue
        if(model.textures.length > 0){
            obj += `usemtl mat_${materialIndex}\n`;
        }
        
       

        for(let i = 0; i < vCount; i++){
            const o = i * stride
            obj += `v ${vb.readFloatLE(o)} ${vb.readFloatLE(o+4)} ${-vb.readFloatLE(o+8)}\n`
            obj += `vt ${stride >= 32 ? vb.readFloatLE(o+24) : 0} ${stride >= 32 ? 1-vb.readFloatLE(o+28) : 0}\n`
            obj += `vn ${vb.readFloatLE(o+12)} ${vb.readFloatLE(o+16)} ${-vb.readFloatLE(o+20)}\n`
        }
        
        for(let i = 0; i < fCount; i++){
            const a = ib.readUInt16LE(i*6) + vOffset
            const b = ib.readUInt16LE(i*6+2) + vOffset
            const c = ib.readUInt16LE(i*6+4) + vOffset
            obj += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`
        }
        
        vOffset += vCount
        totalV += vCount
    }
}

// Exportar centrado y movido a nueva posición
function exportModelInstance(model, baseWorldBuf, sec, fileIdx){

    if(!model) return
    if(model.textures.length > 0){
        const texture = model.textures[0]
        const tex = texture.texture;
        const texName = texture.name_texture
            ? tex.name_texture.replace('.tex', '.dds')
            : null;

        mtl += `newmtl mat_${parseInt(materialIndex)}\n`;
        mtl += `Ka 1 1 1\nKd 1 1 1\nKs 0 0 0\nillum 2\n`;
        if (texName) mtl += `map_Kd export/${texName}\n`;
        mtl += `\n`;
    }
    

    const baseWorld = readMatrix(baseWorldBuf)
    const instanceM = readMatrix(sec.matBuf)

    // EXACTAMENTE como en Python:
    const invBase = invertRigid(baseWorld)
    const finalM  = mul4x4(invBase, instanceM)

    for(const mesh of model.meshes){
        const { vb, ib, vCount, fCount, stride } = mesh
        if(!vb || !ib) continue
        if(model.textures.length > 0){
            obj += `usemtl mat_${materialIndex}\n`;
            materialIndex = materialIndex +1 
        }
        for(let i=0;i<vCount;i++){
            const o = i * stride

            const lx = vb.readFloatLE(o)
            const ly = vb.readFloatLE(o+4)
            const lz = vb.readFloatLE(o+8)

            // aplicar matriz completa
            const x = lx*finalM[0] + ly*finalM[4] + lz*finalM[8]  + finalM[12]
            const y = lx*finalM[1] + ly*finalM[5] + lz*finalM[9]  + finalM[13]
            const z = lx*finalM[2] + ly*finalM[6] + lz*finalM[10] + finalM[14]

            obj += `v ${x} ${y} ${-z}\n`

            obj += `vt ${
                stride >= 32 ? vb.readFloatLE(o+24) : 0
            } ${
                stride >= 32 ? 1 - vb.readFloatLE(o+28) : 0
            }\n`

            const nx = vb.readFloatLE(o+12)
            const ny = vb.readFloatLE(o+16)
            const nz = vb.readFloatLE(o+20)

            const rnx = nx*finalM[0] + ny*finalM[4] + nz*finalM[8]
            const rny = nx*finalM[1] + ny*finalM[5] + nz*finalM[9]
            const rnz = nx*finalM[2] + ny*finalM[6] + nz*finalM[10]

            obj += `vn ${rnx} ${rny} ${-rnz}\n`
        }

        for(let i=0;i<fCount;i++){
            const a = ib.readUInt16LE(i*6)   + vOffset
            const b = ib.readUInt16LE(i*6+2) + vOffset
            const c = ib.readUInt16LE(i*6+4) + vOffset
            obj += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`
        }

        vOffset += vCount
    }

    
}

fs.writeFileSync('./map/'+ output_file_name, obj)
fs.writeFileSync('./map/'+ output_file_name.replace('.obj', '.mtl'), mtl)
function parseModel(){
    const meshes = []
    const textures = []
    const numMat = reader.get_chunk(4).readUInt32LE()
    for(let j = 0; j < numMat; j++){
        const len = reader.get_chunk(4).readUInt32LE()
        reader.get_chunk(len)
        const texCount = reader.get_chunk(4).readUInt32LE()
        for(let k = 0; k < texCount; k++){
            const tlen = reader.get_chunk(4).readUInt32LE()
            
           
            const name_texture = reader.get_chunk(tlen)
            // name_texture contiene nombre de las texturas 
            
            const texture = get_texture(name_texture)
            if(texture === false){

            }else{
                textures.push({texture, name_texture: name_texture.toString('ascii')});
            }
        }
        const is_mesh_double = reader.get_chunk(1)
        reader.get_chunk(0x40 + 4)
    }
    const numGroups = reader.get_chunk(4).readUInt32LE()
    for(let j = 0; j < numGroups; j++){
        reader.get_chunk(4)
        const subCount = reader.get_chunk(4).readUInt32LE()
        for(let k = 0; k < subCount; k++){
            reader.get_chunk(1)
            const meshCount = reader.get_chunk(4).readUInt32LE()
            reader.get_chunk(0x60)
            for(let m = 0; m < meshCount; m++){
                const flag = reader.get_chunk(4).readUInt32LE()
                reader.get_chunk(8)
                const fCount = reader.get_chunk(4).readUInt32LE()
                const vCount = reader.get_chunk(4).readUInt32LE()
                reader.get_chunk(4)
                const stride = flag === 0 ? 32 : 40
                let ib = null, vb = null
                if(fCount > 0) ib = reader.get_chunk(fCount * 6)
                if(vCount > 0) vb = reader.get_chunk(vCount * stride)
                if(vb && ib && vCount > 0 && fCount > 0){
                    meshes.push({ vb, ib, vCount, fCount, stride })
                }
            }
        }
    }
    const bboxData = reader.get_chunk(0x60)
    const matrixData = reader.get_chunk(0x40)
    
    const minX = bboxData.readFloatLE(0)
    const minY = bboxData.readFloatLE(4)
    const minZ = bboxData.readFloatLE(8)
    const multX = bboxData.readFloatLE(12)
    const multY = bboxData.readFloatLE(16)
    const multZ = bboxData.readFloatLE(20)
    const maxX = bboxData.readFloatLE(24)
    const maxY = bboxData.readFloatLE(28)
    const maxZ = bboxData.readFloatLE(32)
    
    const center = {
        x: (minX + maxX) * 0.5,
        y: (minY + maxY) * 0.5,
        z: (minZ + maxZ) * 0.5
    }
    
    return { 
        meshes,
        textures,
        bboxData,
        matrixData,
        bboxMin: { x: minX, y: minY, z: minZ },
        bboxMax: { x: maxX, y: maxY, z: maxZ },
        center
    }
}

function readMatrix(buf){
    const m = new Float32Array(16)
    for(let i=0;i<16;i++){
        m[i] = buf.readFloatLE(i*4)
    }
    return m
}

function mul4x4(A,B){
    const R = new Float32Array(16)
    for(let r=0;r<4;r++){
        for(let c=0;c<4;c++){
            let s = 0
            for(let i=0;i<4;i++){
                s += A[r*4+i] * B[i*4+c]
            }
            R[r*4+c] = s
        }
    }
    return R
}

function invertRigid(m){
    const inv = new Float32Array(16)

    inv[0]=m[0]; inv[1]=m[4]; inv[2]=m[8]
    inv[4]=m[1]; inv[5]=m[5]; inv[6]=m[9]
    inv[8]=m[2]; inv[9]=m[6]; inv[10]=m[10]

    const tx=m[12], ty=m[13], tz=m[14]

    inv[12] = -(tx*inv[0] + ty*inv[4] + tz*inv[8])
    inv[13] = -(tx*inv[1] + ty*inv[5] + tz*inv[9])
    inv[14] = -(tx*inv[2] + ty*inv[6] + tz*inv[10])
    inv[15] = 1

    return inv
}

function get_texture(buf_name_texture){
    buf_name_texture = buf_name_texture.slice(0, buf_name_texture.length -1)
    const name_texture = buf_name_texture.toString('ascii')
    if (!fs.existsSync(`./demo.vpk/texs/${name_texture}`)) {
        return false
    }

    //read_file
    const texture_input_file = fs.readFileSync(`./demo.vpk/texs/${name_texture}`)
    if (texture_input_file.length === 0) {
        return false
    }
    const texture_reader  = new Reader(texture_input_file)
    const unaff_EBP = {
        name_texture: name_texture,
        0x30: texture_reader.get_chunk(4),
        0x11: texture_reader.get_chunk(1),
        0x34: texture_reader.get_chunk(4),
        0x2c: texture_reader.get_chunk(4),
        0x28: texture_reader.get_chunk(4),
        0x24: texture_reader.get_chunk(4),
    }
    unaff_EBP['pvVar4'] = texture_reader.get_chunk(unaff_EBP[0x24].readUInt32LE())
    
    unaff_EBP['dds'] = getBufferDds(unaff_EBP);
    return unaff_EBP
}



function getBufferDds(unaff_EBP, outDir = './map/export') {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const name = unaff_EBP.name_texture.replace(/\0/g, '');

    // 1. Obtener los datos binarios directamente (no Base64)
    const payload = unaff_EBP.pvVar4; // Esto ya es Buffer/binario

    // 2. Leer parámetros exactamente como en el código desensamblado
    const width = unaff_EBP[0x28].readUInt32LE();
    const height = unaff_EBP[0x2c].readUInt32LE();
    const formatFlag = unaff_EBP[0x11].readUInt8(); // 0x00 o 0x01
    const dataSize = unaff_EBP[0x24].readUInt32LE(); // Tamaño de datos
    
    // 3. Determinar formato basado en flag
    let format;
    let formatFourCC;
    
    if (formatFlag === 0x00) {
        format = 'DXT1';
        formatFourCC = 0x31545844; // 'DXT1'
    } else if (formatFlag === 0x01) {
        format = 'DXT5';
        formatFourCC = 0x35545844; // 'DXT5'
    } else {
        console.warn(`Formato desconocido: 0x${formatFlag.toString(16)}, usando DXT5 por defecto`);
        format = 'DXT5';
        formatFourCC = 0x35545844;
    }

    // 4. Verificar si los datos necesitan procesamiento
    // Según el código, podría haber ajuste de dimensiones
    let actualWidth = width;
    let actualHeight = height;
    
    // 5. Crear cabecera DDS con información correcta
    const header = createDDSHeader({
        width: actualWidth,
        height: actualHeight,
        format: format,
        mipmaps: 1,
        dataSize: dataSize
    });

    // 6. Escribir archivo
    const outPath = path.join(outDir, name.replace('.tex','') + '.dds');
    
    // Si payload es un string, convertirlo a Buffer
    let textureData;
    if (typeof payload === 'string') {
        // Si es Base64, decodificarlo
        textureData = Buffer.from(payload, 'base64');
    } else if (Buffer.isBuffer(payload)) {
        textureData = payload;
    } else {
        console.error(`Tipo de datos no soportado: ${typeof payload}`);
        return null;
    }
    
    // Verificar tamaño de datos
    const expectedSize = calculateDXTDataSize(actualWidth, actualHeight, format);

    
    // Ajustar datos si es necesario
    let finalData = textureData;
    if (textureData.length < expectedSize) {
        console.warn(`Datos insuficientes, rellenando con ceros...`);
        const paddedData = Buffer.alloc(expectedSize);
        textureData.copy(paddedData);
        finalData = paddedData;
    } else if (textureData.length > expectedSize) {
        console.warn(`Datos excesivos, truncando...`);
        finalData = textureData.slice(0, expectedSize);
    }
    
    fs.writeFileSync(outPath, Buffer.concat([header, finalData]));
    return Buffer.concat([header, finalData]);
}

function calculateDXTDataSize(width, height, format) {
    // Calcular tamaño para formatos DXT
    const blockSize = (format === 'DXT1') ? 8 : 16;
    const blocksWide = Math.max(1, Math.floor((width + 3) / 4));
    const blocksHigh = Math.max(1, Math.floor((height + 3) / 4));
    return blocksWide * blocksHigh * blockSize;
}

function createDDSHeader(options = {}) {
    const {
        width = 16,
        height = 16,
        format = 'DXT5',
        mipmaps = 1,
        dataSize = 0
    } = options;

    const header = Buffer.alloc(128);
    header.fill(0);

    // Magic number "DDS "
    header.writeUInt32LE(0x20534444, 0); // "DDS "

    // dwSize = 124
    header.writeUInt32LE(124, 4);

    // dwFlags = DDSD_CAPS | DDSD_HEIGHT | DDSD_WIDTH | DDSD_PIXELFORMAT | DDSD_LINEARSIZE
    header.writeUInt32LE(0x21007, 8);

    // dwHeight y dwWidth
    header.writeUInt32LE(height, 12);
    header.writeUInt32LE(width, 16);

    // dwPitchOrLinearSize
    const blockSize = (format === 'DXT1') ? 8 : 16;
    const linearSize = Math.max(1, Math.floor((width + 3) / 4)) * blockSize;
    header.writeUInt32LE(linearSize, 20);

    // dwDepth (0 para 2D)
    header.writeUInt32LE(0, 24);

    // dwMipMapCount
    header.writeUInt32LE(mipmaps, 28);

    // --- DDS_PIXELFORMAT (offset 76) ---
    header.writeUInt32LE(32, 76); // dwSize = 32
    header.writeUInt32LE(0x4, 80); // dwFlags = DDPF_FOURCC

    // dwFourCC
    const fourCC = (format === 'DXT1') ? 0x31545844 :
                   (format === 'DXT3') ? 0x33545844 :
                   (format === 'DXT5') ? 0x35545844 : 0x20585858;
    header.writeUInt32LE(fourCC, 84);

    // dwRGBBitCount, dwRBitMask, dwGBitMask, dwBBitMask, dwABitMask (todo 0 para FOURCC)
    header.writeUInt32LE(0, 88);
    header.writeUInt32LE(0, 92);
    header.writeUInt32LE(0, 96);
    header.writeUInt32LE(0, 100);
    header.writeUInt32LE(0, 104);

    // dwCaps
    header.writeUInt32LE(0x1000, 108); // DDSCAPS_TEXTURE
    
    // dwCaps2, dwCaps3, dwCaps4 (0 para texturas 2D)
    header.writeUInt32LE(0, 112);
    header.writeUInt32LE(0, 116);
    header.writeUInt32LE(0, 120);

    // dwReserved2
    header.writeUInt32LE(0, 124);

    return header;
}