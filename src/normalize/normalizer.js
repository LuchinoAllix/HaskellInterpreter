import { Decl, FuncDecl, VarDecl} from "./Decl.js";
import { Exp, VarExp, ValExp, FunctionApp, IfExp, LetExp, CaseExp,
         LambdaExp, SpecialExp, makeFuncAppOfList} from "./Exp.js";
import { Program } from "../objects/Program.js";
import { Branch } from "./Branch.js";
import { Node } from "../objects/Node.js";

//--     File containing functions for intermediary form transformation     --//

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
 * // FIXME : can return a term OR a list of term
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
      throw new Error("Malformed AST, body should have one non layout node.");

      //case "interactive" : 
      // TODO : Must do something different for interactive, 
      // because it takes only one exp or decl at a time

      case "topdecls" : 
      let declList = []
      for (let node of astRoot.childs){
        if (node.type === "decl" || node.type === "gendecl"){
          addDecl(declList, normalizeDecl(node));
        } else if (!node.type.startsWith(("layout"))){
          throw new Error("Only declarations are allowed in program mode, not" + 
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
      throw new Error("This type of node is not yet managed by normalize : " 
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
      return new FuncDecl(name, node.childs[2], null, 
        [node.childs[0].line, node.childs[0].column]);
    } else { // We know it's a variable declaration
      return new VarDecl(name, node.childs[2], null, 
        [node.childs[0].line, node.childs[0].column]);
    } 
  } else if (node.type === "decl"){ // We know it's a branch declaration
    if (node.childs[0].type === "funlhs"){
      name = node.childs[0].childs[0].value;
      if (isDeclFunc(node)){ // We know it's a function declaration
        return new FuncDecl(name, null,
          new Branch(getArgs(node.childs[0]), normalize(node.childs[1])),
          [node.childs[0].line, node.childs[0].column]);
      } else {
        throw new Error("Malformed AST");
      }
    } else if (node.childs[0].childs === null){ 
      // We know it's a variable declaration
      name = node.childs[0].value;
      return new VarDecl(name, null, normalize(node.childs[1]),
        [node.childs[0].line, node.childs[0].column]);
    }
    } else {
    throw new Error(node.type + " was given when expected gendecl or decl.");
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
  throw new Error("No type found in gendecl");
}

/**
 * Determines if a node of type 'decl' is a function or variable declaration
 * @param {Node} node 
 * @returns {Boolean}
 */
function isDeclFunc(node){
  return (node.childs[0].type === "funlhs");
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

      if (declList[i].typeAnnotation !== null && decl.typeAnnotation !== null){
        throw new Error("Type for "+  declList[i].name + " is already defined");
      }

      if (declList[i].typeAnnotation === null && decl.typeAnnotation !== null){
        throw new Error("Type annotation should come before " + 
                    "definition" + decl);
      }

      if (i !== declList.length - 1){
        // We suppose that the declaration should be the last one
        throw new Error("Declarations on multiple lines should follow one " + 
          "another");
      } 

      if(decl.isVar()){
        if (declList[i].isAnnotated() && !decl.isAnnotated()){
          declList[i].def = decl.def;
          return ;
        } else {
          throw new Error("Cannot redefine variable : " + decl.name);
        }
      
      } else if (decl.isFunc()){
        declList[i].addBranchDef(decl.getCase().branches[0]);
        return ;
      
      } else {
        throw new Error("A declaration other than a function or variable was " +
          "given to addDecl " + decl.type);
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
      return new VarExp(node.value, [node.line, node.column]);

    case "integer" :
      return new ValExp(parseInt(node.value), node.type, 
        [node.line, node.column]);

    case "String" :
      return charListToFuncApp(makeCharListOfString(node));

    case "Special" :
    case "reservdop" :
      return new ValExp(node.value, node.type, [node.line, node.column]);

    case "apat" :
    case "pat" :
      return normalisePattern(node);

    case "Qconid" :
      return normalizeQconid(node);

    case "lexp" :
      return normaliseLexp(node);

    case "reservdid" :
      switch (node.value){
        case "_" :
          return new SpecialExp("_", [node.line, node.column]);
        default :
          throw new Error("This kind of reservdid is not yet supported :" +
            node.value);
      }

    case "stmt" :
      if (node.childs.length === 2){
        return normalizeExp(node.childs[0]);
      } else if (node.childs.length === 3 && node.childs[0].value === "let"){
        return normalizeLet(node);
      } else {
        throw new Error("stmt with this many childs is not yet supported : " +
         node.childs.length);
      }

    default :
      throw new Error("This expression type is not yet supported : " +
         node.type);
  }
}

/**
 * todo
 * @param {Node} node 
 * @returns {Exp}
 */
function normaliseInfixexp(node){
  if (node.childs.length >= 3){
    if (node.childs[1].value === ":"){
      return makeFuncAppOfList(
        new VarExp(":", [node.childs[1].line, node.childs[1].column]), 
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
          throw new Error("order of priority not defined for this op : " + 
            node.childs[1].value);
        } if (op2 === undefined){
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
          [node.childs[1].childs[1].line, node.childs[1].childs[1].column]),
          [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);
      }
    }

    return makeFuncAppOfList(
      new VarExp(node.childs[1].value, 
        [node.childs[1].line, node.childs[1].column]),
      [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);

  } else if (node.childs.length === 2 && node.childs[0].value === '-'){
    return new FunctionApp(new VarExp('neg', 
      [node.childs[1].line, node.childs[1].column]),
      normalizeExp(node.childs[1]));

  } else {
    throw new Error("Unhandelded case of infixexp");
  }
}

/**
 * todo
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
      [right.childs[1].line, right.childs[1].column]),
    [normalizeExp(right.childs[0]), normalizeExp(right.childs[2])]);
}

/**
 * todo
 * @param {Node} node 
 * @returns {Exp}
 */
function normalisePattern(node){
  if (node.childs[2].value === ","){
    if (node.childs[0].value === "("){
      return normalizeTuple(node);
    } else if (node.childs[0].value === "["){
      return normalizeList(node);
    } 
  } else if (node.childs[0].value === "(" && node.childs.length === 3){
    return normalizeExp(node.childs[1]);      
  } else if (node.childs[1].value === ":" && node.childs.length === 3){
    return makeFuncAppOfList(
      new VarExp(":", [node.childs[1].line, node.childs[1].column]),
      [normalizeExp(node.childs[0]), normalizeExp(node.childs[2])]);
  } else if (node.childs[0].value === "[" && node.childs.length === 3){
    return normalizeList(node);
  } else {
    throw new Error("unhandelded case in pat or apat : " + node);
  }
}

/**
 * todo
 * @param {Node} node 
 * @returns {[ValExp]} 
 */
function makeCharListOfString(node){
  let charlist = node.value.split("");
  let expCharList = []
  charlist.shift(); // remove " in first position
  charlist.pop();  // remove " in last position
  let pos = 0;
  for (let char of charlist){
    expCharList.push(new ValExp(char, "Char", 
      [node.line, node.column + pos]));
    pos ++;
  }
  return expCharList;
}

/**
 * Turns a list of chars valexp into the function app of (:)
 * @param {[ValExp]} charList 
 * @returns {FunctionApp}
 */
function charListToFuncApp(charList){
  if (charList.length === 0){
    return new ValExp("[]", "Special");
  }
  let arg1 = charList[0];
  let arg2 = charListToFuncApp(charList.slice(1));
  return makeFuncAppOfList(new VarExp(":"), [arg1, arg2]);
}

/**
 * todo
 * @param {Node} node 
 * @returns {Exp}
 */
function normaliseAexp_(node){
  // we assume aexp ( ? ) is not a tuple or list
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
    throw new Error("Unknow node starting in aexp_ childs : " + 
      node.childs[0].value);
  }
}

/**
 * todo
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
 * Counts the number of arguments in a type declaration
 * @param {Node} node 
 * @returns {Integer}
 */
function countTypeArgs(node){
  if (node.childs.length === 0){
    return 1
  } else if (node.type === "type"){
    return 1 + countTypeArgs(node.childs[2]);
  } else {
    throw new Error("Unsupported node in counting args : " + node.type);
  }
}

/**
 * Transformes a Qconid node into a valExp
 * for the moment only manages False and True because I don't know what
 * are the other Qconid values (will be changed when we meet them)
 * @param {Node} node 
 * @returns {ValExp}
 */
function normalizeQconid(node){
  switch (node.value){
    case "False" :
      return new ValExp(false, "Boolean", [node.line, node.column]);
    case "True" :
      return new ValExp(true, "Boolean", [node.line, node.column]);
    default :
      throw new Error("Qconid not yet managed : " + node.value);
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
        //verifyNoRedef(branch, []);
        branches.push(branch);
      }
    }
  } else if (node.childs[4].type === "alt"){ // not pretty but it works
    let child = node.childs[4];
    let branch = new Branch([normalizeExp(child.childs[0])], 
                             normalizeExp(child.childs[2]));
    //verifyNoRedef(branch, []);
    branches.push(branch);
  } else {
    throw new Error("Unhandeled node in case : " + node.childs[4].type);
  }
  return new CaseExp([exp], branches, [node.line, node.column]);
}

