import { Program } from "../Program.js";
import { tokenize } from "../lexer/Lexer.js";

/**
 * Allows to transform a list of tokens to an AST
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
export function parse(program){
  if (!program.isLexed){
    tokenize(program);
  }
  // # TODO
  return true;
}