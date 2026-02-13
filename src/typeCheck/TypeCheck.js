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
  let main; 
  for (let decl of program.normalizedForm){
    if (decl.name === "main"){
      main = decl;
    } else {
      if (decl.isAnnotated()){
        global_context.add(decl.name, generalize(decl.typeAnnotation));
        // should the type annotation be verified in any way ? surely
        // FIXME : what strategy should we adopt ?
        // eg : x :: (Int, Int)
        //      x = (1, False)
        //      main = print (snd x)
        // il faut check (comme haskell)
      } else {
        let declType = T.freshMetavar();
        global_context.add(decl.name, declType);
        check(decl.body, declType, new Context());
        global_context.add(decl.name, generalize(declType), true);
      }
    }
  }

  console.log(JSON.stringify(global_context.lookup("f"), null, 2));
  
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
      return instantiate(inferVar(exp, context));
      
    case 'immediate' :
      return instantiate(inferImmediate(exp));

    case 'let' :
      return inferLet(exp, context);
          
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
      
      let clone = context.clone();
      clone.add(exp.namedArg.name, from);
      check(exp.body, to, clone);
      unify(type, new T.TArrow(from, to));
      
      // FIXME: Clearly `setVal` is wrong because it throws away the previous
      // information.  Instead, you should use the same "mini-unify" as in
      // `inferFunctionApp`.
      // ANS : ???
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
  let tmpt1 = t1.resolve();
  let tmpt2 = t2.resolve();

  if (tmpt1.isApp() && tmpt2.isApp()){
    unify(tmpt1.func, tmpt2.func);
    unify(tmpt1.arg, tmpt2.arg);
  } else if (tmpt1.isArrow() && tmpt2.isArrow()){
    unify(tmpt1.from, tmpt2.from);
    unify(tmpt1.to, tmpt2.to);

  } else if (tmpt1 === tmpt2){ // Comparing pointer wise is more efficent than 
    // do nothing              // name wise.
                               // "Base case" is verified before to avoid an 
                               // occurs check failure when unifying a metavar 
                               // with itself
  } else if (tmpt1.isMetavar()){
    occursCheck(tmpt1, tmpt2);
    tmpt1.setVal(tmpt2);
  } else if (tmpt2.isMetavar()){
    occursCheck(tmpt2, tmpt1);
    tmpt2.setVal(tmpt1);
  } else if (tmpt1.isBuiltin() && tmpt2.isBuiltin && tmpt1.blt === tmpt2.blt){
    // do nothing
  } else if (t1.isForAll() || tmpt2.isForAll()){
    throw new Error(`Forall in unification should not happen`);
  } else {
    throw new Error(`Unification failed on types : 
      ${JSON.stringify(tmpt1, null, 2)} \n\nand 
      ${JSON.stringify(tmpt2, null, 2)}`);
  }
}

/**
 * Makes a forall with all the free metavars in a type
 * @param {T.TypeO} type
 * @returns {T.TForall} 
 */
function generalize(type){
  let names = {}; // will get modified by the call to generalizeRec
  let nType = generalizeRec(type, names);
  if (Object.keys(names).length > 0 ){
    let listNames = []
    for (let tvar of Object.values(names)){
      listNames.push(tvar.name);
    }
    return new T.TForall(listNames, nType);
  }
  return type ; // no free metavars found
}

/**
 * Recursive call for generalization (substition of free metavars for fresh 
 * vars) by keeping track of the substitutions in a dict that is modified 
 * dynamically
 * 
 * @param {T.TypeO} type 
 * @param {{String : T.Tvar}} names 
 * @returns {T.TypeO}
 */
function generalizeRec(type, names){
  if (type.isArrow()){
    return new T.TArrow(generalizeRec(type.from, names),
                        generalizeRec(type.to, names));
  } else if (type.isApp()){
    return new T.TApp(generalizeRec(type.func, names), 
                      generalizeRec(type.arg, names));
  } else if (type.isMetavar()){
    if (type.value === null){
      let lookup = names[type.name];
      if (lookup === undefined){
        lookup = T.freshVar();
        names[type.name] = lookup;
      }
      return lookup;
    } else {
      type.value = generalizeRec(type.value, names); 
      return type;
    }
  }
  return type;
}

/**
 * Verifies that a type doesn't appear in it's own definition to prevent 
 * recursive definition
 * @param {T.TMetavar} t1 
 * @param {T.TypeO} t2 
 */
