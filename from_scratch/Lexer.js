import { Program } from "./program";
import { getLexeme} from "./LexerVarid";
import { getWhitespace } from "./LexerWhite";

const HS_special = ["(",")",",",";","[","]","`","{","}"];

/**
 * Allows to transform the input to a list of tokens  
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
export function tokenize(program){
  getProgram(program);
  return true;
}

/**
 * Rule : program → { lexeme | whitespace } 
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
function getProgram(program){
  while(getLexeme(program) || getWhitespace(program)){} 
  if (index == input.length){
    return true;
  } else if (index < input.length){
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
    // TODO : make tokens
    tokens.push(program.getChar());
    program.incIndex();
    return true;
  }
  return false;
}