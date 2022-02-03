let height = 500;
let width = 1000;
let canvasHeight;
let canvasWidth;
/**
 * fixes the dpi of the canvas
 */
 (function setUp(){
    const canvas = document.getElementById('canvas');
    const dpi = window.devicePixelRatio;
    const styleHeight = Number(getComputedStyle(canvas).getPropertyValue("height").slice(0,-2));
    const styleWidth = Number(getComputedStyle(canvas).getPropertyValue("width").slice(0,-2));
    canvas.setAttribute('height', styleHeight * dpi);
    canvas.setAttribute('width', styleWidth * dpi); 
    canvasHeight = canvas.getAttribute('height');
    canvasWidth = canvas.getAttribute('width');
    tf.setBackend('cpu');
})();


window.addEventListener('resize', ()=>{
    const canvas = document.getElementById('canvas');
    canvasHeight = canvas.getAttribute('height');
    canvasWidth = canvas.getAttribute('width');
})