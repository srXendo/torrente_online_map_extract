const fs = require('fs')
const input_file_name = 'mp_dm_vertigo.opt'
const output_file_name = 'mp_dm_vertigo.obj'

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
for(let i = 0; i < local_978.readUInt32LE(); i++){
    pvVar6.push(FUN_FIRSTCALL_10055c00())
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
for(let i = 0; i < this0x88.readUInt32LE(); i++){
    const avStack_910 = reader.get_chunk(0x40);
    const avStack_928 = reader.get_chunk(0xc);
    pvVar6_f.push({
        avStack_910,
        avStack_928
    })
}
const pvVar6_g = FUN_LASTCALL_10058b40()
function FUN_LASTCALL_10058b40(){
    let local_120 = reader.get_chunk(0x40);
    let local_12c = reader.get_chunk(0xc);

    let piVar1 = reader.get_chunk(0x4);
    let local_13c = []
    for(let i = 0; i < piVar1.readUInt32LE(); i++){
        local_13c.push(reader.get_chunk(0x4));
    }
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
            this0x84.texture.push(_Memory);
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
console.log('reader.pointer: ', reader.pointer, 'file_length: ', input_file.length, '\n pvVar6_g', JSON.stringify(pvVar6_g))
const exported = {
    pvVar6,
    pvVar6_b,
    //pvVar6_c,
    //pvVar6_d,
    //pvVar6_e,
    //pvVar6_f*/
}
function extractGeometry(pvVar6, pvVar6_b, pvVar6_d = [], pvVar6_f = []) {
    const vertices = [];
    const normals = [];
    const indices = [];

    let baseVertex = 0;
    
    // Almacenar transformaciones por modelo/grupo para aplicarlas después
    const transformations = [];

    // Función para extraer matriz 4x4 de un buffer
    function extractMatrix4x4(bufferData) {
        if (!bufferData || bufferData.length < 64) return null;
        
        const matrix = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            matrix[i] = bufferData.readFloatLE(i * 4);
        }
        return matrix;
    }

    // Función para extraer vector 3 de un buffer
    function extractVector3(bufferData, offset = 0) {
        if (!bufferData || bufferData.length < offset + 12) return null;
        
        return [
            bufferData.readFloatLE(offset + 0),
            bufferData.readFloatLE(offset + 4),
            bufferData.readFloatLE(offset + 8)
        ];
    }

    // Procesar transformaciones de pvVar6_d
    if (pvVar6_d && pvVar6_d.length > 0) {
        console.log(`Procesando ${pvVar6_d.length} transformaciones de pvVar6_d`);
        
        for (const transformObj of pvVar6_d) {
            const transformData = {
                matrix: null,
                position: null
            };
            
            // Extraer matriz de transformación (probablemente en "16" o "32")
            if (transformObj["16"] && transformObj["16"].data) {
                transformData.matrix = extractMatrix4x4(Buffer.from(transformObj["16"].data));
            }
            
            if (transformObj["32"] && transformObj["32"].data) {
                // Puede ser otra matriz o datos adicionales
                const vec = extractVector3(Buffer.from(transformObj["32"].data));
                if (vec) transformData.position = vec;
            }
            
            transformations.push(transformData);
        }
    }

    // Procesar datos adicionales de pvVar6_f
    const additionalPositions = [];
    if (pvVar6_f && pvVar6_f.length > 0) {
        console.log(`Procesando ${pvVar6_f.length} datos adicionales de pvVar6_f`);
        
        for (const additionalData of pvVar6_f) {
            if (additionalData.avStack_928 && additionalData.avStack_928.data) {
                const pos = extractVector3(Buffer.from(additionalData.avStack_928.data));
                if (pos) additionalPositions.push(pos);
            }
            
            if (additionalData.avStack_910 && additionalData.avStack_910.data) {
                // avStack_910 parece contener matrices de transformación 4x4
                const matrix = extractMatrix4x4(Buffer.from(additionalData.avStack_910.data));
                if (matrix) {
                    transformations.push({
                        matrix: matrix,
                        position: null
                    });
                }
            }
        }
    }

    // Función auxiliar para procesar un array de modelos
    function processModelArray(modelArray, transformIndex = 0) {
        if (!modelArray) return;

        for (const model of modelArray) {
            if (!model.iVar9_b) continue;

            for (const group of model.iVar9_b) {
                if (!group[0x08]) continue;

                for (const sub of group[0x08]) {
                    if (!sub[0x68]) continue;

                    for (const mesh of sub[0x68]) {
                        const flag = mesh[0x00]?.readUInt32LE?.() ?? 0;
                        const faceCount = mesh[0x0c]?.readUInt32LE?.() ?? 0;
                        const vertexCount = mesh[0x10]?.readUInt32LE?.() ?? 0;

                        /* -------- INDICES -------- */
                        if (mesh[0x18]) {
                            const ib = mesh[0x18];
                            for (let i = 0; i < faceCount; i++) {
                                const a = ib.readUInt16LE(i * 6 + 0) + baseVertex;
                                const b = ib.readUInt16LE(i * 6 + 2) + baseVertex;
                                const c = ib.readUInt16LE(i * 6 + 4) + baseVertex;
                                indices.push(a, b, c);
                            }
                        }

                        /* -------- VERTICES + NORMALES -------- */
                        if (mesh[0x1c]) {
                            const vb = mesh[0x1c];
                            const stride = (flag === 0) ? 0x20 : 0x28;

                            for (let i = 0; i < vertexCount; i++) {
                                const o = i * stride;

                                let x = vb.readFloatLE(o + 0);
                                let y = vb.readFloatLE(o + 4);
                                let z = vb.readFloatLE(o + 8);

                                let nx = vb.readFloatLE(o + 12);
                                let ny = vb.readFloatLE(o + 16);
                                let nz = vb.readFloatLE(o + 20);

                                // Aplicar transformaciones si existen
                                if (transformations.length > 0 && transformIndex < transformations.length) {
                                    const transform = transformations[transformIndex];
                                    
                                    if (transform.matrix) {
                                        // Aplicar transformación matricial (simplificada - solo posición)
                                        // En una implementación completa, multiplicaríamos la matriz 4x4
                                        if (transform.position) {
                                            x += transform.position[0];
                                            y += transform.position[1];
                                            z += transform.position[2];
                                        }
                                    }
                                }

                                // Añadir posiciones adicionales si corresponden
                                if (additionalPositions.length > 0 && i < additionalPositions.length) {
                                    const addPos = additionalPositions[i];
                                    x += addPos[0];
                                    y += addPos[1];
                                    z += addPos[2];
                                }

                                vertices.push(x, y, z);
                                normals.push(nx, ny, nz);
                            }

                            baseVertex += vertexCount;
                            transformIndex++; // Mover a la siguiente transformación para el próximo mesh
                        }
                    }
                }
            }
        }
    }

    // Procesar ambas fuentes de datos
    let transformOffset = 0;
    transformOffset = processModelArray(pvVar6, transformOffset) || 0;
    processModelArray(pvVar6_b, transformOffset);

    return { vertices, normals, indices, transformations, additionalPositions };
}

function geometryToOBJ({ vertices, normals, indices }) {
    let obj = '';

    /* -------- VERTICES -------- */
    for (let i = 0; i < vertices.length; i += 3) {
        obj += `v ${vertices[i].toFixed(6)} ${vertices[i + 1].toFixed(6)} ${vertices[i + 2].toFixed(6)}\n`;
    }

    /* -------- NORMALES -------- */
    for (let i = 0; i < normals.length; i += 3) {
        obj += `vn ${normals[i].toFixed(6)} ${normals[i + 1].toFixed(6)} ${normals[i + 2].toFixed(6)}\n`;
    }

    /* -------- CARAS -------- */
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] + 1;
        const b = indices[i + 1] + 1;
        const c = indices[i + 2] + 1;

        // v//vn (sin UVs)
        obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
    }

    return obj;
}

// Llamar a la función con todas las variables
const geometry = extractGeometry(pvVar6, pvVar6_b, pvVar6_d, pvVar6_f);
const objText = geometryToOBJ(geometry);

// Node.js
require('fs').writeFileSync(output_file_name, objText);

// Browser
// console.log(objText);

/*console.log("Resumen de extracción:");
console.log("-" .repeat(40));
console.log(`${geometry.vertices.length / 3} vértices extraídos`);
console.log(`${geometry.normals.length / 3} normales extraídas`);
console.log(`${geometry.indices.length / 3} triángulos extraídos`);
console.log(`${geometry.transformations.length} transformaciones aplicadas`);
console.log(`${geometry.additionalPositions.length} posiciones adicionales incluidas`);
console.log("-" .repeat(40));*/
