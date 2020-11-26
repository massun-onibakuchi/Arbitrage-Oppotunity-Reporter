import TEST_CONFIG from './config.test.json';

export = process.env.NODE_ENV != 'production' ? TEST_CONFIG : {
    "BITBANK": {
        "APIKEY": process.env.BB_APIKEY,
        "APISECRET": process.env.BB_APISECRET
    },
    "FTX": {
        "APIKEY": process.env.FTX_APIKEY,
        "APISECRET": process.env.FTX_APISECRET
    },
    "LINE": {
        "BEAR_ACCESS_TOKEN": process.env.BEARER_ACCESS_TOKEN,
        "USER_ID": process.env.USER_ID,
        "ALL_NOTIF": false
    }
}