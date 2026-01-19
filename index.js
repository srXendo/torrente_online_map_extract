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
function extractGeometry(pvVar6, pvVar6_b, pvVar6_d = [], pvVar6_f = [], pvVar6_g = null) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const uv = [];
    
    // Estructuras para tracking
    const modelInstances = []; // Instancias de modelos con transformaciones
    const geometryCache = new Map(); // Cache de geometría por modelo base
    let globalVertexOffset = 0;

    // 1. Primero extraer TODA la geometría base (sin transformaciones)
    const baseGeometries = extractBaseGeometry(pvVar6, pvVar6_b);
    
    // 2. Procesar transformaciones globales (pvVar6_d)
    const globalTransforms = [];
    if (pvVar6_d && pvVar6_d.length > 0) {
        for (let i = 0; i < pvVar6_d.length; i++) {
            const transform = extractTransformFromBuffer(pvVar6_d[i]);
            if (transform) globalTransforms.push(transform);
        }
    }

    // 3. Procesar OBBs (pvVar6_f)
    const obbTransforms = [];
    if (pvVar6_f && pvVar6_f.length > 0) {
        for (let i = 0; i < pvVar6_f.length; i++) {
            const obb = extractOBBFromBuffer(pvVar6_f[i]);
            if (obb) obbTransforms.push(obb);
        }
    }

    // 4. Procesar jerarquía (pvVar6_g) - CREAR INSTANCIAS
    function processHierarchyForInstances(node, parentMatrix = null, instancePath = []) {
        if (!node) return;
        
        // Extraer información del nodo
        const localMatrix = extractMatrixFromBuffer(node.local_120) || createIdentityMatrix();
        const localPosition = extractVectorFromBuffer(node.local_12c) || [0, 0, 0];
        const nodeType = extractUInt32FromBuffer(node.piVar1) || 0;
        const modelIndices = extractIndicesFromBufferArray(node.local_13c) || [];
        
        // Calcular matriz mundial para esta instancia
        let worldMatrix;
        if (parentMatrix) {
            worldMatrix = multiplyMatrices(parentMatrix, localMatrix);
        } else {
            worldMatrix = localMatrix;
        }
        
        // Aplicar posición local si existe
        if (localPosition && (localPosition[0] !== 0 || localPosition[1] !== 0 || localPosition[2] !== 0)) {
            const positionMatrix = createTranslationMatrix(localPosition[0], localPosition[1], localPosition[2]);
            worldMatrix = multiplyMatrices(worldMatrix, positionMatrix);
        }
        
        // Para cada índice de modelo en este nodo, crear una instancia
        for (const modelIndex of modelIndices) {
            if (modelIndex >= 0 && modelIndex < baseGeometries.length) {
                const instance = {
                    modelIndex: modelIndex,
                    transform: worldMatrix,
                    nodeType: nodeType,
                    instancePath: [...instancePath, modelIndex],
                    hasTransform: true
                };
                modelInstances.push(instance);
            }
        }
        
        // Procesar hijos recursivamente
        if (node.pvVar4 && Array.isArray(node.pvVar4)) {
            const childPath = [...instancePath, 'c'];
            for (const child of node.pvVar4) {
                processHierarchyForInstances(child, worldMatrix, childPath);
            }
        }
    }
    
    // Procesar la jerarquía principal
    if (pvVar6_g) {
        processHierarchyForInstances(pvVar6_g);
    }
    
    // 5. Si no hay jerarquía, crear instancias basadas en transformaciones globales
    if (modelInstances.length === 0) {
        for (let i = 0; i < baseGeometries.length; i++) {
            let transform = createIdentityMatrix();
            
            // Aplicar transformación global si existe
            if (i < globalTransforms.length && globalTransforms[i]) {
                transform = multiplyMatrices(transform, globalTransforms[i].matrix || createIdentityMatrix());
            }
            
            // Aplicar transformación OBB si existe
            if (i < obbTransforms.length && obbTransforms[i] && obbTransforms[i].matrix) {
                transform = multiplyMatrices(transform, obbTransforms[i].matrix);
            }
            
            modelInstances.push({
                modelIndex: i,
                transform: transform,
                nodeType: 0,
                instancePath: [i],
                hasTransform: true
            });
        }
    }

    // 6. PROCESAR INSTANCIAS (puede haber múltiples instancias del mismo modelo)
    console.log(`Procesando ${modelInstances.length} instancias de ${baseGeometries.length} modelos base`);
    
    // Contador de instancias por modelo
    const instanceCountPerModel = new Map();
    
    for (let instanceIndex = 0; instanceIndex < modelInstances.length; instanceIndex++) {
        const instance = modelInstances[instanceIndex];
        const modelIndex = instance.modelIndex;
        
        // Contar instancias de este modelo
        const currentCount = instanceCountPerModel.get(modelIndex) || 0;
        instanceCountPerModel.set(modelIndex, currentCount + 1);
        
        // Obtener geometría base
        const baseGeometry = baseGeometries[modelIndex];
        if (!baseGeometry) continue;
        
        const instanceTransform = instance.transform || createIdentityMatrix();
        
        // Aplicar transformaciones adicionales basadas en el índice de instancia
        let finalTransform = instanceTransform;
        
        // Aplicar transformación global específica para esta instancia
        if (instanceIndex < globalTransforms.length && globalTransforms[instanceIndex]) {
            finalTransform = multiplyMatrices(finalTransform, globalTransforms[instanceIndex].matrix || createIdentityMatrix());
        }
        
        // Aplicar transformación OBB específica para esta instancia
        if (instanceIndex < obbTransforms.length && obbTransforms[instanceIndex] && obbTransforms[instanceIndex].matrix) {
            finalTransform = multiplyMatrices(finalTransform, obbTransforms[instanceIndex].matrix);
        }
        
        // Procesar vértices de esta instancia
        const vertexOffset = globalVertexOffset;
        
        // Transformar y agregar vértices
        for (let i = 0; i < baseGeometry.vertices.length; i += 3) {
            const x = baseGeometry.vertices[i];
            const y = baseGeometry.vertices[i + 1];
            const z = baseGeometry.vertices[i + 2];
            
            const transformed = transformPoint(finalTransform, x, y, z);
            vertices.push(transformed.x, transformed.y, transformed.z);
        }
        
        // Transformar y agregar normales
        for (let i = 0; i < baseGeometry.normals.length; i += 3) {
            const nx = baseGeometry.normals[i];
            const ny = baseGeometry.normals[i + 1];
            const nz = baseGeometry.normals[i + 2];
            
            const transformed = transformNormal(finalTransform, nx, ny, nz);
            normals.push(transformed.x, transformed.y, transformed.z);
        }
        
        // Agregar UVs (si existen)
        if (baseGeometry.uv && baseGeometry.uv.length > 0) {
            uv.push(...baseGeometry.uv);
        } else {
            // Agregar UVs por defecto si no existen
            for (let i = 0; i < baseGeometry.vertices.length / 3; i++) {
                uv.push(0, 0);
            }
        }
        
        // Agregar índices con offset
        for (const index of baseGeometry.indices) {
            indices.push(index + vertexOffset);
        }
        
        globalVertexOffset += baseGeometry.vertices.length / 3;
        
        // DEBUG: Información por instancia
        if (instanceCountPerModel.get(modelIndex) > 1) {
            console.log(`Modelo ${modelIndex} instanciado ${instanceCountPerModel.get(modelIndex)} veces`);
        }
    }

    // 7. Funciones auxiliares
    function extractBaseGeometry(pvVar6, pvVar6_b) {
        const geometries = [];
        
        function processModelArray(modelArray) {
            if (!modelArray) return 0;
            
            let modelCount = 0;
            
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
                            
                            const geometry = {
                                vertices: [],
                                normals: [],
                                indices: [],
                                uv: []
                            };
                            
                            // Extraer índices
                            if (mesh[0x18] && faceCount > 0) {
                                const indexBuffer = mesh[0x18];
                                const vertexCountEst = Math.max(vertexCount, 65535);
                                const is16Bit = (indexBuffer.length / faceCount) <= 6;
                                
                                for (let i = 0; i < faceCount; i++) {
                                    if (is16Bit) {
                                        const a = indexBuffer.readUInt16LE(i * 6 + 0);
                                        const b = indexBuffer.readUInt16LE(i * 6 + 2);
                                        const c = indexBuffer.readUInt16LE(i * 6 + 4);
                                        geometry.indices.push(a, b, c);
                                    } else {
                                        const a = indexBuffer.readUInt32LE(i * 12 + 0);
                                        const b = indexBuffer.readUInt32LE(i * 12 + 4);
                                        const c = indexBuffer.readUInt32LE(i * 12 + 8);
                                        geometry.indices.push(a, b, c);
                                    }
                                }
                            }
                            
                            // Extraer vértices, normales y UVs
                            if (mesh[0x1c] && vertexCount > 0) {
                                const vertexBuffer = mesh[0x1c];
                                const stride = Math.floor(vertexBuffer.length / vertexCount);
                                
                                for (let i = 0; i < vertexCount; i++) {
                                    const offset = i * stride;
                                    
                                    // Posición
                                    const x = vertexBuffer.readFloatLE(offset + 0);
                                    const y = vertexBuffer.readFloatLE(offset + 4);
                                    const z = vertexBuffer.readFloatLE(offset + 8);
                                    geometry.vertices.push(x, y, z);
                                    
                                    // Normal
                                    const nx = vertexBuffer.readFloatLE(offset + 12);
                                    const ny = vertexBuffer.readFloatLE(offset + 16);
                                    const nz = vertexBuffer.readFloatLE(offset + 20);
                                    geometry.normals.push(nx, ny, nz);
                                    
                                    // UV (si existe espacio)
                                    if (stride >= 32) {
                                        const u = vertexBuffer.readFloatLE(offset + 24);
                                        const v = vertexBuffer.readFloatLE(offset + 28);
                                        geometry.uv.push(u, v);
                                    } else {
                                        geometry.uv.push(0, 0);
                                    }
                                }
                            }
                            
                            geometries.push(geometry);
                            modelCount++;
                        }
                    }
                }
            }
            
            return modelCount;
        }
        
        console.log("Extrayendo geometría base...");
        const primaryCount = processModelArray(pvVar6);
        const secondaryCount = processModelArray(pvVar6_b);
        
        console.log(`Encontrados ${geometries.length} modelos base (${primaryCount} primarios, ${secondaryCount} secundarios)`);
        return geometries;
    }
    
    // Funciones de transformación (igual que antes pero optimizadas)
    function extractTransformFromBuffer(bufferObj) {
        if (!bufferObj || !bufferObj.data) return null;
        const buffer = Buffer.from(bufferObj.data);
        if (buffer.length < 64) return null;
        const matrix = new Float32Array(16);
        for (let i = 0; i < 16; i++) matrix[i] = buffer.readFloatLE(i * 4);
        return { matrix };
    }
    
    function extractOBBFromBuffer(bufferObj) {
        if (!bufferObj) return null;
        const result = {};
        if (bufferObj.avStack_910?.data) {
            const buffer = Buffer.from(bufferObj.avStack_910.data);
            if (buffer.length >= 64) {
                result.matrix = new Float32Array(16);
                for (let i = 0; i < 16; i++) result.matrix[i] = buffer.readFloatLE(i * 4);
            }
        }
        if (bufferObj.avStack_928?.data) {
            const buffer = Buffer.from(bufferObj.avStack_928.data);
            if (buffer.length >= 12) {
                result.position = [buffer.readFloatLE(0), buffer.readFloatLE(4), buffer.readFloatLE(8)];
            }
        }
        return result;
    }
    
    function extractMatrixFromBuffer(bufferObj) {
        if (!bufferObj?.data) return createIdentityMatrix();
        const buffer = Buffer.from(bufferObj.data);
        if (buffer.length < 64) return createIdentityMatrix();
        const matrix = new Float32Array(16);
        for (let i = 0; i < 16; i++) matrix[i] = buffer.readFloatLE(i * 4);
        return matrix;
    }
    
    function extractVectorFromBuffer(bufferObj) {
        if (!bufferObj?.data) return [0, 0, 0];
        const buffer = Buffer.from(bufferObj.data);
        if (buffer.length < 12) return [0, 0, 0];
        return [buffer.readFloatLE(0), buffer.readFloatLE(4), buffer.readFloatLE(8)];
    }
    
    function extractUInt32FromBuffer(bufferObj) {
        if (!bufferObj?.data) return 0;
        const buffer = Buffer.from(bufferObj.data);
        return buffer.length >= 4 ? buffer.readUInt32LE(0) : 0;
    }
    
    function extractIndicesFromBufferArray(bufferArray) {
        if (!Array.isArray(bufferArray)) return [];
        const indices = [];
        for (const bufferObj of bufferArray) {
            if (bufferObj?.data) {
                const buffer = Buffer.from(bufferObj.data);
                if (buffer.length >= 4) indices.push(buffer.readUInt32LE(0));
            }
        }
        return indices;
    }
    
    function createIdentityMatrix() {
        const m = new Float32Array(16);
        m[0] = m[5] = m[10] = m[15] = 1.0;
        return m;
    }
    
    function createTranslationMatrix(x, y, z) {
        const m = createIdentityMatrix();
        m[12] = x;
        m[13] = y;
        m[14] = z;
        return m;
    }
    
    function multiplyMatrices(a, b) {
        const out = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    out[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return out;
    }
    
    function transformPoint(m, x, y, z) {
        const w = m[3] * x + m[7] * y + m[11] * z + m[15];
        return {
            x: (m[0] * x + m[4] * y + m[8] * z + m[12]) / (w || 1),
            y: (m[1] * x + m[5] * y + m[9] * z + m[13]) / (w || 1),
            z: (m[2] * x + m[6] * y + m[10] * z + m[14]) / (w || 1)
        };
    }
    
    function transformNormal(m, nx, ny, nz) {
        // Para normales, necesitamos la inversa transpuesta
        // Simplificado: asumimos que la matriz no tiene escala no uniforme
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) {
            nx /= len;
            ny /= len;
            nz /= len;
        }
        return {
            x: m[0] * nx + m[4] * ny + m[8] * nz,
            y: m[1] * nx + m[5] * ny + m[9] * nz,
            z: m[2] * nx + m[6] * ny + m[10] * nz
        };
    }

    return {
        vertices,
        normals,
        indices,
        uv,
        stats: {
            totalVertices: vertices.length / 3,
            totalFaces: indices.length / 3,
            baseModels: baseGeometries.length,
            instances: modelInstances.length,
            instanceCounts: Array.from(instanceCountPerModel.entries()),
            repeatedModels: Array.from(instanceCountPerModel.entries()).filter(([_, count]) => count > 1).length
        },
        baseGeometries,
        instances: modelInstances
    };
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
    
    console.log('=== ESTADÍSTICAS ===');
    console.log(`Vértices totales: ${geometry.stats.totalVertices}`);
    console.log(`Caras totales: ${geometry.stats.totalFaces}`);
    console.log(`Modelos base: ${geometry.stats.baseModels}`);
    console.log(`Instancias: ${geometry.stats.instances}`);
    console.log(`Modelos repetidos: ${geometry.stats.repeatedModels}`);
    
    // Mostrar modelos con múltiples instancias
    geometry.stats.instanceCounts.forEach(([modelIndex, count]) => {
        if (count > 1) {
            console.log(`  Modelo ${modelIndex}: ${count} instancias`);
        }
    });
    
    const objText = geometryToOBJ(geometry);
    require('fs').writeFileSync(output_file_name, objText);
    console.log('Archivo OBJ guardado como output_with_instances.obj');
}
processAndExport()