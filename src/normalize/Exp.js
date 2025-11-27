import { Decl } from "./Decl.js";
import { Term } from "./Term.js";

/**
 * todo
 */
export class Exp extends Term {

  constructor(){
    super("EXP");
  }

}

/**
 * todo
 */
export class VarExp extends Exp{
  
  /**
   * todo
   * @param {String} name 
   */
  constructor(name){
    super();
    this.type = "var";
    this.name = name;
  }
}

export class ValExp extends Exp {
  
  constructor(value, valueType){
    super();
    this.type = "value";
    this.value = value;
    this.valueType = valueType;
  }

}


/**
 * Function application
 */
export class FunctionApp extends Exp {
    
  /**
   * todo
   * @param {String} name 
   * @param {[Exp]} args 
   */
  constructor(name, args, anonymous = false){
    super();
    this.type = "functionApp";
    this.name = name;
    this.args = args;
    this.anonymous = anonymous;
  }
}

export class IfTerm extends Exp {
  
  /**
   * todo
   * @param {Term} condition 
   * @param {Exp} sucess 
   * @param {Exp} fail 
   */
  constructor(condition, sucess, fail){
    super();
    this.type = "if";
    this.condition = condition;
    this.sucess = sucess;
    this.fail = fail;
  }
}

export class LetTerm extends Exp {

  /**
   * // What to do about the in part ?
   * @param {[Decl]} decls 
   */
  constructor(decls){
    super();
    this.type = "let";
    this.decls = decls
  }

}

export class CaseTerm extends Exp {

  /**
   * TODO
   */
  constructor(){

  }

}