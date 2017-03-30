'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////
//////////////
////                IMAGE REFERENCE OBJECTS CREATED HERE
//////////////
/////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


var StaticInventoryIMGrefBlock = function (_CodingBlock) {
    _inherits(StaticInventoryIMGrefBlock, _CodingBlock);

    function StaticInventoryIMGrefBlock(img, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed) {
        _classCallCheck(this, StaticInventoryIMGrefBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'SPRITE')], true, false);

        var top = currentOffsetInInventory + shapesWallsWidth - heightOfBumb;

        var _this = _possibleConstructorReturn(this, (StaticInventoryIMGrefBlock.__proto__ || Object.getPrototypeOf(StaticInventoryIMGrefBlock)).call(this, corpse, svg, staticShapesLeftMargin, currentOffsetInInventory, 'static'));

        _this.body.moveFirstBar(shapesWallsWidth * 4 + heightOfBumb);

        _this.img = img;

        _this.XonCanvas = startingXonCanvas;
        _this.YonCanvas = startingYonCanvas;

        _this.imgWidth = imgOnCanvasDimensions.width;
        _this.imgHeight = imgOnCanvasDimensions.height;

        _this.upRequested = false;
        _this.downRequested = false;
        _this.leftRequested = false;
        _this.rightRequested = false;

        _this.speed = speed;

        _this.localStepAmount = stepAmount / _this.speed;

        _this.IneedToAnimatedMove = false;

        _this.animCounter = _this.speed;
        _this.animIsRunning = false;

        // create the refence shapes and add them to inventory
        var self = _this;

        allAnimationEventListeners.push(self);

        // STEP LEFT
        _this.moveUpBlock = new StaticInventoryStepUPBlock(self);
        _this.moveUpBlock.container.style.top = top + 'px';
        _this.moveUpBlock.container.style.left = staticShapesLeftMargin + shapesWallsWidth + 'px';
        top += shapesWallsWidth;

        _this.moveDownBlock = new StaticInventoryStepDownBlock(self);
        _this.moveDownBlock.container.style.top = top + 'px';
        _this.moveDownBlock.container.style.left = staticShapesLeftMargin + shapesWallsWidth + 'px';
        top += shapesWallsWidth;

        _this.moveLeftBlock = new StaticInventoryStepLeftBlock(self);
        _this.moveLeftBlock.container.style.top = top + 'px';
        _this.moveLeftBlock.container.style.left = staticShapesLeftMargin + shapesWallsWidth + 'px';
        top += shapesWallsWidth;

        _this.moveRightBlock = new StaticInventoryStepRightBlock(self);
        _this.moveRightBlock.container.style.top = top + 'px';
        _this.moveRightBlock.container.style.left = staticShapesLeftMargin + shapesWallsWidth + 'px';

        currentOffsetInInventory -= shapesWallsWidth + heightOfBumb;
        return _this;
    }

    _createClass(StaticInventoryIMGrefBlock, [{
        key: 'stepUp',
        value: function stepUp() {
            this.upRequested = true;
        }
    }, {
        key: 'stepDown',
        value: function stepDown() {
            this.downRequested = true;
        }
    }, {
        key: 'stepLeft',
        value: function stepLeft() {
            this.leftRequested = true;
        }
    }, {
        key: 'stepRight',
        value: function stepRight() {
            this.rightRequested = true;
        }
    }, {
        key: 'animateTo',
        value: function animateTo() {

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
    }, {
        key: 'draw',
        value: function draw() {
            ctx2D.drawImage(this.img, this.XonCanvas, this.YonCanvas, this.imgWidth, this.imgHeight);
        }
    }]);

    return StaticInventoryIMGrefBlock;
}(CodingBlock);

