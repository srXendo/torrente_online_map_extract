const fs = require('fs');

class HierarchicalHexExtractor {
    constructor(buffer) {
        this.buffer = buffer;
        this.ascii = buffer.toString('ascii');
        this.materials = {};
    }

    parse() {
        console.log('Iniciando extracción jerárquica...');
        
        // Paso 1: Encontrar todas las posiciones de materiales principales
        const materialPattern = 'Material #';
        const materialPositions = [];
        let pos = this.ascii.indexOf(materialPattern);
        
        while (pos !== -1) {
            materialPositions.push(pos);
            pos = this.ascii.indexOf(materialPattern, pos + 1);
        }

        console.log(`Encontrados ${materialPositions.length} materiales principales`);

        // Paso 2: Para cada material, extraer su bloque y sus submateriales
        for (let i = 0; i < materialPositions.length; i++) {
            const start = materialPositions[i];
            const end = (i < materialPositions.length - 1) ? materialPositions[i + 1] : this.buffer.length;
            
            // Extraer nombre del material
            let materialName = '';
            for (let j = start; j < Math.min(start + 100, end); j++) {
                if (this.buffer[j] === 0) break;
                materialName += String.fromCharCode(this.buffer[j]);
            }

            if (materialName) {
                console.log(`Procesando: ${materialName}`);
                
                // Extraer el bloque completo del material en hex
                const materialBlock = this.buffer.slice(start, end);
                const materialHex = materialBlock.toString('hex').toUpperCase();
                
                // Buscar submateriales dentro del bloque (patrones .tex)
                const subMaterials = this.extractSubMaterials(materialBlock, start);
                
                // Guardar en la estructura
                this.materials[materialName] = {
                    hex: materialHex,
                    submaterials: subMaterials
                };
            }
        }

        return this.materials;
    }

    extractSubMaterials(materialBlock, materialStartOffset) {
        const submaterials = [];
        const blockAscii = materialBlock.toString('ascii');
        
        // Buscar archivos .tex en el bloque
        let pos = blockAscii.indexOf('.tex');
        
        while (pos !== -1) {
            // Encontrar el inicio del nombre del archivo (retroceder hasta encontrar un null o el inicio)
            let start = pos;
            while (start > 0 && blockAscii[start - 1] !== '\x00' && (pos - start) < 100) {
                start--;
            }
            
            // El nombre del submaterial es desde start hasta pos + 4 (".tex" tiene 4 caracteres)
            const subName = blockAscii.substring(start, pos + 4);
            
            // Buscar el siguiente submaterial para determinar el final
            const nextPos = blockAscii.indexOf('.tex', pos + 4);
            
            // Calcular el inicio y fin en el buffer original
            const subStart = materialStartOffset + start;
            const subEnd = (nextPos !== -1) ? materialStartOffset + nextPos : materialStartOffset + materialBlock.length;
            
            // Extraer el bloque del submaterial
            const subBlock = this.buffer.slice(subStart, subEnd);
            const subHex = subBlock.toString('hex').toUpperCase();
            
            submaterials.push({
                name: subName,
                hex: subHex
            });
            
            // Mover a la siguiente posición
            pos = nextPos;
        }

        return submaterials;
    }

    saveToFile(filename = 'hierarchical_materials.json') {
        const output = {
            totalMaterials: Object.keys(this.materials).length,
            materials: this.materials
        };
        
        fs.writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`Guardado en: ${filename}`);
    }
}

// Uso principal
if (require.main === module) {
    if (process.argv.length > 2) {
        const buffer = fs.readFileSync(process.argv[2]);
        const extractor = new HierarchicalHexExtractor(buffer);
        extractor.parse();
        extractor.saveToFile();
    } else {
        console.log('Uso: node script.js <archivo.bin>');
    }
}