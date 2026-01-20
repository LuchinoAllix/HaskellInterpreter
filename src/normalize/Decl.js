import { CaseExp, Exp, LambdaExp, VarExp } from "./Exp.js";
import { Node } from "../objects/Node.js";
import { Term } from "./Term.js";
import { Branch } from "./Branch.js";


//--                 File containing "type" Decl for normalize              --//


let count = 0;

/**
 * 
 * @returns 
 */
export function makeNewName(){
  let name = "arg" + count;
  count ++;
  return new VarExp(name);
}

/**
 * Decl type object used as an intermediary form for evaluation
 * Decls can either be a function or a variable, they could be definied as
 * subclasses (especially since variable need only one branch definition) but
 * it works for the moment to have them both as the same "parent" type
 */
export class Decl extends Term {

  /**
   * Constructor for Decl
   */
  constructor(){
    super("DECL");
  }

  /**
   * Determines if type of declaration is function
   * @returns 
   */
  isFunc(){
    return this.type === "function";
  }

  /**
   * Determines if type of declaration is variable
   * @returns 
   */
  isVar(){
    return this.type === "variable";
  }

  /**
   * Determines if a declaration has a type annotation or not
   * @returns 
   */
  isAnnotated(){
    return this.typeAnnotation !== null;
  }
}

export class FuncDecl extends Decl {

  /** 
   * @param {String} name 
   * @param {Node} typeAnnotation 
   * @param {Branch} branch
   * @param {[Int]} info information relative to the postition of the origin 
   *                     (line / column) of the token
   */
  constructor(name, typeAnnotation, branch, info = null){
    super("DECL");
    this.type = "function";
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.info = info;
    if (branch !== null){
      this.makeBody(branch);
    } else {
      this.body = null;
    }
  }

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
   * todo
   * @returns 
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

export class VarDecl extends Decl {

  /** 
   * @param {String} name 
   * @param {Node} typeAnnotation
   * @param {Exp} def
   * @param {[Int]} info information relative to the postition of the origin 
   *                     (line / column) of the token
   */
  constructor(name, typeAnnotation, def, info = null){
    super("DECL");
    this.type = "variable";
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.def = def;
    this.info = info;
  }

}