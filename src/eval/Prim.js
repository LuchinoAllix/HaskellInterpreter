import { Env } from "./Env.js";
import { Vfunc } from "./Value.js";

//--                   File for primitives object definition                --//

/**
 * Class for primitive function object, such as '+', '-', '*', 'fst', '++',  ...
 */
export class Prim extends Vfunc {

  /**
   * Creates a primitive function object
   * @param {function} body
   * @param {} param
   * @param {Env} env
   */
  constructor(body, param, env) {
    super(body, param, env);
    this.subtype = "prim";
  }
}
