
  class InputField {
    constructor(container, x, text) {
      this.container = container;
      this.x = x;
      this.text = text;

      this.inputEl = document.createElement('input');
      this.inputEl.value = this.text;
      this.inputEl.style.width = '20px';
      this.inputEl.className = 'arguments-input';
      this.inputEl.style.position = 'absolute';
      this.inputEl.style.left = this.x;
      this.container.appendChild(this.inputEl);
    };

    get container() {
      return this._container;
    };

    set container(container) {
      this._container=container;
    };

    get x() {
      return this._x;
    };

    set x(x) {
      this._x = x + 'px';
    };

    get text(){
      return this._text;
    };

    set text(text) {
      this._text = text;
    };
  };

//Example usage
// let container = document.getElementById('container');
// var test = new InputField(container, 150, 'test');
