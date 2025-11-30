import { Term } from "../normalize/Term";

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
  constructor(func){
    this.metatype = "PRIM";
    this.func = func ;
  }

}