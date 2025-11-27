import { Decl, typeFuncDecl, typeVarDecl, branchFuncDecl, 
         branchVarDecl } from "./Decl.js";
import { Exp, VarExp, ValExp, FunctionApp, IfTerm, LetTerm, CaseTerm } 
       from "./Exp.js";
import { Program } from "../Program.js";

//--     File containing functions for intermediary form transformation     --//


/**
 * 
 * @param {Program} program 
 * @returns {Boolean}
 */
export function normalizeStart(program){
  program.normalizedForm = normalize(program.AST);
  return true;
}


/**
 * todo
 * @param {*} astRoot 
 * @returns 
 */
function normalize(astRoot){
  switch (astRoot.type){

    case "root" :
      return normalize(astRoot.childs[0]);

    case "body" :
      for (let node of astRoot.childs){
        if (! node.type.startsWith("layout")){
          return normalize(node);
        }
      }
      throw Error("Malformed AST, body should have one non layout node.");

      //case "interactive" : 
      // TODO : Must do something different for interactive, 
      // because it takes only one exp or decl at a time

      case "topdecls" : 
      let declList = []
      for (let node of astRoot.childs){
        if (node.type === "decl" || node.type === "gendecl"){
          addDecl(declList, normalizeDecl(node));
        } else if (!node.type.startsWith(("layout"))){
          throw Error("Only declarations are allowed in program mode, not" + 
            node.type);
        }
      }
      return declList;

    case "decl" :
    case "gendecl" :
      return normalizeDecl(astRoot);

    case "rhs" :
      // This is not the only rhs outcome, just the only one yet managed
      return normalizeExp(astRoot.childs[1]);
    
    default :
      throw Error("This type of node is not yet managed by normalise : " 
        + astRoot.type);
    

  }
}


/**
 * todo
 * @param {*} node 
 */
function normalizeDecl(node){
  let name = "";
  if (node.type === "gendecl"){ // We know it's a type declaration
    name = node.childs[0].value;
    if (isGendeclFunc(node)){ // We know it's a function declaration
      return typeFuncDecl(name, node.childs[2]);
    } else { // We know it's a variable declaration
      return typeVarDecl(name, node.childs[2]);
    } 
  } else if (node.type === "decl"){ // We know it's a branch declaration
    name = node.childs[0].childs[0].value;
    if (isDeclFunc(node)){ // We know it's a function declaration
      return branchFuncDecl(name, normalize(node.childs[1]), 
                                  getArgs(node.childs[0]));
    } else  { // We know it's a variable declaration
      return branchVarDecl(name, normalize(node.childs[1]));
    }
  } else {
    throw Error(node.type + " was given when expected gendecl or decl.");
  }
}

/**
 * Determines if a node of type 'gendecl' is a function or variable declaration
 * @param {Node} node 
 * @returns {Boolean}
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
 * Determines if a node of type 'decl' is a function or variable declaration
 * @param {Node} node 
 * @returns {Boolean}
 */
function isDeclFunc(node){
  return  (node.childs[0].type === "funlhs");
}

/**
 * todo
 * @param {[Exp]} declList 
 * @param {Decl} decl 
 */
function addDecl(declList, decl){
  if (declList.length === 0){
    declList.push(decl);
  } else {
    for (let i = 0; i < declList.length; i ++){
      if (declList[i].isDecl()){ // We know we have a declaration
        if (declList[i].name === decl.name){ // If declaration already exists

          if (declList[i].typeAnnotation !== null && 
              decl.typeAnnotation !== null){
            throw Error("Type for "+  declList[i].name + " is already defined");
          }

          if (declList[i].typeAnnotation === null && 
                     decl.typeAnnotation !== null){
            throw Error("Type annotation should come before " + 
                        "definition" + decl);
          }

          if (i !== declList.length - 1){
            // We suppose that the declaration should be the last one
            throw Error("Declarations on multiple lines should follow one " + 
              "another");
          } 

          if(decl.isVar()){
            if (declList[i].isAnnotated() && !decl.isAnnotated()){
              declList[i].addBranchDef(decl.branches[0]);
              break;
            } else {
              throw Error("Cannot redefine variable : " + decl.name);
            }
          
          
          } else if (decl.isFunc()){
            declList[i].addBranchDef(decl.branches[0]);
            break;
          
          } else {
            throw Error("A declaration other than a function or variable was " +
              "given to addDecl " + decl.type);
          }

        } else {
          declList.push(decl);
        }
      } else {
        throw Error("Only delcarations are allowed in addDecl " + decl);
      }
    }
  }
}

/**
 * 
 * @param {*} node 
 * @returns 
 */
function normalizeExp(node){
  console.log(node.type);
  switch (node.type){
    
    case "infixexp" :
      console.log("1", node.childs[1].value);
      // based on the fact that the second element of an infixexp is the 
      // function 
      return new FunctionApp(node.childs[1].value, 
                             [normalizeExp(node.childs[0]),
                              normalizeExp(node.childs[2])]);

    case "fexp" :
      console.log("2", node.childs[0].value);
      return new FunctionApp(node.childs[0].value, 
                             [normalizeExp(node.childs[1])]);
    
    case "Qvarid" :
      console.log("3", node.value);
      return new VarExp(node.value);

    case "integer" :
    case "String" :
      console.log("4", node.value);
      return new ValExp(node.value, node.type);

    default :
      throw Error("This expression type is not yet supported : " + node.type);
  }
}


/**
 * Given a "funlhs" node, returns the name of each variables a list of strings
 * @param {Node} node 
 * @returns {[String]}
 */
function getArgs(node){
  let output = [];
  // we skip first element because it's the name of the function
  for (let i = 1; i < node.childs.length; i ++){
    output.push(node.childs[i].value);
  }
  return output;
}

/**
 * Counts the number of aruments in a type declaration
 * @param {Node} node 
 * @returns {Integer}
 */
function countTypeArgs(node){
  if (node.childs.length === 0){
    return 1
  } else if (node.type === "type"){
    return 1 + countTypeArgs(node.childs[2]);
  } else {
    throw Error("Unsupported node in counting args : " + node.type);
  }
}