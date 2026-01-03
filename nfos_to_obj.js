const fs = require('fs')
const input_file_name = 'mp_b_anderguater.opt'
const output_file_name = 'test.opt.obj'

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
console.log(header.toString('ascii'))
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
console.log(JSON.stringify(pvVar6))


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

/*const this0x14       = reader.get_chunk(4); // count of something (maybe materials?)
const opt_file_byte_12 = reader.get_chunk(4);
const length_elements  = reader.get_chunk(4); // count of "base" elements
const local_980        = reader.get_chunk(4); // count of "named" elements (textures?)
const this0x7c         = reader.get_chunk(4); // count of transform nodes?
const opt_file_byte_28 = reader.get_chunk(4); // ← number of hulls (local_988)
const this0x88         = reader.get_chunk(4);
const opt_file_byte_36 = reader.get_chunk(4);
const arr = []
for (let i = 0; i < length_elements.readUInt32LE(); i++) {
    const index = reader.get_chunk().readUInt32LE()
    const block40 = reader.get_chunk(0x40)
    const block60 = reader.get_chunk(0x60)

    arr.push({
        index,
        blockA: block40, // 0x40
        blockB: block60, // 0x60
    })
}
const arr980 = []

for (let i = 0; i < local_980.readUInt32LE(); i++) {
    const strlen = reader.get_chunk(4).readUInt32LE()
    const nameBuf = reader.get_chunk(strlen)

    // quitar \0 si existe
    const name = nameBuf.toString('ascii').replace(/\0.*$/, '')

    const vec = reader.get_chunk(0x0c).readFloatLE(); // 12 bytes
    const f1 = reader.get_chunk(4).readFloatLE()
    const f2 = reader.get_chunk(4).readFloatLE()
    const flags = reader.get_chunk(4).readUInt32LE()


    arr980.push({
        name,          // textura / recurso
        vec,           // raw 12 bytes
        scaleA: f1,
        scaleB: f2,
        flags
    })
}
const blocks7c = []
console.log('this0x7c.readUInt32LE(): ', this0x7c.readUInt32LE())
for (let i = 0; i < this0x7c.readUInt32LE(); i++) {
    const type = reader.get_chunk(4).readUInt32LE()

    const node = {
        type,
        raw: {
            specific: {},
            common1: null,
            common2: null,
            common3: null
        }
    }

    // === BLOQUE ESPECÍFICO POR TIPO ===
    if (type === 0) {
        node.raw.specific.block44 = reader.get_chunk(0x0c) // +0x44
        node.raw.specific.block50 = reader.get_chunk(4)    // +0x50
        node.raw.specific.block54 = reader.get_chunk(4)    // +0x54
    }
    else if (type === 1) {
        node.raw.specific.block44 = reader.get_chunk(0x0c) // +0x44
        node.raw.specific.block50 = reader.get_chunk(0x0c) // +0x50
        node.raw.specific.block5c = reader.get_chunk(4)    // +0x5c
    }
    else if (type === 2) {
        node.raw.specific.block44 = reader.get_chunk(0x0c) // +0x44
    }
    else if (type === 3) {
        // no lecturas específicas
    }
    else {
       
    }

    // === BLOQUE COMÚN (SIEMPRE PRESENTE) ===
    node.raw.common1 = reader.get_chunk(0x10) // +0x10
    node.raw.common2 = reader.get_chunk(0x10) // +0x20
    node.raw.common3 = reader.get_chunk(0x10) // +0x30

    blocks7c.push(node)

}
*/