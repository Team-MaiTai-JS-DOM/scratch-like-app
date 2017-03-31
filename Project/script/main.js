const canvasPreview = document.getElementById('previewCanvas');
const divPreview = document.getElementById('previewDiv');
const divCodeGround = document.getElementById('codeGround');
const inventory = document.getElementById('inventory');
const buttonsDiv = document.getElementById('upperButtonsDiv');
const spritesDiv = document.getElementById('previewSprites');

var allImageCoddingBlocks = []; // unused, just making sure GC will not nuke the IMGcoddingBlocks objects
var allAnimationEventListeners = [];
var allLoadedSpriteImagesAsPaths = [];
var allLoadedSpriteImagesAsObjects = [];
var repaintOfCanvasRequestedDueMoving = false;
var repaintOfCanvasRequestedDueAnimation = false;

let buttonsDivHeight = 40;
let canvasPreviewHeight;
let canvasRatio = 3 / 4;
let canvasHeight, canvasWidth;
let maxDockingReactionDistance = 50;
let minDockingDistance = 10;
let maxTrashBinReactionDistance = 100;
let trashBinDistDestroy = 70;
let dragging = false;
let creatorMode = false;
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let blockOnFocus = null;
let trashBin = document.getElementById('trashbin');
let trashBinWidth = trashBin.width;
let trashBinHeight = trashBin.height;
let trashBinX;
let trashBinY;
let trashBinCenterX;
let trashBinCenterY;
let zIndex;
let staticShapesTopMargin = 20;
let staticShapesLeftMargin = 20;
let currentOffsetInInventory = staticShapesTopMargin;
let startingPosOfTheBlockBeingDragged;
let currentPosOfTheBlockBeingDragged;
let endingPosOfTheBlockBeingDragged;
let positionOfCoddingGround;
let distToTrashBin;
let shortestDist;
let distance;
let nearestTail;
let offsetToTailX;
let offsetToTailY
let myContainerPos;
let dockedParenPosition;
let programIsRunning = false;
let main_i;
let postionOfCreator;
let parentOfDocked;

let minOpacityForAll = 0.2;
let maxOpacityForAll = 1;

let ctx2D = canvasPreview.getContext('2d');

let uniqueID = 0;

// find the base zeta index of all
let startZIndex = 0;
(function () {
    let elements = document.getElementsByTagName("*");

    for (let i = 0; i < elements.length - 1; i++) {
        if (parseInt(elements[i].style.zIndex) > startZIndex) {
            startZIndex = parseInt(elements[i].style.zIndex);
        }
    }
})();

startZIndex++;

// design of the docking shape
let widthOfDock = 50;
let startOfBumb = 15;
let heightOfBumb = 5;
let lengthOfBumb = widthOfDock - startOfBumb * 2;
let startOfDock = 35;

// design of the body shape
let titlesColor = '#d6d8a0';
let minTopBarWidth = 150;
let shapesWallsWidth = 25;
let bigRadius = 20;
let titleOffsetX = shapesWallsWidth;
let titleOffsetY = 18;
let smallRadius = getSmalRadius(shapesWallsWidth);
let minInputfield = shapesWallsWidth / (8/10);

let dockLineWidth = 2;

let blocksColorTransitionStep = 0.08;

canvasPreview.style.left = '0px';

resize();

window.addEventListener('resize', resize, false);

// this is not trash, it will be used later for recalculating the radius of the resized topBar
function getSmalRadius(shapesWallsWidth) {
    return shapesWallsWidth / (25 / 10);
}

