const dgram = require('dgram');
const crypto = require('crypto');

const MULTICAST_ADDRESS = "231.2.23.2";
const MULTICAST_PORT = 3000;

let instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");

const socket = dgram.createSocket('udp4');
const uuid = crypto.randomUUID();
const INTERVAL = 1000;

const instrumentName = process.argv[2];

const data = {};
data.uuid = uuid;
data.sound = instruments.get(instrumentName);

const message = JSON.stringify(data);

let payload = new Buffer.from(message);

function sendData() {
    socket.send(payload, 0, payload.length, MULTICAST_PORT, MULTICAST_ADDRESS);
    console.log('Envoi du message : ' + message);
}

setInterval(sendData, INTERVAL);