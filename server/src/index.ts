import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import ConnectionHandler from './connectionHandler';

const connnectionHandler = new ConnectionHandler();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server: server});

wss.on('connection', (ws)=>{
    connnectionHandler.newConnection(ws);
});

app.get('/', (request, response)=>{
    response.send('beautiful');
});

server.listen(3000, ()=>{
    console.log('server started on port 3000');
});