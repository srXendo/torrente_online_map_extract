// vtff_analyzer.js - Herramienta para analizar la estructura VTFF
const fs = require('fs');

class VTFFAnalyzer {
    constructor() {
        this.sections = [];
        this.vertexClusters = [];
        this.faceClusters = [];
    }

    analyzeFile(inputPath) {
        console.log(`Analizando: ${inputPath}`);
        const buffer = fs.readFileSync(inputPath);
        
        // Análisis básico del header
        this.analyzeHeader(buffer);
        
        // Buscar secciones
        this.findSections(buffer);
        
        // Buscar datos de vértices
        this.findVertexData(buffer);
        
        // Buscar datos de caras
        this.findFaceData(buffer);
        
        // Generar reporte
        this.generateReport(inputPath);
    }

    analyzeHeader(buffer) {
        console.log('\n=== ANÁLISIS DEL HEADER ===');
        console.log(`Magic: ${buffer.toString('ascii', 0, 4)}`);
        console.log(`Tamaño: ${buffer.readUInt32LE(4)} bytes`);
        console.log(`Tamaño real: ${buffer.length} bytes`);
        
        // Buscar el patrón que mencionaste (0x26 = 38 vértices)
        for (let i = 0; i < Math.min(1000, buffer.length); i++) {
            if (buffer[i] === 0x26 && buffer[i+1] === 0x00 && buffer[i+2] === 0x00 && buffer[i+3] === 0x00) {
                console.log(`\nPosible conteo de vértices encontrado en offset 0x${i.toString(16)}: ${buffer.readUInt32LE(i)}`);
                
                // Verificar si hay un patrón repetido
                if (buffer[i+8] === 0x26) {
                    console.log(`Patrón confirmado - 38 vértices (0x26)`);
                }
            }
        }
    }

    findSections(buffer) {
        console.log('\n=== SECCIONES ENCONTRADAS ===');
        
        const sectionHeaders = [
            { magic: 'OBJ1', name: 'Objeto' },
            { magic: 'MSH1', name: 'Malla' },
            { magic: 'LOD1', name: 'Nivel de Detalle' },
            { magic: 'MTR1', name: 'Material' },
            { magic: 'TRA1', name: 'Transformación' },
            { magic: 'INFO', name: 'Información' }
        ];
        
        for (let i = 0; i < buffer.length - 8; i++) {
            const magic = buffer.toString('ascii', i, i + 4);
            const section = sectionHeaders.find(s => s.magic === magic);
            
            if (section) {
                const size = buffer.readUInt32LE(i + 4);
                console.log(`[0x${i.toString(16).padStart(4, '0')}] ${section.magic} - ${section.name} (${size} bytes)`);
                i += 7; // Saltar para evitar duplicados
            }
        }
    }

    findVertexData(buffer) {
        console.log('\n=== BUSCANDO DATOS DE VÉRTICES ===');
        
        // Buscar secuencias de floats que podrían ser vértices
        // Los vértices suelen estar en un rango razonable (-1000 a 1000)
        for (let i = 0; i < buffer.length - 12; i++) {
            const x = buffer.readFloatLE(i);
            const y = buffer.readFloatLE(i + 4);
            const z = buffer.readFloatLE(i + 8);
            
            // Si los valores son floats razonables para coordenadas 3D
            if (!isNaN(x) && !isNaN(y) && !isNaN(z) &&
                Math.abs(x) < 1000 && Math.abs(y) < 1000 && Math.abs(z) < 1000) {
                
                // Verificar si hay varios vértices consecutivos
                let vertexCount = 1;
                let offset = i + 12;
                
                while (offset + 12 <= buffer.length && vertexCount < 100) {
                    const nextX = buffer.readFloatLE(offset);
                    const nextY = buffer.readFloatLE(offset + 4);
                    const nextZ = buffer.readFloatLE(offset + 8);
                    
                    if (isNaN(nextX) || isNaN(nextY) || isNaN(nextZ) ||
                        Math.abs(nextX) > 10000 || Math.abs(nextY) > 10000 || Math.abs(nextZ) > 10000) {
                        break;
                    }
                    
                    vertexCount++;
                    offset += 12;
                }
                
                if (vertexCount >= 10) { // Encontró un grupo significativo de vértices
                    console.log(`Grupo de vértices en 0x${i.toString(16)}: ${vertexCount} vértices`);
                    this.vertexClusters.push({ offset: i, count: vertexCount });
                    i = offset - 1; // Continuar después de este grupo
                }
            }
        }
    }

    findFaceData(buffer) {
        console.log('\n=== BUSCANDO DATOS DE CARAS ===');
        
        // Buscar triángulos (3 enteros consecutivos)
        for (let i = 0; i < buffer.length - 12; i++) {
            const v1 = buffer.readUInt32LE(i);
            const v2 = buffer.readUInt32LE(i + 4);
            const v3 = buffer.readUInt32LE(i + 8);
            
            // Buscar secuencias que parezcan índices de vértices
            // Asumiendo menos de 65536 vértices
            if (v1 < 65536 && v2 < 65536 && v3 < 65536) {
                let faceCount = 1;
                let offset = i + 12;
                
                // Verificar si hay más caras consecutivas
                while (offset + 12 <= buffer.length && faceCount < 1000) {
                    const nextV1 = buffer.readUInt32LE(offset);
                    const nextV2 = buffer.readUInt32LE(offset + 4);
                    const nextV3 = buffer.readUInt32LE(offset + 8);
                    
                    if (nextV1 >= 65536 || nextV2 >= 65536 || nextV3 >= 65536) {
                        break;
                    }
                    
                    faceCount++;
                    offset += 12;
                }
                
                if (faceCount >= 3) { // Encontró un grupo significativo de caras
                    console.log(`Grupo de caras en 0x${i.toString(16)}: ${faceCount} caras`);
                    this.faceClusters.push({ offset: i, count: faceCount });
                    i = offset - 1;
                }
            }
        }
    }

    generateReport(inputPath) {
        const report = `
=== REPORTE DE ANÁLISIS VTFF ===
Archivo: ${inputPath}
Fecha: ${new Date().toISOString()}

SECCIONES IDENTIFICADAS:
${this.sections.map(s => `  ${s.magic} @ 0x${s.offset.toString(16)} (${s.size} bytes)`).join('\n')}

GRUPOS DE VÉRTICES:
${this.vertexClusters.map(v => `  Offset: 0x${v.offset.toString(16)}, Vértices: ${v.count}`).join('\n')}

GRUPOS DE CARAS:
${this.faceClusters.map(f => `  Offset: 0x${f.offset.toString(16)}, Caras: ${f.count}`).join('\n')}

RECOMENDACIONES:
1. Usar el primer grupo de vértices encontrado
2. Usar el grupo de caras más cercano a los vértices
3. Verificar que el número de caras sea múltiplo de 3
        `;
        

        fs.writeFileSync("reportFile.txt", report);
        console.log(`\nReporte guardado en: reportFile.txt`);
    }
}

// Uso del analizador
if (require.main === module) {
    const analyzer = new VTFFAnalyzer();
    analyzer.analyzeFile(process.argv[2] || 'fichero.bin');
}

module.exports = VTFFAnalyzer;