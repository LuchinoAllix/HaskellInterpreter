import { Program } from "../objects/Program.js";
import { Exp } from "../normalize/Exp.js";
import * as T from "./TypeO.js";
import { Context } from "./Context.js";
import { isNcommas } from "../eval/eval.js"
import { Constr } from "../normalize/Constr.js";
import { TypeTable } from "./TypeTable.js";

//--        File containing functions to type check the program             --//

// Init global context
export let global_context = new Context();
global_context.initGlobal();

// Init typetable
export let constrTable = new TypeTable();
export let optionAppTable = new TypeTable();

/**
 * Verifies that a given program type checks
 * This is the point of entry function for type checking
 * 
 * @param {Program} program
 * @returns {Boolean}
 */
export function typeCheck(program){
  resetGlobalContext();

  optionAppTable.reset();
  optionAppTable.initOption();

  constrTable.reset();
  constrTable.initConstr();
  
  let main; 
  for (let decl of program.normalizedForm){
    if (decl.name === "main"){
      main = decl;
    } else if (decl.isConstr()){
      manageConstr(decl);
    } else {
      T.tLog("Infer Decl : " + decl.name, 1);
      
      // metavar used in case of recursive definition
      let declType = T.freshMetavar(); 
      
      global_context.add(decl.name, declType);
      check(decl.body, declType, new Context());
      
      if (decl.isAnnotated()){
        let genDeclType = generalize(declType);
        
        // verify the type annotation
        unify(instantiate(genDeclType), decl.typeAnnotation);

        global_context.add(decl.name, genDeclType, true);
      } else {
        global_context.add(decl.name, generalize(declType), true);
      }
      T.tLog("Infered decl " + decl.name + " : " + declType.toStr(), -1);
    }
  }
  
  // To ensure that main is the last decl to be type checked
  T.tLog("Infer Main ", 1);
  let mainType = infer(main.body, new Context());
  
  // verify the type annotation of main
  if (main.isAnnotated()){
    unify(mainType, main.typeAnnotation);
  }
  
  if (isMainAppIoUnit(mainType)){
    return true; 
  }

  throw new Error("Main should have type App IO to Unit, not " + mainType);

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
  T.tLog("Check between " + exp.toStr() + " and " + type.toStr(), 1);

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

      for (let i = 0; i < exp.patterns.length; i ++){
        argsType.push(infer(exp.patterns[i], context)); 
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

    T.tLog("Check between " + exp.toStr() + " and " + type.toStr(), -1);
    
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

  T.tLog("Unification between " + t1.toStr() + " and " + t2.toStr(), 1);
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
  } else if (tmpt1.isBuiltin() && tmpt2.isBuiltin() && tmpt1.blt === tmpt2.blt){
    // do nothing
  } else if (tmpt1.isConstrVal() && tmpt2.isConstrVal() && 
             tmpt1.name === tmpt2.name){
    // do nothing
  } else if (tmpt1.isConstrType() && tmpt2.isConstrType() && 
             tmpt1.name === tmpt2.name){
    // do nothing
  } else if (t1.isForAll() || tmpt2.isForAll()){
    throw new Error(`Forall in unification should not happen`);
  } else {
    throw new Error(`Unification failed on types : 
      ${JSON.stringify(tmpt1, null, 2)} \nand 
      ${JSON.stringify(tmpt2, null, 2)}`);
  }

  T.tLog("Unification between " + t1.toStr() + " and " + t2.toStr(), -1);

}

/**
 * Makes a forall with all the free metavars in a type
 * @param {T.TypeO} type
 * @returns {T.TForall} 
 */
function generalize(type){

  T.tLog("generalize " + type.toStr());

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
  
  T.tLog("Occurs check between " + t1.toStr() + " and " + t2.toStr(), 1);

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

  T.tLog("Occurs check between " + t1.toStr() + " and " + t2.toStr(), -1);
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
  T.tLog("checkPatterns " + patterns);
  for (let i = 0; i < patterns.length; i ++){
    switch (patterns[i].type){
      case "var" :
        if (isAppinCase(patterns[i].name)){
          unify(patternsTypes[i], 
            instantiate(global_context.lookup(patterns[i].name)));
        } else {
          context.add(patterns[i].name, patternsTypes[i]);
        }
        break ;

      case "immediate" :
        unify(patternsTypes[i], instantiate(inferImmediate(patterns[i])));
        break; 

      case "functionApp" :
        checkFuncAppPattern(patterns[i], patternsTypes[i], context);
        break
      
      case "SpecialExp" :
        if (patterns[i].special === "_"){
          unify(patternsTypes[i], T.freshMetavar());
          break;
        } else {
          throw new Error("Unhandeled SpecialExp " + patterns[i].special);
        }
      default :
        throw new Error("Unhandeled case in checkPatterns " + patterns[i].type);
    }
  }
}

