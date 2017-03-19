let circles = [],
    rad = 5,
    len = 6;
let centerCirc, rads = 5, speed = 0.02;
function setup(){
    background(255);
    createCanvas(100,100);
    centerCirc = new Circle(50,50,10,10);
    for (let i = 0; i < len; i++) {
        rads +=5;
        speed += 0.01;
        circles.push(new Circle(0,0,rad,rad,rads,speed));
        rad+=2;
    }
}
 function draw() {
    background(255);
    push();
    fill(45);
    centerCirc.show();
    pop();
     for (let i = 0; i < circles.length; i++) {
         circles[i].show();
         circles[i].colors();
         if(i % 2 === 0){
             circles[i].move(0.02,10);
         } else {
             circles[i].move(0.08,20);
         }
     }
 }


