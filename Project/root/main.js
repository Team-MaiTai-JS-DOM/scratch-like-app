
var canvasPreview = document.getElementById('previewCanvas');
var divPreview = document.getElementById('previewDiv');
var divCodeGround = document.getElementById('codeGround');
var inventory = document.getElementById('inventory');
var buttonsDiv = document.getElementById('upperButtonsDiv');
var spritesDiv = document.getElementById('previewSprites');

var buttonsDivHeight = 40;
var canvasPreviewHeight;
var canvasRatio = 3 / 4;
var canvasHeight, canvasWidth;
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
var trashBinX;
var trashBinY;
var trashBinCenterX;
var trashBinCenterY;
var zIndex;
var staticShapesTopMargin = 20;
var staticShapesLeftMargin = 20;
var currentOffsetInInventory = staticShapesTopMargin;
var startingPosOfTheBlockBeingDragged;
var currentPosOfTheBlockBeingDragged;
var endingPosOfTheBlockBeingDragged;
var positionOfCoddingGround;
var distToTrashBin;
var drag_i;
var shortestDist;
var distance;
var nearestTail;
var offsetToTailX;
var offsetToTailY
var myContainerPos;
var dockedParenPosition;
var programIsRunning = false
var main_i;
var postionOfCreator;
var parentOfDocked;

var minOpacityForAll = 0.2;
var maxOpacityForAll = 1;

var ctx2D = canvasPreview.getContext('2d');

var uniqueID = 0;

// find the base zeta index of all
var startZIndex = 0;
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
var widthOfDock = 50;
var startOfBumb = 15;
var heightOfBumb = 5;
var lengthOfBumb = widthOfDock - startOfBumb * 2;
var startOfDock = 35;

// design of the body shape
var titlesColor = '#FF5500';
var minTopBarWidth = 150;
var shapesWallsWidth = 25;
var bigRadius = 20;
var titleOffsetX = shapesWallsWidth;
var titleOffsetY = 18;
var smallRadius = getSmalRadius(shapesWallsWidth);
var minInputfield = shapesWallsWidth / (8/10);

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

var allCodingBlocks = [];       // please dont re-oreder this one! NEVER!!!
var allKeyEvenListeners = [];
var allKeyEvenListenersPools = [];

class SeparatedColors {
    constructor(inColor, outColor) {
        this.inColor = inColor;
        this.outColor = outColor;

        this.inRchannel = parseInt(inColor.substring(1, 3), 16);
        this.inGchannel = parseInt(inColor.substring(3, 5), 16);
        this.inBchannel = parseInt(inColor.substring(5, 7), 16);

        this.outRchannel = parseInt(outColor.substring(1, 3), 16);
        this.outGchannel = parseInt(outColor.substring(3, 5), 16);
        this.outBchannel = parseInt(outColor.substring(5, 7), 16);
    }
}

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

var loopsColor = new SeparatedColors('#00FF00', '#FFFF00');
var dockColorRange = new SeparatedColors('#FFFF00', '#FF0000');

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

////////////////////////////////////////////////////////////////////////
//      DOCKS           (generally two types: heads and tails)
////////////////////////////////////////////////////////////////////////

var allTails = [];

class Dock {
    constructor(svg, startOfShapeX, startOfShapeY) {

        // where to start to paint the dock
        this.startOfShapeX = startOfShapeX;
        this.startOfShapeY = startOfShapeY;

        // needed to calculate distances btw docks
        this.centerOfShapeX = startOfShapeX + widthOfDock / 2;
        this.centerOfShapeY = 0;

        // the neighbor that is docked or null
        this.dockedNeighbor = null;

        //to keep trace of the current color variation
        this.currentColorFactor = 0;

        // create the path object
        this.path = document.createElementNS(svg.namespaceURI, 'path');
        this.path.setAttribute('stroke', dockColorRange.inColor);
        this.path.setAttribute('stroke-width', dockLineWidth);
        this.path.setAttribute('opacity', 1);
        this.path.setAttribute('fill', 'none');

        svg.appendChild(this.path);
    }

    movePathPosition(newOffsetY){
        this.path.setAttribute('d', 'M ' + this.startOfShapeX + ',' + newOffsetY + ' ' +
                               getStringPathFromNumerical(getDockingPathNumerical(this.startOfShapeX, newOffsetY)) +
                               'L ' + (this.startOfShapeX + widthOfDock) + ',' + newOffsetY);
        this.startOfShapeY = newOffsetY;
        this.centerOfShapeY = this.startOfShapeY - heightOfBumb / 2;
    }
    
    updateColorByFactor(colorFactor) {
        // check for this because a lot of docks will be out of range and trying to be redrawn to get back to its initial values and this happens on mose move
        if (this.currentColorFactor != colorFactor) {
            this.currentColorFactor = clampZeroOne(colorFactor);
            this.path.setAttribute('style', 'stroke:#' + interpolateColors(dockColorRange, this.currentColorFactor));
        }
    }
}

