import { Term } from "../normalize/Term.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough exp type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive object
   * @param {function} func 
   */
  constructor(func, nbArgs){
    super("PRIM");
    this.func = func ;
    this.nbArgs = nbArgs;
  }

  /**
   * 
   * @param {[]} args 
   * @returns {Value}
   */
  lambdaCall(args){
    // todo verify primIO
    if (args.length > this.nbArgs){
      throw Error("Too many arguments");
    } else if (args.length === 0){
      if (this.nbArgs === 0){
        return this.func();
      }
      // If we are still waiting for args
      return this;
      
    } else if (args.length === 1){
      return new Prim((arg)=>this.func(args[0]),this.args -1);
    } else {
      let temp = new Prim((arg)=>this.func(args[0]),this.args -1);
      args.pop(0);
      return temp.lambdaCall(args);
    }
  }
}