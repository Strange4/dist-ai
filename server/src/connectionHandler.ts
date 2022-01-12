import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { WebSocket } from 'ws';
import Observer from './protocols/observer/observer';
import WorkerHandler from './protocols/worker/worker';
import ProtocolHandler from './protocols/ProtocolHandler';

export default class ConnectionHandler {
    private readonly clients = new Map<ClientId, WebSocket>();
    private readonly clientProtocols = new Map<ClientId, ProtocolHandler>();
    private readonly protocols = new Map<string, ProtocolHandler>();
    constructor(){
        this.protocols.set('worker', new WorkerHandler());
        this.protocols.set('observer', new Observer());
    }

    newConnection(ws: WebSocket){
        const protocol = this.protocols.get(ws.protocol);
        if(!protocol){
            
            ws.send("There is no protocol matching your protocol request");
            ws.close(4000, 'Protocol not found');
            ws.terminate();
            
            return;
        }
        const clientId = uuidv4();
        this.clients.set(clientId, ws);
        this.clientProtocols.set(clientId, protocol);
        ws.on('message', (message)=>{
            protocol.onMessage(ws, message.toString());
        });
        ws.on('close', (code, reason)=>{
            reason.toString('utf-8');
            this.connectionClosed(code, reason.toString('utf-8'));
            protocol.onClose(ws, code, reason.toString('utf-8'));
        });
    }

    connectionClosed(code: number, reason: string){
        console.log(`client disconected, code: ${code}, reason: ${reason}`);
        for(const [clientId, ws] of this.clients.entries()){
            if(ws.readyState == WebSocket.CLOSED || WebSocket.CLOSING){
                this.clients.delete(clientId);
                this.clientProtocols.delete(clientId);
            }
        }
    }
}

type ClientId = string;