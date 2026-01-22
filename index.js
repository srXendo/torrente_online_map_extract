const fs = require('fs')
const path = require('path')
const input_file_name = 'mp_dm_vertigo.opt'
const output_file_name = 'mp_dm_vertigo.obj'
let profundity_level = 0
if (!fs.existsSync(input_file_name)) {
    throw new Error(`Err: file input not exist: ${input_file_name}`)
}

//read_file
const input_file = fs.readFileSync(input_file_name)
if (input_file.length === 0) {
    throw new Error(`Err: file input is empty: ${input_file_name}`)
}
class Reader {
    pointer = 0x00
    buffer_file = null
    constructor(file_buffer){
        this.buffer_file = file_buffer
    }
    get_chunk(offset = 4){
        if(this.pointer + offset > this.buffer_file.length){
           // console.error(new Error(`chunk size exceded buffer_file.length this.pointer: ${this.pointer} offset:${offset} this.buffer_file.length: ${this.buffer_file.length}`))
            return false
        }
        const res = this.buffer_file.slice(this.pointer, this.pointer + offset)
        this.pointer = this.pointer + offset
        return res
    }
}
const reader  = new Reader(input_file)
const header = reader.get_chunk()
if(header.toString('ascii') == 'VTOP'){
    throw new Error('OPT Mapa obsoleto')
}else if(header.toString('ascii') != 'VTO1'){
    throw new Error('OPT Mapa Corrupto')
}

// 2. Various header fields
const this0x14 = reader.get_chunk(4);
const local_978 = reader.get_chunk(4);
const local_97c = reader.get_chunk(4);
const local_980 = reader.get_chunk(4);
const this0x7c = reader.get_chunk(4);
const local_988 = reader.get_chunk(4);
const this0x88 = reader.get_chunk(4);
const local_92c = reader.get_chunk(4);

const pvVar6 = []
let last_healty = 0
for(let i = 0; i < local_978.readUInt32LE(); i++){
    const row = FUN_FIRSTCALL_10055c00()
    pvVar6.push(row)
    

    const arr = [0,1,10,11,12,13,14,148,149,15,150,151,152,153,154,155,156,157,16,2,3,4,41,486,487,488,489,490,491,492,493,494,495,496,5,544,545,546,547,6,614,615,616,617,618,619,620,621,622,623,624,625,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,7,700,701,702,703,704,705,707,8,9]
    const { obj, mtl } = exportOBJ_MTL(pvVar6[pvVar6.length-1], 'modelo'+i);

    if(arr.indexOf(i) > -1){
        console.log('objeto desalineado: ', JSON.stringify(row))
        console.log('objeto alineado: ', JSON.stringify(last_healty))

    }else{
        last_healty = row
    }
    if(i === 635){
        console.log('suelo con 4 farolas, 2 palmeras 2 bancos y una papelera', JSON.stringify(row) )
    }
    if(i === 15){
        console.log('farola unica: ', JSON.stringify(row))
    }
    fs.writeFileSync('./map/modelo'+i+'.obj', obj);
    fs.writeFileSync('./map/modelo'+i+'.mtl', mtl);
}


const pvVar6_b = []
for(let i = 0; i < local_97c.readUInt32LE(); i++){
    let row = {
        iStack_934: reader.get_chunk(4),
        auStack_8d0: reader.get_chunk(0x40),
        auStack_888: reader.get_chunk(0x60)
    }
    pvVar6_b.push(row)
}


