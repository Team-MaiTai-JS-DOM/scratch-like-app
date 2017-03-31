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

        this.draw();
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
            this.animCounter -= 1;
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
    constructor(img,
        startingXonCanvas,
        startingYonCanvas,
        imgOnCanvasDimensions,
        stepAmount,
        speed,
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
        this.animationCounter = 0;

        this.spriteWidth = img.width;
        this.spriteHeight = img.height;

        this.widthOfOnePose = this.spriteWidth / this.gridWidth;
        this.heightOfOnePose = this.spriteHeight / this.gridHeight;

        // positionate the background to show the main pose 
        this.mainPoseX = indexOfMainPose.X * this.widthOfOnePose;
        this.mainPoseY = indexOfMainPose.Y * this.widthOfOnePose;

        let scaleXofTheBackgrnd = (128 / this.widthOfOnePose) * this.spriteWidth;
        let scaleYofTheBackgrnd = (128 / this.widthOfOnePose) * this.spriteHeight;

        this.top_LookingRow = indexesOfDirections.top;
        this.topRight_LookingRow = indexesOfDirections.topRight;
        this.right_LookingRow = indexesOfDirections.right;
        this.rightDown_LookingRow = indexesOfDirections.rightDown;
        this.down_LookingRow = indexesOfDirections.down;
        this.downLeft_LookingRow = indexesOfDirections.downLeft;
        this.left_LookingRow = indexesOfDirections.left;
        this.leftTop_LookingRow = indexesOfDirections.leftTop;

        this.animationCurrentFrame = 0;
        this.newDirection = 0;

        this.animatingNow = false;

        this.currentDirection = this.down_LookingRow;

        let self = this;

        let mainPoseX = this.mainPoseX;
        let mainPoseY = this.mainPoseY;

        //////////////////////////////////////////////////////////////////

        // please later pass the name nad the action function as arguments. now there is no time but later...
        this.body.moveFirstBar(shapesWallsWidth * 5 + heightOfBumb);

        let top = currentOffsetInInventory - shapesWallsWidth * 2;

        this.animateBlock = new StaticInventoryAnimateBlock(self);
        this.animateBlock.container.style.top = top + 'px';
        this.animateBlock.container.style.left = (staticShapesLeftMargin + shapesWallsWidth) + 'px';
        //top += shapesWallsWidth;

        currentOffsetInInventory -= shapesWallsWidth;

        this.draw();
    }

    // i should have put those rotations to the upper sprite, but it is used only for backgrounds and somehow doesnt fit the purpose (how would it look to rotate 2D background?!)
    lookAt(direction) {
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

    // NOTE in real life, this logic should be implemented throuch block, now we are cheating a little bit
    rotateRegardArrows() {
        if (this.leftRequested && !this.rightRequested) {
            if (this.upRequested && !this.downRequested) {
                this.newDirection = this.leftTop_LookingRow;
            } else if (!this.upRequested && this.downRequested) {
                this.newDirection = this.downLeft_LookingRow;
            } else {
                this.newDirection = this.left_LookingRow;
            }
        } else if (!this.leftRequested && this.rightRequested) {
            if (!this.upRequested && this.downRequested) {
                this.newDirection = this.rightDown_LookingRow;
            } else if (this.upRequested && !this.downRequested) {
                this.newDirection = this.topRight_LookingRow;
            } else {
                this.newDirection = this.right_LookingRow;
            }
        } else if (!this.upRequested && this.downRequested) {
            this.newDirection = this.down_LookingRow;
        } else if (this.upRequested && !this.downRequested) {
            this.newDirection = this.top_LookingRow;
        }

        if (this.newDirection != this.currentDirection) {
            this.animationCurrentFrame = 0;
            this.currentDirection = this.newDirection;
        }
    }

    animationPlay() {
        // just to be sure not weird artifacts happen
        if (!this.animatingNow) {

            if (this.animationCounter + 1 >= this.animationCounterTop) {
                this.animationCounter = 0;
            } else {
                this.animationCounter += 1;
            }

            if (this.animationCounter % this.animationSpeed == 0) {
                if (this.animationCurrentFrame >= this.gridWidth - 1) {
                    this.animationCurrentFrame = 0;
                } else {
                    this.animationCurrentFrame += 1;
                }
                repaintOfCanvasRequestedDueAnimation = true;
            }
            this.animatingNow = true;
        }
    }

    animateTo() {
        this.rotateRegardArrows();  // cheating for the presentation :p

        super.animateTo();

        this.animatingNow = false;

        if (!this.IneedToAnimatedMove)
            this.animationReset();
    }

    draw() {
        ctx2D.drawImage(this.img,
                        this.animationCurrentFrame * this.widthOfOnePose, this.currentDirection * this.heightOfOnePose,
                        this.widthOfOnePose, this.heightOfOnePose,
                        this.XonCanvas, this.YonCanvas,
                        this.imgWidth, this.imgHeight);
    }

    animationReset() {
        this.animationCurrentFrame = 0;
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
        imgOnCanvasX,
        stepAmount, speed  // if at some moment there are bullets, they will move faster
        ) {

        this.spriteContainer = document.createElement('div');
        this.spriteContainer.setAttribute('class', 'sprites');
        spritesDiv.appendChild(this.spriteContainer);

        this.speed = speed;

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

        this.spriteWidth = 0;
        this.spriteHeight = 0;

        let self = this;
        this.spriteImgPath = spriteImgPath;

        this.imgOnCanvasX = imgOnCanvasX;

        if (!imageAlreadyLoaded) {
            allLoadedSpriteImagesAsPaths.push(spriteImgPath);
            // first try it this way but if problems, pass this as a variable to the loopback

            this.image.src = spriteImgPath;

            this.image.onload = function () {
                allLoadedSpriteImagesAsObjects.push(self.image);

                self.spriteWidth = self.imgOnCanvasX;
                self.spriteHeight = self.spriteWidth * (self.image.height / self.image.width);

                self.spriteContainer.style.backgroundImage = 'url(\'' + self.spriteImgPath + '\')';

                // add listener to create new ImgReferenceCoddingBlock
                self.spriteContainer.addEventListener('click', function () {
                    self.drawImage();
                });
            }
        }
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
    }
}

