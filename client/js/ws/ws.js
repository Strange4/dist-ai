function setConnection(){
    const socket = new WebSocket('ws://localhost:3000');
    socket.addEventListener('open', (event)=>{
        console.log('connected to the server');
    });
    socket.addEventListener('message', (event)=>{updateLocalBirds(event); console.log(event)})
    
    return socket;
}

function updateLocalBirds(serverData){
    let data;
    try{
        data = JSON.parse(serverData.data);
    } catch (error){
        console.log(serverData.data);
    }
    if(data){
        serverData.lastUpdated = new Date().getTime();
        serverData.birds = getBirdsFromData(data);
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
    socket.send(JSON.stringify(jsonData, null, 4));
}

/**
 * transoforms json data from the server into birds that are able to be trainned
 * @param {Object} data the json object that came from the server
 */
function getBirdsFromData(data){
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
    }
    return birds;
}

const serverData = {
    lastUpdated: new Date().getTime(),
    lastChecked: 0,
    birds: []
}
const socket = setConnection();