/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////
//////////////
////                IMAGE REFERENCE OBJECTS CREATED HERE
//////////////
/////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


class StaticInventoryIMGrefBlock extends CodingBlock {
    constructor(img, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed) {

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'SPRITE')], true, false);

        let top = currentOffsetInInventory + shapesWallsWidth - heightOfBumb;

        super(corpse, svg, staticShapesLeftMargin, currentOffsetInInventory, 'static');

        this.body.moveFirstBar(shapesWallsWidth * 4 + heightOfBumb);

        this.img = img;

        this.XonCanvas = startingXonCanvas;
        this.YonCanvas = startingYonCanvas;

        this.imgWidth = imgOnCanvasDimensions.width;
        this.imgHeight = imgOnCanvasDimensions.height;

        this.upRequested = false;
        this.downRequested = false;
        this.leftRequested = false;
        this.rightRequested = false;

        this.speed = speed;

        this.localStepAmount = stepAmount / this.speed;

        this.IneedToAnimatedMove = false;

        this.animCounter = this.speed;
        this.animIsRunning = false;

        // create the refence shapes and add them to inventory
        let self = this;

        allAnimationEventListeners.push(self);

        // STEP LEFT
        this.moveUpBlock = new StaticInventoryStepUPBlock(self);
        this.moveUpBlock.container.style.top = top + 'px';
        this.moveUpBlock.container.style.left = (staticShapesLeftMargin + shapesWallsWidth) + 'px';
        top += shapesWallsWidth;

        this.moveDownBlock = new StaticInventoryStepDownBlock(self);
        this.moveDownBlock.container.style.top = top + 'px';
        this.moveDownBlock.container.style.left = (staticShapesLeftMargin + shapesWallsWidth) + 'px';
        top += shapesWallsWidth;

        this.moveLeftBlock = new StaticInventoryStepLeftBlock(self);
        this.moveLeftBlock.container.style.top = top + 'px';
        this.moveLeftBlock.container.style.left = (staticShapesLeftMargin + shapesWallsWidth) + 'px';
        top += shapesWallsWidth;

        this.moveRightBlock = new StaticInventoryStepRightBlock(self);
        this.moveRightBlock.container.style.top = top + 'px';
        this.moveRightBlock.container.style.left = (staticShapesLeftMargin + shapesWallsWidth) + 'px';

        currentOffsetInInventory -= shapesWallsWidth + heightOfBumb;
    }

    stepUp() {
        this.upRequested = true;
    }

    stepDown() {
        this.downRequested = true;
    }

    stepLeft() {
        this.leftRequested = true;
    }

    stepRight() {
        this.rightRequested = true;
    }

    animateTo() {

        this.IneedToAnimatedMove = false;

        // avoid conflicts
        if (this.upRequested && !this.downRequested) {
            this.YonCanvas -= this.localStepAmount;
            this.IneedToAnimatedMove = true;
        } else if (!this.upRequested && this.downRequested) {
            this.YonCanvas += this.localStepAmount;
            this.IneedToAnimatedMove = true;
        }

        if (this.rightRequested && !this.leftRequested) {
            this.XonCanvas += this.localStepAmount;
            this.IneedToAnimatedMove = true;
        } else if (!this.rightRequested && this.leftRequested) {
            this.XonCanvas -= this.localStepAmount;
            this.IneedToAnimatedMove = true;
        }

        if (this.IneedToAnimatedMove) {
            this.animCounter = this.speed;
        }

        if (this.animCounter > 0) {
            repaintOfCanvasRequestedDueMoving = true;
            this.animIsRunning -= 1;
        }

        this.upRequested = false;
        this.downRequested = false;
        this.leftRequested = false;
        this.rightRequested = false;
    }

    draw() {
        ctx2D.drawImage(this.img, this.XonCanvas, this.YonCanvas, this.imgWidth, this.imgHeight);
    }
}

