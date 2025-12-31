const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Crear carpeta demo si no existe
const outputDir = './demo';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔍 Analizando archivo binario...');
const fileBuffer = fs.readFileSync('demo.vpk');
console.log(`📊 Tamaño total: ${fileBuffer.length} bytes (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

// ============================================================================
// FUNCIONES DE DETECCIÓN HEURÍSTICA
// ============================================================================

/**
 * Detecta posibles archivos por análisis de entropía y patrones
 */
function heuristicFileDetection(buffer, startOffset = 0) {
    const candidates = [];
    const chunkSize = 512; // Tamaño de ventana para análisis
    const minFileSize = 100; // Tamaño mínimo de archivo
    
    console.log(`🔬 Ejecutando análisis heurístico desde offset ${startOffset}...`);
    
    for (let i = startOffset; i < buffer.length - chunkSize; i += Math.floor(chunkSize / 2)) {
        // 1. Análisis de entropía (los archivos suelen tener alta entropía)
        const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
        const entropy = calculateEntropy(chunk);
        
        // 2. Buscar patrones comunes
        const patterns = detectCommonPatterns(chunk);
        
        // 3. Buscar strings legibles (metadatos)
        const strings = extractReadableStrings(chunk);
        
        // 4. Buscar posibles tamaños de archivo en little/big endian
        const sizeMarkers = findSizeMarkers(buffer, i);
        
        // Si encontramos indicios de archivo
        if ((entropy > 6.5 && patterns.length > 0) || 
            (strings.length > 3 && entropy > 5) ||
            sizeMarkers.length > 0) {
            
            // Intentar determinar el tamaño del archivo
            let estimatedSize = estimateFileSize(buffer, i, sizeMarkers);
            
            if (estimatedSize > minFileSize) {
                candidates.push({
                    start: i,
                    estimatedEnd: Math.min(i + estimatedSize, buffer.length),
                    size: estimatedSize,
                    entropy: entropy,
                    patterns: patterns,
                    strings: strings.slice(0, 5) // Primeros 5 strings
                });
                
                // Saltar al final del archivo estimado
                i += estimatedSize - chunkSize;
            }
        }
    }
    
    return candidates;
}

/**
 * Calcula la entropía de Shannon de un buffer
 * (Los archivos reales suelen tener alta entropía)
 */
function calculateEntropy(buffer) {
    const freq = new Array(256).fill(0);
    const len = buffer.length;
    
    // Contar frecuencias
    for (let i = 0; i < len; i++) {
        freq[buffer[i]]++;
    }
    
    // Calcular entropía
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            const p = freq[i] / len;
            entropy -= p * Math.log2(p);
        }
    }
    
    return entropy;
}

/**
 * Detecta patrones comunes en archivos
 */
function detectCommonPatterns(chunk) {
    const patterns = [];
    const str = chunk.toString('hex');
    
    // Patrones para tipos de archivos comunes
    const patternTests = [
        // Headers conocidos (aunque estén desplazados)
        { name: 'Ogg/Vorbis', regex: /4f676753.*766f72626973/, offset: 0 },
        { name: 'PNG-like', regex: /89504e470d0a1a0a/, offset: 0 },
        { name: 'JPEG-like', regex: /ffd8ffe[0-1]/, offset: 0 },
        { name: 'ZIP-like', regex: /504b0304/, offset: 0 },
        { name: 'PDF-like', regex: /25504446/, offset: 0 },
        
        // Estructuras comunes
        { name: 'Size Marker', regex: /[0-9a-f]{8}000000|[0-9a-f]{4}0000/, offset: 0 },
        { name: 'ASCII Text', regex: /[0-9a-f]{20,}.*[0-9a-f]{20,}/, offset: 0 },
        
        // Tu caso específico: "vtPack"
        { name: 'vtPack Header', regex: /76745061636b/, offset: 0 }
    ];
    
    for (const test of patternTests) {
        if (test.regex.test(str)) {
            patterns.push(test.name);
        }
    }
    
    return patterns;
}

/**
 * Extrae strings legibles del buffer
 */
function extractReadableStrings(chunk, minLength = 4) {
    const strings = [];
    let currentString = '';
    
    for (let i = 0; i < chunk.length; i++) {
        const char = chunk[i];
        // Caracteres ASCII imprimibles (32-126)
        if (char >= 32 && char <= 126) {
            currentString += String.fromCharCode(char);
        } else {
            if (currentString.length >= minLength) {
                strings.push(currentString);
            }
            currentString = '';
        }
    }
    
    // Añadir el último string si existe
    if (currentString.length >= minLength) {
        strings.push(currentString);
    }
    
    return strings;
}

/**
 * Busca posibles marcadores de tamaño en el buffer
 */
function findSizeMarkers(buffer, offset) {
    const markers = [];
    const view = new DataView(buffer.buffer, offset, Math.min(100, buffer.length - offset));
    
    // Buscar números que podrían ser tamaños (4 bytes little/big endian)
    for (let i = 0; i < 96; i += 4) {
        try {
            const leSize = view.getUint32(i, true);
            const beSize = view.getUint32(i, false);
            
            // Los tamaños razonables de archivo
            if (leSize >= 100 && leSize < 100 * 1024 * 1024) { // 100 bytes a 100MB
                markers.push({ offset: offset + i, size: leSize, endian: 'LE' });
            }
            if (beSize >= 100 && beSize < 100 * 1024 * 1024) {
                markers.push({ offset: offset + i, size: beSize, endian: 'BE' });
            }
        } catch (e) {
            // Ignorar errores de lectura
        }
    }
    
    return markers;
}

/**
 * Estima el tamaño de un archivo basado en marcadores y heurísticas
 */
function estimateFileSize(buffer, start, sizeMarkers) {
    // Prioridad 1: Usar marcadores de tamaño encontrados
    for (const marker of sizeMarkers) {
        if (marker.offset >= start && marker.offset < start + 128) {
            return marker.size;
        }
    }
    
    // Prioridad 2: Buscar patrones de finalización
    const searchWindow = Math.min(10 * 1024 * 1024, buffer.length - start); // Buscar hasta 10MB
    
    // Para Ogg: buscar secuencia de finalización
    if (buffer.slice(start, start + 4).toString() === 'OggS') {
        let pos = start;
        let pageCount = 0;
        while (pos < buffer.length && pageCount < 1000) { // Máximo 1000 páginas
            if (buffer.slice(pos, pos + 4).toString() === 'OggS') {
                try {
                    const segmentCount = buffer[pos + 26];
                    let pageSize = 27; // Header size
                    
                    for (let s = 0; s < segmentCount; s++) {
                        pageSize += buffer[pos + 27 + s];
                    }
                    
                    pos += pageSize;
                    pageCount++;
                    
                    // Si encontramos una página con granulo 0xFFFFFFFFFFFFFFFF (EOF)
                    const granuleHi = buffer.readUInt32LE(pos - pageSize + 6);
                    const granuleLo = buffer.readUInt32LE(pos - pageSize + 10);
                    if (granuleHi === 0xFFFFFFFF && granuleLo === 0xFFFFFFFF) {
                        return pos - start;
                    }
                } catch (e) {
                    break;
                }
            } else {
                break;
            }
        }
        return Math.min(pos - start, searchWindow);
    }
    
    // Prioridad 3: Buscar cambios bruscos en entropía o patrones
    const chunkSize = 1024;
    let lastEntropy = calculateEntropy(buffer.slice(start, start + chunkSize));
    let estimatedEnd = start + chunkSize;
    
    for (let i = start + chunkSize; i < start + searchWindow; i += chunkSize) {
        if (i + chunkSize > buffer.length) break;
        
        const currentChunk = buffer.slice(i, i + chunkSize);
        const currentEntropy = calculateEntropy(currentChunk);
        
        // Si hay un cambio brusco en la entropía, podría ser el final
        if (Math.abs(currentEntropy - lastEntropy) > 2.0) {
            // Verificar si es un nuevo header
            const patterns = detectCommonPatterns(currentChunk);
            if (patterns.length > 0 && patterns[0] !== 'ASCII Text') {
                return i - start;
            }
        }
        
        lastEntropy = currentEntropy;
        estimatedEnd = i + chunkSize;
    }
    
    // Por defecto: devolver tamaño razonable
    return Math.min(estimatedEnd - start, 5 * 1024 * 1024); // Máximo 5MB por defecto
}

/**
 * Intenta reparar headers conocidos
 */
function tryFixHeaders(bufferSlice, detectedPatterns) {
    let fixedBuffer = Buffer.from(bufferSlice);
    
    // Si detectamos Ogg pero no empieza con OggS
    if (detectedPatterns.includes('Ogg/Vorbis') && 
        bufferSlice.slice(0, 4).toString() !== 'OggS') {
        
        // Buscar 'OggS' dentro del buffer
        const oggsIndex = bufferSlice.indexOf(Buffer.from([0x4F, 0x67, 0x67, 0x53]));
        if (oggsIndex > 0 && oggsIndex < 1024) {
            console.log(`   🔧 Reparando header Ogg (encontrado en offset +${oggsIndex})`);
            // Cortar desde el header real
            return bufferSlice.slice(oggsIndex);
        }
    }
    
    // Si detectamos vtPack Header (tu caso)
    if (detectedPatterns.includes('vtPack Header')) {
        console.log(`   🔧 Archivo con vtPack Header detectado`);
        // Podríamos intentar reemplazar vtPack por un header válido
        // basado en los patrones internos encontrados
    }
    
    return fixedBuffer;
}

/**
 * Valida si un buffer extraído parece ser un archivo válido
 */
function validateExtractedFile(buffer, candidate) {
    // 1. Tamaño mínimo
    if (buffer.length < 100) return false;
    
    // 2. Entropía suficiente (no todo ceros o datos repetitivos)
    const entropy = calculateEntropy(buffer);
    if (entropy < 1.0) return false;
    
    // 3. Contiene algunos strings legibles o patrones
    const strings = extractReadableStrings(buffer.slice(0, Math.min(1000, buffer.length)));
    const patterns = detectCommonPatterns(buffer.slice(0, Math.min(512, buffer.length)));
    
    return (entropy > 3.0 || strings.length > 2 || patterns.length > 0);
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

console.log('\n🎯 Fase 1: Búsqueda heurística de archivos...');
const candidates = heuristicFileDetection(fileBuffer);

console.log(`\n📈 Candidatos encontrados: ${candidates.length}`);

// Mostrar candidatos
candidates.forEach((candidate, idx) => {
    console.log(`\n📂 Candidato #${idx + 1}:`);
    console.log(`   Inicio: ${candidate.start} (0x${candidate.start.toString(16)})`);
    console.log(`   Tamaño estimado: ${candidate.size} bytes`);
    console.log(`   Entropía: ${candidate.entropy.toFixed(2)}`);
    console.log(`   Patrones: ${candidate.patterns.join(', ')}`);
    if (candidate.strings.length > 0) {
        console.log(`   Strings: ${candidate.strings.join(', ')}`);
    }
});

