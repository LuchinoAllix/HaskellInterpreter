import { Exp } from "./Exp.js";


//--                 File containing "type" Decl for normalize              --//

/**
 * todo
 */
export class Decl {

  /**
   * todo
   * @param {DeclType} type 
   * @param {String} name 
   * @param {[Strings]} typeAnnotation 
   * @param {[Exp]} branches
   */
  constructor(type, name, typeAnnotation, branches){
    this.type = type;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.branches = branches;
  }

  /**
   * todo
   * @param {*} type 
   */
  annotate(type){
    this.type = type;
  }

  /**
   * todo
   * @param {*} branch 
   */
  addBranchDef(branch){
    this.branches.push(branch);
  }
}

/**
 * todo
 */
export class FunctionDecl extends Decl {

  /**
   * todo
   * @param {*} name 
   * @param {*} typeAnnotation 
   * @param {*} branches 
   * @param {*} args 
   */
  constructor(name, typeAnnotation, branches, args){
    super("function", name, typeAnnotation, branches);
    this.arguments = args;
  }
}

/**
 * todo
 */
export class VariableDecl extends Decl {

  /**
   * todo
   * @param {*} name 
   * @param {*} typeAnnotation 
   * @param {*} branches 
   */
  constructor(name,typeAnnotation, branches){
    super("variable", name, typeAnnotation, branches);
  }
}



const DeclType = {
  function : "function",
  variable : "variable"
}