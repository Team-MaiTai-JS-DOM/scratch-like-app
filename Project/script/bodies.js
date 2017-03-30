'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////
//      BODY
////////////////////////////////////////////////////////////////////////

var Body = function () {
    function Body(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        _classCallCheck(this, Body);

        // Body could be of various color combinations because its childrens will be of various types and colors
        this.colorRange = colorRange;

        // numerical representation of the path that is easy to blend
        this.numericalPathOriginal = numericalPath.coords.slice(0); // this one should not be modified....NEVER
        this.numericalPath = numericalPath; // work and make changes on this array

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

    _createClass(Body, [{
        key: 'updateDimensions',
        value: function updateDimensions() {
            this.width = this.numericalPath.coords[this.samplers.widhtSampler];
            this.height = this.numericalPath.coords[this.samplers.heightSampler];
        }
    }, {
        key: 'updateColorByFactor',
        value: function updateColorByFactor(colorFactor) {
            this.currentColorFactor = clampZeroOne(colorFactor);
            this.path.setAttribute('style', 'fill:#' + interpolateColors(this.colorRange, this.currentColorFactor));
        }
    }, {
        key: 'updateColor',
        value: function updateColor(newColor) {
            this.path.setAttribute('style', 'fill:' + newColor);
        }
    }]);

    return Body;
}();

var DynamicBarSingleBody = function (_Body) {
    _inherits(DynamicBarSingleBody, _Body);

    function DynamicBarSingleBody(colorRange, path, pathFeel, numericalPath, samplers, inputParams, topBarHeight) {
        _classCallCheck(this, DynamicBarSingleBody);

        var _this = _possibleConstructorReturn(this, (DynamicBarSingleBody.__proto__ || Object.getPrototypeOf(DynamicBarSingleBody)).call(this, colorRange, path, pathFeel, numericalPath, samplers, topBarHeight));

        _this.inputWidth = inputParams.inputWidth;
        _this.inputHeight = inputParams.inputHeight;
        _this.inputX = inputParams.inputX;
        return _this;
    }

    _createClass(DynamicBarSingleBody, [{
        key: 'resizeTopBar',
        value: function resizeTopBar(inputBoxNewWidth, inputBoxNewHeight) {}
    }]);

    return DynamicBarSingleBody;
}(Body);

var DoubleBody = function DoubleBody(superclass) {
    return function (_superclass) {
        _inherits(_class, _superclass);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'moveFirstBar',
            value: function moveFirstBar(height) {
                this.firstCavityHeight = height - heightOfBumb;
                for (var i = 0; i < this.numericalPathOriginal.length; i++) {
                    this.numericalPath.coords[i] = this.numericalPathOriginal[i];
                }bendBarBySamplers(this.samplers.secondBarSamplers, this.topBarHeight + this.firstCavityHeight, this.numericalPathOriginal[this.samplers.secondBarSamplers[2]], this);

                if (this.JSParent.tail !== null) {
                    this.JSParent.tail.movePathPosition(this.firstCavityHeight + this.topBarHeight + shapesWallsWidth);
                    if (this.JSParent.tail.dockedNeighbor !== null) {
                        this.JSParent.tail.dock(this.JSParent.tail.dockedNeighbor);
                    }
                }

                redrawSVG(this.JSParent);
            }
        }]);

        return _class;
    }(superclass);
};

function bendBarBySamplers(samplers, height, originalHeight, body) {
    for (var i = 0; i < samplers.length; i++) {
        body.numericalPath.coords[samplers[i]] = body.numericalPathOriginal[samplers[i]] + (height - originalHeight);
    }
}

var TripleBody = function TripleBody(superclass) {
    return function (_superclass2) {
        _inherits(_class2, _superclass2);

        function _class2() {
            _classCallCheck(this, _class2);

            return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
        }

        _createClass(_class2, [{
            key: 'moveFirstBar',
            value: function moveFirstBar(height) {
                this.firstCavityHeight = height - heightOfBumb;
                this.resizeWholeBody(false);
            }
        }, {
            key: 'moveSecondBar',
            value: function moveSecondBar(height) {
                this.secondCavityHeight = height - heightOfBumb;
                this.resizeWholeBody(true);
            }
        }, {
            key: 'resizeWholeBody',
            value: function resizeWholeBody(isSecondCallingMe) {
                for (var i = 0; i < this.numericalPathOriginal.length; i++) {
                    this.numericalPath.coords[i] = this.numericalPathOriginal[i];
                }bendBarBySamplers(this.samplers.secondBarSamplers, this.topBarHeight + this.firstCavityHeight, this.numericalPathOriginal[this.samplers.secondBarSamplers[2]], this);

                if (this.JSParent.tail2 !== null) {
                    this.JSParent.tail2.movePathPosition(this.firstCavityHeight + this.topBarHeight + shapesWallsWidth);
                    if (this.JSParent.tail2.dockedNeighbor !== null && !isSecondCallingMe) {
                        this.JSParent.tail2.dock(this.JSParent.tail2.dockedNeighbor);
                    }
                }

                this.JSParent.floatingTitle.textEl.setAttribute('y', this.topBarHeight + this.firstCavityHeight + titleOffsetY);

                bendBarBySamplers(this.samplers.thirdBarSamplers, this.topBarHeight + this.firstCavityHeight + shapesWallsWidth + this.secondCavityHeight, this.numericalPathOriginal[this.samplers.thirdBarSamplers[2]], this);

                if (this.JSParent.tail !== null) {
                    this.JSParent.tail.movePathPosition(this.firstCavityHeight + this.topBarHeight + this.secondCavityHeight + shapesWallsWidth * 2);
                    if (this.JSParent.tail.dockedNeighbor !== null) {
                        this.JSParent.tail.dock(this.JSParent.tail.dockedNeighbor);
                    }
                }

                redrawSVG(this.JSParent);
            }
        }]);

        return _class2;
    }(superclass);
};

var FixedTopBarDoubleBody = function (_DoubleBody) {
    _inherits(FixedTopBarDoubleBody, _DoubleBody);

    function FixedTopBarDoubleBody(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        _classCallCheck(this, FixedTopBarDoubleBody);

        return _possibleConstructorReturn(this, (FixedTopBarDoubleBody.__proto__ || Object.getPrototypeOf(FixedTopBarDoubleBody)).call(this, colorRange, path, pathFeel, numericalPath, samplers, topBarHeight));
    }

    return FixedTopBarDoubleBody;
}(DoubleBody(Body));

var FixedTopBarTripleBody = function (_TripleBody) {
    _inherits(FixedTopBarTripleBody, _TripleBody);

    function FixedTopBarTripleBody(colorRange, path, pathFeel, numericalPath, samplers, topBarHeight) {
        _classCallCheck(this, FixedTopBarTripleBody);

        return _possibleConstructorReturn(this, (FixedTopBarTripleBody.__proto__ || Object.getPrototypeOf(FixedTopBarTripleBody)).call(this, colorRange, path, pathFeel, numericalPath, samplers, topBarHeight));
    }

    return FixedTopBarTripleBody;
}(TripleBody(Body));

if (typeof module !== 'undefined') {
    module.exports = function () {
        return [Body, DynamicBarSingleBody, DoubleBody, TripleBody, FixedTopBarDoubleBody, FixedTopBarTripleBody];
    }();
}
//# sourceMappingURL=bodies.js.map