import TEST_CONFIG from '../config.test.json';

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
        "BEARER_ACCESS_TOKEN": process.env.BEARER_ACCESS_TOKEN,
        "USER_ID": process.env.USER_ID,
        "ALL_NOTIF": false
    },
    "CREDENTIALS": {
        "clien_id": process.env.client_id,
        "client_secret": process.env.client_secret,
        "redirect_urls": [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
        ]
    },
    "SPREAD_SHEET": {
        "access_token": process.env.access_token,
        "refresh_token":process.env.refresh_token,
        "SHEET_ID": process.env.SHEET_ID
    }
}