/**
 * Turns a lexp node of if into an IfExp object 
 * @param {Node} node
 * @returns {IfExp} 
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
  return new IfExp(elems[0], elems[1], elems[2], [node.line, node.column]);
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
  return new LetExp(decls, inexp, [node.line, node.column]);
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
        throw new Error("Mismanagement of anonymous function");
      }
    }
    return new LambdaExp(args, func, [node.line, node.column]);
  } else {
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
        let app = new FunctionApp(new VarExp(">>=", [node.line, node.column]), 
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
            new FunctionApp(new VarExp(">>", [node.line, node.column]), 
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
      throw new Error("unhandelded case in do normalisation")
    }
    let app1 = new FunctionApp(new VarExp(">>", [node.line, node.column]), n1);
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
  return makeFuncAppOfList(new VarExp(",".repeat(args.length-1), 
    [node.line, node.column]), args);
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
    arg2 = new ValExp('[]','Special');
  } else { // we suppose we have an odd number of childs > 3
    arg1 = normalizeExp(node.childs[1]);
    node.childs.splice(1,2); // removing the first value child and the comma 
    arg2 = normalizeList(node);
  }
  return makeFuncAppOfList(new VarExp(":", [node.line, node.column]),
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
    [node.childs[plus].line, node.childs[plus].column]), args);
}
