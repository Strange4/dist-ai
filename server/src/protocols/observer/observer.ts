import ProtocolHandler from "../ProtocolHandler";

export default class Observer extends ProtocolHandler {
    onMessage(websocket: import("ws"), messageData: string): boolean {
        throw new Error("Method not implemented.");
    }
    onClose(websocket: import("ws"), code: number, reason: string): void {
        throw new Error("Method not implemented.");
    }
    
}