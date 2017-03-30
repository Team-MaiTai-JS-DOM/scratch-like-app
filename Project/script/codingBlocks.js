'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var drag_i = void 0;

var CodingBlock = function () {
    function CodingBlock(corpse, svg, x, y, type) {
        _classCallCheck(this, CodingBlock);

        var self = this;
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
            if (type === 'dynamic') this.tails.push(this.tail);else this.tail.movePathPosition(this.tail.startOfShapeY);
        }

        this.chained = null;

        // let say "tail1" stands for the dock that is on the bottom under the top-most bar
        this.tail1 = null;
        if (corpse.hasOwnProperty('tail1')) {
            this.tail1 = corpse.tail1;
            this.tail1.JSParent = self;
            if (type === 'dynamic') this.tails.push(this.tail1);else this.tail1.movePathPosition(this.tail1.startOfShapeY);
        }

        // let use "tail2" for the docking ot the bottom of the middle bar in triple fork coddingBlocks
        this.tail2 = null;
        if (corpse.hasOwnProperty('tail2')) {
            this.tail2 = corpse.tail2;
            this.tail2.JSParent = self;
            if (type === 'dynamic') this.tails.push(this.tail2);else this.tail2.movePathPosition(this.tail2.startOfShapeY);
        }

        for (var i = 0; i < this.tails.length; i++) {
            this.tails[i].id = allTails.length;
            allTails.push(this.tails[i]);
        }

        redrawSVG(self);

        // common visual mouse listeners for all the CodingBlocks

        this.body.pathFeel.addEventListener('mouseenter', function () {
            document.documentElement.style.cursor = 'pointer'; // needed!
            if (!dragging) {
                setMeOnTop(self);
                startColorTransitionIN(self.body);
            }
        });

        this.body.pathFeel.addEventListener('mouseout', function () {
            if (!dragging) {
                document.documentElement.style.cursor = 'default'; // needed!
                startColorTransitionOUT(self.body);
            }
        });

        this.body.pathFeel.addEventListener('mousedown', function (e) {
            self.mouseDownCoddingBlock(e, self);
        });
    }

    _createClass(CodingBlock, [{
        key: 'mouseDownCoddingBlock',
        value: function mouseDownCoddingBlock(e, self) {
            blockOnFocus = self;
            startColorTransitionIN(self.body);

            startingPosOfTheBlockBeingDragged = self.container.getBoundingClientRect();

            mouseOffsetX = e.pageX - startingPosOfTheBlockBeingDragged.left;
            mouseOffsetY = e.pageY - startingPosOfTheBlockBeingDragged.top;
        }
    }]);

    return CodingBlock;
}();

