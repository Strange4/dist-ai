import ProtocolHandler from "../ProtocolHandler";

export default class Observer extends ProtocolHandler {
    onMessage(websocket: import("ws")): void {
        throw new Error('on message has not been implemented');
    }
}