import { Program } from "../objects/Program.js";
import { Exp } from "../normalize/Exp.js";
import * as T from "./TypeO.js";
import { Context } from "./Context.js";
import { isNcommas } from "../eval/eval.js"
import { Constr } from "../normalize/Constr.js";
import { popVal } from "../eval/State.js";

//--        File containing functions to type check the program             --//

export var state ;

var globalDef = [];

// to know when a global var is just not defined yet
var allGlobalDefNames = [];
// list of globla def initiated but not yet add to global ctx
var globalDefInitiated = [];

export function resetGlobalDef(){
  globalDef = [];
  allGlobalDefNames = []; 
}

// to clean the shown ctx (to show only global definitions)
function sweep(){
  for (let i = 0; i < state.rte.globalLocalCtxKeys.length; i ++){
    if (!globalDef.includes(state.rte.globalLocalCtxKeys[i])){
      state.rte.globalLocalCtxKeys.splice(i, 1);
      state.rte.globalLocalCtx.splice(i, 1);
      i-=1;
    }
  }
}

export function initTypeCheck(nState, terms){
  state = nState;
  state.pushCall(()=>state.eval = true, []); // move on to eval
  for (let term of terms){
    if (term.isDecl()){
      allGlobalDefNames.push(term.name);
    }
  }
  typeCheck(terms);
}

/**
 * Verifies that a given program type checks
 * This is the point of entry function for type checking
 * 
 * @param {Program} program
 * @returns {Boolean}
 */
function typeCheck(terms, skip = false){
  
  if (terms.length === 0){
    state.pushCall(isMainAppIoUnit, [popVal], true);
    
    if (state.main.isAnnotated()){
      state.pushCall(unify, [popVal, state.main.typeAnnotation], true);
    } else {
      state.pushCall(() => state.popVal(), [], true); // remove excess popval
    }

    let mainMetaVar = T.freshMetavar();
    mainMetaVar.pos = state.main.pos;
    state.pushCall(reStack, [], true);
    state.pushCall(()=>state.pushVal(mainMetaVar.value), [], true);
    //state.pushCall(infer, [state.main.body, new Context()], true);
    // push twice because val needed for unify and isMainAppIoUnit

    state.pushCall(check, [state.main.body, mainMetaVar, new Context()], true);
    state.pushCall(addToStateCtxRte, ["main", mainMetaVar, true], true);
    state.pushCall(initMetaVarMsg, [mainMetaVar]);

  } else {
    state.makeMsg(skip, "Check " + terms[0].toStr());
    globalDef.push(terms[0].name);

    if (terms[0].name === "main"){
      state.main = terms[0];
      state.pushCall(typeCheck, [terms.slice(1)], true);
    } else if (terms[0].isConstr()){
      state.pushCall(typeCheck, [terms.slice(1)], true);
      state.pushCall(sweep, [], true);
      state.pushCall(manageConstr, [terms[0]]);
    } else {
      state.pushCall(typeCheck, [terms.slice(1)], true);
      state.pushCall(sweep, [], true);
      let declType ;
      if (globalDefInitiated.includes(terms[0].name)){
        declType = state.rte.ctx.lookup(terms[0].name);
      } else {
        declType = T.freshMetavar();
      }
      declType.pos = terms[0].pos; // associating pos of metavar to pos of term
      
      if (terms[0].isAnnotated()){
        state.pushCall(addToStateCtxRte, [terms[0].name, popVal, true], true)
        state.pushCall(unify, [popVal, terms[0].typeAnnotation], true);
        state.pushCall(switcheroo, [], true); // fait baisser le res de generalise 
                                              // sur le stack pour que unify puisse
                                              // utiliser le res de instantiate
        state.pushCall(instantiateInitShouldSkip, [popVal, terms[0]], true);
        state.pushCall(reStack, [], true);
        state.pushCall(generalize, [terms[0].typeAnnotation], true);

      } else {
        state.pushCall(addToStateCtxRte, [terms[0].name, popVal, true], true);
        state.pushCall(generalize, [declType], true);
      }

      state.pushCall(check, [terms[0].body, declType, new Context()], true);
      state.pushCall(addToStateCtxRte, [terms[0].name, declType, true], true);
      state.pushCall(initMetaVarMsg, [declType])
    }
  }
}

function initMetaVarMsg(a, skip = false){
  state.makeMsg(skip, "Initialize " + a.toStr());
}

function reStack(){
  let val = state.popVal();
  state.pushVal(val);
  state.pushVal(val);
}

/**
 * todo
 * @param {String} name 
 * @param {Value} val 
 */
