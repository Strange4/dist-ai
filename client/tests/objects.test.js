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
        sendBirds(socket, [bird]);
        await delay(1000);
        const serverBird = getServerBirds()[0];
        expect(serverBird.yPos).toEqual(bird.yPos);
        const pipe = new Pipe();
        bird.think(pipe);
        serverBird.think(pipe);
        serverBird.update();
        bird.update();
        expect(serverBird.yPos).toEqual(bird.yPos);

    });
});

function delay(time){
    return new Promise((resolve)=>{
        setTimeout(resolve, time);
    })
}