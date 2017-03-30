let phoenixCanvas = document.getElementById('phoenix-canvas'),
    phoenixContext = phoenixCanvas.getContext('2d'),
    phoenixImg = document.getElementById('phoenix-sprite');

let el = document.getElementsByTagName('body')[0];
let phoenixPossitionX = 125;
let phoenixPossitiony = 125;
let flyDirection = 0;
let speed = 5

el.onkeydown = function(event){
    if (event.keyCode === 37) { // flyLeft
        phoenixPossitionX -= speed;
        flyDirection = 1;
    }
    if (event.keyCode === 38) { // flyUp
        phoenixPossitiony -= speed;
        flyDirection = 3;
    }
    if (event.keyCode === 39) { // flyRight
        phoenixPossitionX += speed;
        flyDirection = 2;
    }
    if (event.keyCode === 40) { // flyDown
        phoenixPossitiony += speed;
        flyDirection = 0;
    }
}

// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

let frameIndex = 0,
    framesCount = 4;
 
let gameLoopRate = 5,
    loopCount = 0;

function fly(){

    phoenixContext.clearRect(
        phoenixPossitionX - 5,
        phoenixPossitiony - 5,
        (phoenixImg.width / framesCount) + 20,
        phoenixImg.height + 20
    );

    phoenixContext.drawImage(
        phoenixImg,
        frameIndex * phoenixImg.width / framesCount,
        flyDirection * phoenixImg.height / framesCount,
        phoenixImg.width / framesCount,
        phoenixImg.height / framesCount,
        phoenixPossitionX,
        phoenixPossitiony,
        phoenixImg.width / framesCount,
        phoenixImg.height / framesCount
    );
    loopCount += 1;

    if (loopCount >= gameLoopRate) {
        loopCount = 0;
        

        frameIndex += 1;

        if (frameIndex >= framesCount) {
            frameIndex = 0;
        }
    }
    window.requestAnimationFrame(fly);
}

fly();

