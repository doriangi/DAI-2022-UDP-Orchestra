const dgram = require('dgram');
const crypto = require('crypto');
const protocol = require('./musician_protocol');

const socket = dgram.createSocket('udp4');
const uuid = crypto.randomUUID();
const INTERVAL = 1000;

const instrumentName = process.argv[2];
let msg;

if (!instrumentName || !protocol.INSTRUMENTS.hasOwnProperty(instrumentName)) {
    console.log('Instrument incorrect');
    return;
}

const payload = JSON.stringify({
    uuid,
    sound: protocol.INSTRUMENTS[instrumentName]
});

msg = Buffer.from(payload);

function update() {
    socket.send(msg, 0, msg.length, 3000, protocol.MULTICAST_ADDRESS, () => {
        console.log('Envoi du payload: ' + payload + ' avec le port ' + socket.address().port);
    });
}

setInterval(update, INTERVAL);