class Head extends Dock {
    constructor(svg) {
        super(svg, startOfDock, heightOfBumb);    
    }

    getHeightOfAllBellow() {
        let totalHeight = this.JSParent.body.height;
        let el = this.JSParent;
        let debcount = 0;
        while (el.tail != null && el.tail.dockedNeighbor != null) {
            el = el.tail.dockedNeighbor.JSParent;
            totalHeight += el.body.height - heightOfBumb;
        }
        return totalHeight;
    }
}

class Tail extends Dock {
    constructor(svg, startOfShapeX, startOfShapeY) {
        super(svg, startOfShapeX, startOfShapeY);

        this.JSParent = null;

        this.id = 0;
    }

    destroy() {
        allTails.splice(this.id, 1);
    }

    dock(dockedNeighbor) {
        this.dockedNeighbor = dockedNeighbor; // type of head

        parentOfDocked = this.dockedNeighbor.JSParent;

        parentOfDocked.container.parentElement.removeChild(parentOfDocked.container);

        this.alignJustDockedElement();
    }

    alignJustDockedElement() {
        parentOfDocked = this.dockedNeighbor.JSParent;

        offsetToTailX = (parentOfDocked.head.centerOfShapeX + parentOfDocked.container.offsetLeft) - (this.centerOfShapeX);
        offsetToTailY = (parentOfDocked.head.centerOfShapeY + parentOfDocked.container.offsetTop) - (this.centerOfShapeY);

        parentOfDocked.container.style.left = (parentOfDocked.container.offsetLeft - offsetToTailX) + 'px';
        parentOfDocked.container.style.top = (parentOfDocked.container.offsetTop - offsetToTailY) + 'px';

        this.JSParent.container.appendChild(parentOfDocked.container);
    }

    unDock(event) {
        parentOfDocked = this.dockedNeighbor.JSParent;

        dockedParenPosition = this.dockedNeighbor.JSParent.container.getBoundingClientRect();

        myContainerPos = this.JSParent.container.getBoundingClientRect();

        offsetToTailX = event.pageX - dockedParenPosition.left;
        offsetToTailY = event.pageY - dockedParenPosition.top;

        this.JSParent.container.removeChild(this.dockedNeighbor.JSParent.container);

        parentOfDocked.container.style.left = ((dockedParenPosition.left - positionOfCoddingGround.left)) + 'px';
        parentOfDocked.container.style.top = ((dockedParenPosition.top - positionOfCoddingGround.top)) + 'px';

        this.dockedNeighbor.JSParent.head.dockedNeighbor = null;
        this.dockedNeighbor = null;

        divCodeGround.appendChild(parentOfDocked.container);
    }

    resizeCavity() { }
}

class OuternTail extends Tail {
    constructor(svg, startOfShapeY) {
        super(svg, startOfDock, startOfShapeY);
    }

