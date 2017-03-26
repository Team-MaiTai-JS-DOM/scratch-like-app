window.addEventListener('load', function () {

var elementCanvas = document.getElementById('elementCanvas');
var elementContext = elementCanvas.getContext('2d');
var elementImage = document.getElementById('element');
// var btn = document.getElementById('flowerBtn');

let frameIndex = 0;
let repeatSpeed = 0;


var WIDTH = 512,
    HEIGHT = WIDTH / 2;

elementCanvas.width = WIDTH;
elementCanvas.height = HEIGHT;

var rows = 4;
var frames = 3;
var elementStraightSprite = createSprite({
    spritesheet: elementImage,
    width: elementImage.width / frames,
    height: elementImage.height / rows,
    rowIndex:0,
    spritesheetRows:rows,
    context: elementContext,
    numberOfFrames: frames,
    loopTicksPerFrame: 7
});

var elementRightSprite = createSprite({
    spritesheet: elementImage,
    context: elementContext,
    width: elementImage.width / frames,
    height: elementImage.height / rows,
    rowIndex:2,
    spritesheetRows:rows,
    numberOfFrames: frames,
    loopTicksPerFrame: 7
});

var elementLeftSprite = createSprite({
    spritesheet: elementImage,
    context: elementContext,
    width: elementImage.width / frames,
    height: elementImage.height / rows,
    rowIndex:1,
    spritesheetRows:rows,
    numberOfFrames: frames,
    loopTicksPerFrame: 7
});

var elementUpSprite = createSprite({
    spritesheet: elementImage,
    context: elementContext,
    width: elementImage.width / frames,
    height: elementImage.height / rows,
    rowIndex:3,
    spritesheetRows:rows,
    numberOfFrames: frames,
    loopTicksPerFrame: 7
});

let elementSprite=elementStraightSprite;

var elementBody = createPhysicalBody({
    defaultAcceleration: { x: 2, y: 2 },
//    coordinates: { x: 10, y: HEIGHT - elementStraightSprite.height },
    coordinates: { x: 150, y: 50 },
    speed: { x: 0, y: 0 },
    height: elementStraightSprite.height,
    width: elementStraightSprite.width
});

// function animationLoop() {
// var lastelementCoordinates;
//
// lastelementCoordinates = elementBody.move();
//
// elementSprite
//     .render(elementBody.coordinates, lastelementCoordinates)
//     .update();
//
//
// window.requestAnimationFrame(animationLoop);
// };
//
// animationLoop();
// });


// window.addEventListener('keydown', function (event) {
//
//     switch (event.keyCode) {
//         case 37:
//             if (elementBody.speed.x < 0) {
//                 return;
//             }
//             elementSprite = elementLeftSprite;
//             elementBody.accelerate('x', -1);
//             break;
//         case 38:
//             if (elementBody.speed.y < 0) {
//                 return;
//             }
//             elementSprite = elementUpSprite;
//             elementBody.accelerate('y', -1);
//             break;
//         case 39:
//             if (elementBody.speed.x > 0) {
//                 return;
//             }
//             elementSprite = elementRightSprite;
//             elementBody.accelerate('x', 1);
//             break;
//         case 40:
//             if (elementBody.speed.y > 0) {
//                 return;
//             }
//             elementSprite = elementStraightSprite;
//             elementBody.accelerate('y', 1);
//             break;
//         default:
//             break;
//     }
// });

function moveTo(dir, count) {
for (let i=1; i<=count; i+=1) {
  console.log(elementBody.speed.x + 'test');
    switch (dir) {
        case 'l':
            if (elementBody.speed.x < 0) {
                break;
            }
            elementSprite = elementLeftSprite;
            elementBody.speed.x -= 1;
            break;
        case 'u':
            if (elementBody.speed.y < 0) {
                break;
            }
            elementSprite = elementUpSprite;
            elementBody.speed.y -= 1;
            break;
        case 'r':
            if (elementBody.speed.x > 0) {
                break;
            }
            elementSprite = elementRightSprite;
            elementBody.speed.x += 1;
            break;
        case 'd':
            if (elementBody.speed.y > 0) {
                break;
            }
            elementSprite = elementStraightSprite;
            elementBody.speed.y += 1;
            break;
        default:
            break;
    };
    console.log(i);
  };

setTimeout(function() {
  elementBody.speed.x = 0;
  elementBody.speed.y = 0;
  elementSprite = elementStraightSprite;
}, (count*200));
};

moveTo('l', 3);

// window.addEventListener('keyup', function (event) {
//     elementBody.speed.x = 0;
//     elementBody.speed.y = 0;
//     elementSprite = elementStraightSprite;
// });

// function moveTo(count) {
//   var i=0;
//   while (i<count) {
//     if (elementBody.speed.x > 0) {
//         return;
//     }
//     elementSprite = elementStraightSprite;
//     elementBody.speed.x = 1;
//     elementBody.coordinates.x+=5;
//     i+=1;
//     console.log(elementBody.speed.x);
//   };
//
//   elementBody.speed.x = 0;
//   elementBody.speed.y = 0;
//   console.log(elementBody.speed.x);
// };
//
// moveTo(1);

function animationLoop() {
var lastelementCoordinates;

lastelementCoordinates = elementBody.move(5);

elementSprite
    .render(elementBody.coordinates, lastelementCoordinates)
    .update();


window.requestAnimationFrame(animationLoop);
};
animationLoop();
});
