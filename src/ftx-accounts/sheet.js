const fs = require('fs').promises;
const readline = require('readline');
const { google } = require('googleapis');
const { cred, accessToken } = require('./setting');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'


// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#updatecellsrequest
// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
// https://qiita.com/vicugna-pacos/items/f7bb0d97bbaa1371edc8

/**
 * write the param *values* to a google spread sheet
 * @param {any[][]} values The data to be written. Each item in the inner array corresponds with one cell.
 */
async function sheetAPI(callback, data) {
    // Load client secrets from a local file.
    try {
        const content = await fs.readFile(CREDENTIALS_PATH)
        content && console.log('[Info]:Credentials.json is undifined ');
        return await authorize(JSON.parse(content), callback, data);
    } catch (err) {
        if (err) {
            console.log('CAN NOT FIND CREDNTIALS');
            console.log('err in SheetAPI :>> ', err);
        }
    }
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback, data) {
    let { client_secret, client_id, redirect_uris } = credentials.installed;
    if (client_id == undefined || client_id == undefined) {
        ({ client_secret, client_id, redirect_uris } = cred.installed);
    }
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    try {
        const token = await fs.readFile(TOKEN_PATH) || token;
        oAuth2Client.setCredentials(JSON.parse(token));
        return await callback(oAuth2Client, data);
    } catch (err) {
        console.log('CAN NOT FIND TOKEN');
        console.log('err :>> ', err);
        // return getNewToken(oAuth2Client, callback, data);
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback, data) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const promise = new Promise((resolve, reject) => {
        rl.question('', (code) => {
            rl.close();
            return resolve(code);
        })
    });
    promise.then(code => {
        return oAuth2Client.getToken(code)
    }).then((err, token) => {
        oAuth2Client.setCredentials(token);
        return token;
    }).then((token) => {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token))
        console.log('Tokne stored to', TOKEN_PATH);
    }).catch(err => console.error('Error while trying to retrieve access token', err))
        .then(callback(oAuth2Client, data)).catch((e) => {
            console.log(' :>> ', e);
        })
}


/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1vKsP0f2DpDcbJaKnBGTILVsDoELN6P84Zj786LWqgbM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string[]} values  The data to be written. Each item in the inner array corresponds with one cell.
 */
async function append(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}

async function get(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        return (await sheets.spreadsheets.values.get(request)).data;
    } catch (err) {
        console.error(err);
    }
}

async function batchUpdate(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        const response = (await sheets.spreadsheets.values.batchUpdate(request)).data;
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}

module.exports = { sheetAPI, append, batchUpdate, get }
// module.exports = { sheetAPI, append, batchUpdate, get }

