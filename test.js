const fs = require('fs')
const input_file_name = 'MP_DM_VERTIGO.opt'
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
            return Buffer.from([0,0,0,0])
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

const this0x14 = reader.get_chunk()
const opt_file_byte_12 = reader.get_chunk();
const opt_file_byte_16 = reader.get_chunk();
const opt_file_byte_20 = reader.get_chunk();
const this0x7c = reader.get_chunk();
const opt_file_byte_28 = reader.get_chunk();
const this0x88 = reader.get_chunk();
const opt_file_byte_36 = reader.get_chunk();

let this0x18 = null
let arr_opt_file_0x14_byte_x4 = null
if(this0x14 == 0){
    this0x18 = 0
}else{
    this0x18 = new Array(this0x14.readInt32LE(0));
}

let local_9a0 = 0;
let puVar7 = null
const objetosTotales = ''
console.log(`opt_file_byte_12:  ${opt_file_byte_12.readUInt32LE(0)}`)
if (0 < opt_file_byte_12.readUInt32BE(0)) {
    do {

        // Llamada a la función constructora y alamacena en en variable
        const arr_opt_file_0x14_byte_x4 = Buffer.alloc(0x100);
        arr_opt_file_0x14_byte_x4  = first_function_call(arr_opt_file_0x14_byte_x4);
        
        local_9a0++;
    } while (local_9a0 < opt_file_byte_12.readUInt32BE(0));
}
// Dentro de tu clase OptParser...
function first_function_call(arr_opt_file_0x14_byte_x4){

    let iVar1 = null;
    let pvVar2 = null;
    let _Memory = null;
    let pvVar3 = null;
    let iVar4 = null;
    let uVar5 = null;
    let iVar6 = null;
    let iVar7 = null;
    let iVar8 = null;
    let iStack_38 = null;
    let opt_file_byte_44 = null;
    let iStack_30 = null;
    let iStack_2c = null;
    let local_28 = null;
    let pvStack_c = null;
    let puStack_8 = null;
    let local_4 = null;
    let opt_file_byte_40 = null;


    arr_opt_file_0x14_byte_x4.writeUInt32LE(0, 0x0c)
    arr_opt_file_0x14_byte_x4.writeUInt32LE(0, 0x04)
    opt_file_byte_40 = 0x80
    reader.get_chunk(4).copy(arr_opt_file_0x14_byte_x4, opt_file_byte_40);
    pvVar2 = Buffer.alloc(arr_opt_file_0x14_byte_x4.readUInt32LE(opt_file_byte_40) * 0x58);

}
console.log(objetosTotales)