function startColorTransitionIN(body) {
    body.coloringIn = true;
    body.coloringOut = false; // stop the other timer if running

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
    body.coloringIn = false; // stop the other timer if running
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

var StaticInventoryCodingBlock = function (_CodingBlock) {
    _inherits(StaticInventoryCodingBlock, _CodingBlock);

    function StaticInventoryCodingBlock(corpse, svg) {
        _classCallCheck(this, StaticInventoryCodingBlock);

        var _this = _possibleConstructorReturn(this, (StaticInventoryCodingBlock.__proto__ || Object.getPrototypeOf(StaticInventoryCodingBlock)).call(this, corpse, svg, staticShapesLeftMargin, currentOffsetInInventory, 'static'));

        currentOffsetInInventory += staticShapesTopMargin + _this.body.height;
        return _this;
    }

    _createClass(StaticInventoryCodingBlock, [{
        key: 'mouseDownCoddingBlock',
        value: function mouseDownCoddingBlock(e, self) {
            dragging = true;
            creatorMode = true;

            postionOfCreator = this.container.getBoundingClientRect();
            var newMe = this.createOneOfMe(0 - (positionOfCoddingGround.left - postionOfCreator.left), postionOfCreator.top);
            setMeOnTop(newMe);

            startColorTransitionOUT(this.body);

            _get(StaticInventoryCodingBlock.prototype.__proto__ || Object.getPrototypeOf(StaticInventoryCodingBlock.prototype), 'mouseDownCoddingBlock', this).call(this, e, newMe);

            precomputeAllPositions(newMe);
        }
    }, {
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {}
    }]);

    return StaticInventoryCodingBlock;
}(CodingBlock);

var DraggedCodingBlock = function (_CodingBlock2) {
    _inherits(DraggedCodingBlock, _CodingBlock2);

    function DraggedCodingBlock(corpse, svg, x, y) {
        _classCallCheck(this, DraggedCodingBlock);

        return _possibleConstructorReturn(this, (DraggedCodingBlock.__proto__ || Object.getPrototypeOf(DraggedCodingBlock)).call(this, corpse, svg, x, y, 'dynamic'));
    }

    _createClass(DraggedCodingBlock, [{
        key: 'mouseDownCoddingBlock',
        value: function mouseDownCoddingBlock(e) {
            document.documentElement.style.cursor = 'pointer';
            dragging = true;
            _get(DraggedCodingBlock.prototype.__proto__ || Object.getPrototypeOf(DraggedCodingBlock.prototype), 'mouseDownCoddingBlock', this).call(this, e, this);
        }
    }, {
        key: 'mouseMoveCoddingBlock',
        value: function mouseMoveCoddingBlock(event) {
            currentPosOfTheBlockBeingDragged = this.container.getBoundingClientRect();

            this.container.style.left = event.pageX - mouseOffsetX - positionOfCoddingGround.left + 'px';
            this.container.style.top = event.pageY - mouseOffsetY - positionOfCoddingGround.top + 'px';
        }
    }, {
        key: 'mouseUpCoddingBlock',
        value: function mouseUpCoddingBlock() {
            if (creatorMode) {
                creatorMode = false;
                setMeOnTop(blockOnFocus);
            }
            dragging = false;
        }
    }, {
        key: 'action',
        value: function action() {
            //.....
            if (this.tail !== null && this.tail.dockedNeighbor !== null) {
                this.tail.dockedNeighbor.JSParent.action();
            } else {
                this.loopBack();
            }
        }
    }, {
        key: 'loopBack',
        value: function loopBack() {
            //......
            if (this.head !== null && this.head.dockedNeighbor !== null) {
                this.head.dockedNeighbor.JSParent.loopBack();
            }
        }
    }]);

    return DraggedCodingBlock;
}(CodingBlock);

var KeyEventOnceBlock = function (_DraggedCodingBlock) {
    _inherits(KeyEventOnceBlock, _DraggedCodingBlock);

    function KeyEventOnceBlock(corpse, svg, x, y, key) {
        _classCallCheck(this, KeyEventOnceBlock);

        var _this3 = _possibleConstructorReturn(this, (KeyEventOnceBlock.__proto__ || Object.getPrototypeOf(KeyEventOnceBlock)).call(this, corpse, svg, x, y));

        _this3.keyIAmReactingTo = key;
        allKeyEvenListeners.push(_this3);
        _this3.alreadyCalledChild = false;
        return _this3;
    }

    _createClass(KeyEventOnceBlock, [{
        key: 'setKey',
        value: function setKey(e) {
            if (e.keyCode == this.keyIAmReactingTo) {
                if (!this.alreadyCalledChild) {
                    this.body.updateColor('#FF0000');
                    this.alreadyCalledChild = true;
                    if (this.tail.dockedNeighbor != null) this.tail.dockedNeighbor.JSParent.action();
                }
            }
        }
    }, {
        key: 'releaseKey',
        value: function releaseKey(e) {
            if (e.keyCode == this.keyIAmReactingTo) {
                this.body.updateColor(loopsColor.inColor);
                this.alreadyCalledChild = false;
            }
        }
    }, {
        key: 'loopBack',
        value: function loopBack() {}
    }]);

    return KeyEventOnceBlock;
}(DraggedCodingBlock);

var KeyEventLoopBlock = function (_DraggedCodingBlock2) {
    _inherits(KeyEventLoopBlock, _DraggedCodingBlock2);

    function KeyEventLoopBlock(corpse, svg, x, y, key) {
        _classCallCheck(this, KeyEventLoopBlock);

        var _this4 = _possibleConstructorReturn(this, (KeyEventLoopBlock.__proto__ || Object.getPrototypeOf(KeyEventLoopBlock)).call(this, corpse, svg, x, y));

        _this4.keyIAmReactingTo = key;
        allKeyEvenListeners.push(_this4);
        allKeyEvenListenersPools.push(_this4);
        _this4.imBuzzy = false;
        _this4.myKeyPressed - false;
        return _this4;
    }
    // events could be concurrent(buggy), that is why i decided to rely on the main timer


    _createClass(KeyEventLoopBlock, [{
        key: 'keyEventPool',
        value: function keyEventPool() {
            if (this.myKeyPressed) {
                if (this.tail1.dockedNeighbor !== null) {
                    if (!this.imBuzzy) {
                        this.imBuzzy = true;
                        this.tail1.dockedNeighbor.JSParent.action();
                    }
                }
            }
        }
    }, {
        key: 'setKey',
        value: function setKey(e) {
            if (e.keyCode == this.keyIAmReactingTo) {
                this.body.updateColor('#FF0000');
                this.myKeyPressed = true;
            }
        }
    }, {
        key: 'releaseKey',
        value: function releaseKey(e) {
            if (e.keyCode == this.keyIAmReactingTo) {
                this.body.updateColor(loopsColor.inColor);
                this.myKeyPressed = false;
            }
        }
    }, {
        key: 'loopBack',
        value: function loopBack() {
            this.imBuzzy = false;
        }
    }]);

    return KeyEventLoopBlock;
}(DraggedCodingBlock);

// there is only one way to delete some block and it si by dragging it at the trash bin or outside coding area, so deletable expands dragged


var DelleteableCodingBlock = function (_DraggedCodingBlock3) {
    _inherits(DelleteableCodingBlock, _DraggedCodingBlock3);

    function DelleteableCodingBlock(corpse, svg, x, y) {
        _classCallCheck(this, DelleteableCodingBlock);

        // used to calculate distance to trash in order to update opacity
        var _this5 = _possibleConstructorReturn(this, (DelleteableCodingBlock.__proto__ || Object.getPrototypeOf(DelleteableCodingBlock)).call(this, corpse, svg, x, y));

        _this5.bariCentreX = _this5.body.width / 2;
        _this5.bariCentreY = _this5.body.height / 2;
        return _this5;
    }

    // code to react to trashBin


    _createClass(DelleteableCodingBlock, [{
        key: 'mouseMoveCoddingBlock',
        value: function mouseMoveCoddingBlock(event) {
            _get(DelleteableCodingBlock.prototype.__proto__ || Object.getPrototypeOf(DelleteableCodingBlock.prototype), 'mouseMoveCoddingBlock', this).call(this, event);
            distToTrashBin = distance2D(this.bariCentreX + this.container.offsetLeft, this.bariCentreY + this.container.offsetTop, trashBinCenterX, trashBinCenterY);

            if (distToTrashBin < maxTrashBinReactionDistance) {
                this.container.style.opacity = interpolateValues(minOpacityForAll, maxOpacityForAll, 1 / (maxTrashBinReactionDistance / distToTrashBin)).toFixed(2);
            }
        }
    }, {
        key: 'mouseUpCoddingBlock',
        value: function mouseUpCoddingBlock() {
            _get(DelleteableCodingBlock.prototype.__proto__ || Object.getPrototypeOf(DelleteableCodingBlock.prototype), 'mouseUpCoddingBlock', this).call(this);

            endingPosOfTheBlockBeingDragged = this.container.getBoundingClientRect();

            // destroy element if dropped out of the div of the coding area
            if (endingPosOfTheBlockBeingDragged.left + this.body.width < positionOfCoddingGround.left || endingPosOfTheBlockBeingDragged.top + this.body.height < positionOfCoddingGround.top || endingPosOfTheBlockBeingDragged.left > positionOfCoddingGround.left + divCodeGround.clientWidth || endingPosOfTheBlockBeingDragged.top > positionOfCoddingGround.top + divCodeGround.clientHeight ||
            // or if dropped over the trashbin
            distToTrashBin <= trashBinDistDestroy) {
                this.destroy();
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.container.style.top = '-1000px';

            // first of all destroy references and detach docks

            //allCodingBlocks.splice(this.id, 1);
            //for (let i = 0; i < this.tails; i++) {
            //    this.tails[i].destroy();
            //}
            //this.container.parentElement.removeChild(this.container);

            // recursively destroy all children
        }
    }]);

    return DelleteableCodingBlock;
}(DraggedCodingBlock);

var preComputedPositions = [];

function precomputeAllPositions(self) {
    // precompute positions for all the heads on MouseDown instead doing it on MouseMove
    for (drag_i = 0; drag_i < allTails.length; drag_i++) {
        preComputedPositions[drag_i] = allTails[drag_i].JSParent.container.getBoundingClientRect();
    }
}

var DockingCodingFigure = function (_DelleteableCodingBlo) {
    _inherits(DockingCodingFigure, _DelleteableCodingBlo);

    function DockingCodingFigure(corpse, svg, x, y) {
        _classCallCheck(this, DockingCodingFigure);

        return _possibleConstructorReturn(this, (DockingCodingFigure.__proto__ || Object.getPrototypeOf(DockingCodingFigure)).call(this, corpse, svg, x, y));
    }

    _createClass(DockingCodingFigure, [{
        key: 'mouseDownCoddingBlock',
        value: function mouseDownCoddingBlock(event) {
            _get(DockingCodingFigure.prototype.__proto__ || Object.getPrototypeOf(DockingCodingFigure.prototype), 'mouseDownCoddingBlock', this).call(this, event, this);
            precomputeAllPositions(this);
            distance = 100000;
            if (this.head.dockedNeighbor !== null) this.head.dockedNeighbor.unDock(event);
        }
    }, {
        key: 'mouseMoveCoddingBlock',
        value: function mouseMoveCoddingBlock(event) {
            _get(DockingCodingFigure.prototype.__proto__ || Object.getPrototypeOf(DockingCodingFigure.prototype), 'mouseMoveCoddingBlock', this).call(this, event);

            shortestDist = 10000;

            // load all the distances to all the docks except itself in the coding ground
            for (drag_i = 0; drag_i < allTails.length; drag_i++) {
                if (allTails[drag_i].JSParent.id != this.id) {
                    if (allTails[drag_i].dockedNeighbor === null) {
                        distance = distance2D(this.head.centerOfShapeX + currentPosOfTheBlockBeingDragged.left, this.head.centerOfShapeY + currentPosOfTheBlockBeingDragged.top, allTails[drag_i].centerOfShapeX + preComputedPositions[drag_i].left, allTails[drag_i].centerOfShapeY + preComputedPositions[drag_i].top);
                        if (distance < shortestDist) {
                            shortestDist = distance;
                            nearestTail = allTails[drag_i];
                        }

                        if (distance > maxDockingReactionDistance) {
                            allTails[drag_i].updateColorByFactor(0);
                        } else {
                            allTails[drag_i].updateColorByFactor(1 - 1 / (maxDockingReactionDistance / shortestDist));
                        }
                    }
                }
            }

            if (shortestDist > maxDockingReactionDistance) {
                this.head.updateColorByFactor(0);
            } else {
                this.head.updateColorByFactor(1 - 1 / (maxDockingReactionDistance / shortestDist));
            }
        }
    }, {
        key: 'mouseUpCoddingBlock',
        value: function mouseUpCoddingBlock() {
            _get(DockingCodingFigure.prototype.__proto__ || Object.getPrototypeOf(DockingCodingFigure.prototype), 'mouseUpCoddingBlock', this).call(this);
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
    }]);

    return DockingCodingFigure;
}(DelleteableCodingBlock);

////////////////////////////////////////////////////////////////////
////        START OF THE VISIBLE CLASSES
////////////////////////////////////////////////////////////////////

var ForeverBlock = function (_DockingCodingFigure) {
    _inherits(ForeverBlock, _DockingCodingFigure);

    function ForeverBlock(x, y) {
        _classCallCheck(this, ForeverBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        var corpse = CreateShape(svg, loopsColor, true, false, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'FOREVER')], true, false);

        var _this7 = _possibleConstructorReturn(this, (ForeverBlock.__proto__ || Object.getPrototypeOf(ForeverBlock)).call(this, corpse, svg, x, y));

        allKeyEvenListenersPools.push(_this7);
        _this7.imBuzzy = false;
        _this7.started = false;
        return _this7;
    }

    _createClass(ForeverBlock, [{
        key: 'keyEventPool',
        value: function keyEventPool() {
            if (this.started) {
                if (this.tail1.dockedNeighbor !== null) {
                    if (!this.imBuzzy) {
                        this.imBuzzy = true;
                        this.tail1.dockedNeighbor.JSParent.action();
                    }
                }
            }
        }
    }, {
        key: 'loopBack',
        value: function loopBack() {
            this.imBuzzy = false;
        }
    }, {
        key: 'action',
        value: function action() {
            this.started = true;
        }
    }]);

    return ForeverBlock;
}(DockingCodingFigure);

var StaticInventoryForeverBlock = function (_StaticInventoryCodin) {
    _inherits(StaticInventoryForeverBlock, _StaticInventoryCodin);

    function StaticInventoryForeverBlock() {
        _classCallCheck(this, StaticInventoryForeverBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, false, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'FOREVER')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryForeverBlock.__proto__ || Object.getPrototypeOf(StaticInventoryForeverBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryForeverBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new ForeverBlock(x, y);
        }
    }]);

    return StaticInventoryForeverBlock;
}(StaticInventoryCodingBlock);

