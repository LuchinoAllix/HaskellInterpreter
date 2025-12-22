import { Exp } from "./Exp.js";
import { Node } from "../objects/Node.js";
import { Term } from "./Term.js";
import { Branch } from "./Branch.js";


//--                 File containing "type" Decl for normalize              --//

/**
 * Decl type object used as an intermediary form for evaluation
 * Decls can either be a function or a variable, they could be definied as
 * subclasses (especially since variable need only one branch definition) but
 * it works for the moment to have them both as the same "parent" type
 */
export class Decl extends Term {

  /**
   * Constructor for Decl
   * @param {DeclType} type Type of declaration (function or variable)
   * @param {String} name 
   * @param {Node} typeAnnotation 
   * @param {[Branch]} branches
   * @param {[String]} nbArgs
   */
  constructor(type, name, typeAnnotation, branches, nbArgs){
    super("DECL");
    this.type = type;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.branches = branches;
    this.nbArgs = nbArgs
  }

  /**
   * Allows to add a branch definition to a declaration
   * If it's a function declaration, checks if the number of arguments in the
   * different branches is the same (type annotation is not considered)
   * @param {Branch} branch 
   */
  addBranchDef(branch){
    if (branch.args === null){ 
      // variable branch : do nothing
    } else if (this.nbArgs === null || this.nbArgs === undefined){ 
      // number of arguments not yet initialized
      this.nbArgs = branch.length;
    } else if(this.nbArgs !== branch.args.length){
      throw Error("Mismatch between number of arguments in different " +
                 "parts of the function declaration, branch already processed :" 
                 + this.nbArgs + " !== processed branch :" + branch.args.length
                 + " in function " + this.name);
    }
    this.branches.push(branch);
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

/**
 * Construct a function declaration but with only the type annoatation
 * @param {String} name 
 * @param {Node} node 
 * @returns {Decl}
 */
export function typeFuncDecl(name, node){
  return new Decl("function", name, node, [], null);
}

/**
 * Construct a function declaration but with only the branch definition
 * @param {String} name 
 * @param {Exp} branch 
 * @param {[String]} args 
 * @returns {Decl}
 */
export function branchFuncDecl(name, branch, args){
  return new Decl("function", name, null, [new Branch(args, branch)], 
                  args.length);
}

/**
 * Construct a variable declaration but with only the type annoatation
 * @param {String} name 
 * @param {Node} node 
 * @returns {Decl}
 */
export function typeVarDecl(name, node){
  return new Decl("variable", name, node, [], null);
}

/**
 * Construct a variable declaration but with only the branch definition
 * @param {String} name 
 * @param {Branch} branch
 * @returns {Decl}
 */
export function branchVarDecl(name, branch){
  let nbArgs = null;
  if (branch.type === "LambdaExp"){
    nbArgs = branch.args.length;
  }
  return new Decl("variable", name, null, [branch], nbArgs);
}

// Doesn't serve any real function, only to show the type options
const DeclType = {
  functionDecl : "function",
  variableDecl : "variable"
}