const pvVar6_c = []
for(let i = 0; i < local_980.readUInt32LE(); i++){
    const sStack_970 = reader.get_chunk(4);
    const pcVar8 = reader.get_chunk(sStack_970.readUInt32LE());
    const auStack_91c = reader.get_chunk(0xc);
    const fStack_938 = reader.get_chunk(4);
    const fStack_93c = reader.get_chunk(4);
    const uStack_930 = reader.get_chunk(4);
    pvVar6_c.push({
        sStack_970,
        pcVar8,
        auStack_91c,
        fStack_938,
        fStack_93c,
        uStack_930
    })
}
const pvVar6_d = []
for(let i = 0; i < this0x7c.readUInt32LE(); i++){
    const uStack_940 = reader.get_chunk(4);
    let obj = {
        0x10: reader.get_chunk(0x10),
        0x20: reader.get_chunk(0x10),
        0x30: reader.get_chunk(0x10)
    }
    switch(uStack_940.readUInt32LE()){
        case 0: 
            obj[0x44] = reader.get_chunk(0xc);
            obj[0x50] = reader.get_chunk(4);
            obj[0x54] = reader.get_chunk(4);
            break;
        case 1:
            obj[0x44] = reader.get_chunk(0xc);
            obj[0x50] = reader.get_chunk(0xc);
            obj[0x5c] = reader.get_chunk(4);            
            break;
        case 2:
            obj[0x80] = reader.get_chunk(0xc);
            break;
        case 3:
        default:
        break;
    }
    
    pvVar6_d.push(obj)
}

const pvVar6_e = []
for(let i = 0; i < local_988.readUInt32LE(); i++){
    const iStack_990 = reader.get_chunk(4);
    const obj = {
        0x00: reader.get_chunk(iStack_990.readUInt32LE() * 0xc),
        childs: []
    }
    for(let x = 0; x < iStack_990.readUInt32LE(); x++){
    }
    pvVar6_e.push(obj)
    
}

const pvVar6_f = []
function applyMatrix4(vec, mat) {
    // vec = Float32Array[3], mat = Float32Array[16] (column-major o row-major según motor)
    const x = vec[0], y = vec[1], z = vec[2];
    return [
        mat[0]*x + mat[4]*y + mat[8]*z + mat[12],
        mat[1]*x + mat[5]*y + mat[9]*z + mat[13],
        mat[2]*x + mat[6]*y + mat[10]*z + mat[14]
    ];
}

let references_text = '';

for(let i = 0; i < this0x88.readUInt32LE(); i++){
    const avStack_910 = reader.get_chunk(0x40); // 16 floats
    const avStack_928 = reader.get_chunk(0xc);  // 3 floats

    // Convertir a Float32Array
    const mat = new Float32Array(16);
    for(let j = 0; j < 16; j++){
        mat[j] = avStack_910.readFloatLE(j*4);
    }
    const vec = [
        avStack_928.readFloatLE(0),
        avStack_928.readFloatLE(4),
        avStack_928.readFloatLE(8)
    ];

    // Aplicar la transformación
    const worldPos = applyMatrix4(vec, mat);

    // Escribir al .obj
    references_text += `v ${worldPos[0]} ${worldPos[1]} ${-worldPos[2]}\n`;
}

fs.writeFileSync('./map/Areferences.obj', references_text);

const pvVar6_g = FUN_LASTCALL_10058b40()