function resize() {
    canvasWidth = divPreview.clientWidth;
    canvasHeight = canvasWidth * canvasRatio;
    canvasPreview.width = canvasWidth;
    canvasPreview.height = canvasHeight;

    spritesDiv.style.top = window.innerHeight - spritesDiv.clientHeight + 'px';

    canvasPreviewHeight = (window.innerHeight / 2 - canvasHeight / 2);
    canvasPreview.style.top = canvasPreviewHeight + 'px';
    buttonsDiv.style.top = (canvasPreviewHeight - buttonsDivHeight) + 'px';

    trashBinX = divCodeGround.clientWidth - trashBinWidth;
    trashBinY = divCodeGround.clientHeight - trashBinHeight;
    trashBin.style.left = trashBinX + 'px'; //relative to container
    trashBin.style.top = trashBinY + 'px';  //
    trashBinCenterX = trashBinX + trashBinWidth / 2;
    trashBinCenterY = trashBinY + trashBinHeight / 2;

    positionOfCoddingGround = divCodeGround.getBoundingClientRect();
}

let allCodingBlocks = [];       // please don't re-order this one! NEVER!!!
let allKeyEvenListeners = [];
let allKeyEvenListenersPools = [];

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

    let R = '00' + Math.round(rChannel).toString(16).toUpperCase();
    let G = '00' + Math.round(gChannel).toString(16).toUpperCase();
    let B = '00' + Math.round(bChannel).toString(16).toUpperCase();

    return R.substr(R.length - 2, 2) +
           G.substr(G.length - 2, 2) +
           B.substr(B.length - 2, 2);
}

function interpolateColors(colorObject, factor) {
    return mergeBackToColor(interpolateValues(colorObject.inRchannel, colorObject.outRchannel, factor),
                            interpolateValues(colorObject.inGchannel, colorObject.outGchannel, factor),
                            interpolateValues(colorObject.inBchannel, colorObject.outBchannel, factor));
}

function interpolateValues(valueIn, valueOut, factor) {
    return (valueOut - valueIn) * factor + valueIn;
}

function getDockingPathNumerical(startOfShapeX, startOfShapeY) {
    return {
        commands: ['L', 'C'],
        coords:
        [(startOfShapeX + startOfBumb), startOfShapeY,
        (startOfShapeX + startOfBumb), startOfShapeY,
        (startOfShapeX + startOfBumb + lengthOfBumb / 2), (startOfShapeY - heightOfBumb),
        (startOfShapeX + startOfBumb + lengthOfBumb), startOfShapeY]
    };
}

function getDockingPathReverseNum(startOfShapeX, startOfShapeY, commands, coords) {
    return {
        commands: ['L', 'C'],
        coords:
            [(startOfShapeX - startOfBumb), startOfShapeY,
             (startOfShapeX - startOfBumb), startOfShapeY,
             (startOfShapeX - startOfBumb - lengthOfBumb / 2), (startOfShapeY - heightOfBumb),
             (startOfShapeX - startOfBumb - lengthOfBumb), startOfShapeY]
    };
}

function getStringPathFromNumerical(numPathCommandObject) {
    let commandAsString = '';
    let currentOffsetInCoord = 0;
    for (let commandIndex = 0; commandIndex < numPathCommandObject.commands.length; commandIndex++) {
        commandAsString += numPathCommandObject.commands[commandIndex] + ' ';
        switch(numPathCommandObject.commands[commandIndex]) {
            case 'M':
            case 'L':
                commandAsString +=
                    numPathCommandObject.coords[currentOffsetInCoord++] + ',' +
                    numPathCommandObject.coords[currentOffsetInCoord++] + ' ';
                break;
            case 'C':
                for (let lengthOf_C_coord = 0; lengthOf_C_coord < 5; lengthOf_C_coord++) {
                    commandAsString +=
                        numPathCommandObject.coords[currentOffsetInCoord++] + ',';
                }
                commandAsString += numPathCommandObject.coords[currentOffsetInCoord++] + ' ';
                break;
        }
    }
    return commandAsString;
}

function clampZeroOne(value) {
    let clampedValue = value;
    if (clampedValue > 1) {
        clampedValue = 1;
    } else if (clampedValue < 0) {
        clampedValue = 0;
    }
    return clampedValue;
}