var IfElseBlock = function (_DockingCodingFigure2) {
    _inherits(IfElseBlock, _DockingCodingFigure2);

    function IfElseBlock(x, y) {
        _classCallCheck(this, IfElseBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        var elseTitle = new Title(svg, shapesWallsWidth, shapesWallsWidth * 2 + titleOffsetY + heightOfBumb, 'ELSE');

        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF'), elseTitle], true, true);

        var _this9 = _possibleConstructorReturn(this, (IfElseBlock.__proto__ || Object.getPrototypeOf(IfElseBlock)).call(this, corpse, svg, x, y));

        _this9.floatingTitle = elseTitle;
        return _this9;
    }

    return IfElseBlock;
}(DockingCodingFigure);

var StaticInventoryIfElseBlock = function (_StaticInventoryCodin2) {
    _inherits(StaticInventoryIfElseBlock, _StaticInventoryCodin2);

    function StaticInventoryIfElseBlock() {
        _classCallCheck(this, StaticInventoryIfElseBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        var elseTitle = new Title(svg, shapesWallsWidth, shapesWallsWidth * 2 + titleOffsetY + heightOfBumb, 'ELSE');

        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF'), elseTitle], true, true);
        return _possibleConstructorReturn(this, (StaticInventoryIfElseBlock.__proto__ || Object.getPrototypeOf(StaticInventoryIfElseBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryIfElseBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new IfElseBlock(x, y);
        }
    }]);

    return StaticInventoryIfElseBlock;
}(StaticInventoryCodingBlock);

var IfBlock = function (_DockingCodingFigure3) {
    _inherits(IfBlock, _DockingCodingFigure3);

    function IfBlock(x, y) {
        _classCallCheck(this, IfBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF')], true, false);

        return _possibleConstructorReturn(this, (IfBlock.__proto__ || Object.getPrototypeOf(IfBlock)).call(this, corpse, svg, x, y));
    }

    return IfBlock;
}(DockingCodingFigure);

var StaticInventoryIfBlock = function (_StaticInventoryCodin3) {
    _inherits(StaticInventoryIfBlock, _StaticInventoryCodin3);

    function StaticInventoryIfBlock() {
        _classCallCheck(this, StaticInventoryIfBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'IF')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryIfBlock.__proto__ || Object.getPrototypeOf(StaticInventoryIfBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryIfBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new IfBlock(x, y);
        }
    }]);

    return StaticInventoryIfBlock;
}(StaticInventoryCodingBlock);

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

var StepLeftBlock = function (_DockingCodingFigure4) {
    _inherits(StepLeftBlock, _DockingCodingFigure4);

    function StepLeftBlock(x, y, sprite) {
        _classCallCheck(this, StepLeftBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);

        var _this13 = _possibleConstructorReturn(this, (StepLeftBlock.__proto__ || Object.getPrototypeOf(StepLeftBlock)).call(this, corpse, svg, x, y));

        _this13.sprite = sprite;
        return _this13;
    }

    _createClass(StepLeftBlock, [{
        key: 'action',
        value: function action() {
            this.sprite.stepLeft();
            _get(StepLeftBlock.prototype.__proto__ || Object.getPrototypeOf(StepLeftBlock.prototype), 'action', this).call(this);
        }
    }]);

    return StepLeftBlock;
}(DockingCodingFigure);

///////////////////////////////////////////////////////////////////

var StaticInventoryStepLeftBlock = function (_StaticInventoryCodin4) {
    _inherits(StaticInventoryStepLeftBlock, _StaticInventoryCodin4);

    function StaticInventoryStepLeftBlock(sprite) {
        _classCallCheck(this, StaticInventoryStepLeftBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP LEFT')], false, false);

        var _this14 = _possibleConstructorReturn(this, (StaticInventoryStepLeftBlock.__proto__ || Object.getPrototypeOf(StaticInventoryStepLeftBlock)).call(this, corpse, svg));

        _this14.sprite = sprite;
        return _this14;
    }

    _createClass(StaticInventoryStepLeftBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new StepLeftBlock(x, y, this.sprite);
        }
    }]);

    return StaticInventoryStepLeftBlock;
}(StaticInventoryCodingBlock);