    dock(dockedNeighbor) {
        super.dock(dockedNeighbor);
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    resizeCavity() {
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    unDock(event) {
        super.unDock(event);
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }
}

class ConcavityTailFirst extends Tail {
    constructor(svg, startOfShapeY) {
        super(svg, startOfDock + shapesWallsWidth, startOfShapeY);
    }

    dock(dockedNeighbor) {
        super.dock(dockedNeighbor);
        this.JSParent.body.moveFirstBar(dockedNeighbor.JSParent.head.getHeightOfAllBellow());
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    resizeCavity() {
        this.JSParent.body.moveFirstBar(this.dockedNeighbor.JSParent.head.getHeightOfAllBellow());
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    unDock(event) {
        super.unDock(event);
        this.JSParent.body.moveFirstBar(shapesWallsWidth + heightOfBumb);
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }
}

class ConcavityTailSecond extends Tail {
    constructor(svg, startOfShapeY) {
        super(svg, startOfDock + shapesWallsWidth, startOfShapeY);
    }

    dock(dockedNeighbor) {
        super.dock(dockedNeighbor);
        this.JSParent.body.moveSecondBar(dockedNeighbor.JSParent.head.getHeightOfAllBellow());
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    resizeCavity() {
        this.JSParent.body.moveSecondBar(this.dockedNeighbor.JSParent.head.getHeightOfAllBellow());
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }

    unDock(event) {
        super.unDock(event);
        this.JSParent.body.moveSecondBar(shapesWallsWidth + heightOfBumb);
        if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null)
            this.JSParent.head.dockedNeighbor.resizeCavity();
    }
}

////////////////////////////////////////////////////////////////////////
//      TITLES
////////////////////////////////////////////////////////////////////////

class Title {
    constructor(svg, left, top, text) {
        this.text = text;   // for logging/saving purposes

        this.x = left;

        this.textEl = document.createElementNS(svg.namespaceURI, 'text');
        this.textEl.setAttribute('x', left);
        this.textEl.setAttribute('y', top);
        this.textEl.setAttribute('fill', titlesColor);
        this.textEl.textContent = text;
        this.textEl.setAttribute('class', 'codingblocktitle');
    }
}

class LeftTitle extends Title {   // example: the "times" of "repeat times"
    constructor(svg, left, top, text) {
        super(svg, left, top, text);
        this.left = left;   // "times" could be at any offset appart of "repeat" due to the text box in between
    }
}

////////////////////////////////////////////////////////////////////////
//      BODY
////////////////////////////////////////////////////////////////////////

class Body {
    constructor(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        // Body could be of various color combinations because its childrens will be of various types and colors
        this.colorRange = colorRange;

        // numerical representation of the path that is easy to blend
        this.numericalPathOriginal = numericalPath.coords.slice(0);     // this one should not be modified....NEVER
        this.numericalPath = numericalPath;     // work and make changes on this array

        // used to easy references upwards, because if I go upwards like parentElement.parentElement.. it will send me through the DOM and this hierarchy is in JS
        this.JSParent = null;

        // some of those are never used, sorry, this is not a Mona Lisa 
        this.topBarHeight = topBarHeight;
        this.originalTopBarHeight = topBarHeight;

        this.samplers = samplers;

        this.width = 0;
        this.height = 0;
        this.updateDimensions();

        // this is the reference to the path that can be used in DOM
        this.path = path;
        this.pathFeel = pathFeel;

        // color transition variables
        this.currentColorFactor = 0;
        this.coloringIn = false;
        this.coloringOut = false;
    }

    updateDimensions() {
        this.width = this.numericalPath.coords[this.samplers.widhtSampler];
        this.height = this.numericalPath.coords[this.samplers.heightSampler];
    }

    updateColorByFactor(colorFactor) {
        this.currentColorFactor = clampZeroOne(colorFactor);
        this.path.setAttribute('style', 'fill:#' + interpolateColors(this.colorRange, this.currentColorFactor));
    }

    updateColor(newColor) {
        this.path.setAttribute('style', 'fill:' + newColor);
    }
}

class DynamicBarSingleBody extends Body {
    constructor(colorRange, path, pathFeel, numericalPath, samplers, inputParams, topBarHeight) {
        super(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight);
        this.inputWidth = inputParams.inputWidth;
        this.inputHeight = inputParams.inputHeight;
        this.inputX = inputParams.inputX;
    }

    resizeTopBar(inputBoxNewWidth, inputBoxNewHeight) {

    }
}

const DoubleBody = superclass => class extends superclass {
    moveFirstBar(height) {
        this.firstCavityHeight = height - heightOfBumb;
        for (let i = 0; i < this.numericalPathOriginal.length; i++)
            this.numericalPath.coords[i] = this.numericalPathOriginal[i];

        bendBarBySamplers(this.samplers.secondBarSamplers,
                               this.topBarHeight + this.firstCavityHeight,
                               this.numericalPathOriginal[this.samplers.secondBarSamplers[2]],
                               this);

        if (this.JSParent.tail !== null) {
            this.JSParent.tail.movePathPosition(this.firstCavityHeight + this.topBarHeight + shapesWallsWidth);
            if (this.JSParent.tail.dockedNeighbor !== null) {
                this.JSParent.tail.dock(this.JSParent.tail.dockedNeighbor);
            }
        }

        redrawSVG(this.JSParent);
    }
}

function bendBarBySamplers(samplers, height, originalHeight, body) {
    for (let i = 0; i < samplers.length; i++) {
        body.numericalPath.coords[samplers[i]] = (body.numericalPathOriginal[samplers[i]] + (height - originalHeight));
    }
}

const TripleBody = superclass => class extends superclass {

    moveFirstBar(height) {
        this.firstCavityHeight = height - heightOfBumb;
        this.resizeWholeBody(false);
    }

    moveSecondBar(height) {
        this.secondCavityHeight = height - heightOfBumb;
        this.resizeWholeBody(true);
    }

    resizeWholeBody(isSecondCallingMe) {
        for (let i = 0; i < this.numericalPathOriginal.length; i++)
            this.numericalPath.coords[i] = this.numericalPathOriginal[i];

        bendBarBySamplers(this.samplers.secondBarSamplers,
                          this.topBarHeight + this.firstCavityHeight,
                          this.numericalPathOriginal[this.samplers.secondBarSamplers[2]],
                          this);

        if (this.JSParent.tail2 !== null) {
            this.JSParent.tail2.movePathPosition(this.firstCavityHeight + this.topBarHeight + shapesWallsWidth);
            if (this.JSParent.tail2.dockedNeighbor !== null && !isSecondCallingMe) {
                this.JSParent.tail2.dock(this.JSParent.tail2.dockedNeighbor);
            }
        }

        this.JSParent.floatingTitle.textEl.setAttribute('y', this.topBarHeight + this.firstCavityHeight + titleOffsetY);

        bendBarBySamplers(this.samplers.thirdBarSamplers,
                          this.topBarHeight + this.firstCavityHeight + shapesWallsWidth + this.secondCavityHeight,
                          this.numericalPathOriginal[this.samplers.thirdBarSamplers[2]],
                          this);

        if (this.JSParent.tail !== null) {
            this.JSParent.tail.movePathPosition(this.firstCavityHeight + this.topBarHeight + this.secondCavityHeight + shapesWallsWidth * 2);
            if (this.JSParent.tail.dockedNeighbor !== null) {
                this.JSParent.tail.dock(this.JSParent.tail.dockedNeighbor);
            }
        }

        redrawSVG(this.JSParent);
    }
}

class FixedTopBarDoubleBody extends DoubleBody(Body) {
    constructor(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        super(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight);
    }
}

class FixedTopBarTripleBody extends TripleBody(Body) {
    constructor(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        super(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight);
    }
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
    
    if (!isDouble && !isTriple) {   // if it is single bar line diretly to the buttom right corner
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
            if (sel == 0) {
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

class CodingBlock {
    constructor(corpse, svg, x, y, type) {

        let self = this;

        this.executingNow = false;

        // this is used to z reorder elements
        this.id = allCodingBlocks.length;
        allCodingBlocks.push(self);

        // create the container to hold it all
        this.container = document.createElement('div');
        if (type === 'dynamic') {
            divCodeGround.appendChild(this.container);
        } else {
            inventory.appendChild(this.container);
        }

        this.container.style.position = 'absolute';
        this.container.style.left = x + 'px';
        this.container.style.top = y + 'px';
        this.container.style.width = '0px';
        this.container.style.height = '0px';

        this.svg = svg;

        // body is obligatory for codingBlocks, no need to check if exists as property inside corpse tupple
        this.body = corpse.body;
        this.body.JSParent = self;
        this.container.appendChild(this.svg);

        // make it feel only drawn areas
        this.svg.setAttribute('style', 'pointer-events:none');
        this.body.pathFeel.setAttribute('style', 'pointer-events:fill;cursor:pointer');

        // attach other elements if present
        this.head = null;
        if (corpse.hasOwnProperty('head')) {
            this.head = corpse.head;
            this.head.JSParent = self;
        }

        this.tails = []; // use this array only for easy .map, because it hurts to do so much IFs

        // let say "tail" will correspond to the bottom most tail used to attach other blocs
        this.tail = null;
        if (corpse.hasOwnProperty('tail')) {
            this.tail = corpse.tail;
            this.tail.JSParent = self;
            if (type === 'dynamic') this.tails.push(this.tail);
            else this.tail.movePathPosition(this.tail.startOfShapeY);
        }

        this.chained = null;

        // let say "tail1" stands for the dock that is on the bottom under the top-most bar
        this.tail1 = null;
        if (corpse.hasOwnProperty('tail1')) {
            this.tail1 = corpse.tail1;
            this.tail1.JSParent = self;
            if (type === 'dynamic') this.tails.push(this.tail1);
            else this.tail1.movePathPosition(this.tail1.startOfShapeY);
        }

        // let use "tail2" for the docking ot the bottom of the middle bar in triple fork coddingBlocks
        this.tail2 = null;
        if (corpse.hasOwnProperty('tail2')) {
            this.tail2 = corpse.tail2;
            this.tail2.JSParent = self;
            if (type === 'dynamic') this.tails.push(this.tail2);
            else this.tail2.movePathPosition(this.tail2.startOfShapeY);
        }

        for (let i = 0; i < this.tails.length; i++) {
            this.tails[i].id = allTails.length;
            allTails.push(this.tails[i]);
        }

        redrawSVG(self);

        // common visual mouse listeners for all the CodingBlocks

        this.body.pathFeel.addEventListener('mouseenter', function () {
            document.documentElement.style.cursor = 'pointer';  // needed! 
            if (!dragging) {
                setMeOnTop(self);
                startColorTransitionIN(self.body);
            }
        });

        this.body.pathFeel.addEventListener('mouseout', function () {
            if (!dragging) {
                document.documentElement.style.cursor = 'default';  // needed!
                startColorTransitionOUT(self.body);
            }
        });

        this.body.pathFeel.addEventListener('mousedown', function (e) {
            self.mouseDownCoddingBlock(e, self);
        });
    }

    mouseDownCoddingBlock(e, self) {
        blockOnFocus = self;
        startColorTransitionIN(self.body);

        startingPosOfTheBlockBeingDragged = self.container.getBoundingClientRect();

        mouseOffsetX = (e.pageX - startingPosOfTheBlockBeingDragged.left);
        mouseOffsetY = (e.pageY - startingPosOfTheBlockBeingDragged.top);
    }

    action() {
        //.....
        if (this.tail !== null && this.tail.dockedNeighbor !== null) {
            this.tail.dockedNeighbor.JSParent.action();
        } else {
            this.loopBack();
        }
    }

    loopBack() {
        //......
        if (this.head !== null && this.head.dockedNeighbor !== null) {
            this.head.dockedNeighbor.JSParent.loopBack();
        }
    }
}

function startColorTransitionIN(body) {
    body.coloringIn = true;
    body.coloringOut = false;  // stop the other timer if running

    colringIN();

    function colringIN() {
        if (body.coloringIn) {
            if (body.currentColorFactor < 1) {
                body.currentColorFactor += blocksColorTransitionStep;
                body.updateColorByFactor(body.currentColorFactor);
                //updateNeigborsColor(body, 1);
                window.requestAnimationFrame(colringIN);
            } else {
                body.coloringIn = false;
            }
        }
    }
}

function startColorTransitionOUT(body) {
    body.coloringIn = false;  // stop the other timer if running
    body.coloringOut = true;

    colringOUT();

    function colringOUT() {
        if (body.coloringOut) {
            if (body.currentColorFactor > 0) {
                body.currentColorFactor -= blocksColorTransitionStep;
                body.updateColorByFactor(body.currentColorFactor);
                //updateNeigborsColor(body, -1);
                window.requestAnimationFrame(colringOUT);
            } else {
                body.coloringOut = false;
            }
        }
    }
}

// this function is abandoned. had no time and the fancy effect to be achieved was not so important
//function updateNeigborsColor(body, direciton) {
//    if (body.JSParent.head !== null) {
//        if (body.JSParent.head.dockedNeighbor !== null) {
//            if (body.JSParent.head.dockedNeighbor.type === 'tail1' || this.JSParent.head.dockedNeighbor.type === 'tail2') {
//                body.JSParent.head.dockedNeighbor.JSParent.body.currentColorFactor += blocksColorTransitionStep / 2 * direciton;
//                body.JSParent.head.dockedNeighbor.JSParent.body.updateColorByFactor(body.JSParent.head.dockedNeighbor.JSParent.body.currentColorFactor);
//            }
//        }
//    }
//    for (let i = 0; i < body.JSParent.tails.length; i++) {
//        if (body.JSParent.tails[i].type !== 'tail') {
//            if (body.JSParent.tails[i].dockedNeighbor !== null) {
//                body.JSParent.tails[i].dockedNeighbor.body.currentColorFactor += blocksColorTransitionStep / 2 * direciton;
//                body.JSParent.tails[i].dockedNeighbor.body.updateColorByFactor(body.JSParent.tails[i].dockedNeighbor.body.currentColorFactor);
//            }
//        }
//    }
//}

class StaticInventoryCodingBlock extends CodingBlock {
    constructor(corpse, svg) {
        super(corpse, svg, staticShapesLeftMargin, currentOffsetInInventory, 'static');
        currentOffsetInInventory += staticShapesTopMargin + this.body.height;
    }

    mouseDownCoddingBlock(e, self) {
        dragging = true;
        creatorMode = true;

        postionOfCreator = this.container.getBoundingClientRect();
        let newMe = this.createOneOfMe(0 - (positionOfCoddingGround.left - postionOfCreator.left), postionOfCreator.top);
        setMeOnTop(newMe);

        startColorTransitionOUT(this.body);

        super.mouseDownCoddingBlock(e, newMe);

        precomputeAllPositions(newMe);
    }

    createOneOfMe(x, y) { }
}

class DraggedCodingBlock extends CodingBlock {
    constructor(corpse, svg, x, y) {
        super(corpse, svg, x, y, 'dynamic');
    }

    mouseDownCoddingBlock(e) {
        document.documentElement.style.cursor = 'pointer';
        dragging = true;
        super.mouseDownCoddingBlock(e, this);
    }

    mouseMoveCoddingBlock(event) {
        currentPosOfTheBlockBeingDragged = this.container.getBoundingClientRect();

        this.container.style.left = ((event.pageX - mouseOffsetX) - positionOfCoddingGround.left) + 'px';
        this.container.style.top = ((event.pageY - mouseOffsetY) - positionOfCoddingGround.top) + 'px';
    }

    mouseUpCoddingBlock() {
        if (creatorMode) {
            creatorMode = false;
            setMeOnTop(blockOnFocus);
        }
        dragging = false;
    }
}

class KeyEventOnceBlock extends DraggedCodingBlock {
    constructor(corpse, svg, x, y, key) {
        super(corpse, svg, x, y);
        this.keyIAmReactingTo = key;
        allKeyEvenListeners.push(this);
        this.alreadyCalledChild = false;
    }

    setKey(e) {
        if (e.keyCode == this.keyIAmReactingTo) {
            if (!this.alreadyCalledChild) {
                this.body.updateColor('#FF0000');
                this.alreadyCalledChild = true;
                if (this.tail.dockedNeighbor != null)
                    this.tail.dockedNeighbor.JSParent.action();
            }
        }
    }

    releaseKey(e) {
        if (e.keyCode == this.keyIAmReactingTo) {
            this.body.updateColor(loopsColor.inColor);
            this.alreadyCalledChild = false;
        }
    }

    loopBack() { }
}

class KeyEventLoopBlock extends DraggedCodingBlock {
    constructor(corpse, svg, x, y, key) {
        super(corpse, svg, x, y);
        this.keyIAmReactingTo = key;
        allKeyEvenListeners.push(this);
        allKeyEvenListenersPools.push(this);
        this.imBuzzy = false;
        this.myKeyPressed - false;
    }
    // events could be concurrent(bugy), that is why i decided to rely on the main timer
    keyEventPool() {
        if (this.myKeyPressed) {
            if (this.tail1.dockedNeighbor !== null) {
                if (!this.imBuzzy) {
                    this.imBuzzy = true;
                    this.tail1.dockedNeighbor.JSParent.action();
                }
            }
        }
    }

    setKey(e) {
        if (e.keyCode == this.keyIAmReactingTo) {
            this.body.updateColor('#FF0000');
            this.myKeyPressed = true;
        }
    }

    releaseKey(e) {
        if (e.keyCode == this.keyIAmReactingTo) {
            this.body.updateColor(loopsColor.inColor);
            this.myKeyPressed = false;
        }
    }

    loopBack() {
        this.imBuzzy = false;
    }
}

// there is only one way to delete some block and it si by dragging it at the trash bin or outside coding area, so delleteable expands daragged
class DelleteableCodingBlock extends DraggedCodingBlock {
    constructor(corpse, svg, x, y) {
        super(corpse, svg, x, y);

        // used to calculate distance to trash in order to update opacity
        this.bariCentreX = this.body.width / 2;
        this.bariCentreY = this.body.height / 2;
    }

    // code to react to trashBin
    mouseMoveCoddingBlock(event) {
        super.mouseMoveCoddingBlock(event);
        distToTrashBin = distance2D(this.bariCentreX + this.container.offsetLeft, this.bariCentreY + this.container.offsetTop,
                                    trashBinCenterX, trashBinCenterY);

        if (distToTrashBin < maxTrashBinReactionDistance) {
            this.container.style.opacity = interpolateValues(minOpacityForAll, maxOpacityForAll, 1 / (maxTrashBinReactionDistance / distToTrashBin)).toFixed(2);
        }
    }

    mouseUpCoddingBlock() {
        super.mouseUpCoddingBlock();
        
        endingPosOfTheBlockBeingDragged = this.container.getBoundingClientRect();

        // destroy element if dropped out of the div of the coding area
        if ((endingPosOfTheBlockBeingDragged.left + this.body.width < positionOfCoddingGround.left) ||
            (endingPosOfTheBlockBeingDragged.top + this.body.height < positionOfCoddingGround.top) ||
            (endingPosOfTheBlockBeingDragged.left > positionOfCoddingGround.left + divCodeGround.clientWidth) ||
            (endingPosOfTheBlockBeingDragged.top > positionOfCoddingGround.top + divCodeGround.clientHeight) ||
            // or if dropped over the trashbin
            (distToTrashBin <= trashBinDistDestroy)) {
            console.log("deleted");
            this.destroy();
        }
    }

    destroy() {
        // first of all destroy references and dettach docks

        //allCodingBlocks.splice(this.id, 1);
        //for (let i = 0; i < this.tails; i++) {
        //    this.tails[i].destroy();
        //}
        //this.container.parentElement.removeChild(this.container);

        // recursivelly destroy all children
    }
}

var preComputedPositions = [];

function precomputeAllPositions(self) {
    // precompute positions for all the heads on MouseDown instrad doing it on MouseMove
    for (drag_i = 0; drag_i < allTails.length; drag_i++) {
        preComputedPositions[drag_i] = allTails[drag_i].JSParent.container.getBoundingClientRect();
    }
}

class DockingCodingFigure extends DelleteableCodingBlock {
    constructor(corpse, svg, x, y) {
        super(corpse, svg, x, y);
    }

    mouseDownCoddingBlock(event) {
        super.mouseDownCoddingBlock(event, this);
        precomputeAllPositions(this);
        distance = 100000;
        if (this.head.dockedNeighbor !== null)
            this.head.dockedNeighbor.unDock(event);
    }

    mouseMoveCoddingBlock(event) {
        super.mouseMoveCoddingBlock(event);

        shortestDist = 10000;

        // load all the distances to all the docks except itself in the coding ground
        for (drag_i = 0; drag_i < allTails.length; drag_i++) {
            if (allTails[drag_i].JSParent.id != this.id) {
                if (allTails[drag_i].dockedNeighbor === null) {
                    distance = distance2D(this.head.centerOfShapeX + currentPosOfTheBlockBeingDragged.left, this.head.centerOfShapeY + currentPosOfTheBlockBeingDragged.top,
                                      allTails[drag_i].centerOfShapeX + preComputedPositions[drag_i].left, allTails[drag_i].centerOfShapeY + preComputedPositions[drag_i].top);
                    if (distance < shortestDist) {
                        shortestDist = distance;
                        nearestTail = allTails[drag_i];
                    }

                    if (distance > maxDockingReactionDistance) {
                        allTails[drag_i].updateColorByFactor(0);
                    } else {
                        allTails[drag_i].updateColorByFactor(1 - (1 / (maxDockingReactionDistance / shortestDist)));
                    }
                }
            }   
        }

        if (shortestDist > maxDockingReactionDistance) {
            this.head.updateColorByFactor(0);
        } else {
            this.head.updateColorByFactor(1 - (1 / (maxDockingReactionDistance / shortestDist)));
        }
    }

    mouseUpCoddingBlock() {
        super.mouseUpCoddingBlock();
        for (drag_i = 0; drag_i < allTails.length; drag_i++) {
            allTails[drag_i].updateColorByFactor(0);
        }

        for (drag_i = 0; drag_i < allCodingBlocks.length; drag_i++) {
            if (allCodingBlocks[drag_i].head !== null) {
                allCodingBlocks[drag_i].head.updateColorByFactor(0);
            }
        }

        if (shortestDist < minDockingDistance) {
            this.head.dockedNeighbor = nearestTail;
            nearestTail.dock(this.head);
        } else {
            if (this.head.dockedNeighbor !== null) {
                this.head.dockedNeighbor.unDock();
                this.head.dockedNeighbor = null;
            }
        }
    }
};

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////        START OF THE VISIBLE CLASSES
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////

class ForeverBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, false, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'FOREVER')], true, false);

        super(corpse, svg, x, y);

        allKeyEvenListenersPools.push(this);
        this.imBuzzy = false;
        this.started = false;
    }

    keyEventPool() {
        if (this.started) {
            if (this.tail1.dockedNeighbor !== null) {
                if (!this.imBuzzy) {
                    this.imBuzzy = true;
                    this.tail1.dockedNeighbor.JSParent.action();
                }
            }
        }
    }

    loopBack() {
        this.imBuzzy = false;
    }

    action() {
        this.started = true;
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryForeverBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, false, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'FOREVER')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new ForeverBlock(x, y);
    }
}

class IfElseBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let elseTitle = new Title(svg, shapesWallsWidth, shapesWallsWidth * 2 + titleOffsetY + heightOfBumb, 'ELSE');

