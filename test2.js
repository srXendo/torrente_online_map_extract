// extractor_mejorado.js
const fs = require('fs');

class Matrix3x4 {
    constructor(data) {
        if (data && data.length === 12) {
            this.m = new Float32Array(data);
        } else {
            this.m = new Float32Array(12);
            this.m[0] = this.m[5] = this.m[10] = 1.0; // Identidad
        }
    }

    transformPoint(x, y, z) {
        const m = this.m;
        return [
            x * m[0] + y * m[1] + z * m[2] + m[3],
            x * m[4] + y * m[5] + z * m[6] + m[7],
            x * m[8] + y * m[9] + z * m[10] + m[11]
        ];
    }

    static fromBuffer(buffer) {
        if (buffer.length >= 48) { // 12 floats * 4 bytes = 48 bytes
            const floats = [];
            for (let i = 0; i < 48; i += 4) {
                floats.push(bytesToFloat(buffer.slice(i, i + 4)));
            }
            return new Matrix3x4(floats);
        }
        return new Matrix3x4();
    }
}

function bytesToFloat(bytes) {
    if (bytes.length < 4) return 0;
    const buffer = Buffer.from(bytes.slice(0, 4));
    return buffer.readFloatLE(0);
}

function bytesToInt(bytes) {
    if (bytes.length < 4) return 0;
    const buffer = Buffer.from(bytes.slice(0, 4));
    return buffer.readInt32LE(0);
}

function extractMeshData(data) {
    const meshes = [];
    
    // Buscar estructura principal basada en la función decompilada
    if (data.pvVar6) {
        console.log("Estructura pvVar6 encontrada");
        
        data.pvVar6.forEach((meshGroup, groupIndex) => {
            if (meshGroup.this0x90 && meshGroup.this0x20 && meshGroup.iVar9_b) {
                console.log(`\nProcesando grupo de mallas ${groupIndex + 1}`);
                
                // Extraer matrices de transformación
                const matrix1 = Matrix3x4.fromBuffer(meshGroup.this0x90.data);
                const matrix2 = Matrix3x4.fromBuffer(meshGroup.this0x20.data);
                
                console.log("Matriz 1:", Array.from(matrix1.m));
                console.log("Matriz 2:", Array.from(matrix2.m));
                
                // Procesar submallas (iVar9_b)
                meshGroup.iVar9_b.forEach((subMesh, subIndex) => {
                    if (Array.isArray(subMesh) && subMesh[0] && subMesh[0].data) {
                        // El primer buffer contiene índices/contador
                        const count = bytesToInt(subMesh[0].data);
                        console.log(`Submalla ${subIndex + 1}: ${count} elementos`);
                        
                        // Buscar buffers de vértices (normalmente en offset 28 o similar)
                        const vertices = [];
                        const faces = [];
                        
                        // Buscar buffers con datos de geometría
                        subMesh.forEach((item, idx) => {
                            if (item && item.type === 'Buffer' && item.data) {
                                // Buffer en offset 28 parece contener datos de vértices
                                if (idx === 28 || item.data.length % 12 === 0) {
                                    extractVertices(item.data, vertices);
                                }
                                // Buffers con tamaños pequeños pueden ser índices
                                else if (item.data.length > 0 && item.data.length < 1000) {
                                    extractFaces(item.data, faces);
                                }
                            }
                        });
                        
                        if (vertices.length > 0) {
                            console.log(`  Vértices: ${vertices.length}`);
                            console.log(`  Caras: ${faces.length}`);
                            
                            // Aplicar transformaciones
                            const transformedVertices = vertices.map(v => {
                                const p1 = matrix1.transformPoint(v[0], v[1], v[2]);
                                return matrix2.transformPoint(p1[0], p1[1], p1[2]);
                            });
                            
                            meshes.push({
                                group: groupIndex,
                                index: subIndex,
                                vertices: transformedVertices,
                                faces: faces,
                                rawVertices: vertices // Mantener originales también
                            });
                        }
                    }
                });
            }
        });
    }
    
    return meshes;
}

