import { Exp } from "./Exp.js";

export class Branch {

  /**
   * 
   * @param {[String]} args 
   * @param {Exp} branchBody 
   */
  constructor(args, branchBody){
    this.args = args;
    this.branchBody = branchBody;
  }
}