import { Node } from "./Node";

//--           File for functions needed to evaluate an expression          --//

/**
 * Main function to evaluate an expression
 * TODO determine what is returned
 * @param {Node} node 
 * @param {?} env 
 */
export function evaluate(node, env){
  switch (node.value){
    case "root" :
      return evaluate(node.childs[0], env);
    case "body" :
      return evaluate(node.childs[1], env);
    case "topdecls" :
      for (let child in node.childs){
        evaluate(child, env);
      } // todo what to return here ?
    case "layout" :
      return ;
    case "gendecl" : 
      evalType(node, env);
      return ; 
    case "decl" :
      evalDecl(node, env);
      return ;
    case "lexp" :
      evalLexp(node, env);
      return ;
    default :
      throw Error("Unknown expression : ", node.type);
  }
}

/**
 * Todo 
 * @param {Node} node 
 * @param {[?]} env 
 */
function evalType(node, env){

}

/**
 * Todo
 * @param {Node} node 
 * @param {[?]} env 
 */
function evalDecl(node, env){

}

/**
 * Todo
 * @param {Node} node 
 * @param {[?]} env 
 */
function evalLexp(node, env){
  switch (node.childs[0].value){
    case "\\" : // Todo see how does lambda abstraction appear in the ast
      return ;
    case "let" :
      // TODO
      // copy env to make a local one
      // add all delcs to local env
      // evaluate exp with local env (print ?)
      // "forget local env"
      return ;
    case "if" :
      // TODO
      return ;
    case "case" :
      // TODO
      return ;
    case "do" :
      // TODO
      return ;
    default :
      throw Error("Unrecognised Lexp : ", node.childs[0].type);
  }

}

