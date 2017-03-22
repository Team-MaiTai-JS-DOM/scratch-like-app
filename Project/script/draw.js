let pic1, setPics = [], logicOperations = [];
function preload() {
    pic1 = loadImage('img/darth.png');
}
function setup() {
    let canvas = createCanvas(600,600);
    canvas.parent('canvas-holder');
}
function draw() {
    background(210);

    if(operate){
        operate = false;
        for (let i = 0; i < logicOperations.length; i++) {
            logicOperations[i]();
        }
    }

    drawSprites();
}