function FUN_LASTCALL_10058b40(){
    let local_120 = reader.get_chunk(0x40);
    let local_12c = reader.get_chunk(0xc);

    let piVar1 = reader.get_chunk(0x4);
    let local_13c = []
    for(let i = 0; i < piVar1.readUInt32LE(); i++){
        local_13c.push(reader.get_chunk(0x4));
    }
    //console.log('reference id: ', local_13c)
    let local_138 = reader.get_chunk(4);
    let second_for = []
    for(let i = 0; i < local_138.readUInt32LE(); i++){
        let local_13c_2 = reader.get_chunk(4)
        second_for.push(local_13c_2)
    }
    
    let pvVar2_0xf0 = reader.get_chunk(4);
    let pvVar2_0xf4 = 0
    if(pvVar2_0xf0.readUInt32LE() > 0){

        // Leemos 'count * 4' bytes y los guardamos en pvVar2_0xf4
        pvVar2_0xf4 = reader.get_chunk(pvVar2_0xf0.readUInt32LE() * 4);

    }
    
    let pvVar2_0xd0 = reader.get_chunk(4);
    let pvVar4 = []
    for(let i = 0; i < pvVar2_0xd0.readUInt32LE(); i++){
        pvVar4.push(FUN_LASTCALL_10058b40())
    }
    profundity_level = 1+ profundity_level
    console.log('new profunidty: ', profundity_level)
    return {
        local_120,
        local_12c,
        piVar1,
        local_13c,
        local_138,
        second_for,
        pvVar2_0xf0,
        pvVar2_0xf4,
        pvVar2_0xd0,
        pvVar4,
    }
}
function FUN_FIRSTCALL_10055c00(){
    
    const piVar1 = reader.get_chunk(4);
    const iVar9 = []
    for(let i = 0; i < piVar1.readUInt32LE(); i++){
       
        const sStack_34 = reader.get_chunk(4);
        
        const this0x84 = {
            0x00: reader.get_chunk(sStack_34.readUInt32LE()),
            0x04: reader.get_chunk(),
            texture: []
        }
        
        for(let x = 0; x < this0x84[0x04].readUInt32LE(); x++){
            const sStack_34_b = reader.get_chunk(4);
            const _Memory = reader.get_chunk(sStack_34_b.readUInt32LE()); //texture
            // _Memory contiene nombre de las texturas 
            const texture = get_texture(_Memory)
            //this0x84.texture.push(texture);
        }
        this0x84[0xc] = reader.get_chunk(1)
        this0x84[0x10] = reader.get_chunk(0x10)
        this0x84[0x20] = reader.get_chunk(0x10)
        this0x84[0x30] = reader.get_chunk(0x10)
        this0x84[0x40] = reader.get_chunk(0x10)
        this0x84[0x50] = reader.get_chunk(4);

        iVar9.push(this0x84)

    }
    const piVar1_b = reader.get_chunk(4);
    const iVar9_b = []
    for(let i = 0; i < piVar1_b.readUInt32LE(); i++){
        const this0x8c = {
            0x00: reader.get_chunk(4),
            0x04: reader.get_chunk(4),
            0x08: []
        }
        for(let x = 0; x < this0x8c[0x04].readUInt32LE(); x++){
            const row_this0x8c = {
                0x00: reader.get_chunk(1),
                0x04: reader.get_chunk(4),
                0x08: reader.get_chunk(0x60),
                0x68: []
            }
            for (let y = 0; y < row_this0x8c[0x04].readUInt32LE(); y++) {

                const row_0x68 = {
                    0x00: reader.get_chunk(4),
                    0x04: reader.get_chunk(4),
                    0x08: reader.get_chunk(4),
                    0x0c: reader.get_chunk(4),
                    0x10: reader.get_chunk(4),
                    0x14: reader.get_chunk(4),
                    0x18: null, // buffer A
                    0x1c: null  // buffer B
                };
                //call
                /**
                 * 
                    vtFile_Read(param_1,(void *)(*(int *)(iVar5 + iVar8 + 0x68) + iVar7),4);
                    vtFile_Read(param_1,(void *)(*(int *)(*(int *)(iVar9 + 8 + *(int *)((int)this + 0x8c))
                                                            + 0x68 + iVar8) + 4 + iVar7),4);
                    vtFile_Read(param_1,(void *)(*(int *)(*(int *)(iVar9 + 8 + *(int *)((int)this + 0x8c))
                                                            + 0x68 + iVar8) + 8 + iVar7),4);
                    vtFile_Read(param_1,(void *)(*(int *)(*(int *)(iVar9 + 8 + *(int *)((int)this + 0x8c))
                                                            + 0x68 + iVar8) + 0xc + iVar7),4);
                    vtFile_Read(param_1,(void *)(*(int *)(*(int *)(iVar9 + 8 + *(int *)((int)this + 0x8c))
                                                            + 0x68 + iVar8) + 0x10 + iVar7),4);
                    vtFile_Read(param_1,(void *)(*(int *)(*(int *)(iVar9 + 8 + *(int *)((int)this + 0x8c))
                                                            + 0x68 + iVar8) + 0x14 + iVar7),4);
                    iVar5 = FUN_10031d40(DAT_100bee20,
                                        (undefined4 *)
                                        (*(int *)(*(int *)(*(int *)(iVar9 + 8 +
                                                                    *(int *)((int)this + 0x8c)) + 0x68 +
                                                            iVar8) + 8 + iVar7) * 0x58 +
                                        *(int *)((int)this + 0x84)));
                 */
                // ---- buffer A (count * 6) ----
                const countA = row_0x68[0x0c].readUInt32LE();
                if (countA > 0) {
                    row_0x68[0x18] = reader.get_chunk(countA * 6);
                }
                
                // ---- buffer B (conditional size) ----
                const flag   = row_0x68[0x00].readUInt32LE();
                const countB = row_0x68[0x10].readUInt32LE();

                let sizeB = 0;
                if (countB > 0) {
                    if (flag === 0) {
                        sizeB = countB << 5;      // countB * 32
                    } else {
                        sizeB = countB * 0x28;    // countB * 40
                    }

                    row_0x68[0x1c] = reader.get_chunk(sizeB);

                }


                row_this0x8c[0x68].push(row_0x68)

                
                
                
            }

            this0x8c[0x08].push(row_this0x8c)
        }
        iVar9_b.push(this0x8c)
    }
    const this0x90 = reader.get_chunk(0x60);
    const this0x20 = reader.get_chunk(0x40);
    return {
        this0x90,
        this0x20,
        iVar9_b,
        iVar9
    }
    
}
function exportOBJ_MTL(parsed, name = 'model') {
    let obj = `mtllib ${name}.mtl\n`;
    let mtl = '';

    let vOffset = 1;
    let materialIndex = 0;

    // ==========================
    // MATERIALES → MTL
    // ==========================
    parsed.iVar9.forEach((mat, i) => {
        const tex = mat.texture?.[0];
        const texName = tex?.name_texture
            ? tex.name_texture.replace('.tex', '.dds')
            : null;

        mtl += `newmtl mat_${i}\n`;
        mtl += `Ka 1 1 1\nKd 1 1 1\nKs 0 0 0\nillum 2\n`;
        if (texName) mtl += `map_Kd export/${texName}\n`;
        mtl += `\n`;
    });

    // ==========================
    // GEOMETRÍA → OBJ
    // ==========================
    for (const block of parsed.iVar9_b) {
        for (const group of block[0x08]) {
            for (const mesh of group[0x68]) {

                const vb = mesh[0x1c];
                const ib = mesh[0x18];
                const require_slave = mesh[0x04].readUInt32LE()
                if(require_slave === 0){
                    
                }else{
                   
                }

                if (!vb) {
                    console.log('referencia a material?')
                    continue;
                };

                const vCount = mesh[0x10].readUInt32LE();
                const fCount = mesh[0x0c].readUInt32LE();
                const stride = vb.length / vCount;

                // ---- MATERIAL ----
                obj += `usemtl mat_${materialIndex}\n`;
                materialIndex = (materialIndex + 1) % parsed.iVar9.length;

                // ---- VERTICES / NORMALS / UV ----
                for (let i = 0; i < vCount; i++) {
                    const o = i * stride;

                    const x = vb.readFloatLE(o);
                    const y = vb.readFloatLE(o + 4);
                    const z = vb.readFloatLE(o + 8);

                    const nx = vb.readFloatLE(o + 12);
                    const ny = vb.readFloatLE(o + 16);
                    const nz = vb.readFloatLE(o + 20);

                    let u = 0, v = 0;
                    if (stride >= 32) {
                        u = vb.readFloatLE(o + 24);
                        v = vb.readFloatLE(o + 28);
                    }

                    obj += `v ${x} ${y} ${-z}\n`;
                    obj += `vt ${u} ${1 - v}\n`;
                    obj += `vn ${nx} ${ny} ${-nz}\n`;
                }

                // ---- FACES ----
                const is16 = (ib.length / fCount) <= 6;

                for (let i = 0; i < fCount; i++) {
                    let a, b, c;

                    if (is16) {
                        a = ib.readUInt16LE(i * 6);
                        b = ib.readUInt16LE(i * 6 + 2);
                        c = ib.readUInt16LE(i * 6 + 4);
                    } else {
                        a = ib.readUInt32LE(i * 12);
                        b = ib.readUInt32LE(i * 12 + 4);
                        c = ib.readUInt32LE(i * 12 + 8);
                    }

                    obj += `f ${a+vOffset}/${a+vOffset}/${a+vOffset} `
                        + `${b+vOffset}/${b+vOffset}/${b+vOffset} `
                        + `${c+vOffset}/${c+vOffset}/${c+vOffset}\n`;
                }

                vOffset += vCount;
            }
        }
    }

    return {
        obj,
        mtl
    };
}

