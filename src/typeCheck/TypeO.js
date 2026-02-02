
//--              File containing "type" TypeO for type checking            --//

let countVar = 0;
let countMetavar = 0;

/**
 * Represents the type of a term (Algebric Data Type)
 */
export class TypeO {
  
  /**
   * Constructor for the abstract class
   */
  constructor(){
    this.metatype = "TYPEO";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isForAll(){
    return this.type === "Forall";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isArrow(){
    return this.type === "Arrow";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isBuiltin(){
    return this.type === "Builtin";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isApp(){
    return this.type === "App";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isVar(){
    return this.type === "TVar";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isMetavar(){
    return this.type === "TMetavar";
  }
}

/**
 * Type of functions 
 */
export class TArrow extends TypeO {

  /**
   * @param {TypeO} from 
   * @param {TypeO} to 
   */  
  constructor(from, to){
    super();
    this.type = "Arrow";
    this.from = from;
    this.to = to;
  }
}

/**
 * Type of builtin types (String, Int, Bool)
 */
export class TBuiltin extends TypeO {

  /**
   * @param {String} blt
   */
  constructor(blt){
    super();
    this.type = "Builtin";
    this.blt = blt;
  }
}

/**
 * Functions to generate builtin types
 */
export function TInt() { return new TBuiltin("Int"); }
export function TBool() { return new TBuiltin("Bool"); }
export function TChar() { return new TBuiltin("Char"); }
export function TUnit() { return new TBuiltin("Unit"); }
export function TList() { return new TBuiltin("List"); }
export function TTuple() { return new TBuiltin("Tuple"); }

/**
 * Type of application of type
 */
export class TApp extends TypeO {

  /**
   * @param {TypeO} func
   * @param {TypeO} arg
   */
  constructor(func, arg){
    super();
    this.type = "App";
    this.func = func;
    this.arg = arg;
  }
}

/**
 * Type for polymorphism
 */
export class TForall extends TypeO {

  /**
   * @param {String} name
   * @param {TypeO} body
   */
  constructor(name, body){
    super();
    this.type = "Forall";
    this.name = name;
    this.body = body;
  }
}

/**
 * Substitues the metavariable of a forall
 * @param {TypeO} body 
 * @param {String} name 
 * @param {TMetavar} fresh new metavar
 * @returns {TypeO}
 */
export function substitute(body, name, fresh){
  switch (body.type){
    case "Forall" :
      if (body.name === name){
        return new TForall(fresh.name, substitute(body, name, fresh)); 
      } else {
        return new TForall(body.name, substitute(body, name, fresh));
      }
    case "Arrow" :
      return new TArrow(
        substitute(body.from, name, fresh), 
        substitute(body.to, name, fresh));
    case "Builtin" :
      return body;
    case "App" :
      return new TApp(
        substitute(body.func, name, fresh), 
        substitute(body.arg, name, fresh));
    case "TVar" :
      return body;
    case "TMetavar" :
      if (body.name === name){
        return fresh;
      }
      //??
    default :
      throw new Error("Unhandeled case of type :" + body.type);
  }
}

/**
 * Type for type variable
 */
export class TVar extends TypeO {

  /**
   * @param {String} str
   * @param {Integer} num
   */
  constructor(str, num){
    super();
    this.type = "TVar";
    this.name = str + num;
  }
}

/**
 * Make a Tvar with a fresh name
 * @returns {TVar}
 */
export function freshVar(){
  countVar ++;
  return new TVar("t", countVar);
}

/**
 * Type for unknown types
 */
export class TMetavar extends TypeO {

  /**
   * @param {String} str
   * @param {Integer} num
   */
  constructor(str, num){
    super();
    this.type = "TMetavar";
    this.name = str + num;
  }
}

/**
 * Make a TMetavar with a fresh name
 * @returns {TMetavar}
 */
export function freshMetavar(){
  countMetavar ++;
  return new TMetavar("mt", countMetavar);
}

// how should we manage the type of expressions like '_' ?