var StaticInventoryAnimatedIMGrefBlock = function (_StaticInventoryIMGre) {
    _inherits(StaticInventoryAnimatedIMGrefBlock, _StaticInventoryIMGre);

    function StaticInventoryAnimatedIMGrefBlock(img, div, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed, animationSpeed, gridDimensions, indexesOfDirections, indexOfMainPose) {
        _classCallCheck(this, StaticInventoryAnimatedIMGrefBlock);

        var _this2 = _possibleConstructorReturn(this, (StaticInventoryAnimatedIMGrefBlock.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock)).call(this, img, startingXonCanvas, startingYonCanvas, imgOnCanvasDimensions, stepAmount, speed));

        _this2.gridWidth = gridDimensions.width;
        _this2.gridHeight = gridDimensions.height;

        _this2.animationSpeed = animationSpeed;

        _this2.animationCounterTop = _this2.animationSpeed * 1000;
        _this2.animationCounter;

        _this2.spriteWidth = img.width;
        _this2.spriteHeight = img.height;

        _this2.widthOfOnePose = _this2.spriteWidth / _this2.gridWidth;
        _this2.HeightOfOnePose = _this2.spriteHeight / _this2.gridHeight;

        // positionate the background to show the main pose 
        _this2.mainPoseX = indexOfMainPose.X * _this2.widthOfOnePose;
        _this2.mainPoseY = indexOfMainPose.Y * _this2.widthOfOnePose;

        var scaleXofTheBackgrnd = 128 / widthOfOnePose * spriteWidth;
        var scaleYofTheBackgrnd = 128 / heightOfOnePose * spriteHeight;

        console.log('this.mainPoseX ' + _this2.mainPoseX + ' this.mainPoseY ' + _this2.mainPoseY);
        document.getElementById(containerImgId).style.backgroundSize = '' + scaleXofTheBackgrnd + 'px ' + scaleYofTheBackgrnd + 'px';
        document.getElementById(containerImgId).style.backgroundPosition = '' + _this2.mainPoseX + 'px ' + _this2.mainPoseY + 'px';

        _this2.top_LookingRow = indexesOfDirections.top;
        _this2.topRight_LookingRow = indexesOfDirections.topRight;
        _this2.right_LookingRow = indexesOfDirections.right;
        _this2.rightDown_LookingRow = indexesOfDirections.rightDown;
        _this2.down_LookingRow = indexesOfDirections.down;
        _this2.downLeft_LookingRow = indexesOfDirections.downLeft;
        _this2.left_LookingRow = indexesOfDirections.left;
        _this2.leftTop_LookingRow = indexesOfDirections.leftTop;

        _this2.animationRequested = false;

        _this2.animationCurrentFrame = 0;

        _this2.currentDirection = _this2.down_LookingRow;

        var self = _this2;

        var mainPoseX = _this2.mainPoseX;
        var mainPoseY = _this2.mainPoseY;

        // Expand the refence shapes
        return _this2;
    }

    // i should have put those rotations to the upper sprite, but it is used only for backgrounds and somehow doesnt fit the purpose (how would it look to rotate 2D background?!)


    _createClass(StaticInventoryAnimatedIMGrefBlock, [{
        key: 'rotateTo',
        value: function rotateTo(direction) {
            switch (direction) {
                case 'up':
                    this.currentDirection = this.top_LookingRow;
                    break;
                case 'down':
                    this.currentDirection = this.down_LookingRow;
                    break;
                case 'left':
                    this.currentDirection = this.left_LookingRow;
                    break;
                case 'right':
                    this.currentDirection = this.right_LookingRow;
                    break;
                //-------------------------
                case 'topLeft':
                    this.currentDirection = this.leftTop_LookingRow;
                    break;
                case 'topRight':
                    this.currentDirection = this.topRight_LookingRow;
                    break;
                case 'downLeft':
                    this.currentDirection = this.downLeft_LookingRow;
                    break;
                case 'downRight':
                    this.currentDirection = this.rightDown_LookingRow;
            }
        }
    }, {
        key: 'goTowardCurrentDirection',
        value: function goTowardCurrentDirection() {
            switch (this.currentDirection) {
                case this.top_LookingRow:
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'moveUp', this).call(this);
                    break;
                case this.topRight_LookingRow:
                    this.upRequested = true;
                    this.rightRequested = true;
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'move', this).call(this);
                    break;

                case this.right_LookingRow:
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'moveRight', this).call(this);
                    break;
                case this.rightDown_LookingRow:
                    this.downRequested = true;
                    this.rightRequested = true;
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'move', this).call(this);
                    break;
                //-------------------------
                case this.down_LookingRow:
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'moveDown', this).call(this);
                    break;
                case this.downLeft_LookingRow:
                    this.downRequested = true;
                    this.leftRequested = true;
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'move', this).call(this);
                    break;

                case this.left_LookingRow:
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'moveLeft', this).call(this);
                    break;
                case this.leftTop_LookingRow:
                    this.leftRequested = true;
                    this.topRequested = true;
                    _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'move', this).call(this);
            }
        }
    }, {
        key: 'animationPlay',
        value: function animationPlay() {
            // just to be sure not weird artifacts happen
            if (!this.animationRequested) {
                this.animationCurrentFrame = 0;
                this.animationRequested = true;
            }
        }
    }, {
        key: 'animateTo',
        value: function animateTo() {
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
            _get(StaticInventoryAnimatedIMGrefBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryAnimatedIMGrefBlock.prototype), 'animateTo', this).call(this);
        }
    }, {
        key: 'draw',
        value: function draw() {
            ctx2D.drawImage(this.img, this.animationCurrentFrame * this.widthOfOnePose, this.currentDirection * this.HeightOfOnePose, this.widthOfOnePose, this.HeightOfOnePose, this.XonCanvas, this.YonCanvas, this.imgWidth, this.imgHeight);
        }
    }, {
        key: 'animationReset',
        value: function animationReset() {
            this.animationCurrentFrame = 0;
            this.animationRequested = false;
        }
    }]);

    return StaticInventoryAnimatedIMGrefBlock;
}(StaticInventoryIMGrefBlock);

function repaintAllIMGsOnCanvas() {
    ctx2D.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var draw_i = 0; draw_i < allImageCoddingBlocks.length; draw_i++) {
        allImageCoddingBlocks[draw_i].draw();
    }
    repaintOfCanvasRequestedDueAnimation = false;
    repaintOfCanvasRequestedDueMoving = false;
}

// instances of this Class are created on page loading or when the load button is clicked(no time for such button)

