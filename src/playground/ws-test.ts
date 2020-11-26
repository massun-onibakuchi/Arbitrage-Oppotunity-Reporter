// import ccxt from 'ccxt';
import WebSocket from 'ws';
const ws = new WebSocket("wss://ftx.com/ws/");


/* (async function () {
    let ftx = new ccxt.ftx();
    let markets = await ftx.loadMarkets();
    console.log(ftx.id, 'markets["Btc/usd"]:>>', markets['BTC/USD'])
    // console.log('await ftx.fetchL2OrderBook() :>> ', await ftx.fetchL2OrderBook('ETH/USD'));
    console.log('await ftx.fetctOHLCV() :>> ');
    const since = ftx.milliseconds() - 86400000;
    ftx.fetchOHLCV('BTC/USD', '15m', since)
})();
 */


const PING = JSON.stringify({ 'op': 'ping' });
const REQUEST = JSON.stringify({ 'op': 'subscribe', 'channel': 'orderbook', 'market': 'BTC-PERP' });

ws.on('open', function open() {
    ws.send(PING);
    ws.send(REQUEST);
});

ws.on('message', function incoming(data: string) {
    const orderBook  = JSON.parse(data).data;
    console.log(orderBook);
});

// ws.on('open', function open() {
//     ws.send("{ 'op': 'subscribe', 'channel': 'trades', 'market': 'BTC-PERP' }");
// });

setInterval(() => { ws.send(PING); }, 14000)

setInterval(() => {
    console.log('----setInterval()----');
    const heapUsed = process.memoryUsage().heapUsed
    console.log('Heap:', heapUsed, 'bytes')
}, 3000);