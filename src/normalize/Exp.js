
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
    if(value === "[]"){
      value = [];
    }
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
   * Creates an application function expression for function 
   * @param {Term} func function to call, var or actual body (exp)
   * @param {Exp} arg Arguments given to the function 
   */
  constructor(func, arg){
    super();
    this.type = "functionApp";
    this.func = func;
    this.arg = arg;
  }

  /**
   * Duplicates a functionapp object, as to not have reference issues
   * @returns {FunctionApp}
   */
  clone(){
    return new FunctionApp(this.func, this.arg);
  }
}

/**
 * Function to make a FuncApp object but receiving a list of args, transforms it
 * in recursive calls of functionApp to ensure that each one only take one 
 * argument as a parameter
 * @param {Term} func 
 * @param {[Exp]} args 
 * @returns 
 */
export function makeFuncAppOfList(func, args){
  if (args.length === 0){
    throw new Error("Error in making a funcApp, at least one arg should be "
      + "given");
  } else if (args.length === 1){
    return new FunctionApp(func, args[0]);
  } else {
    let lastElem = args.pop();
    return new FunctionApp(makeFuncAppOfList(func, args), lastElem);
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
 * Lambda expresions object
 */
export class LambdaExp extends Exp {
  
  /**
   * Creates a lambda function object
   * @param {[Exp]} namedArgs 
   * @param {Exp} body
   */
  constructor(namedArgs, body){
    if (namedArgs.length === 0){
      throw new Error("Lambda Exp requires at least one argument");
    }
    super();
    this.type = "LambdaExp";
    this.namedArg = namedArgs[0];
    if (namedArgs.length === 1){
      this.body = body;
    } else {
      this.body = new LambdaExp(namedArgs.slice(1), body);  
    }
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