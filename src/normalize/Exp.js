import { Decl } from "./Decl.js";
import { Term } from "./Term.js";

/**
 * parent class for expressions
 */
export class Exp extends Term {

  /**
   * Constructor for expressions
   * (sets the metatype attribute)
   */
  constructor(){
    super("EXP");
  }

}

/**
 * Variable expressions object
 */
export class VarExp extends Exp{
  
  /**
   * Constuctor for variables expressions
   * @param {String} name 
   */
  constructor(name){
    super();
    this.type = "var";
    this.name = name;
  }
}

/**
 * Values expressions object
 */
export class ValExp extends Exp {
  
    /**
   * Constuctor for variables expressions
   * @param {valueType} value  // valueType is not defined as a type, but the 
   *                           // value inside valueType is the type of the 
   *                           // value 
   * @param {String} valueType
   */
  constructor(value, valueType){
    super();
    this.type = "value";
    this.value = value;
    this.valueType = valueType;
  }

}


/**
 * Function application expression
 */
export class FunctionApp extends Exp {
    
  /**
   * creates an application function expression
   * perhaps the anonymous attribute can be omitted and the anonimity of the 
   * function can be deduced by the nullness fo the name attribute...
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

/**
 * If term expression
 */
export class IfExp extends Exp {
  
  /**
   * Creates an if expression
   * @param {Exp} condition 
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

/**
 * Creates a let Term expression
 */
export class LetExp extends Exp {

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

/**
 * Creates a case of Term expression
 */
export class CaseExp extends Exp {

  /**
   * TODO
   */
  constructor(){

  }

}

/**
 * Creates a do Term expression
 */
export class DoExp extends Exp {

  /**
   * Creates a do term, which is comprised of the list of expressions to execute
   * @param {[Exp]} exps
   */
  constructor(exps){
    super();
    this.type = "do";
    this.exps = exps;
  }

}

/**
 * List pattern object, used for pattern matching
 */
export class ListPatternTerm extends Exp {

  /**
   * Creates a list pattern expressions, as in (a:b) will be an exp of the form
   * ['(','a',':','b',')']
   * @param {[Exp]} patterns 
   */
  constructor(patterns){
    super();
    this.type = "list pattern";
    this.patterns = patterns
  }
}