
//--                   File to test the program on input (tests)            --//

/*
 * Note : The code for tests is not particularly well written, there is a lot
 * of duplicated code.
*/

import { Program } from './objects/Program.js'
import { tokenize }from './lexer/Lexer.js'
import { addIndentation } from "./lexer/Indentation.js"
import { parse, activateDebugParse } from './parser/Parser.js'
import { Token } from "./objects/Token.js";
import { Node, compressTree } from './objects/Node.js';
import { normalizeStart } from './normalize/normalizer.js';
import { Term } from './normalize/Term.js';
import { initEvalComp, initGlobal } from './eval/eval.js';
import { outputs, resetOutputs } from './eval/Env.js';
import { typeCheck } from './typeCheck/TypeCheck.js';

import { readFile } from 'fs/promises';
import { writeFileSync } from 'fs';

let tests = [];
let testsFail = [];
let whereFail = [[],[],[],[],[],[]];
let where = ["lexing", "indentation", "parsing", "normalising", "type checking", 
  "evaluating"];

let printAST = false;
let printDebugParse = false;
let nosave = false;
let printTokens = false;
let printIndent = false;
let derivative = false;
let printNF = false;
let verbose = false;
let fail = false;
let all = false

/**
 * Main function to test Parser
 * Does not check if an option is given twice, but not really important
 */
async function main(){
  
  let testNum =parseInt(process.argv[2]);
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

      case "--Indent" :
      case "--indent" :
        printIndent = true;
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

      case "--Fail" :
      case "--fail" :
        fail = true;
        break;

      case "--all" :
      case "--All" :
        all = true;
        break;


      default :
        console.log("\nArgument specified unrecognised : ", arg);
        printOptions();
        return ;
    }
  }

  if (all) {
    let cnt = 0;
    cnt += await runTests(testNum);
    cnt += await runFailTests(testNum);
    console.log("\nTests passed (fail and sucess): ", cnt, "/", 
      tests.length + testsFail.length);
    return ;
  }

  if (fail) { runFailTests(testNum);
  } else { runTests(testNum) ; }

  return;
}

/**
 * Runs the tests that are supposed to fail (one if specified, all otherwise)
 * Returns the number of tests passed
 * @param {number} testNum 
 * @returns {Intger}
 */
async function runFailTests(testNum){
  await makeFailTests();
  if(isNaN(testNum)){ // running all the tests
    var cnt = 0;
    nosave = true;
    for (let i=1; i <= testsFail.length; i ++){
      if (testAtest(i)){
        cnt +=1;
        console.log("✅ Test failed as expected");
      } else {
        console.log("❌ Test didn't fail as expected");
      }
    }
    console.log("\nTests passed : ", cnt, "/", testsFail.length);
    printDataFails();
  } else { // running a particular test
    if (testNum > testsFail.length || testNum  <= 0 ){
      console.log("Test number out of range, tests go from 1 to : ", 
                  testsFail.length);
    } else {
      verbose = true;
      if (testAtest(testNum, fail)){
        console.log("✅ Test failed as expected");
      } else {
        console.log("❌ Test didn't fail as expected");
      }
    }
  }
  return cnt;
}

/**
 * Runs the tests (one if specified, all otherwise)
 * Returns the number of tests passed
 * @param {number} testNum 
 * @returns {Integer}
 */
async function runTests(testNum){
  await makeTests();
  if(isNaN(testNum)){ // running all the tests
    var cnt = 0;
    nosave = true;
    for (let i=1; i <= tests.length; i ++){
      if (testAtest(i)){
        cnt +=1;
        console.log("✅ Test passed");
      } else {
        console.log("❌ Test failed");
      }
    }
    console.log("\nTests passed : ", cnt, "/", tests.length);
    printDataFails();
  } else { // running a particular test
    if (testNum > tests.length || testNum  <= 0 ){
      console.log("Test number out of range, tests go from 1 to : ", 
                  tests.length);
    } else {
      verbose = true;
      if (testAtest(testNum)){
        console.log("✅ Test passed");
      } else {
        console.log("❌ Test failed");
      }
    }
  }
  return cnt;
}

/**
 * Prints the information about where each test failed
 */
function printDataFails(){
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
      "  --Indent      shows the list of token after indentation\n" +
      "  --AST         shows the AST after parsing\n" +
      "  --DebugParse  shows the rules took whilst parsing\n" +
      "  --Nosave      doesn't save the AST and NF after generating them\n" +
      "  --Derivative  shows/saves the derivative tree instead of the AST\n" +
      "  --NF          shows the normal form after normalizing\n" +
      "  --Fail        runs the tests that are supposed to fail\n" +
      "  --Verbose     shows error messages if all tests are run"
    );
}

/**
 * Tests a file according to the options specified
 * @param {Int} testNb the number of the test to test
 */
