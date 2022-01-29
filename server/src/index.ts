import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import ConnectionHandler from './connectionHandler';
import path from 'path'

const connnectionHandler = new ConnectionHandler();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server: server});

app.use('/', express.static(path.join(__dirname + '/../public')))

wss.on('connection', (ws)=>{
    connnectionHandler.newConnection(ws);
});

app.get('/', (request, response, next)=>{
    response.sendFile('index.html', {root: __dirname + '/../public'});
    next();
});

server.listen(3000, ()=>{
    console.log('server started on port 3000');
});