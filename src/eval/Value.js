import { Env } from "./Env.js";
import { isMTArray } from "./eval.js";

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

export class Vchar extends Value {

  /**
   * char return type
   * @param {String} value 
   */
  constructor(value){
    super("char", value);
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
   * Constructor for VList, used in functionApp management, so expects either an
   * empty list or a value and a Vlist, to make a VList for a list of any number
   * of values, use MakeVList
   * @param {[Value]} values 
   */
  constructor(values){
    if (values.length === 0){
      super("list", []);
    } else if (values.length === 1 || values.length > 2){
      throw new Error("This list constructor should have an empty list" + 
        "as argument or a list with 2 elements");
    } else {
      if (isMTArray(values[1].value)){
        super("list", [values[0]]);
      } else {
        values[1].value = [values[0]].concat(values[1].value);
        super("list", values[1].value);
      }
    }
  }
}

/**
 * "Constructor" for VList but where we already have a list of values
 * @param {[Value]} values 
 * @returns {VList}
 */
export function makeVList(values){
  let list = new VList([]);
  list.value = values;
  return list;
}