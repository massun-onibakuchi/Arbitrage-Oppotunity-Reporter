import CCXT from 'ccxt';
import axiosBase from 'axios';
const { initExchange } = require('../exchange');

const ccxt = initExchange(CCXT, undefined, 'ftx');
const axios = axiosBase.create({
    baseURL: 'http://ftx.com/api', // バックエンドB のURL:port を指定する
    headers: {
        'Content-Type': 'application/json',
    },
    responseType: 'json'
});

const symbols = ['BTC/USD', 'ETH/USD', 'BTC-PERP', 'ETH-PERP'];

(async () => {
    const res = (await axios.get('indexes/DEFI/weights')).data.result
    console.log('res :>> ', res);

    const symbols = [];
    for (const key in res) {
        symbols.push(key + '/USD');
    }

    // const tickers = await exchange.fetchTickers(symbols);

})()
