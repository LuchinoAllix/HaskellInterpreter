//--  File containing "type" token for lexer and parser  --//

export class Token {

  /**
   * Constuctor for Token
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
   * "Override"
   * @param {String} type 
   * @param {String} value 
   * @returns 
   */
  static new(type, value){
    return new Token("indentation " + type, value,  -1, -1);
  }
}