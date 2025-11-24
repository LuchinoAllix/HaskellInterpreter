import { Exp, Term } from "./Exp.js";
import { Node } from "../Node.js";


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
   * @param {[Exp]} branches
   * @param {[String]} args
   */
  constructor(type, name, typeAnnotation, branches, args){
    this.type = type;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.branches = branches;
    this.args = args
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
   * @param {Exp} branch 
   */
  addBranchDef(branch){
    this.branches.push(branch);
  }
}

/**
 * todo
 * @param {String} name 
 * @param {Node} node 
 * @returns 
 */
export function typeFuncDecl(name, node){
  return Decl("function", name, node, null, null);
}

/**
 * todo
 * @param {String} name 
 * @param {Exp} branch 
 * @param {[String]} args 
 * @returns 
 */
export function branchFuncDecl(name, branch, args){
  return Decl("function", name, null, [branch], args);
}

/**
 * todo
 * @param {String} name 
 * @param {Node} node 
 * @returns 
 */
export function typeVarDecl(name, node){
  return Decl("variable", name, node, null, null);
}

/**
 * todo
 * @param {String} name 
 * @param {Exp} branch
 * @returns 
 */
export function branchVarDecl(name, branch){
  return Decl("variable", name, null, [branch], null);
}


const DeclType = {
  function : "function",
  variable : "variable"
}