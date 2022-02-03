# dist-ai

## An evolutionary flappy Bird AI using distributed systems over the web

---
## Getting Started
    npm run start
- open on a browser at local host 3000

### What it's doing
- using multiple clients over the web to simulate more  AI's and achieve the goal faster with their combined computing power. **This is a parallel computing system and not a computer cluster over the web**

### How it works

 1. The AI's play the game over 1 generation and then send their data (who was the best) to the server
 2. multiple people can open a browser tab and make the AI play
 3. The server determines the best birds of all the received birds from the clients
 4. The server sends out the best birds from it's collection
