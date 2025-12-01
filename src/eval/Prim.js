import { Term } from "../normalize/Term.js";

//--                   File for primitives object definition                --//

/**
 * Prim object definition, extends Term so that the env is uniformed (only
 * composed of terms, even tough eval type cannot be in an env)
 */
export class Prim extends Term {

  /**
   * Creates a primitive object
   * @param {function} func 
   */
  constructor(func, nbArgs, args=[]){
    super("PRIM");
    this.func = func ;
    this.nbArgs = nbArgs;
    this.args = args;
  }

  call(args){
    let complet_args = this.args.concat(args);

    if (args.length === this.nbArgs){
      return this.func(...complet_args);
    } else if (args.length <= this.nbArgs){
      return new Prim(this.func, this.nbArgs - args.length, complet_args);
    } else {
      throw Error("Too many arguments");
    }
  }
}