var Sprite = function () {
    function Sprite(spriteImgPath, // path to the image as string
    imgOnCanvasDimensions, stepAmount, speed // if at some moment there are bullets, they will move faster
    ) {
        _classCallCheck(this, Sprite);

        this.spriteContainer = document.createElement('div');
        this.spriteContainer.setAttribute('class', 'sprites');
        spritesDiv.appendChild(this.spriteContainer);

        this.speed = speed;

        this.spriteWidth = imgOnCanvasDimensions.width;
        this.spriteHeight = imgOnCanvasDimensions.height;

        this.stepAmount = stepAmount;

        // make sure we are not loading the image twice
        var imageAlreadyLoaded = false;

        this.image = new Image();

        for (var i = 0; i < allLoadedSpriteImagesAsPaths.length; i++) {
            if (allLoadedSpriteImagesAsPaths[i] === spriteImgPath) {
                imageAlreadyLoaded = true;
                this.image = allLoadedSpriteImagesAsObjects[i];
                break;
            }
        }

        var self = this;

        if (!imageAlreadyLoaded) {
            allLoadedSpriteImagesAsPaths.push(spriteImgPath);
            // first try it this way but if problems, pass this as a variable to the loopback

            this.image.src = spriteImgPath;

            this.image.onload = function () {
                allLoadedSpriteImagesAsObjects.push(self.image);
            };
        }

        this.spriteContainer.style.backgroundImage = 'url(\'' + spriteImgPath + '\')';

        // add listener to create new ImgReferenceCoddingBlock
        this.spriteContainer.addEventListener('click', function () {
            self.drawImage();
        });
    }

    _createClass(Sprite, [{
        key: 'drawImage',
        value: function drawImage() {
            var centeredX = canvasWidth / 2 - this.spriteWidth / 2;
            var centeredY = canvasHeight / 2 - this.spriteHeight / 2;

            this.createNewImgRefCoddingBlock(centeredX, centeredY);
        }
    }, {
        key: 'createNewImgRefCoddingBlock',
        value: function createNewImgRefCoddingBlock(centeredX, centeredY) {
            // create its programming representation inside the inventory div
            allImageCoddingBlocks.push(new StaticInventoryIMGrefBlock(this.image, centeredX, centeredY, { width: this.spriteWidth, height: this.spriteHeight }, this.stepAmount, this.speed));

            allImageCoddingBlocks[allImageCoddingBlocks.length - 1].draw();
        }
    }]);

    return Sprite;
}();

// instances of this are created on loading time or load button, but this one loads animated sprites


var AnimatedSprite = function (_Sprite) {
    _inherits(AnimatedSprite, _Sprite);

    function AnimatedSprite(spriteImgPath, imgOnCanvasDimensions, stepAmount, speed, gridDimensions, indexesOfDirections, indexOfMainPose) {
        _classCallCheck(this, AnimatedSprite);

        var _this3 = _possibleConstructorReturn(this, (AnimatedSprite.__proto__ || Object.getPrototypeOf(AnimatedSprite)).call(this, spriteImgPath, imgOnCanvasDimensions, stepAmount, speed));

        var gridWidth = gridDimensions.width;
        var gridHeight = gridDimensions.height;

        var widthOfOnePose = _this3.image.width / gridDimensions.width;
        var heightOfOnePose = _this3.image.height / gridDimensions.height;

        // positionate the background to show the main pose 
        _this3.mainPoseX = indexOfMainPose.X * widthOfOnePose;
        _this3.mainPoseY = indexOfMainPose.Y * widthOfOnePose;

        var scaleXofTheBackgrnd = 128 / widthOfOnePose * _this3.spriteWidth;
        var scaleYofTheBackgrnd = 128 / heightOfOnePose * _this3.spriteHeight;

        console.log('this.mainPoseX ' + _this3.mainPoseX + ' this.mainPoseY ' + _this3.mainPoseY);
        _this3.spriteContainer.style.backgroundSize = '' + scaleXofTheBackgrnd + 'px ' + scaleYofTheBackgrnd + 'px';
        _this3.spriteContainer.style.backgroundPosition = '' + indexOfMainPose.X * widthOfOnePose + 'px ' + indexOfMainPose.Y * widthOfOnePose + 'px';

        return _this3;
    }

    _createClass(AnimatedSprite, [{
        key: 'createNewImgRefCoddingBlock',
        value: function createNewImgRefCoddingBlock(centeredX, centeredY) {
            // create its programming representation inside the inventory div
            allImageCoddingBlocks.push(new StaticInventoryAnimatedIMGrefBlock(this.image, this.spriteContainer, centeredX, centeredY, { width: this.spriteWidth, height: this.spriteHeight }, this.stepAmount, this.speed,
            // additional parameters extending the superclass
            animationSpeed, gridDimensions, indexesOfDirections, // as an object of indexes, explained below
            indexOfMainPose));

            allImageCoddingBlocks[allImageCoddingBlocks.length - 1].draw();
        }
    }]);

    return AnimatedSprite;
}(Sprite);

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
//# sourceMappingURL=sprite.js.map