// instances of this are created on loading time or load button, but this one loads animated sprites
class AnimatedSprite extends Sprite {
    constructor(spriteImgPath,
        imgOnCanvasX,
        stepAmount,
        speed,
        animationSpeed,
        gridDimensions,
        indexesOfDirections, 
        indexOfMainPose,
        xCorr, yCorr) {

        super(spriteImgPath, imgOnCanvasX, stepAmount, speed);

        this.animationSpeed = animationSpeed;
        this.gridDimensions = gridDimensions;
        this.indexesOfDirections = indexesOfDirections;
        this.indexOfMainPose = indexOfMainPose;

        let widthOfOnePose = this.image.width / this.gridDimensions.width;
        let heightOfOnePose = this.image.height / this.gridDimensions.height;

        let scaleXofTheBackgrnd = (128 / widthOfOnePose) * this.image.width;
        let scaleYofTheBackgrnd = (128 / heightOfOnePose) * this.image.height;

        this.spriteContainer.style.backgroundSize = '' + scaleXofTheBackgrnd + 'px ' + scaleYofTheBackgrnd + 'px';
        this.spriteContainer.style.backgroundPosition = '' + (-(indexOfMainPose.X * widthOfOnePose + xCorr)) + 'px ' + (-(indexOfMainPose.Y * heightOfOnePose + yCorr)) + 'px';

    }

    createNewImgRefCoddingBlock(centeredX, centeredY) {
        // create its programming representation inside the inventory div
        allImageCoddingBlocks.push(new StaticInventoryAnimatedIMGrefBlock(this.image,
                                                                  centeredX,
                                                                  centeredY,
                                                                { width: this.spriteWidth, height: this.spriteHeight },
                                                                  this.stepAmount,
                                                                  this.speed,
                                                                  // additional parameters extending the superclass
                                                                  this.animationSpeed,
                                                                  this.gridDimensions,
                                                                  this.indexesOfDirections, // as an object of indexes, explained below
                                                                  this.indexOfMainPose
                                                                  ));
    }
}

var horseTest = new AnimatedSprite('img/horse.png',
                                    180,
                                    5,
                                    10,
                                    10,
                                  { width: 4, height: 4 },
                                {
                                    top: 3,
                                    topRight: 3,
                                    right: 2,
                                    rightDown: 0,
                                    down: 0,
                                    downLeft: 0,
                                    left: 1,
                                    leftTop: 3
                                },
                                { X: 0, Y: 2 }, 0, 64);

var pi4Test = new AnimatedSprite('img/pi4.png',
                                    80,
                                    7,
                                    10,
                                    5,
                                  { width: 8, height: 8 },
                                {
                                    top: 7,
                                    topRight: 6,
                                    right: 5,
                                    rightDown: 2,
                                    down: 1,
                                    downLeft: 0,
                                    left: 3,
                                    leftTop: 4
                                },
                                { X: 0, Y: 1 }, 0, 25);


var tankTest = new Sprite('img/tank.png', 80, 5, 10);
var carTest = new Sprite('img/car.png', 80, 5, 10);
var backgroundTest = new Sprite('img/field.png', canvasWidth*5, 5, 20);

var backgroundTest = new Sprite('img/pan.png', canvasWidth * 2, 5, 20);

resize();