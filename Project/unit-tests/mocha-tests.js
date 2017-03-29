const expect = require("chai").expect;
const bodiesJSFileImports = require("../script/bodies.js");
const codingBlocksJSFileImports = require("../script/codingBlocks.js");
const docsJSFileImports = require("../script/docks.js");
const separatedColorsJSFileImports = require("../script/separatedColors.js");
const spriteJSFileImports = require("../script/sprite.js");
const titlesJSFileImports = require("../script/titles.js");

describe('Unit Tests', () => {
  describe('Class Tests', () => {
    describe('Title tests', () => {
      it('expect `Title` to be a function', () => {
        expect(titlesJSFileImports[0]).to.be.a('function');
      });
    });

    describe('LeftTitle tests', () => {
      it('expect `LeftTitle` to be a function', () => {
        expect(titlesJSFileImports[1]).to.be.a('function');
      });
    });

    describe('Dock tests', () => {
      it('expect `Dock` to be a function', () => {
        expect(docsJSFileImports[0]).to.be.a('function');
      });
    });

    describe('Head tests', () => {
      it('expect `Head` to be a function', () => {
        expect(docsJSFileImports[1]).to.be.a('function');
      });
    });

    describe('Tail tests', () => {
      it('expect `Tail` to be a function', () => {
        expect(docsJSFileImports[2]).to.be.a('function');
      });
    });

    describe('OuternTail tests', () => {
      it('expect `OuternTail` to be a function', () => {
        expect(docsJSFileImports[3]).to.be.a('function');
      });
    });

    describe('ConcavityTailFirst tests', () => {
      it('expect `ConcavityTailFirst` to be a function', () => {
        expect(docsJSFileImports[4]).to.be.a('function');
      });
    });

    describe('ConcavityTailSecond tests', () => {
      it('expect `ConcavityTailSecond` to be a function', () => {
        expect(docsJSFileImports[5]).to.be.a('function');
      });
    });    

    describe('Body tests', () => {
      it('expect `Body` to be a function', () => {
        expect(bodiesJSFileImports[0]).to.be.a('function');
      });
    });

    describe('DynamicBarSingleBody tests', () => {
      it('expect `DynamicBarSingleBody` to be a function', () => {
        expect(bodiesJSFileImports[1]).to.be.a('function');
      });
    });

    describe('DoubleBody tests', () => {
      it('expect `DoubleBody` to be a function', () => {
        expect(bodiesJSFileImports[2]).to.be.a('function');
      });
    });

    describe('TripleBody tests', () => {
      it('expect `TripleBody` to be a function', () => {
        expect(bodiesJSFileImports[3]).to.be.a('function');
      });
    });

    describe('FixedTopBarDoubleBody tests', () => {
      it('expect `FixedTopBarDoubleBody` to be a function', () => {
        expect(bodiesJSFileImports[4]).to.be.a('function');
      });
    });

    describe('FixedTopBarTripleBody tests', () => {
      it('expect `FixedTopBarTripleBody` to be a function', () => {
        expect(bodiesJSFileImports[5]).to.be.a('function');
      });
    });

    describe('CodingBlock tests', () => {
      it('expect `CodingBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[0]).to.be.a('function');
      });
    });

    describe('StaticInventoryCodingBlock tests', () => {
      it('expect `StaticInventoryCodingBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[1]).to.be.a('function');
      });
    });

    describe('DraggedCodingBlock tests', () => {
      it('expect `DraggedCodingBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[2]).to.be.a('function');
      });
    });

    describe('KeyEventOnceBlock tests', () => {
      it('expect `KeyEventOnceBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[3]).to.be.a('function');
      });
    });

    describe('KeyEventLoopBlock tests', () => {
      it('expect `KeyEventLoopBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[4]).to.be.a('function');
      });
    });

    describe('DelleteableCodingBlock tests', () => {
      it('expect `DelleteableCodingBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[5]).to.be.a('function');
      });
    });

    describe('DockingCodingFigure tests', () => {
      it('expect `DockingCodingFigure` to be a function', () => {
        expect(codingBlocksJSFileImports[6]).to.be.a('function');
      });
    });

    describe('ForeverBlock tests', () => {
      it('expect `ForeverBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[7]).to.be.a('function');
      });
    });

    describe('StaticInventoryForeverBlock tests', () => {
      it('expect `StaticInventoryForeverBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[8]).to.be.a('function');
      });
    });

    describe('IfElseBlock tests', () => {
      it('expect `IfElseBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[9]).to.be.a('function');
      });
    });

    describe('StaticInventoryIfElseBlock tests', () => {
      it('expect `StaticInventoryIfElseBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[10]).to.be.a('function');
      });
    });

    describe('IfBlock tests', () => {
      it('expect `IfBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[11]).to.be.a('function');
      });
    });

    describe('StaticInventoryIfBlock tests', () => {
      it('expect `StaticInventoryIfBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[12]).to.be.a('function');
      });
    });

    describe('StepLeftBlock tests', () => {
      it('expect `StepLeftBlock` to be a function', () => {
        expect(codingBlocksJSFileImports[13]).to.be.a('function');
      });
    });
  });
});
