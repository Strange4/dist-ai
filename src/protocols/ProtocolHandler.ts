import WebSocket from "ws";

export default interface ProtocolHandler {
    /**
     * handles a message sent from a socket with a particular protocol
     * @param websocket the websocket that sent the message
     * @param messageData the data that was received from the message
     * @returns {string} the data that is to be sent to the rest of the websockets with that protocol
     */
    onMessage(websocket: WebSocket, messageData: string): { replyAllMessage?: string, messageSent?: boolean };
    onClose(websocket: WebSocket, code: number, reason: string): void;
}