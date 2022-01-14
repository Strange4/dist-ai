const Game = {};


/**
 * stopes the main game loop
 */
 Game.stop = function(){
    clearInterval(Game._intervalId);
}

/**
 * runs the game loop (update and draw)
 * @param {Object} global the global variables that are not reset after each game loop
 */
 Game.run = function(global){
    try{
        if(Game.goal(global)){
            Game.update(global);
            Game.nextGeneration(global);
            dispatchGenerationEvent(global);
            Game.over(global);
            Game.stop();
            endConnection(socket, 4999, 'game finished');
        } else {
            Game.update(global);
            Game.draw(global);
            dispathGameLoopEvent(global);
        }
    } catch (error){
        console.error(error);
        Game.stop();
    }  
}

function dispathGameLoopEvent(global){
    const event = new CustomEvent('game-loop', {detail: global});
    const elements = document.querySelectorAll('.game-loop-listener');
    for(const element of elements){
        element.dispatchEvent(event);
    }
}