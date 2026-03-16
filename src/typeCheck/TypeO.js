//--              File containing "type" TypeO for type checking            --//

// Init name var counters
let countVar = 0;
let countMetavar = 0;

// Init log
let printTLog = false;
let indent = 0;

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
  isConstrVal(){
    return this.type === "TConstrVal";
  }

  /**
   * 
   * @returns {Boolean}
   */
  isConstrType(){
    return this.type === "TConstrType";
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

  /**
   * Return the type as a string for log 
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    if (short){
      return this.type + "(from : " + this.from.toStr(true) + 
                       ", to : " + this.to.toStr(true) + ")";
    }
    return this.type + "(from : " + this.from.toStr(short) + 
                       ", to : " + this.to.toStr(short) + ")";
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

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short 
   * @returns {String}
   */
  toStr(short = true){
    return this.type + '(' + this.blt + ')' ; 
  }
}

// 1) Is this a good alternative to the manually defined function ?
// 2) Not ideal because the type name need to be written twice
// 3) Is this efficient ? because the blt type should only be called once 
//    since it will always return the same object
// 4) what about constrs ?
let blts = {
  "Integer" : () => new TBuiltin("Integer"), 
  "Boolean" : () => new TBuiltin("Boolean"),
  "Char" : () => new TBuiltin("Char"),
  "Unit" : () => new TBuiltin("Unit"),
  "List" : () => new TBuiltin("List"),
  "Tuple" : () => new TBuiltin("Tuple"),
  "IO" : () => new TBuiltin("IO"),
}

/**
 * to determine if a string corresponds to a builtin type or not
 * @param {String} type 
 * @returns 
 */
export function isABuiltin(type){
  return blts[type] !== undefined;
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

  /**
   * Return the type as a string for log 
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    if (short){
      return this.type + ' (' + this.getInnerFunc().toStr(short) + ')'; 
    }
    return this.type + "(func : " + this.func.toStr(short) + 
                       ", app : " + this.arg.toStr(short) + ")";
  }

  getInnerFunc(){
    if (this.func.type === 'App'){
      return this.func.getInnerFunc();
    }
    return this.func ;
  }
}

/**
 * Function to make a TApp object but receiving a list of args, transforms it
 * in recursive calls of TApp to ensure that each one only take one 
 * argument as a parameter
 * @param {Term} func 
 * @param {[Exp]} args 
 * @returns {TApp}
 */
export function makeTAppOfList(func, args){
  if (args.length === 0){
    throw new Error("Error in making a TApp, at least one arg should be "
      + "given");
  } else if (args.length === 1){
    return new TApp(func, args[0]);
  } else {
    let lastElem = args.pop();
    return new TApp(makeTAppOfList(func, args), lastElem);
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

  /**
   * Return the type as a string for log 
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    if (short){ return this.type ; }
    return this.type + "(vars : " + this.names + 
                       ", body : " + this.body.toStr(short) + ")";
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

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " " + this.name;
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
    tLog("➡️ Setting val of " + this.name + " to " + type.toStr(true));
    this.value = type;
  }

  /**
   * Return the type as a string for log 
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    let val = this.value;
    if (this.value === null){
      val = "void" ; 
    } else {
      val = this.value.resolve().toStr(short);
    }
    return this.type + " " + this.name + " (" + val + ")" ;
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
 * Abstract class
 * Type for Algebraic data types
 */
class TConstr extends TypeO {

  /**
   * Like builtins but for user specified
   * @param {String} str
   */
  constructor(str){
    super();
    this.type = "TConstr";
    this.name = str;
  }

  /**
   * Return the type as a string for log (short not used but kept because other
   * toStr call might give it)
   * @param {Boolean} short if there is all the info or only the essential part
   * @returns {String}
   */
  toStr(short = true){
    return this.type + " " + this.name;
  }
}

export class TConstrType extends TConstr {

  constructor(str){
    super(str);
    this.type = "TConstrType";
  }
}

export class TConstrVal extends TConstr {

  constructor(str){
    super(str);
    this.type = "TConstrVal";
  }
}

export function TMaybe() { return new TConstrType("Maybe"); }

export function TJust() { return new TConstrVal("Just"); }
export function TNothing() { return new TConstrVal("Nothing"); }

/**
 * Function to activate the log while type checking
 */
export function activatePrintTLog(){
  printTLog = true;
}

/**
 * Function to print the log if the global variable is set to true
 * @param {String} msg 
 * @param {Integer} i 
 */
export function tLog(msg, i = 0){
  if(printTLog){
    if (i > 0){ indent += i; }
    console.log(" ".repeat(indent * 2) + msg);
    if (i < 0){ indent += i; }
  }
}
