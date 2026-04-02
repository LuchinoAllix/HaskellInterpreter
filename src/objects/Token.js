import { Node } from "./Node.js";

//--  File containing "type" token for lexer and parser  --//

export class Token {

  /**
   * Constuctor for Token (a list of tokens is the result of lexing)
   * @param {String} type 
   * @param {String} value 
   * @param {Int} line 
   * @param {Int} column 
   */
  constructor(type, value, line, column){
    this.type = type;
    this.value = value;
    this.startLine = line;
    this.startCol = column;
    this.endLine;              // not given because calculated afterwards
    this.endCol;               // ...
  }
}


/**
 * "Override" of constructor for layout type
 * @param {String} type 
 * @param {String} value 
 * @returns {Token}
 */
export function newLayoutToken(value, type){
  if (arguments.length === 1){
    return new Token("layout", value,  -1, -1);
  }
  return new Token("layout " + type, value,  -1, -1);
}

/**
 * Creates a node based on a token
 * @param {Token} token 
 * @returns {Node}
 */
export function tokenToNode(token){
  return new Node(token.type,
                  token.value,
                  token.startLine,
                  token.startCol,
                  null);    
}