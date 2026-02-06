import { Program } from "../objects/Program.js";
import { Exp } from "../normalize/Exp.js";
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
  let mainType = infer(main.body, new Context());
  //todo add verification on main type IO
  
  return true;
}

/**
 * Determines the type of an expression in a given context
 * @param {Exp} exp
 * @param {Context} context
 * @returns {TypeO}
 */
function infer(exp, context){

  switch (exp.type){

    case 'functionApp' :
      return inferFunctionApp(exp, context);
    
    case 'var' :
      return lookupGlobalLocalContext(context, exp.name);
      
    case 'immediate' :
      return inferImmediate(exp);

    case 'let' :
      return inferLet(exp, context);
        
    case 'if' :
      return inferIf(exp, context);
          
    default :
      // #HELP is this the way to go for default ?
      let res = T.freshMetavar();
      check(exp, res, context);
      return res;
  }
}

/**
 * Function to verify that an expression has a given type, if not throws error
 * Side effect : modifies the metavar's value 
 * @param {Exp} exp 
 * @param {T.TypeO} type 
 * @param {Context} context 
 */
function check(exp, type, context){
  switch (exp.type){
    case 'LambdaExp' :

      let from = T.freshMetavar();
      let to = T.freshMetavar();

      type.setVal(new T.TArrow(from, to)); //#HELP should this be unify ?
      let clone = context.clone();
      clone.add(exp.namedArg.name, from); 
      check(exp.body, to, clone);

      break;

    case 'case' :

      // Args of the case (multiple for functions)

      let argsType = [];

      for (let i = 0; i < exp.exps.length; i ++){
        argsType.push(T.freshMetavar());
        check(exp.exps[i], argsType[i], context); 
      }

      for (let branch of exp.branches){
        let branchCtx = context.clone();
        checkPatterns(branch.args, argsType, branchCtx);
        check(branch.branchBody, type, branchCtx);
      }

      break;

    default :
      // #HELP is this the way to go for default ?
      unify(infer(exp, context), type);
  }
}

/**
 * Unifies two types, for example :
 *     - we have (a -> a) and int
 *     - therefore a must be type int (since application)
 *     - thus return type will also be int (the metavar a's value will be 
 *       updated)
 * 
 * Throws error if not compatible 
 * Side effect : modifies the metavar value 
 * @param {T.TypeO} t1 
 * @param {T.TypeO} t2 
 */
function unify(t1, t2){
  
  if(t1.isMetavar()){
    t1 = t1.resolve();
  }

  if (t2.isMetavar()){
    t2 = t2.resolve();
  }

  if(t1.isMetavar()){
    occursCheck(t1, t2);
    t1.setVal(t2);
  } else if (t2.isMetavar()){
    occursCheck(t2, t1);
    t2.setVal(t1);
  } else if (t1.isArrow() && t2.isArrow()){
    unify(t1.from, t2.from);
    unify(t1.to, t2.to);
  } else if(t1.isApp() && t1.func.isBuiltin() && t1.func.blt === "List" &&
            t2.isBuiltin() && t2.blt === "EmptyList"){
    // do nothing
  }else if(t2.isApp() && t2.func.isBuiltin() && t2.func.blt === "List" &&
            t1.isBuiltin() && t1.blt === "EmptyList"){
    // do nothing
  } else if (t1.type === t2.type){
    // do nothing
  } else {
    throw new Error(`Unification failed on terms ${t1} and ${t2}`);
  }
}

/**
 * Verifies that a type doesn't appear in it's own definition to prevent 
 * recursive definition
 * @param {T.TMetavar} t1 
 * @param {T.TypeO} t2 
 */
function occursCheck(t1, t2){

  if (t2.isMetavar()){
    t2 = t2.resolve()
  }

  if (t2.isMetavar() && t1.name === t2.name){ 
    // #HELP not sure this is the right way of doing things
    throw new Error(`Recursive definition detected between ${t1} and ${t2}`);
  } else if (t2.isArrow()){
    occursCheck(t1, t2.from);
    occursCheck(t1, t2.to);
  }

}

/**
 * Verifies that each pattern is of it's corresponding type
 * Modifies the metavars's values or the context (for variables)
 * Most of the time the patterns is a list of one element, but for functions
 * it can be more
 * @param {[Exp]} patterns 
 * @param {[Type]} patternsTypes 
 * @param {Context} context 
 */
function checkPatterns(patterns, patternsTypes, context){
  for (let i = 0; i < patterns.length; i ++){
    switch(patterns[i].type){
      case "var" :
        context.add(patterns[i].name, patternsTypes[i]);
        break;

      case "immediate" :
        patternsTypes[i].setVal(inferImmediate(patterns[i]));
        // #HELP should this be unify() ?
        break;

      case "funcitonApp" :
        patternsTypes[i].setVal(inferFunctionApp(patterns[i], context));
        // #HELP should this be unify() ?
        break
      
      default :
        throw new Error("Unhandeled case in checkPatterns");
    }
  }
}

/**
 * returns the type of the application of a function on an argument
 * Examples :
 *     app(+,x) returns arrow(int, int)
 *     app(app(+,x),1) returns int
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferFunctionApp(exp, context){
  let tfun = infer(exp.func, context);
  let targ = infer(exp.arg, context);
  let res = T.freshMetavar();
  unify(tfun, new T.TArrow(targ, res));
  return res;
}

/**
 * 
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferVar(exp, context){
  const type = lookupGlobalLocalContext(context, exp.name);
  return type;
  return instantiate(type); // todo instantiate
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