        let corpse = CreateShape(svg, loopsColor, true, true, [
            new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF'), elseTitle], true, true);

        super(corpse, svg, x, y);
        this.floatingTitle = elseTitle;
    } 
}

///////////////////////////////////////////////////////////////////

class StaticInventoryIfElseBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let elseTitle = new Title(svg, shapesWallsWidth, shapesWallsWidth * 2 + titleOffsetY + heightOfBumb, 'ELSE');

        let corpse = CreateShape(svg, loopsColor, true, true, [
            new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF'), elseTitle], true, true);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new IfElseBlock(x, y);
    }
}

///////////////////////////////////////////////////////////////////

class IfBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF')], true, false);

        super(corpse, svg, x, y);
    } 
}

///////////////////////////////////////////////////////////////////

class StaticInventoryIfBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new IfBlock(x, y);
    }
}

///////////////////////////////////////////////////////////////////

class StepLeftBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);

        super(corpse, svg, x, y);
    }

    action() {
        if (girl !== 'undefined') {
            girl.stepLeft();
        }
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepLeftBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new StepLeftBlock(x, y);
    }
}

///////////////////////////////////////////////////////////////////

class StepRigthBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);

        super(corpse, svg, x, y);
    }

    action() {
        if (girl !== 'undefined') {
            girl.stepRight();
        }
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepRightBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new StepRigthBlock(x, y);
    }
}

