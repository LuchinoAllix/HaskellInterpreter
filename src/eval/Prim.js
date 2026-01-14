import { Term } from "../normalize/Term.js";
import { Value } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough exp type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive function object
   * @param {function} func 
   */
  constructor(func) {
    super("PRIM");
    this.func = func;
  }

  /**
   * Allows to execute the function in the func attribute with it's arguments
   * @returns {Value}
   */
  run(args){
    return this.func(...args);
  }
}

/**
 * Class for primitive IO functions
 */
export class PrimIO extends Prim {

  /**
   * Creates a primitive IO function object
   * @param {function} func 
   */
  constructor(func) {
    super(func);
    this.metatype = "PRIMIO";
  }

}
