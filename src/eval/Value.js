import { Env } from "./Env.js";

/**
 * Abstract class for actual value return type
 */
export class Value {
  constructor(type){
    this.metatype = "VALUE";
    this.type = type;
  }
}

export const Unit = new Value("unit");

export class VImm extends Value {

  /**
   * Immediate return type
   * @param {?} value 
   */
  constructor(value, type){
    super(type);
    this.value = value;
  }
}

export function Vint(value){  return new VImm(value, "Integer") ; }
export function Vchar(value){ return new VImm(value, "Char")    ; }
export function Vbool(value){ return new VImm(value, "Boolean") ; }

export class Vfunc extends Value {

  /**
   * todo
   * @param {function} body 
   * @param {Env} closure
   */
  constructor(body, param = null, closure = new Env()){
    super("func");
    this.body = body;
    this.param = param;
    this.closure = closure;
    this.subtype = "func";
  }

  /**
   * Adds the argument name and it's value to the closure of the Vfunc
   * @param {String} name 
   * @param {Value} value 
   */
  addArg(name, value){
    let clone = this.closure.clone();
    clone.add(name, value, true);
    this.closure = clone;
  }
}

export class Vio extends Value {

  /**
   * Primitive function return type
   * @param {function} func
   * @param {arg}  
   */
  constructor(func){
    super("IO");
    this.func = func;
  }

  /**
   * Runs the function in the func attribute and returns it's result
   * @returns 
   */
  exec(){
    return this.func();
  }
}

export class Vtuple extends Value {
  
  /**
   * tuple return type
   * @param {[Value]} values 
   */
  constructor(values){
    super("tuple");
    this.value = values;
  }
}

export class VList extends Value {

  /**
   * Constructor for lists (like haskell)
   * @param {Value} a 
   * @param {Value} b 
   */
  constructor(a, b){
    super("list");
    this.fst = a;
    this.snd = b;
  }
}

export class VConstr extends Value {

  /**
   * constructor for value of constructors
   */
  constructor(type, values = []){
    super(type);
    this.value = values
  }
}
