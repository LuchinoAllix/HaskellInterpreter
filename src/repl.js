import { Program } from './objects/Program.js';
import { Env } from "./eval/Env.js"
import { typeCheck } from './typeCheck/TypeCheck.js';
import { initEvalInter, initGlobal } from './eval/eval.js';
import { tokenize } from './lexer/Lexer.js';
import { parse } from './parser/Parser.js';
import { normalizeStart } from './normalize/normalizer.js';
import { compressTree } from './objects/Node.js';


let localEnv = new Env();

function startRepl(){
  initGlobal();
  process.stdin.setEncoding('utf8');
  process.stdout.write('> ');
  process.stdin.on('data', (input) => repl(input))
}

function repl(input){
  input = input.trim();

  switch (input){
    case "exit" :
      process.exit(0);

    case "help" :
      printHelp();
      process.stdout.write('> ');
      break;

    case "reset env" :
      localEnv = new Env();
      process.stdout.write('> ');
      break;
    
    default :
      run(input, localEnv);
      process.stdout.write('> ');

  }
}

function run(input, env){
  let program = new Program(input);

  try {
    tokenize(program);
  } catch (error) {
    console.log("Error while tokenizating :");
    console.log(error);
    return false;
  }

  try {
    parse(program);
  } catch (error) {
    console.log("Error while parsing :");
    console.log(error);
    return false;
  }

  try {
    compressTree(program.AST);
    normalizeStart(program);
  } catch (error) {
    console.log("Error while normalising :");
    console.log(error);
    return false;
  }

  try {
    //typeCheck(program);
  } catch (error) {
    console.log("Error while type checking :");
    console.log(error);
    return false;
  }

  try {
    initEvalInter(program, env);
  } catch (error) {
    console.log("Error while evaluating :");
    console.log(error);
    return false;
  }
}

startRepl();