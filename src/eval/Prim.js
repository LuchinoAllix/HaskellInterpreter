import { Term } from "../normalize/Term.js";
import { Vio } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough exp type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive object
   * @param {function} func 
   * @param {Integer} nbArgs 
   */
  constructor(func, nbArgs) {
    super("PRIM");
    this.func = func;
    this.nbArgs = nbArgs;
  }

  /**
   * Recursively calls the function with all the args one by one,
   * if all the args are given, calls the function, except if it 
   * an IO one, in this case, returns a Vio
   * @param {[]} args 
   * @returns {Value}
   */
  lambdaCall(args) {
    if (args.length > this.nbArgs) {
      throw Error("Too many arguments given to " + this.func);
    } else if (args.length === 0) { // all the args have been given
      if (this.nbArgs === 0) {
        if (this.isPrimIO()) {
          return new Vio(this.func);
        }
        return this.func();
      }
      return this; // If we are still waiting for args

    } else if (args.length === 1) {
      return new Prim(partial(this.func, args[0]), this.args - 1);
    } else {
      let temp = new Prim(partial(this.func, args[0]), this.args - 1);
      args.pop(0);
      return temp.lambdaCall(args);
    }
  }
}


export class PrimIO extends Prim {

  /**
   * todo
   * @param {function} func 
   * @param {Integer} nbArgs 
   */
  constructor(func, nbArgs) {
    super(func, nbArgs);
    this.metatype = "PRIMIO";
  }
}

function partial(fn, ...fixedArgs) {
  return function(...restArgs) {
    return fn(...fixedArgs, ...restArgs);
  };
}