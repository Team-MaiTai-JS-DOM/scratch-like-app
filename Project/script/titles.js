////////////////////////////////////////////////////////////////////////
//      TITLES
////////////////////////////////////////////////////////////////////////

class Title {
  constructor(svg, left, top, text) {
    this.text = text;   // for logging/saving purposes

    this.x = left;

    this.textEl = document.createElementNS(svg.namespaceURI, 'text');
    this.textEl.setAttribute('x', left);
    this.textEl.setAttribute('y', top);
    this.textEl.setAttribute('fill', titlesColor);
    this.textEl.textContent = text;
    this.textEl.setAttribute('class', 'codingblocktitle');
  }
}

class LeftTitle extends Title {   // example: the "times" of "repeat times"
  constructor(svg, left, top, text) {
    super(svg, left, top, text);
    this.left = left;   // "times" could be at any offset appart of "repeat" due to the text box in between
  }
}

if (typeof module !== 'undefined') {
  module.exports = (function(){
    return [
      Title,
      LeftTitle
    ];
  })();
}

