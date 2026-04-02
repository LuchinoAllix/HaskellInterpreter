import { Decl } from "./Decl.js";
import { Exp, VarExp, ImExp, FunctionApp, LetExp, CaseExp,
         LambdaExp, SpecialExp, makeFuncAppOfList, mkMTListExp} from "./Exp.js";
import { Program } from "../objects/Program.js";
import { Branch } from "./Branch.js";
import { Node } from "../objects/Node.js";
import * as T from '../typeCheck/TypeO.js';
import { Term } from "./Term.js";
import { Constr } from "./Constr.js";

//--     File containing functions for intermediary form transformation     --//

// FIXME : clearly not the best code in term of readability and safety
// one way to fix readability would be to not pass the individual line and
// column number to declaration, but a node and the constructor would handel it
// better
// for safety there should be more analysis of the nodes, many things are 
// assumed for which we have no garanty and only tests show us 

// priority of operations dictionnary, for swapping infix exp around
// https://www.haskell.org/onlinereport/decls.html (section 4.4.2)
// The order here is swapped compared to the doc
// Not all primitives are yet implemented so they do not appear here
// The fact that certain operators are not associative or left/right 
// associative is not implemented yet (HELP is this a priority ?)
const op_priority = {
  "==" : 3 ,
  "<" : 3 ,
  ">" : 3 ,
  "<=" : 3 ,
  ">=" : 3 ,
  "&&" : 3 ,
  "||" : 3 ,
  "!=" : 3 ,
  "*" : 1 ,
  "/" : 1 ,
  "+" : 2 ,
  "-" : 2 
}

let global_rte;
let prog;

/**
 * Start function to make the ast of a program into an intermediary form
 * for evaluation
 * @param {Program} program 
 * @returns {Boolean}
 */
export function normalizeStart(program, rte){
  global_rte = rte;
  prog = program;
  program.normalizedForm = normalizeRoot(program.AST);
  verifyBodyDecls(program.normalizedForm);
  return true;
}

/**
 * Converts the root of the AST into a list of term (declarations)
 * @param {Node} astRoot
 * @returns {[Term]}
 */
function normalizeRoot(astRoot){
  switch (astRoot.type){

    case "root" :
      return normalizeRoot(astRoot.childs[0]);

    case "body" :
      for (let node of astRoot.childs){
        if (! node.type.startsWith("layout")){
          return normalizeRoot(node);
        }
      }
      updateErrorInfo(astRoot);
      throw new Error("Malformed AST, body should have one non layout node.");

    //case "interactive" : 
    // TODO : Must do something different for interactive, 
    // because it takes only one exp or decl at a time

    case "topdecls" :
      let declList = []
      for (let node of astRoot.childs){
        if (node.type === "decl" 
         || node.type === "gendecl" 
         || node.type === "topdecl"){
          addDecl(declList, normalizeDecl(node));
        } else if (!node.type.startsWith(("layout"))){
          updateErrorInfo(node);
          throw new Error("Only declarations are allowed in program mode, not " 
            + node.type);
        }
      }
      return declList;

    default :
      // We suppose we only have the main declaration
      return [normalize(astRoot)];
  }
}

/**
 * Turn a node into a term
 * @param {Node} astRoot 
 * @returns {Term}
 */
