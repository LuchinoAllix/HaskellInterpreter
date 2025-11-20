# HaskellParser

[Spec syntax Haskell](https://www.haskell.org/onlinereport/haskell2010/haskellch10.html)

[Hasekll interpreter in js](https://github.com/johang88/haskellinjavascript/tree/master)

[Peggy](https://peggyjs.org/documentation.html#grammar-syntax-and-semantics)


Usage:
  `node Main.js Id_Of_Test [options]` (if no test id is given, all tests are run)

Options :<br>
  -  `--Tokens` shows the list of token after lexing
  - `--AST` shows the AST after parsing
  - `--Debug` shows the rules took whilst parsing
  - `--nosave` doesn't save the AST after parsing
  - `--derivative` shows/saves the derivative tree instead of the AST
  - `--verbatim` shows error messages if all tests are run
