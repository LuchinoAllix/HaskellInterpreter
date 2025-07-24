import { getWhitespace } from "./LexerWhite.js";
import { Program } from "./Program.js";
import { getGraphic } from "./LexerComments.js";
import { getSpace } from "./LexerWhite.js"
import { HS_special } from "./Lexer.js";

//--  File containing lexer functions for symbols related rules   --//

const HS_uniSmall = [ // TODO : Vérifier
  '\u00E0', '\u00E1', '\u00E2', '\u00E3', '\u00E4', '\u00E5', '\u00E6', 
  '\u00E7', '\u00E8', '\u00E9', '\u00EA', '\u00EB', '\u00EC', '\u00ED', 
  '\u00EE', '\u00EF', '\u00F0', '\u00F1', '\u00F2', '\u00F3', '\u00F4', 
  '\u00F5', '\u00F6', '\u00F8', '\u00F9', '\u00FA', '\u00FB', '\u00FC', 
  '\u00FD', '\u00FE', '\u00FF'
];

const HS_uniLarge = [ // TODO : Vérifier
  '\u00C0', '\u00C1', '\u00C2', '\u00C3', '\u00C4', '\u00C5', '\u00C6', 
  '\u00C7', '\u00C8', '\u00C9', '\u00CA', '\u00CB', '\u00CC', '\u00CD', 
  '\u00CE', '\u00CF', '\u00D0', '\u00D1', '\u00D2', '\u00D3', '\u00D4', 
  '\u00D5', '\u00D6', '\u00D8', '\u00D9', '\u00DA', '\u00DB', '\u00DC', 
  '\u00DD', '\u00DE'
];

const HS_ascSymbol = [
  '!', '#', '$', '%', '&', '⋆', '+', '.', '/', '<', '=', '>', '?', '@', 
  '\\', '^', '|', '~', '-', ':'
];

const HS_uniSymbol = [ // TODO : Vérifier
  '\u00A1', '\u00A2', '\u00A3', '\u00A4', '\u00A5', '\u00A6', '\u00A7',
  '\u00A9', '\u00AA', '\u00AB', '\u00AC', '\u00AE', '\u00AF', '\u00B0',
  '\u00B1', '\u00B4', '\u00B6', '\u00B7', '\u00B8', '\u00BB', '\u00BF',
  '\u00D7', '\u00F7',
  '\u2010', '\u2011', '\u2012', '\u2013', '\u2014', '\u2015', '\u2016',
  '\u2017', '\u2018', '\u2019', '\u201A', '\u201B', '\u201C', '\u201D',
  '\u201E', '\u201F', '\u2020', '\u2021', '\u2022', '\u2023', '\u2024',
  '\u2025', '\u2026', '\u2027',
  '\u2030', '\u2031', '\u2032', '\u2033', '\u2034', '\u2035', '\u2036',
  '\u2037', '\u2038', '\u2039', '\u203A', '\u203B', '\u203C', '\u203D',
  '\u203E',
  '\u2041', '\u2042', '\u2043', '\u2044', '\u2045', '\u2046', '\u2047',
  '\u2048', '\u2049', '\u204A', '\u204B', '\u204C', '\u204D', '\u204E',
  '\u204F', '\u2050', '\u2051', '\u2052', '\u2053',
  '\u2055', '\u2056', '\u2057', '\u2058', '\u2059', '\u205A', '\u205B',
  '\u205C', '\u205D', '\u205E',
  ...Array.from({ length: 224 }, (_, i) => String.fromCharCode(0x2190 + i)),
  ...Array.from({ length: 625 }, (_, i) => String.fromCharCode(0x2500 + i)),
  ...Array.from({ length: 128 }, (_, i) => String.fromCharCode(0x2794 + i)),
  ...Array.from({ length: 224 }, (_, i) => String.fromCharCode(0x2E00 + i)),
  '\u3001', '\u3002', '\u3003'
];

