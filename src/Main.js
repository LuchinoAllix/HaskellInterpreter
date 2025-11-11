import { Program } from './Program.js'
import { tokenize }from './lexer/Lexer.js'
import { parse } from './parser/Parser.js'
import { Token } from "./Token.js";
import { Node, compressTree } from './Node.js';
import { activateDebug } from './parser/Parser.js';


import { readFile } from 'fs/promises';
import {writeFileSync } from 'fs';


/**
 * # FIXME : Change order of evaluation to make sure it happens sequentially
 * Main function to test Parser
 */
async function main(){
  
  let pathToFile = process.argv[2];
  const args = process.argv.slice(3); // enlève "node", "Main.js" et "TestPath"

  if (args.length > 7) {
    printOptions();
  }

  let printAST = false;
  let printDebug = false;
  let nosave = false;
  let printTokens = false;
  let derivative = false;

  // Parcourt tous les arguments restants pour voir les options
  for (const arg of args) {
    switch (arg){
      case "--Tokens" :
        printTokens = true;
        break;

      case "--AST" :
        printAST = true;
        break;

      case "--Debug" :
        printDebug = true;
        break;

      case "--nosave" :
        nosave = true;
        break;

      case "--derivative" :
        derivative = true;
        break;

      default :
        console.log("\nArgument specified unrecognised : ", arg);
        printOptions();
        return ;
    }
  }

  testFile(pathToFile, printTokens, printAST, printDebug, nosave, derivative);

}


/**
 * TODO
 */
function printOptions(){
  console.log(
      "\nUsage:\n" +
      "  node Main.js <pathToTestFile> [options]\n\n" +

      "Options :\n" +
      "  --Tokens      shows the list of token after lexing\n" +
      "  --AST         shows the AST after parsing\n" +
      "  --Debug       shows the rules took whilst parsing\n" +
      "  --nosave      doesn't save the AST after parsing\n" +
      "  --derivative  shows/saves the derivative tree instead of the AST\n" 
    );
}

/**
 * TODO
 * @param {*} file_path 
 * @param {*} printTokens 
 * @param {*} printAST 
 * @param {*} debug 
 * @param {*} nosave 
 * @param {*} der 
 */
async function testFile(file_path, printTokens, printAST, debug, nosave, der){
  try {
    const content = await readFile(file_path, 'utf8');
    const program = new Program(content);
    console.log("\nTest file : " + file_path);
    console.log("Input : \n" + program.input);

    try {
      if (tokenize(program)){
        console.log("Successful tokenization :) ");
      } else {
        console.log("Unsuccessful tokenization :( ");
      }

      if(printTokens){
        showTokens(program.tokens);
      }

    } catch (error) {
      console.log("Error while tokenization :");
      showTokens(program.tokens);
      console.error(error);
    }

    try {
      if (debug){
        activateDebug();
      }

      if (parse(program)){
        console.log("Successful parsing :) ");
        
      } else {
        console.log("Unsuccessful parsing :( ");
      }

      if (!der){
        compressTree(program.AST);
      }

      if (printAST){
        showAST(program.AST);
      }

      if (!nosave){
        writeFileSync("../visualisation/ast.json", 
                         JSON.stringify(program.AST, null, 2));
        console.log("AST saved to ast.json");
      }

    } catch (error) {
      console.log("Error while parsing :");
      showAST(program.AST);
      console.error(error);
    }

  } catch (err) {
    console.error("Error while reading test file:", err);
  }
}

/**
 * Prints on the console all the tokens in a single line
 * @param {Token} tokens 
 */
function showTokens(tokens){
  console.log("Tokens : " );
  for (let token of tokens){
    console.log("\t" + JSON.stringify(token));
  }
}

/**
 * 
 * @param {Node} ast 
 */
function showAST(ast){
  console.log("AST :");
  console.log(JSON.stringify(ast , null, 1));
}

main()