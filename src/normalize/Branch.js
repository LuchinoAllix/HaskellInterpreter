import { Exp } from "./Exp.js";
import { Term } from "./Term.js";

//--               File containing "type" branch for normalize              --//


/**
 * Object type Branch, used in Decl for declaring functions and variables
 */
export class Branch extends Term{

  /**
   * Constructor for branch element
   * add a b = a + b
   * a and b are the args, (listed as exp but actually it's a pattern type)
   * the exp a + b would be the branch body
   * 
   * @param {[Exp]} args list of arguments declared before the branch
   * @param {Exp} branchBody actual body of the branch
   */
  constructor(args, branchBody){
    super();
    this.type = "branch"
    this.args = args;
    this.branchBody = branchBody;
  }
}