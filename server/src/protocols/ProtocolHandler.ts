import WebSocket from "ws";

export default abstract class ProtocolHandler {
    abstract onMessage(websocket: WebSocket, messageData: string): void;
    abstract onClose(websocket: WebSocket, code: number, reason: string): void;
}