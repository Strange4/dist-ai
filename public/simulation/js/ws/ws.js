let connected = false;
function setConnection(){
    const socket = new WebSocket('ws://localhost:3000', 'worker');
    socket.addEventListener('error', (event)=>{
        dispatchDisconnectedEvent();
        connected = false;
    });
    socket.addEventListener('open', (event)=>{
        socket.send('getBirds 200');
        connected = true;
    });
    socket.addEventListener('message', (event)=>{
        updateLocalBirds(event);
    });
    socket.addEventListener('close', (event)=>{console.log(`Connection with the server closed, code: ${event.code}, reason: ${event.reason}`);})
    return socket;
}

async function updateLocalBirds(dataReceived){
    let data;
    try{
        data = JSON.parse(dataReceived.data);
    } catch (error){
        console.log(dataReceived.data);
        return;
    }
    if(data){
        disposeBirds(serverData.birds);
        serverData.lastUpdated = new Date().getTime();
        serverData.birds = await getBirdsFromData(data);
    }
}

/**
 * disposes the birds and realeases the memory
 * @param {Bird[]} birds the birds to be disposed
 */
 function disposeBirds(birds){
    if(!birds) return;
    for(const bird of birds){
        bird.dispose();
    }
}

/**
 * sends the birds to the server
 * @param {WebSocket} socket the socket connection to the server
 * @param {Bird[]} birds the birds to send
 */
function sendBirds(socket, birds){
    const jsonData = [];
    for(const bird of birds){
        jsonData.push(bird.toJson());
    }
    if(connected){ 
        if(socket.readyState == socket.CLOSED || socket.readyState == socket.CLOSING){
            console.log('disconected from the server. will continute offline');
            connected = false;
            dispatchDisconnectedEvent();
        } else {
            socket.send(JSON.stringify(jsonData, null, 4));
        }
    }
}

/**
 * transoforms json data from the server into birds that are able to be trainned
 * @param {Object} data the json object that came from the server
 */
async function getBirdsFromData(data){
    const birds = [];
    for(const bird of data){
        const { inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, weights } = bird.neuralNetwork;
        const nn = NeuralNetwork.fromJson(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, weights);
        const receivedBird = new Bird(nn);
        receivedBird.mutate();
        birds.push(receivedBird);
        nn.dispose();
    }
    return birds;
}

const serverData = {
    lastUpdated: new Date().getTime(),
    lastChecked: 0,
    birds: []
}
const socket = setConnection();

/**
 * severs the connection of the socket
 * @param {WebSocket} socket the socket for which to sever the connection
 * @param {number} code the closing code to be sent
 * @param {string} reason the reason of the closing
 */
function endConnection(socket, code, reason){
    socket.close(code, reason);
}

function dispatchDisconnectedEvent(){
    const event = new CustomEvent('disconnected');
    const elements = document.querySelectorAll('.disconnected-listener');
    for(const element of elements){
        element.dispatchEvent(event);
    }
}