console.log('\n💾 Fase 2: Extracción de candidatos...');
let extractedCount = 0;

candidates.forEach((candidate, idx) => {
    const start = candidate.start;
    const end = Math.min(candidate.estimatedEnd, fileBuffer.length);
    const size = end - start;
    
    if (size < 100 || size > 100 * 1024 * 1024) { // Filtro de tamaño razonable
        console.log(`   ⏭️  Saltando candidato #${idx + 1}: tamaño ${size} bytes fuera de rango`);
        return;
    }
    
    const bufferSlice = fileBuffer.slice(start, end);
    
    // Validar que parece un archivo real
    if (!validateExtractedFile(bufferSlice, candidate)) {
        console.log(`   ⏭️  Saltando candidato #${idx + 1}: no parece archivo válido`);
        return;
    }
    
    // Intentar reparar headers si es necesario
    let finalBuffer = tryFixHeaders(bufferSlice, candidate.patterns);
    
    // Determinar extensión basada en patrones
    let extension = '.bin';
    if (candidate.patterns.includes('Ogg/Vorbis')) {
        extension = '.ogg';
    } else if (candidate.patterns.includes('PNG-like')) {
        extension = '.png';
    } else if (candidate.patterns.includes('JPEG-like')) {
        extension = '.jpg';
    } else if (candidate.patterns.includes('ZIP-like')) {
        extension = '.zip';
    } else if (candidate.patterns.includes('PDF-like')) {
        extension = '.pdf';
    } else if (candidate.patterns.includes('vtPack Header')) {
        extension = '.vtpack';
    }
    
    // Generar nombre de archivo
    const filename = `file_${idx + 1}_${start}_${size}${extension}`;
    const filepath = path.join(outputDir, filename);
    
    // Guardar archivo
    try {
        fs.writeFileSync(filepath, finalBuffer);
        console.log(`   ✅ Guardado: ${filename} (${(finalBuffer.length / 1024).toFixed(1)} KB)`);
        extractedCount++;
        
        // Guardar metadatos
        const metapath = path.join(outputDir, `${filename}.meta.txt`);
        const metaInfo = `
Archivo extraído #${idx + 1}
Posición original: ${start} - ${end} (${size} bytes)
Entropía: ${candidate.entropy.toFixed(2)}
Patrones detectados: ${candidate.patterns.join(', ')}
Strings encontrados: ${candidate.strings.join(', ')}
Tamaño extraído: ${finalBuffer.length} bytes
Fecha extracción: ${new Date().toISOString()}
        `.trim();
        fs.writeFileSync(metapath, metaInfo);
        
    } catch (error) {
        console.log(`   ❌ Error guardando ${filename}: ${error.message}`);
    }
});

