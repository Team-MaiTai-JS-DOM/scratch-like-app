const expect = require("chai").expect;
const TitleClassImport = require("../script/titles.js");

console.log(TitleClassImport);

describe("Unit Tests", () => {
  describe("Class Tests", () => {
    describe("Class Title tests", () => {
      it("expect `Title` to be a function", () => {
        expect(TitleClassImport).to.be.a("function");
      });
    });
  });
});
