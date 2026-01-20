import { Env } from "./Env.js";
import { isMTArray } from "./eval.js";



/**
 * Abstract class for acutal value return type
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
   * todo
   * @param {*} name 
   * @param {*} value 
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
  constructor(func, arg){
    super("IO");
    this.func = func;
    this.arg = arg;
  }

  /**
   * 
   * @returns 
   */
  exec(){
    return this.func.body(this.arg);
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
   * Constructor for VList, used in functionApp management, so expects either an
   * empty list or a value and a Vlist, to make a VList for a list of any number
   * of values, use MakeVList
   * @param {[Value]} values 
   */
  constructor(values){
    super("list");
    let val;
    if (values.length === 0){
      val = [];
    } else if (values.length === 1 || values.length > 2){
      throw new Error("This list constructor should have an empty list " + 
        "as argument or a list with 2 elements");
    } else {
      if (isMTArray(values[1].value)){
        val = [values[0]];
      } else {
        values[1].value = [values[0]].concat(values[1].value);
        val = values[1].value;
      }
    }
    this.value = val;
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