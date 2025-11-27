import { Exp } from "./Exp.js";
import { Node } from "../Node.js";
import { Term } from "./Term.js";


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
    super("DECL");
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
    this.branches.push(branch); // todo : error here fix me, with the arg
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
 * @returns 
 */
export function typeFuncDecl(name, node){
  return new Decl("function", name, node, null, null);
}

/**
 * todo
 * @param {String} name 
 * @param {Exp} branch 
 * @param {[String]} args 
 * @returns 
 */
export function branchFuncDecl(name, branch, args){
  return new Decl("function", name, null, [branch], args);
}

/**
 * todo
 * @param {String} name 
 * @param {Node} node 
 * @returns 
 */
export function typeVarDecl(name, node){
  return new Decl("variable", name, node, null, null);
}

/**
 * todo
 * @param {String} name 
 * @param {Exp} branch
 * @returns 
 */
export function branchVarDecl(name, branch){
  return new Decl("variable", name, null, [branch], null);
}

// Doesn't serve any real function, only to show the type options
const DeclType = {
  functionDecl : "functionDecl",
  variableDecl : "variableDecl"
}