///////////////////////////////////////////////////////////////////

var StepRigthBlock = function (_DockingCodingFigure5) {
    _inherits(StepRigthBlock, _DockingCodingFigure5);

    function StepRigthBlock(x, y, sprite) {
        _classCallCheck(this, StepRigthBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);

        var _this15 = _possibleConstructorReturn(this, (StepRigthBlock.__proto__ || Object.getPrototypeOf(StepRigthBlock)).call(this, corpse, svg, x, y));

        _this15.sprite = sprite;
        return _this15;
    }

    _createClass(StepRigthBlock, [{
        key: 'action',
        value: function action() {
            this.sprite.stepRight();
            _get(StepRigthBlock.prototype.__proto__ || Object.getPrototypeOf(StepRigthBlock.prototype), 'action', this).call(this);
        }
    }]);

    return StepRigthBlock;
}(DockingCodingFigure);

///////////////////////////////////////////////////////////////////

var StaticInventoryStepRightBlock = function (_StaticInventoryCodin5) {
    _inherits(StaticInventoryStepRightBlock, _StaticInventoryCodin5);

    function StaticInventoryStepRightBlock(sprite) {
        _classCallCheck(this, StaticInventoryStepRightBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP RIGHT')], false, false);

        var _this16 = _possibleConstructorReturn(this, (StaticInventoryStepRightBlock.__proto__ || Object.getPrototypeOf(StaticInventoryStepRightBlock)).call(this, corpse, svg));

        _this16.sprite = sprite;
        return _this16;
    }

    _createClass(StaticInventoryStepRightBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new StepRigthBlock(x, y, this.sprite);
        }
    }]);

    return StaticInventoryStepRightBlock;
}(StaticInventoryCodingBlock);

