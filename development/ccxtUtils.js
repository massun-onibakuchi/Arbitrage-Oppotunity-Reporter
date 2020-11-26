'use strict';
const { orderConfig } = require('../userConfig/orderConfig');
const CCXT = require('ccxt');
const { initExchange } = require('../exchange');

const CONFIG_PATH = 'config.json';
const exchange = initExchange(CCXT, CONFIG_PATH, 'bitmex');

const sortOHLCV = (candles) => {
    const OHLVC = [[], [], [], [], []];
    candles.forEach(el => {
        OHLVC[0].push(parseFloat(el[1]));
        OHLVC[1].push(parseFloat(el[2]))
        OHLVC[2].push(parseFloat(el[3]))
        OHLVC[3].push(parseFloat(el[4]));
        OHLVC[4].push(parseFloat(el[5]));
    })
    return OHLVC
}

const fetchOHLCV = async () => {
    const since = exchange.milliseconds() - 3600000;
    try {
        const result = await exchange.fetchOHLCV(orderConfig.symbol, orderConfig.candleTyep, since);
        // const OHLCV = ohlcvUtils.sortOHLCV(result)
        const OHLCV = sortOHLCV(result);
        return OHLCV
    } catch (e) {
        console.log('e :>> ', e);
        if (e.name === 'BadRequest' || e.name === 'RequestTimeout' || e.name === 'NetworkError' || e.name === 'ExchangeError') return
        else throw e
    }
}

const createOrder = async (side, type, price = undefined, param = undefined) => {
    return await exchange.createOrder(orderConfig.symbol, type, side, orderConfig.amount, price, param);
}

const cancelOrder = async (id) => {
    return await exchange.cancelOrder(id, orderConfig.symbol);
}

const fetchOrder = async (id) => {
    return await exchange.fetchOrder(id, orderConfig.symbol)
}

const fetchBalance = () => exchange.fetchBalance()

const isHelthyBalance = async () => {
    const responce = await exchange.fetchBalance();
    console.log('responce.BTC :>> ', responce.BTC);
    return true
}

module.exports = {
    fetchOHLCV,
    createOrder,
    cancelOrder,
    fetchOrder,
    isHelthyBalance,
    fetchBalance
}

