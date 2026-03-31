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
export default function parseHaskell(input, external_content){
  let program = new Program(input);
  try {
    tokenize(program);
  } catch(e){
    external_content.syntaxError(program.index,      // not ideal FIXME, get  
                                 program.lineCount,  // position of error
                                 program.index + 1,  // while lexing
                                 program.lineCount,  // 
                                 "Tokenization Error", 
                                 e);
  } try {
    addIndentation(program);
  } catch(e){ 
    external_content.syntaxError(program.index,      // plain wrong, FIXME, get  
                                 program.lineCount,  // position of error
                                 program.index + 1,  // while indenting
                                 program.lineCount,  // 
                                 "Indenting Error", 
                                 e);
  } try {
    parse(program);
  } catch(e){ 
    external_content.syntaxError(program.index,      // plain wrong, FIXME, get   
                                 program.lineCount,  // position of error
                                 program.index + 1,  // while parsing
                                 program.lineCount,  // 
                                 "Parse Error", 
                                 e);
  }

  compressTree(program.AST);
  let global_rte = makeGlobalRTE();
  
  try {
    normalizeStart(program, global_rte);
  } catch(e){ 
    external_content.syntaxError(program.index,      // plain wrong, FIXME, get  
                                 program.lineCount,  // position of error
                                 program.index + 1,  // while normalising
                                 program.lineCount,  // 
                                 "Normalisation Error", 
                                 e);
  }
  
  return [program.normalizedForm, global_rte];
}

// test
//console.log(parseHaskell("main = print (1 + 2)"));