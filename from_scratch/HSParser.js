// Parser pour Haskell en Javascript

// Constantes de la grammaire
const HS_special = ["(",")",",",";","[","]","`","{","}"];
const HS_return = "\r";
const HS_linefeed = "\n";
const HS_vertab = "\v";
const HS_formfeed = "\f";
const HS_space = " ";
const HS_tab = "\t";

const HS_uniWhite = [ // # TODO : Vérifier
    '\u0085', '\u00A0', '\u1680', '\u180E', '\u2000', '\u2001', '\u2002',
    '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', 
    '\u200A', '\u2028', '\u2029', '\u202F', '\u205F', '\u3000'
];

const HS_uniSmall = [ // # TODO : Vérifier
  '\u00E0', '\u00E1', '\u00E2', '\u00E3', '\u00E4', '\u00E5', '\u00E6', 
  '\u00E7', '\u00E8', '\u00E9', '\u00EA', '\u00EB', '\u00EC', '\u00ED', 
  '\u00EE', '\u00EF', '\u00F0', '\u00F1', '\u00F2', '\u00F3', '\u00F4', 
  '\u00F5', '\u00F6', '\u00F8', '\u00F9', '\u00FA', '\u00FB', '\u00FC', 
  '\u00FD', '\u00FE', '\u00FF'
];

const HS_uniLarge = [ // # TODO : Vérifier
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

const HS_uniSymbol = [ // # TODO : Vérifier
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

const HS_uniDigit = [
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


var input = ""
var index = 0
var tokens = []
var AST = []

/**
 * Permet de transformer l'input en liste de tokens
 * @returns True if Success
 */
function tokenize(){
    getProgram();
    return true;
}

/**
 * Permet de transformer la liste de tokens en AST
 * @returns True if Success
 */
function parse(){
    if(!this.isLexed){
        this.tokenize();
    }
    // #TODO
    return true;
}

/**
 * Fait un programme basé sur l'input
 * @returns true s'il a réussi à faire un programme basé sur l'input
 */
function getProgram(){
    while(getLexeme() || getWhitespace()){} 
    if (index == input.length){
        return true;
    } else if (index < input.length){
        throw Error("Not all input was parsed");
    }
    throw Error("Index > input.length");
}

function getLexeme(){
    return getQvarid()
        || getQconid()
        || getQvarsym()
        || getQconsym()
        || getLiteral()
        || getSpecial()
        || getReservedop()
        || getReservedid();
}

function getLiteral(){
    return getInteger()
        || getFloat()
        || getChar()
        || getString();
}

function getSpecial(){
    if (HS_special.includes(input[index])){
        // TODO : make tokens
        tokens.push(input[index]);
        index ++;
        return true;
    }
    return false;
}

function getQvarid(){
    // #TODO
    return false;
}

function getQconid(){
    // #TODO
    return false;
}

function getQvarsym(){
    // #TODO
    return false;
}

function getQconsym(){
    // #TODO
    return false;
}

function getReservedop(){
    // #TODO
    return false;
}

function getReservedid(){
    // #TODO
    return false;
}

function getInteger(){
    // #TODO
    return false;
}

function getFloat(){
    // #TODO
    return false;
}

function getChar(){
    // #TODO
    return false;
}

function getString(){
    // #TODO
    return false;
}

function getWhitespace(){
    if(getWhitestuff()){
        while(getWhitestuff()){}
        return true;
    }
    return false;
}

function getWhitestuff(){
    return getWhitechar()
        || getComment()
        || getNcomment();
}

function getWhitechar(){
    return getNewline()
        || getVertab()
        || getSpace()
        || getTab()
        || getUniWhite();
}

function getNewline(){
    // on passe par des variables temporaires car la règle est :
    // newline = return linefeed / return / linefeed / formfeed
    let r = getReturn();
    let l = getLinefeed();
    return r || l || getFormfeed();
}

function getReturn(){
    if(input[index]===HS_return){
        index ++;
        return true;
    }
    return false;
}

function getLinefeed(){
    if(input[index]===HS_linefeed){
        index ++;
        return true;
    }
    return false;
}

function getFormfeed(){
    if(input[index]===HS_formfeed){
        index ++;
        return true;
    }
    return false;
}

function getVertab(){
    if(input[index]===HS_vertab){
        index ++;
        return true;
    }
    return false;
}

function getSpace(){
    if(input[index]===HS_space){
        index ++;
        return true;
    }
    return false;
}

function getTab(){
   if(input[index]===HS_tab){
        index ++;
        return true;
    }
    return false;
}

function getUniWhite(){
    if(HS_uniWhite.includes(input[index])){
        index ++;
        return true;
    }
    return false;
}

function getComment(){
    if(getDashes()){
        while(!getNewline()){
            // règle : comment = dashes (any !symbol any*)? newline
            // #TODO ce n'est pas ce qui est implémenté ici
            index ++;
        }
        return true;
    }
    return false
}

function getDashes(){
    if(index + 1 < input.length){
        if(input[index]==="-" && input[index+1]==="-"){
            index += 2;
            while(index<input.length && input[index]==="-"){
                index ++;
            }
            return true;
        }
    }
    return false;
}

function getOpencom(){
    if(index + 1 < input.length){
        if(input[index]==="{" && input[index+1]==="-"){
            index += 2;
            return true;
        }
    }
}

function getClosecom(){
    if(index + 1 < input.length){
        if(input[index]==="-" && input[index+1]==="}"){
            index += 2;
            return true;
        }
    }
}

function getNcomment(){
    // #TODO
    return false ;
}

function getAnySeq(){
    // #TODO
    return false ;
}

function getANY(){
    return getGraphic()
        || getWhitechar();
}

function getAny(){
    return getGraphic()
        || getSpace()
        || getTab();
}

function getGraphic(){
    return getSmall()
        || getLarge()
        || getSymbol()
        || getDigit()
        || getSpecial()
        || input[index] === "\""
        || input[index] === "\'" ;
}

function main(){
    input = "]]]]";
    try {
        if(tokenize()){
            console.log("Successful tokenization :) ");
            console.log("Tokens : " + tokens);
        } else {
            throw Error("tokenize() returned false");
        }
    } catch (error) {
        console.log("Unsuccessful tokenization :( ");
        console.log("Input : " + input);
        console.log("Tokens : " + tokens);
        console.error(error);
    }
}

main()