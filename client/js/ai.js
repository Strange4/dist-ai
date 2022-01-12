/**
 * A neural network wrapper of the tensorflow.js library 
 */
class NeuralNetwork{
    
    /**
     * creates a new NeuralNework with the specified nodes
     * @param {number} inputNodes the amount of input nodes
     * @param {number[]} hiddenNodes the amount of nodes in the hidden layers
     * @param {number} outputNodes the amount of outputs
     * @param {string} hiddenActivation the name of the activation function in the hidden layer
     * @param {string} outputActivation the name of the activation function in the output layer
     * @param {tf.Sequential=} model a previous model instead of creating  new one
     */
    constructor(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, model){
        if(!hiddenNodes instanceof Array) throw new Error("the hidden nodes must be an array of numbers");
        if(!NeuralNetwork.validateActivations(hiddenActivation, outputActivation)) throw new Error('the activation function names are not valid');
        this.hiddenActivation = hiddenActivation;
        this.outputActivation = outputActivation;
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        if(model instanceof tf.Sequential){
            this.model = model;
        } else {
            this.model = NeuralNetwork.createModel(this.inputNodes, this.hiddenNodes, this.outputNodes, this.hiddenActivation, this.outputActivation);
        }
    }

    /**
     * checks if the names of the validation functions are valid to use
     * @param {string} hiddenActivation the hidden activation function name
     * @param {string } outputActivation the output activation function name
     * @returns {boolean} if both of the activation names are vali
     */
    static validateActivations(hiddenActivation, outputActivation){
        let validActivationH = false;
        let validActivationO = false;
        for(const value of Object.values(NeuralNetwork.activations)){
            if(value === hiddenActivation){
                validActivationH = true;
            }
            if(value === outputActivation){
                validActivationO = true;
            }
        }
        return validActivationH && validActivationO;
    }
    
    /**
     * makes deep copy of the NeuralNework without any reference pointers
     * @returns {NeuralNetwork} the copy
     */
    copy(){
        return tf.tidy(()=>{
            const nnCopy = NeuralNetwork.createModel(this.inputNodes, this.hiddenNodes, this.outputNodes, this.hiddenActivation, this.outputActivation);
            const weights = this.model.getWeights();
            const weightCopies = [];
            for(let i=0;i<weights.length;i++){
                weightCopies[i] = weights[i].clone();
            }
            nnCopy.setWeights(weightCopies);
            return new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes, this.hiddenActivation, this.outputActivation, nnCopy);
        });
    }

    /**
     * mutates the current weights of the NeuralNetwork using the random gaussian distribution
     * @param {number} rate the rate at which to mutate the weights (e.g. 0.1 == 10% of the time)
     */
    mutate(rate){
        tf.tidy(()=>{
            const currentWeigths = this.model.getWeights();
            const mutatedWeights = [];
            for(let i=0;i<currentWeigths.length;i++){
                const tensor = currentWeigths[i];
                const shape = tensor.shape;
                const values = tensor.dataSync().slice();
                for(let e=0;e<values.length;e++){
                    if(Math.random() < rate){
                        let w = values[e];
                        values[e] = w + randomGauss();
                    }
                }
                const newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }

    /**
     * creates a new NeuralNework object based on the json data
     * @param {number} inputNodes the number of input nodes to create
     * @param {number[]} hiddenNodes the number of hidden nodes in each layer
     * @param {number} outputNodes the number of output nodes to create
     * @param {string} hiddenActivation the name of the hidden activation function
     * @param {string} outputActivation the name of the output activation function
     * @param weightsValues the values of the weights, can be a nested array to represent a tensor
     * @returns {NeuralNetwork} the neural network created from the data
     */
    static fromJson(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, weightsValues){
        return tf.tidy(()=>{
            const model = NeuralNetwork.createModel(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation);
            const weights = [];
            for(let i=0;i<weightsValues.length;i++){
                const tensor = tf.tensor(weightsValues[i]);
                weights.push(tensor);
            }
            model.setWeights(weights);
            return new NeuralNetwork(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation, model);
        });
    }

    /**
     * disposes the model and realeases all the tensors
     */
    dispose(){
        this.model.dispose();
    }

    /**
     * creates a new tf.Sequential model based on the params used in the constructor
     * @param {number} inputNodes the number of input nodes to create
     * @param {number[]} hiddenNodes the number of hidden nodes in each layer
     * @param {number} outputNodes the number of output nodes to create
     * @param {string} hiddenActivation the name of the hidden activation function
     * @param {string} outputActivation the name of the output activation function
     * @returns {tf.Sequential} a tf.Sequential model with the specified params used in the constructor
     */
    static createModel(inputNodes, hiddenNodes, outputNodes, hiddenActivation, outputActivation){
        return tf.tidy(()=>{
            if(!NeuralNetwork.validateActivations(hiddenActivation, outputActivation)) throw new Error('the activation function names are not valid');
            const model = tf.sequential();
            const inputLayer = tf.layers.dense({
                units: hiddenNodes[0], 
                inputShape: [inputNodes],
                activation: hiddenActivation
            });
            model.add(inputLayer);
            for(let i=1;i<hiddenNodes.length-1;i++){
                model.add(tf.dense({
                    units: hiddenNodes[i],
                    activation: hiddenActivation
                }));
            }
            const outputLayer = tf.layers.dense({
                units: outputNodes,
                activation: outputActivation
            });
            model.add(outputLayer);
            return model;
        });
    }

    /**
     * predicts the output of the neural network using the input data
     * @param {number[]} inputData the input data of the neural network
     * @returns {number[]} a number[] containing all the output values
     */
    predict(inputData){
        if(!inputData instanceof Array) throw new Error('the input data must be an array of numbers');
        if(inputData.length != this.inputNodes) throw new Error('the input data array must have the same length as the input nodes');
        return tf.tidy(()=>{
            const inputTensor = tf.tensor2d([inputData]);
            const outputTensor = this.model.predict(inputTensor);
            const output = outputTensor.dataSync();
            return output;
        });
    }

    /**
     * formats the NeuralNetwork data to an object so it can be recreated later
     * @returns {Object} an object containing the necessary values to recreate the NeuralNework
     */
    toJson(){
        const json = {}
        for(const key of Object.keys(this)){
            if(key != 'model'){
                json[key] = this[key];
            }
        }
        json.weights = [];
        tf.tidy(()=>{
            const weights = this.model.getWeights();
            for(const weight of weights){
                json.weights.push(weight.arraySync())
            }
        });
        return json;
    }

    /**
     * the possible activation functions used in the neural networks
     */
    static activations = {
        elu: 'elu',
        hardSigmoid: 'hardSigmoid',
        linear: 'linear',
        relu: 'relu',
        relu6: 'relu6',
        selu:  'selu',
        sigmoid: 'sigmoid',
        softmax: 'softmax',
        softplus: 'softplus',
        softsign: 'softsign',
        tanh: 'tanh',
        swish: 'swish',
        mish: 'mish',
    }
}