function extractVertices(bufferData, verticesArray) {
    if (bufferData.length % 12 === 0) {
        for (let i = 0; i < bufferData.length; i += 12) {
            const x = bytesToFloat(bufferData.slice(i, i + 4));
            const y = bytesToFloat(bufferData.slice(i + 4, i + 8));
            const z = bytesToFloat(bufferData.slice(i + 8, i + 12));
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                verticesArray.push([x, y, z]);
            }
        }
    }
}

function extractFaces(bufferData, facesArray) {
    // Probablemente índices de 2 bytes
    if (bufferData.length % 2 === 0) {
        const indices = [];
        
        for (let i = 0; i < bufferData.length; i += 2) {
            const index = (bufferData[i + 1] << 8) | bufferData[i];
            indices.push(index);
        }
        
        // Crear triángulos (strip o fan)
        for (let i = 0; i < indices.length - 2; i++) {
            // Asumir strip de triángulos
            if (i % 2 === 0) {
                facesArray.push([indices[i], indices[i + 1], indices[i + 2]]);
            } else {
                facesArray.push([indices[i + 1], indices[i], indices[i + 2]]);
            }
        }
    }
    
    // También podría ser índices de 4 bytes
    if (bufferData.length % 4 === 0) {
        const indices = [];
        
        for (let i = 0; i < bufferData.length; i += 4) {
            const index = bytesToInt(bufferData.slice(i, i + 4));
            indices.push(index);
        }
        
        // Crear triángulos
        for (let i = 0; i < indices.length - 2; i += 3) {
            facesArray.push([indices[i], indices[i + 1], indices[i + 2]]);
        }
    }
}

function extractAllDataFromJSON(data) {
    console.log("Extrayendo todos los datos...");
    
    // 1. Buscar estructuras principales
    const meshes = extractMeshData(data);
    
    // 2. Buscar materiales (iVar9)
    const materials = [];
    if (data.iVar9 && Array.isArray(data.iVar9)) {
        data.iVar9.forEach((material, idx) => {
            if (material[0] && material[0].type === 'Buffer') {
                const name = Buffer.from(material[0].data).toString('utf8').replace(/\0/g, '');
                materials.push({
                    id: idx,
                    name: name,
                    data: material
                });
            }
        });
    }
    
    // 3. Buscar matrices de transformación globales
    const globalMatrices = [];
    if (data.this0x90 && data.this0x20) {
        globalMatrices.push({
            matrix1: Matrix3x4.fromBuffer(data.this0x90.data),
            matrix2: Matrix3x4.fromBuffer(data.this0x20.data)
        });
    }
    
    return { meshes, materials, globalMatrices };
}

function saveAsOBJ(meshes, filename) {
    let objContent = '# OBJ file extracted from game data\n';
    let vertexOffset = 0;
    
    meshes.forEach((mesh, meshIndex) => {
        objContent += `\n# Mesh ${meshIndex + 1}\n`;
        
        // Escribir vértices
        mesh.vertices.forEach(v => {
            objContent += `v ${v[0].toFixed(6)} ${v[1].toFixed(6)} ${v[2].toFixed(6)}\n`;
        });
        
        // Escribir caras
        mesh.faces.forEach(f => {
            const v1 = f[0] + vertexOffset + 1;
            const v2 = f[1] + vertexOffset + 1;
            const v3 = f[2] + vertexOffset + 1;
            objContent += `f ${v1} ${v2} ${v3}\n`;
        });
        
        vertexOffset += mesh.vertices.length;
    });
    
    fs.writeFileSync(filename, objContent);
    console.log(`\nOBJ guardado en: ${filename}`);
    console.log(`Total vértices: ${vertexOffset}`);
}

