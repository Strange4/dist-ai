/**
 * A pipe that travels along the canvas
 */
class Pipe {
    constructor(){
        const GAP = height/3;
        const MIN_BORDER = height/1000;
        const SPEED = width/30;
        const rand = random(MIN_BORDER, height - MIN_BORDER - GAP);

        this.top_end = rand;
        this.bottom_end = this.top_end + GAP;
        this.pipeWidth = width/10;
        this.xPos = Number(width);
        this.speed = SPEED;
    }

    /**
     * Draws the pipe onto a 2d canvas context
     * @param {CanvasRenderingContext2D} ctx the 2d canvas context to the pipe onto
     */
    show(ctx){
        ctx.fillStyle = 'white';
        const relativeX = (this.xPos * canvasWidth) / width;
        const relativeTop = (this.top_end * canvasHeight) / height;
        const relativeBottom = (this.bottom_end * canvasHeight) / height;
        const relativeWidth = (this.pipeWidth * canvasWidth) / width;
        ctx.fillRect(relativeX, 0, relativeWidth, relativeTop);
        ctx.fillRect(relativeX, relativeBottom, relativeWidth, canvasHeight - relativeBottom);
    }

    /**
     * updates the pipe's position
     */
    update(){
        this.xPos -= this.speed;
    }

    /**
     * checks if the pipe is off the screen
     * @returns {boolean} true if it is offscreen, false otherwise
     */
    offScreen(){
        return this.xPos < -this.pipeWidth;
    }
}

/**
 * The bird class that is used by the AI
 */
class Bird{
    /**
     * if no Neural network is passed as a brain, the neural network will be initialized with random values
     * @param {NeuralNetwork=} brain the neural network used to initialize a bird with the same brain as another bird
     */
    constructor(brain){
        this.yPos = height/2;
        this.xPos = width/10;
        this.birdRadius = height / 25;
        this.gravity = height/40;
        this.velocity = 0;
        this.lift = -(height/20);
        this.score = 0;
        this.fitness = 0;
        this.isDead = false;
        if(brain){
            this.brain = brain.copy();
        } else {
            this.brain = new NeuralNetwork(5, [8], 2, NeuralNetwork.activations.relu, NeuralNetwork.activations.softmax);
        }
    }

    /**
     * disposed the tensors used in the brain of the bird
     */
    dispose(){
        this.brain.dispose();
    }

    /**
     * renders the brid into a 2d canvas context
     * @param {CanvasRenderingContext2D} ctx the 2d canvas context that the bird will be drawn to
     */
    show(ctx){
        // it is drawn relative to the new canvas height and width
        const relativeX = (this.xPos * canvasWidth) / width;
        const relativeY = (this.yPos * canvasHeight) / height;
        const relativeRadius = (this.birdRadius * canvasHeight) / height;
        ctx.beginPath();
        ctx.arc(relativeX, relativeY, relativeRadius, 0,  Math.PI * 2);
        ctx.fillStyle = 'rgba(235, 64, 52,0.4)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white'
        ctx.stroke();
    }

    /**
     * updates the score, velocity and position of the bird
     */
    update(){
        this.score++;
        this.velocity += this.gravity;
        this.yPos += this.velocity;
    }

    /**
     * calculates if the closest pipe hits the bird or nort
     * @param {Pipe} pipe the closest pipe to the bird
     * @returns if the bird hits the pipe or not
     */
    hits(pipe){
        const circle = {
            x: this.xPos,
            y: this.yPos,
            r: this.birdRadius
        }
        const rectangleTop = {
            x: pipe.xPos,
            y: 0,
            w: pipe.pipeWidth,
            h: pipe.top_end
        }

        const rectangleBottom = {
            x: pipe.xPos,
            y: pipe.bottom_end,
            w: pipe.pipeWidth,
            h: height - pipe.bottom_end
        }
        return rectCircleCol(circle, rectangleTop) || rectCircleCol(circle, rectangleBottom);
    }

    /**
     * thinks if it's a good idea to jump or not, if it is the bird will jump
     * @param {Pipe} pipe the closest pipe to the bird
     */
    think(pipe){
        let inputs = [];
        inputs[0] = this.yPos / height;
        inputs[1] = pipe.top_end / height;
        inputs[2] = pipe.bottom_end / height;
        inputs[3] = pipe.xPos / width;
        inputs[4] = this.velocity / 10;

        // TODO: verify that the number of inputs given is equal the number of inputs in the neural network
        const prediction = this.brain.predict(inputs);
        if(prediction[0] > prediction[1]){
            this.flap();
        }
    }

    /**
     * mutates the brain of the current bird
     */
    mutate(){
        this.brain.mutate(0.01);
    }

    /**
     * makes the bird flap it's wings and augment it's velocity
     */
    flap(){
        this.velocity +=this.lift;
    }

    /**
     * calculates if the bird is off the screen
     * @returns true if the bird is off the screen. flase otherwise
     */
    offScreen(){
        return this.yPos + this.birdRadius >= height || this.yPos <=0;
    }

    /**
     * prepares the info about the bird to be formatted to json
     * @returns {Object} an object that can be transformed to json
     */
    toJson(){
        const bird = {};
        bird.score = this.score;
        bird.neuralNetwork = this.brain.toJson();
        return bird;
    }
}

/**
 * calculates if a circle collides with a rectangle
 * @param {Object} circle a circle containing x: the x position, y: the y position, r: the radius
 * @param {Object} rect a rectangle containing x: the x position (top left corner), y: the y position (top left), w: the width, h: the height
 * @returns true if the circle collides with the rectangle
 */
function rectCircleCol(circle, rect) {
    const distX = Math.abs(circle.x - rect.x - rect.w / 2);
    const distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) {
        return false;
    }
    if (distY > (rect.h / 2 + circle.r)) {
        return false;
    }

    if (distX <= (rect.w / 2)) {
        return true;
    }
    if (distY <= (rect.h / 2)) {
        return true;
    }
    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;
    return (dx * dx + dy * dy <= (circle.r * circle.r));
}