///////////////////////////////////////////////////////////////////

class StepUPBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);

        super(corpse, svg, x, y);
    }

    action() {
        if (girl !== 'undefined') {
            girl.stepUp();
        }
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepUPBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new StepUPBlock(x, y);
    }
}

///////////////////////////////////////////////////////////////////

class StepDownBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);

        super(corpse, svg, x, y);
    }

    action() {
        if (girl !== 'undefined') {
            girl.stepDown();
        }
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepDownBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new StepDownBlock(x, y);
    }
}

//////////////////////////////////////////////////////////////////

class StartBlock extends DelleteableCodingBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetX, titleOffsetY, 'START')], false, false);
        super(corpse, svg, x, y);
    }
}

class StaticInventoryStartBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'START')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new StartBlock(x, y);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

class KeyLeftBlock extends KeyEventLoopBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY LEFT')], true, false);
        super(corpse, svg, x, y, 37);
    }
}

class StaticInventoryKeyLeftBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY LEFT')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyLeftBlock(x, y);
    }
}

/////////////////////////////////////////////////////////

class KeyLeftOnceBlock extends KeyEventOnceBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY LEFT')], false, false);
        super(corpse, svg, x, y, 37);
    }
}

class StaticInventoryKeyLeftOnceBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY LEFT')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyLeftOnceBlock(x, y);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

