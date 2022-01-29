describe('testing sending birds', ()=>{
    it('should send the birds', async ()=>{
        const bird = new Bird();
        sendBirds(socket, [bird]);
        await delay(1000);
        const serverBirds = getServerBirds();
        expect(serverBirds[0].brain.inputNodes).toEqual(bird.brain.inputNodes);
    });

    it('should update the position after thinking', ()=>{
        const bird = new Bird();
        const pipe = new Pipe();
        const previousY = bird.yPos;
        bird.think(pipe);
        bird.update();
        expect(bird.yPos).not.toEqual(previousY);
    });

    it('should have the same prediction', async ()=>{
        const bird = new Bird();
        bird.mutate();
        sendBirds(socket, [bird]);
        await delay(1000);
        const serverBird = getServerBirds()[0];

        const localPrediction = bird.brain.predict([1,2,3,4,5]);
        const serverPrediction = serverBird.brain.predict([1,2,3,4,5]);
        expect(localPrediction).toEqual(serverPrediction);
    });

    it('shoud get back the best birds', async ()=>{
        const totalSent = 200;
        const myBirds = [];
        for(let i=0;i<totalSent;i++){
            const bird = new Bird();
            bird.score = i;
            myBirds[i] = bird;
        }
        sendBirds(socket, myBirds);
        await delay(1000);
        const serverBirds = getServerBirds();
    });
});

function delay(time){
    return new Promise((resolve)=>{
        setTimeout(resolve, time);
    })
}