function occursCheck(t1, t2){

  let tmpt2 = t2;
  if (tmpt2.isMetavar()){
    tmpt2 = t2.resolve();
  }

  if (tmpt2.isMetavar() && t1 === tmpt2){ 
    throw new Error(`Recursive definition detected between 
      ${JSON.stringify(t1, null, 2)} \n\nand 
      ${JSON.stringify(t2, null, 2)}`);
  } else if (tmpt2.isArrow()){
    occursCheck(t1, tmpt2.from);
    occursCheck(t1, tmpt2.to);
  } else if (tmpt2.isApp()){
    occursCheck(t1, tmpt2.func);
    occursCheck(t1, tmpt2.arg);
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
    switch (patterns[i].type){
      case "var" :
        context.add(patterns[i].name, patternsTypes[i]);
        break ;

      case "immediate" :
        unify(patternsTypes[i], instantiate(inferImmediate(patterns[i])));
        break; 

      case "functionApp" :
        checkFuncAppPattern(patterns[i], patternsTypes[i], context);
        break
      
      default :
        throw new Error("Unhandeled case in checkPatterns");
    }
  }
}


/**
 * todo
 * @param {Exp} pattern 
 * @param {T.TypeO} patternTypeR 
 * @param {Context} context 
 */
function checkFuncAppPattern(pattern, patternTypeR, context){
  // not working
  let patternType = patternTypeR.resolve();
  if (patternType.isApp()){
    checkPatterns([pattern.func], [patternType.func], context);
    checkPatterns([pattern.arg], [patternType.arg], context);
  } else if (patternType.isMetavar() && patternType.value === null) {
    patternType.value = new T.TApp(T.freshMetavar(), T.freshMetavar());          
    checkPatterns([pattern.func], [patternType.value.func], context);
    checkPatterns([pattern.arg], [patternType.value.arg], context);
  } else {
    checkPatterns([pattern.func], [patternType], context);
    checkPatterns([pattern.arg], [patternType], context);
  }
  unify(patternTypeR, patternType);
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
  let res = T.freshMetavar();

  unify(tfun, new T.TArrow(targ, res));
  return res;
}

/**
 * todo
 * @param {Exp} exp 
 * @param {T.TypeO} tfun 
 * @param {Context} context 
 * @returns {T.TypeO | null}
 */
function miniUnify(exp, tfun, context){
  if (tfun.isArrow()){
    check(exp.arg, tfun.from, context);
    return tfun.to;
  }
  return null;
}

/**
 * Determines the type of a varibale by looking up in the context
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferVar(exp, context){
  return lookupGlobalLocalContext(context, exp.name);

}

/**
 * Instantiate the type, if it's a forall return it's body where the metavar is 
 * swapped for a fresh var, otherwise the the the type returned as is.
 * @param {T.TypeO} type 
 * @param {{String: T.TMetavar}} dict 
 * @returns {T.TypeO}
 */
function instantiate(type, dict = {}){

  // If we have a forall, return the body where the metavar is swapped for a 
  // fresh one
  if (type.isForAll()){
    let copyDict = {...dict}; // creates a copy of dict
    for (let name of type.names){
      copyDict[name] = new T.freshMetavar(); 
    }
    return instantiate(type.body, copyDict);
  } 
  
  // If we have no swapping to do we can dirrectly return the type 
  if (Object.keys(dict).length > 0){
    if (type.isVar()){
      const tmp = dict[type.name];
      if (tmp === undefined){ 
        throw new Error("Undefined var in instanciation");
      }
      return tmp;
    } else if (type.isArrow()){
      return new T.TArrow(instantiate(type.from, dict),
                          instantiate(type.to, dict));
    } else if (type.isApp()){
      return new T.TApp(instantiate(type.func, dict),
                        instantiate(type.arg, dict));
    } else if (type.isMetavar()){
      if (type.value === null){
        return T.freshMetavar();
      } else {
        let val = instantiate(type.value, dict);
        let mtvar = T.freshMetavar();
        mtvar.value = val;
        return mtvar;
      }
    }
  }
  return type;
}

/**
 * Makes a builtin type from the immediate value's type
 * @param {Exp} exp 
 * @returns {T.TBuiltin | T.TForall}
 */
function inferImmediate(exp){
  if (exp.valueType === 'EmptyList'){
    const nvar = T.freshVar();
    return new T.TForall([nvar.name], new T.TApp(T.TList(), nvar));
  }
  return new T.TBuiltin(exp.valueType);
}

/**
 * Determines the type of the declarations of a let by adding them to a local
 * context and returning the type of the body in said context.
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferLet(exp, context){
  if (exp.body !== null){
    let clone = context.clone();
    for (let decl of exp.decls){
      clone.add(decl.name, infer(decl.body, context), true);
    }
    return infer(exp.body, clone);

  } else {
    // should we just add all the exps to the global context ? 
    throw new Error("TODO");
  }
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
