'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//               ONLY FOR TESTING PURPOSES


var Sprite = function () {
    function Sprite(img, width, height) {
        _classCallCheck(this, Sprite);

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

        var x = this.x;
        var y = this.y;
        var image = this.img;

        this.img.addEventListener('mousedown', function () {
            if (!this.alreadyLoaded) {
                ctx2D.drawImage(image, x, y, width, height);
            }

            // add reference to inventory
            // let reference = new staticShape(svg, loopsColor, true, false, [], false, false);
            // document.getElementById('SamuilsTableId').addChild(reference.svg);
        });
    }

    _createClass(Sprite, [{
        key: 'moveTo',
        value: function moveTo(newX, newY) {
            this.x = newX;
            this.y = newY;
            this.redraw();
        }
    }, {
        key: 'stepLeft',
        value: function stepLeft() {
            this.x -= this.stepAmount;
            this.redraw();
        }
    }, {
        key: 'stepRight',
        value: function stepRight() {
            this.x += this.stepAmount;
            this.redraw();
        }
    }, {
        key: 'stepUp',
        value: function stepUp() {
            this.y -= this.stepAmount;
            this.redraw();
        }
    }, {
        key: 'stepDown',
        value: function stepDown() {
            this.y += this.stepAmount;
            this.redraw();
        }
    }, {
        key: 'turnRigth',
        value: function turnRigth(radians) {
            this.x = newX;
            this.y = newY;
            this.redraw();
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            ctx2D.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx2D.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }]);

    return Sprite;
}();

if (typeof module !== 'undefined') {
    module.exports = function () {
        return Sprite;
    }();
}
//# sourceMappingURL=codingBlocks.js.map