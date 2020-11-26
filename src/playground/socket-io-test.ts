// import axios from 'axios';
import io from 'socket.io-client';

const socket = io('wss://stream.bitbank.cc', {
    transports: ['websocket']
});
// const CONFIG = require('./config.js');
// const bitbank = require('node-bitbankcc');

socket.on('connect', function () {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
})
const wholeBookChannel = 'depth_whole_eth_jpy';
const diffBookChannel = 'depth_diff_eth_jpy';

// socket.emit('join-room', wholeBookChannel);
socket.emit('join-room', diffBookChannel);
socket.on('message', function incoming(data: { message: { data: any; }; }) {
    console.log('data :>> ', data.message.data);
})



// const publicApi = new bitbank.PublicApi(CONFIG.PublicApiConfig);
// const privateApi = new bitbank.PrivateApi(CONFIG.PrivateApiConfig);

// const axiosBase = axios.create({
//     baseURL: 'https://public.bitbank.cc/btc_jpy',
// });

