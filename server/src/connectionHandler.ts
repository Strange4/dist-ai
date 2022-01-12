import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { WebSocket } from 'ws';
import WorkerHandler from './protocols/worker/worker';
import ProtocolHandler from './protocols/ProtocolHandler';

export default class ConnectionHandler {
    private readonly clients = new Map<ClientId, WebSocket>();
    private readonly workers = new Map<ClientId, ProtocolHandler>();
    private readonly observers:ClientId[] = [];
    private readonly protocols = new Map<string, ProtocolHandler>();
    private networkInfo: NetworkInfo;

    constructor(){
        this.networkInfo = {workers: [], observers: [], lastUpdated: ''};
        this.protocols.set('worker', new WorkerHandler());
    }

    newConnection(ws: WebSocket){
        const clientId = uuidv4();
        if(ws.protocol === 'observer'){
            this.observers.push(clientId);
            this.networkInfo.observers.push(clientId);
            this.clients.set(clientId, ws);
            this.notifyObservers();
            return;
        }

        const protocolHandler = this.protocols.get(ws.protocol);
        if(!protocolHandler){
            ws.send("There is no protocol matching your protocol request");
            ws.close(4000, 'Protocol not found');
            return;
        }

        this.clients.set(clientId, ws);
        this.workers.set(clientId, protocolHandler);
        this.networkInfo.workers.push(clientId);
        this.notifyObservers();
        ws.on('message', (message)=>{
            protocolHandler.onMessage(ws, message.toString());
            this.networkInfo.lastUpdated = clientId;
            this.notifyObservers();
        });
        ws.on('close', (code, reason)=>{
            protocolHandler.onClose(ws, code, reason.toString('utf-8'));
            this.connectionClosed(code, reason.toString('utf-8'));
            this.notifyObservers();
        });
    }

    private notifyObservers(){
        for(const obs of this.observers){
            const ws = this.clients.get(obs) as WebSocket;
            ws.send(JSON.stringify(this.networkInfo));
        }
    }

    private connectionClosed(code: number, reason: string){
        console.log(`client disconected, code: ${code}, reason: ${reason}`);
        for(const [clientId, ws] of this.clients.entries()){
            if(ws.readyState == WebSocket.CLOSED || WebSocket.CLOSING){
                this.clients.delete(clientId);
                this.workers.delete(clientId);
                this.removeObserver(clientId);
            }
        }
    }
    
    private removeObserver(clientId: ClientId){
        for(let i=0;i<this.observers.length;i++){
            if(this.observers[i] === clientId){
                this.observers.splice(i,1);
                return;
            }
        }
    }
}

type NetworkInfo = {
    workers: ClientId[],
    observers: ClientId[],
    lastUpdated: ClientId
}

type ClientId = string;