import { Decl } from "./Decl";

/**
 * todo
 */
export class Exp {

  isExp(){
    return this.type.endsWith("Exp");
  }

  isDecl(){
    return this.type.endsWith("Decl");
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
    this.type = "varExp";
    this.name = name;
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
    this.type = "functionAppExp";
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
    this.type = "ifExp";
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
    this.type = "letExp";
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