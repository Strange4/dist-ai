describe('testing sending birds', ()=>{
    it('should send the birds', async ()=>{
        const bird = new Bird();
        sendBirds(socket, [bird]);
        await delay(1000);
        const serverBirds = getServerBirds();
        expect(serverBirds[0].brain.inputNodes).toEqual(bird.brain.inputNodes);
    });
    it('should have the same prediction', async ()=>{
        const bird = new Bird();
        sendBirds(socket, [bird]);
        await delay(1000);
        const serverBirds = getServerBirds();
        const pipe = new Pipe();
        bird.think(pipe);
        serverBirds[0].think(pipe);
        expect(serverBirds[0].yPos).toEqual(bird.yPos);
    });
});

function delay(time){
    return new Promise((resolve)=>{
        setTimeout(resolve, time);
    })
}