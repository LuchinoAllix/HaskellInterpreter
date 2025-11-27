import { Exp } from "./Exp.js";
import { Node } from "../Node.js";
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
   * allows to add a branch definition to a declaration
   * @param {[String]} args 
   * @param {Exp} brachBody 
   */
  addBranchDef(branch){
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
  return new Decl("function", name, node, null, null);
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
  return new Decl("variable", name, node, null, null);
}

/**
 * Construct a variable declaration but with only the branch definition
 * @param {String} name 
 * @param {Exp} branch
 * @returns {Decl}
 */
export function branchVarDecl(name, branch){
  return new Decl("variable", name, null, [branch], null);
}

// Doesn't serve any real function, only to show the type options
const DeclType = {
  functionDecl : "functionDecl",
  variableDecl : "variableDecl"
}