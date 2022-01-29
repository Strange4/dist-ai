describe('testing basic initializaion', ()=>{
    it('initialize with normal values', ()=>{
        const nn = new NeuralNetwork(2, [2], 2, NeuralNetwork.activations.relu, NeuralNetwork.activations.sigmoid);
        const expectedFormat = {
            inputNodes: 2,
            hiddenNodes: [2],
            outputNodes: 2,
            hiddenActivation: NeuralNetwork.activations.relu,
            outputActivation: NeuralNetwork.activations.sigmoid
        }
        const outputFormat = nn.toJson();
        expect(outputFormat.inputNodes).toEqual(expectedFormat.inputNodes);
        expect(outputFormat.hiddenNodes).toEqual(expectedFormat.hiddenNodes);
        expect(outputFormat.outputNodes).toEqual(expectedFormat.outputNodes);
        expect(outputFormat.hiddenActivation).toEqual(expectedFormat.hiddenActivation);
        expect(outputFormat.outputActivation).toEqual(expectedFormat.outputActivation);
    });
});