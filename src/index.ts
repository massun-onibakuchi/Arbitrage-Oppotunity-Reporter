const CCXT = require('ccxt');
import { initExchange } from './exchange';
const { sheetAPI, append, batchUpdate, get } = require('./sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');
const { init } = require('./set');
const { credentials, token } = require('./setting');

const spreadsheetId = process.env.spreadsheetId;
const priceRange = 'Price!A1:1';
const walletRanges = ['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1'];
const symbols = ['BTC/USD', 'ETH/USD']

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

enum RequestType {
    Append,
    Get,
    Update,
}

const createRequestBody = (ranges: string[]): any => {
    const defaultRanges = ranges || ['Wallet!A1:1', 'Wallet!B1:1', 'Wallet!A1:1']
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: '',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER'
    }
    const appendRequest = {
        spreadsheetId: spreadsheetId,
        range: '',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: []
        }
    }
    const updateRequest = {
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: {
                range: '',
                majorDimension: "ROWS",
                values: []
            },
        }
    }
    function requestBody(req: RequestType, row: undefined | any[], range: undefined | string) {
        if (req == RequestType.Get) {
            labelRequest.range = range || defaultRanges[0];
            return labelRequest
        };
        if (req == RequestType.Append) {
            appendRequest.range = range || defaultRanges[1]
            appendRequest.resource.values = [row];
            return appendRequest
        }
        if (req == RequestType.Update) {
            updateRequest.resource.data.range = range || defaultRanges[2];
            updateRequest.resource.data.values = [row];
            return updateRequest
        }
    }
    // const requests = [labelRequest, appendRequest, updateRequest];
    return {
        // requestBody(request) { requests[request] },
        // setRange(type: string | number, range: any) { this[type] = range },
        getRequestBody: requestBody
    }
}

const createWalletData = (labels: string[], data: Object): [string[], number[]] => {
    const wallet = labels.reduce((acc, elem) => {
        acc[elem] = 0
        return acc
    }, {});

    // new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000)// 日本時間表記
    wallet["Date"] = new Date().toISOString(); //ISO表記のUTC時間
    for (const [key, value] of Object.entries(data)) {
        wallet[key] = value;
    }
    return [Object.keys(wallet), Object.values(wallet)];
}

const requestBody = createRequestBody(walletRanges);

const main = async () => {
    let prices = {
        USD: 1,
        USDT: 1
    };
    const labelRequest = requestBody.getRequestBody(RequestType.Get);

    // fetch label from sheet
    const [sheetLabel]: [string[]] = (await sheetAPI(get, labelRequest)).values;
    // fetch wallet (spot)
    const balance = (await exchange.fetchBalance()).total

    const [newlabel, holdings] = createWalletData(sheetLabel, balance);
    console.log('newlabel :>> ', newlabel);
    console.log('holdings :>> ', holdings);

    const appendRequest = requestBody.getRequestBody(RequestType.Append, holdings);
    const updateRequest = requestBody.getRequestBody(RequestType.Update, newlabel);
    // await sheetAPI(append, appendRequest);
    // await sheetAPI(batchUpdate, updateRequest);

    // fetch close price from exchange
    const tickers = await exchange.fetchTickers(symbols);
    for (const symbol of symbols) {
        const label = symbol.slice(0, 3);
        prices[label] = tickers[symbol]["close"];
    }
    const [, priceRow] = createWalletData(newlabel, prices);
    console.log('priceRow :>> ', priceRow);

    // append price info to the sheet 
    // await sheetAPI(append, requestBody.getRequestBody(RequestType.Append, priceRow, priceRange));

}

try {
    init(CREDENTIALS_PATH, credentials);
    init(TOKEN_PATH, token);
    main()
} catch (e) {
    console.log('UNIEXPECTED ERROR :>> ', e);
    process.exit(1);
}
// const hoge = {
//     "valueInputOption": 'UER_ENTERD',
//     "data": [
//         {
//             "range": "Wallet!A1:1",
//             "majorDimension": "ROWS",
//             "values": ["row"]
//         }
//     ],
//     "includeValuesInResponse": false,
//     "responseValueRenderOption": "FORMATTED_VALUE",
// };
