//--                 File containing "type" Term for normalize              --//

/**
 * A term is the parent class of Exp, Decl and Constr
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

  /**
   * Determines if a term is a constructor
   * @returns {Boolean}
   */
  isConstr(){
    return this.metatype === "CONSTR";
  }
}