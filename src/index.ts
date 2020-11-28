import CCXT from 'ccxt';
import { initExchange } from './exchange';
import { Prices } from './interfaces/arbitrageInterfaces';
import { assignTickers, addBPrices, addCPrices, expectedReturn, logger, judgeOp } from './arbitrage/arbitrage';
import arbitrageConfig from './arbitrageConfig.json';
import config from './config';

const exchange = initExchange(CCXT, 'ftx') as CCXT.Exchange;
const bb = new CCXT['bitbank']();
const symbols = ['BTC', 'ETH', 'XRP'];

(async () => {
    const res = await exchange.fetchTickers(symbols.map(el => el + '/USD')) as Prices;
    let tickers = assignTickers(res, {});
    await addCPrices(tickers, 'USD', 'JPY');
    tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');
    const dataset = expectedReturn(tickers, arbitrageConfig);
    logger(dataset);
    const data = await judgeOp(Number(config.BASIS), dataset, true);
    console.log('data :>> ', data);
})()
