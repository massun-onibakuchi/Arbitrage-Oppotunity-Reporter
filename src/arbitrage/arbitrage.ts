import CCXT from 'ccxt';
import axiosBase from 'axios';
import { initExchange } from '../exchange';
import { Message, pushMessage } from '../line';
import { Prices, Tickers, ArbitrageCalculator, ArbitrageSet } from './interfaces/arbitrageInterfaces';
import arbitrageConfig from './arbitrageConfig.json';

const symbols = ['BTC', 'ETH', 'XRP'];
const exchange = initExchange(CCXT, 'ftx') as CCXT.Exchange;
const bb = new CCXT['bitbank']();

const assignTickers = (prices: Prices, target: any): Tickers => {
    const tickers = {};
    for (const [key, value] of Object.entries(prices)) {
        tickers[key] = {
            symbol: key,
            ask: value["ask"],
            bid: value["bid"],
            cask: null,
            cbid: null,
            bask: null,
            bbid: null,
            rate: null
        }
    }
    return Object.assign(target || {}, tickers)
}

const addCPrices = async (tickers: Tickers, base: string, target: string): Promise<Tickers> => {
    const rate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
    console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${rate}`);

    for (const [, value] of Object.entries(tickers)) {
        value["cask"] = value["ask"] * rate;
        value["cbid"] = value["bid"] * rate;
        value["rate"] = rate;
    }
    return tickers;
}

const addBPrices = async (tickers: Tickers, exchange: CCXT.Exchange, symbols: string[], base): Promise<Tickers> => {
    for (const symbol of symbols) {
        const res = await exchange.fetchTicker(symbol)
        tickers[symbol.replace('/JPY', '/USD')]["bask"] = res["ask"];
        tickers[symbol.replace('/JPY', '/USD')]["bbid"] = res["bid"];
    }
    return tickers;
}

const expectedReturn = (tickers: Tickers, arbitrageConfig): ArbitrageSet => {
    const calculator = {
        diffPercent: function () {
            return (typeof this.sellBasedJPY == 'number' && !isNaN(this.sellBasedJPY)) ? 100 * (this.sellBasedJPY / this.buy - 1) : NaN
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.buy;
        },
        totalMoney: function () { return this.buy * this.quantity },
        profit: function () {
            return this.quantity * (this.diffPercent() * this.buy - this.tradeFeePercent * this.sellBasedJPY) / 100 - this.sendFeeCrypto * this.buy
        },
        expectedReturn: function () {
            return 100 * this.profit() / this.totalMoney()
        }
    } as ArbitrageCalculator
    for (const [key, value] of Object.entries(tickers)) {
        // if (value['cask'] > value['bbid']) {
        //     value["buy"] = value["bbid"]
        //     value["high"] = 'USD'
        //     value["sellBasedUSD"] = value["bid"]
        //     value["sellBasedJPY"] = value["cbid"]
        // } else {
        //     value["buy"] = value["ask"]
        //     value["high"] = 'JPY'
        //     value["sellBasedUSD"] = value["bid"] / value['rate']
        //     value["sellBasedJPY"] = value["bid"]
        // }
        value["buy"] = value["cask"] > value["bbid"] ? value["bbid"] : null
        value["sellBasedUSD"] = value["cbid"] > value["bbid"] ? value["bid"] : null
        value["sellBasedJPY"] = value["cask"] > value["bbid"] ? value["cbid"] : null
        value["quantity"] = arbitrageConfig[key]["fixedSize"]
            ? parseFloat(arbitrageConfig[key]["size"]) / value["bbid"]
            : parseFloat(arbitrageConfig[key]["quantity"]);
        value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
        Object.assign(value, calculator);
    }
    return tickers as ArbitrageSet
}

const logger = async (dataset: ArbitrageSet) => {
    const messages: Message[] = [];
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = {
                type: "text",
                text: `
    symbol > ${el.symbol}
    Buy  [bitbank] ¥ > ${el.buy}
    Sell [FTX] $ > ${el.sellBasedUSD}
    Sell [FTX] ¥ > ${el.sellBasedJPY?.toFixed(2)}
    割高 (bitbank比) % > ${el.diffPercent().toFixed(3)}
    裁定金額 ¥ > ${el.totalMoney().toFixed(1)}
    取引量 > ${el.quantity.toFixed(2)}
    profit ¥ > ${el.profit().toFixed(1)}
    expectedReturn % > ${el.expectedReturn().toFixed(3)}
    送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}
    `
            } as Message;
            console.log(message['text']);
            messages.push(message);
        }
    }
    await pushMessage(axiosBase, messages)
}

const judgeOp = async (basis = 1, dataset: ArbitrageSet, log: Boolean): Promise<ArbitrageCalculator> => {
    let tmp = { symbol: '', bestReturn: 0 };
    log && await logger(dataset);
    for (const [key, data] of Object.entries(dataset)) {
        tmp = (data.expectedReturn() > (tmp?.bestReturn || 0)) && { symbol: key, bestReturn: data.expectedReturn() }
    }
    if (tmp.bestReturn > basis) {
        await logger({ symbol: dataset[tmp.symbol] })
        return dataset[tmp.symbol]
    };
    return null;
}

(async () => {
    const res = await exchange.fetchTickers(symbols.map(el => el + '/USD')) as Prices;
    let tickers = assignTickers(res, {});
    await addCPrices(tickers, 'USD', 'JPY');
    tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');
    const dataset = expectedReturn(tickers, arbitrageConfig);
    const data = await judgeOp(1, dataset, true);
    console.log('data :>> ', data);

    // const text = `${Date.now()}:${data.symbol}  ${data.totalMoney()} ${data.diffPercent()} ${data.expectedReturn()}`;
})()
