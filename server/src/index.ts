import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import ConnectionHandler from './connectionHandler';
import Observer from './protocols/observer/observer';
import ProtocolHandler from './protocols/ProtocolHandler';
import Worker from './protocols/worker/worker';

const connnectionHandler = new ConnectionHandler();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server: server});

wss.on('connection', (ws)=>{
    connnectionHandler.newConnection(ws);
    ws.ping('what id doo');
    ws.on('pong', (data)=>{console.log('received ping: '+data.toString()); ws.pong(data)});
});

app.get('/', (request, response)=>{
    response.send('beautiful');
});

server.listen(3000, ()=>{
    console.log('server started on port 3000');
});

type NetworkUpdateInfo = {
    workers: number,
    observers: number,
    clientUpdated: string
}