import { Decl, typeFuncDecl, typeVarDecl, branchFuncDecl, 
         branchVarDecl } from "./Decl.js";
import { Exp, VarExp, ValExp, FunctionApp, IfTerm, LetTerm, CaseTerm,
         ListPatternTerm } from "./Exp.js";
import { Program } from "../Program.js";

//--     File containing functions for intermediary form transformation     --//


/**
 * Start function to make the ast of a program into a intermediary form
 * for evaluation
 * @param {Program} program 
 * @returns {Boolean}
 */
export function normalizeStart(program){
  program.normalizedForm = normalize(program.AST);
  return true;
}


/**
 * Turn a node into a term
 * @param {Node} astRoot 
 * @returns {Term}
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

    case "integer":
    case "String" :
    case "Qconid" :
    case "infixexp" :
      return normalizeExp(astRoot);
       
    
    default :
      throw Error("This type of node is not yet managed by normalise : " 
        + astRoot.type);
    

  }
}


/**
 * turn a decl or gendecl node into a Decl object
 * @param {Node} node 
 * @returns {Decl}
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
 * Unifies function and variable declaration (as in if declared on multiple 
 * lines, it will join de definitions (type and expression))
 * (variables are listed because they can have a type annotation)
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
 * Turns an expression node into a Exp type object
 * @param {Node} node 
 * @returns {Exp}
 */
function normalizeExp(node){
  switch (node.type){
    
    case "infixexp" :
      // based on the fact that the second element of an infixexp is the 
      // function 
      return new FunctionApp(node.childs[1].value, 
                             [normalizeExp(node.childs[0]),
                              normalizeExp(node.childs[2])]);

    case "fexp" :
      return new FunctionApp(node.childs[0].value, 
                             [normalizeExp(node.childs[1])]);

    case "aexp_" :
      if (node.childs.length === 3){
        return normalizeExp(node.childs[1]);
      } else {
        throw Error("Aexp_ expression that is not ( 1elem ) is not yet " + 
          "supported : " + node);
      }
    
    case "Qvarid" :
      return new VarExp(node.value);

    case "integer" :
    case "String" :
    case "Special" :
    case "reservdop" :
      return new ValExp(node.value, node.type);

    case "apat" :
    case "pat" :
      let apat = [];
      for (let child of node.childs){
        apat.push(normalizeExp(child));
      }
      return new ListPatternTerm(apat);

    case "Qconid" :
      return normaliseQconid(node);

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
    let tmp = normalizeExp(node.childs[i]);
    tmp.metatype = "PATTERN";
    output.push(tmp);
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

/**
 * Transformes a Qconid node into a valExp
 * for the moment only manages False and True because I don't know what
 * are the other Qconid values (will be changed when we meet them)
 * @param {Node} node 
 * @returns {ValExp}
 */
function normaliseQconid(node){
  switch (node.value){
    case "False" :
    case "True" :
      return new ValExp(node.value, "Boolean");
    
    default :
      throw Error("Qconid not yet managed : " + node.value);
  }
}