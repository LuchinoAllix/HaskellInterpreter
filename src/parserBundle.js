import { addIndentation } from "./lexer/Indentation.js";
import { tokenize } from "./lexer/Lexer.js";
import { normalizeStart } from "./normalize/normalizer.js";
import { compressTree, Node } from "./objects/Node.js";
import { Program } from "./objects/Program.js";
import { makeGlobalRTE, RunTimeEnv } from "./objects/RunTimeEnv.js";

/**
 * TODO
 * @param {String} input 
 * @returns {[Node, RunTimeEnv]} 
 */
function parseHaskell(input){
  let program = new Program(input);
  tokenize(program);
  addIndentation(program);
  parse(program);
  compressTree(program);
  normalizeStart(program, makeGlobalRTE());
  return [program.normalizedForm, global_rte];
}