///////////////////////////////////////////////////////////////////

var StepUPBlock = function (_DockingCodingFigure6) {
    _inherits(StepUPBlock, _DockingCodingFigure6);

    function StepUPBlock(x, y, sprite) {
        _classCallCheck(this, StepUPBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);

        var _this17 = _possibleConstructorReturn(this, (StepUPBlock.__proto__ || Object.getPrototypeOf(StepUPBlock)).call(this, corpse, svg, x, y));

        _this17.sprite = sprite;
        return _this17;
    }

    _createClass(StepUPBlock, [{
        key: 'action',
        value: function action() {
            this.sprite.stepUp();
            _get(StepUPBlock.prototype.__proto__ || Object.getPrototypeOf(StepUPBlock.prototype), 'action', this).call(this);
        }
    }]);

    return StepUPBlock;
}(DockingCodingFigure);

///////////////////////////////////////////////////////////////////

var StaticInventoryStepUPBlock = function (_StaticInventoryCodin6) {
    _inherits(StaticInventoryStepUPBlock, _StaticInventoryCodin6);

    function StaticInventoryStepUPBlock(sprite) {
        _classCallCheck(this, StaticInventoryStepUPBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP UP')], false, false);

        var _this18 = _possibleConstructorReturn(this, (StaticInventoryStepUPBlock.__proto__ || Object.getPrototypeOf(StaticInventoryStepUPBlock)).call(this, corpse, svg));

        _this18.sprite = sprite;
        return _this18;
    }

    _createClass(StaticInventoryStepUPBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new StepUPBlock(x, y, this.sprite);
        }
    }]);

    return StaticInventoryStepUPBlock;
}(StaticInventoryCodingBlock);

