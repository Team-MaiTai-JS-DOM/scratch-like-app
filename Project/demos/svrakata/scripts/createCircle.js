function Circle(x, y, w, h, rads, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rad = rads;
    this.angle = 0;
    this.speed = speed;
    this.show = function () {
        ellipse(this.x, this.y, this.w, this.h);
    };
    this.colors = function () {
        fill(190,80);
        stroke(0);
    };
    this.move = function () {
        this.angle += this.speed;
        this.x = 50 + Math.cos(this.angle) * this.rad;
        this.y = 50 + Math.sin(this.angle) * this.rad;
    }
}
