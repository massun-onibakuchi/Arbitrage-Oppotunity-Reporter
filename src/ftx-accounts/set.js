const fs = require('fs');
// require('dotenv').config();

// const init = async (path, data) => {
//     try {
//         await fs.readFile(path);
//     } catch (err) {
//         console.log('err :>> ', err);
//         if (err.code === 'ENOENT') {
//             await fs.writeFile(path, JSON.stringify(data));
//             console.log('Stored to', path);
//         } else throw err;
//     }
// }
const init = (path, data) => {
    try {
        fs.readFileSync(path, data);
        console.log('Find ',path);
    } catch (err) {
        console.log('err :>> ', err);
        if (err.code === 'ENOENT') {
            fs.writeFileSync(path, JSON.stringify(data));
            console.log('Stored to', path);
        }
        else throw err;
    }
}

const sheetConfig = (path, data) => {
    try {
        fs.readFileSync(path, data);
        console.log('Find ',path);
    } catch (err) {
        console.log('err :>> ', err);
        if (err.code === 'ENOENT') {
            fs.writeFileSync(path, JSON.stringify(data));
            console.log('Stored to', path);
        }
        else throw err;
    }
}

module.exports = { init }