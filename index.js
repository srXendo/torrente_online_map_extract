const fs = require('fs')
const input_file_name = 'MP_DM_VERTIGO.OPT'
const output_file_name = 'test.opt.obj'
/**
 * Cuenta los decimales de un número o string numérico.
 * @param {number|string} value - número o string que representa un número.
 * @param {Object} [opts]
 * @param {boolean} [opts.preserveTrailingZeros=false] - si true y value es string, cuenta ceros finales.
 * @returns {number} número de decimales reales.
 */
function roundKey(x, y, z, prec = 4) {
    return [x.toFixed(prec), y.toFixed(prec), z.toFixed(prec)];
}

if (!fs.existsSync(input_file_name)) {
    throw new Error(`Err: file input not exist: ${input_file_name}`)
}

//read_file
const input_file = fs.readFileSync(input_file_name)
if (input_file.length === 0) {
    throw new Error(`Err: file input is empty: ${input_file_name}`)
}
const arr_cloud_points = []
//find numbers in file
let row = []
let god_i = 0;
let god_row = []

for (let i = 0; i + 31 < input_file.length; i++) {

    if (i < 4) {
        continue;
    }

    let flag_skip = false

    
    let x = input_file.readFloatLE(i)
    let y = input_file.readFloatLE(i + 4)
    let z = input_file.readFloatLE(i + 8)
    let nx = input_file.readFloatLE(i + 12)
    let ny = input_file.readFloatLE(i + 16)
    let nz = input_file.readFloatLE(i + 20)

    let u =  input_file.readFloatLE(i + 24)
    let v =  input_file.readFloatLE(i + 28)
    let [aux_x, aux_y, aux_z] = roundKey(x, y, z, 20)
    if ((nx*nx + ny*ny + nz*nz > 0.8 && nx*nx + ny*ny + nz*nz < 1.2)) {
        continue;
    }
    if ( input_file.readUInt8(i - 1) !== -0) {
        continue;
    }
  
    if ((aux_x == 0x000000 && aux_y == 0x000000 && aux_z == 0x000000) || (x == 1 && y == 1 && z == 1) || (isNaN(x))||isNaN(y) || isNaN(z) || (!isFinite(x))||!isFinite(y) || !isFinite(z)) {
        flag_skip = true
        continue;
    } 
    let row = roundKey(x, y, z, 7)
    //console.log('offset: ', i)
    if (!flag_skip) {
        if (y < 0) {


            if (x < -25000) {
                //console.log('bad row: ', input_file.slice(i - 1024, i + 1024).toString('hex'))

                //console.log('bad buffer row: ', input_file.slice(i, i + 12).toString('hex'))
                //console.log('bad value row: ', ['v', ...row].join(' '),)



                //console.log('bad value row fixed: ', ['v', ...row].join(' '), '\n')

            }
        } else {

            god_i = i
            god_row = ['v', ...row].join(' ')

            //console.log('god row: ', input_file.slice(god_i - 1024, god_i + 1024).toString('hex'))
            //console.log('god buffer row: ', input_file.slice(god_i, god_i + 12).toString('hex'))
            //console.log('god value row: ', god_row, '\n')
            arr_cloud_points.push(['v', ...row].join(' '))
            arr_cloud_points.push(['vt', u.toFixed(10), v.toFixed(10)].join(' '))
            arr_cloud_points.push(['vn', nx.toFixed(10), ny.toFixed(10), nz.toFixed(10)].join(' '))

        }


    }


}

const result = arr_cloud_points.join('\n')

fs.writeFileSync(output_file_name, result)