function testAtest(testNb){
  
  var test ;
  if (fail){
    test = testsFail[testNb-1];
  } else {
    test = tests[testNb-1];
  }
  
  const program = new Program(test.input);
  program.expected = test.expected;
  console.log("\nTest " + testNb + " : testing " + test.info);

  if (verbose){ console.log("Input : \n" + program.input) ; }

  try {

    tokenize(program);

    if (verbose){ console.log("✅ Tokenization") ; }

    if(printTokens){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
    }

  } catch (error) {

    if (fail && program.expected === "0"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }

    console.log("❌ Error while tokenizating");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]);   
    }

    whereFail[0].push(testNb);

    if (verbose){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
      console.log(error);
    }

    return false;
  }

  try {

    addIndentation(program);

    if (verbose){ console.log("✅ Indentation") ; }

    if(printIndent){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
    }

  } catch (error) {

    if (fail && program.expected === "1"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }
    
    console.log("❌ Error while indentation");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]);   
    }
    
    whereFail[1].push(testNb);

    if (verbose){
      showTokens(program.tokens);
      showLayoutProgram(program.tokens);
      console.log(error);
    }

    return false;
  }

  try {

    if (printDebugParse){ activateDebugParse() ; }

    parse(program);
    
    if (!derivative){ compressTree(program.AST) ; }
    
    let printAstMsg = "" ;
    
    if (!nosave){
      writeFileSync("../visualisation/ast.json", 
                        JSON.stringify(program.AST, null, 2));
      printAstMsg = " (AST saved to ast.json)";
    } 
    
    if (verbose){ console.log("✅ Parsing" + printAstMsg) ; }

    if (printAST){ showAST(program.AST) ; }

  } catch (error) {

    if (fail && program.expected === "2"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }
    
    console.log("❌ Error while parsing");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]);
    }

    whereFail[2].push(testNb);

    if (verbose){
      showAST(program.AST);
      console.log(error);
    }

    return false;
  }

  try{
    
    initGlobal();
    normalizeStart(program)

    let printNorMsg = "";
    
    if (!nosave){
      writeFileSync("../visualisation/nf.json", 
                        JSON.stringify(program.normalizedForm, null, 2));
      printNorMsg = " (NF saved to nf.json)";
    }

    if (verbose){ console.log("✅ Normalisation" + printNorMsg) ; }

    if (printNF){ showNormalForm(program.normalizedForm) ; }


  } catch (error) {
    
    if (fail && program.expected === "3"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }
    
    console.log("❌ Error while normalizing");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]);   
    }

    whereFail[3].push(testNb);

    if (verbose){
      showNormalForm(program.normalizedForm);
      console.log(error);
    }

    return false;
  }

  try{
  
    typeCheck(program);
    
    if (verbose){ console.log("✅ Type checking") ; }

  } catch (error) {

    if (fail && program.expected === "4"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }
    
    console.log("❌ Error while type checking");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]);   
    }

    whereFail[4].push(testNb);

    if (verbose){ console.log(error) ; }

    return false;
  }

  try{

    resetOutputs();
    initEvalComp(program);

    if (isGoodResult(program.expected, outputs)){
      if (verbose){ console.log("✅ Evaluation") ; } 
    } else {

      throw new Error("❌ Expected result is different than the one evaluated");
    }

  } catch (error) {

    if (fail && program.expected === "5"){ 
      if (verbose){ console.log(error) ; }
      return true ; 
    }
    
    console.log("❌ Error while evaluating");

    if (fail) { 
      console.log("Test did not fail where it was supposed to, was supposed to" 
        + " fail at " + where[program.expected]); 
    }

    whereFail[5].push(testNb);
    
    if (verbose){ console.log(error) ; }

    return false;
  }

  if (fail){
    console.log("Test succeded when in was not supposed to. It was supposed to" 
      + " fail at " + where[program.expected]);
    return false;
  }

  return true;
}

/**
 * Determines if the result of evaluation is the same as the expected one
 * @param {String} expected 
 * @param {[String]} actual not really strings but whatever 
 * @returns {Boolean}
 */
function isGoodResult(expected, actual){
  expected = expected.split("\\n");

  for (let i = 0; i < expected.length; i++ ){
    expected[i] = expected[i].trimEnd();
    if (expected[i] !== actual[i]){
      if ((expected[i] !== actual[i].toString())){
        if (verbose){
          console.log("(expected) " + expected[i] + " !== " + actual[i] + 
            " (received)");
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

/**
 * Creates the list of tests based on the TestsFail.hs file.
 * Each input is in between '--/' (if there are no other '--/' before)
 * information about the tests are given with :   
 * -- Test : ...
 * -- Expected crash : ...
 * @returns {Boolean}
 */
async function makeFailTests(){
  try {
    var content = await readFile("./TestsFail.hs", 'utf8');
      
    content = content.split("--/");

    for (let i = 0; i < content.length -1; i += 2){
      let test = {};
      test.num = i/2;
      let lines = content[i].split("\n");
      for (let j = 0; j < lines.length; j ++){
        let line = lines [j]
        if (line.startsWith("-- Test")){
          test.info = line.split(":")[1].slice(1);
        } else if (line.startsWith("-- Expected crash : ")){
          test.expected = line.split(":")[1].slice(1);
        }
      }
      test.input = content[i+1];
      testsFail.push(test); 
    }
    return true;

  } catch (error) {
    console.error("Error while reading test file:", error);
  }
}

main()