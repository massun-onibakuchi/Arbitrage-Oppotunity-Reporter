const fs = require('fs');
require('dotenv').config();
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const setUpToken = (fs, file, data) => {
    fs.open(file, 'wx', (err) => {
        if (err) {
            if (err.code === 'EEXIST') return console.error(`[Warning]:${file.toUpperCase()}_EXIST`);
        }
        if (!(data?.access_token || data?.installed.client_secret)) return
        fs.writeFile(file, JSON.stringify(data), (err) => {
            if (err) return console.error(err);
            return console.error(`[Info]:SET_UP_${file.toUpperCase()}`);
        })
    });
}

const PATH = ['token.json', 'credentials.json'];
const token = {
    access_token: process.env.access_token,
    refresh_token: process.env.refresh_token,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    token_type: "Bearer",
    expiry_date: 1598602799325
}
const credentials = {
    installed: {
        client_secret: process.env.client_secret,
        client_id: process.env.client_id,
        redirect_uris: process.env.redirect_uris
    }
}

setUpToken(fs, PATH[0], token);
setUpToken(fs, PATH[1], credentials);


// fs.readFile('token.json', (err, fd) => {
//     if (err) {
//         if (err.code === 'EEXIST') return console.error('token.json already exists');
//     }
//     fs.writeFile('token.json', JSON.stringify(TOKEN), (err) => {
//         if (err) return console.error(err);
//         console.log('write to token.json');
//     })
// });

// fs.readFile('credentials.json', (err, content) => {
//     if (err) {

//     }
//     if (process.env.client_secret == undefined) throw err
//     console.log('set client secret from env variable');
//     const credentials = {
//         installed: {
//             client_secret: process.env.client_secret,
//             client_id: process.env.client_id,
//             redirect_uris: process.env.redirect_uris
//         }
//     }
//     fs.writeFile('credentials.json', JSON.stringify(credentials), (err) => {
//         if (err) return console.error(err);
//         console.log('write to token.json');
//     })
// })
