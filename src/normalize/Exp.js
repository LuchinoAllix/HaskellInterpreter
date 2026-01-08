
import { Branch } from "./Branch.js";
import { Decl } from "./Decl.js";
import { Term } from "./Term.js";
import { isMTArray } from "../eval/eval.js";

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
   * Creates an application function expression for function that are either :
   *    - named
   *    - anonymous
   *    - currified calls
   * @param {Exp} body function to call, (var or actual body)
   * @param {[Exp]} args Arguments given to the function 
   */
  constructor(body, args){
    super();
    this.type = "functionApp";
    this.body = body;
    this.args = args;
  }

  clone(){
    return new FunctionApp(this.body, this.args);
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
   * Pattern matching of a list as in : (a : b) a is head b is rest
   * @param {Exp} head 
   * @param {Exp} rest 
   */
  constructor(head, rest){
    if (rest.type !== "ListExp" && rest.type !== "var"){
      if (rest.type === "value" && ! isMTArray(rest.value)){
        throw new Error("In pattern of list, rest must be a list not : " + 
          JSON.stringify(rest, null, 2));
      }
    }
    if (rest.value === "[]"){
      rest.value = [];
    }
    super();
    this.type = "ListPatternExp";
    this.head = head;
    this.rest = rest;
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
  constructor(namedArgs, body){
    super();
    this.type = "LambdaExp";
    this.namedArgs = namedArgs;
    this.nbArgs = namedArgs.length; // to be uniform with prim and decl (functions)
    this.body = body;
    this.args = []; // given args, will be added in eval
  }

  clone(){
    return new LambdaExp(this.namedArgs, this.body);
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