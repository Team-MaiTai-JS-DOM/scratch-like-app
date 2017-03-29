'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////
//      DOCKS           (generally two types: heads and tails)
////////////////////////////////////////////////////////////////////////

var allTails = [];

var Dock = function () {
    function Dock(svg, startOfShapeX, startOfShapeY) {
        _classCallCheck(this, Dock);

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

    _createClass(Dock, [{
        key: 'movePathPosition',
        value: function movePathPosition(newOffsetY) {
            this.path.setAttribute('d', 'M ' + this.startOfShapeX + ',' + newOffsetY + ' ' + getStringPathFromNumerical(getDockingPathNumerical(this.startOfShapeX, newOffsetY)) + 'L ' + (this.startOfShapeX + widthOfDock) + ',' + newOffsetY);
            this.startOfShapeY = newOffsetY;
            this.centerOfShapeY = this.startOfShapeY - heightOfBumb / 2;
        }
    }, {
        key: 'updateColorByFactor',
        value: function updateColorByFactor(colorFactor) {
            // check for this because a lot of docks will be out of range and trying to be redrawn to get back to its initial values and this happens on mose move
            if (this.currentColorFactor != colorFactor) {
                this.currentColorFactor = clampZeroOne(colorFactor);
                this.path.setAttribute('style', 'stroke:#' + interpolateColors(dockColorRange, this.currentColorFactor));
            }
        }
    }]);

    return Dock;
}();

var Head = function (_Dock) {
    _inherits(Head, _Dock);

    function Head(svg) {
        _classCallCheck(this, Head);

        return _possibleConstructorReturn(this, (Head.__proto__ || Object.getPrototypeOf(Head)).call(this, svg, startOfDock, heightOfBumb));
    }

    _createClass(Head, [{
        key: 'getHeightOfAllBellow',
        value: function getHeightOfAllBellow() {
            var totalHeight = this.JSParent.body.height;
            var el = this.JSParent;
            var debcount = 0;
            while (el.tail != null && el.tail.dockedNeighbor != null) {
                el = el.tail.dockedNeighbor.JSParent;
                totalHeight += el.body.height - heightOfBumb;
            }
            return totalHeight;
        }
    }]);

    return Head;
}(Dock);

var Tail = function (_Dock2) {
    _inherits(Tail, _Dock2);

    function Tail(svg, startOfShapeX, startOfShapeY) {
        _classCallCheck(this, Tail);

        var _this2 = _possibleConstructorReturn(this, (Tail.__proto__ || Object.getPrototypeOf(Tail)).call(this, svg, startOfShapeX, startOfShapeY));

        _this2.JSParent = null;

        _this2.id = 0;
        return _this2;
    }

    _createClass(Tail, [{
        key: 'destroy',
        value: function destroy() {
            allTails.splice(this.id, 1);
        }
    }, {
        key: 'dock',
        value: function dock(dockedNeighbor) {
            this.dockedNeighbor = dockedNeighbor; // type of head

            parentOfDocked = this.dockedNeighbor.JSParent;

            parentOfDocked.container.parentElement.removeChild(parentOfDocked.container);

            this.alignJustDockedElement();
        }
    }, {
        key: 'alignJustDockedElement',
        value: function alignJustDockedElement() {
            parentOfDocked = this.dockedNeighbor.JSParent;

            offsetToTailX = parentOfDocked.head.centerOfShapeX + parentOfDocked.container.offsetLeft - this.centerOfShapeX;
            offsetToTailY = parentOfDocked.head.centerOfShapeY + parentOfDocked.container.offsetTop - this.centerOfShapeY;

            parentOfDocked.container.style.left = parentOfDocked.container.offsetLeft - offsetToTailX + 'px';
            parentOfDocked.container.style.top = parentOfDocked.container.offsetTop - offsetToTailY + 'px';

            this.JSParent.container.appendChild(parentOfDocked.container);
        }
    }, {
        key: 'unDock',
        value: function unDock(event) {
            parentOfDocked = this.dockedNeighbor.JSParent;

            dockedParenPosition = this.dockedNeighbor.JSParent.container.getBoundingClientRect();

            myContainerPos = this.JSParent.container.getBoundingClientRect();

            offsetToTailX = event.pageX - dockedParenPosition.left;
            offsetToTailY = event.pageY - dockedParenPosition.top;

            this.JSParent.container.removeChild(this.dockedNeighbor.JSParent.container);

            parentOfDocked.container.style.left = dockedParenPosition.left - positionOfCoddingGround.left + 'px';
            parentOfDocked.container.style.top = dockedParenPosition.top - positionOfCoddingGround.top + 'px';

            this.dockedNeighbor.JSParent.head.dockedNeighbor = null;
            this.dockedNeighbor = null;

            divCodeGround.appendChild(parentOfDocked.container);
        }
    }, {
        key: 'resizeCavity',
        value: function resizeCavity() {}
    }]);

    return Tail;
}(Dock);

var OuternTail = function (_Tail) {
    _inherits(OuternTail, _Tail);

    function OuternTail(svg, startOfShapeY) {
        _classCallCheck(this, OuternTail);

        return _possibleConstructorReturn(this, (OuternTail.__proto__ || Object.getPrototypeOf(OuternTail)).call(this, svg, startOfDock, startOfShapeY));
    }

    _createClass(OuternTail, [{
        key: 'dock',
        value: function dock(dockedNeighbor) {
            _get(OuternTail.prototype.__proto__ || Object.getPrototypeOf(OuternTail.prototype), 'dock', this).call(this, dockedNeighbor);
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'resizeCavity',
        value: function resizeCavity() {
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'unDock',
        value: function unDock(event) {
            _get(OuternTail.prototype.__proto__ || Object.getPrototypeOf(OuternTail.prototype), 'unDock', this).call(this, event);
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }]);

    return OuternTail;
}(Tail);

var ConcavityTailFirst = function (_Tail2) {
    _inherits(ConcavityTailFirst, _Tail2);

    function ConcavityTailFirst(svg, startOfShapeY) {
        _classCallCheck(this, ConcavityTailFirst);

        return _possibleConstructorReturn(this, (ConcavityTailFirst.__proto__ || Object.getPrototypeOf(ConcavityTailFirst)).call(this, svg, startOfDock + shapesWallsWidth, startOfShapeY));
    }

    _createClass(ConcavityTailFirst, [{
        key: 'dock',
        value: function dock(dockedNeighbor) {
            _get(ConcavityTailFirst.prototype.__proto__ || Object.getPrototypeOf(ConcavityTailFirst.prototype), 'dock', this).call(this, dockedNeighbor);
            this.JSParent.body.moveFirstBar(dockedNeighbor.JSParent.head.getHeightOfAllBellow());
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'resizeCavity',
        value: function resizeCavity() {
            this.JSParent.body.moveFirstBar(this.dockedNeighbor.JSParent.head.getHeightOfAllBellow());
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'unDock',
        value: function unDock(event) {
            _get(ConcavityTailFirst.prototype.__proto__ || Object.getPrototypeOf(ConcavityTailFirst.prototype), 'unDock', this).call(this, event);
            this.JSParent.body.moveFirstBar(shapesWallsWidth + heightOfBumb);
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }]);

    return ConcavityTailFirst;
}(Tail);

var ConcavityTailSecond = function (_Tail3) {
    _inherits(ConcavityTailSecond, _Tail3);

    function ConcavityTailSecond(svg, startOfShapeY) {
        _classCallCheck(this, ConcavityTailSecond);

        return _possibleConstructorReturn(this, (ConcavityTailSecond.__proto__ || Object.getPrototypeOf(ConcavityTailSecond)).call(this, svg, startOfDock + shapesWallsWidth, startOfShapeY));
    }

    _createClass(ConcavityTailSecond, [{
        key: 'dock',
        value: function dock(dockedNeighbor) {
            _get(ConcavityTailSecond.prototype.__proto__ || Object.getPrototypeOf(ConcavityTailSecond.prototype), 'dock', this).call(this, dockedNeighbor);
            this.JSParent.body.moveSecondBar(dockedNeighbor.JSParent.head.getHeightOfAllBellow());
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'resizeCavity',
        value: function resizeCavity() {
            this.JSParent.body.moveSecondBar(this.dockedNeighbor.JSParent.head.getHeightOfAllBellow());
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }, {
        key: 'unDock',
        value: function unDock(event) {
            _get(ConcavityTailSecond.prototype.__proto__ || Object.getPrototypeOf(ConcavityTailSecond.prototype), 'unDock', this).call(this, event);
            this.JSParent.body.moveSecondBar(shapesWallsWidth + heightOfBumb);
            if (this.JSParent.head !== null && this.JSParent.head.dockedNeighbor !== null) this.JSParent.head.dockedNeighbor.resizeCavity();
        }
    }]);

    return ConcavityTailSecond;
}(Tail);

if (typeof module !== 'undefined') {
    module.exports = function () {
        return [Dock, Head, Tail, OuternTail, ConcavityTailFirst, ConcavityTailSecond];
    }();
}
//# sourceMappingURL=docks.js.map