/**
 * prepares the next generation of birds and pipes
 * @param {Object} global the global variables of the game
 */
Game.nextGeneration = function (global){
    const birds = global.birds;
    sendBirds(socket, birds);
    const serverBirds = getServerBirds();
    // if the birds are not yet back from the server, use these ones
    if(!serverBirds || serverBirds.length == 0){
        const nextGen = [];
        calculateFitness(birds);
        for(let i=0;i<birds.length;i++){
            const survivorBird = pickBird(birds);
            survivorBird.mutate();
            const nextGenBird = new Bird(survivorBird.brain);
            nextGen.push(nextGenBird);
        }
        global.birds = nextGen;
    } else {
        global.birds = serverBirds;
    }
    disposeBirds(birds);
    global.generation++;
    dispatchGenerationEvent(global);
    global.pipesPassed = 0;
    global.pipes = [new Pipe()];
    const ctx = global.ctx;
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
}

/**
 * gets the server birds that are stored in server data
 * @returns {Bird[] | undefined}
 */
function getServerBirds(){
    if(serverData.lastChecked < serverData.lastUpdated){
        serverData.lastChecked = new Date().getTime();
        const serverBirds = serverData.birds;
        serverData.birds = [];
        return serverBirds;
    }
}

/**
 * dispatches a next-gent event to all listeners in the dom
 * @param {Object} global the global variables
 */
function dispatchGenerationEvent(global){
    const event = new CustomEvent('next-gen', {detail: global});
    const elements = document.querySelectorAll('.next-gen-listener');
    for(const element of elements){
        element.dispatchEvent(event);
    }
}

/**
 * picks a bird from the array based on it's fitness score (the more fitness, the more likely it is to be picked)
 * @param {Bird[]} birds the array of birds to pick from
 */
function pickBird(birds){
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

/**
 * calculates the fitness of the birds based on their score
 * @param {Bird[]} birds the birds whos fitness is to be calculated
 */
function calculateFitness(birds){
    let scoreSum = 0;
    for(const bird of birds){
        scoreSum += bird.score;
    }
    for(const bird of birds){
        bird.fitness = bird.score / scoreSum;
    }
    birds.sort((a, b)=>{return a.fitness - b.fitness});
}

/**
 * updates the game objects
 * @param {Object} global the global variables initialized in the start method
 */
Game.update = function(global){
    const pipes = global.pipes;
    const birds = global.birds;
    for(let i=0;i<pipes.length;i++){
        pipes[i].update(); 
        if(pipes[i].offScreen()){
            pipes.splice(i, 1);
            pipes.push(new Pipe());
            global.pipesPassed++;
        }
    }

    const closestPipe = findClosestPipe(pipes);
    for(const bird of birds){
        if(!bird.isDead){
            bird.update();
            if(bird.offScreen() || bird.hits(closestPipe)){
                bird.isDead = true;
            } else {
                bird.think(closestPipe);
            }
        }
    }
    let allDead = true;
    for(const bird of birds){
        if(!bird.isDead){
            allDead = false;
        }
    }
    if(allDead){
        Game.nextGeneration(global);
    }
}

/**
 * checks if the goals of the game have been met. if the goal of the game has been met, the game will stop in the next loop
 * @param {Object} global the global variables of the game
 * @returns {boolean} if the goal has been met
 */
Game.goal = function (global){
    return global.pipesPassed >= global.goal;
}

/**
 * draws the game objects onto the canvas
 * @param {Object} global the global variables initialized in the start method
 */
Game.draw = function(global) {
    window.requestAnimationFrame(()=>{
        const ctx = global.ctx;
        const pipes = global.pipes;
        const birds = global.birds;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0, canvasWidth, canvasHeight);
        for(const pipe of pipes){
            pipe.show(ctx)
        }
        
        for(const bird of birds){
            if(!bird.isDead){
                bird.show(ctx);
            }
        }
    });
}


/**
 * starts the game
 * @param {boolean=} debug if the manual step mode should be on
 * @returns {Object=} if debug is on, it will retunr the global variables used to step through the game manually
 */
 function start(debug){
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let pipes = [new Pipe()];
    let generation = 1;
    let birds;
    const serverBirds = getServerBirds();
    if(!serverBirds || serverBirds.length == 0){
        birds = createBirds(200);
    } else {
        birds = serverBirds;
    }
    const global = {
        ctx: ctx,
        pipes: pipes,
        birds: birds,
        generation: generation,
        pipesPassed: 0,
        goal: 500
    }
    if(debug){
        Game.run(global);
        return global;
    } else {
        Game._stopID = setInterval(Game.run, 0, global);
    }
}

/**
 * creates birds without a previous neural network
 * @param {number} quantity the quantity of birds to create
 * @returns {Bird[]}
 */
function createBirds(quantity){
    const birds = [];
    for(i=0;i<quantity;i++){
        birds.push(new Bird());
    }
    return birds;
}

/**
 * creates a number of starting pipes with the specified quantity and spacing between the pipes
 * @param {number} quantity the qunaity of starting pipes
 * @param {number} spacingBetweenPipes the spacing between the pipes in pipe width (2 == 2 pipe widths between the pipes)
 * @returns {Pipe[]} the starting pipes
 */
function createStartingPipes(quantity, spacingBetweenPipes){
    const pipes = [];
    for(let i=0;i<quantity;i++){
        const pipe = new Pipe();
        pipe.xPos += i * (spacingBetweenPipes * pipe.pipeWidth);
        pipes.push(pipe);
    }
    return pipes;
}

/**
 * finds the closets pipe
 * @param {Pipe[]} pipes the to calculate the position on
 * @returns {Pipe} the closest pipe
 */
function findClosestPipe(pipes){
    let closest = pipes[0];
    for(let i=1;i<pipes.length;i++){
        if(pipes[i].xPos < closest.xPos){
            closest = pipes[i];
        }
    }
    return closest;
}
/**
 * a function that is run when the game is over;
 * @param {Object} global the global variables of the game
 */
Game.over = function (global){

    // repainting over scene
    const ctx = global.ctx;
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,canvasWidth, canvasHeight);
    ctx.fillStyle = 'orange'
    ctx.textAlign = 'center';
    ctx.font = `${50}px Arial`
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2);

    // dispatching the latest game stats
    dispathGameLoopEvent(global);
    dispatchGenerationEvent(global);
    sendBirds(socket, global.birds);
    endConnection(socket, 4999, 'game finished');
}