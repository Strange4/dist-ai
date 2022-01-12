import ProtocolHandler from "../ProtocolHandler";

export default class Worker extends ProtocolHandler {
    onMessage(websocket: import("ws")): void {
        throw new Error("Method not implemented.");
    }
    
}

let birds:BirdData[] = [];
const totalBirds = 200;

type NeuralNetwork = {
    inputNodes: number,
    hiddenNodes: number[],
    outputNodes: number,
    hiddenActivation: string,
    outputActivation: string,
    weights: MultiNumberArray
}
type MultiNumberArray = Array<MultiNumberArray | number>;

type BirdData = {
    score:number,
    neuralNetwork: NeuralNetwork,
    fitness: number
}

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