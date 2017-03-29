'use strict';

var canvasPreview = document.getElementById('previewCanvas');
var divPreview = document.getElementById('previewDiv');
var divCodeGround = document.getElementById('codeGround');
var inventory = document.getElementById('inventory');
var buttonsDiv = document.getElementById('upperButtonsDiv');
var spritesDiv = document.getElementById('previewSprites');

var buttonsDivHeight = 40;
var canvasPreviewHeight = void 0;
var canvasRatio = 3 / 4;
var canvasHeight = void 0,
    canvasWidth = void 0;
var horizontalBias = 0;
var maxDockingReactionDistance = 50;
var minDockingDistance = 10;
var maxTrashBinReactionDistance = 100;
var trashBinDistDestroy = 70;
var dragging = false;
var creatorMode = false;
var mouseOffsetX = 0;
var mouseOffsetY = 0;
var blockOnFocus = null;
var trashBin = document.getElementById('trashbin');
var trashBinWidth = trashBin.width;
var trashBinHeight = trashBin.height;
var trashBinX = void 0;
var trashBinY = void 0;
var trashBinCenterX = void 0;
var trashBinCenterY = void 0;
var zIndex = void 0;
var staticShapesTopMargin = 20;
var staticShapesLeftMargin = 20;
var currentOffsetInInventory = staticShapesTopMargin;
var startingPosOfTheBlockBeingDragged = void 0;
var currentPosOfTheBlockBeingDragged = void 0;
var endingPosOfTheBlockBeingDragged = void 0;
var positionOfCoddingGround = void 0;
var distToTrashBin = void 0;
var shortestDist = void 0;
var distance = void 0;
var nearestTail = void 0;
var offsetToTailX = void 0;
var offsetToTailY = void 0;
var myContainerPos = void 0;
var dockedParenPosition = void 0;
var programIsRunning = false;
var main_i = void 0;
var postionOfCreator = void 0;
var parentOfDocked = void 0;

var minOpacityForAll = 0.2;
var maxOpacityForAll = 1;

var ctx2D = canvasPreview.getContext('2d');

var uniqueID = 0;

// find the base zeta index of all
var startZIndex = 0;
(function () {
    var elements = document.getElementsByTagName("*");

    for (var i = 0; i < elements.length - 1; i++) {
        if (parseInt(elements[i].style.zIndex) > startZIndex) {
            startZIndex = parseInt(elements[i].style.zIndex);
        }
    }
})();

startZIndex++;

// design of the docking shape
var widthOfDock = 50;
var startOfBumb = 15;
var heightOfBumb = 5;
var lengthOfBumb = widthOfDock - startOfBumb * 2;
var startOfDock = 35;

// design of the body shape
var titlesColor = '#d6d8a0';
var minTopBarWidth = 150;
var shapesWallsWidth = 25;
var bigRadius = 20;
var titleOffsetX = shapesWallsWidth;
var titleOffsetY = 18;
var smallRadius = getSmalRadius(shapesWallsWidth);
var minInputfield = shapesWallsWidth / (8 / 10);

var dockLineWidth = 2;

var blocksColorTransitionStep = 0.08;

canvasPreview.style.left = '0px';

resize();

window.addEventListener('resize', resize, false);

// this is not trash, it will be used later for recalculating the radius of the resized topBar
function getSmalRadius(shapesWallsWidth) {
    return shapesWallsWidth / (25 / 10);
}

function resize() {
    canvasWidth = divPreview.clientWidth + horizontalBias;
    canvasHeight = canvasWidth * canvasRatio;
    canvasPreview.width = canvasWidth;
    canvasPreview.height = canvasHeight;

    spritesDiv.style.top = canvasHeight + 200 + 'px';

    canvasPreviewHeight = window.innerHeight / 2 - canvasHeight / 2;
    canvasPreview.qstyle.top = canvasPreviewHeight + 'px';
    buttonsDiv.style.top = canvasPreviewHeight - buttonsDivHeight + 'px';

    trashBinX = divCodeGround.clientWidth - trashBinWidth;
    trashBinY = divCodeGround.clientHeight - trashBinHeight;
    trashBin.style.left = trashBinX + 'px'; //relative to container
    trashBin.style.top = trashBinY + 'px'; //
    trashBinCenterX = trashBinX + trashBinWidth / 2;
    trashBinCenterY = trashBinY + trashBinHeight / 2;

    positionOfCoddingGround = divCodeGround.getBoundingClientRect();
}

