let pic;let setPics = [];
function setup() {
    createCanvas(600,600);
    pic = loadImage('img/darth.png');
}
function draw() {
    background(180);
    for (let i = 0; i < setPics.length; i++) {
        image(setPics[i], 100,100);
    }

}
