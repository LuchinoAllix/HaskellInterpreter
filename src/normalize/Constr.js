import { Exp } from "./Exp.js";
import { Term } from "./Term.js";

//--            File containing "type" Constr for GADT in normalizing       --//


export class Constr extends Term {

  /**
   * constr object constructor : for objects like Maybe a = Nothing | Just a
   * name is 'Maybe'
   * parmas is ['a']
   * options is the list of expressions (nothing and just a)
   * info is where (line and col) the constr is defined in the code
   * arity is calculated on the number of params
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