function CreateShape(svg, colorRange, headed, tailed, titles, isDouble, isTriple, dynamicTopBarTupple) {

    let widhtSampler;
    let heightSampler;
    let topBarHeight;

    let secondBarSamplers = [];
    let thirdBarSamplers = [];

    let sel = 0;
    let addressMe = [secondBarSamplers, thirdBarSamplers];

    // create the path object here

    let pathTuple;
    let coords = [];
    let commands = ['M'];   // start each filled path with move-to-ABS-pos command

    let offsetY = 0;
    if (headed) {   // if headed, add that dock element on top
        offsetY = heightOfBumb;
        pathTuple = getDockingPathNumerical(startOfDock, offsetY);
        for (let i = 0; i < pathTuple.coords.length; i++)
            coords.push(pathTuple.coords[i]);
        commands.push('C', 'L');
    }
    coords.push(minTopBarWidth - smallRadius, offsetY);

    curveTo(minTopBarWidth - smallRadius, offsetY,   // top left corner of top bar
            minTopBarWidth, offsetY,
            minTopBarWidth, offsetY + smallRadius);
    widhtSampler = coords.length - 2;
    lineTo(minTopBarWidth, offsetY + shapesWallsWidth - smallRadius);
    curveTo(minTopBarWidth, offsetY + shapesWallsWidth - smallRadius,
            minTopBarWidth, offsetY + shapesWallsWidth,
            minTopBarWidth - smallRadius, offsetY + shapesWallsWidth); // bottom left corner of top bar
    topBarHeight = coords[coords.length - 1];

    if (!isDouble && !isTriple) {   // if it is single bar line directly to the bottom right corner
        // let test if tail needed first
        if (tailed) {
            extractTuple(startOfDock + widthOfDock, shapesWallsWidth + offsetY);
        }
        lineTo(smallRadius, offsetY + shapesWallsWidth);
        heightSampler = coords.length - 1;

        curveTo(smallRadius, offsetY + shapesWallsWidth, // bottom right corner of single top bar
                0, offsetY + shapesWallsWidth,
                0, offsetY + shapesWallsWidth - smallRadius);
        lineTo(0, smallRadius);
        curveTo(0, offsetY + smallRadius,
                0, offsetY,
                0 + smallRadius, offsetY);  // upper right corner of single top bar
        commands.push('Z'); // close path and hopefully it will not explode
    } else {
        extractTuple(shapesWallsWidth + startOfDock + widthOfDock, shapesWallsWidth + offsetY, commands, coords);

        let cloneIsTriple = isTriple;
        let i = 0;
        for (; sel < 2 ; i += 2, sel++) {
            if (sel === 0) {
                lineTo(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + i), sel);
                curveTo(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + i),     // top internal corner of the first cavity
                        shapesWallsWidth, offsetY + shapesWallsWidth * (1 + i),
                        shapesWallsWidth, offsetY + shapesWallsWidth * (1 + i) + smallRadius, sel);
            } else {
                lineToAndPush(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + i), 0);
                curveToAndPushSampler(shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (1 + i),     // top internal corner of the first cavity
                                      shapesWallsWidth, offsetY + shapesWallsWidth * (1 + i),
                                      shapesWallsWidth, offsetY + shapesWallsWidth * (1 + i) + smallRadius, 0);
            }
            lineToAndPush(shapesWallsWidth, offsetY + shapesWallsWidth * (2 + i) - smallRadius, sel);
            curveToAndPushSampler(shapesWallsWidth, offsetY + shapesWallsWidth * (2 + i) - smallRadius, // bottom internal corner of the first cavity
                                  shapesWallsWidth, offsetY + shapesWallsWidth * (2 + i),
                                  shapesWallsWidth + smallRadius, offsetY + shapesWallsWidth * (2 + i), sel);
            lineToAndPush(minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (2 + i), sel);
            curveToAndPushSampler(minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (2 + i), // top left corner of the second bar
                                  minTopBarWidth, offsetY + shapesWallsWidth * (2 + i),
                                  minTopBarWidth, offsetY + shapesWallsWidth * (2 + i) + smallRadius, sel);
            lineToAndPush(minTopBarWidth, offsetY + shapesWallsWidth * (3 + i) - smallRadius, sel);
            curveToAndPushSampler(minTopBarWidth, offsetY + shapesWallsWidth * (3 + i) - smallRadius, // bottom left corner of the second bar
                                  minTopBarWidth, offsetY + shapesWallsWidth * (3 + i),
                                  minTopBarWidth - smallRadius, offsetY + shapesWallsWidth * (3 + i), sel);
            if (!cloneIsTriple) {     // it needs a dock on the top of the second cavity wich is little but to the left
                if (tailed) {
                    extractTupleAndPush(startOfDock + widthOfDock, offsetY + shapesWallsWidth * (3 + i), sel);
                }
                break;
            }
            extractTupleAndPush(shapesWallsWidth + startOfDock + widthOfDock, offsetY + shapesWallsWidth * (3 + i), sel);
            cloneIsTriple = false;
        }

        lineToAndPush(bigRadius, offsetY + shapesWallsWidth * (3 + i), sel);
        heightSampler = coords.length - 1;
        curveToAndPushSampler(bigRadius, offsetY + shapesWallsWidth * (3 + i), // bottom right corner of the whole shape
                              0, offsetY + shapesWallsWidth * (3 + i),
                              0, offsetY + shapesWallsWidth * (3 + i) - bigRadius, sel);
        lineTo(0, offsetY + bigRadius);
        curveTo(0, offsetY + bigRadius, // top right corner of the whole shape
                0, offsetY,
                bigRadius, offsetY);
        commands.push('Z');
    }

    function extractTuple(startX, startY) {
        pathTuple = getDockingPathReverseNum(startX, startY);
        for (let i = 0; i < pathTuple.commands.length; i++)
            commands.push(pathTuple.commands[i]);
        for (let i = 0; i < pathTuple.coords.length; i += 2)
            coords.push(pathTuple.coords[i], pathTuple.coords[i + 1]);
    }

    function extractTupleAndPush(startX, startY, sel) {
        pathTuple = getDockingPathReverseNum(startX, startY);
        for (let i = 0; i < pathTuple.commands.length; i++)
            commands.push(pathTuple.commands[i]);
        for (let i = 0; i < pathTuple.coords.length; i += 2) {
            coords.push(pathTuple.coords[i], pathTuple.coords[i + 1]);
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

    let pathObject = { commands, coords };

    let stringFromNumPath = getStringPathFromNumerical(pathObject);

    let path = document.createElementNS(svg.namespaceURI, 'path');
    svg.appendChild(path);
    path.setAttribute('stroke', 'none');
    path.setAttribute('opacity', 1);
    path.setAttribute('fill', loopsColor.inColor);

    for (let i = 0; i < titles.length; i++) {
        svg.appendChild(titles[i].textEl);
    }

    let pathFeel = document.createElementNS(svg.namespaceURI, 'path');
    svg.appendChild(pathFeel);
    pathFeel.setAttribute('id', uniqueID++);
    pathFeel.setAttribute('stroke', 'none');
    pathFeel.setAttribute('opacity', 0);
    pathFeel.setAttribute('fill', '#000000');
    pathFeel.setAttribute('class', 'codingblocktitle');
    pathFeel.setAttribute('d', stringFromNumPath);

    let body = null;
    let samplers = { widhtSampler: widhtSampler, heightSampler: heightSampler };

    if (arguments > 8) { // its top bar is resizeable
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

    let titleA = null;
    let titleB = null;
    let titleC = null;

    let head = null;
    let tail = null;
    let tail1 = null;
    let tail2 = null;

    pathsCollection = {body: body};

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
        let tail1 = new ConcavityTailFirst(svg, offsetY + shapesWallsWidth);
        let tail2 = new ConcavityTailSecond(svg, offsetY + shapesWallsWidth * 3);
        pathsCollection.tail1 = tail1;
        pathsCollection.tail2 = tail2;
    } else if (isDouble) {
        let tail1 = new ConcavityTailFirst(svg, offsetY + shapesWallsWidth);
        pathsCollection.tail1 = tail1;
    }

    return pathsCollection;
}

function redrawSVG(coddingBlock) {
    coddingBlock.body.updateDimensions();
    coddingBlock.svg.setAttribute('height', coddingBlock.body.height + 2);
    coddingBlock.svg.setAttribute('width', coddingBlock.body.width);
    coddingBlock.body.path.setAttribute('d', getStringPathFromNumerical(coddingBlock.body.numericalPath));
    coddingBlock.body.pathFeel.setAttribute('d', getStringPathFromNumerical(coddingBlock.body.numericalPath));
    if (coddingBlock.head !== null)
        coddingBlock.head.movePathPosition(coddingBlock.head.startOfShapeY);
    for (let i = 0; i < coddingBlock.tails.length; i++)
        coddingBlock.tails[i].movePathPosition(coddingBlock.tails[i].startOfShapeY);
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
        }

        for (main_i = 0; main_i < allAnimationEventListeners.length; main_i++) {
            allAnimationEventListeners[main_i].animateTo();
        }

        if (repaintOfCanvasRequestedDueAnimation || repaintOfCanvasRequestedDueMoving) {
            repaintAllIMGsOnCanvas();
        }
        window.requestAnimationFrame(programLoop);
    }
}

