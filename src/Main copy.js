import { Program } from './Program.js'
import { tokenize }from './lexer/Lexer.js'
import { parse } from './parser/Parser.js'
import { Token } from "./Token.js";
import { Node, compressTree } from './Node.js';
import { activateDebug } from './parser/Parser.js';

import { readFile } from 'fs/promises';
import { writeFileSync } from 'fs';

let tests = []

/**
 * Main function to test Parser
 * Does not check if an option is given twice, but not really important
 */
async function main(){
  
  let testNum = parseInt(process.argv[2]);
  let nbElemsToRemove = 3;

  if(isNaN(testNum)){ // no specific test was passed so test all the tests
    nbElemsToRemove = 2;
  }

  const args = process.argv.slice(nbElemsToRemove); 
  // removes "node", "Main.js" and "testNumber" (if given)

  if (args.length > 7) {
    printOptions();
    return ;
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

  await makeTests();
  
  if(isNaN(testNum)){
    var cnt = 0;
    nosave = true;
    for (let i=0; i < tests.length; i ++){
      if (testAtest(i, printTokens, printAST, printDebug, nosave, derivative)){
        cnt +=1;
      }
    }
    console.log("\nTests passed : ", cnt, "/", tests.length);
  } else {
    testAtest(testNum, printTokens, printAST, printDebug, nosave, derivative);
  }
}


/**
 * Prints all the options to execute the code
 */
function printOptions(){
  console.log(
      "\nUsage:\n" +
      "  node Main.js Id_Of_Test [options] (if no test id is given, " + 
         "all tests are tested)\n\n" +

      "Options :\n" +
      "  --Tokens      shows the list of token after lexing\n" +
      "  --AST         shows the AST after parsing\n" +
      "  --Debug       shows the rules took whilst parsing\n" +
      "  --nosave      doesn't save the AST after parsing\n" +
      "  --derivative  shows/saves the derivative tree instead of the AST\n" 
    );
}

/**
 * Tests a file according to the options specified
 * @param {Int} test_number the number of the test to test
 * @param {Boolean} printTokens to print the tokens to the console
 * @param {Boolean} printAST to print the AST to the console
 * @param {Boolean} debug to show the rules taken by the parser
 * @param {Boolean} nosave to not save the newly generated AST
 * @param {Boolean} der show derivative tree instead of AST
 */
function testAtest(test_number, printTokens, printAST, debug, nosave, der){
  
  var test = tests[test_number];
  const program = new Program(test.input);
  console.log("\nTest number : " + test_number);
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
    console.log(error);
    return false;
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
    console.log(error);
    return false;
  }

  try{ // todo evaluation

  } catch (error) {

  }
  return true;
}

/**
 * Prints on the console all the tokens, one by line
 * @param {Token} tokens 
 */
function showTokens(tokens){
  console.log("Tokens : " );
  for (let token of tokens){
    console.log("\t" + JSON.stringify(token));
  }
}

/**
 * Prints to the console the ast with stringify
 * @param {Node} ast 
 */
function showAST(ast){
  console.log("AST :");
  console.log(JSON.stringify(ast , null, 1));
}

/**
 * Todo
 * @returns 
 */
async function makeTests(){
  try {
    var content = await readFile("./Tests.hs", 'utf8');
      
    content = content.split("--/");

    for (let i = 0; i < content.length -1; i += 2){
      let test = {};
      test.num = i/2;
      let lines = content[i].split("\n");
      for (let j = 0; j < lines.length; j ++){
        let line = lines [j]
        if (line.startsWith("-- Test")){
          test.info = line.split(":")[1].slice(1);
        } else if (line.startsWith("-- Expected result : ")){
          test.expected = line.split(":")[1].slice(1);
        }
      }
      test.input = content[i+1];
      tests.push(test); 
    }

  } catch (error) {
    console.error("Error while reading test file:", error);
  }
}

main()