const dgram = require('dgram');
const net = require('net');
const protocol = require('./auditor_protocol');

// Intervalle max où le musicien est inactif
const INTERVAL = 5000;
const TCP_PORT = 2205;

const socket = dgram.createSocket('udp4');
const server = net.createServer();

const musicians = new Map();
const instruments = protocol.INSTRUMENTS;

function onMessage(msg, source) {
    let data = {
        ...JSON.parse(msg),
        last: Date.now()
    };
    data.instrument = Object.keys(instruments).find((i) => instruments[i] === data.sound);
    data.activeSince = musicians.has(data.uuid) ? musicians.get(data.uuid).activeSince : data.last;
    delete data.sound;

    musicians.set(data.uuid, data);

    console.log('Des données sont arrivées: ' + msg + '. Sur le port : ' + source.port);
}

function onConnection(socket) {
    const content = Array.from(musicians.entries()).filter(([uuid, musician]) => {
        const remove = Date.now() - musician.last > INTERVAL;
        if (remove) musicians.delete(uuid);
        return !remove;
    }).map(([uuid, musician]) => ({
        uuid,
        instrument: musician.instrument,
        activeSince: new Date(musician.activeSince)
    }));
    socket.write(JSON.stringify(content) + '\n');
    socket.end();
}

socket.bind(protocol.MULTICAST_PORT, () => {
    console.log('Rejoins groupe multicast');
    socket.addMembership(protocol.MULTICAST_ADDRESS);
});

socket.on('message', onMessage);
server.listen(TCP_PORT);
server.on('connection', onConnection);