////////////////////////////////////////////////////////////////////////
//      DOCKS           (generally two types: heads and tails)
////////////////////////////////////////////////////////////////////////

let allTails = [];

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