function normalize(node){
  switch (node.type){
    case "decl" :
    case "gendecl" :
      return normalizeDecl(node);

    case "rhs" :
      // This is not the only rhs outcome, just the only one yet managed
      return normalizeExp(node.childs[1]);

    case "Integer":
    case "String" :
    case "Qconid" :
    case "infixexp" :
    case "fexp" :
    case "lexp" :
    case "aexp_" :
      return normalizeExp(node);
    
    default :
      console.log(JSON.stringify(node, null, 2));
      updateErrorInfo(node);
      throw new Error("This type of node is not yet managed by normalize : " 
        + node.type);
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
      return new Decl(name, normaliseTypeAnnotation(node.childs[2]), null, 
        node.childs[0].getInfo());
    } else { // We know it's a variable declaration
      return new Decl(name, normaliseTypeAnnotation(node.childs[2]), null, 
        node.childs[0].getInfo());
    } 
  } else if (node.type === "decl"){ // We know it's a branch declaration
    if (node.childs[0].type === "funlhs"){
      name = node.childs[0].childs[0].value;
      return new Decl(name, null,
        new Branch(getArgs(node.childs[0]), normalize(node.childs[1])),
        node.childs[0].getInfo());
      
    } else if (node.childs[0].childs === null){ 
      // We know it's a variable declaration
      name = node.childs[0].value;
      return new Decl(name, null, normalize(node.childs[1]),
        node.childs[0].getInfo());
    }
  } else if (node.type === "topdecl"){ // We know it's an ADT declaration
    if (node.childs[0].value === "data"){
      let named = normalizeSimpleType(node.childs[1]);
      let params = [];
      let exps = normalizeConstrs(node.childs[3], params);
      
      params = [...new Set(params)]; // to remove duplicates
      

      try {
        // slice to remove the name of type
        verifyOccurence(named.slice(1), params); 
      } catch(e) {
        updateErrorInfo(node);
        throw new Error(e);
      }
      
      return new Constr(named[0], exps, params,
        node.childs[0].getInfo());
    } else {
      updateErrorInfo(node.childs[0]);
      throw new Error(node.childs[0].value + " was given when expected data");
    }
  } else {
    updateErrorInfo(node);
    throw new Error(node.type + " was given when expected topdecl, gendecl " + 
      "or decl.");
  }
}

/**
 * Turns a simpleType (or tycon) node into the list of names of variables that
 * constitute it
 * maybe -> [maybe]
 * maybe a b -> [maybe, a, b]
 * 
 * @param {Node} node 
 * @returns {[String]}
 */
function normalizeSimpleType(node){
  if (node.type === "Tycon"){ return [node.value] ; }
  let names = [];
  for (let child of node.childs){
    names.push(child.value);
  }
  return names;
}

/**
 * Transforms the constrs node into a constr exp
 * @param {Node} node 
 * @param {[String]} params 
 * @returns {[Exp]}
 */
function normalizeConstrs(node, params){
  if (node.type === 'Conid'){ 
    return [new VarExp(child.value, child.getInfo())];
  }
  let types = [];
  for (let child of node.childs){
    if (child.value !== '|'){
      if (child.type === 'Conid'){
        types.push(new VarExp(child.value, child.getInfo()));
      } else if (child.type === 'constr'){
        types.push(normalizeConstr(child, params));
      } else {
        updateErrorInfo(child);
        throw new Error("Unhandeled case in Constrs");
      }
    }
  }
  return types;
}

/**
 * normalises a constr node (child of constrs) which is usually a combination 
 * of Conid, Qtycon, atype and '(' btype ')'
 * @param {Node} node 
 * @param {[String]} params 
 * @returns {Exp}
 */
function normalizeConstr(node, params){
  // we know we have at least more than one child
  // and first child must be Conid (name of constr) or 'special btype special'
  if (node.type === 'Qtycon' || node.type === 'Conid'){
    return new VarExp(node.value, node.getInfo()); 
  } else if (node.childs[0].value === "("){
    return normalizeConstr(node.childs[1], params);
  }
  let app = normalizeConstr(node.childs[0], params);
  for (let i = 1; i < node.childs.length; i ++){
    let arg;
    if (node.childs[i].type === 'Qtycon'){
      params.push(node.childs[i].value);
      arg = new VarExp(node.childs[i].value, node.childs[i].getInfo());
    } else {
      arg = normalizeConstr(node.childs[i], params);
    }
    app = new FunctionApp(app, arg);
  }
  return app;
}

/**
 * Verifies that all the params given appear in the constr by comparing the
 * list of the two
 * @param {[String]} named 
 * @param {[String]} params 
 */
function verifyOccurence(named, params){
  if (named.length === params.length){
    for (let i = 0; i < params.length; i ++){
      if (!named.includes(params[i])){
        throw new Error("Error in variables of ADT");
      }
    }
  } else {
    throw new Error("Error in variables of ADT");
  }
}

/**
 * Transforms a node of type declaration into the corresponding type 
 * (typeO object)
 * @param {Node} node
 * @returns {T.TypeO} 
 */