/**
 * Returns true if the name given is a function that can be called in a pattern
 * in Haskell code
 * @param {String} name 
 * @returns {Boolean}
 */
function isAppinCase(name){
  let res = optionAppTable.lookup(name); 
  if (res !== undefined){ return true ; }
  return name === ":" 
      || name === ","
      || isNcommas(name);
}

/**
 * If possible, modifies the type expected of a pattern (patternTypeR), and 
 * the context based on the constitution of the pattern, for example :
 * 
 * - (a:b) = ... will yield that the pattern is of type metavar where it's value
 *   is list metavar t42 and the context will be updated where a is of type t42 
 *   and b is of type list metavar t42
 * 
 * - (a,b) = ... will yield that the pattern is of type metavar where it's value
 *   is tuple metavar t42 , metavar t43 and the context will be updated where 
 *   a is of type t42 and b is of of type t43
 * 
 * @param {Exp} pattern 
 * @param {T.TypeO} patternTypeR
 * @param {Context} context 
 */
// FIXME: I think the problem here is the one I already mentioned
// which is that you should *not* use the same AST for patterns as for
// expressions.  More specifically, rather than
// 'functionaApp' nodes with a single arg that rely on currying,
// patterns should use a datatype along the lines of:
//
//     data Pattern =
//        | Var String
//        | Wildcard
//        | Constructor (List Pattern)
//
// Then in `checkPatterns` things will be much simpler and clearer.
function checkFuncAppPattern(pattern, patternTypeR, context){
  T.tLog("checkFuncAppPattern " + pattern.toStr());
  let patternType = patternTypeR.resolve();
  // If you do `x = freshmetavar;  check* (EXP, x, ..)` it means you're doing
  // it wrong: e.g. maybe you should use `infer*` instead.  Tho here,
  // what it really means is that you first need to find the "head"
  // of the application (which *has* to be a constructor, whose type we
  // already know), then unify its return type with `patternTypeR` (after
  // instantiating, if it's polymorphic),
  // then *check* the type of all the subpatterns (notice that the
  // recursion uses `check` rather than `infer`, so you'll never actually
  // need any `inferPattern`).
  let func = T.freshMetavar();
  checkPatterns([pattern.func], [func], context);
  if (func.value.isArrow()){
    checkPatterns([pattern.arg], [func.value.from], context);
    if (patternType.isApp()){
      unify(patternType, func.value.to);
    } else if (patternType.isMetavar() && patternType.value === null) {
      patternType.setVal(func.value.to);
    } else {
      throw new Error("TODO"); // #HELP
    }
  } else {
    throw new Error("TODO");
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
  // TODO FIXME : typetable has to be used to verify arity of type applications
  // like list tuples or constrs (maybe)
  T.tLog("Infer App " + exp.toStr());
  let tfun = infer(exp.func, context).resolve();

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
 * NOT YET USED
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
  let res = lookupGlobalLocalContext(context, exp.name);
  T.tLog("lookup " + exp.toStr() + " : " + res.toStr());
  return res;
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
    T.tLog("Instantiate " + type.toStr());
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
  T.tLog("Infer Imm " + exp.toStr());
  let lookup = global_context.lookup(exp.valueType);
  if (lookup !== undefined){ // for constructors
    return lookup;
  }
  return new T.TBuiltin(exp.valueType);
  // HELP should there be a verification on the accepted builtin types ?
}

/**
 * Determines the type of the declarations of a let by adding them to a local
 * context and returning the type of the body in said context.
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferLet(exp, context){
  T.tLog("Infer Let" + exp.toStr());
  if (exp.body !== null){
    let clone = context.clone();
    for (let decl of exp.decls){
      clone.add(decl.name, infer(decl.body, context), true);
    }
    return infer(exp.body, clone);

  } else {
    for (let decl of exp.decls){
      global_context.add(decl.name, infer(decl.body, context), true);
    }
    return new T.TApp(T.TIO(), T.TUnit()); 
    // #HELP I'm using IO here because we say all monads are just IO, 
    // so it's fine ? (looks suspicious) 
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

  if (res === undefined){
    res = global_context.lookup(name);  
    if (res === undefined){ 
      throw new Error(name + " is undefined.") ; 
    }
  }

  return res;
  
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

/**
 * Function to verify that a type is App(IO, Unit)
 * @param {T.TypeO} mainType 
 * @returns {Boolean}
 */
function isMainAppIoUnit(mainType){
  T.tLog("Verifying that main is IO");
  
  if (mainType.isMetavar()){
    return isMainAppIoUnit(mainType.value);
  }
  
  if (mainType.isApp()){
    
    let func = mainType.func;
    
    while (func.isMetavar()){
      func = func.value;
    } 

    if (func.isBuiltin() && func.blt === 'IO'){
      
      let arg = mainType.arg;

      while (arg.isMetavar()){
        arg = arg.value;
      }

      return arg.isBuiltin() && arg.blt === 'Unit' ;
    }
  }
  return false;
}

/**
 * Manages the type of a constr object, which include :
 *  - adding the constr to the typeTable
 *  - adding the constr type in the global context
 *  - for each of the options of the constr, adding them to the global context
 * @param {Constr} constr
 */
function manageConstr(constr){
  T.tLog("Processing the type of constr " + constr.name);
  let nameDict = {}; // name of a var -> Tvar associated with var
  let type = getTypeOfConstr(constr, nameDict);

  // update constrtable and context
  constrTable.add(constr.name, constr);
  global_context.add(constr.name, new T.TConstrType(constr.name));

  // determine the type of each option
  for(let option of constr.options){
    if (option.type === 'var'){
      global_context.add(option.name, type);
      optionAppTable.add(option.name, 0);
    } else if(option.type === "functionApp"){
      // we know type is forall (what about constrs with no variable ? FIXME)
      let func = option.func;
      let arr = new T.TArrow(funcAppToTApp(option.arg, nameDict, constr.params), 
                             type.body);
      while (func.type === "functionApp"){
        arr = new T.TArrow(funcAppToTApp(func.arg, nameDict, constr.params), 
                           arr);
        func = func.func;
      }
      if (func.type !== 'var'){
        throw new Error("TODO");
      }
      optionAppTable.add(func.name, type.names.length);
      global_context.add(func.name, new T.TForall(type.names, arr));
    }
  }
}

/**
 * Takes a funcapp exp and returns it's corresponding app type
 * nameDict is used if the var already has a corresponding tvar
 * params is used to know which var is called from the constr and which is a 
 * constr (we assume nameDict and params have the same entries)
 * @param {Exp} exp 
 * @param {String -> T.TVar} nameDict name of a var -> Tvar associated with var
 * @param {[String]} params list of the names of param of the constr node
 * @returns {T.TypeO}
 */
function funcAppToTApp(exp, nameDict, params){
  if (exp.type === 'var'){
    if (params.includes(exp.name)){
      return nameDict[exp.name];
    } else if (constrTable.lookup(exp.name) !== undefined){
      return new T.TConstrType(exp.name); 
    }
    return new T.TConstrVal(exp.name);
  }
  return new T.TApp(funcAppToTApp(exp.func, nameDict, params), 
                    funcAppToTApp(exp.arg, nameDict, params));
}

/**
 * Returns the type of a constr node
 * eg : 
 *      Maybe a b c = ... 
 * becomes 
 *      forall([a, b, c], app(app(app(constr(maybe), a), b), c)) 
 * 
 * and updates the nameDict with all the names of the variables with
 * their corresponding type var
 * 
 * @param {Constr} constr 
 * @param {String -> T.TVar} nameDict name of a var -> Tvar associated with var
 * @returns {T.TConstrType | T.TForall}
 */
function getTypeOfConstr(constr, nameDict){
  if (constr.params.length === 0){
    return new T.TConstrType(constr.name);
  } else {
    let body = new T.TConstrType(constr.name);
    let names = [];
    for (let i = 0; i < constr.params.length; i++){
      let nVar = T.freshVar();
      nameDict[constr.params[i]] = nVar;
      names.push(nVar.name);
      body = new T.TApp(body, nVar);
    }
    return new T.TForall(names, body);
  }
}