console.log('\n📊 RESUMEN FINAL:');
console.log(`Total de candidatos analizados: ${candidates.length}`);
console.log(`Archivos extraídos exitosamente: ${extractedCount}`);
console.log(`Carpeta de salida: ${path.resolve(outputDir)}`);

// Si no se encontraron archivos, hacer un barrido exhaustivo
if (extractedCount === 0) {
    console.log('\n🔍 Fase 3: Búsqueda exhaustiva por sectores...');
    
    const sectorSize = 512;
    const suspiciousSectors = [];
    
    // Buscar sectores con alta entropía
    for (let i = 0; i < fileBuffer.length - sectorSize; i += sectorSize) {
        const sector = fileBuffer.slice(i, i + sectorSize);
        const entropy = calculateEntropy(sector);
        
        if (entropy > 6.0) { // Alta entropía
            suspiciousSectors.push({
                offset: i,
                entropy: entropy
            });
        }
    }
    
    console.log(`Sectores sospechosos encontrados: ${suspiciousSectors.length}`);
    
    // Agrupar sectores contiguos
    if (suspiciousSectors.length > 0) {
        let currentStart = suspiciousSectors[0].offset;
        let currentEnd = currentStart + sectorSize;
        const clusters = [];
        
        for (let i = 1; i < suspiciousSectors.length; i++) {
            if (suspiciousSectors[i].offset === suspiciousSectors[i-1].offset + sectorSize) {
                currentEnd = suspiciousSectors[i].offset + sectorSize;
            } else {
                clusters.push({
                    start: currentStart,
                    end: currentEnd,
                    size: currentEnd - currentStart
                });
                currentStart = suspiciousSectors[i].offset;
                currentEnd = currentStart + sectorSize;
            }
        }
        clusters.push({ start: currentStart, end: currentEnd, size: currentEnd - currentStart });
        
        // Extraer clusters grandes
        clusters.forEach((cluster, idx) => {
            if (cluster.size > 1024) { // Mínimo 1KB
                const clusterBuffer = fileBuffer.slice(cluster.start, cluster.end);
                const filename = `cluster_${idx + 1}_${cluster.start}_${cluster.size}.bin`;
                const filepath = path.join(outputDir, filename);
                
                fs.writeFileSync(filepath, clusterBuffer);
                console.log(`   📦 Cluster extraído: ${filename} (${(cluster.size / 1024).toFixed(1)} KB)`);
            }
        });
    }
}

console.log('\n🎉 Análisis completado. Revisa la carpeta "demo" para los archivos extraídos.');