var allCodingBlocks = []; // please don't re-order this one! NEVER!!!
var allKeyEvenListeners = [];
var allKeyEvenListenersPools = [];

function mergeBackToColor(rChannel, gChannel, bChannel) {
    if (rChannel > 255) {
        rChannel = 255;
    } else if (rChannel < 0) {
        rChannel = 0;
    }
    if (gChannel > 255) {
        gChannel = 255;
    } else if (gChannel < 0) {
        gChannel = 0;
    }
    if (bChannel > 255) {
        bChannel = 255;
    } else if (bChannel < 0) {
        bChannel = 0;
    }

    var R = '00' + Math.round(rChannel).toString(16).toUpperCase();
    var G = '00' + Math.round(gChannel).toString(16).toUpperCase();
    var B = '00' + Math.round(bChannel).toString(16).toUpperCase();

    return R.substr(R.length - 2, 2) + G.substr(G.length - 2, 2) + B.substr(B.length - 2, 2);
}

function interpolateColors(colorObject, factor) {
    return mergeBackToColor(interpolateValues(colorObject.inRchannel, colorObject.outRchannel, factor), interpolateValues(colorObject.inGchannel, colorObject.outGchannel, factor), interpolateValues(colorObject.inBchannel, colorObject.outBchannel, factor));
}

function interpolateValues(valueIn, valueOut, factor) {
    return (valueOut - valueIn) * factor + valueIn;
}

function getDockingPathNumerical(startOfShapeX, startOfShapeY) {
    return {
        commands: ['L', 'C'],
        coords: [startOfShapeX + startOfBumb, startOfShapeY, startOfShapeX + startOfBumb, startOfShapeY, startOfShapeX + startOfBumb + lengthOfBumb / 2, startOfShapeY - heightOfBumb, startOfShapeX + startOfBumb + lengthOfBumb, startOfShapeY]
    };
}

function getDockingPathReverseNum(startOfShapeX, startOfShapeY, commands, coords) {
    return {
        commands: ['L', 'C'],
        coords: [startOfShapeX - startOfBumb, startOfShapeY, startOfShapeX - startOfBumb, startOfShapeY, startOfShapeX - startOfBumb - lengthOfBumb / 2, startOfShapeY - heightOfBumb, startOfShapeX - startOfBumb - lengthOfBumb, startOfShapeY]
    };
}

function getStringPathFromNumerical(numPathCommandObject) {
    var commandAsString = '';
    var currentOffsetInCoord = 0;
    for (var commandIndex = 0; commandIndex < numPathCommandObject.commands.length; commandIndex++) {
        commandAsString += numPathCommandObject.commands[commandIndex] + ' ';
        switch (numPathCommandObject.commands[commandIndex]) {
            case 'M':
            case 'L':
                commandAsString += numPathCommandObject.coords[currentOffsetInCoord++] + ',' + numPathCommandObject.coords[currentOffsetInCoord++] + ' ';
                break;
            case 'C':
                for (var lengthOf_C_coord = 0; lengthOf_C_coord < 5; lengthOf_C_coord++) {
                    commandAsString += numPathCommandObject.coords[currentOffsetInCoord++] + ',';
                }
                commandAsString += numPathCommandObject.coords[currentOffsetInCoord++] + ' ';
                break;
        }
    }
    return commandAsString;
}

function clampZeroOne(value) {
    var clampedValue = value;
    if (clampedValue > 1) {
        clampedValue = 1;
    } else if (clampedValue < 0) {
        clampedValue = 0;
    }
    return clampedValue;
}

