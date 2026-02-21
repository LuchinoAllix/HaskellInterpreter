
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
  isConstr(){
    return this.type === "TConstr";
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

  /**
   * Returns the most advanced known type for a metavar (follows the value)
   */
  resolve(){
    // How to we prevent infinite cycles like t2 -> t3 -> t2 ? #HELP
    // FIXME: The occurs check should do that for us.
    // But resolve is called in the occurs check ?
    if (this.isMetavar()){
      if (this.value === null) return this ;
      if (this.value.isMetavar()) return this.value.resolve() ;
      return this.value ;
    }
    
    return this;
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

// 1) Is this a good alternative to the manually defined function ?
// 2) Not ideal because the type name need to be written twice
// 3) Is this efficient ? because the blt type should only be called once 
//    since it will always return the same object
let blts = {
  "Integer" : () => new TBuiltin("Integer"), 
  "Boolean" : () => new TBuiltin("Boolean"),
  "Char" : () => new TBuiltin("Char"),
  "Unit" : () => new TBuiltin("Unit"),
  "List" : () => new TBuiltin("List"),
  "Tuple" : () => new TBuiltin("Tuple"),
  "IO" : () => new TBuiltin("IO"),
  "Just" : () => new TBuiltin("Just"),
  "Maybe" : () => new TBuiltin("Maybe")
} 

/**
 * Functions to generate builtin types
 */
export function TInt() { return new TBuiltin("Integer"); }
export function TBool() { return new TBuiltin("Boolean"); }
export function TChar() { return new TBuiltin("Char"); }
export function TUnit() { return new TBuiltin("Unit"); }
export function TList() { return new TBuiltin("List"); }
export function TTuple() { return new TBuiltin("Tuple"); }
export function TIO() { return new TBuiltin("IO"); }

// there should be a verification of some sort that all these types appear in
// the type option table

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
   * @param {[String]} names
   * @param {TypeO} body
   */
  constructor(names, body){
    super();
    this.type = "Forall";
    this.names = names;
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
}

/**
 * Make a TMetavar with a fresh name
 * @returns {TMetavar}
 */
export function freshMetavar(){
  countMetavar ++;
  return new TMetavar("mt", countMetavar);
}

/**
 * Type for GADT (constructors)
 */
export class TConstr extends TypeO {

  /**
   * Like builtins but for user specified
   * @param {String} str
   */
  constructor(str){
    super();
    this.type = "TConstr";
    this.name = str;
  }
}

export function TJust() { return new TConstr("Just"); }
export function TMaybe() { return new TConstr("Maybe"); }
export function TNothing() { return new TConstr("Nothing"); }
