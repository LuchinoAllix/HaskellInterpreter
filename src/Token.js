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
    this.line = line;
    this.column = column;
  }

  /**
   * "Override" of constructor for indentation type
   * Note : maybe new is not a smart name since it's a reserved word
   * @param {String} type 
   * @param {String} value 
   * @returns 
   */
  static new(type, value){
    return new Token("indentation " + type, value,  -1, -1);
  }
}

/**
 * Creates a node based on a token
 * @param {Token} token 
 * @returns {Node}
 */
export function tokenToNode(token){
  return new Node(token.type,token.value,token.line,token.column,null);    
}