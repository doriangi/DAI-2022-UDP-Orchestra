const dgram = require('dgram');
const net = require('net');

// Intervalle max où le musicien est inactif
const INTERVAL = 5000;
const MULTICAST_ADDRESS = "231.2.23.2";
const MULTICAST_PORT = 3000;
const TCP_PORT = 2205;

var sounds = new Map();
sounds.set("ti-ta-ti", "piano");
sounds.set("pouet", "trumpet");
sounds.set("trulu", "flute");
sounds.set("gzi-gzi", "violin");
sounds.set("boum-boum", "drum");

const musicians = new Map();

const socket = dgram.createSocket('udp4');

socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
});

socket.on('message', (msg, source) => {
    let data = JSON.parse(msg);
    data.last = Date.now();
    data.instrument = sounds.get(data.sound);
    data.activeSince = musicians.has(data.uuid) ? musicians.get(data.uuid).activeSince : data.last;

    delete data.sound;

    musicians.set(data.uuid, data);

    console.log('Message reçu : ' + msg);
});

const server = net.createServer();

server.on('connection', (socket) => {
    const actives = Array.from(musicians.entries()).filter(([uuid, musician]) => {
        const active = Date.now() - musician.last <= INTERVAL;
        if (!active) musicians.delete(uuid);
        return active;
    }).map(([uuid, musician]) => ({
        uuid: uuid,
        instrument: musician.instrument,
        activeSince: new Date(musician.activeSince)
    }));
    socket.write(JSON.stringify(actives) + '\n');
    socket.end();
});

server.listen(TCP_PORT);