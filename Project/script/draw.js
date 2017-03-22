let pic1, setPics = [], logicOperations = [];
function preload() {
    pic1 = loadImage('img/darth.png');
}
function setup() {
    createCanvas(600,600);
}
function draw() {
    background(180);

    if(operate){
        operate = false;
        for (let i = 0; i < logicOperations.length; i++) {
            logicOperations[i]();
        }
    }

    drawSprites();
}
