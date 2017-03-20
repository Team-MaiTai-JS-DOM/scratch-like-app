(function () {
    "use strict";

    const CANVAS_MAIN_ID = 'canvas';
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const CANVAS_STYLE = `
                backgroundColor: rgba(0, 0, 0, 0);
                position: absolute;
                z-index: 100;
                `;

    const ID_PROVIDER = (function () {
        let nextId = 0;

        return {
            getNext: function () {
                return ++nextId;
            }
        }
    }());

    // weak enum
    const DIRS = {
        TOP_RIGHT: 0,
        BOTTOM_RIGHT: 1,
        BOTTOM_LEFT: 2,
        TOP_LEFT: 3
    };

    class MaiTaiButton extends HTMLElement {
        constructor() {
            // Always call super first in constructor
            super();

            this.initShadowRoot();
            this.initButton();
            this.initCanvas();
            this.initContext(this._canvasCache);

            this._shadow.appendChild(this._buttonCache);
        }

        connectedCallback() {
            let that = this;

            // this._buttonCache.addEventListener('click', () => this.startAnimation());
            this._buttonCache.addEventListener('dragover', (ev) => {

                // TODO: Remove hard-coded initial positioning, calculate; make constant if not
                let offsetTop = 230;
                let offsetLeft = 280;

                /*console.log('Offset left ' + offsetLeft);
                 console.log('Offset top ' + offsetTop);
                 console.log('Drag left ' + ev.clientX);
                 console.log('Drag top ' + ev.clientY);*/

                // TODO: Drag is buggy, doesn't work at all on Firefox, fix
                if (isTopRightDrag()) {
                    this.startAnimation(DIRS.TOP_RIGHT);
                    console.log('top right');
                } else if (isBottomLeftDrag()) {
                    this.startAnimation(DIRS.BOTTOM_LEFT);
                    console.log('bottom left');
                } else if (isBottomRightDrag()) {
                    this.startAnimation(DIRS.BOTTOM_RIGHT);
                    console.log('bottom right');
                } else if (isTopLeftDrag()) {
                    this.startAnimation(DIRS.TOP_LEFT);
                    console.log('top left');
                } else {
                    throw Error('Invalid operation on the event object');
                }

                function isTopRightDrag() {
                    return ev.clientX > offsetLeft && ev.clientY < offsetTop;
                }

                function isBottomLeftDrag() {
                    return ev.clientX < offsetLeft && ev.clientY > offsetTop;
                }

                function isBottomRightDrag() {
                    return ev.clientX > offsetLeft && ev.clientY > offsetTop;
                }

                function isTopLeftDrag() {
                    return ev.clientX < offsetLeft && ev.clientY < offsetTop;
                }
            }, false);
        }

        initShadowRoot() {
            // Create a shadow root
            this._shadow = this.attachShadow({mode: 'open'});
        }

        initCanvas() {
            let canvas = document.createElement('canvas');

            canvas.id = CANVAS_MAIN_ID + ID_PROVIDER.getNext();
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            canvas.style = CANVAS_STYLE;

            this._canvasCache = canvas;
        }

        initButton() {
            let button = document.createElement('button');

            /**
             * Style with non data attribute set, use OnAttributeChanged lifecycle method
             * to detect change in style? We don't want to style the wrapper element.
             */
            button.style = this.getAttribute('data-style');
            button.innerText = this.textContent;
            button.style.position = 'relative';
            button.style.draggable = 'true';

            this._buttonCache = button;
        }

        initContext(canvas) {
            this._ctx = canvas.getContext("2d");
        }

        startAnimation(dir) {
            // store the button's style string before switching to Canvas
            this._cssText = this._buttonCache.style.cssText;

            // let w = this._buttonCache.offsetWidth;
            // let h = this._buttonCache.offsetHeight;

            // TODO: Remove hard-coded initial positioning, calculate
            this._offsetTop = -244;
            this._offsetLeft = -220;

            this._canvasCache.style.top = this._offsetTop + 'px';
            this._canvasCache.style.left = this._offsetLeft + 'px';

            // this._shadow.replaceChild(this._canvasCache, this._buttonCache);
            this._buttonCache.style.opacity = 0;
            this._shadow.appendChild(this._canvasCache);

            this.drawButtonInCanvas();

            let that = this;
            let stop = false;
            let time;
            let pos = {x: 244, y: 220};

            // start animation with Canvas
            // http://creativejs.com/resources/requestanimationframe/
            // START YOUR OWN ANIMATIONS HERE !
            window.requestAnimationFrame(function draw() {
                if (stop) {
                    return;
                }

                that._ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                let now = new Date().getTime(),
                    dt = now - (time || now);

                time = now;

                if (dir === DIRS.TOP_RIGHT) {
                    pos.y += dt / 5;

                    that._ctx.drawImage(that._buttonImageCache, pos.x, pos.y);
                } else if (dir === DIRS.BOTTOM_RIGHT) {







                } else if (dir === DIRS.BOTTOM_LEFT) {

                    that._ctx.save();
                    that._ctx.rotate(dt / 2 * Math.PI / 180);
                    that._ctx.drawImage(that._buttonImageCache, pos.x, pos.y);

                    




                } else if (dir === DIRS.TOP_LEFT) {







                } else {
                    throw Error('Invalid direction');
                }





                // console.log('frames');

                window.requestAnimationFrame(draw);
            });

            // stop animation and remove Canvas from the shadow root
            setTimeout(function () {
                stop = true;
                that.removeCanvas();
            }, 2500);
        }

        removeCanvas() {
            this._buttonCache.style.opacity = 1;
            // this._shadow.replaceChild(this._buttonCache, this._canvasCache);
            this._shadow.removeChild(this._canvasCache);
        }

        /*https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas*/
        drawButtonInCanvas() {
            let data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
                '<foreignObject width="100%" height="100%">' +
                '<button xmlns="http://www.w3.org/1999/xhtml" style="' +
                this._cssText +
                '">' +
                this._buttonCache.textContent +
                '</button>' +
                '</foreignObject>' +
                '</svg>';

            let DOMURL = window.URL || window.webkitURL || window;

            let img = new Image();
            let svg = new Blob([data], {type: 'image/svg+xml'});
            let url = DOMURL.createObjectURL(svg);

            let that = this;
            that._imageOffsetX = 250;
            that._imageOffsetY = 250;

            img.onload = function () {
                // that._ctx.drawImage(img, that._imageOffsetX, that._imageOffsetY);

                DOMURL.revokeObjectURL(url);
            };

            img.src = url;

            this._buttonImageCache = img;
        }
    }

    // Define the new element
    customElements.define('mai-tai-button', MaiTaiButton);
}());