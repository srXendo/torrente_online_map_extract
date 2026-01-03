const fs = require('fs');
const path = require('path');

// Ruta al archivo log (cámbiala si es necesario)
const logPath = 'log.log';
const outputDir = 'obj_output';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const rawContent = fs.readFileSync(logPath, 'utf8');

// El archivo es una lista JSON grande
let data;
try {
    data = JSON.parse(rawContent);
} catch (e) {
    console.error('Error parseando JSON:', e.message);
    process.exit(1);
}

let meshCount = 0;

function traverse(obj, currentPath = [], objectName = 'unknown') {
    if (Array.isArray(obj)) {
        obj.forEach((item, i) => traverse(item, [...currentPath, i], objectName));
    } else if (obj && typeof obj === 'object') {
        // Detectar nombre de objeto/mesh
        let newObjectName = objectName;
        if (obj['0'] && obj['0'].type === 'Buffer' && obj['0'].data) {
            try {
                const nameBytes = Buffer.from(obj['0'].data);
                const name = nameBytes.toString('ascii').replace(/\0/g, '').trim();
                if (name.length > 0) newObjectName = name;
            } catch (_) {}
        }

        // Buscar buffers
        for (const key in obj) {
            const value = obj[key];
            if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
                const bytes = value.data;
                const len = bytes.length;

                if (len % 12 === 0 && len >= 12) {
                    // Buffer de vértices (float32 little-endian)
                    const vertexCount = len / 12;
                    const vertices = [];
                    const buffer = Buffer.from(bytes);

                    for (let i = 0; i < vertexCount; i++) {
                        const offset = i * 12;
                        const x = buffer.readFloatLE(offset);
                        const y = buffer.readFloatLE(offset + 4);
                        const z = buffer.readFloatLE(offset + 8);
                        vertices.push({ x, y, z });
                    }

                    // Guardar temporalmente para combinar con índices más tarde
                    if (!globalMeshes[meshCount]) globalMeshes[meshCount] = { name: newObjectName };
                    globalMeshes[meshCount].vertices = vertices;

                } else if ((len % 2 === 0 || len % 4 === 0) && len >= 6) {
                    // Buffer de índices (probablemente uint16, fallback uint32)
                    let indices = [];
                    const buffer = Buffer.from(bytes);

                    if (len % 2 === 0) {
                        // Intentar como uint16
                        const indexCount = len / 2;
                        let valid = true;
                        for (let i = 0; i < indexCount; i++) {
                            const idx = buffer.readUInt16LE(i * 2);
                            if (idx >= 65535) { valid = false; break; } // valor demasiado alto para u16
                            indices.push(idx);
                        }
                        if (!valid) indices = []; // fallback
                    }

                    if (indices.length === 0 && len % 4 === 0) {
                        // uint32
                        const indexCount = len / 4;
                        for (let i = 0; i < indexCount; i++) {
                            indices.push(buffer.readUInt32LE(i * 4));
                        }
                    }

                    if (indices.length >= 3) {
                        if (!globalMeshes[meshCount]) globalMeshes[meshCount] = { name: newObjectName };
                        globalMeshes[meshCount].indices = indices;

                        // Si ya tenemos vértices, generar OBJ ahora
                        if (globalMeshes[meshCount].vertices) {
                            generateOBJ(globalMeshes[meshCount], meshCount);
                            meshCount++;
                        }
                    }
                }
            } else {
                traverse(value, [...currentPath, key], newObjectName);
            }
        }
    }
}

const globalMeshes = {};

function generateOBJ(mesh, id) {
    const { vertices, indices, name } = mesh;
    const filename = path.join(outputDir, `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${id}.obj`);

    let objContent = `# Mesh extraído: ${name}\n`;
    objContent += `# Vértices: ${vertices.length}\n`;
    objContent += `# Caras: ${indices.length / 3}\n\n`;

    // Vértices (OBJ empieza en índice 1)
    for (const v of vertices) {
        objContent += `v ${v.x.toFixed(6)} ${v.y.toFixed(6)} ${v.z.toFixed(6)}\n`;
    }

    objContent += '\n';

    // Caras (asumiendo triángulos)
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] + 1;
        const b = indices[i + 1] + 1;
        const c = indices[i + 2] + 1;
        objContent += `v ${a} ${b} ${c}\n`;
    }

    fs.writeFileSync(filename, objContent);
    console.log(`Generado: ${filename} (${vertices.length} vértices, ${indices.length / 3} caras)`);
}

// Iniciar recorrido
traverse(data);

console.log(`\n¡Listo! Se generaron ${meshCount} archivos .obj en la carpeta "${outputDir}"`);