import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import Observer from './protocols/observer/observer';
import ProtocolHandler from './protocols/ProtocolHandler';
import Worker from './protocols/worker/worker';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
const protocols = new Map<string, ProtocolHandler>();
const clients = new Map<ClientId, WebSocket>();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server: server});
setUpProtocols();


wss.on('connection', (ws)=>{
    
    ws.send('welcome new client');
    let protocolHandler = getProtocolHandler(ws.protocol);
    if(!protocolHandler){
        ws.send("There is no protocol matching your protocol request");
        ws.close(4000, 'Protocol not found');
        return;
    }
    protocolHandler = protocolHandler as ProtocolHandler;
    console.log('a new client connected');
    ws.on('message', (message)=>{
        protocolHandler?.onMessage(ws, message.toString());
    });
});

app.get('/', (request, response)=>{
    response.send('beautiful');
});

server.listen(3000, ()=>{
    console.log('server started on port 3000');
});




function setUpProtocols(){
    protocols.set('worker', new Worker());
    protocols.set('observer', new Observer());
}

function getProtocolHandler(protocolName: string): ProtocolHandler | undefined{
    return protocols.get(protocolName);
}


type NetworkUpdateInfo = {
    workers: number,
    observers: number,
    clientUpdated: number
}

type ClientId = number;