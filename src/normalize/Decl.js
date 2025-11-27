import { Exp } from "./Exp.js";
import { Node } from "../Node.js";
import { Term } from "./Term.js";
import { Branch } from "./Branch.js";


//--                 File containing "type" Decl for normalize              --//

/**
 * todo
 */
export class Decl extends Term {

  /**
   * todo
   * @param {DeclType} type 
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
   * todo
   * @param {Node} typeAnnotation 
   */
  annotate(typeAnnotation){
    this.typeAnnotation = typeAnnotation;
  }

  /**
   * todo
   * @param {[String]} args 
   * @param {Exp} brachBody 
   */
  addBranchDef(branch){
    this.branches.push(branch);
  }

  /**
   * todo
   * @returns 
   */
  isFunc(){
    return this.type === "function";
  }

  /**
   * todo
   * @returns 
   */
  isVar(){
    return this.type === "variable";
  }

  /**
   * todo
   * @returns 
   */
  isAnnotated(){
    return this.typeAnnotation !== null;
  }
}

/**
 * todo
 * @param {String} name 
 * @param {Node} node 
 * @returns {Decl}
 */
export function typeFuncDecl(name, node){
  return new Decl("function", name, node, null, null);
}

/**
 * todo
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
 * todo
 * @param {String} name 
 * @param {Node} node 
 * @returns {Decl}
 */
export function typeVarDecl(name, node){
  return new Decl("variable", name, node, null, null);
}

/**
 * todo
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