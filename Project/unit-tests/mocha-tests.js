const expect = require("chai").expect;
const TitleClassImport = require("../script/titles.js");
const docsJSFileImports = require("../script/docks.js");

console.log(TitleClassImport);

describe("Unit Tests", () => {
  describe("Class Tests", () => {
    describe("Class Title tests", () => {
      it("expect `Title` to be a function", () => {
        expect(TitleClassImport).to.be.a("function");
      });
    });

    describe("Class Dock tests", () => {
      it("expect `Dock` to be a function", () => {
        expect(docsJSFileImports[0]).to.be.a("function");
      });
    });
  });
});
