
//--              File containing "type" TypeO for type checking            --//

let count = 0;


/**
 * Makes a new name for a type (t0, t1, t2, ...)
 * @returns {String}
 */
function makeNewTypeName(){
  let name = "t" + count;
  count ++;
  return name
}

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
 * 
 * @returns {TBuiltin}
 */
export function TInt() {
  return new TBuiltin("Int");
}

/**
 * 
 * @returns {TBuiltin}
 */
export function TBool() {
  return new TBuiltin("Bool");
}

/**
 * 
 * @returns {TBuiltin}
 */
export function TChar() {
  return new TBuiltin("Char");
}

/**
 * 
 * @returns {TBuiltin}
 */
export function TUnit() {
  return new TBuiltin("Unit");
}

/**
 * 
 * @returns {TBuiltin}
 */
export function TList() {
  return new TBuiltin("List");
}

/**
 * 
 * @returns {TBuiltin}
 */
export function TTuple() {
  return new TBuiltin("Tuple");
}

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
    this.type = "Tvar";
    this.name = str + num;
  }
}

/**
 * Make a Tvar with a fresh name
 * @returns {TVar}
 */
export function freshVar(){
  count ++;
  return new TVar("t", count);
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

// how should we manage the type of expressions like '_' ?