const HS_uniDigit = [ // TODO : Vérifier
  ...'\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669',
  ...'\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9',
  ...'\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F',
  ...'\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF',
  ...'\u0A66\u0A67\u0A68\u0A69\u0A6A\u0A6B\u0A6C\u0A6D\u0A6E\u0A6F',
  ...'\u0AE6\u0AE7\u0AE8\u0AE9\u0AEA\u0AEB\u0AEC\u0AED\u0AEE\u0AEF',
  ...'\u0B66\u0B67\u0B68\u0B69\u0B6A\u0B6B\u0B6C\u0B6D\u0B6E\u0B6F',
  ...'\u0BE7\u0BE8\u0BE9\u0BEA\u0BEB\u0BEC\u0BED\u0BEE\u0BEF',
  ...'\u0C66\u0C67\u0C68\u0C69\u0C6A\u0C6B\u0C6C\u0C6D\u0C6E\u0C6F',
  ...'\u0CE6\u0CE7\u0CE8\u0CE9\u0CEA\u0CEB\u0CEC\u0CED\u0CEE\u0CEF',
  ...'\u0D66\u0D67\u0D68\u0D69\u0D6A\u0D6B\u0D6C\u0D6D\u0D6E\u0D6F',
  ...'\u0E50\u0E51\u0E52\u0E53\u0E54\u0E55\u0E56\u0E57\u0E58\u0E59',
  ...'\u0ED0\u0ED1\u0ED2\u0ED3\u0ED4\u0ED5\u0ED6\u0ED7\u0ED8\u0ED9',
  ...'\u0F20\u0F21\u0F22\u0F23\u0F24\u0F25\u0F26\u0F27\u0F28\u0F29'
];

const HS_charesc = ["a","b","f","n","r","t","v","\\","'","&"]

const HS_ascii = ["NUL","SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL","BS ", 
                  "HT ", "LF ", "VT", "FF ", " CR", "SO", "SI", "DLE", "DC1",
                  "DC2", "DC3", "DC4", "NAK", "SYN", "ETB","CAN","EM", "SUB",
                  "ESC", "FS", "GS", "RS", "US", "SP","DEL"]

const HS_ascLarge = ["@", "[", "\\", "]", "^", "_"]

/**
 * Rule : literal → integer | float | char | string 
 * @param {Program} program 
 * @returns {Boolean}
 */
export function getLiteral(program){
  return getInteger(program)
    || getFloat(program)
    || getChar(program)
    || getString(program);
}

/**
 * Rule : small → ascSmall | uniSmall | _
 * @param {Program} program 
 * @returns {Boolean}
 */
export function getSmall(program){
  if (program.getChar() === "_"){
    program.incIndex();
    return true ;
  }
  return getAscSmall(program)
    || getUniSmall(program);
}

/**
 * Rule : ascSmall → a | b | … | z
 * @param {Program} program 
 * @returns {Boolean}
 */
function getAscSmall(program){
  if (/^[a-z]$/.test(program.getChar())){
    return program.addToken("ascSmall");
  }
  return false;
}

/**
 * Rule : uniSmall → any Unicode lowercase letter 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getUniSmall(program){
  if(HS_uniSmall.includes(program.getChar())){
    return program.addToken("uniSmall");
  }
  return false;
}

/**
 * Rule : large → ascLarge | uniLarge 
 * @param {Program} program 
 * @returns {Boolean}
 */
export function getLarge(program){
  return getAscLarge(program) || getUniLarge(program);
}

/**
 * Rule : ascLarge → A | B | … | Z
 * @param {Program} program 
 * @returns {Boolean}
 */
function getAscLarge(program){
  if (/^[A-Z]$/.test(program.getChar())){
    return program.addToken("ascLarge");
  }
  return false;
}

/**
 * Rule : uniLarge → any uppercase or titlecase Unicode letter 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getUniLarge(program){
  if(HS_uniLarge.includes(program.getChar())){
    return program.addToken("unilarge");
  }
  return false;
}

/**
 * Rule : symbol → ascSymbol | uniSymbol⟨special | _ | " | '⟩
 * @param {Program} program 
 * @returns {Boolean}
 */
export function getSymbol(program){
  if (getAscSymbol(program)){
    program.overwriteTypeLastToken("Symbol");
    return true;
  } else if (getUniSymbol(program)){
    if (!HS_special.includes(program.getLastToken().value) 
        && !["_","\"","\'"].includes(program.getLastToken())){
      return true;
    }
    program.removeLastToken();
  }
  return false;
}

/**
 * Rule : ascSymbol → ! | # | $ | % | & | ⋆ | + | . | / | < | = | > | ? | @ | 	
 *                    \ | ^ | | | - | ~ | :
 * @param {Program} program 
 * @returns {Boolean}
 */
