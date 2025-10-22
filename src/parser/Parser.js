import { Program } from "../Program.js";
import { tokenize } from "../lexer/Lexer.js";

//--  File for parsing based on the Context-Free Syntax of Haskell doc   --//

/**
 * Source : https://www.haskell.org/onlinereport/haskell2010/haskellch10.html
 * Chapter : 10.5 
 * 
 * How the rules were split in different files in purely arbitrary, grouping 
 * them somewhat together to avoid having one big file.
*/

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