function addToStateCtxRte(name, val, overide){
  state.rte.ctx.add(name, val, overide);
}

/**
 * todo
 */
function switcheroo(){
  let a = state.popVal();
  let b = state.popVal();
  state.pushVal(a);
  state.pushVal(b);
}

/**
 * Determines the type of an expression in a given context
 * @param {Exp} exp
 * @param {Context} context
 * @returns {TypeO}
 */
function infer(exp, context, skip = false){
  //console.log(exp)
  state.makeMsg(skip, "Infer " + exp.toStr());
  
  switch (exp.type){

    case 'functionApp' :
      inferFunctionApp(exp, context);
      break ;

    case 'str' : // fixed for str
      state.pushVal(new T.TApp(T.TList(), T.TChar()))
      break;
    
    case 'var' :
      state.pushCall(instantiateInitShouldSkip, [popVal, exp], true)

      let f = () => {
        let lookup = lookupGlobalLocalContext(context, exp.name, false);
        return lookup.isMetavar() && lookup.value === null ; 
      }

      state.pushCall(inferVar, [exp, context], exp.name[0]==='\\' || f());
      // we skip if it's an internal variable or an empty metavar

      break ;
      
    case 'immediate' :
      state.pushCall(instantiateInit, [popVal, exp], true)
      state.pushCall(inferImmediate, [exp]);
      break ;

    case 'let' :
      inferLet(exp, context);
      break ;
          
    default :
      let res = T.freshMetavar(); // add message why new metavar ?
      res.pos = exp.pos;
      state.pushCall((val)=>state.pushVal(val), [res], true); // skip ?
      state.pushCall(check, [exp, res, context], true);
      state.pushCall(initMetaVarMsg, [res]);
  }
}

/**
 * Function to verify that an expression has a given type, if not throws error
 * Side effect : modifies the metavar's value 
 * @param {Exp} exp 
 * @param {T.TypeO} type 
 * @param {Context} context 
 */
function check(exp, type, context, skip = false){

  state.makeMsg(skip, "Check " + exp.toStr() + "\nwith " + type.toStr());

  switch (exp.type){
    case 'LambdaExp' :

      let from = T.freshMetavar();
      from.pos = exp.namedArg.pos;
      let to = T.freshMetavar();
      to.pos = exp.body.pos;
      
      let clone = context.clone();

      state.pushCall(unify, [type, new T.TArrow(from, to)], true);
      state.pushCall(check, [exp.body, to, clone], true);
      state.pushCall(initMetaVarMsg, [to], exp.namedArg.name[0]==='\\');
      state.pushCall(()=>clone.add(exp.namedArg.name, from), [], true);
      state.pushCall(initMetaVarMsg, [from], exp.namedArg.name[0]==='\\');
      // we skip if it's for an internal variable 

      break;

    case 'case' :

      // Args of the case (multiple for functions)

      let argsType = [];
      state.pushCall(checkRec, [exp.branches, context, type, argsType], true);
      state.pushCall(inferArgs, [exp.patterns, context, argsType], true);
      break;

    default :
      state.pushCall(unify, [popVal, type], true);
      state.pushCall(infer, [exp, context], true);
    
  }
}

function inferArgs(patterns, context, argsType, skip = false){
  if (patterns.length > 0){
    state.pushCall(inferArgs, [patterns.slice(1), context, argsType], true);
    state.pushCall(()=>{argsType.push(state.popVal()); return undefined;}, [], true);
    state.pushCall(infer, [patterns[0], context], true);
  }
}

