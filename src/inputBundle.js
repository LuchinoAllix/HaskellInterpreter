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
    compilationError(program.index,      // not ideal FIXME, get  
                     program.lineCount,  // position of error
                     program.index + 1,  // while lexing
                     program.lineCount,  // 
                     "Tokenization ",
                      e.message);
    return ;
  } try {
    addIndentation(program);
  } catch(e){ 
    compilationError(program.startCol,   
                     program.startLine, 
                     program.endCol, 
                     program.endLine, 
                     "Indenting ",
                     e); 
    return ;
  } try {
    parse(program);
  } catch(e){ 
    // parsing errors come from not finding any rules so hard to pin point a
    // loc as to where is the error
    compilationError(0, 0, 0, 0, "Parse ", e.message);
    return ;
  }

  compressTree(program.AST);
  let global_rte = makeGlobalRTE();
  
  try {
    normalizeStart(program, global_rte);
  } catch(e){ 
    compilationError(program.startCol,   
                     program.startLine, 
                     program.endCol, 
                     program.endLine, 
                     "Normalisation ",
                    e.message);
    return ;
  }

  return [program.normalizedForm, global_rte];
}

// test
parseHaskell("a :: Int\n a = 1\n b = 2\nb ::Int", 
  (a,b,c,d,e,f)=>console.log(a,b,c,d,e,f));