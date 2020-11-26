'use strict';
// require('dotenv').config();

/**
 * return api key and secret 
 * Synchronously reads the entire contents of a file 
 * if a file don't exist ,check env variable
 * @param {String} path path to the api key and secret file
 * @param {String} exchange exchange name
 */
const setKeys = () => {
    if (process.env.APIKEY == undefined || process.env.APISECRET == undefined)
        throw Error("ERROR :NO_APIKEY")
    return {
        'APIKEY': process.env.APIKEY,
        'APISECRET': process.env.APISECRET
    }
}

/**
 * 
 * @param {CCXT} ccxt ccxt flamework
 * @param {String} path path to the api key and secret file
 * @param {String} exchangeId exchange name
 * @return {CCXT.EXCHANGE} exchange
 */
 const initExchange = (ccxt, path = undefined, exchangeId) => {
    const keys = setKeys();
    const exchange = new ccxt[exchangeId.toLowerCase()]({
        'apiKey': keys.APIKEY,
        'secret': keys.APISECRET,
        'enableRateLimit': true,
        // 'verbose': true,
        'options': { 'adjustForTimeDifference': true }
    });
    if (exchangeId.toUpperCase() == 'BITMEX') {
        exchange.urls['api'] = exchange.urls['test'];
    }
    // exchange.urls['api'] = (exchangeId.toUpperCase() != 'BITMEX') && exchange.urls['test'];
    return exchange
}

