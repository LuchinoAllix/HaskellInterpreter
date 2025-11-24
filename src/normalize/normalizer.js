import { Decl, typeFuncDecl, typeVarDecl, branchFuncDecl, 
         branchVarDecl } from "./Decl";
import { Exp, VarExp, FunctionApp, IfTerm, LetTerm, CaseTerm } from "./Exp";

//--     File containing functions for intermediary form transformation     --//


/**
 * todo
 * @param {*} astRoot 
 * @returns 
 */
export function normalize(astRoot){
  switch (astRoot.type){
    case "root" :
      return normalize(astRoot.childs[0]);
    case "body" :
      for (let node in astRoot.childs){
        if (!node.type.startswith(("layout"))){
          return normalize(node);
        }
      }
      throw Error("Malformed AST, body should have one non layout node.");
    case "topdecls" : 
    case "interactive" :
      let explist = []
      for (let node in astRoot.childs){
        if (!node.type.startswith(("layout"))){
          addDecl(explist, normalize(node));
        }
      }
      return explist;
    case "decl" :
    case "gendecl" :
      return normalizeDecl(astRoot);
    

  }
}


/**
 * todo
 * @param {*} node 
 */
function normalizeDecl(node){

  // todo 
  // make the declaration object
  let name = "";
  if (node.type === "gendecl"){ // We know it's a type declaration
    name = node.childs[0].value;
    if (isGendeclFunc(node)){ // We know it's a function declaration
      return typeFuncDecl(name, node.childs[2]);
    } else if (isDeclFunc(node)) { // We know it's a variable declaration
      return typeVarDecl(name, node.childs[2]);
    } else {
      throw Error(node + " neither isGendecl or isDecl worked, probably" +
                  "unsupported expression");
    }
  } else if (node.type === "decl"){ // We know it's a branch declaration
    name = node.childs[0].childs[0].value;
    if (isGendeclFunc(node)){ // We know it's a function declaration
      return branchFuncDecl(name, normalize(???), node.childs[2]);
    } else if (isDeclFunc(node)) { // We know it's a variable declaration
      return typeVarDecl(name, node.childs[2]);
    } else {
      throw Error(node + " neither isGendecl or isDecl worked, probably" +
                  "unsupported expression");
    }
  } else {
    throw Error(node.type + " was given when expected gendecl or decl.");
  }
}

/**
 * todo
 * @param {*} node 
 * @returns 
 */
function isGendeclFunc(node){
  for (let i = 0; i < node.childs.length; i++){
    if (i < node.childs.length-1 && node.childs[i].value === "::"){
      if (node.childs[i+1].type === "type"){
        return true;
      }
      return false;
    }
  }
  throw Error("No type found in gendecl");
}

/**
 * todo
 * @param {*} node 
 * @returns 
 */
function isDeclFunc(node){
  return  (node.childs[0].type === "funlhs");
}

function addDecl(explist, decl){
  // todo : given a list of expressions, for each declarations, 
  // merge the ones based on the same name, 
  // check if number of arguments is the same blablabla
  // throw error if a variable is declared multiple times
}
