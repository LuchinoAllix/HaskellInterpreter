import { Program } from './objects/Program.js'
import { tokenize }from './lexer/Lexer.js'
import { parse, activateDebug } from './parser/Parser.js'
import { Token } from "./objects/Token.js";
import { Node, compressTree } from './objects/Node.js';
import { normalizeStart } from './normalize/normalizer.js';
import { Term } from './normalize/Term.js';

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
  // removes "node", "Main.js" and "testNum" (if given)

  if (args.length > 8) {
    printOptions();
    return ;
  }

  let printAST = false;
  let printDebug = false;
  let nosave = false;
  let printTokens = false;
  let derivative = false;
  let printNF = false;
  let verbose = false;

  // Parcourt tous les arguments restants pour voir les options
  for (const arg of args) {
    switch (arg){
      case "--Tokens" :
      case "--tokens" :
        printTokens = true;
        break;

      case "--AST" :
      case "--ast" :
        printAST = true;
        break;

      case "--Debug" :
      case "--debug" :
        printDebug = true;
        break;

      case "--Nosave" :
      case "--nosave" :
        nosave = true;
        break;

      case "--Derivative" :
      case "--derivative" :
        derivative = true;
        break;      
        
      case "--NF" :
      case "--Nf" :
      case "--nf" :
        printNF = true;
        break;
      
      case "--Verbose" :
      case "--verbose" :
        verbose = true;
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
      if (testAtest(i, printTokens, printAST, printDebug, nosave, derivative, 
                    verbose, printNF)){
        cnt +=1;
        console.log("Test passed ✅");
      } else {
        console.log("Test failed ❌");
      }
    }
    console.log("\nTests passed : ", cnt, "/", tests.length);
  } else {
    if (testNum >= tests.length || testNum  < 0 ){
      console.log("Test number out of range, tests go from 0 to : ", 
                  tests.length-1);
    } else {
      if (testAtest(testNum, printTokens, printAST, printDebug, nosave, 
                    derivative, true, printNF)){
        console.log("Test passed ✅");
      } else {
        console.log("Test failed ❌");
      }
    }
  }
  return ;
}


/**
 * Prints all the options to execute the code
 */
function printOptions(){
  console.log(
      "\nUsage:\n" +
      "  node Main.js Id_Of_Test [options] (if no test id is given, " + 
         "all tests are run)\n\n" +

      "Options :\n" +
      "  --Tokens      shows the list of token after lexing\n" +
      "  --AST         shows the AST after parsing\n" +
      "  --Debug       shows the rules took whilst parsing\n" +
      "  --Nosave      doesn't save the AST after parsing\n" +
      "  --Derivative  shows/saves the derivative tree instead of the AST\n" +
      "  --NF          shows the normal form after normalizing\n" +
      "  --Verbose     shows error messages if all tests are run"
    );
}

/**
 * Tests a file according to the options specified
 * @param {Int} testNb the number of the test to test
 * @param {Boolean} printTokens to print the tokens to the console
 * @param {Boolean} printAST to print the AST to the console
 * @param {Boolean} debug to show the rules taken by the parser
 * @param {Boolean} nosave to not save the newly generated AST
 * @param {Boolean} der show derivative tree instead of AST
 * @param {Boolean} verbose wether to show errors or not
 */
function testAtest(testNb, printTokens, printAST, debug, nosave, der, verbose, 
                   printNF){
  
  var test = tests[testNb];
  const program = new Program(test.input);
  console.log("\nTest " + testNb + " : testing " + test.info);

  if (verbose){
    console.log("Input : \n" + program.input);
  }

  try {
    if (tokenize(program)){
      if (verbose){
        console.log("Successful tokenization :) ");
      }
    } else { 
      // Tokensize never returns false, if it doesn't work it throws an error
      // So this is never executed
      console.log("Unsuccessful tokenization :( ");
      return false;
    }

    if(printTokens){
      showTokens(program.tokens);
    }

  } catch (error) {
    console.log("Error while tokenizating :");
    if (verbose){
      showTokens(program.tokens);
      console.log(error);
    }
    return false;
  }

  try {
    if (debug){
      activateDebug();
    }

    if (parse(program)){
      if (verbose){
        console.log("Successful parsing :) ");
      }
      
    } else {
      // parse never returns false, if it doesn't work it throws an error
      // So this is never executed
      console.log("Unsuccessful parsing :( ");
      return false;
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
    if (verbose){
      showAST(program.AST);
      console.log(error);
    }
    return false;
  }

  try{ // todo evaluation
  
    if (normalizeStart(program)){
      if (verbose){
        console.log("Successful normalisation :) ");
      }
      
    } else {
      // normalizer never returns false, if it doesn't work it throws an error
      // So this is never executed
      console.log("Unsuccessful normalisation :( ");
      return false;
    }

     if (printNF){
      showNormalForm(program.normalizedForm);
    }

  } catch (error) {
    console.log("Error while normalizing :");
    if (verbose){
      showNormalForm(program.normalizedForm);
      console.log(error);
    }
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
 * Prints to the console the normalized form with stringify
 * @param {[Term]} terms 
 */
function showNormalForm(terms){
  console.log("Normalized form :");
  console.log(JSON.stringify(terms, null, 2));
}

/**
 * Creates the list of tests based on the Tests.hs file.
 * Each input is in between '--/' (if there are no other '--/' before)
 * information about the tests are given with :   
 * -- Test : ...
 * -- Expected result : ...
 * @returns {Boolean}
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
    return true;

  } catch (error) {
    console.error("Error while reading test file:", error);
  }
}

main()