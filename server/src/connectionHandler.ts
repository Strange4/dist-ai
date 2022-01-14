import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { WebSocket } from 'ws';
import WorkerHandler from './protocols/worker/worker';
import ProtocolHandler from './protocols/ProtocolHandler';
/**
 * Handles the new and closed connections from the server
 */
export default class ConnectionHandler {
    private readonly clients = new Map<ClientId, WebSocket>();
    private readonly workers = new Map<ClientId, ProtocolHandler>();
    private readonly observers:ClientId[] = [];
    private readonly protocols = new Map<string, ProtocolHandler>();
    private networkInfo: NetworkInfo;

    /**
     * initializes the handler and the known protocols
     */
    constructor(){
        this.networkInfo = {workers: [], observers: [], lastClientMessage: '', lastServerMessage: ''};
        this.protocols.set('worker', new WorkerHandler());
    }

    /**
     * handles a new connection to the server
     * @param ws the websocket connection to be handle
     */
    newConnection(ws: WebSocket){
        if(ws.protocol === 'observer'){
            this.handleObserverProtocol(ws);
            return;
        }

        const protocolHandler = this.protocols.get(ws.protocol);
        if(!protocolHandler){
            ws.send("There is no protocol matching your protocol request");
            ws.close(4000, 'Protocol not found');
            console.log(`disconnected client, code: ${4000}, reason: Protocol not found`)
            this.cleanClosedConnnections();
            return;
        }
        this.setNewWorker(ws, protocolHandler);
    }
    /**
     * send a message for a the clients with the same protocol
     * @param protocolHandler the protocol handler of the clients to which send the information
     * @param message the message to send to the clients, if the message is empty nothing will be sent
     */
    private replyAll(protocolHandler: ProtocolHandler, message?: string, ws?: WebSocket){
        if(!message || message.length === 0) return;
        for(const [clientId, pH] of this.workers){
            if(pH.constructor.name === protocolHandler.constructor.name){
                this.clients.get(clientId)?.send(message);
                this.networkInfo.lastServerMessage = clientId;
                this.notifyObservers();
                console.log('just sent a message');
            }
        }
    }

    /**
     * sets a new worker in the network of workes and adds it's handlers
     * @param ws the websocket associated with the worker client
     * @param protocolHandler the protocol that is called to handle the messages
     */
    private setNewWorker(ws: WebSocket, protocolHandler: ProtocolHandler){
        const clientId = uuidv4();
        this.clients.set(clientId, ws);
        this.workers.set(clientId, protocolHandler);
        this.networkInfo.workers.push(clientId);
        this.notifyObservers();
        console.log('new client connected')
        ws.on('message', (message)=>{
            console.time('messageHandling');
            this.networkInfo.lastClientMessage = clientId;
            this.notifyObservers();
            const replyAllInfo = protocolHandler.onMessage(ws, message.toString());
            if(replyAllInfo.messageSent){
                this.networkInfo.lastServerMessage = clientId;
                this.notifyObservers();
                this.replyAll(protocolHandler, replyAllInfo.replyAllMessage, ws);
                return;
            }
            this.replyAll(protocolHandler, replyAllInfo.replyAllMessage);
            this.cleanClosedConnnections();
            console.timeEnd('messageHandling');

        });
        ws.on('close', (code, reason)=>{
            console.log(`client disconected, code: ${code}, reason: ${reason}`);
            protocolHandler.onClose(ws, code, reason.toString('utf-8'));
            this.cleanClosedConnnections();
            this.notifyObservers();
        });
    }

    /**
     * adds the observer client to the network
     * @param ws the websocket associated with the observer client
     */
    private handleObserverProtocol(ws: WebSocket){
        const clientId = uuidv4();
        this.observers.push(clientId);
        this.networkInfo.observers.push(clientId);
        this.clients.set(clientId, ws);
        this.notifyObservers();
        return;
    }

    /**
     * notifies the observers in the network info changes
     */
    private notifyObservers(){
        const workers:string[] = [];
        for(const [clientId, protocol] of this.workers){
            workers.push(clientId);
        }
        this.networkInfo.workers = workers;
        const observers: string[] = [];
        for(const observer of this.observers){
            observers.push(observer);
        }
        this.networkInfo.observers = observers;
        for(const obs of this.observers){
            const ws = this.clients.get(obs);
            ws?.send(JSON.stringify(this.networkInfo));
        }
    }

    /**
     * cleans the networking of the closing websockets (workers and observers)
     */
    private cleanClosedConnnections(){
        const oldSize = this.clients.size;
        for(const [clientId, ws] of this.clients.entries()){
            if(ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING){
                console.log('cleaning closed connnection', clientId);
                this.clients.delete(clientId);
                this.workers.delete(clientId);
                this.removeObserver(clientId);
            }
        }
        if(oldSize !== this.clients.size){
            console.log(this.clients.size);
        }
    }
    
    /**
     * removes the observer with the specified client id from the network
     * @param clientId the clientId of the observer
     */
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
    lastServerMessage: ClientId,
    lastClientMessage: ClientId
}

type ClientId = string;