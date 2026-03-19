import { addIndentation } from "./lexer/Indentation.js";
import { tokenize } from "./lexer/Lexer.js";
import { parse } from "./parser/Parser.js";
import { normalizeStart } from "./normalize/normalizer.js";
import { compressTree, Node } from "./objects/Node.js";
import { Program } from "./objects/Program.js";
import { makeGlobalRTE, RunTimeEnv } from "./objects/RunTimeEnv.js";

/**
 * TODO
 * @param {String} input 
 * @returns {[Node, RunTimeEnv]} 
 */
export default function parseHaskell(input){
  let program = new Program(input);
  tokenize(program);
  addIndentation(program);
  parse(program);
  compressTree(program.AST);
  let global_rte = makeGlobalRTE();
  normalizeStart(program, global_rte);
  return [program.normalizedForm, global_rte];
}

// test
//console.log(parseHaskell("main = print (1 + 2)"));