///////////////////////////////////////////////////////////////////

var StepDownBlock = function (_DockingCodingFigure7) {
    _inherits(StepDownBlock, _DockingCodingFigure7);

    function StepDownBlock(x, y, sprite) {
        _classCallCheck(this, StepDownBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);

        var _this19 = _possibleConstructorReturn(this, (StepDownBlock.__proto__ || Object.getPrototypeOf(StepDownBlock)).call(this, corpse, svg, x, y));

        _this19.sprite = sprite;
        return _this19;
    }

    _createClass(StepDownBlock, [{
        key: 'action',
        value: function action() {
            this.sprite.stepDown();
            _get(StepDownBlock.prototype.__proto__ || Object.getPrototypeOf(StepDownBlock.prototype), 'action', this).call(this);
        }
    }]);

    return StepDownBlock;
}(DockingCodingFigure);

///////////////////////////////////////////////////////////////////

var StaticInventoryStepDownBlock = function (_StaticInventoryCodin7) {
    _inherits(StaticInventoryStepDownBlock, _StaticInventoryCodin7);

    function StaticInventoryStepDownBlock(sprite) {
        _classCallCheck(this, StaticInventoryStepDownBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, true, true, [new Title(svg, shapesWallsWidth, titleOffsetY + heightOfBumb, 'STEP DOWN')], false, false);

        var _this20 = _possibleConstructorReturn(this, (StaticInventoryStepDownBlock.__proto__ || Object.getPrototypeOf(StaticInventoryStepDownBlock)).call(this, corpse, svg));

        _this20.sprite = sprite;
        return _this20;
    }

    _createClass(StaticInventoryStepDownBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new StepDownBlock(x, y, this.sprite);
        }
    }]);

    return StaticInventoryStepDownBlock;
}(StaticInventoryCodingBlock);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var StartBlock = function (_DelleteableCodingBlo2) {
    _inherits(StartBlock, _DelleteableCodingBlo2);

    function StartBlock(x, y) {
        _classCallCheck(this, StartBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'START')], false, false);

        var _this21 = _possibleConstructorReturn(this, (StartBlock.__proto__ || Object.getPrototypeOf(StartBlock)).call(this, corpse, svg, x, y));

        var self = _this21;

        document.getElementById('startButton').addEventListener('mousedown', function () {
            self.action();
        });
        return _this21;
    }

    return StartBlock;
}(DelleteableCodingBlock);

var StaticInventoryStartBlock = function (_StaticInventoryCodin8) {
    _inherits(StaticInventoryStartBlock, _StaticInventoryCodin8);

    function StaticInventoryStartBlock() {
        _classCallCheck(this, StaticInventoryStartBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'START')], false, false);
        return _possibleConstructorReturn(this, (StaticInventoryStartBlock.__proto__ || Object.getPrototypeOf(StaticInventoryStartBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryStartBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new StartBlock(x, y);
        }
    }]);

    return StaticInventoryStartBlock;
}(StaticInventoryCodingBlock);

