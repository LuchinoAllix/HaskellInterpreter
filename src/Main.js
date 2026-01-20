import { Program } from './objects/Program.js'
import { tokenize }from './lexer/Lexer.js'
import { parse, activateDebugParse } from './parser/Parser.js'
import { Token } from "./objects/Token.js";
import { Node, compressTree } from './objects/Node.js';
import { normalizeStart } from './normalize/normalizer.js';
import { Term } from './normalize/Term.js';
import { initEvalComp } from './eval/eval.js';
import { outputs, resetOutputs } from './eval/Env.js';

import { readFile } from 'fs/promises';
import { writeFileSync } from 'fs';

let tests = []
let whereFail = [[],[],[],[]];

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
  let printDebugParse = false;
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

      case "--DebugParse" :
      case "--debugparse" :
        printDebugParse = true;
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
      if (testAtest(i, printTokens, printAST, printDebugParse, 
        nosave, derivative, verbose, printNF)){
        cnt +=1;
        console.log("Test passed ✅");
      } else {
        console.log("Test failed ❌");
      }
    }
    console.log("\nTests passed : ", cnt, "/", tests.length);
    printDataFails();
  } else {
    if (testNum >= tests.length || testNum  < 0 ){
      console.log("Test number out of range, tests go from 0 to : ", 
                  tests.length-1);
    } else {
      if (testAtest(testNum, printTokens, printAST, printDebugParse, 
         nosave, derivative, true, printNF)){
        console.log("Test passed ✅");
      } else {
        console.log("Test failed ❌");
      }
    }
  }
  return ;
}

/**
 * Prints the information about where each test failed
 */
function printDataFails(){
  let where = ["lexing", "parsing", "normalising", "evaluating"];
  for (let i = 0; i < whereFail.length; i++){
    if (whereFail[i].length === 1){
      console.log("An error occured whilst " + where[i] + " for test : " + 
        whereFail[i]);
    } else if (whereFail[i].length > 1){
      console.log("An error occured whilst " + where[i] + " for tests : " + 
        whereFail[i]);
    }
  }
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
      "  --DebugParse  shows the rules took whilst parsing\n" +
      "  --Nosave      doesn't save the AST and NF after generating them\n" +
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
 * @param {Boolean} DebugParse to show the rules taken by the parser
 * @param {Boolean} nosave to not save the newly generated AST
 * @param {Boolean} der show derivative tree instead of AST
 * @param {Boolean} verbose wether to show errors or not
 */
function testAtest(testNb, printTokens, printAST, DebugParse, nosave,
                    der, verbose, printNF){
  
  var test = tests[testNb];
  const program = new Program(test.input);
  program.expected = test.expected;
  console.log("\nTest " + testNb + " : testing " + test.info);


  if (verbose){
    console.log("Input : \n" + program.input);
  }

  try {

    tokenize(program);
    
    if (verbose){
      console.log("Successful tokenization :) ");
    }
    

    if(printTokens){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
    }

  } catch (error) {
    console.log("Error while tokenizating :");
    whereFail[0].push(testNb);
    if (verbose){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
      console.log(error);
    }
    return false;
  }

  try {
    if (DebugParse){
      activateDebugParse();
    }

    parse(program);

    if (verbose){
      console.log("Successful parsing :) ");
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
    whereFail[1].push(testNb);
    if (verbose){
      showAST(program.AST);
      console.log(error);
    }
    return false;
  }

  try{
  
    normalizeStart(program)
    
    if (verbose){
      console.log("Successful normalisation :) ");
    }

    if (printNF){
      showNormalForm(program.normalizedForm);
    }

    if (!nosave){
      writeFileSync("../visualisation/nf.json", 
                        JSON.stringify(program.normalizedForm, null, 2));
      console.log("NF saved to nf.json");
    }

  } catch (error) {
    console.log("Error while normalizing :");
    whereFail[2].push(testNb);
    if (verbose){
      showNormalForm(program.normalizedForm);
      console.log(error);
    }
    return false;
  }

  try{
    resetOutputs();
    initEvalComp(program);
    if (isGoodResult(program.expected, outputs, verbose)){
      if (verbose){
        console.log("Successful evaluation :) ");
      } 
    } else {
      throw new Error("Expected result is different than the one evaluated");
    }

  } catch (error) {
    console.log("Error while evaluating :");
    whereFail[3].push(testNb);
    console.log(error);
    return false;

  }
  return true;
}

/**
 * Determines if the result of evaluation is the same as the expected one
 * @param {String} expected 
 * @param {[String]} actual not really strings but whatever 
 * @param {Boolean} verbose to print what failed
 * @returns {Boolean}
 */
function isGoodResult(expected, actual, verbose){
  expected = expected.split("\\n");

  for (let i = 0; i < expected.length; i++ ){
    expected[i] = expected[i].trimEnd();
    if (expected[i] != actual[i]){
      if ((expected[i] != actual[i].toString())){
        if (verbose){
          console.log(actual[i])
          console.log(expected[i] + " != " + actual[i]);
        }
        return false;
      }
    }
  }

  if(expected.length !==  actual.length){
    if (verbose){
      console.log("expected result is of size " + expected.length + " and "
        + " actual result is of size " + actual.length);
      console.log("expected : " + expected);
      console.log("actual result : " + actual);
    }
    return false;
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
    console.log(token);
  }
}

/**
 * Prints on the console all the tokens, one by line
 * @param {Token} tokens 
 */
function showLayoutProgram(tokens){
  let n = 1;
  let prog = "";
  let lstLine = 0;
  console.log("Tokens with layout: " );
  for (let token of tokens){
    if (lstLine !== token.line || token.line === -1){
      prog += "\n" + "  ".repeat(n);
    }
    if (token.value === "{"){
      n += 1;
    } else if (token.value === "}"){
      n -= 1;
    } 
    prog += " " + token.value;
    lstLine = token.line;
    
  }
  console.log(prog);
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