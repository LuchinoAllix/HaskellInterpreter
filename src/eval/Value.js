import { Env } from "./Env.js";

/**
 * Abstract class for acutal value return type
 */
export class Value {
  constructor(type, value){
    this.metatype = "VALUE";
    this.type = type;
    this.value = value;
  }
}

export class Vint extends Value {

  /**
   * Integer return type
   * @param {Integer} value 
   */
  constructor(value){
    super("int", value);
  }
}

export class Vstring extends Value {

  /**
   * String return type
   * @param {String} value 
   */
  constructor(value){
    super("string", value);
  }
}

export class Vfunc extends Value {

  /**
   * Used in Curryfied function calls where we need to return a function that
   * still waits for arguments
   * @param {function} value 
   * @param {Env} closure
   * @param {[Exp]} extraArgs
   */
  constructor(value, closure, extraArgs){
    super("func", value);
    this.closure = closure;
    this.extraArgs = extraArgs;
  }
}

export class Vio extends Value {

  /**
   * Primitive function return type
   * @param {function} value 
   */
  constructor(value){
    super("IO", value);
  }
}

export class Vbool extends Value {

  /**
   * Boolean return type
   * @param {Boolean} value 
   */
  constructor(value){
    super("bool", value);
  }
}

export class Vtuple extends Value {
  
  /**
   * tuple return type
   * @param {[Value]} values 
   */
  constructor(values){
    super("tuple", values)
  }
}

export class Vdo extends Value {
  
  /**
   * do statement return type (contains a list of return values)
   * @param {[Value]} values 
   */
  constructor(values){
    super("do", values)
  }
}

export class VList extends Value {
  
  /**
   * list return type
   * @param {[Value]} values 
   */
  constructor(values){
    if (values.length > 1){
      let t0 = values[0].type;
      for (let i = 1; i < values.length; i ++){
        if (values[i].type !== t0){
          throw Error("Elements in list are not homogenous (run-time error)");
          // This test is not recursive, so #FIXME
        }
      }
    }
    super("list", values)
  }
}