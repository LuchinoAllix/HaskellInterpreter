
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
    this.value = null;
  }

  /**
   * Setter for the value attribut of the metavar
   * @param {TypeO} type 
   */
  setVal(type){
    this.value = type;
  }

  /**
   * Returns the most advanced know type for a metavar (follows the value)
   */
  resolve(){
    // How to we prevent infinite cycles like t2 -> t3 -> t2 ? #HELP
    // FIXME: The occurs check should do that for us.
    
    if (this.value === null) return this;

    if (this.value.isMetavar() && this.value.value !== null){
      // FIXME: `this.value.resolve()` will redo the null test,
      // which is a bit inelegant.
      return this.value.resolve();
    }

    return this.value;
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
