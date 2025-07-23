import { Program } from "./Program.js";
import { getLiteral } from "./LexerAsc.js"
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
    // # TODO
    return false;
}

/**
 * Rule : conid → large {small | large | digit | ' }
 * @param {Program} program 
 * @returns {Boolean}
 */
function getConid(program){
    if (getLarge(program)){
        while(true){
            if (getSmall(program) || getLarge(program) || getDigit(program)){} 
            else if (index <= input.length && input[index] === "\'"){index ++;}
            else {break;}
        }
        return true
    }
    return false
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
    // #TODO
    return false;
}

/**
 * Rule : consym → ( : {symbol})⟨reservedop⟩
 * @param {Program} program 
 * @returns {Boolean}
 */
function getConsym(program){
    // #TODO
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
    if (!program.getConid()){ return false;}
    while (program.getChar() === '.'){
        program.incIndex();
        if (!program.getConid()){
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
    if (program.getModid() && program.getChar() === '.'){
        program.incIndex();
        return program.getVarid();
    }
    return false;
}

/**
 * Rule : qconid → [ modid . ] conid 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQconid(program){
  if (program.getModid() && program.getChar() === '.'){
    program.incIndex();
    return program.getVarid();
  }
  return false;
}

/**
 * Rule : qtycon → [ modid . ] tycon 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQtycon(program){
    // #TODO
    return false;
}

/**
 * Rule : qtycls → [ modid . ] tycls 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQtycls(program){
    // #TODO
    return false;
}

/**
 * Rule : qvarsym → [ modid . ] varsym 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQvarsym(program){
    // #TODO
    return false;
}

/**
 * Rule : qconsym → [ modid . ] consym 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getQconsym(program){
    // #TODO
    return false;
}