function get_texture(buf_name_texture){
    buf_name_texture = buf_name_texture.slice(0, buf_name_texture.length -1)
    const name_texture = buf_name_texture.toString('ascii')
    if (!fs.existsSync(`./demo.vpk/texs/${name_texture}`)) {
        throw new Error(`Err: texture file not exist: ${name_texture}`)
    }

    //read_file
    const texture_input_file = fs.readFileSync(`./demo.vpk/texs/${name_texture}`)
    if (texture_input_file.length === 0) {
        throw new Error(`Err: file texture is empty: ${name_texture}`)
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


console.log('reader.pointer: ', reader.pointer, 'file_length: ', input_file.length)
const exported = {
    pvVar6,
    pvVar6_b,
    pvVar6_c,
    pvVar6_d,
    pvVar6_e,
    pvVar6_f,
    pvVar6_g
}

function extractGeometry(pvVar6, pvVar6_b, pvVar6_d = [], pvVar6_f = [], pvVar6_g = null) {
    const vertices = [];
    const normals  = [];
    const indices  = [];
    const uv       = [];

    const materials = [];
    const materialMap = new Map(); // materialIndex -> materialId usado en OBJ

    // =========================================================
    // 1. EXTRAER GEOMETRÍA BASE + MATERIAL INDEX
    // =========================================================
    const baseGeometries = extractBaseGeometry(pvVar6);

    // =========================================================
    // 2. INSTANCIAS
    // =========================================================
    const instances = [];

    if (pvVar6_g) {
        processHierarchyNode(pvVar6_g, identityMatrix());
    }

    if (instances.length === 0 && Array.isArray(pvVar6_d)) {
        for (let i = 0; i < Math.min(baseGeometries.length, pvVar6_d.length); i++) {
            instances.push({
                geometryIndex: i,
                transform: extractMatrixFromBuffer(pvVar6_d[i])
            });
        }
    }

    // =========================================================
    // 3. CONSTRUIR MESH + MATERIALES
    // =========================================================
    let vertexOffset = 0;

    for (const inst of instances) {
        const geo = baseGeometries[inst.geometryIndex];
        if (!geo) continue;

        // ----- MATERIAL -----
        let matId = 0;
        if (!materialMap.has(geo.materialIndex)) {
            matId = materials.length;
            materialMap.set(geo.materialIndex, matId);

            const matSrc = pvVar6[0]?.iVar9?.[geo.materialIndex];
            const texObj = matSrc?.texture?.[0];

            materials.push({
                name: `mat_${matId}`,
                texture: texObj?.name_texture
                    ? `export/${texObj.name_texture.replace('.tex', '.dds')}`
                    : null
            });
        } else {
            matId = materialMap.get(geo.materialIndex);
        }

        geo._materialId = matId;

        // ----- VERTICES -----
        for (let i = 0; i < geo.vertices.length; i += 3) {
            const p = transformPoint(
                inst.transform,
                geo.vertices[i],
                geo.vertices[i + 1],
                geo.vertices[i + 2]
            );
            vertices.push(p.x, p.y, p.z);
        }

        // ----- NORMALS -----
        for (let i = 0; i < geo.normals.length; i += 3) {
            const n = transformNormal(
                inst.transform,
                geo.normals[i],
                geo.normals[i + 1],
                geo.normals[i + 2]
            );
            normals.push(n.x, n.y, n.z);
        }

        // ----- UV -----
        if (geo.uv.length) uv.push(...geo.uv);
        else for (let i = 0; i < geo.vertices.length / 3; i++) uv.push(0, 0);

        // ----- INDICES -----
        for (const idx of geo.indices) {
            indices.push(idx + vertexOffset);
        }

        geo._indexOffset = vertexOffset;
        vertexOffset += geo.vertices.length / 3;
    }

    // =========================================================
    // 4. EXPORT
    // =========================================================
    return {
        vertices,
        normals,
        indices,
        uv,
        materials,
        toOBJ,
        toMTL
    };

    // =========================================================
    // ================= FUNCIONES INTERNAS ====================
    // =========================================================

    function extractBaseGeometry(pvVar6) {
        const out = [];

        for (const model of pvVar6 ?? []) {
            for (const group of model?.iVar9_b ?? []) {
                for (const sub of group?.[0x08] ?? []) {
                    for (const mesh of sub?.[0x68] ?? []) {
                        const vCount = mesh[0x10]?.readUInt32LE?.() ?? 0;
                        const fCount = mesh[0x0c]?.readUInt32LE?.() ?? 0;
                        if (!vCount || !fCount) continue;

                        const geo = {
                            vertices: [],
                            normals: [],
                            indices: [],
                            uv: [],
                            materialIndex: mesh[0x08]?.readUInt32LE?.() ?? 0
                        };

                        const ib = mesh[0x18];
                        const is16 = (ib.length / fCount) <= 6;
                        for (let i = 0; i < fCount; i++) {
                            if (is16) {
                                geo.indices.push(
                                    ib.readUInt16LE(i * 6),
                                    ib.readUInt16LE(i * 6 + 2),
                                    ib.readUInt16LE(i * 6 + 4)
                                );
                            } else {
                                geo.indices.push(
                                    ib.readUInt32LE(i * 12),
                                    ib.readUInt32LE(i * 12 + 4),
                                    ib.readUInt32LE(i * 12 + 8)
                                );
                            }
                        }

                        const vb = mesh[0x1c];
                        const stride = Math.floor(vb.length / vCount);
                        for (let i = 0; i < vCount; i++) {
                            const o = i * stride;
                            geo.vertices.push(
                                vb.readFloatLE(o),
                                vb.readFloatLE(o + 4),
                                vb.readFloatLE(o + 8)
                            );
                            geo.normals.push(
                                vb.readFloatLE(o + 12),
                                vb.readFloatLE(o + 16),
                                vb.readFloatLE(o + 20)
                            );
                            if (stride >= 32) {
                                geo.uv.push(
                                    vb.readFloatLE(o + 24),
                                    vb.readFloatLE(o + 28)
                                );
                            } else geo.uv.push(0, 0);
                        }

                        out.push(geo);
                    }
                }
            }
        }
        return out;
    }

    function processHierarchyNode(node, parentMatrix) {
        let local = identityMatrix();
        if (node.local_120) local = extractMatrixFromBuffer(node.local_120);
        const world = multiplyMatrices(parentMatrix, local);

        if (Array.isArray(node.local_13c)) {
            for (const buf of node.local_13c) {
                const idx = Buffer.from(buf).readUInt32LE(0);
                instances.push({ geometryIndex: idx, transform: world });
            }
        }

        for (const child of node.pvVar4 ?? []) {
            processHierarchyNode(child, world);
        }
    }

    function extractMatrixFromBuffer(buf) {
        const m = identityMatrix();
        if (!buf?.data) return m;
        const b = Buffer.from(buf.data ?? buf);
        for (let i = 0; i < 16; i++) m[i] = b.readFloatLE(i * 4);
        return m;
    }

    function identityMatrix() {
        const m = new Float32Array(16);
        m[0] = m[5] = m[10] = m[15] = 1;
        return m;
    }

    function multiplyMatrices(a, b) {
        const o = new Float32Array(16);
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                for (let k = 0; k < 4; k++)
                    o[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        return o;
    }

    function transformPoint(m, x, y, z) {
        return {
            x: m[0]*x + m[4]*y + m[8]*z + m[12],
            y: m[1]*x + m[5]*y + m[9]*z + m[13],
            z: m[2]*x + m[6]*y + m[10]*z + m[14]
        };
    }

    function transformNormal(m, x, y, z) {
        return {
            x: m[0]*x + m[4]*y + m[8]*z,
            y: m[1]*x + m[5]*y + m[9]*z,
            z: m[2]*x + m[6]*y + m[10]*z
        };
    }

    function toOBJ() {
        let out = 'mtllib model.mtl\n';
        let faceCursor = 0;

        for (let i = 0; i < vertices.length; i += 3)
            out += `v ${vertices[i]} ${vertices[i+1]} ${-vertices[i+2]}\n`;

        for (let i = 0; i < uv.length; i += 2)
            out += `vt ${uv[i]} ${1-uv[i+1]}\n`;

        for (let i = 0; i < normals.length; i += 3)
            out += `vn ${normals[i]} ${normals[i+1]} ${-normals[i+2]}\n`;

        for (const geo of baseGeometries) {
            out += `usemtl mat_${geo._materialId}\n`;
            for (let i = 0; i < geo.indices.length; i += 3) {
                const a = geo.indices[i]   + geo._indexOffset + 1;
                const b = geo.indices[i+1] + geo._indexOffset + 1;
                const c = geo.indices[i+2] + geo._indexOffset + 1;
                out += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
            }
        }
        return out;
    }

    function toMTL() {
        let out = '';
        for (const m of materials) {
            out += `newmtl ${m.name}\n`;
            out += `Kd 1 1 1\nKa 1 1 1\nKs 0 0 0\nillum 2\n`;
            if (m.texture) out += `map_Kd ${m.texture}\n`;
            out += '\n';
        }
        return out;
    }
}



// Función para exportar a OBJ (maneja instancias)
function geometryToOBJ({ vertices, normals, indices, uv = [] }) {
    let obj = '# Exported from geometry extractor\n';
    obj += '# Supports model instancing\n\n';
    
    // Vértices
    obj += '# Vertices\n';
    for (let i = 0; i < vertices.length; i += 3) {
        obj += `v ${vertices[i].toFixed(6)} ${vertices[i + 1].toFixed(6)} ${-vertices[i + 2].toFixed(6)}\n`;
    }
    
    // UVs
    if (uv.length > 0) {
        obj += '\n# Texture coordinates\n';
        for (let i = 0; i < uv.length; i += 2) {
            obj += `vt ${uv[i].toFixed(6)} ${1.0 - uv[i + 1].toFixed(6)}\n`; // Flip V coordinate
        }
    }
    
    // Normales
    obj += '\n# Normals\n';
    for (let i = 0; i < normals.length; i += 3) {
        // Normalizar normales
        const nx = normals[i];
        const ny = normals[i + 1];
        const nz = normals[i + 2];
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) {
            obj += `vn ${(nx/len).toFixed(6)} ${(ny/len).toFixed(6)} ${-(nz/len).toFixed(6)}\n`;
        } else {
            obj += `vn ${nx.toFixed(6)} ${ny.toFixed(6)} ${-nz.toFixed(6)}\n`;
        }
    }
    
    // Caras
    obj += '\n# Faces\n';
    const hasUV = uv.length > 0;
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] + 1;
        const b = indices[i + 1] + 1;
        const c = indices[i + 2] + 1;
        
        if (hasUV) {
            obj += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
        } else {
            obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
        }
    }
    
    return obj;
}

// Ejemplo de uso
function processAndExport() {
    const geometry = extractGeometry(pvVar6, pvVar6_b, pvVar6_d, pvVar6_f, pvVar6_g);
    
    
    // Mostrar modelos con múltiples instancias
    
    const objText = geometryToOBJ(geometry);
    //require('fs').writeFileSync(output_file_name, geometry.toOBJ());
    //require('fs').writeFileSync(output_file_name+'.MTL', geometry.toMTL());
    console.log('Archivo OBJ guardado como output_with_instances.obj', JSON.stringify(exported));
}
processAndExport()