function CreateShape(svg, colorRange, headed, tailed, titles, isDouble, isTriple, dynamicTopBarTupple) {

    var widhtSampler = void 0;
    var heightSampler = void 0;
    var topBarHeight = void 0;

    var secondBarSamplers = [];
    var thirdBarSamplers = [];

    var sel = 0;
    var addressMe = [secondBarSamplers, thirdBarSamplers];

    // create the path object here

    var pathTuple = void 0;
    var coords = [];
    var commands = ['M']; // start each filled path with move-to-ABS-pos command

    var offsetY = 0;
    if (headed) {
        // if headed, add that dock element on top
        offsetY = heightOfBumb;
        pathTuple = getDockingPathNumerical(startOfDock, offsetY);
        for (var i = 0; i < pathTuple.coords.length; i++) {
            coords.push(pathTuple.coords[i]);
        }commands.push('C', 'L');
    }
    coords.push(minTopBarWidth - smallRadius, offsetY);

    curveTo(minTopBarWidth - smallRadius, offsetY, // top left corner of top bar
    minTopBarWidth, offsetY, minTopBarWidth, offsetY + smallRadius);
    widhtSampler = coords.length - 2;
    lineTo(minTopBarWidth, offsetY + shapesWallsWidth - smallRadius);
    curveTo(minTopBarWidth, offsetY + shapesWallsWidth - smallRadius, minTopBarWidth, offsetY + shapesWallsWidth, minTopBarWidth - smallRadius, offsetY + shapesWallsWidth); // bottom left corner of top bar
    topBarHeight = coords[coords.length - 1];

    if (!isDouble && !isTriple) {
        // if it is single bar line directly to the bottom right corner
        // let test if tail needed first
        if (tailed) {
            extractTuple(startOfDock + widthOfDock, shapesWallsWidth + offsetY);
        }
        lineTo(smallRadius, offsetY + shapesWallsWidth);
        heightSampler = coords.length - 1;

        curveTo(smallRadius, offsetY + shapesWallsWidth, // bottom right corner of single top bar
        0, offsetY + shapesWallsWidth, 0, offsetY + shapesWallsWidth - smallRadius);
        lineTo(0, smallRadius);
        curveTo(0, offsetY + smallRadius, 0, offsetY, 0 + smallRadius, offsetY); // upper right corner of single top bar
        commands.push('Z'); // close path and hopefully it will not explode
    } else {
        extractTuple(shapesWallsWidth + startOfDock + widthOfDock, shapesWallsWidth + offsetY, commands, coords);

        var cloneIsTriple = isTriple;
        var _i = 0;
        for (; sel < 2; _i += 2, sel++) {
            if (sel === 0) {
                lineTo(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + _i), sel);
                curveTo(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + _i), // top internal corner of the first cavity
                shapesWallsWidth, offsetY + shapesWallsWidth * (1 + _i), shapesWallsWidth, offsetY + shapesWallsWidth * (1 + _i) + smallRadius, sel);
            } else {
                lineToAndPush(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + _i), 0);
                curveToAndPushSampler(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + _i), // top internal corner of the first cavity
                shapesWallsWidth, offsetY + shapesWallsWidth * (1 + _i), shapesWallsWidth, offsetY + shapesWallsWidth * (1 + _i) + smallRadius, 0);
            }
            lineToAndPush(shapesWallsWidth, offsetY + shapesWallsWidth * (2 + _i) - smallRadius, sel);
            curveToAndPushSampler(shapesWallsWidth, offsetY + shapesWallsWidth * (2 + _i) - smallRadius, // bottom internal corner of the first cavity
            shapesWallsWidth, offsetY + shapesWallsWidth * (2 + _i), shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (2 + _i), sel);
            lineToAndPush(minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (2 + _i), sel);
            curveToAndPushSampler(minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (2 + _i), // top left corner of the second bar
            minTopBarWidth, offsetY + shapesWallsWidth * (2 + _i), minTopBarWidth, offsetY + shapesWallsWidth * (2 + _i) + smallRadius, sel);
            lineToAndPush(minTopBarWidth, offsetY + shapesWallsWidth * (3 + _i) - smallRadius, sel);
            curveToAndPushSampler(minTopBarWidth, offsetY + shapesWallsWidth * (3 + _i) - smallRadius, // bottom left corner of the second bar
            minTopBarWidth, offsetY + shapesWallsWidth * (3 + _i), minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (3 + _i), sel);
            if (!cloneIsTriple) {
                // it needs a dock on the top of the second cavity wich is little but to the left
                if (tailed) {
                    extractTupleAndPush(startOfDock + widthOfDock, offsetY + shapesWallsWidth * (3 + _i), sel);
                }
                break;
            }
            extractTupleAndPush(shapesWallsWidth + startOfDock + widthOfDock, offsetY + shapesWallsWidth * (3 + _i), sel);
            cloneIsTriple = false;
        }

        lineToAndPush(bigRadius, offsetY + shapesWallsWidth * (3 + _i), sel);
        heightSampler = coords.length - 1;
        curveToAndPushSampler(bigRadius, offsetY + shapesWallsWidth * (3 + _i), // bottom right corner of the whole shape
        0, offsetY + shapesWallsWidth * (3 + _i), 0, offsetY + shapesWallsWidth * (3 + _i) - bigRadius, sel);
        lineTo(0, offsetY + bigRadius);
        curveTo(0, offsetY + bigRadius, // top right corner of the whole shape
        0, offsetY, bigRadius, offsetY);
        commands.push('Z');
    }

    function extractTuple(startX, startY) {
        pathTuple = getDockingPathReverseNum(startX, startY);
        for (var _i2 = 0; _i2 < pathTuple.commands.length; _i2++) {
            commands.push(pathTuple.commands[_i2]);
        }for (var _i3 = 0; _i3 < pathTuple.coords.length; _i3 += 2) {
            coords.push(pathTuple.coords[_i3], pathTuple.coords[_i3 + 1]);
        }
    }

    function extractTupleAndPush(startX, startY, sel) {
        pathTuple = getDockingPathReverseNum(startX, startY);
        for (var _i4 = 0; _i4 < pathTuple.commands.length; _i4++) {
            commands.push(pathTuple.commands[_i4]);
        }for (var _i5 = 0; _i5 < pathTuple.coords.length; _i5 += 2) {
            coords.push(pathTuple.coords[_i5], pathTuple.coords[_i5 + 1]);
            addressMe[sel].push(coords.length - 1);
        }
    }

    function lineTo(lineToX, lineToY) {
        commands.push('L');
        coords.push(lineToX, lineToY);
    }

    function lineToAndPush(lineToX, lineToY, sel) {
        commands.push('L');
        coords.push(lineToX, lineToY);
        addressMe[sel].push(coords.length - 1);
    }

    function curveTo(startX, startY, controlX, controlY, endX, endY) {
        commands.push('C');
        coords.push(startX, startY, controlX, controlY, endX, endY);
    }

    function curveToAndPushSampler(startX, startY, controlX, controlY, endX, endY, sel) {
        commands.push('C');
        coords.push(startX, startY, controlX, controlY, endX, endY);
        addressMe[sel].push(coords.length - 5);
        addressMe[sel].push(coords.length - 3);
        addressMe[sel].push(coords.length - 1);
    }

    var pathObject = { commands: commands, coords: coords };

    var stringFromNumPath = getStringPathFromNumerical(pathObject);

    var path = document.createElementNS(svg.namespaceURI, 'path');
    svg.appendChild(path);
    path.setAttribute('stroke', 'none');
    path.setAttribute('opacity', 1);
    path.setAttribute('fill', loopsColor.inColor);

    for (var _i6 = 0; _i6 < titles.length; _i6++) {
        svg.appendChild(titles[_i6].textEl);
    }

    var pathFeel = document.createElementNS(svg.namespaceURI, 'path');
    svg.appendChild(pathFeel);
    pathFeel.setAttribute('id', uniqueID++);
    pathFeel.setAttribute('stroke', 'none');
    pathFeel.setAttribute('opacity', 0);
    pathFeel.setAttribute('fill', '#000000');
    pathFeel.setAttribute('class', 'codingblocktitle');
    pathFeel.setAttribute('d', stringFromNumPath);

    var body = null;
    var samplers = { widhtSampler: widhtSampler, heightSampler: heightSampler };

    if (arguments > 8) {
        // its top bar is resizeable
        if (isTriple) {
            body = new DynamicBarTripleBody(colorRange, path, pathFeel, pathObject, widhtSampler, heightSampler, dynamicTopBarTupple.inputBoxNewWidth, dynamicTopBarTupple.inputBoxNewHeight, dynamicTopBarTupple.inputX);
            body.firstCavityHeight = shapesWallsWidth;
            body.secondCavityHeight = shapesWallsWidth;
        } else if (isDouble) {
            body = new DynamicBarDoubleBody(colorRange, path, pathFeel, pathObject, widhtSampler, heightSampler, dynamicTopBarTupple.inputBoxNewWidth, dynamicTopBarTupple.inputBoxNewHeight, dynamicTopBarTupple.inputX);
            body.firstCavityHeight = shapesWallsWidth;
        } else {
            body = new DynamicBarBody(colorRange, path, pathFeel, pathObject, widhtSampler, heightSampler, dynamicTopBarTupple.inputBoxNewWidth, dynamicTopBarTupple.inputBoxNewHeight, dynamicTopBarTupple.inputX);
        }
    } else {
        if (isTriple) {
            samplers.secondBarSamplers = secondBarSamplers;
            samplers.thirdBarSamplers = thirdBarSamplers;
            body = new FixedTopBarTripleBody(colorRange, path, pathFeel, pathObject, samplers, topBarHeight);
            body.firstCavityHeight = shapesWallsWidth;
            body.secondCavityHeight = shapesWallsWidth;
        } else if (isDouble) {
            samplers.secondBarSamplers = secondBarSamplers;
            body = new FixedTopBarDoubleBody(colorRange, path, pathFeel, pathObject, samplers, topBarHeight);
            body.firstCavityHeight = shapesWallsWidth;
        } else {
            body = new Body(colorRange, path, pathFeel, pathObject, samplers, topBarHeight);
        }
    }

    var titleA = null;
    var titleB = null;
    var titleC = null;

    var head = null;
    var tail = null;
    var tail1 = null;
    var tail2 = null;

    pathsCollection = { body: body };

    if (headed) {
        head = new Head(svg);
        pathsCollection.head = head;
    }

    if (tailed) {
        if (isTriple) {
            tail = new OuternTail(svg, offsetY + shapesWallsWidth * 5);
        } else if (isDouble) {
            tail = new OuternTail(svg, offsetY + shapesWallsWidth * 3);
        } else {
            tail = new OuternTail(svg, offsetY + shapesWallsWidth);
        }
        pathsCollection.tail = tail;
    }

    if (isTriple) {
        var _tail = new ConcavityTailFirst(svg, offsetY + shapesWallsWidth);
        var _tail2 = new ConcavityTailSecond(svg, offsetY + shapesWallsWidth * 3);
        pathsCollection.tail1 = _tail;
        pathsCollection.tail2 = _tail2;
    } else if (isDouble) {
        var _tail3 = new ConcavityTailFirst(svg, offsetY + shapesWallsWidth);
        pathsCollection.tail1 = _tail3;
    }

    return pathsCollection;
}

