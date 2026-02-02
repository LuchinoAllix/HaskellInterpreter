import { Program } from "../objects/Program.js";
import { Exp, LambdaExp } from "../normalize/Exp.js";
import * as T from "./TypeO.js";
import { Context } from "./Context.js";
import { isNcommas } from "../eval/eval.js"

//--        File containing functions to type check the program             --//

// Init global context
let global_context = new Context();
global_context.initGlobal();

/**
 * Verifies that a given program type checks
 * This is the point of entry function for type checking
 * 
 * @param {Program} program
 * @returns {Boolean}
 */
export function typeCheck(program){
  resetGlobalContext();
  let main 
  for (let decl of program.normalizedForm){
    if (decl.name === "main"){
      main = decl;
    } else {
      global_context.add(decl.name, infer(decl.body, new Context()));
    }
  }

  // To ensure that main is the last decl to be type checked
  infer(main, new Context());
  
  return true;
}

/**
 * TODO
 * @param {Exp} exp
 * @param {Context} context
 * @returns {TypeO}
 */
function infer(exp, context){

  switch (exp.type){

    case 'functionApp' :
      return inferFunctionApp(exp, context);
    
    case 'var' :
      return inferVar(exp, context);
      
    case 'immediate' :
      return inferImmediate(exp);

    case 'let' :
      return inferLet(exp, context);
        
    case 'if' :
      return inferIf(exp, context);
          
    case 'case' :
      return inferCase(exp, context);
            
    case 'LambdaExp' :
      return inferLambda(exp, context);

    default :
      console.log(JSON.stringify(exp, null, 2));
      console.log(global_context);
      throw new Error("exp not yet managed in infer : " + exp.type);
  }
}


/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {?}
 */
function inferFunctionApp(exp, context){
  throw new Error("TODO");
}

/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferVar(exp, context){
  const type = lookupGlobalLocalContext(context, exp.name);
  return instantiate(type);
}

/**
 * Makes a builtin type from the immediate value's type
 * @param {Exp} exp 
 * @returns {T.TBuiltin}
 */
function inferImmediate(exp){
  return new T.TBuiltin(exp.valueType);
}

/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {?}
 */
function inferLet(exp, context){
  throw new Error("TODO");
}

/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {?}
 */
function inferIf(exp, context){
  throw new Error("TODO");
}

/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {?}
 */
function inferCase(exp, context){
  
  // Determine the type of the patterns (multiple for functions) 
  let argstype = exp.exps.map(x => infer(x, context));

  // Add the types of the pattern to the context
  let clone = context.clone();
  for (let i = 0; i < argstype.length; i ++){
    clone.add(exp.exps[i].name, argstype[i]);
  }

  let outputType = null;

  
  for (let branch of exp.branches){
    let patternsType = branch.args.map(x => infer(x, clone));
    if (check(argstype, patternsType, clone)){

      // If args and pattern have the same type, we add variables one to the 
      // context
      let clone2 = clone.clone();
      for (let i = 0; i < patternsType.length; i ++){
        if (branch.args[i].type === 'var'){
          clone2.add(branch.args[i].name, patternsType[i]);
        }
      }

      let branchTypeOutput = infer(branch.branchBody, clone2);

      // verify that branches have the same type 
      if (outputType === null){
        outputType = branchTypeOutput ;
      } else {
        check(outputType, branchTypeOutput, clone2);
      }
    } else {
      throw new Error("Pattern types on cases are different");
    }

  }

  return outputType;
  
}

/**
 * creates an arrow type from with a new metavar for the argument
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TArrow}
 */
function inferLambda(exp, context){
  let arg = T.freshMetavar()
  let clone = context.clone();
  clone.add(exp.namedArg.name, arg);
  return new T.TArrow(arg, infer(exp.body, clone));
}

/**
 * todo
 * @param {T.TypeO} type 
 * @returns {T.TypeO}
 */
function instantiate(type) {
  if (!type.isForAll()) {
    return type;
  }

  throw new Error("TODO");
}


/**
 * Verifies that two types are the same in a given context
 * @param {Type0} type1 
 * @param {Type0} type2 
 * @param {Context} context 
 */
function check(type1, type2, context){
  throw new Error("TODO");

}


function unify(){
  throw new Error("TODO");
}

function occursCheck(){
  throw new Error("TODO");
}

/**
 * Lookup but inside the global environment and a local one given
 * @param {Context} context 
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocalContext(context, name){
  let res = context.lookup(name);
  if (res !== undefined){
    return res;
  }
  res = global_context.lookup(name);  
  if (res !== undefined){
    return res;
  }
  throw new Error(name + " is undefined.");
}

/**
 * Allows to reset the global context
 * Remembers the commas function (tuples) because the context is reset at the 
 * start of each test, but the commas functions are added in normalisation 
 * ( before reset )
 * HELP : is this a good idea ? or should the context be reset after each test ?
 */
function resetGlobalContext(){
  let tmp_context = new Context();
  // going through each value in the env and keeping only ncommas functions
  for (let [key, value] of Object.entries(global_context.decls)){
    if (isNcommas(key) && key.length > 1){
      tmp_context.add(key, value);
    }
  }
  global_context = tmp_context;
  global_context.initGlobal();
}

/**
 * Allows to add to the global env from other files (used in normalisation) when
 * working on tuples to add the ncommas function before evaluation
 * @param {String} str 
 */
export function addNcommasToGlobalContext(str){
  global_context.addNcommas(str);
}
