import { Term } from "../normalize/Term.js";
import { Vio } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough exp type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive function object
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

    } else {
      let temp;
      if (this.isPrimIO()){
        temp = new PrimIO(partial(this.func, args[0]), this.nbArgs - 1);
      } else {
        temp = new Prim(partial(this.func, args[0]), this.nbArgs - 1);
      }
      args.shift();
      return temp.lambdaCall(args);
    }
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
}

/**
 * Currying of a function by applying only the first args
 * (can be used for any number of args but is used only for one)
 * AI generated function
 * @param {function} fn 
 * @param  {...any} fixedArgs 
 * @returns {function}
 */
function partial(fn, ...fixedArgs) {
  return function(...restArgs) {
    return fn(...fixedArgs, ...restArgs);
  };
}