function normaliseTypeAnnotation(node){
    switch (node.type){

    case 'Qtycon' :
      if (node.value === "String"){ // desugariser String to [Char]
        return new T.TApp(new T.TBuiltin("List"), new T.TBuiltin("Char"));
      } else if (T.isABuiltin(node.value)){
        return new T.TBuiltin(node.value);
      }
      // We suppose the constr exists, if not type inference will yield an error
      return new T.TConstrType(node.value); 

    case 'type' :
      if (node.childs[1].value === '->' ){
        return new T.TArrow(
          normaliseTypeAnnotation(node.childs[0]),
          normaliseTypeAnnotation(node.childs[2])
        );
      } else {
        updateErrorInfo(node);
        throw new Error("Unhandeled case of type annotation with type node");
      }

    case 'atype' :
     if (node.childs[0].value === '['){
       if (node.childs.length !== 3){
        updateErrorInfo(node);
        throw new Error("Mismanaged case of atype node (length !== 3");
        } else {
          return new T.TApp(
            new T.TBuiltin("List"), normaliseTypeAnnotation(node.childs[1]));
        }
     } else if (node.childs[0].value === '('){
        if (node.childs.length === 3){
          return new T.TApp(
            new T.TBuiltin("Tuple"), normaliseTypeAnnotation(node.childs[1]));
        } 
        let to = normaliseTypeAnnotation(node.childs[node.childs.length - 2]);
        node.childs.splice(node.childs.length - 3, 2);
        return new T.TApp(normaliseTypeAnnotation(node), to);
      } else {
        updateErrorInfo(node);
        throw new Error("Mismanaged case of atype node");
      }

    case 'btype' :
      let func = normaliseTypeAnnotation(node.childs[0]);
      let args = node.childs.slice(1).map(x => normaliseTypeAnnotation(x));
      return T.makeTAppOfList(func, args);

    case 'Special' :
      if (node.value === '()'){
        return new T.TUnit();
      } else {
        updateErrorInfo(node);
        throw new Error("unhandeled case of special type annotation : " 
          + node.value);
      }

    default :
        updateErrorInfo(node);
        throw new Error("unhandeled case of type annotation : " + node.type);
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
  updateErrorInfo(node);
  throw new Error("No type found in gendecl");
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
    let i = declList.length - 1;

    if (declList[i].name === decl.name){ // If declaration already exists

      if (declList[i].typeAnnotation !== null && 
          decl.typeAnnotation !== null){
        updateErrorInfoExp(decl.info);
        throw new Error("Type for "+  declList[i].name + " is already defined");
      }

      if (declList[i].typeAnnotation === null && 
          decl.typeAnnotation !== null){
        updateErrorInfoExp(decl.info);
        throw new Error("Type annotation should come before " + 
                    "definition : " + decl.name);
      }

      if (i !== declList.length - 1){
        // We suppose that the declaration should be the last one
        updateErrorInfoExp(decl.info);
        throw new Error("Declarations on multiple lines should follow one " + 
          "another");
      }

      if (decl.body.type === "LambdaExp"){
        declList[i].addBranchDef(decl.getCase().branches[0]);
        return ;
      } else {
        if (declList[i].isAnnotated() && !decl.isAnnotated()){
          declList[i].body = decl.body;
          return ;
        } else {
          updateErrorInfoExp(decl.info)
          throw new Error("Cannot redefine variable : " + decl.name);
        }
      }
    }
    declList.push(decl);
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
      return normaliseInfixexp(node);

    case "fexp" :
      return normalizeCurr(node);
    
    case "aexp_" : 
      return normaliseAexp_(node);

    case "Qvarid" :
      return new VarExp(node.value, node.getInfo());

    case "Integer" :
      return new ImExp(parseInt(node.value), node.type, 
        node.getInfo());

    case "String" :
      return charListToFuncApp(makeCharListOfString(node));

    case "Special" :
    case "reservdop" :
      if (node.value === "[]"){
        return mkMTListExp(node.getInfo());
      } else {
        updateErrorInfo(node);
        throw new Error("This kind of reservdop is not yet supported :" +
          node.value);
      }

    case "apat" :
    case "pat" :
    case "lpat" :
      return normalisePattern(node);

    case "Qconid" :
      return normalizeQconid(node);

    case "lexp" :
      return normaliseLexp(node);

    case "reservdid" :
      switch (node.value){
        case "_" :
          return new SpecialExp("_", node.getInfo());
        default :
          updateErrorInfo(node);
          throw new Error("This kind of reservdid is not yet supported :" +
            node.value);
      }

    case "stmt" :
      if (node.childs.length === 2){
        return normalizeExp(node.childs[0]);
      } else if (node.childs.length === 3 && node.childs[0].value === "let"){
        return normalizeLet(node);
      } else {
        updateErrorInfo(node);
        throw new Error("stmt with this many childs is not yet supported : " +
         node.childs.length);
      }

    default :
      updateErrorInfo(node);
      throw new Error("This expression type is not yet supported : " +
         node.type);
  }
}

