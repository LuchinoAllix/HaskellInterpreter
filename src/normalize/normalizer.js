import { Decl, FunctionDecl, VariableDecl } from "./Decl";
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
          explist.push(normalize(node));
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

  //todo determine how to check if decl already exists and when to
  // override
  // make the declaration object
  let name = "";
  if (node.type === "gendecl"){
    name = node.childs[0].value;
  } else if (node.type === "decl"){
    name = node.childs[0].childs[0].value;
  } else {
    throw Error(node.type + " was given when expected gendecl or decl.");
  }
}

/**
 * todo
 * @param {*} node 
 * @returns 
 */
function isFunc(node){
  for (let i = 0; i < node.childs.length; i++){
    if (i < node.childs.length-1 && node.childs[i].value === "::"){
      if (node.childs[i+1].type === "type"){
        return true;
      }
      return false;
    }
  }
  throw Error("No type found in declaration");
}