function saveSeparateOBJs(meshes) {
    meshes.forEach((mesh, index) => {
        let objContent = `# Mesh ${index + 1} (Group ${mesh.group}, Index ${mesh.index})\n`;
        
        // Vértices
        mesh.vertices.forEach(v => {
            objContent += `v ${v[0].toFixed(6)} ${v[1].toFixed(6)} ${v[2].toFixed(6)}\n`;
        });
        
        // Caras
        mesh.faces.forEach(f => {
            objContent += `f ${f[0] + 1} ${f[1] + 1} ${f[2] + 1}\n`;
        });
        
        const filename = `mesh_${mesh.group}_${mesh.index}.obj`;
        fs.writeFileSync(filename, objContent);
        console.log(`Guardado: ${filename} (${mesh.vertices.length} vértices, ${mesh.faces.length} caras)`);
    });
}

function analyzeStructure(data, depth = 0, path = '') {
    const indent = '  '.repeat(depth);
    
    if (Array.isArray(data)) {
        console.log(`${indent}Array[${data.length}]`);
        if (depth < 3) {
            data.forEach((item, idx) => {
                analyzeStructure(item, depth + 1, `${path}[${idx}]`);
            });
        }
    } else if (data && typeof data === 'object') {
        if (data.type === 'Buffer') {
            console.log(`${indent}Buffer[${data.data.length}] ${path}`);
            
            // Mostrar información del buffer
            if (data.data.length > 0) {
                console.log(`${indent}  Primeros bytes: ${data.data.slice(0, 16).join(', ')}`);
                
                // Intentar interpretar como floats
                if (data.data.length >= 4) {
                    const firstFloat = bytesToFloat(data.data.slice(0, 4));
                    console.log(`${indent}  Primer float: ${firstFloat}`);
                }
            }
        } else {
            console.log(`${indent}Object ${path}`);
            if (depth < 3) {
                Object.keys(data).forEach(key => {
                    analyzeStructure(data[key], depth + 1, `${path}.${key}`);
                });
            }
        }
    }
}

// Función principal
function processGameFile(filename) {
    try {
        console.log(`Procesando archivo: ${filename}`);
        
        const content = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(content);
        
        console.log("\n=== ANÁLISIS DE ESTRUCTURA ===");
        analyzeStructure(jsonData);
        
        console.log("\n=== EXTRACCIÓN DE DATOS ===");
        const { meshes, materials, globalMatrices } = extractAllDataFromJSON(jsonData);
        
        console.log(`\n=== RESULTADOS ===`);
        console.log(`Mallas encontradas: ${meshes.length}`);
        console.log(`Materiales encontrados: ${materials.length}`);
        console.log(`Matrices globales: ${globalMatrices.length}`);
        
        materials.forEach(mat => {
            console.log(`  Material: ${mat.name}`);
        });
        
        // Guardar resultados
        if (meshes.length > 0) {
            // Guardar todo en un archivo
            saveAsOBJ(meshes, 'all_meshes.obj');
            
            // Guardar cada malla por separado
            saveSeparateOBJs(meshes);
            
            // Guardar datos de análisis
            fs.writeFileSync('extraction_report.json', JSON.stringify({
                meshCount: meshes.length,
                materialCount: materials.length,
                totalVertices: meshes.reduce((sum, m) => sum + m.vertices.length, 0),
                totalFaces: meshes.reduce((sum, m) => sum + m.faces.length, 0),
                meshes: meshes.map(m => ({
                    group: m.group,
                    index: m.index,
                    vertices: m.vertices.length,
                    faces: m.faces.length
                })),
                materials: materials.map(m => m.name)
            }, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
}

// Exportar funciones para uso como módulo
if (require.main === module) {
    const filename = process.argv[2] || 'log.log';
    processGameFile(filename);
}

module.exports = {
    Matrix3x4,
    extractMeshData,
    extractAllDataFromJSON,
    processGameFile,
    bytesToFloat,
    bytesToInt
};