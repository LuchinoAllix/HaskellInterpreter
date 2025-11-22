export class Exp {

  /**
   * 
   * @param {[Term]} termes 
   */
  constructor(termes){
    this.temres = termes;  
  }

}

/**
 * Abstract class 
 */
class Term {}

/**
 * 
 */
export class VarExp extends Term {
  
  /**
   * 
   * @param {String} name 
   */
  constructor(name){
    this.name = name;
  }
}


/**
 * Function application
 */
export class FunctionApp extends Term {
    
  /**
   * 
   * @param {String} name 
   * @param {[Exp]} args 
   */
  constructor(name, args, annonymous = false){
    this.name = name;
    this.args = args;
    this.annonymous = annonymous;
  }
}

export class IfTerm extends Term {
  
  /**
   * 
   * @param {Term} condition 
   * @param {Exp} sucess 
   * @param {Exp} fail 
   */
  constructor(condition, sucess, fail){
    this.condition = condition;
    this.sucess = sucess;
    this.fail = fail;
  }
}

export class LetTerm extends Term {

  
  constructor(decls, ){

  }


}