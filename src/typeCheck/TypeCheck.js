import { Program } from "../objects/Program.js";
import { Exp } from "../normalize/Exp.js";
import * as T from "./TypeO.js";
import { Context } from "./Context.js";
import { isNcommas } from "../eval/eval.js"
import { newSub, Subs } from "./Substitution.js";

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
          
    default :
      check(exp, T.freshMetavar(), context);
      return //?
  }
}

/**
 * Throws error if type is not compatible
 * @param {Exp} exp 
 * @param {T.TypeO} type 
 * @param {Context} context 
 */
function check(exp, type, context){
  switch (exp.type){
    case 'LambdaExp' :
      //todo
    case 'case' :
      //todo
    default :
      return infer(exp, context);
  }
}

/**
 * Throws error if not compatible 
 * Side effect : modifies the metavar value 
 * @param {T.TypeO} type1 
 * @param {T.TypeO} type2 
 */
function unify(type1, type2){
  //todo
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


function check(exp, type, context){
  let new_type = infer(exp, context);
  return type == new_type;
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
