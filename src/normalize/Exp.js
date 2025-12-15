
import { Branch } from "./Branch.js";
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
 * Named function application expression
 */
export class FunctionApp extends Exp {
    
  /**
   * Creates an application function expression for function that are named
   * @param {String} name Name of the function to call
   * @param {[Exp]} args Arguments given to the function 
   */
  constructor(name, args){
    super();
    this.type = "functionApp";
    this.name = name;
    this.args = args;
  }
}

/**
 * Anonymous function application expression
 */
export class AFunctionApp extends FunctionApp {

  /**
   * Creates an application function expression for function that are not named
   * @param {[Exp]} args // args to give to the lambda function 
   * @param {LambdaExp} func // lambda function 
   */
  constructor(args, func){
    super("", args);
    this.type = "aFunctionApp";
    this.func = func;
  }
}

/**
 * Curryied function expressions
 */
export class CurFunctionApp extends FunctionApp {

  /**
   * Creates an application function expression for function that are not named
   * and yield from curring (japanese curry not to mistake with haskell curry)
   * @param {[Exp]} args 
   * @param {FunctionApp} func 
   */
  constructor(args, func){
    super("", args);
    this.type = "curFunctionApp";
    this.func = func;
  }
}

/**
 * If term expression
 */
export class IfExp extends Exp {
  
  /**
   * Creates an if expression
   * @param {Exp} condition 
   * @param {Exp} success 
   * @param {Exp} fail 
   */
  constructor(condition, success, fail){
    super();
    this.type = "if";
    this.condition = condition;
    this.success = success;
    this.fail = fail;
  }
}

/**
 * Creates a let Term expression
 */
export class LetExp extends Exp {

  /**
   * Creates a let expression object
   * @param {[Decl]} decls 
   */
  constructor(decls, body){
    super();
    this.type = "let";
    this.decls = decls
    this.body = body;
  }

}

/**
 * Creates a case of Term expression
 */
export class CaseExp extends Exp {

  /**
   * Creates a case expression object
   * @param {Exp} exp
   * @param {[Branch]} branches  
   */
  constructor(exp, branches){
    super();
    this.type = "case";
    this.exp = exp;
    this.branches = branches;
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

/**
 * Lambda expresions object
 */
export class LambdaExp extends Exp {
  
  /**
   * Creates a lambda function object
   * @param {[Exp]} args 
   * @param {Exp} body 
   */
  constructor(args, body){
    super();
    this.type = "LambdaExp";
    this.args = args;
    this.body = body;
  }
}

/**
 * Special expression object for '_' 
 */
export class SpecialExp extends Exp {

  /**
   * Creates a special exp object for reserved id
   * @param {String} special 
   */
  constructor(special){
    super();
    this.type = "SpecialExp";
    this.special = special;
  }
}

/**
 * Tuple object class 
 */
export class TupleExp extends Exp {

  /**
   * Creates a tuple object 
   * @param {[Exp]} elems 
   */
  constructor(elems){
    super();
    this.type = "TupleExp";
    this.elems = elems;
  }
}

/**
 * List object class 
 */
export class ListExp extends Exp {

  /**
   * Creates a List object 
   * @param {[Exp]} elems 
   */
  constructor(elems){
    super();
    this.type = "ListExp";
    this.elems = elems;
  }
}