'use strict'
const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');

const spreadsheetId = process.env.spreadsheetId;
const range = 'Wallet!B1:E';
const row = [];
(async () => {
    const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [row]
        }
    }
    const labelRequest = {
        spreadsheetId: spreadsheetId,
        range: 'Wallet!A1:1',
        majorDimension: "ROWS",
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER',
    };
    const date = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' })
    console.log('date :>> ', date);
    const wallet = (await exchange.fetchBalance()).total
    console.log('wallet :>> ', wallet);

    // await sheetAPI(append, request);
    const [label] = (await sheetAPI(get, labelRequest)).values
    console.log('label :>> ', label);

    const array=[];
    label.find
})()