function getAscSymbol(program){
  if(HS_ascSymbol.includes(program.getChar())){
    return program.addToken("ascSymbol");
  }
  return false;
}

/**
 * Rule : uniSymbol → any Unicode symbol or punctuation 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getUniSymbol(program){
  if(HS_uniSymbol.includes(program.getChar())){
    return program.addToken("uniSymbol");
  }
  return false;
}

/**
 * Rule : digit → ascDigit | uniDigit 
 * @param {Program} program 
 * @returns {Boolean}
 */
export function getDigit(program){
  return getAscDigit(program) || getUniDigit(program);
}

/**
 * Rule : ascDigit → 0 | 1 | … | 9
 * @param {Program} program 
 * @returns {Boolean}
 */
function getAscDigit(program){
  if (/^[0-9]$/.test(program.getChar())){
    return program.addToken("ascDigit");
  }
  return false;
}

/**
 * Rule : uniDigit → any Unicode decimal digit 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getUniDigit(program){
  if(HS_uniDigit.includes(program.getChar())){
    return program.addToken("uniDigit");
  }
  return false;
}

/**
 * Rule : octit → 0 | 1 | … | 7
 * @param {Program} program 
 * @returns {Boolean}
 */
function getOctit(program){
  if (/^[0-7]$/.test(program.getChar())){
    return program.addToken("octit");
  }
  return false;
}

/**
 * Rule : hexit → digit | A | … | F | a | … | f
 * @param {Program} program 
 * @returns {Boolean}
 */
function getHexit(program){
  if (getDigit(program)){return true;}
  if (/^[A-F]$/.test(program.getChar()) || /^[a-f]$/.test(program.getChar())){
    return program.addToken("hexit");
  }
  return false;
}

/**
 * Rule : decimal → digit{digit} 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getDecimal(program){
  if(getDigit(program)){
    while(getDigit(program)){}
    program.overwriteTypeLastToken('decimal');
    return true;
  }
  return false;
}

/**
 * Rule : octal → octit{octit} 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getOctal(program){
  if(getOctit(program)){
    while(getOctit(program)){}
    program.overwriteTypeLastToken('octal');
    return true;
  }
  return false;
}

/**
 * Rule : hexadecimal → hexit{hexit} 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getHexadecimal(program){
  if(getHexit(program)){
    while(getHexit(program)){}
    program.overwriteTypeLastToken('hexadecimal');
    return true;
  }
  return false;
}

/**
 * Rule : integer → decimal | 0o octal | 0O octal | 
 *                  0x hexadecimal | 0X hexadecimal 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getInteger(program){
  if (getDecimal(program)){
    program.overwriteTypeLastToken('integer');
    return true;}
  if (program.getChar() === '0'){
    program.addToken('integer');
    if (program.getChar() === 'o' || program.getChar() === '0'){
      program.addToken('integer');
      if (getOctal(program)){
        return program.overwriteTypeLastToken('integer');
      }
    } else if (program.getChar() === 'x' || program.getChar() === 'X'){
      program.addToken('integer');
      if (getHexadecimal(program)){
        return program.overwriteTypeLastToken('integer');
      }
    } else { 
      program.removeLastTokensLastValue();
      return false ;
    }
    program.removeLastTokensLastValue();
    return true;
  }
  return false;
}

/**
 * Rule : float → decimal . decimal [exponent] | decimal exponent 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getFloat(program){
  if (getDecimal(program)){
    if (program.getChar() === "."){
      program.overwriteTypeLastToken("float");
      program.addToken('float');
      if (getDecimal(program)){
        getExponent(program);
        return program.overwriteTypeLastToken("float");
      } else {
        program.removeLastTokensLastValue();
      }
    } else if (getExponent(program)){
      return program.overwriteTypeLastToken("float")
    }
    program.removeLastToken();
  }
  return false;
}

/**
 * Rule : exponent → (e | E) [+ | -] decimal 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getExponent(program){
  if (program.getChar() === "e" || program.getChar() === "E"){
    program.addToken("exponent");
    if (program.getChar() === "+" || program.getChar() === "-"){
      program.addToken("exponent");
    }
    if (getDecimal(program)){
      return program.overwriteTypeLastToken("exponent");
    }
    program.removeLastToken();
  }
  return false;
}

/**
 * Rule : char → ' (graphic⟨' | \⟩ | space | escape⟨\&⟩) '
 * @param {Program} program 
 * @returns {Boolean}
 */
