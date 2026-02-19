import { CaseExp, LambdaExp, VarExp } from "./Exp.js";
import { Term } from "./Term.js";
import { Branch } from "./Branch.js";
import { TypeO } from "../typeCheck/TypeO.js";


//--                 File containing "type" Decl for normalize              --//

let count = 0; // for generating new variables names 

/**
 * Creates a variable expression with a new name (using the \ to know the 
 * difference between a user entered var name and a generated one, since \ in 
 * var names is not allowed in haskell)
 * @returns {VarExp}
 */
export function makeNewName(){
  let name = "\\arg" + count;
  count ++;
  return new VarExp(name);
}

/**
 * Decl type object used as an intermediary form for evaluation
 * Decls can either be a function or a variable
 */
export class Decl extends Term {

  /**
   * Constructor for Decl
   * 
   * @param {String} name 
   * @param {TypeO} typeAnnotation
   * @param {Term} term A branch or an exp
   * @param {[Integer]} info 
   */
  constructor(name, typeAnnotations, term, info = null){
    super("DECL");
    this.name = name;
    this.typeAnnotations = typeAnnotations;
    this.info = info;
    if (term !== null){
      if (term.type === "branch"){
        this.makeBody(term);
      } else {
        this.body = term;
      }
    } else {
      this.body = null;
    }
  }

  /**
   * Determines if a declaration has a type annotation or not
   * @returns {Boolean}
   */
  isAnnotated(){
    return this.typeAnnotations !== null;
  }

  /**
   * Makes the body of a function declaration into a lambda and a case based on 
   * the branch it receives
   * @param {Branch} branch 
   */
  makeBody(branch){
    let argsNames = []
    for (let i = 0; i < branch.args.length; i++){
      argsNames.push(makeNewName());
    }
    this.body = new LambdaExp(argsNames, new CaseExp(argsNames, [branch]));
  }

  /**
   * Allows to add a branch definition to a declaration
   * Checks if the number of arguments in the different branches is the same 
   * (type annotation is not considered)
   * @param {Branch} branch
   */
  addBranchDef(branch){
    if (this.body === null){
      this.makeBody(branch);
    } else {
      let caseOf = this.getCase();
      let nbArgs = caseOf.branches[0].args.length ;
      if(nbArgs !== branch.args.length){
        throw new Error("Mismatch between number of arguments in different " +
          "parts of the function declaration, branch already processed :" 
          + nbArgs + " !== processed branch :" + branch.args.length
          + " in function " + this.name);
      }
      caseOf.branches.push(branch);
    }
  }

  /**
   * Method to get the caseExp node at the end of a func decl lambda exp 
   * contained in the body (because of the branches)
   * @returns {CaseExp}
   */
  getCase(){
    // we suppose we only have lambda exps until the caseExp
    let caseOf = this.body;
    while (caseOf.type !== "case"){ 
      caseOf = caseOf.body;
    }
    return caseOf;
  }
}