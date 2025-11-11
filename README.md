# HaskellParser

[Spec syntax Haskell](https://www.haskell.org/onlinereport/haskell2010/haskellch10.html)

[Hasekll interpreter in js](https://github.com/johang88/haskellinjavascript/tree/master)

[Peggy](https://peggyjs.org/documentation.html#grammar-syntax-and-semantics)


Usage:
  `node Main.js <pathToTestFile> [options]`

Options :
   `--Tokens`      shows the list of token after lexing  <br>
  `--AST`         shows the AST after parsing <br>
  `--Debug`       shows the rules took whilst parsing <br>
  `--nosave`      doesn't save the AST after parsing <br>
  `--derivative`  shows/saves the derivative tree instead of the AST <br>