class KeyUpBlock extends KeyEventLoopBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY UP')], true, false);
        super(corpse, svg, x, y, 38);
    }
}

class StaticInventoryKeyUpBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY UP')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyUpBlock(x, y);
    }
}

/////////////////////////////////////////////////////////

class KeyUpOnceBlock extends KeyEventOnceBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY UP')], false, false);
        super(corpse, svg, x, y, 38);
    }
}

class StaticInventoryKeyUpOnceBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY UP')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyUpOnceBlock(x, y);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

class KeyRightBlock extends KeyEventLoopBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY RIGHT')], true, false);
        super(corpse, svg, x, y, 39);
    }
}

class StaticInventoryKeyRightBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY RIGHT')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyRightBlock(x, y);
    }
}

/////////////////////////////////////////////////////////

class KeyRightOnceBlock extends KeyEventOnceBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY RIGHT')], false, false);
        super(corpse, svg, x, y, 39);
    }
}

class StaticInventoryKeyRightOnceBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY RIGHT')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyRightOnceBlock(x, y);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

class KeyDownBlock extends KeyEventLoopBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY DOWN')], true, false);
        super(corpse, svg, x, y, 40);
    }
}

class StaticInventoryKeyDownBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY DOWN')], true, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyDownBlock(x, y);
    }
}