function redrawSVG(coddingBlock) {
    coddingBlock.body.updateDimensions();
    coddingBlock.svg.setAttribute('height', coddingBlock.body.height + 2);
    coddingBlock.svg.setAttribute('width', coddingBlock.body.width);
    coddingBlock.body.path.setAttribute('d', getStringPathFromNumerical(coddingBlock.body.numericalPath));
    coddingBlock.body.pathFeel.setAttribute('d', getStringPathFromNumerical(coddingBlock.body.numericalPath));
    if (coddingBlock.head !== null) coddingBlock.head.movePathPosition(coddingBlock.head.startOfShapeY);
    for (var i = 0; i < coddingBlock.tails.length; i++) {
        coddingBlock.tails[i].movePathPosition(coddingBlock.tails[i].startOfShapeY);
    }
}

//////////////////////////////////////////////////////////////////
//      COMMON EVENT LISTENERS
//////////////////////////////////////////////////////////////////

window.addEventListener("mouseup", mouseUp);
window.addEventListener("mousemove", mouseMove);
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

document.getElementById('startButton').addEventListener('mousedown', startProgram);
document.getElementById('stopButton').addEventListener('mouseup', stopProgram);

function startProgram() {
    programIsRunning = true;
    programLoop();
}

function programLoop() {
    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListenersPools.length; main_i++) {
            allKeyEvenListenersPools[main_i].keyEventPool();
        }window.requestAnimationFrame(programLoop);
    }
}

