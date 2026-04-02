import { addIndentation } from "./lexer/Indentation.js";
import { tokenize } from "./lexer/Lexer.js";
import { parse } from "./parser/Parser.js";
import { normalizeStart } from "./normalize/normalizer.js";
import { compressTree, Node } from "./objects/Node.js";
import { Program } from "./objects/Program.js";
import { makeGlobalRTE, RunTimeEnv } from "./objects/RunTimeEnv.js";

/**
 * Bundled version of main for integration with codeboot
 * @param {String} input 
 * @param {func} compilationError 
 * @returns {[Node, RunTimeEnv]} 
 */
export default function parseHaskell(input, compilationError){
  let program = new Program(input);
  try {
    tokenize(program);
  } catch(e){
    compilationError(
      program.lineCount,  // position of error
      program.index - 1,  // not ideal FIXME, get  
      program.lineCount,  // 
      program.index,      // while lexing
      "Tokenization error ",
      e.message);
    return ;
  } try {
    addIndentation(program);
  } catch(e){ 
    compilationError(
      program.startLine, 
      program.startCol -1,   
      program.endLine, 
      program.endCol -1, 
      "Indenting error ",
      e); 
    return ;
  } try {
    parse(program);
  } catch(e){ 
    // parsing errors come from not finding any rules so hard to pin point a
    // loc as to where is the error
    compilationError(0, 0, 0, 0, "Parse error", e.message);
    return ;
  }

  compressTree(program.AST);
  let global_rte = makeGlobalRTE();
  
  try {
    normalizeStart(program, global_rte);
  } catch(e){ 
    compilationError(
      program.startLine, 
      program.startCol - 1,   
      program.endLine, 
      program.endCol -1, 
      "Normalisation error",
      e.message);
    return ;
  }

  return [program.normalizedForm, global_rte];
}

// - 1 on col number yields from the fact that haskell starts col at 1 where
// codeboot starts at 0

// test
//parseHaskell("a = 1 \nb = 2 \nb :: Integer \nc = 3", 
  //(a,b,c,d,e,f)=>console.log(a,b,c,d,e,f));