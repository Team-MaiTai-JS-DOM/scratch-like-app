let drag_i;
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
                //updateNeighborsColor(body, -1);
                window.requestAnimationFrame(colringOUT);
            } else {
                body.coloringOut = false;
            }
        }
    }
}

// this function is abandoned. had no time and the fancy effect to be achieved was not so important
//function updateNeighborsColor(body, direction) {
//    if (body.JSParent.head !== null) {
//        if (body.JSParent.head.dockedNeighbor !== null) {
//            if (body.JSParent.head.dockedNeighbor.type === 'tail1' || this.JSParent.head.dockedNeighbor.type === 'tail2') {
//                body.JSParent.head.dockedNeighbor.JSParent.body.currentColorFactor += blocksColorTransitionStep / 2 * direction;
//                body.JSParent.head.dockedNeighbor.JSParent.body.updateColorByFactor(body.JSParent.head.dockedNeighbor.JSParent.body.currentColorFactor);
//            }
//        }
//    }
//    for (let i = 0; i < body.JSParent.tails.length; i++) {
//        if (body.JSParent.tails[i].type !== 'tail') {
//            if (body.JSParent.tails[i].dockedNeighbor !== null) {
//                body.JSParent.tails[i].dockedNeighbor.body.currentColorFactor += blocksColorTransitionStep / 2 * direction;
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
    // events could be concurrent(buggy), that is why i decided to rely on the main timer
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

// there is only one way to delete some block and it si by dragging it at the trash bin or outside coding area, so deletable expands dragged
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
            this.destroy();
        }
    }

    destroy() {
        this.container.style.top = '-1000px';

        // first of all destroy references and detach docks

        //allCodingBlocks.splice(this.id, 1);
        //for (let i = 0; i < this.tails; i++) {
        //    this.tails[i].destroy();
        //}
        //this.container.parentElement.removeChild(this.container);

        // recursively destroy all children
    }
}

let preComputedPositions = [];

function precomputeAllPositions(self) {
    // precompute positions for all the heads on MouseDown instead doing it on MouseMove
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
}

////////////////////////////////////////////////////////////////////
////        START OF THE VISIBLE CLASSES
////////////////////////////////////////////////////////////////////

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

class IfBlock extends DockingCodingFigure {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF')], true, false);

        super(corpse, svg, x, y);
    }
}

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

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

class StepLeftBlock extends DockingCodingFigure {
    constructor(x, y, sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);
        super(corpse, svg, x, y);
        this.sprite = sprite;
    }

    action() {
        this.sprite.stepLeft();
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepLeftBlock extends StaticInventoryCodingBlock {
    constructor(sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);
        super(corpse, svg);
        this.sprite = sprite;
    }

    createOneOfMe(x, y) {
        return new StepLeftBlock(x, y, this.sprite);
    }
}

///////////////////////////////////////////////////////////////////

class StepRigthBlock extends DockingCodingFigure {
    constructor(x, y, sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);
        super(corpse, svg, x, y);
        this.sprite = sprite;
    }

    action() {
        this.sprite.stepRight();
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepRightBlock extends StaticInventoryCodingBlock {
    constructor(sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);
        super(corpse, svg);
        this.sprite = sprite;
    }

    createOneOfMe(x, y) {
        return new StepRigthBlock(x, y, this.sprite);
    }
}

///////////////////////////////////////////////////////////////////

class StepUPBlock extends DockingCodingFigure {
    constructor(x, y, sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);
        super(corpse, svg, x, y);
        this.sprite = sprite;
    }

    action() {
        this.sprite.stepUp();
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepUPBlock extends StaticInventoryCodingBlock {
    constructor(sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);
        super(corpse, svg);
        this.sprite = sprite;
    }

    createOneOfMe(x, y) {
        return new StepUPBlock(x, y, this.sprite);
    }
}

///////////////////////////////////////////////////////////////////

class StepDownBlock extends DockingCodingFigure {
    constructor(x, y, sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);
        super(corpse, svg, x, y);
        this.sprite = sprite;
    }

    action() {
        this.sprite.stepDown();
        super.action();
    }
}

///////////////////////////////////////////////////////////////////

class StaticInventoryStepDownBlock extends StaticInventoryCodingBlock {
    constructor(sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);
        super(corpse, svg);
        this.sprite = sprite;
    }

    createOneOfMe(x, y) {
        return new StepDownBlock(x, y, this.sprite);
    }
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

class StartBlock extends DelleteableCodingBlock {
    constructor(x, y) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'START')], false, false);
        super(corpse, svg, x, y);

        let self = this;

        document.getElementById('startButton').addEventListener('mousedown', function() {
            self.action();
        });
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

class AnimateBlock extends DockingCodingFigure {
    constructor(x, y, sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ANIMATE')], false, false);
        super(corpse, svg, x, y, 40);
        this.sprite = sprite;
    }

    action() {
        this.sprite.animationPlay();
        super.action();
    }
}

class StaticInventoryAnimateBlock extends StaticInventoryCodingBlock {
    constructor(sprite) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ANIMATE')], false, false);
        super(corpse, svg);
        this.sprite = sprite;
    }

    createOneOfMe(x, y) {
        return new AnimateBlock(x, y, this.sprite);
    }
}





if (typeof module !== 'undefined') {
  module.exports = (function(){ 
    return [
      CodingBlock,
      StaticInventoryCodingBlock,
      DraggedCodingBlock,
      KeyEventOnceBlock,
      KeyEventLoopBlock,
      DelleteableCodingBlock,
      DockingCodingFigure,
      ForeverBlock,
      StaticInventoryForeverBlock,
      IfElseBlock,
      StaticInventoryIfElseBlock,
      IfBlock,
      StaticInventoryIfBlock,
      StepLeftBlock
    ]; 
  })();
}
