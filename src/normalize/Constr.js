import { Exp } from "./Exp.js";
import { Term } from "./Term.js";

export class Constr extends Term {


  /**
   * 
   * @param {String} name 
   * @param {[Exp]} options 
   * @param {[String]} params
   * @param {[Integer]} info
   */
  constructor(name, options, params, info){
    super("CONSTR");
    this.name = name;
    this.params = params;
    this.options = options;
    this.info = info;
  }


}