import { Term } from "../normalize/Term.js";
import { Value, Vfunc, Vio } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough exp type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive function object
   * @param {function} func 
   * @param {Integer} nbArgs still required 
   * @param {[Value]} args
   */
  constructor(func, nbArgs, args = []) {
    super("PRIM");
    this.func = func;
    this.nbArgs = nbArgs;
    this.args = args;
  }

  run(){
    return this.func(...this.args);
  }

  clone(){
    return new Prim(this.func, this.nbArgs);
  }

}

/**
 * Class for primitive IO functions
 */
export class PrimIO extends Prim {

  /**
   * Creates a primitive IO function object
   * @param {function} func 
   * @param {Integer} nbArgs 
   */
  constructor(func, nbArgs) {
    super(func, nbArgs);
    this.metatype = "PRIMIO";
  }

  clone(){
    return new PrimIO(this.func, this.nbArgs);
  }
}
