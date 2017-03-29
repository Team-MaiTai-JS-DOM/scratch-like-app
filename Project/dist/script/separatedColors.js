'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SeparatedColors = function SeparatedColors(inColor, outColor) {
    _classCallCheck(this, SeparatedColors);

    this.inColor = inColor;
    this.outColor = outColor;

    this.inRchannel = parseInt(inColor.substring(1, 3), 16);
    this.inGchannel = parseInt(inColor.substring(3, 5), 16);
    this.inBchannel = parseInt(inColor.substring(5, 7), 16);

    this.outRchannel = parseInt(outColor.substring(1, 3), 16);
    this.outGchannel = parseInt(outColor.substring(3, 5), 16);
    this.outBchannel = parseInt(outColor.substring(5, 7), 16);
};

var loopsColor = new SeparatedColors('#3f4145', '#FFFF00');
var dockColorRange = new SeparatedColors('#FFFF00', '#FF0000');

if (typeof module !== 'undefined') {
    module.exports = function () {
        return SeparatedColors;
    }();
}
//# sourceMappingURL=separatedColors.js.map