/**
 * Normalises a infix expression, usually composed of 'arg op arg'
 * or 'op arg' in case of neg operator 
 * @param {Node} node 
 * @returns {Exp}
 */
function normaliseInfixexp(node){
  if (node.childs.length >= 3){
    if (node.childs[1].value === ":"){
      return makeFuncAppOfList(
        new VarExp(":", node.childs[1].getInfo()), 
        [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);
    }
  }

  // based on the fact that the second element of an infixexp is the function 
  
  if (node.childs.length === 3){
    if (node.childs[2].type === "infixexp"){
      // If we have two operations, we need to swap the order of eval if need be
      if (node.childs[2].childs[1].type === "Qvarsym"){
        let op1 = op_priority[node.childs[1].value];
        let op2 = op_priority[node.childs[2].childs[1].value];
        
        if (op1 === undefined){
          updateErrorInfo(node.childs[1]);
          throw new Error("order of priority not defined for this op : " + 
            node.childs[1].value);
        } if (op2 === undefined){
          updateErrorInfo(node.childs[2].childs[1]);
          throw new Error("order of priority not defined for this op : " + 
            node.childs[2].childs[1].value);
        }
        
        if (op1 < op2){ return normalisePriority(node); }

      } else {
        throw new Error("Unhandelded case of middle node for infixexp");
      }

    } else if (node.childs[1].type === "qvarop"){ 
      // infix function call (in backticks)
      if (node.childs[1].childs[0].value === "`" && 
          node.childs[1].childs[2].value === "`"){
        return makeFuncAppOfList(
          new VarExp(node.childs[1].childs[1].value, 
          node.childs[1].childs[1].getInfo()),
          [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);
      }
    }

    return makeFuncAppOfList(
      new VarExp(node.childs[1].value, 
        node.childs[1].getInfo()),
      [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);

  } else if (node.childs.length === 2 && node.childs[0].value === '-'){
    return new FunctionApp(new VarExp('neg', 
      node.childs[1].getInfo()),
      normalizeExp(node.childs[1]));

  } else {
    updateErrorInfo(node);
    throw new Error("Unhandelded case of infixexp");
  }
}

/**
 * Normalises an infixe exp but swaps arround the nodes according to priority
 * of operators
 * the logic is like :
 * 
 *      *                      +
 *    /    \                 /   \
 *  exp1    +      ->       *    exp3
 *        /   \           /   \
 *      exp2  exp3      exp1   exp2
 * 
 * @param {Node} node 
 * @returns {Exp}
 */
function normalisePriority(node){
  let right = node.childs[2];
  let right_left = node.childs[2].childs[0];
  right.childs[0] = node;
  right.childs[0].childs[2] = right_left; 
  return makeFuncAppOfList(
    new VarExp(right.childs[1].value, 
      right.childs[1].getInfo()),
    [normalizeExp(right.childs[0]), normalizeExp(right.childs[2])]);
}

/**
 * Normalises pattern matching node (pat or apat)
 * @param {Node} node 
 * @returns {Exp}
 */
function normalisePattern(node){
  if (node.type === 'lpat'){
    return new makeFuncAppOfList(
      new VarExp(node.childs[0].value, 
        node.childs[1].getInfo()),
      node.childs.slice(1).map(x => normalizeExp(x)));
  } else if (node.childs[2].value === ","){
    if (node.childs[0].value === "("){
      return normalizeTuple(node);
    } else if (node.childs[0].value === "["){
      return normalizeList(node);
    } 
  } else if (node.childs[0].value === "(" && node.childs.length === 3){
    return normalizeExp(node.childs[1]);      
  } else if (node.childs[1].value === ":" && node.childs.length === 3){
    return makeFuncAppOfList(
      new VarExp(":", node.childs[1].getInfo()),
      [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);
  } else if (node.childs[0].value === "[" && node.childs.length === 3){
    return normalizeList(node);
  } else {
    updateErrorInfo(node);
    throw new Error("unhandelded case in pat or apat : " + node);
  }
}

/**
 * Makes a lists of charVal nodes from a string node
 * @param {Node} node 
 * @returns {[ImExp]} 
 */
function makeCharListOfString(node){
  let charlist = node.value.split("");
  let expCharList = []
  charlist.shift(); // remove " in first position
  charlist.pop();  // remove " in last position
  let pos = 0;
  for (let char of charlist){
    expCharList.push(new ImExp(char, "Char", 
      [node.startLine, node.startCol + pos, 
       node.endLine, node.startCol + pos + 1]));
    pos ++;
  }
  return expCharList;
}

/**
 * Turns a list of chars ImExp into the function app of (:)
 * @param {[ImExp]} charList 
 * @returns {FunctionApp}
 */
function charListToFuncApp(charList){
  if (charList.length === 0){
    return mkMTListExp(null);
  }
  let arg1 = charList[0];
  let arg2 = charListToFuncApp(charList.slice(1));
  return makeFuncAppOfList(new VarExp(":"), [arg1, arg2]);
}

/**
 * normalises an aexp node, into a list, tuple or currified func app
 * @param {Node} node 
 * @returns {Exp}
 */
function normaliseAexp_(node){
  // we assume aexp is not a tuple or list
  if (node.childs.length === 3 && node.childs[0].value !== "["){
    return normalizeExp(node.childs[1]);
  } else if (node.childs[0].value === "("){
    if (node.childs[2].value === ","){
      return normalizeTuple(node);
    }
    return normalizeCurr(node);
  } else if (node.childs[0].value === "["){
    return normalizeList(node);
  } else {
    updateErrorInfo(node.childs[0]);
    throw new Error("Unknow node starting in aexp_ childs : " + 
      node.childs[0].value);
  }
}

/**
 * Normalises a Lexp node depending on its content
 * @param {Node} node 
 * @returns {Exp}
 */
function normaliseLexp(node){
  switch (node.childs[0].value) {
    case "\\" :
      return normalizeLambda(node); 
    case "let" :
      return normalizeLet(node);
    case "if" :
      return normalizeIf(node);
    case "case" :
      return normalizeCase(node);
    case "do" :
      return normalizeDo(node);
    default :
      updateErrorInfo(node);
      throw new Error("This kind of lexp is not yet supported :" +
        node.childs[0].value);
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
 * Transformes a Qconid node into the according exp
 * @param {Node} node 
 * @returns {ImExp}
 */
function normalizeQconid(node){
  switch (node.value){
    case "False" :
      return new ImExp(false, "Boolean", node.getInfo());
    case "True" :
      return new ImExp(true, "Boolean", node.getInfo());
    default :
      // Algebraic data types
      return new VarExp(node.value, node.getInfo());
  }
}



/**
 * Normalises a case node parents (lexp) into the normal form (caseExp)
 * @param {Node} node
 * @returns {CaseExp} 
 */
function normalizeCase(node){
  let exp = normalizeExp(node.childs[1]);
  let branches = [];
  if (node.childs[4].type === "alts"){
    for (let child of node.childs[4].childs){
      if (!child.type.startsWith("layout")){
        // We suppose we only have alt nodes
        let branch = new Branch([normalizeExp(child.childs[0])], 
        normalizeExp(child.childs[2]));
        branches.push(branch);
      }
    }
  } else if (node.childs[4].type === "alt"){ // not pretty but it works
    let child = node.childs[4];
    let branch = new Branch([normalizeExp(child.childs[0])], 
                             normalizeExp(child.childs[2]));
    branches.push(branch);
  } else {
    throw new Error("Unhandeled node in case : " + node.childs[4].type);
  }
  return new CaseExp([exp], branches, node.getInfo());
}

/**
 * Turns a lexp node of if into a CaseExp object 
 * @param {Node} node
 * @returns {CaseExp} 
 */
function normalizeIf(node){
  let cnt = 0;
  let elems = [null, null, null];
  for (let child of node.childs){
    if (child.type !== "reservdid" && !(child.type.startsWith("layout"))){
      elems[cnt] = normalizeExp(child);
      cnt += 1;
      if (cnt === 3){ break; }
    }
  }
  return new CaseExp(
    [elems[0]],
    [ new Branch([new ImExp(true, "Boolean")], elems[1]),
      new Branch([new ImExp(false, "Boolean")], elems[2])],
    node.getInfo());
}

/**
 * Turns a lexp node of a let into an letExp object
 * If the let is inless, the body element is null
 * Works on the fact that the lexp childs have the structure :
 * reservdid "let" | decls | reservdid "in" | exp
 * @param {Node} node
 * @returns {LetExp} 
 */
function normalizeLet(node){
  let decls = [];
  for (let child of node.childs[1].childs){
    if (! child.type.startsWith("layout") && child.type !== "Special"){
      decls.push(normalizeDecl(child));
    }
  }
  let inexp;
  if (node.childs.length === 3){
    inexp = null;
  } else {
    inexp = normalizeExp(node.childs[3]);
  }
  return new LetExp(decls, inexp, node.getInfo());
}

/**
 * Turns a lambda lexp into a LambdaExp object
 * @param {Node} node
 * @returns {LambdaExp} 
 */
function normalizeLambda(node){
  let args = [];
  let func, reserdopCnt = 0 ;
  if (node.childs[0].value === "\\"){
    for (let child of node.childs){
      if (child.type === "reservdop"){
        reserdopCnt += 1;
      } else if (reserdopCnt === 1){
        args.push(normalizeExp(child));
      } else if (reserdopCnt === 2){
        func = (normalizeExp(child));
      } else {
        console.log(node)
        updateErrorInfo(node);
        throw new Error("Mismanagement of anonymous function");
      }
    }
    return new LambdaExp(args, func, node.getInfo());
  } else {
    updateErrorInfo(node);
    throw new Error("Mismanagement of lexp node")
  }
}

/**
 * Transforms the parent of a do node (presumably a lexp) into the intermidiary
 * form
 * @param {Node} node
 * @returns {FunctionApp} 
 */
function normalizeDo(node){
  let stmts = node.childs[2];
  if (stmts.type === "stmts"){
    if (stmts.childs.length === 1){
      return normalizeExp(stmts.childs[0]);
    } else if (stmts.childs[0].type === "stmt" && 
      stmts.childs[0].childs.length > 2){
      if (stmts.childs[0].childs[1].value === "<-" && 
        stmts.childs[0].childs.length === 4){
        // we have to bind the variable
        let app = new FunctionApp(new VarExp(">>=", node.getInfo()), 
          normalizeExp(stmts.childs[0].childs[2]));
        let lambda = new LambdaExp([normalizeExp(stmts.childs[0].childs[0])],
                         normalizeExp(stmts.childs[1]));
        node.childs[2].childs = node.childs[2].childs.slice(2);
        if (node.childs[2].childs.length === 0){ 
          return new FunctionApp(app, lambda);
        } else { 
          // if we still have at least one more statement to manage we need
          // to add a >> call in the lambda
        return new FunctionApp(app,
          new LambdaExp([lambda.namedArg], new FunctionApp(
            new FunctionApp(new VarExp(">>", node.getInfo()), 
              lambda.body), normalizeDo(node)))); 
        }
      }
    }
    let n1;
    if (stmts.childs[0].childs[0].type === "fexp"){
      n1 = normalizeExp(stmts.childs[0].childs[0]);
    } else if (stmts.childs[0].childs[0].type === "reservdid"){
      n1 = normalizeExp(stmts.childs[0]);
    } else if (stmts.childs[0].childs[0].type === "lexp" &&
      stmts.childs[0].childs.length === 2){ 
      // we suppose the second child is layout ';'
      n1 = normalizeExp(stmts.childs[0].childs[0]);
    } else {
      updateErrorInfo(node);
      throw new Error("unhandelded case in do normalisation");
    }
    let app1 = new FunctionApp(new VarExp(">>", node.getInfo()), n1);
    node.childs[2].childs = node.childs[2].childs.slice(1);
    return new FunctionApp(app1, normalizeDo(node));
  } 
  
  return normalizeExp(node.childs[2]);

}

/**
 * Transforms a lexp node that represents an anonymous function into
 * the corresponding exp form.
 * We assume the lexp represents an anonymous function because it is 
 * the child of an aexp_ that itself is the first child of an fexp,
 * in other cases the first child of an fexp is the name of the function
 * we assume that all other cases lead to anonymous functions
 * @param {Node} node 
 * @returns {FunctionApp}
 */
function normalizeAfuncApp(node, givenArgs){
  return makeFuncAppOfList(normalizeExp(node), givenArgs);
}


/**
 * Transforms an aexp_ node who's first child is "(" (presumably) into a tuple
 * expression object (a call to (,) function)
 * We suppose we get a node with at least 5 childs
 * @param {Node} node 
 * @returns {FunctionApp}
 */
function normalizeTuple(node){
  let args = [] ;
  for (let i = 1; i < node.childs.length-1; i += 2){
    args.push(normalizeExp(node.childs[i]));
  }
  if (args.length < 2){
    throw new Error("Not enough elements given for tuple");
  }
  let func_name = ",".repeat(args.length-1);
  if (args.length > 2){ // Update the global env
    global_rte.ctx.addNcommas(func_name);
    global_rte.env.addNcommas(func_name);
  }
  return makeFuncAppOfList(new VarExp(func_name, 
    node.getInfo()), args);
}

/**
 * Transforms an aexp_ node who's first child is "[" (presumably) into a list
 * expression object (a call to (:) function)
 * @param {Node} node 
 * @returns {FunctionApp}
 */
function normalizeList(node){
  let arg1, arg2;
  if (node.childs.length < 3){
    throw new Error("Mismanagement of aexp_ node in normalise list");
  } else if (node.childs.length === 3){
    arg1 = normalizeExp(node.childs[1]);
    arg2 = mkMTListExp(null);
  } else { // we suppose we have an odd number of childs > 3
    arg1 = normalizeExp(node.childs[1]);
    node.childs.splice(1,2); // removing the first value child and the comma 
    arg2 = normalizeList(node);
  }
  return makeFuncAppOfList(new VarExp(":", node.getInfo()),
   [arg1, arg2]);
}

/**
 * Manages curry cases like :
 * (+ 1)
 * ((+ 1) 2)
 * lambda expressions calls
 * @param {Node} node 
 * @returns {Exp}
 */
function normalizeCurr(node){
  let args = [];
  let plus = 0;

  if (node.childs[0].type === "Special"){
    plus = 1;
  }

  for (let i = 1 + plus; i < node.childs.length - plus; i++){
    args.push(normalizeExp(node.childs[i]))
  }

  if(!(node.childs[plus].childs === null || 
       node.childs[plus].childs.length === 0)){
    if (node.childs[plus].childs[1].type === "lexp"){
      return normalizeAfuncApp(node.childs[plus].childs[1], args);
    } else {
      return makeFuncAppOfList(normalizeExp(node.childs[plus]), args);
    }
  }

  return makeFuncAppOfList(new VarExp(node.childs[plus].value,
    node.childs[plus].getInfo()), args);
}

/**
 * Updates the program to tell where the indentation error occured
 * @param {Node} node
 */
function updateErrorInfo(node){
  if (node.startCol === null){
    return updateErrorInfoExp(node.getMinMaxLineCol());
  }
  prog.startLine = node.startLine ;
  prog.startCol = node.startCol ;
  prog.endLine = node.endLine ;
  prog.endCol = node.endCol ;
}

/**
 * Updates the program to tell where the indentation error occured
 * @param {[Integer]} infos
 */
export function updateErrorInfoExp(infos){
  prog.startLine = infos[0] ;
  prog.startCol = infos[1] ;
  prog.endLine = infos[2] ;
  prog.endCol = infos[3] ;
}

/**
 * todo
 * @param {*} normalizedForm 
 */
function verifyBodyDecls(normalizedForm){
  for (let decl of normalizedForm){
    if (decl.body === null){
      updateErrorInfoExp(decl);
      throw new Error("This declaration does not have a body : " + decl.name);
    }
  }
}
