(function () {
    "use strict";

    class MaiTaiButton extends HTMLElement {
        constructor() {
            // Always call super first in constructor
            super();

            this.initShadowRoot();
            this.initButton();
            this.initCanvas();
            this.initContext(this._canvasCache);

            this._buttonCache.addEventListener('click', () => this.startAnimation());

            this._shadow.appendChild(this._buttonCache);
        }

        initShadowRoot() {
            // Create a shadow root
            this._shadow = this.attachShadow({mode: 'open'});
        }

        initCanvas() {
            let canvas = document.createElement('canvas');

            canvas.id = 'canvas';
            canvas.width = 500;
            canvas.height = 500;
            canvas.style =
                `
                border: 1px solid black;
                backgroundColor: rgba(0, 0, 0, 0);
                position: absolute;
                z-index: 100;
                `;

            this._canvasCache = canvas;
        }

        initButton() {
            let button = document.createElement('button');

            button.style = this.getAttribute('data-style');
            button.innerText = 'Mai-tai';
            button.style.position = 'relative';

            this._buttonCache = button;
        }

        initContext(canvas) {
            this._ctx = canvas.getContext("2d");
        }

        startAnimation() {
            // store the button's style string before switching to Canvas
            this._cssText = this._buttonCache.style.cssText;

            let w = this._buttonCache.offsetWidth;
            let h = this._buttonCache.offsetHeight;

            // TODO: Fix hard-coded positioning
            this._offsetTop = -244;
            this._offsetLeft = -220;

            this._canvasCache.style.top = this._offsetTop + 'px';
            this._canvasCache.style.left = this._offsetLeft + 'px';

            // this._shadow.replaceChild(this._canvasCache, this._buttonCache);
            this._buttonCache.style.opacity = 0;
            this._shadow.appendChild(this._canvasCache);

            this.drawButtonInCanvas();


            let that = this;
            setTimeout(function () {
                that.endAnimation();
            }, 3000);

            // start drawing with Canvas
            window.requestAnimationFrame(this.draw);
        }

        endAnimation() {
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
                that._ctx.drawImage(img, that._imageOffsetX, that._imageOffsetY);
                DOMURL.revokeObjectURL(url);
            };

            img.src = url;

            this._buttonImageCache = img;
        }

        draw() {
            this._ctx.globalCompositeOperation = 'destination-over';
            this._ctx.clearRect(0, 0, 500, 500); // clear canvas

            this._ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this._ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
            this._ctx.save();
            this._ctx.translate(150, 150);

            let time = new Date();
            // Moon
            this._ctx.save();
            this._ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
            this._ctx.translate(0, 28.5);
            this._ctx.drawImage(this._buttonImageCache, this._imageOffsetX, this._imageOffsetY);
            this._ctx.restore();

            this._ctx.restore();

            this._ctx.beginPath();
            this._ctx.arc(150, 150, 105, 0, Math.PI * 2, false); // Earth orbit
            this._ctx.stroke();

            console.log('ddd');

            window.requestAnimationFrame(this.draw);
        }
    }

    // Define the new element
    customElements.define('mai-tai-button', MaiTaiButton);
}());
