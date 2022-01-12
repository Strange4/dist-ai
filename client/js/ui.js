const generationDisplay = document.getElementById('generation-display');
generationDisplay.addEventListener('next-gen', (e)=>{
    generationDisplay.innerText = `Current generation: ${e.detail.generation}`;
});

const entityCount = document.getElementById('entity-count');
entityCount.addEventListener('game-loop', (e)=>{
    let entitySum = 0;
    const birds = e.detail.birds;
    for(const bird of birds){
        if(!bird.isDead){
            entitySum++;
        }
    }
    entityCount.innerText = `Entity count: ${entitySum}`;
});

const goalProgression = document.getElementById('goal-progression');
goalProgression.addEventListener('next-gen', (e)=>{
    goalProgression.innerText = `Last gen goal progression: ${Math.round((e.detail.pipesPassed / e.detail.goal) * 100) }%`;
})
