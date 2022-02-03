import ProtocolHandler from "../ProtocolHandler";
import WebSocket from "ws";

export default class WorkerHandler implements ProtocolHandler {
    private serverBirds: BirdData[] = [];
    private readonly MAX_BIRDS = 300;

    /**
     * handles the message of a worker
     * @param websocket the websocket of the client who sent the message
     * @param messageData the message data that was sent by the client
     * @returns 
     */
    onMessage(websocket: WebSocket, messageData: string): { replyAllMessage?: string, messageSent?: boolean } {
        if(messageData.length == 0) {
            console.log('the message sent was empty');
            websocket.close(4001, 'Bad data');
            return {};
        }
        if(messageData.startsWith('getBirds')){
            const ammount = Number(messageData.split(' ')[1]);
            websocket.send(JSON.stringify(this.serverBirds.slice(0, ammount)));
            return { messageSent: true };
        }
        let receivedBirds: BirdData[];
        try{
            receivedBirds = JSON.parse(messageData);
        } catch(error){
            console.log('Failed to parse the birds', error);
            websocket.close(4001, 'Bad data');
            return {};
        }
        receivedBirds.splice(this.MAX_BIRDS);
        this.serverBirds = this.serverBirds.concat(receivedBirds);
        this.serverBirds = WorkerHandler.pickBestBirds(this.serverBirds);
        this.serverBirds.splice(this.MAX_BIRDS);
        websocket.send(JSON.stringify(this.serverBirds.slice(0, receivedBirds.length)));
        return { messageSent: true}
    }
    
    onClose(websocket: WebSocket, code: number, reason: string): void {
        console.log(`a bird worker had fallen, code: ${code}, reason: ${reason}`);
    }

    private static calculateFitness(birds: BirdData[]){
        const { score } = birds.reduce((accumulated, current)=>{ return {...accumulated, score:accumulated.score + current.score}});
        let fitnessSum = 0;
        for(const bird of birds){
            bird.fitness = bird.score / score;
            fitnessSum += bird.fitness;
        }
    }
    
    private static pickBestBirds(birds: BirdData[]){
        WorkerHandler.calculateFitness(birds);
        birds.sort((a, b)=>{return a.fitness - b.fitness});
        const bestBirds:BirdData[] = [];
        for(let i=0;i<birds.length;i++){
            const goodBird = WorkerHandler.pickBird(birds);
            bestBirds[i] = goodBird;
        }
        return bestBirds;
    }

    private static pickBird(birds: BirdData[]){
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