class StaticInventoryAnimatedIMGrefBlock extends StaticInventoryIMGrefBlock {
    constructor(img, div, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed,
        animationSpeed,
        gridDimensions,
        indexesOfDirections,
        indexOfMainPose
        ) {
        super(img, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed);

        this.gridWidth = gridDimensions.width;
        this.gridHeight = gridDimensions.height;

        this.animationSpeed = animationSpeed;

        this.animationCounterTop = this.animationSpeed * 1000;
        this.animationCounter;

        this.spriteWidth = img.width;
        this.spriteHeight = img.height;

        this.widthOfOnePose = this.spriteWidth / this.gridWidth;
        this.HeightOfOnePose = this.spriteHeight / this.gridHeight;

        // positionate the background to show the main pose 
        this.mainPoseX = indexOfMainPose.X * this.widthOfOnePose;
        this.mainPoseY = indexOfMainPose.Y * this.widthOfOnePose;

        let scaleXofTheBackgrnd = (128 / widthOfOnePose) * spriteWidth;
        let scaleYofTheBackgrnd = (128 / heightOfOnePose) * spriteHeight;

        console.log('this.mainPoseX ' + this.mainPoseX + ' this.mainPoseY ' + this.mainPoseY);
        document.getElementById(containerImgId).style.backgroundSize = '' + scaleXofTheBackgrnd + 'px ' + scaleYofTheBackgrnd + 'px';
        document.getElementById(containerImgId).style.backgroundPosition = '' + this.mainPoseX + 'px ' + this.mainPoseY + 'px';

        this.top_LookingRow = indexesOfDirections.top;
        this.topRight_LookingRow = indexesOfDirections.topRight;
        this.right_LookingRow = indexesOfDirections.right;
        this.rightDown_LookingRow = indexesOfDirections.rightDown;
        this.down_LookingRow = indexesOfDirections.down;
        this.downLeft_LookingRow = indexesOfDirections.downLeft;
        this.left_LookingRow = indexesOfDirections.left;
        this.leftTop_LookingRow = indexesOfDirections.leftTop;

        this.animationRequested = false;

        this.animationCurrentFrame = 0;

        this.currentDirection = this.down_LookingRow;

        let self = this;

        let mainPoseX = this.mainPoseX;
        let mainPoseY = this.mainPoseY;

        // Expand the refence shapes
    }

    // i should have put those rotations to the upper sprite, but it is used only for backgrounds and somehow doesnt fit the purpose (how would it look to rotate 2D background?!)
    rotateTo(direction) {
        switch (direction) {
            case 'up':
                this.currentDirection = this.top_LookingRow;
                break;
            case 'down':
                this.currentDirection = this.down_LookingRow;
                break;
            case 'left':
                this.currentDirection = this.left_LookingRow
                break;
            case 'right':
                this.currentDirection = this.right_LookingRow
                break;
                //-------------------------
            case 'topLeft':
                this.currentDirection = this.leftTop_LookingRow
                break;
            case 'topRight':
                this.currentDirection = this.topRight_LookingRow
                break;
            case 'downLeft':
                this.currentDirection = this.downLeft_LookingRow
                break;
            case 'downRight':
                this.currentDirection = this.rightDown_LookingRow
        }
    }

    goTowardCurrentDirection() {
        switch (this.currentDirection) {
            case this.top_LookingRow:
                super.moveUp();
                break;
            case this.topRight_LookingRow:
                this.upRequested = true;
                this.rightRequested = true;
                super.move();
                break;

            case this.right_LookingRow:
                super.moveRight();
                break;
            case this.rightDown_LookingRow:
                this.downRequested = true;
                this.rightRequested = true;
                super.move();
                break;
                //-------------------------
            case this.down_LookingRow:
                super.moveDown();
                break;
            case this.downLeft_LookingRow:
                this.downRequested = true;
                this.leftRequested = true;
                super.move();
                break;

            case this.left_LookingRow:
                super.moveLeft();
                break;
            case this.leftTop_LookingRow:
                this.leftRequested = true;
                this.topRequested = true;
                super.move();
        }
    }

    animationPlay() {
        // just to be sure not weird artifacts happen
        if (!this.animationRequested) {
            this.animationCurrentFrame = 0;
            this.animationRequested = true;
        }
    }

    animateTo() {
        if (this.animationRequested) {
            if (this.animationCounter + 1 >= this.animationCounterTop) {
                this.animationCounter = 0;
            } else {
                this.animationCounter += 1;
            }

            if (this.animationCounter % this.animationSpeed == 0) {
                if (this.animationCurrentFrame > this.gridWidth) {
                    this.animationCurrentFrame = 0;
                } else {
                    this.animationCurrentFrame += 1;
                }
            }
            repaintOfCanvasRequestedDueAnimation = true;
        }
        super.animateTo();
    }

    draw() {
        ctx2D.drawImage(this.img,
                        this.animationCurrentFrame * this.widthOfOnePose, this.currentDirection * this.HeightOfOnePose,
                        this.widthOfOnePose, this.HeightOfOnePose,
                        this.XonCanvas, this.YonCanvas,
                        this.imgWidth, this.imgHeight);
    }

    animationReset() {
        this.animationCurrentFrame = 0;
        this.animationRequested = false;
    }
}

function repaintAllIMGsOnCanvas() {
    ctx2D.clearRect(0, 0, canvasWidth, canvasHeight);
    for (draw_i = 0; draw_i < allImageCoddingBlocks.length; draw_i++) {
        allImageCoddingBlocks[draw_i].draw();
    }
    repaintOfCanvasRequestedDueAnimation = false;
    repaintOfCanvasRequestedDueMoving = false;
}

