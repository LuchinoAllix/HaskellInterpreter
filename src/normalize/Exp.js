
import { Branch } from "./Branch.js";
import { Decl, makeNewName } from "./Decl.js";
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
   * @param {[Int]} info information relative to the postition of the origin 
   *                     (line / column) of the token
   */
  constructor(name, info = null){
    super();
    this.type = "var";
    this.name = name;
    this.info = info;
  }

    /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.name ;
  }
}

/**
 * Immediates expressions object (values like numbers, chars ...)
 */
export class ImExp extends Exp {
  
  /**
   * Constuctor for variables expressions
   * @param {valueType} value  // valueType is not defined as a type, but the 
   *                           // value inside valueType is the type of the 
   *                           // value 
   * @param {String} valueType
   * @param {[Int]} info information relative to the postition of the origin 
   *                     (line / column) of the token
   */
  constructor(value, valueType, info = null){
    super();
    if(value === "[]"){
      value = [];
    }
    this.type = "immediate";
    this.value = value;
    this.valueType = valueType;
    this.info = info;
  }

    /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " (" + this.value + ")";
  }

}

export function mkMTListExp(info){
  return new ImExp([], "EmptyList", info);
}


/**
 * Function application expression
 */
export class FunctionApp extends Exp {
    
  /**
   * Creates an application function expression for function 
   * @param {Term} func function to call, var or actual body (exp)
   * @param {Exp} arg argument given to the function 
   * @param {[Int]} info information relative to the postition of the origin 
   *                     (line / column) of the token
   */
  constructor(func, arg, info = null){
    super();
    this.type = "functionApp";
    this.func = func;
    this.arg = arg;
    this.info = info;
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " " + this.getInnerFunc();
  }

  getInnerFunc(){
    if (this.func.type === 'functionApp'){
      return this.func.getInnerFunc();
    } return this.func.toStr();
  }
}

/**
 * Function to make a FuncApp object but receiving a list of args, transforms it
 * in recursive calls of functionApp to ensure that each one only take one 
 * argument as a parameter
 * @param {Term} func 
 * @param {[Exp]} args 
 * @returns {FunctionApp}
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
 * Creates a let Term expression
 */
export class LetExp extends Exp {

  /**
   * Creates a let expression object
   * @param {[Decl]} decls 
   */
  constructor(decls, body, info = null){
    super();
    this.type = "let";
    this.decls = decls
    this.body = body;
    this.info = info;
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type ;
  }

}

/**
 * Creates a case of Term expression
 */
export class CaseExp extends Exp {

  /**
   * Creates a case expression object
   * exps normally is one element, excepts for function PM
   * @param {[Term]} patterns exps or constrPattern 
   * @param {[Branch]} branches  
   * @param {[Integer]} info
   */
  constructor(patterns, branches, info = null){
    super();
    this.type = "case";
    this.patterns = patterns;
    this.branches = branches;
    this.info = info;
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " (exps" + this.exps + ")";
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
  constructor(namedArgs, body, info = null){
    if (namedArgs.length === 0){
      throw new Error("Lambda Exp requires at least one argument");
    }
    super();
    this.type = "LambdaExp";
    this.info = info;
    if (namedArgs[0].type === "functionApp"){ 
      let argName = makeNewName();
      this.namedArg = argName;
      if (namedArgs.length === 1){
        this.body = new CaseExp([argName], [new Branch([namedArgs[0]] ,body)]);
      } else {
        this.body = new CaseExp([argName], [new Branch([namedArgs[0]], 
          new LambdaExp(namedArgs.slice(1), body))]);
      }
    } else {
      this.namedArg = namedArgs[0];
      if (namedArgs.length === 1){
        this.body = body;
      } else {
        this.body = new LambdaExp(namedArgs.slice(1), body);  
      }
    }
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    if (short){
      return this.type + ' (namedArgs ' + this.namedArg.toStr() + ',body ' 
      + this.body.toStr() + ')';
    }
    return this.type ;
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
  constructor(special, info = null){
    super();
    this.type = "SpecialExp";
    this.special = special;
    this.info = info;
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " (" + this.special + ")";
  }
}