function stopProgram() {
    programIsRunning = false;
    // restore the state
}

function keyDown(e) {
    if (e.keyCode !== 123 && e.keyCode !== 116) e.preventDefault();

    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListeners.length; main_i++)
            allKeyEvenListeners[main_i].setKey(e);
    }
}

function keyUp(e) {
    if (e.keyCode !== 123 && e.keyCode !== 116) e.preventDefault();

    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListeners.length; main_i++)
            allKeyEvenListeners[main_i].releaseKey(e);
    }
}

function mouseUp() {
    document.documentElement.style.cursor = 'default';  // needed!
    if (dragging)
        blockOnFocus.mouseUpCoddingBlock();
}

function mouseMove(event) {
    if (dragging)
        blockOnFocus.mouseMoveCoddingBlock(event);
}

function distance2D(point_1_X, point_1_Y, point_2_X, point_2_Y) {
    return Math.sqrt((point_1_X - point_2_X) *
                     (point_1_X - point_2_X) + (point_1_Y - point_2_Y) *
                                               (point_1_Y - point_2_Y));
}

function setMeOnTop(self) {
    zIndex = startZIndex + allCodingBlocks.length + 5; // angel number
    for (let i = 0; i < allCodingBlocks.length; i++) {
        if (self.id !== i) {
            allCodingBlocks[i].container.style.zIndex = startZIndex;
        }
    }

    if (creatorMode) {
        inventory.style.zIndex = zIndex;
        self.container.style.zIndex = zIndex + 1;
        divPreview.style.zIndex = zIndex + 2 ;
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

// populate the inventory table
let startBlock = new StaticInventoryStartBlock();
let ifBlock = new StaticInventoryIfBlock();
let ifElseStaticBlock = new StaticInventoryIfElseBlock();
let foreverBlock = new StaticInventoryForeverBlock();

let keyUpBlock = new StaticInventoryKeyUpBlock();
let keyDownBlock = new StaticInventoryKeyDownBlock();
let keyLeftBlock = new StaticInventoryKeyLeftBlock();
let keyRightBlock = new StaticInventoryKeyRightBlock();

let keyUpOnceBlock = new StaticInventoryKeyUpOnceBlock();
let keyDownOnceBlock = new StaticInventoryKeyDownOnceBlock();
let keyLeftOnceBlock = new StaticInventoryKeyLeftOnceBlock();
let keyRightOnceBlock = new StaticInventoryKeyRightOnceBlock();
