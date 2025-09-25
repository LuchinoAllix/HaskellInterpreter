import { Program } from "./Program.js";
import { getNewline, getWhitechar } from "./LexerWhite.js";
import { getSmall, getLarge, getSymbol, getDigit } from "./LexerAsc.js";
import { getSpecial } from "./Lexer.js";

//--  File containing lexer functions for comments related rules  --//

/**
 * Rule : comment → dashes [ any⟨symbol⟩ {any} ] newline 
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getComment(program){
  if(getDashes(program)){
    while(!getNewline(program) && program.index !== program.input.length){
      // FIXME ce n'est pas ce qui est implémenté ici
      program.incIndex();
    }
    return true;
  }
  return false
}

/**
 * Rule : dashes → -- {-} 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getDashes(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "-" && program.getNextChar() === "-"){
      program.incIndexN(2);
      while(program.index < program.input.length && program.getChar() ==="-"){
        program.incIndex();
      }
      return true;
    }
  }
  return false;
}

/**
 * Rule : opencom → {-
 * @param {Program} program
 * @returns {Boolean} 
 */
function getOpencom(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "{" && program.getNextChar() === "-"){
      program.incIndex();
      program.incIndex();
      return true;
    }
  }
}

/**
 * Rule : closecom → -}
 * @param {Program} program
 * @returns {Boolean} 
 */
function getClosecom(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "-" && program.getNextChar() === "}"){
      program.incIndexN(2);
      return true;
    }
  }
}

/**
 * # FIXME : The rule is not implemented correctly but I can't bother rn
 * Rule : ncomment → opencom ANY seq {ncomment ANY seq} closecom 
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getNcomment(program){
  if (getOpencom(program)){
    while (!getClosecom(program) && program.index !== program.input.length ){
      program.incIndex();
    }
    return true;
  }
  return false;
}

/**
 * # FIXME : The rule is not implemented correctly but I can't bother rn
 * Rule : ANY seq → {ANY }⟨{ANY } ( opencom | closecom ) {ANY }⟩
 * @param {Program} program
 * @returns {Boolean} 
 */
function getAnySeq(program){
  program.startMerge();
  while (getANY(program)){}
  program.endMerge("NULL");
  return true;
}

/**
 * Rule : ANY → graphic | whitechar 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getANY(program){
  return getGraphic(program)
    || getWhitechar(program);
}

/**
 * FIXME : Never used
 * Rule : any → graphic | space | tab 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getAny(program){
  return getGraphic(program)
    || getSpace(program)
    || getTab(program);
}

/**
 * Rule : graphic → small | large | symbol | digit | special | " | '
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getGraphic(program){
  if (program.getChar() === "\"" || program.getChar() === "\'"){
    program.addToken("" + program.getChar()); // # FIXME : find a better type name ?
    return true ;
  }
  return getSmall(program)
    || getLarge(program)
    || getSymbol(program)
    || getDigit(program)
    || getSpecial(program);
}