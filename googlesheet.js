const fs = require('fs');
require('dotenv').config();
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
// https://www.googleapis.com/auth/spreadsheets.readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

// const authClient = await auth.getClient();
// google.options({ auth: authClient });

/**
 * write the param *values* to a google spread sheet
 * @param {any[][]} values The data to be written. Each item in the inner array corresponds with one cell.
 */
function writeToGS(callback, ...data) {
    // Load client secrets from a local file.
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) throw err
        else return authorize(JSON.parse(content), callback, ...data);
    })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, values) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, values);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1vKsP0f2DpDcbJaKnBGTILVsDoELN6P84Zj786LWqgbM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string[]} values  The data to be written. Each item in the inner array corresponds with one cell.
 */
async function appendValues(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        console.log(JSON.stringify(response, null, 2));
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

const range = 'Wallet!B1:E';
const requestsBody = [];
const samplevalues = [0, 0, 0, 0]
const spreadsheetId = process.env.spreadsheetId;
const moveRequest = {
    moveDimension: {
        source: {
            sheetId: process.env.spreadsheetId,
            dimension: "ROWS",
            startIndex: 0,
        },
        destinationIndex: 1
    }
}
const writeRequest = {
    spreadsheetId: process.env.spreadsheetId,
    range: range,
    resource: {
        valueInputOption: "USER_ENTERED",
        data: [['hoge', 'hoge', 'ge', 'e']]
    },
}
const cellsUpdateRequest = {
    "updateCells": {
        "rows": [samplevalues],
        "fields": "*",
        // Union field area can be only one of the following:
        "range": range
    }
};

//Inserts cells into a range, shifting the existing cells over or down.
const insertRangeRequest = {
    "insertRange": {
        "range": {
            "sheetId": 0,
            "startRowIndex": 1,
            "endRowIndex": 2,
            // "startColumnIndex": 1,
        },
        "shiftDimension": 1
    }
}
const insertDimention = {
    "insertDimension": {
        "range": {
            "sheetId": 0,
            "dimension": "ROWS",
            "startIndex": 0,
            "endIndex": 3
        },
        "inheritFromBefore": false
    }
} ;
// End of list of possible types for union field area.
// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#updatecellsrequest
// requestsBody.push(moveRequest);
requestsBody.push(cellsUpdateRequest);
const batchUpdateRequest = { requestsBody };
const data = [
    {
        "range": "Wallet!B2:E",
        "majorDimension": "ROWS",
        "values": [[11, 2, 5, 0]]
    }
];
(() => {
    // writeToGS(batchUpdate, data)
    // writeToGS(appendValues, [[11111, 11111, 3, 11111]])
    // writeToGS(   batchUpdate,batchUpdateRequest)
    const req = {
        spreadsheetId: process.env.spreadsheetId,
        requestsBody: batchUpdateRequest,
    };
    const req2 = {
        spreadsheetId: process.env.spreadsheetId,
        requests: [insertDimention]
    };
    const req3 = {
        spreadsheetId: process.env.spreadsheetId,
        resource: { data },
    };
    const request = {
        spreadsheetId: process.env.spreadsheetId,
        range: range,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[12,12,12,]]
        }
    }
    writeToGS(appendValues, request);
    // console.log('req2 :>> ', req2);
    // console.log('req2 :>> ', req2.requests[0].insertDimension);
    // writeToGS(batchUpdate, process.env.spreadsheetId, batchUpdateRequest)
    // writeToGS(batchUpdate, req)

    /* this.sheetsService.spreadsheets.batchUpdate({
        spreadsheetId=process.env.spreadsheetId,
        resource: batchUpdateRequest,
    }, (err, response) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            const findReplaceResponse = response.replies[1].findReplace;
            console.log(`${findReplaceResponse.occurrencesChanged} replacements made.`);
        }
    }); */
})()


module.exports = { writeToGS };