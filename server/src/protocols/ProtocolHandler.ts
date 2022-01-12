import WebSocket from "ws";

export default interface ProtocolHandler {
    onMessage(websocket: WebSocket, messageData: string): void;
    onClose(websocket: WebSocket, code: number, reason: string): void;
}