function getChar(program){
    program.startMerge();
  if (program.getChar() !== "\'"){
    program.endMerge("NULL");
    return false;
  }
  program.addToken("start char");
  while (true){
    if (getGraphic(program)){
      var lastToken = program.getLastToken().value; 
      if (lastToken.includes("\'") || lastToken.includes("\\")){
        if (getSpace(program) || 
            (getEscape(program) 
             && ! program.getLastToken().value.includes("\\&"))){}
      }
    } else if (getSpace(program)){
    } else if (getEscape(program) 
               && ! program.getLastToken().value.includes("\\&")){
    } else {break;}
  }
  // FIXME : verify that the rule is correctly implemented (escape⟨\&⟩)
  if (program.getChar() === "\'"){
    program.addToken("end char");
    program.endMerge("Char");
    return true;
  }
  program.endMerge("NULL");
  return false;
}

/**
 * Rule : string → " {graphic⟨" | \⟩ | space | escape | gap} "
 * @param {Program} program 
 * @returns {Boolean}
 */
function getString(program){
  program.startMerge();
  if (program.getChar() !== "\""){
    program.endMerge("NULL");
    return false;
  }
  program.addToken("start string");
  while (true){
    if (getGraphic(program)){
      var lastToken = program.getLastToken().value; 
      if (lastToken.includes("\"") || lastToken.includes("\\")){
        if (getSpace(program) || getEscape(program) || getGap(program)){}
      }
    } else if (getSpace(program) || getEscape(program) || getGap(program)){
    } else {break;}
  }
  if (program.getChar() === "\""){
    program.addToken("end string");
    program.endMerge("String");
    return true;
  }
  program.endMerge("NULL");
  return false;
}

/**
 * Rule : escape → \ ( charesc | ascii | decimal | o octal | x hexadecimal ) 
 * @param {Program} program 
 * @returns {Boolean}
 */
function getEscape(program){
  if (program.getChar() === "\\"){
    program.addToken("escape");
    if (getCharsec(program)
        || getAscii(program)
        || getDecimal(program)){
      return program.overwriteTypeLastToken("escape");
    } else if (program.getChar() === "o"){
      program.addToken("escape");
      if (getOctal(program)){
        return program.overwriteTypeLastToken("escape");
      } else {
        program.removeLastToken();
      }
    } else if (program.getChar() === "x"){
      program.addToken("escape");
      if (getHexadecimal(program)){
        return program.overwriteTypeLastToken("escape");
      } else {
        program.removeLastToken();
      };
    }
    program.removeLastToken();
  }
  return false;
}

/**
 * Rule : charesc → a | b | f | n | r | t | v | \ | " | ' | &
 * @param {Program} program 
 * @returns {Boolean}
 */
function getCharsec(program){
  if (HS_charesc.includes(program.getChar())){
    program.addToken("charesc");
  }
  return false;
}

/**
 * Rule : string ascii → ^cntrl | NUL | SOH | STX | ETX | EOT | ENQ | ACK | 
 *                       BEL | BS | HT | LF | VT | FF | CR | SO | SI | DLE | 
 *                       DC1 | DC2 | DC3 | DC4 | NAK | SYN | ETB | CAN | EM | 
 *                       SUB | ESC | FS | GS | RS | US | SP | DEL
 * @param {Program} program 
 * @returns {Boolean}
 */
function getAscii(program){
  if (HS_ascii.includes(program.getChar())){
    program.addToken("ascii");
  }
  return false;
}

/**
 * Rule : cntrl → ascLarge | @ | [ | \ | ] | ^ | _
 * @param {Program} program 
 * @returns {Boolean}
 */
function getCntrl(program){
  if (getAscLarge(program)){return true;} // overwrite token type ?
  if (HS_ascLarge.includes(program.getChar())){
    program.addToken("cntrl");
  }
  return false;
}

/**
 * Rule : gap → \ whitechar {whitechar} \
 * @param {Program} program 
 * @returns {Boolean}
 */
function getGap(program){
  if(program.getChar() === "\\"){
    program.incIndex();
    if (getWhitespace(program)){
      while(getWhitespace(program)){}
      if (program.getChar() === "\\"){
        return program.addToken("gap");
      }
    }
  }
  return false;
}