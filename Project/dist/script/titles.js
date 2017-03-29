'use strict';

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////
//      TITLES
////////////////////////////////////////////////////////////////////////

var Title = function Title(svg, left, top, text) {
  _classCallCheck(this, Title);

  this.text = text; // for logging/saving purposes

  this.x = left;

  this.textEl = document.createElementNS(svg.namespaceURI, 'text');
  this.textEl.setAttribute('x', left);
  this.textEl.setAttribute('y', top);
  this.textEl.setAttribute('fill', titlesColor);
  this.textEl.textContent = text;
  this.textEl.setAttribute('class', 'codingblocktitle');
};

var LeftTitle = function (_Title) {
  _inherits(LeftTitle, _Title);

  // example: the "times" of "repeat times"
  function LeftTitle(svg, left, top, text) {
    _classCallCheck(this, LeftTitle);

    var _this = _possibleConstructorReturn(this, (LeftTitle.__proto__ || Object.getPrototypeOf(LeftTitle)).call(this, svg, left, top, text));

    _this.left = left; // "times" could be at any offset appart of "repeat" due to the text box in between
    return _this;
  }

  return LeftTitle;
}(Title);

if (typeof module !== 'undefined') {
  module.exports = function () {
    return [Title, LeftTitle];
  }();
}
//# sourceMappingURL=titles.js.map