// instances of this Class are created on page loading or when the load button is clicked(no time for such button)
class Sprite {
    constructor(spriteImgPath,  // path to the image as string
        imgOnCanvasDimensions,
        stepAmount, speed  // if at some moment there are bullets, they will move faster
        ) {

        this.spriteContainer = document.createElement('div');
        this.spriteContainer.setAttribute('class', 'sprites');
        spritesDiv.appendChild(this.spriteContainer);

        this.speed = speed;

        this.spriteWidth = imgOnCanvasDimensions.width;
        this.spriteHeight = imgOnCanvasDimensions.height;

        this.stepAmount = stepAmount;

        // make sure we are not loading the image twice
        let imageAlreadyLoaded = false;

        this.image = new Image();

        for (let i = 0; i < allLoadedSpriteImagesAsPaths.length; i++) {
            if (allLoadedSpriteImagesAsPaths[i] === spriteImgPath) {
                imageAlreadyLoaded = true;
                this.image = allLoadedSpriteImagesAsObjects[i];
                break;
            }
        }

        let self = this;

        if (!imageAlreadyLoaded) {
            allLoadedSpriteImagesAsPaths.push(spriteImgPath);
            // first try it this way but if problems, pass this as a variable to the loopback

            this.image.src = spriteImgPath;

            this.image.onload = function () {
                allLoadedSpriteImagesAsObjects.push(self.image);
            }
        }

        this.spriteContainer.style.backgroundImage = 'url(\'' + spriteImgPath + '\')';

        // add listener to create new ImgReferenceCoddingBlock
        this.spriteContainer.addEventListener('click', function () {
            self.drawImage();
        });

    }

    drawImage() {
        let centeredX = canvasWidth / 2 - this.spriteWidth / 2;
        let centeredY = canvasHeight / 2 - this.spriteHeight / 2;

        this.createNewImgRefCoddingBlock(centeredX, centeredY);
    }

    createNewImgRefCoddingBlock(centeredX, centeredY) {
        // create its programming representation inside the inventory div
        allImageCoddingBlocks.push(new StaticInventoryIMGrefBlock(this.image, centeredX, centeredY,
                                                                 { width: this.spriteWidth, height: this.spriteHeight }, this.stepAmount, this.speed));

        allImageCoddingBlocks[allImageCoddingBlocks.length - 1].draw();
    }
}

// instances of this are created on loading time or load button, but this one loads animated sprites
class AnimatedSprite extends Sprite {
    constructor(spriteImgPath,
        imgOnCanvasDimensions,
        stepAmount, speed,
        gridDimensions,
        indexesOfDirections,
        indexOfMainPose) {

        super(spriteImgPath, imgOnCanvasDimensions, stepAmount, speed);

        let gridWidth = gridDimensions.width;
        let gridHeight = gridDimensions.height;

        let widthOfOnePose = this.image.width / gridDimensions.width;
        let heightOfOnePose = this.image.height / gridDimensions.height;

        // positionate the background to show the main pose 
        this.mainPoseX = (indexOfMainPose.X * widthOfOnePose);
        this.mainPoseY = (indexOfMainPose.Y * widthOfOnePose);

        let scaleXofTheBackgrnd = (128 / widthOfOnePose) * this.spriteWidth;
        let scaleYofTheBackgrnd = (128 / heightOfOnePose) * this.spriteHeight;

        console.log('this.mainPoseX ' + this.mainPoseX + ' this.mainPoseY ' + this.mainPoseY);
        this.spriteContainer.style.backgroundSize = '' + scaleXofTheBackgrnd + 'px ' + scaleYofTheBackgrnd + 'px';
        this.spriteContainer.style.backgroundPosition = '' + (indexOfMainPose.X * widthOfOnePose) + 'px ' + (indexOfMainPose.Y * widthOfOnePose) + 'px';



    }

    createNewImgRefCoddingBlock(centeredX, centeredY) {
        // create its programming representation inside the inventory div
        allImageCoddingBlocks.push(new StaticInventoryAnimatedIMGrefBlock(this.image, this.spriteContainer, centeredX, centeredY,
                                                                         { width: this.spriteWidth, height: this.spriteHeight }, this.stepAmount, this.speed,
                                                                  // additional parameters extending the superclass
                                                                  animationSpeed,
                                                                  gridDimensions,
                                                                  indexesOfDirections, // as an object of indexes, explained below
                                                                  indexOfMainPose
                                                                  ));

        allImageCoddingBlocks[allImageCoddingBlocks.length - 1].draw();
    }
}

//var horseTest = new AnimatedSprite('img/horse.png', { width: 80, height: 80 }, 5, 10,
//                                  { width: 4, height: 4 },
//                                {
//                                    top: 3,
//                                    topRight: 3,
//                                    right: 2,
//                                    rightDown: 0,
//                                    down: 0,
//                                    downLeft: 0,
//                                    left: 1,
//                                    leftTop: 3
//                                }, { X: 0, Y: 2 });

var tankTest = new Sprite('img/tank.png', { width: 80, height: 80 }, 5, 10);
var carTest = new Sprite('img/car.png', { width: 80, height: 80 }, 5, 10);
var backgroundTest = new Sprite('img/field.png', { width: canvasWidth, height: canvasHeight }, 5, 20);

//var backgroundTest = new Sprite('img/pan.png', { width: canvasWidth, height: canvasHeight }, 5, 20);

resize();