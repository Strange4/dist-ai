const socket = setConnection();
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
    const nodes = [{id: 'server', type: 'server'}];
    parsed.workers.forEach(node=>{nodes.push({id: node, type: 'worker'})});
    parsed.observers.forEach(node=>{nodes.push({id: node, type: 'observer'})});
    const links = [];
    nodes.forEach(node=>{links.push({source: node.id, target: 'server'})});
    
    const graphData = {
        nodes: nodes,
        links: links
    }
    ng.updateGraph(graphData);
}