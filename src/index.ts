import CCXT from 'ccxt';
import axiosBase from 'axios';
import { initExchange } from './exchange';
import { pushMessage } from './line';
import { Prices } from './interfaces/arbitrageInterfaces';
import { assignTickers, addBPrices, addCPrices, expectedReturn, logger, judgeOp } from './arbitrage/arbitrage';
import arbitrageConfig from './arbitrageConfig.json';
import config from './config';


const exchange = initExchange(CCXT, 'ftx');
const bb = new CCXT['bitbank']();
const symbols = ['BTC', 'ETH', 'XRP', 'LTC'];

const main = async () => {
    try {
        const res = await exchange.fetchTickers(symbols.map(el => el + '/USD')) as Prices;
        let tickers = assignTickers(res, {});
        await addCPrices(tickers, 'USD', 'JPY');
        tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');
        const dataset = expectedReturn(tickers, arbitrageConfig);
        logger(dataset);
        const data = await judgeOp(Number(config.BASIS), dataset, false);
        // console.log('data :>> ', data);
    }
    catch (e) {
        await pushMessage(axiosBase, [{
            type: 'text',
            text: `[ERROR]: ${e}`
        }])
        console.log('[ERROR]:', e);
    }
}
const TIMEOUT = 3600 * 1000;
const expiration = Date.now() + TIMEOUT;

const repeat = (func: { (): Promise<void>; (): void; },) => {
    // await new Promise(resolve => setTimeout(resolve, 25 * 1000));
    // repeat(func);
    try {
        func();
        if (expiration > Date.now()) process.exit(0);
    } catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1)
    }
    setTimeout(() => {
        repeat(func);
    }, 120 * 1000);
}

repeat(main);

// main()
