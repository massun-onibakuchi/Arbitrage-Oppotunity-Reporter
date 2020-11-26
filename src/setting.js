const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

const credentials = {
    installed: {
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        redirect_uris: process.env.redirect_uris
    }
}
const token = {
    access_token: process.env.access_token,
    refresh_token: process.env.refresh_token,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    token_type: "Bearer",
    expiry_date: 1605062558223
}

module.exports = { credentials, token };