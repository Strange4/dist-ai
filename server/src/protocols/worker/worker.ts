import ProtocolHandler from "../ProtocolHandler";
import WebSocket from "ws";

export default class WorkerHandler implements ProtocolHandler {
    private serverBirds: BirdData[] = [];
    private readonly MAX_BIRDS = 500;

    onMessage(websocket: WebSocket, messageData: string): void {
        let receivedBirds: BirdData[];
        try{
            receivedBirds = JSON.parse(messageData);
        } catch(error){
            console.log('Failed to parse the birds', error);
            websocket.close(4001, 'Bad data');
            return;
        }
        receivedBirds.splice(this.MAX_BIRDS);
        this.serverBirds.push(...receivedBirds);
        WorkerHandler.calculateFitness(this.serverBirds);
        this.serverBirds = WorkerHandler.pickBestBirds(this.serverBirds);
        websocket.send(JSON.stringify(WorkerHandler.pickFirst(this.serverBirds, receivedBirds.length)));
    }

    private static pickFirst(birds: BirdData[], amount: number){
        const returnedBirds:BirdData[] = [];
        for(let i=0;i<birds.length && amount;i++){
            returnedBirds.push(birds[i]);
        }
        return returnedBirds;
    }

    onClose(websocket: WebSocket, code: number, reason: string): void {
        throw new Error("Method not implemented.");
    }

    private static calculateFitness(birds: BirdData[]){
        let sum = 0;
        for(const bird of birds){
            sum += bird.score;
        }
        for(const bird of birds){
            bird.fitness = bird.score / sum;
        }
    }
    
    private static pickBestBirds(birds: BirdData[]){
        const bestBirds:BirdData[] = [];
        for(let i=0;i<birds.length && i<birds.length;i++){
            bestBirds[i] = WorkerHandler.pickBird(birds);
        }
        return bestBirds;
    }

    private static pickBird(birds: BirdData[]){
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

type BirdData = {
    score:number,
    neuralNetwork: NeuralNetwork,
    fitness: number
}