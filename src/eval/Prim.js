
import { Value, Vfunc } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Class for primitive function object, such as '+', '-', '*', 'fst', '++',  ...
 */
export class Prim extends Vfunc {

  /**
   * Creates a primitive function object
   * @param {function} func 
   */
  constructor(body, param, env) {
    super(body, param, env);
    this.subtype = "prim";
  }

  /**
   * Allows to execute the function in the func attribute with it's arguments
   * @returns {Value}
   */
  run(args){
    return this.body(...args);
  }
}

/**
 * Class for primitive IO functions
 */
export class PrimIO extends Prim {

  /**
   * Creates a primitive io function object
   * @param {function} func 
   */
  constructor(body, param, env) {
    super(body, param, env);
    this.subtype = "primio";
  }

}
