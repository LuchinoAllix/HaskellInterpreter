import { Program } from "./Program.js";

//--  File containing lexer functions for comments related rules  --//

/**
 * Rule : comment → dashes [ any⟨symbol⟩ {any} ] newline 
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getComment(program){
  if(getDashes(program)){
    while(!getNewline(program)){
      // règle : comment = dashes (any !symbol any*)? newline
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
      program.index += 2;
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
      program.index += 2;
      return true;
    }
  }
}

/**
 * Rule : ncomment → opencom ANY seq {ncomment ANY seq} closecom 
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getNcomment(program){
  if (getOpencom(program) && getAnySeq(program)){
    while (getNcomment(program) && getAnySeq(program)){}
    return getClosecom(program);
  }
  return false;
}

/**
 * FIXME : The rule is not implemented correctly but I can't bother rn
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
    program.incIndex() ;
    return true ;
  }
  return getSmall(program)
    || getLarge(program)
    || getSymbol(program)
    || getDigit(program)
    || getSpecial(program);
}