/////////////////////////////////////////////////////////

class KeyDownOnceBlock extends KeyEventOnceBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY DOWN')], false, false);
        super(corpse, svg, x, y, 40);
    }
}

class StaticInventoryKeyDownOnceBlock extends StaticInventoryCodingBlock {
    constructor() {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY DOWN')], false, false);
        super(corpse, svg);
    }

    createOneOfMe(x, y) {
        return new KeyDownOnceBlock(x, y);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////





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
        for (main_i = 0; main_i < allKeyEvenListenersPools.length; main_i++)
            allKeyEvenListenersPools[main_i].keyEventPool();
        window.requestAnimationFrame(programLoop);
    }
}

function stopProgram() {
    programIsRunning = false;
    // restore the state
}

function keyDown(e) {
    if (e.keyCode != 123) e.preventDefault();

    if (programIsRunning) {
        for (main_i = 0; main_i < allKeyEvenListeners.length; main_i++)
            allKeyEvenListeners[main_i].setKey(e);
    }
}

function keyUp(e) {
    if (e.keyCode != 123) e.preventDefault();

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
        if (self.id != i) {
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

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////
//////////////
////                ONLY FOR TESTING PURPOSES

var imgGirl = document.getElementById('girl');

class Sprite {
    constructor(img, width, height){
        this.img = img;
        this.width = width;
        this.height = height;

        this.stepAmount = 2;
        
        // where to appear initialy inside the canvas
        this.x = canvasWidth / 2 - width / 2;
        this.y = canvasHeight / 2 - height / 2;

        // loaded to canvas
        this.alreadyLoaded = false;

        this.img.style.width = width + 'px';
        this.img.style.height = height + 'px';

        let x = this.x;
        let y = this.y;
        let image = this.img;

        this.img.addEventListener('mousedown', function () {
            if (!this.alreadyLoaded) {
                ctx2D.drawImage(image, x, y, width, height);
            }

            // add reference to inventory
            // let reference = new staticShape(svg, loopsColor, true, false, [], false, false);
            // document.getElementById('SamuilsTableId').addChild(reference.svg);
        });
    };
    
    moveTo(newX, newY) {
        this.x = newX;
        this.y = newY;
        this.redraw();
    }

    stepLeft() {
        this.x -= this.stepAmount;
        this.redraw();
    }

    stepRight() {
        this.x += this.stepAmount;
        this.redraw();
    }

    stepUp() {
        this.y -= this.stepAmount;
        this.redraw();
    }

    stepDown() {
        this.y += this.stepAmount;
        this.redraw();
    }

    turnRigth(radians) {
        this.x = newX;
        this.y = newY;
        this.redraw();
    }

    redraw() {
        ctx2D.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx2D.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

var girl = new Sprite(imgGirl, 100, 100);



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






