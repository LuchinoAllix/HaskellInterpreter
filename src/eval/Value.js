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

export class Vint extends Value {

  /**
   * Integer return type
   * @param {Integer} value 
   */
  constructor(value){
    super("int");
    this.value = value;
  }
}

export class Vchar extends Value {

  /**
   * char return type
   * @param {String} value 
   */
  constructor(value){
    super("char");
    this.value = value;

  }
}

export class Vfunc extends Value {

  /**
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
   * todo
   * @returns 
   */
  exec(){
    return this.func();
  }
}

export class Vbool extends Value {

  /**
   * Boolean return type
   * @param {Boolean} value 
   */
  constructor(value){
    super("bool");
    this.value = value;
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

export class Vdo extends Value {
  
  /**
   * do statement return type (contains a list of return values)
   * @param {[Value]} values 
   */
  constructor(values){
    super("do");
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

export class VMTList extends Value {

  /**
   * constructor for the empty list
   */
  constructor(){
    super("mtlist");
  }
}