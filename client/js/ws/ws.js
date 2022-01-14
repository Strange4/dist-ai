function setConnection(){
    const socket = new WebSocket('ws://localhost:3000', 'worker');
    socket.addEventListener('open', (event)=>{
        console.log('connected to the server');
        socket.send('getBirds 200');
    });
    socket.addEventListener('message', (event)=>{
        console.time('updateNewBirds');
        updateLocalBirds(event);
        console.timeEnd('updateNewBirds');
    });
    socket.addEventListener('close', (event)=>{console.log('the connection with the server has been closed'); console.log(event)})
    return socket;
}

async function updateLocalBirds(dataReceived){
    let data;
    try{
        data = JSON.parse(dataReceived.data);
    } catch (error){
        console.log(dataReceived.data);
        console.log(error);
        return;
    }
    if(data){
        console.log('got birds from the server');
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
async function sendBirds(socket, birds){
    const jsonData = [];
    for(const bird of birds){
        jsonData.push(bird.toJson());
    }
    socket.send(JSON.stringify(jsonData, null, 4));
}

/**
 * transoforms json data from the server into birds that are able to be trainned
 * @param {Object} data the json object that came from the server
 */
async function getBirdsFromData(data){
    const birds = [];
    for(const bird of data){
        const inputNodes = bird.neuralNetwork.inputNodes;
        const hiddenNodes = bird.neuralNetwork.hiddenNodes;
        const outputNodes = bird.neuralNetwork.outputNodes;
        const hiddenActivation = bird.neuralNetwork.hiddenActivation;
        const outputActivation = bird.neuralNetwork.outputActivation;
        const weights = bird.neuralNetwork.weights;
        const nn = NeuralNetwork.fromJson(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, weights);
        birds.push(new Bird(nn));
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