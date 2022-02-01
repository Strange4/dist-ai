const socket = setConnection();
let networkData = {
    lastClientMessage: "",
    lastServerMessage: "",
    observers: [],
    workers: []
};
/**
 * sets the observer connection with the server
 * @returns {WebSocket}
 */
function setConnection(){
    const socket = new WebSocket('ws://localhost:3000', 'observer');
    socket.addEventListener('error', (event)=>{
        dispatchDisconnectedEvent();
    });
    socket.addEventListener('open', (event)=>{
        console.log('connected with the server');
    });
    socket.addEventListener('message', (event)=>{
        parseNetworkData(event.data);
    });
    socket.addEventListener('close', (event)=>{
        dispatchDisconnectedEvent();
        console.log(`Connection with the server closed, code: ${event.code}, reason: ${event.reason}`);
    });
    return socket;
}


/**
 * severs the connection of the socket
 * @param {WebSocket} socket the socket for which to sever the connection
 * @param {number} code the closing code to be sent
 * @param {string} reason the reason of the closing
 */
function endConnection(socket, code, reason){
    socket.close(code, reason);
}

/**
 * dispatches the disconnected event to all the listeners (all who have the disconnected listener class)
 */
function dispatchDisconnectedEvent(){
    const event = new CustomEvent('disconnected');
    const elements = document.querySelectorAll('.disconnected-listener');
    for(const element of elements){
        element.dispatchEvent(event);
    }
}

/**
 * parses the network data
 * @param {string} data the network data to be parsed
 */
function parseNetworkData(data){
    const parsed = JSON.parse(data);
    console.log(parsed);
    // visualizeData(parsed.observers);
}