import { Program } from "./Program.js";
import { getLexeme} from "./LexerVarid.js";
import { getWhitespace } from "./LexerWhite.js";

const HS_special = ["(",")",",",";","[","]","`","{","}"];

/**
 * Allows to transform the input to a list of tokens  
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
export function tokenize(program){
  return getProgram(program);
}

/**
 * Rule : program → { lexeme | whitespace } 
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
function getProgram(program){
  while(getLexeme(program) || getWhitespace(program)){} 
  if (program.index == program.input.length){
    return true;
  } else if (program.index < program.input.length){
    throw Error("Not all input was parsed");
  }
  throw Error("Index > input.length");
}


/**
 * Rule : special → ( | ) | , | ; | [ | ] | ` | { | }
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
export function getSpecial(program){
  if (HS_special.includes(program.getChar())){
    return program.addToken("Special");
  }
  return false;
}