function stopProgram() {
    programIsRunning = false;
    // restore the state
}

function keyDown(e) {
    if (e.keyCode !== 123 && e.keyCode !== 116) e.preventDefault();

    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListeners.length; main_i++) {
            allKeyEvenListeners[main_i].setKey(e);
        }
    }
}

function keyUp(e) {
    if (e.keyCode !== 123 && e.keyCode !== 116) e.preventDefault();

    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListeners.length; main_i++) {
            allKeyEvenListeners[main_i].releaseKey(e);
        }
    }
}

function mouseUp() {
    document.documentElement.style.cursor = 'default'; // needed!
    if (dragging) blockOnFocus.mouseUpCoddingBlock();
}

function mouseMove(event) {
    if (dragging) blockOnFocus.mouseMoveCoddingBlock(event);
}

function distance2D(point_1_X, point_1_Y, point_2_X, point_2_Y) {
    return Math.sqrt((point_1_X - point_2_X) * (point_1_X - point_2_X) + (point_1_Y - point_2_Y) * (point_1_Y - point_2_Y));
}

function setMeOnTop(self) {
    zIndex = startZIndex + allCodingBlocks.length + 5; // angel number
    for (var i = 0; i < allCodingBlocks.length; i++) {
        if (self.id !== i) {
            allCodingBlocks[i].container.style.zIndex = startZIndex;
        }
    }

    if (creatorMode) {
        inventory.style.zIndex = zIndex;
        self.container.style.zIndex = zIndex + 1;
        divPreview.style.zIndex = zIndex + 2;
        canvasPreview.style.zIndex = zIndex + 3;
    } else {
        self.container.style.zIndex = zIndex;
        divPreview.style.zIndex = zIndex + 1;
        canvasPreview.style.zIndex = zIndex + 2;
        inventory.style.zIndex = zIndex + 3;
    }
    buttonsDiv.style.zIndex = zIndex + 4;
    spritesDiv.style.zIndex = zIndex + 4;
}
var imgGirl = document.getElementById('girl');
var imgVader = document.getElementById('vader');
var girl = new Sprite(imgGirl, 100, 100);
var vader = new Sprite(imgVader, 120, 100);

// populate the inventory table
var startBlock = new StaticInventoryStartBlock();
var ifBlock = new StaticInventoryIfBlock();
var ifElseStaticBlock = new StaticInventoryIfElseBlock();
var foreverBlock = new StaticInventoryForeverBlock();

var keyUpBlock = new StaticInventoryKeyUpBlock();
var keyDownBlock = new StaticInventoryKeyDownBlock();
var keyLeftBlock = new StaticInventoryKeyLeftBlock();
var keyRightBlock = new StaticInventoryKeyRightBlock();

var keyUpOnceBlock = new StaticInventoryKeyUpOnceBlock();
var keyDownOnceBlock = new StaticInventoryKeyDownOnceBlock();
var keyLeftOnceBlock = new StaticInventoryKeyLeftOnceBlock();
var keyRightOnceBlock = new StaticInventoryKeyRightOnceBlock();

var moveUpBlock = new StaticInventoryStepUPBlock();
var moveDownBlock = new StaticInventoryStepDownBlock();
var moveLeftBlock = new StaticInventoryStepLeftBlock();
var moveRightBlock = new StaticInventoryStepRightBlock();
//# sourceMappingURL=main.js.map