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

if (typeof module !== 'undefined') {
  module.exports = (function(){
    return [
      Body,
      DynamicBarSingleBody,
      DoubleBody,
      TripleBody,
      FixedTopBarDoubleBody,
      FixedTopBarTripleBody
    ];
  })();
}