var KeyLeftBlock = function (_KeyEventLoopBlock) {
    _inherits(KeyLeftBlock, _KeyEventLoopBlock);

    function KeyLeftBlock(x, y) {
        _classCallCheck(this, KeyLeftBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY LEFT')], true, false);
        return _possibleConstructorReturn(this, (KeyLeftBlock.__proto__ || Object.getPrototypeOf(KeyLeftBlock)).call(this, corpse, svg, x, y, 37));
    }

    return KeyLeftBlock;
}(KeyEventLoopBlock);

var StaticInventoryKeyLeftBlock = function (_StaticInventoryCodin9) {
    _inherits(StaticInventoryKeyLeftBlock, _StaticInventoryCodin9);

    function StaticInventoryKeyLeftBlock() {
        _classCallCheck(this, StaticInventoryKeyLeftBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY LEFT')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyLeftBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyLeftBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyLeftBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyLeftBlock(x, y);
        }
    }]);

    return StaticInventoryKeyLeftBlock;
}(StaticInventoryCodingBlock);

var KeyLeftOnceBlock = function (_KeyEventOnceBlock) {
    _inherits(KeyLeftOnceBlock, _KeyEventOnceBlock);

    function KeyLeftOnceBlock(x, y) {
        _classCallCheck(this, KeyLeftOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY LEFT')], false, false);
        return _possibleConstructorReturn(this, (KeyLeftOnceBlock.__proto__ || Object.getPrototypeOf(KeyLeftOnceBlock)).call(this, corpse, svg, x, y, 37));
    }

    return KeyLeftOnceBlock;
}(KeyEventOnceBlock);

var StaticInventoryKeyLeftOnceBlock = function (_StaticInventoryCodin10) {
    _inherits(StaticInventoryKeyLeftOnceBlock, _StaticInventoryCodin10);

    function StaticInventoryKeyLeftOnceBlock() {
        _classCallCheck(this, StaticInventoryKeyLeftOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY LEFT')], false, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyLeftOnceBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyLeftOnceBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyLeftOnceBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyLeftOnceBlock(x, y);
        }
    }]);

    return StaticInventoryKeyLeftOnceBlock;
}(StaticInventoryCodingBlock);

var KeyUpBlock = function (_KeyEventLoopBlock2) {
    _inherits(KeyUpBlock, _KeyEventLoopBlock2);

    function KeyUpBlock(x, y) {
        _classCallCheck(this, KeyUpBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY UP')], true, false);
        return _possibleConstructorReturn(this, (KeyUpBlock.__proto__ || Object.getPrototypeOf(KeyUpBlock)).call(this, corpse, svg, x, y, 38));
    }

    return KeyUpBlock;
}(KeyEventLoopBlock);

var StaticInventoryKeyUpBlock = function (_StaticInventoryCodin11) {
    _inherits(StaticInventoryKeyUpBlock, _StaticInventoryCodin11);

    function StaticInventoryKeyUpBlock() {
        _classCallCheck(this, StaticInventoryKeyUpBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY UP')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyUpBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyUpBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyUpBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyUpBlock(x, y);
        }
    }]);

    return StaticInventoryKeyUpBlock;
}(StaticInventoryCodingBlock);

var KeyUpOnceBlock = function (_KeyEventOnceBlock2) {
    _inherits(KeyUpOnceBlock, _KeyEventOnceBlock2);

    function KeyUpOnceBlock(x, y) {
        _classCallCheck(this, KeyUpOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY UP')], false, false);
        return _possibleConstructorReturn(this, (KeyUpOnceBlock.__proto__ || Object.getPrototypeOf(KeyUpOnceBlock)).call(this, corpse, svg, x, y, 38));
    }

    return KeyUpOnceBlock;
}(KeyEventOnceBlock);

var StaticInventoryKeyUpOnceBlock = function (_StaticInventoryCodin12) {
    _inherits(StaticInventoryKeyUpOnceBlock, _StaticInventoryCodin12);

    function StaticInventoryKeyUpOnceBlock() {
        _classCallCheck(this, StaticInventoryKeyUpOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY UP')], false, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyUpOnceBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyUpOnceBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyUpOnceBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyUpOnceBlock(x, y);
        }
    }]);

    return StaticInventoryKeyUpOnceBlock;
}(StaticInventoryCodingBlock);

var KeyRightBlock = function (_KeyEventLoopBlock3) {
    _inherits(KeyRightBlock, _KeyEventLoopBlock3);

    function KeyRightBlock(x, y) {
        _classCallCheck(this, KeyRightBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY RIGHT')], true, false);
        return _possibleConstructorReturn(this, (KeyRightBlock.__proto__ || Object.getPrototypeOf(KeyRightBlock)).call(this, corpse, svg, x, y, 39));
    }

    return KeyRightBlock;
}(KeyEventLoopBlock);

var StaticInventoryKeyRightBlock = function (_StaticInventoryCodin13) {
    _inherits(StaticInventoryKeyRightBlock, _StaticInventoryCodin13);

    function StaticInventoryKeyRightBlock() {
        _classCallCheck(this, StaticInventoryKeyRightBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY RIGHT')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyRightBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyRightBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyRightBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyRightBlock(x, y);
        }
    }]);

    return StaticInventoryKeyRightBlock;
}(StaticInventoryCodingBlock);

