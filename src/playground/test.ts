const CCXT = require('ccxt');
const { initExchange } = require('../exchange');
const { sheetAPI, append, batchUpdate, get } = require('../sheet');
const exchange = initExchange(CCXT, undefined, 'ftx');
const { init } = require('../set');
const { credentials, token } = require('../setting');

const spreadsheetId = process.env.spreadsheetId;
const symbols = ['BTC/USD', 'ETH/USD', 'BTC-PERP', 'ETH-PERP'];

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

(async () => {
    let since = exchange.milliseconds() - 3600 * 1000 * 24 // -1 day from now
    // alternatively, fetch from a certain starting datetime
    // let since = exchange.parse8601 ('2018-01-01T00:00:00Z')
    const symbol = symbols[1] // change for your symbol
    const limit = 10 // change for your limit
    const trades = await exchange.fetchMyTrades(symbol, since, limit)
    console.log('trades :>> ', trades);
    const row = [];
    for (const trade of trades) {
        const data = {
            time: trade.datetime,
            symbol: trade.symbol,
            side: trade.side,
            type: trade.takerOrMaker,
            size: trade.amount,
            price: trade.price,
            fee: trade.fee.cost,
            feeCurrency: trade.fee.currency
        }
        row.push(data);
    }

})()