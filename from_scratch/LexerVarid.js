import { Program } from "./Program.js";
import { getLiteral, getLarge, getDigit, getSmall, getSymbol } from "./LexerAsc.js"
import { getSpecial } from "./Lexer.js";


//--  File containing lexer functions for varid -> qconsym related rules  --//

// Original order changed so that ':' won't shadow the '::' 
// (same for '=' and '=>')
const HS_reservdop = ["..","::",":","=>","\\","|","<-","->","@","~","="];
const HS_reservdid = 
["case","class ","data","default","deriving","do","else","foreign","if",
 "import","in","infix","infixl","infixr","instance","let","module","newtype",
 "of","then","type","where","_"];

/**
 * Rule lexeme → qvarid | qconid | qvarsym | qconsym | literal | special | 
 *               reservedop | reservedid 
 * @param {Program} program 
 * @returns {Boolean} 
 */
export function getLexeme(program){
  return getQvarid(program)
    || getQconid(program)
    || getQvarsym(program)
    || getQconsym(program)
    || getLiteral(program)
    || getSpecial(program)
    || getReservedop(program)
    || getReservedid(program);
}

/**
 * Rule : varid → (small {small | large | digit | ' })⟨reservedid⟩
 * @param {Program} program 
 * @returns {Boolean}
 */
function getVarid(program){
  program.startMerge();
  if (getSmall(program)){
    while(true){
      if (getSmall(program) || getLarge(program) || getDigit(program)){} 
      else if (program.index <= program.input.length && 
               program.input[index] === "\'"){
        program.addToken("\'");
      }
      else {break;}
    }
    var startIndex = program.endMerge("Varid");

    // to verify that the var id is not a reserved id 
    if (HS_reservdid.includes(program.tokens[program.tokens.length-1].value)){
        program.tokens.pop();
        program.setIndex(startIndex);
        return false;
    }
    return true;
  }
  program.endMerge("NULL");
  return false;
}

/**
 * Rule : conid → large {small | large | digit | ' }
 * @param {Program} program 
 * @returns {Boolean}
 */
function getConid(program){
  program.startMerge();
  if (getLarge(program)){
    while(true){
      if (getSmall(program) || getLarge(program) || getDigit(program)){} 
      else if (program.index <= program.input.length && 
               program.input[index] === "\'"){
        program.addToken("\'");
      }
      else {break;}
    }
    program.endMerge("Conid");
    return true;
  }
  program.endMerge("NULL");
  return false;
}

/**
 * Rule : reservedid → case | class | data | default | deriving | do | else | 
 *                     foreign | if | import | in | infix | infixl | 
 *                     infixr | instance | let | module | newtype | of | then | 
 *                     type | where | _
 * @param {Program} program 
 * @returns {Boolean}
 */
function getReservedid(program){
    return program.isNextInList(HS_reservdid,"reservdid");
}

/**
 * Rule : varsym → ( symbol⟨:⟩ {symbol} )⟨reservedop | dashes⟩
 * @param {Program} program 
 * @returns {Boolean}
 */
function getVarsym(program){
  program.startMerge();
  if (program.getChar() !== ":" && getSymbol(program)){
    while (getSymbol(program)){} 
    // We suppose getSymbol adds the symbol to the token list
    startIndex = program.endMerge("Varsym"); 

    // To verify that the var sym is not a reserved op or starts with '--'
    // FIXME : Does the rule imply that there cannot be any '--' anywhere ? 
    if (HS_reservdop.includes(program.getLastToken().value)
       || program.getLastToken().value.substring(0,2) === "--"){
      program.tokens.pop();
      program.setIndex(startIndex);
      return false;
    }
    return true;
  }
  program.endMerge("NULL");
  return false;
}

/**
 * Rule : consym → ( : {symbol})⟨reservedop⟩
 * @param {Program} program 
 * @returns {Boolean}
 */
function getConsym(program){
  program.startMerge();
  if (program.getChar() === ":" ){
    program.addToken('any');
    while (getSymbol(program)){}
    // We suppose getSymbol adds the symbol to the token list

    startIndex = program.endMerge("Consym");

    // To verify that the var sym is not a reserved op 
    if (HS_reservdop.includes(program.getLastToken().value)){
      program.tokens.pop();
      program.setIndex(startIndex);
      return false;
    }
    return true;
  }
  program.endMerge("NULL");
  return false;
}


/**
 * Rule : reservedop → .. | : | :: | = | \ | | | <- | -> |  @ | ~ | =>
 * @param {Program} program 
 * @returns {Boolean}
 */
function getReservedop(program){
    return program.isNextInList(HS_reservdop,"reservdop");
}

/**
 * Rule : tyvar → varid 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getTyvar(program){
  return getVarid(program);
}

/**
 * Rule : tycon → conid
 * @param {Program} program 
 * @returns {Boolean}
 */
function getTycon(program){
  return getConid(program);
}

/**
 * Rule : tycls → conid
 * @param {Program} program 
 * @returns {Boolean}
 */
function getTycls(program){
  return getConid(program);
}

/**
 * Rule : modid → {conid .} conid
 * @param {Program} program 
 * @returns {Boolean}
 */
function getModid(program){
  if (!getConid(program)){ return false;}
  while (program.getChar() === '.'){
    program.incIndex();
    if (!getConid(program)){
      program.decIndex();
      return true;
    }
  }
  return true;
}

/**
 * Rule : qvarid → [ modid . ] varid 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQvarid(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getVarid(program);
  }
  return false;
}

/**
 * Rule : qconid → [ modid . ] conid 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQconid(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getConid(program);
  }
  return false;
}

/**
 * Rule : qtycon → [ modid . ] tycon 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQtycon(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getTycon(program);
  }
  return false;
}

/**
 * Rule : qtycls → [ modid . ] tycls 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQtycls(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getTycls(program);
  }
  return false;
}

/**
 * Rule : qvarsym → [ modid . ] varsym 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQvarsym(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getVarsym(program);
  }
  return false;
}

/**
 * Rule : qconsym → [ modid . ] consym 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQconsym(program){
  if (getModid(program) && program.getChar() === '.'){
    program.incIndex();
    return getConsym(program);
  }
  return false;
}

