import { Decl } from "./Decl";

/**
 * todo
 */
export class Exp {

  /**
   * todo
   * @param {[Term]} termes 
   */
  constructor(termes){
    this.temres = termes;  
  }

}

/**
 * Abstract class 
 * todo
 */
class Term {

  /**
   * todo
   * @param {*} type 
   */
  constructor(type){
    this.type = type;
  }
}

/**
 * todo
 */
export class VarExp extends Term {
  
  /**
   * todo
   * @param {String} name 
   */
  constructor(name){
    super("var")
    this.name = name;
  }
}


/**
 * Function application
 */
export class FunctionApp extends Term {
    
  /**
   * todo
   * @param {String} name 
   * @param {[Exp]} args 
   */
  constructor(name, args, annonymous = false){
    super("functionApp")
    this.name = name;
    this.args = args;
    this.annonymous = annonymous;
  }
}

export class IfTerm extends Term {
  
  /**
   * todo
   * @param {Term} condition 
   * @param {Exp} sucess 
   * @param {Exp} fail 
   */
  constructor(condition, sucess, fail){
    super("if")
    this.condition = condition;
    this.sucess = sucess;
    this.fail = fail;
  }
}

export class LetTerm extends Term {

  /**
   * // What to do about the in part ?
   * @param {[Decl]} decls 
   */
  constructor(decls){
    super("let")
    this.decls = decls
  }

}

export class CaseTerm extends Term {

  /**
   * TODO
   */
  constructor(){

  }

}