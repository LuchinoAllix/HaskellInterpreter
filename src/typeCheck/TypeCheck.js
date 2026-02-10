import { Program } from "../objects/Program.js";
import { Exp } from "../normalize/Exp.js";
import * as T from "./TypeO.js";
import { Context } from "./Context.js";
import { isNcommas } from "../eval/eval.js"
import { ifToCase } from "../normalize/normalizer.js";

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
  let main; 
  for (let decl of program.normalizedForm){
    if (decl.name === "main"){
      main = decl;
    } else {
      if (decl.isAnnotated()){
        global_context.add(decl.name, decl.typeAnnotation);
        // should the type annotation be verified in any way ? surely
      } else {
        global_context.add(decl.name, infer(decl.body, new Context()));
      }
    }
  }

  // To ensure that main is the last decl to be type checked
  let mainType = infer(main.body, new Context());

  // can main have a type annotation ?
  // todo add verification on main type IO

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
      // FIXME: Once you add the "let-generalization" that introduces
      // forall, you'll need here to "un-forall" the type.
      // E.g. if the lookup returns `∀α,β. (α→β) → List α → List β`
      // you'll want to return the type `(T1→T2) → List T1 → List T2`,
      // where T1 and T2 are fresh new metavars.
      return inferVar(exp, context);
      
    case 'immediate' :
      // FIXME: In general immedates may have a "forall" type and thus
      // require a similar treatment as described above.
      // ANS : how ?
      return inferImmediate(exp);

    case 'let' :
      return inferLet(exp, context);

    // FIXME: Actually, you don't need `if` nodes, you can use "normalize"
    // it to `case`.
    // ANS : Should this be used in evaluation ?
    case 'if' :
      return infer(ifToCase(exp), context);
          
    default :
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
      // FIXME: Clearly `setVal` is wrong because it throws away the previous
      // information.  Instead, you should use the same "mini-unify" as in
      // `inferFunctionApp`.
      // ANS : ???
      type.setVal(new T.TArrow(from, to)); //#HELP should this be unify ?
      let clone = context.clone();
      clone.add(exp.namedArg.name, from); 
      check(exp.body, to, clone);

      break;

    case 'case' :

      // Args of the case (multiple for functions)

      let argsType = [];

      for (let i = 0; i < exp.exps.length; i ++){
        argsType.push(infer(exp.exps[i], context)); 
      }

      for (let branch of exp.branches){
        let branchCtx = context.clone();
        checkPatterns(branch.args, argsType, branchCtx);
        check(branch.branchBody, type, branchCtx);
      }

      break;

    // FIXME: You may want to add a `checkLet` as well.
    // It's not indispensible, but it can reduce the number of metavars.

    default :
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
  
  if (t1.isMetavar()){ t1 = t1.resolve() ; }
  if (t2.isMetavar()){ t2 = t2.resolve() ; }

  // "Base case" is verified first to avoid an occurs check failure when 
  // unifying a metavar with itself

  if (t1.type === t2.type){
    // do nothing
  } else if (t1.isMetavar()){
    occursCheck(t1, t2);
    t1.setVal(t2);
  } else if (t2.isMetavar()){
    occursCheck(t2, t1);
    t2.setVal(t1);
  } else if (t1.isArrow() && t2.isArrow()){
    unify(t1.from, t2.from);
    unify(t1.to, t2.to);

  // FIXME: No need to treat `List` specially.
  // ANS : it's to check wether unify([], ["a","b"]) should pass or not
  // FIXME: What is this `EmptyList` type?
  // ANS : Since lists are functions, there exists an immediate exp which's type
  //       is emptylist for the end call of the function
  } else if(t1.isApp() && t1.func.isBuiltin() && t1.func.blt === "List" &&
            t2.isBuiltin() && t2.blt === "EmptyList"){
    // do nothing
  } else if(t2.isApp() && t2.func.isBuiltin() && t2.func.blt === "List" &&
            t1.isBuiltin() && t1.blt === "EmptyList"){
    // do nothing

  } else if (t1.isForAll() || t2.isForAll()){
    throw new Error(`Forall in unification should not happen`);
  } else {
    throw new Error(`Unification failed on types : 
      ${JSON.stringify(t1, null, 2)} \n\nand 
      ${JSON.stringify(t2, null, 2)}`);
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
    t2 = t2.resolve();
  }

  if (t2.isMetavar() && t1 === t2){ 
    throw new Error(`Recursive definition detected between ${t1} and ${t2}`);
  } else if (t2.isArrow()){
    occursCheck(t1, t2.from);
    occursCheck(t1, t2.to);
  } else if (t2.isApp()){
    occursCheck(t1, t2.func);
    occursCheck(t1, t2.arg);
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
        break ;

      case "immediate" :
        unify(patternsTypes[i], inferImmediate(patterns[i]));
        break; 

      case "functionApp" :
        // FIXME: This won't work: you're passing to `inferFunctionApp`
        // a pattern rather than an expression.
        // ANS : But patterns are a list of expressions 
        //       (coming from check function)
        unify(patternsTypes[i],inferFunctionApp(patterns[i], context));
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
  
  if (tfun.isArrow()){
    check(exp.arg, tfun.from, context);
    return tfun.to;
  } 
  
  let targ = infer(exp.arg, context);
  // FIXME :
  // It's worth writing an ad-hoc "mini-unify" function for this case,
  // since in most cases `tfun` will already be an arrow type and all
  // we want is to *extract* the two types it carries without creating
  // any new metavariables.
  // ANS : ???
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
  return instantiate(type, {});
}

/**
 * Instantiate the type, if it's a forall return it's body where the metavar is 
 * swapped for a fresh one, otherwise the the the type returned as is.
 * @param {T.TypeO} type 
 * @param {{String, T.TMetavar}} dict 
 * @returns {T.TypeO}
 */
function instantiate(type, dict){

  // If we have a forall, return the body where the metavar is swapped for a 
  // fresh one
  if (type.isForAll()){
    let copyDict = {...dict}; // creates a copy of dict
    copyDict[type.name] = new T.freshMetavar(); 
    return instantiate(type.body, copyDict);
  } 
  
  // If we have no swapping to do we can dirrectly return the type 
  if (Object.keys(dict).length > 0){
    if (type.isMetavar()){
      const tmp = dict[type.name];
      if (tmp !== undefined) { return tmp ; }
      return type;
    } else if (type.isArrow()){
      return new T.TArrow(instantiate(type.from, dict), 
                          instantiate(type.to, dict));
    } else if (type.isApp()){
      return new T.TApp(instantiate(type.func, dict), 
                        instantiate(type.arg, dict));
    }
  }
  return type;
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
