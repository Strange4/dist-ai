/**
 * returns a random value between the specified min and max
 * @param {number} min the min value of the range (inclusive)
 * @param {number} max the max of the range (exclusive)
 * @returns a random number between that range
 */
 function random(min, max){
    return Math.random() * (max-min) + min;
}
/**
 * calculates a random value with a mean of 0 and standard deviation of 1
 * @returns the random value
 */
function randomGauss() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}
