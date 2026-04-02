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
                     "Tokenization error",
                      e.message);
    return ;
  } try {
    addIndentation(program);
  } catch(e){ 
    compilationError(program.startCol,   //   
                     program.startLine,  // 
                     program.endCol,     // 
                     program.endLine,    // 
                     "Indenting error",
                     e); 
    return ;
  } try {
    parse(program);
  } catch(e){ 
    compilationError(program.index,      // plain wrong, FIXME, get   
                     program.lineCount,  // position of error
                     program.index + 1,  // while parsing
                     program.lineCount,  // 
                     "Parse error",
                     e.message); // fixme
    return ;
  }

  compressTree(program.AST);
  let global_rte = makeGlobalRTE();
  
  try {
    normalizeStart(program, global_rte);
  } catch(e){ 
    compilationError(program.index,      // plain wrong, FIXME, get  
                     program.lineCount,  // position of error
                     program.index + 1,  // while normalising
                     program.lineCount,  // 
                     "Normalisation error",
                    e.message);
    return ;
  }

  return [program.normalizedForm, global_rte];
}

// test
parseHaskell("main =\n    print(\"Hello world))\"\n", 
  (a,b,c,d,e,f)=>console.log(a,b,c,d,e,f));