var KeyRightOnceBlock = function (_KeyEventOnceBlock3) {
    _inherits(KeyRightOnceBlock, _KeyEventOnceBlock3);

    function KeyRightOnceBlock(x, y) {
        _classCallCheck(this, KeyRightOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY RIGHT')], false, false);
        return _possibleConstructorReturn(this, (KeyRightOnceBlock.__proto__ || Object.getPrototypeOf(KeyRightOnceBlock)).call(this, corpse, svg, x, y, 39));
    }

    return KeyRightOnceBlock;
}(KeyEventOnceBlock);

var StaticInventoryKeyRightOnceBlock = function (_StaticInventoryCodin14) {
    _inherits(StaticInventoryKeyRightOnceBlock, _StaticInventoryCodin14);

    function StaticInventoryKeyRightOnceBlock() {
        _classCallCheck(this, StaticInventoryKeyRightOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY RIGHT')], false, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyRightOnceBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyRightOnceBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyRightOnceBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyRightOnceBlock(x, y);
        }
    }]);

    return StaticInventoryKeyRightOnceBlock;
}(StaticInventoryCodingBlock);

var KeyDownBlock = function (_KeyEventLoopBlock4) {
    _inherits(KeyDownBlock, _KeyEventLoopBlock4);

    function KeyDownBlock(x, y) {
        _classCallCheck(this, KeyDownBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY DOWN')], true, false);
        return _possibleConstructorReturn(this, (KeyDownBlock.__proto__ || Object.getPrototypeOf(KeyDownBlock)).call(this, corpse, svg, x, y, 40));
    }

    return KeyDownBlock;
}(KeyEventLoopBlock);

var StaticInventoryKeyDownBlock = function (_StaticInventoryCodin15) {
    _inherits(StaticInventoryKeyDownBlock, _StaticInventoryCodin15);

    function StaticInventoryKeyDownBlock() {
        _classCallCheck(this, StaticInventoryKeyDownBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, false, [new Title(svg, shapesWallsWidth, titleOffsetY, 'ON KEY DOWN')], true, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyDownBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyDownBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyDownBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyDownBlock(x, y);
        }
    }]);

    return StaticInventoryKeyDownBlock;
}(StaticInventoryCodingBlock);

var KeyDownOnceBlock = function (_KeyEventOnceBlock4) {
    _inherits(KeyDownOnceBlock, _KeyEventOnceBlock4);

    function KeyDownOnceBlock(x, y) {
        _classCallCheck(this, KeyDownOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY DOWN')], false, false);
        return _possibleConstructorReturn(this, (KeyDownOnceBlock.__proto__ || Object.getPrototypeOf(KeyDownOnceBlock)).call(this, corpse, svg, x, y, 40));
    }

    return KeyDownOnceBlock;
}(KeyEventOnceBlock);

var StaticInventoryKeyDownOnceBlock = function (_StaticInventoryCodin16) {
    _inherits(StaticInventoryKeyDownOnceBlock, _StaticInventoryCodin16);

    function StaticInventoryKeyDownOnceBlock() {
        _classCallCheck(this, StaticInventoryKeyDownOnceBlock);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var corpse = CreateShape(svg, loopsColor, false, true, [new Title(svg, shapesWallsWidth, titleOffsetY, 'KEY DOWN')], false, false);
        return _possibleConstructorReturn(this, (StaticInventoryKeyDownOnceBlock.__proto__ || Object.getPrototypeOf(StaticInventoryKeyDownOnceBlock)).call(this, corpse, svg));
    }

    _createClass(StaticInventoryKeyDownOnceBlock, [{
        key: 'createOneOfMe',
        value: function createOneOfMe(x, y) {
            return new KeyDownOnceBlock(x, y);
        }
    }]);

    return StaticInventoryKeyDownOnceBlock;
}(StaticInventoryCodingBlock);

if (typeof module !== 'undefined') {
    module.exports = function () {
        return [CodingBlock, StaticInventoryCodingBlock, DraggedCodingBlock, KeyEventOnceBlock, KeyEventLoopBlock, DelleteableCodingBlock, DockingCodingFigure, ForeverBlock, StaticInventoryForeverBlock, IfElseBlock, StaticInventoryIfElseBlock, IfBlock, StaticInventoryIfBlock, StepLeftBlock];
    }();
}
//# sourceMappingURL=codingBlocks.js.map