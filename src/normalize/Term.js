//--                 File containing "type" Decl for normalize              --//

/**
 * A term is the parent class of Exp and Decl
 */
export class Term {
  
  /**
   * Constructor for term
   * @param {String} metatype 
   */
  constructor(metatype){
    this.metatype = metatype;
  }

  /**
   * Determines if a term is an expression
   * @returns {Boolean}
   */
  isExp(){
    return this.metatype === "EXP";
  }

  /**
   * Determines if a term is a declaration
   * @returns {Boolean}
   */
  isDecl(){
    return this.metatype === "DECL";
  }
}