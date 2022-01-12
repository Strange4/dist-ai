import express from 'express';
import http from 'http';
import WebSocket from 'ws';
const app = express();
const server = http.createServer(app);
let birds:BirdData[] = [];
const totalBirds = 200;

const wss = new WebSocket.Server({server: server});

wss.on('connection', (ws)=>{
    console.log(ws);
    console.log('a new client connected');
    ws.send('welcome new client');
    ws.on('message', (message)=>{
        const newBirds:BirdData[] = JSON.parse(message.toString());
        birds.push(...newBirds);
        calculateFitness(birds);
        birds = pickBestBirds(birds);
        ws.send(JSON.stringify(birds));
        console.log(birds);
    });
});

function calculateFitness(birds: BirdData[]){
    let sum = 0;
    for(const bird of birds){
        sum += bird.score;
    }
    for(const bird of birds){
        bird.fitness = bird.score / sum;
    }
}

function pickBestBirds(birds: BirdData[]){
    const bestBirds:BirdData[] = [];
    for(let i=0;i<totalBirds;i++){
        bestBirds[i] = pickBird(birds);
    }
    return bestBirds;
}

function pickBird(birds: BirdData[]){
    birds.sort((a, b)=>{return a.fitness - b.fitness});
    const random = Math.random();
    let cumulativeSum = 0;
    for(let i=0;i<birds.length;i++){
        cumulativeSum += birds[i].fitness;
        if(random < cumulativeSum){
            return birds[i];
        }
    }
    return birds[birds.length - 1];
}

app.get('/', (request, response)=>{
    response.send('beautiful');
});

server.listen(3000, ()=>{
    console.log('server started on port 3000');
});

type BirdData = {
    score:number,
    neuralNetwork: NeuralNetwork,
    fitness: number
}

type NeuralNetwork = {
    inputNodes: number,
    hiddenNodes: number[],
    outputNodes: number,
    hiddenActivation: string,
    outputActivation: string,
    weights: MultiNumberArray
}

type MultiNumberArray = Array<MultiNumberArray | number>;
