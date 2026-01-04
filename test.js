// extractor.js
const fs = require('fs');

function extractVerticesAndFacesFromJSON(data) {
    let allVertices = [];
    let allFaces = [];

    // Función recursiva para buscar en el objeto
    function traverse(obj, path = []) {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                traverse(item, [...path, index]);
            });
        } else if (obj && typeof obj === 'object') {
            // Buscar buffers que puedan contener datos de geometría
            if (obj.type === 'Buffer' && obj.data) {
                const bufferPath = path.join('.');
                
                // Los vértices suelen estar en buffers específicos
                // Basado en el patrón observado en el log
                if (bufferPath.includes('28') || bufferPath.includes('this0x90') || bufferPath.includes('pvVar6')) {
                    console.log(`Buffer encontrado en: ${bufferPath}, tamaño: ${obj.data.length}`);
                    
                    // Intentar interpretar como floats (3 floats por vértice = 12 bytes)
                    if (obj.data.length % 12 === 0) {
                        const vertices = [];
                        for (let i = 0; i < obj.data.length; i += 12) {
                            // Leer 3 floats (cada uno 4 bytes)
                            const x = bytesToFloat(obj.data.slice(i, i+4));
                            const y = bytesToFloat(obj.data.slice(i+4, i+8));
                            const z = bytesToFloat(obj.data.slice(i+8, i+12));
                            
                            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                                vertices.push([x, y, z]);
                            }
                        }
                        
                        if (vertices.length > 0) {
                            console.log(`Encontrados ${vertices.length} vértices en ${bufferPath}`);
                            allVertices.push(...vertices);
                        }
                    }
                    
                    // Intentar interpretar como índices de caras (enteros de 2 bytes o 4 bytes)
                    if (obj.data.length % 2 === 0) {
                        const indices = [];
                        for (let i = 0; i < obj.data.length; i += 2) {
                            const index = (obj.data[i+1] << 8) | obj.data[i];
                            indices.push(index);
                        }
                        
                        if (indices.length > 0 && indices.some(idx => idx < 10000)) {
                            console.log(`Encontrados ${indices.length} índices en ${bufferPath}`);
                            
                            // Crear caras (triángulos) a partir de los índices
                            for (let i = 0; i < indices.length - 2; i += 3) {
                                allFaces.push([
                                    indices[i],
                                    indices[i+1],
                                    indices[i+2]
                                ]);
                            }
                        }
                    }
                }
            }
            
            // Buscar en propiedades del objeto
            for (const key in obj) {
                traverse(obj[key], [...path, key]);
            }
        }
    }

    traverse(data);
    
    return { vertices: allVertices, faces: allFaces };
}

function bytesToFloat(bytes) {
    if (bytes.length < 4) return NaN;
    
    // Asumir little-endian (común en datos 3D)
    const buffer = Buffer.from(bytes.slice(0, 4));
    return buffer.readFloatLE(0);
}

function saveAsOBJ(vertices, faces, filename) {
    let objContent = '# OBJ file extracted from JSON\n';
    
    // Escribir vértices
    vertices.forEach(v => {
        objContent += `v ${v[0]} ${v[1]} ${v[2]}\n`;
    });
    
    // Escribir caras (sumar 1 porque OBJ indexa desde 1)
    faces.forEach(f => {
        if (f[0] < vertices.length && f[1] < vertices.length && f[2] < vertices.length) {
            //objContent += `f ${f[0] + 1} ${f[1] + 1} ${f[2] + 1}\n`;
        }
    });
    
    fs.writeFileSync(filename, objContent);
    console.log(`OBJ guardado en: ${filename}`);
}

// Función principal para procesar el archivo
function processLogFile(filename) {
    try {
        // Leer y parsear el JSON
        const content = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(content);
        
        console.log('Procesando archivo JSON...');
        
        // Extraer vértices y caras
        const { vertices, faces } = extractVerticesAndFacesFromJSON(jsonData);
        
        console.log(`Total vértices extraídos: ${vertices.length}`);
        console.log(`Total caras extraídas: ${faces.length}`);
        
        // Guardar como OBJ
        if (vertices.length > 0 && faces.length > 0) {
            saveAsOBJ(vertices, faces, 'extracted_mesh.obj');
        } else {
            console.log('No se encontraron suficientes datos de malla.');
        }
        
        // También guardar datos en JSON para inspección
        fs.writeFileSync('extracted_data.json', JSON.stringify({
            vertexCount: vertices.length,
            faceCount: faces.length,
            sampleVertices: vertices.slice(0, 10),
            sampleFaces: faces.slice(0, 10)
        }, null, 2));
        
    } catch (error) {
        console.error('Error procesando el archivo:', error.message);
    }
}

// Versión alternativa específica para el patrón visto en el log
function extractFromStructuredJSON(data) {
    const vertices = [];
    const faces = [];
    
    // Buscar en la estructura específica del log
    function extractFromNode(node) {
        if (!node) return;
        
        // Buscar buffers con datos de geometría
        if (node.type === 'Buffer' && node.data) {
            // Intentar interpretar como vértices (floats)
            if (node.data.length % 12 === 0) {
                for (let i = 0; i < node.data.length; i += 12) {
                    const x = bytesToFloat(node.data.slice(i, i+4));
                    const y = bytesToFloat(node.data.slice(i+4, i+8));
                    const z = bytesToFloat(node.data.slice(i+8, i+12));
                    
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        vertices.push([x, y, z]);
                    }
                }
            }
            
            // Intentar interpretar como índices (normalmente en buffers más pequeños)
            if (node.data.length % 2 === 0 && node.data.length < 1000) {
                const indices = [];
                for (let i = 0; i < node.data.length; i += 2) {
                    const index = (node.data[i+1] << 8) | obj.data[i];
                    indices.push(index);
                }
                
                // Crear triángulos
                for (let i = 0; i < indices.length - 2; i++) {
                    faces.push([indices[i], indices[i+1], indices[i+2]]);
                }
            }
        }
        
        // Buscar recursivamente
        if (typeof node === 'object') {
            for (const key in node) {
                if (node.hasOwnProperty(key)) {
                    extractFromNode(node[key]);
                }
            }
        } else if (Array.isArray(node)) {
            node.forEach(item => extractFromNode(item));
        }
    }
    
    extractFromNode(data);
    return { vertices, faces };
}

// Uso principal
if (require.main === module) {
    const filename = process.argv[2] || 'log.log';
    processLogFile(filename);
}

module.exports = {
    extractVerticesAndFacesFromJSON,
    extractFromStructuredJSON,
    processLogFile,
    saveAsOBJ
};
