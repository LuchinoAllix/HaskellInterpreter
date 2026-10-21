
import { Branch } from "./Branch.js";
import { Decl, makeNewName } from "./Decl.js";
import { Term } from "./Term.js";
import { Position } from "./Position.js";
import { getWide } from "../objects/Node.js";

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
   * @param {Position} pos position (line / column) of the token
   */
  constructor(name, pos = null){
    super();
    this.type = "var";
    this.name = name;
    this.pos = pos;
  }

  /**
   * Return the type as a string for log
   * @returns {String}
   */
  toStr(){
    return this.name ;
  }
}

export class StrExp extends Exp{
  
  /**
   * Constuctor for string expressions (so they can be skipped at TC)
   * @param {FunctionApp} Value 
   * @param {Position} pos position (line / column) of the token
   */
  constructor(value, pos = null){
    super();
    this.type = "str";
    this.value = value;
    this.pos = pos;
  }

  /**
   * Return the type as a string for log
   * @returns {String}
   */
  toStr(){
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
   * @param {Position} pos postition (line / column) of the token
   */
  constructor(value, valueType, pos = null){
    super();
    if(value === "[]"){
      value = [];
    }
    this.type = "immediate";
    this.value = value;
    this.valueType = valueType;
    this.pos = pos;
  }

  /**
   * Return the type as a string for log
   * @returns {String}
   */
  toStr(){
    if (this.valueType === 'EmptyList'){
      return "[]";
    }
    return this.value + "" ;
  }

}

export function mkMTListExp(pos){
  return new ImExp([], "EmptyList", pos);
}


/**
 * Function application expression
 */
export class FunctionApp extends Exp {
    
  /**
   * Creates an application function expression for function 
   * @param {Term} func function to call, var or actual body (exp)
   * @param {Exp} arg argument given to the function 
   * @param {Position} pos postition (line / column) of the token
   */
  constructor(func, arg, pos = null){
    super();
    this.type = "functionApp";
    this.func = func;
    this.arg = arg;
    if (pos === null && func.pos !== null && arg.pos !== null){
      this.pos = getWidePos(func, arg);
    } else {
      this.pos = pos;
    }
  }

  /**
   * Return the type as a string for log 
   */
  toStr(){
    return this.func.toStr() + "." + this.arg.toStr() //this.getInnerFunc();
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
    return new FunctionApp(func, args[0], getWidePos(func, args[0]));
  } else {
    let lastElem = args.pop();
    const funcApp = makeFuncAppOfList(func, args); 
    return new FunctionApp(
      funcApp, 
      lastElem, 
      getWidePos(funcApp, lastElem));
  }
}

/**
 * Determines the position that takes both terms
 * @param {Term} term1 
 * @param {Term} term2 
 * @returns 
 */
export function getWidePos(term1, term2){
  return new Position(
    min(term1.pos.startLine, term2.pos.startLine), 
    min(term1.pos.startCol, term2.pos.startCol), 
    max(term1.pos.endLine, term2.pos.endLine), 
    max(term1.pos.endCol, term2.pos.endCol));
}

function min(a,b){
  if (a < b ){ return a ; } 
  return b ;
}

function max(a,b){
  if (a < b ){ return b ; } 
  return a ;
}

/**
 * Creates a let Term expression
 */
export class LetExp extends Exp {

  /**
   * Creates a let expression object
   * @param {[Decl]} decls 
   */
  constructor(decls, body, pos = null){
    super();
    this.type = "let";
    this.decls = decls
    this.body = body;
    this.pos = pos;
  }

  /**
   * Return the type as a string for log
   * @returns {String}
   */
  toStr(){
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
   * @param {Position} pos
   */
  constructor(patterns, branches, pos = null){
    super();
    this.type = "case";
    this.patterns = patterns;
    this.branches = branches;
    this.pos = pos;
  }

  /**
   * Return the type as a string for log 
   * @returns {String}
   */
  toStr(){
    return this.type + " (patterns = " + patternsToStr(this.patterns) + ")";
  }
}

function patternsToStr(patterns){
  if (patterns.length === 0){ return ""; }
  else if (patterns.length === 1){ return patterns[0].toStr() ;}
  return patterns[0].toStr() + " | " + patternsToStr(patterns.slice(1));
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
  constructor(namedArgs, body, pos = null){
    if (namedArgs.length === 0){
      throw new Error("Lambda Exp requires at least one argument");
    }
    super();
    this.type = "LambdaExp";

    let widePos = getWidePos(namedArgs[0], body);
    if (pos === null || pos.startLine === null){
      this.pos = widePos;
    }

    if (namedArgs[0].type === "functionApp"){ 
      let argName = makeNewName();
      this.namedArg = argName;
      if (namedArgs.length === 1){
        this.body = new CaseExp([argName], 
                                [new Branch([namedArgs[0]], body)],
                                widePos);
      } else {
        this.body = new CaseExp([argName], [new Branch([namedArgs[0]], 
          new LambdaExp(namedArgs.slice(1), 
                        body,
                        widePos
          ))], widePos);
      }
    } else {
      this.namedArg = namedArgs[0];
      if (namedArgs.length === 1){
        this.body = body;
      } else {
        this.body = new LambdaExp(namedArgs.slice(1), body, widePos);  
      }
    }
  }

  /**
   * Return the type as a string for log
   * @returns {String}
   */
  toStr(){
    return '\\' + this.namedArg.toStr() + ' -> (' + this.body.toStr() + ')';

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
  constructor(special, pos = null){
    super();
    this.type = "SpecialExp";
    this.special = special;
    this.pos = pos;
  }

  /**
   * Return the type as a string for
   */
  toStr(){
    return this.special ;
  }
}