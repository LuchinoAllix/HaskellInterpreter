import { Program } from "./Program";

//--  File containing lexer functions for withespace related rules  --//

const HS_return = "\r";
const HS_linefeed = "\n";
const HS_vertab = "\v";
const HS_formfeed = "\f";
const HS_space = " ";
const HS_tab = "\t";

const HS_uniWhite = [ // TODO : Verify
  '\u0085', '\u00A0', '\u1680', '\u180E', '\u2000', '\u2001', '\u2002',
  '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', 
  '\u200A', '\u2028', '\u2029', '\u202F', '\u205F', '\u3000'
];

/**
 * Rule : whitespace → whitestuff {whitestuff} 
 * @param {Program} program
 * @returns {Boolean} 
 */
export function getWhitespace(program){
  if(getWhitestuff(program)){
    while(getWhitestuff(program)){}
    return true;
  }
  return false;
}

/**
 * Rule : whitestuff → whitechar | comment | ncomment
 * @param {Program} program
 * @returns {Boolean} 
 */
function getWhitestuff(program){
  return getWhitechar(program)
    || getComment(program)
    || getNcomment(program);
}

/**
 * Rule : whitechar → newline | vertab | space | tab | uniWhite 
 * @param {Program} program
 * @returns {Boolean}  
 */
function getWhitechar(program){
  return getNewline(program)
    || getVertab(program)
    || getSpace(program)
    || getTab(program)
    || getUniWhite(program);
}

/**
 * Rule : newline → return linefeed | return | linefeed | formfeed 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getNewline(program){
  // We have to use temporary variables because of the order of the rule
  let r = getReturn(program);
  let l = getLinefeed(program);
  return r || l || getFormfeed(program);
}

/**
 * Rule : return → a carriage return 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getReturn(program){
  if(program.getChar() === HS_return){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : linefeed → a line feed 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getLinefeed(program){
  if(program.getChar() === HS_linefeed){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : formfeed → a form feed
 * @param {Program} program
 * @returns {Boolean} 
 */
function getFormfeed(program){
  if(program.getChar() === HS_formfeed){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : vertab → a vertical tab 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getVertab(program){
  if(program.getChar() === HS_vertab){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : space → a space 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getSpace(program){
  if(program.getChar() === HS_space){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : tab → a horizontal tab 
 * @param {Program} program
 * @returns {Boolean} 
 */
function getTab(program){
   if(program.getChar() === HS_tab){
    program.incIndex();
    return true;
  }
  return false;
}

/**
 * Rule : uniWhite → any Unicode character defined as whitespace
 * @param {Program} program
 * @returns {Boolean} 
 */
function getUniWhite(program){
  if(HS_uniWhite.includes(program.getChar())){
    program.incIndex();
    return true;
  }
  return false;
}
