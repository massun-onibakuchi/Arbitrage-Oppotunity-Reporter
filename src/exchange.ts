import CCXT from 'ccxt';
import CONFIG from './config';


const setKeys = (exchangeId: string) => {
    if (CONFIG[exchangeId]["APIKEY"] === undefined || CONFIG[exchangeId]["APISECRET"] === undefined) {
        Error('[ERROR]:CANNOT_FIND_APIKEYS');
    }
    return {
        'APIKEY': CONFIG[exchangeId]["APIKEY"],
        'APISECRET': CONFIG[exchangeId]["APISECRET"]
    }
}

/**
 * 
 * @param {CCXT} ccxt ccxt 
 * @param {String} path path to the api key and secret file
 * @param {String} exchangeId exchange name
 * @return {CCXT.Exchange} exchange
 */
export const initExchange = (ccxt: typeof CCXT, exchangeId: string): CCXT.Exchange => {
    const keys = setKeys(exchangeId.toUpperCase());
    const exchange = new ccxt[exchangeId.toLowerCase()]({
        'apiKey': keys.APIKEY,
        'secret': keys.APISECRET,
        'enableRateLimit': true,
        // 'verbose': true,
        'options': { 'adjustForTimeDifference': true }
    });
    if (process.env.NODE_ENV != 'production' && exchangeId.toUpperCase() == 'BITMEX') {
        exchange.urls['api'] = exchange.urls['test'];
    }
    return exchange
}