function checkRec(branches, context, type, argsType, skip = false){
  if (branches.length > 0){
    state.makeMsg(skip, "Check " + branches[0] + "\nwith " + type.toStr());
    let branchCtx = context.clone();
    if (branches.length > 1){
      state.pushCall(checkRec, [branches.slice(1), context, type, argsType], true);
    }
    state.pushCall(check, [branches[0].branchBody, type, branchCtx], true);
    state.pushCall(checkPatterns, [branches[0].args, argsType, branchCtx], true);
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
function unify(t1, t2, skip = false){

  state.makeMsg(skip, "Unifying " + t1.toStr() + " and " + t2.toStr());

  let tmpt1 = t1.resolve();
  let tmpt2 = t2.resolve();

  if (tmpt1.isApp() && tmpt2.isApp()){
    state.pushCall(unify, [tmpt1.arg, tmpt2.arg], true);
    state.pushCall(unify, [tmpt1.func, tmpt2.func], true);
  } else if (tmpt1.isArrow() && tmpt2.isArrow()){
    state.pushCall(unify, [tmpt1.to, tmpt2.to], true);
    state.pushCall(unify, [tmpt1.from, tmpt2.from], true);

  } else if (tmpt1 === tmpt2){ // Comparing pointer wise is more efficent than 
    // do nothing              // name wise.
                               // "Base case" is verified before to avoid an 
                               // occurs check failure when unifying a metavar 
                               // with itself
  } else if (tmpt1.isMetavar()){
    occursCheck(tmpt1, tmpt2);
    state.pushCall(fSetVal, [tmpt1, tmpt2], !isInShowCtx(tmpt1.name));
  } else if (tmpt2.isMetavar()){ 
    occursCheck(tmpt2, tmpt1);
    state.pushCall(fSetVal, [tmpt2, tmpt1], !isInShowCtx(tmpt2.name));
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
}

function fSetVal(t1, t2, skip = false){
  state.makeMsg(skip, t1.toStr() + " = " + t2.toStr());
  t1.setVal(t2);
}

function isInShowCtx(name){
  for (let i = 0; i < state.rte.globalLocalCtxKeys.length; i++){
    let val = state.rte.globalLocalCtx[i][1] ;
    if (isMyMT(name, val)){
      return true ;
    }
  }
  return false ;
}

function isMyMT(name, mt){
  if (mt.isMetavar()){
    return mt.name === name ;
  } else if (mt.isApp()){
    return isMyMT(name, mt.func) || isMyMT(name, mt.arg);
  } else if (mt.isArrow()){
    return isMyMT(name, mt.from) || isMyMT(name, mt.to);
  } else if (mt.isForAll()){
    return isMyMT(name, mt.body) ;
  }
  return false ;
}

/**
 * Makes a forall with all the free metavars in a type
 * @param {T.TypeO} type
 * @returns {T.TForall} 
 */
function generalize(type, skip = false){

  state.makeMsg(skip, "Generalising " + type.toStr());

  let names = {}; // will get modified by the call to generalizeRec

  state.pushCall(generalizeInter, [names, type, popVal], true);
  state.pushCall(generalizeRec, [type, names], true);
}

function generalizeInter(names, type, nType, skip = false){
  if (Object.keys(names).length > 0 ){
    let listNames = [];
    for (let tvar of Object.values(names)){
      listNames.push(tvar.name);
    }
    state.pushVal(new T.TForall(listNames, nType));
  } else {
    // no free metavars found
    state.pushVal(type); 
  }
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
function generalizeRec(type, names, skip = false){
  if (type.isArrow()){

    state.pushCall((a,b)=> new T.TArrow(a,b), [popVal, popVal], true);
    state.pushCall(generalizeRec, [type.from, names], true);
    state.pushCall(generalizeRec, [type.to, names], true);
    
  } else if (type.isApp()){

    state.pushCall((a,b)=> new T.TApp(a,b), [popVal, popVal], true);
    state.pushCall(generalizeRec, [type.func, names], true);
    state.pushCall(generalizeRec, [type.arg, names], true);

  } else if (type.isMetavar()){
    if (type.value === null){
      let lookup = names[type.name];
      if (lookup === undefined){
        lookup = T.freshVar();
        names[type.name] = lookup;

        state.pushCall(()=>state.pushVal(lookup), [], true);
        state.pushCall(initMetaVarMsg, [lookup], true);
      } else {
        // add step ?
        state.pushVal(lookup);
      }

    } else {
      state.pushCall((resGenRec)=>{type.value = resGenRec; state.pushVal(type);}, [popVal], true);
      state.pushCall(generalizeRec, [type.value, names], true);
    }
  } else {
    state.pushVal(type);
  }
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
function checkPatterns(patterns, patternsTypes, context, skip = false){
  
  if (patterns.length >= 1){
    state.makeMsg(skip, "Check type of pattern " + patterns[0].toStr());
    if (patterns.length > 1){
      state.pushCall(checkPatterns, [patterns.slice(1), patternsTypes.slice(1), context], true);
    }
    switch (patterns[0].type){
      case "var" :
        if (isAppinCase(patterns[0].name)){
          state.pushCall(unify, [patternsTypes[0], popVal], true);
          state.pushCall(
            instantiateInitShouldSkip,
            [state.rte.ctx.lookup(patterns[0].name), patterns[0]], 
            true);
        } else {
          state.pushCall((a)=>{
            context.add(patterns[0].name, patternsTypes[0])
            state.makeMsg(false, a.name 
                               + " is initialised as " 
                               + patternsTypes[0].toStr()); 
          }, [patterns[0]]);
        }        
        break ;

      case "immediate" :
        state.pushCall(unify, [patternsTypes[0], popVal], true);
        state.pushCall(instantiateInit, [popVal, patterns[0]], true);
        state.pushCall(inferImmediate, [patterns[0]]);
        break ;
      
      case "str" : // fixed for str
        state.pushCall(unify, [patternsTypes[0], new T.TApp(T.TList(), T.TChar())], true);
        break ;

      case "functionApp" :
        state.pushCall(checkFuncAppPattern, [patterns[0], patternsTypes[0], context], true);
        break ;

      case "SpecialExp" :
        if (patterns[0].special === "_"){
          let fmt = T.freshMetavar();
          fmt.pos = patterns[0].pos;
          state.pushCall(unify, [patternsTypes[0], fmt], true);
          state.pushCall(initMetaVarMsg, [fmt]);
          break;
        } else {
          throw new Error("Unhandeled SpecialExp " + patterns[0].special);
        }
      default :
        throw new Error("Unhandeled case in checkPatterns " + patterns);
    }
  } 
}

/**
 * Returns true if the name given is a function that can be called in a pattern
 * in Haskell code
 * @param {String} name 
 * @returns {Boolean}
 */
function isAppinCase(name, skip = false){
  let res = state.rte.optionAppTable.lookup(name); 
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
function checkFuncAppPattern(pattern, patternTypeR, context, skip = false){
  state.makeMsg(skip, "Infer type of pattern " + pattern.toStr());

  let patternType = patternTypeR.resolve();

  let func = T.freshMetavar();
  func.pos = pattern.func.pos;
  
  state.pushCall(checkFuncAppPatternCont, [patternType, func], true);
  state.pushCall(checkPatterns, [[pattern.arg], popVal, context], true);
  state.pushCall(()=> state.pushVal([state.popVal()]), [], true);
  state.pushCall((func)=> state.pushVal(func.value.from), [popVal], true);
  state.pushCall(()=>state.pushVal(func), []);
  // removed verification that func.value.isArrow()
  state.pushCall(checkPatterns, [[pattern.func], [func], context], true);
}

function checkFuncAppPatternCont(patternType, func, skip = false){
  if (patternType.isApp()){
    state.pushCall(unify, [patternType, func.value.to], true);
  } else if (patternType.isMetavar() && patternType.value === null) {
    patternType.setVal(func.value.to);
  } else {
    throw new Error("TODO"); // #HELP
  }
  
}

// used to name instances
let nameCount = {};
export function resetCnt(){
  nameCount = {};
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
function inferFunctionApp(exp, context, skip = false){
  state.makeMsg(skip, "Infer type of app " + exp.func.name + "(...)");
  
  if (nameCount[exp.func.name] === undefined){
    nameCount[exp.func.name] = 1 ;
  } else {
    nameCount[exp.func.name] += 1 ;
  }

  let name = exp.func.name 
           + "<sub>" 
           + nameCount[exp.func.name]
           + "</sub>" ;
  
  // TODO FIXME : typetable has to be used to verify arity of type applications
  // like list tuples or constrs (maybe)
  let isForAll = false ;

  state.pushCall(inferFunctionAppCont, [exp, context, popVal], true);
  state.pushCall((popedVal) => {
    if (popedVal.hasInstanceMetaVar()){
      isForAll = true;
      if (exp.func.name !== undefined){
        state.rte.globalLocalCtxKeys.push(name);
        state.rte.globalLocalCtx.push([name, popedVal]);
      }
    }
    state.pushVal(popedVal); 
    }, [popVal], true);
  state.pushCall(
    (a)=>state.pushVal(a.resolve()), 
    [popVal], true);
  state.pushCall(infer, [exp.func, context], true);
}

function inferFunctionAppCont(exp, context, tfun, skip = false){
  if (tfun.isArrow()){
    state.pushCall(()=>state.pushVal(tfun.to), [], true);
    state.pushCall(check, [exp.arg, tfun.from, context], true);
  } else {
    let res = T.freshMetavar();
    res.pos = exp.pos;
    state.pushCall(()=> state.pushVal(res), [], true); // skip ?
    state.pushCall(unify, [tfun, popVal], true);
    state.pushCall((a) => state.pushVal(new T.TArrow(a, res)), [popVal], true);
    state.pushCall(initMetaVarMsg, [res]);
    state.pushCall(infer, [exp.arg, context], true);
  }
}

/**
 * Determines the type of a varibale by looking up in the context
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferVar(exp, context, skip = false){
  let res = lookupGlobalLocalContext(context, exp.name);
  state.makeMsg(skip, "Type of " + exp.name + " is "+ res.toStr());
  state.pushVal(res);
}

function instantiateInitShouldSkip(type, exp){
  state.pushCall(instantiateInit, [type, exp], !type.isForAll());
  // we skip if there is no need for instantiation
  // we only verify the first type, which is not ideal
}

// not important to have a step by step of instantiate
function instantiateInit(type, exp, dict = {}, skip = false){
  const res = instantiate(type, dict);
  state.makeMsg(skip, "Instantiating " + exp.name + " as " + res.toStr());
  state.pushVal(res);
}

/**
 * Instantiate the type, if it's a forall return it's body where the metavar is 
 * swapped for a fresh var, otherwise the type returned as is.
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
      let metavar = new T.freshMetavar(); // ici # fixme rajouter la pos associée
      copyDict[name] = metavar;
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
        return T.freshMetavar(); // ici # fixme rajouter la pos associée
      } else {
        let val = instantiate(type.value, dict);
        let mtvar = T.freshMetavar(); // ici # fixme rajouter la pos associée
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
function inferImmediate(exp, skip = false){
  let lookup = state.rte.ctx.lookup(exp.valueType);
  if (lookup === undefined){
    lookup = new T.TBuiltin(exp.valueType);
  } 
  state.makeMsg(skip, exp.toStr() + " is " + lookup.toStr());
  state.pushVal(lookup);
}

/**
 * Determines the type of the declarations of a let by adding them to a local
 * context and returning the type of the body in said context.
 * @param {Exp} exp 
 * @param {Context} context 
 * @returns {T.TypeO}
 */
function inferLet(exp, context, skip = false){
  state.makeMsg(skip, "infer let " + exp.toStr());
  if (exp.body !== null){
    let clone = context.clone();
    state.pushCall(infer, [exp.body, clone], true);
    for (let decl of exp.decls){
      state.pushCall((a)=>clone.add(decl.name, a, true), [popVal], true);
      state.pushCall(infer, [decl.body, context], true);
    }
  } else {
    state.pushVal(new T.TApp(T.TIO(), T.TUnit())); 
    for (let decl of exp.decls){
      state.pushCall((a)=> state.rte.ctx.add(decl.name, a, true), [popVal], true);
      state.pushCall(infer, [decl.body, context], true);
    }
  }
}

/**
 * Lookup but inside the global environment and a local one given
 * @param {Context} context 
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocalContext(context, name, add = true){
  let res = context.lookup(name, add);

  if (res === undefined){
    res = state.rte.ctx.lookup(name, add);
    if (res === undefined){ 
      if (allGlobalDefNames.includes(name)){
        let tmp = T.freshMetavar()
        addToStateCtxRte(name, tmp);
        globalDefInitiated.push(name);
        return tmp;
      } else {
        throw new Error(name + " is undefined.") ; 
      }
    }
  }

  return res;
  
}

/**
 * Function to verify that a type is App(IO, Unit)
 * @param {T.TypeO} mainType 
 * @returns {Boolean}
 */
function isMainAppIoUnit(mainType, skip = false){
  
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
  
  throw new Error("Main should have type App IO to Unit, not " + mainType);
}

/**
 * Manages the type of a constr object, which include :
 *  - adding the constr to the typeTable
 *  - adding the constr type in the global context
 *  - for each of the options of the constr, adding them to the global context
 * @param {Constr} constr
 */
function manageConstr(constr){ //TOCPS

  let nameDict = {}; // name of a var -> Tvar associated with var
  let type = getTypeOfConstr(constr, nameDict);

  // update constrtable and context
  state.rte.constrTable.add(constr.name, constr);
  state.rte.ctx.add(constr.name, new T.TConstrType(constr.name));

  // determine the type of each option
  for(let option of constr.options){
    if (option.type === 'var'){
      state.rte.ctx.add(option.name, type,true);
      state.rte.optionAppTable.add(option.name, 0,true);
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
      state.rte.optionAppTable.add(func.name, type.names.length);
      state.rte.ctx.add(func.name, new T.TForall(type.names, arr));
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
    } else if (state.rte.constrTable.lookup(exp.name) !== undefined){
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
      // T.tLog("new metavar for ? #5 #TODO");
      let nVar = T.freshVar();
      nameDict[constr.params[i]] = nVar;
      names.push(nVar.name);
      body = new T.TApp(body, nVar);
    }
    return new T.TForall(names, body);
  }
}
