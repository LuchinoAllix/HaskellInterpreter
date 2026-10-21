# Haskell Interpreter

## Context 

This codebase is the interpreter used in Haskell codeBoot, a tool used to 
show how type inference in Haskell (Hindley-Milner) works.

Since codeBoot is not open source, this repository holds the code for the 
lexer-indenter-parser-typechecker-evaluator pipeline.

Before being inserted in codeBoot, the pipeline was developped in this repo, now 
in the `old` folder.

This work was for a research project as a master thesis, available [here](https://umontreal.scholaris.ca/items/a6f04516-1912-4bd2-80b9-114644ef5cb6) (french). It explains the motivation, goal, methods, evaluations,...

The final (codeBoot) tool is avaiable to try [here](https://luchinoallix.github.io/) !

## Usage

This version cannot show you each step since for that you need codeBoot, but one can modify the code to print each step, with it's corresponding context. To take an input, you simply need to put it in `Test.hs`, following the syntax, specified at the top of the file. Then see run the command bellow :

Usage (in `src`):
  + `node Main.js Id_Of_Test [options]` (if no test id is given, all tests are run)

  + `node renumberTests.js` to a make sure all the tests are well numbered

Options :<br>
  - `--Tokens` shows the list of token after lexing
  - `--AST` shows the AST after parsing
  - `--DebugParse` shows the rules took whilst parsing
  - `--DebugEval` shows the functions took whilst evaluating
  - `--Nosave` doesn't save the AST and NF after generating them
  - `--Derivative` shows/saves the derivative tree instead of the AST
  - `--NF` shows the normal form after normalizing
  - `--Verbose` shows error messages if all tests are run

[Spec syntax Haskell](https://www.haskell.org/onlinereport/haskell2010/haskellch10.html)

`testData` : donnée sur les tests pour évaluation du mémoire

`testtypes` : donnée sur les tests pour évaluation du mémoire

`viz.py` et `viz copy.py` : pour générer des graphes/données pour le mémoire


#TODO #FIXME finish this