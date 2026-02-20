import { Exp } from "./Exp.js";
import { Term } from "./Term.js";

//--             File containing "type" Constr for ADT in normalizing       --//


export class Constr extends Term {

  /**
   * todo
   * @param {String} name 
   * @param {[Exp]} options 
   * @param {[String]} params
   * @param {[Integer]} info
   */
  constructor(name, options, params, info = null){
    super("CONSTR");
    this.name = name;
    this.params = params;
    this.options = options;
    this.info = info;
    this.arity = params.length;
  }


}