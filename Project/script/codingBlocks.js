//               ONLY FOR TESTING PURPOSES



class Sprite {
    constructor(img, width, height){
        this.img = img;
        this.width = width;
        this.height = height;

        this.stepAmount = 2;

        // where to appear initially inside the canvas
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

if (typeof module !== 'undefined') {
    module.exports = (function(){
        return Sprite;
    })();
}
