class SeparatedColors {
    constructor(inColor, outColor) {
        this.inColor = inColor;
        this.outColor = outColor;

        this.inRchannel = parseInt(inColor.substring(1, 3), 16);
        this.inGchannel = parseInt(inColor.substring(3, 5), 16);
        this.inBchannel = parseInt(inColor.substring(5, 7), 16);

        this.outRchannel = parseInt(outColor.substring(1, 3), 16);
        this.outGchannel = parseInt(outColor.substring(3, 5), 16);
        this.outBchannel = parseInt(outColor.substring(5, 7), 16);
    }
}
let loopsColor = new SeparatedColors('#00FF00', '#FFFF00');
let dockColorRange = new SeparatedColors('#FFFF00', '#FF0000');