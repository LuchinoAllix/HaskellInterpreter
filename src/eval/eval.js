import { Term } from "../normalize/Term.js";
import { Decl, resetCountLambdaVar } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import * as E from "../normalize/Exp.js";
import * as V from "../eval/Value.js";
import { Constr } from "../normalize/Constr.js";
import { Prim } from "./Prim.js";
import { popVal } from "./State.js";
import { resetCnt, resetGlobalDef } from "../typeCheck/TypeCheck.js";
import { resetCount } from "../typeCheck/TypeO.js";

//--               File for functions needed to evaluate a term             --//

// for decls that havn't been added to the global env yet, kinda add hoc but works
var listOfTerms = []

export var state;

/**
 * Entry point of evaluation for "compiled" programs
 * TODO params
 */
export function initEvalComp(nState, terms){
  state = nState;
  resetCnt();   // reset count used in instances names
  resetCount(); // reset count used in var and metavar names
  resetCountLambdaVar(); // reset count used in anonymous lambda functions
  resetGlobalDef();
  evalTerms(terms);
  listOfTerms = terms;
}

/**
 * todo
 * @param {[Decl]} terms 
 */
function evalTerms(terms, skip = false){
  if (terms.length === 0){

    // base case, we have evaluated all terms, so move on to main
    state.pushCall(evaluateDecl, [state.main]);

  } else {

    if (terms[0].metatype === "EXP"){
      state.setError("In succesion of terms at toplevel, only declarations " + 
        "are allowed.");
    
    } else if (terms[0].name === 'main'){

      // if we find main, store it in main and continue evaluating terms
      state.main = terms[0];
      state.pushCall(evalTerms, [terms.slice(1)], true);

    } else {

      // if we have a decl that isn't main, store the call to do in callstack
      // and evaluate the decl
      state.pushCall(evalTerms, [terms.slice(1)], true);
      state.pushCall(evaluateDecl, [terms[0]]);

    }
  }
}

/**
 * Adds a declaration to the global env
 * Declarations are just added as is to the global env, no transformation occur,
 * except for the main
 * Notes :
 *  - We assume main is the only entry point of the program.
 *  - We assume declaration can only be at the top level, let's or where are
 *    considered expressions.
 *  - We assume that there can be no declarations inside main, there can be 
 *    'inless' let's but they are considered expressions.
 * @param {Decl} decl 
 */
function evaluateDecl(decl, skip = false){
  state.makeMsg(skip, "Evaluating : " + decl.name + " (declaration)");
  if (decl.isConstr()){
    state.pushCall(evaluateConstr, [decl]);
  } else if (decl.name === "main"){
    state.pushCall(runMain, [popVal]);
    state.pushCall(evaluateExp, [decl.body, new Env()]);
  } else {
    state.pushCall(addToStateEnvRte, [decl.name, popVal], true);
    state.pushCall(evaluateExp, [decl.body, new Env()]);
  }
}

/**
 * todo 
 * @param {?} main 
 */
function runMain(main, skip = false){
  state.makeMsg(skip, "run main");
  main.exec();
}

/**
 * todo
 * @param {String} name 
 * @param {Value} val 
 */
function addToStateEnvRte(name, val, skip = false){
  state.rte.env.add(name, val);
}

/**
 * Evaluates an expression in a given (local) environement
 * can take as argument a value because in case, we need to evaluate before 
 * giving it as an argument 
 * @param {E.Exp} exp
 * @param {Env} env 
 * @returns {V.Value} or Prim in case of Curryfied function call
 */
function evaluateExp(exp, env, skip = false){
  switch (exp.type){

    case "functionApp" :
      evaluateFuncApp(exp, env);
      break ;

    case "str" : // fixed for str
      evaluateExp(exp.value, env, skip);
      break ;

    case "var" :
      evaluateVar(exp, env);
      break ;
    
    case "immediate" :
      evaluateImmediate(exp);
      break ;
    
    case "let" :
      evaluateLet(exp, env);
      break ;

    case "case" :
      evaluateCase(exp, env);
      break ;
    
    case "LambdaExp" :
      evaluateLambda(exp, env);
      break ;
 
    default :
      state.setError("exp not yet managed in eval : " + exp.type);
    
  }
}

/**
 * Evaluates a lambda exp by returning a Vfunc
 * @param {E.LambdaExp} exp 
 * @param {Env} env 
 * @returns {V.Vfunc}
 */
function evaluateLambda(exp, env, skip = false){
  state.makeMsg(skip, "Evaluating lambda " + exp.toStr());
  state.pushVal(new V.Vfunc(exp.body, exp.namedArg, env)) ;
}

/**
 * Evaluate a var by looking in the environment the value of the var, if it is
 * not yet evaluated, the result will be (evaluated)
 * @param {E.VarExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateVar(exp, env, skip = false){
  state.makeMsg(skip, "Evaluating variable " + exp.toStr());
  let variable = lookupGlobalLocalEnv(env, exp.name, state.rte);

  if (variable.metatype === "DECL"){
    state.pushCall(evaluateExp,[variable.body, env]);
  } else if (variable.metatype === "EXP"){
    state.pushCall(evaluateExp,[variable, env]);
  } else if (variable.metatype === "VALUE"){

    if (variable.type === "func" && variable.subtype === "prim"){
      variable.closure = env;
    }

    state.pushVal(variable);

  } else {
    state.setError("variable " + exp.name + " of metatype " + 
      variable.metatype + " is not handeled");
  }
}

/**
 * Evaluate an expression that is only a value
 * @param {E.ImExp} exp 
 * @returns {V.Value}
 */
function evaluateImmediate(exp, skip = false){
  state.makeMsg(skip, "Evaluating immediate " + exp.toStr());
  switch (exp.valueType){

    case "Integer" :
    case "Boolean" :
    case "Char" :
    case "EmptyList" :
      state.pushVal(new V.VImm(exp.value, exp.valueType));
      break ;
      
    default :
      let res = state.rte.env.lookup(exp.value);
      if (res !== undefined){
        state.pushVal(new V.VConstr(exp.valueType, [exp.value])); 
      } else {
        state.setError("value type not yet managed in eval : " +
          exp.valueType);
      }
  }
}

/**
 * Evaluates a function application by looking up it's definition in the env and
 * giving it it's arguments.
 * 
 * @param {E.FunctionApp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncApp(exp, env, skip = false){
  state.makeMsg(skip, "Eval func app " + exp.toStr());
  state.pushCall(applyFunc, [popVal, popVal], true);
  state.pushCall(evaluateExp, [exp.arg, env]);
  state.pushCall(evaluateExp, [exp.func, env]);
}

/**
 * executes a func by giving it it's argument
 * @param {Vfunc} func a decl, exp or prim
 * @param {Value} arg 
 * @returns 
 */
export function applyFunc(arg, func, skip = false){
  state.makeMsg(skip, "Apply func");

  if (func.subtype === "prim"){ // appel de la primitive
    const res = func.body(arg);
    // TODO : rajouter une etape pour montrer le résultat ?
    if (res !== undefined){ state.pushVal(res); }
  } else { 
    if (func.param !== null){
      func.addArg(func.param.name, arg);
    }
    
    state.pushCall(evaluateExp, [func.body, func.closure]);
  }
}

/**
 * Evaluates a let exp 
 * @param {E.LetExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateLet(exp, env, skip = false){
  if (exp.body !== null){
    let clone = env.clone();
    recEvaluateLet(exp.body, exp.decls, clone);
  } else {
    recEvaluateLet(null, exp.decls, env);
  }
}

function recEvaluateLet(body, decls, env){
  if (decls.length === 0){
    if (body !== null){
      state.pushCall(evaluateExp, [body, env]);
    } else {
      state.pushVal(new V.Vio(() => V.Unit));
    }
  } else {
    state.pushCall(recEvaluateLet, [body, decls.slice(1), env]);
    state.pushCall(addToLocalEnv, [decls[0].name, popVal, env], true);
    state.pushCall(evaluateExp, [decls[0].body, env]);
  } 
}

function addToLocalEnv(name, value, env, skip = false){
  state.makeMsg(skip, "Adding to local env");
  env.add(name, value, true);
}

/**
 * Evaluates a case by determining which case needs to be chosen (with match)
 * and returning the evaluation of the corresponding branch with the updated 
 * closure
 * @param {E.CaseExp} exp 
 * @param {Env} env
 * @returns {V.Value}
 */
function evaluateCase(exp, env, skip = false){

  state.pushCall(recEvaluateCase, [exp.branches, env])
  state.pushVal([]); // to gather all the elems from recEvalPatterns
  state.pushCall(recEvalPatterns, [exp.patterns, env]);
  
}

function recEvaluateCase(branches, env, skip = false){
  if (branches.length === 0){
    state.setError("No pattern match in case with " + exp.patterns);
  } else {
    const vals = state.popVal();
    let matches = matchAll(vals, branches[0].args);
    if (matches.length >= 1 && matches[0] !== -1){
      let closure = env.clone();
      for (let match of matches){
        if (match.length >= 1){
          closure.add(match[0].name, match[1], true);
        }
      }
      state.pushCall(evaluateExp, [branches[0].branchBody, closure]);
    } else {
      state.pushVal(vals);
      state.pushCall(recEvaluateCase, [branches.slice(1), env]);
    }
  }
}

function recEvalPatterns(patterns, env, skip = false){
  if (patterns.length !== 0){
    state.pushCall(recEvalPatterns, [patterns.slice(1), env]);
    state.pushCall(listPatternsRes, []);
    state.pushCall(evaluateExp, [patterns[0], env]);
  }
}

function listPatternsRes(){
  const val = state.popVal();
  const vals = state.popVal();
  vals.push(val);
  state.pushVal(vals);
}

/** 
 * Does a pattern matching on all the values and exps given (1 to 1)
 * @param {[V.Value]} values 
 * @param {[E.Exp]} exps 
 * @returns {[[E.Exp]]} 
 */
function matchAll(values, exps, skip = false){
  if (values.length !== exps.length){
    state.setError("Match should be called on values and exps of same length");
  } else {
    let res = [];
    for (let i = 0; i < values.length; i++){
      let recursive = match(values[i], exps[i]);
      for (let rec of recursive){
        if (rec === -1){
          return [-1];
        }
        res.push(rec);
      }
    }
    return res;
  }
}

/**
 * Determines if a given value matches a given pattern, if so returns a list 
 * (that can be empty) of pairs variable to values, if not, returns the list
 * [-1]
 * @param {V.Value} value 
 * @param {E.Exp} exp 
 * @returns {[[E.Exp]]} # the return type is more [(VarExp, Value)] but since 
 *                    # pairs don't exists in js, perhaps converting to a dict ?
 *                    # FIXME
 */
function match(value, exp, skip = false){
  switch (exp.type){

    case "str" : // fixed for str
      return match(value, exp.value, skip)

    case "functionApp" :

      if (isFuncAppOfConstr(exp)){ 
        return matchConstr(value, exp);
      } else if (exp.func.type === "functionApp"){
        let newValFunc, newValArg;
        if (value.type === "tuple"){
          newValFunc = new V.Vtuple(value.value.slice(0, -1));
          newValArg = value.value.slice(-1)[0];
        } else if (value.type === "list"){
          newValFunc = value.fst;
          newValArg = value.snd;
        } else {
          state.setError("unhandeled case in funcapp match");
        }
        
        let funcMatch, argMatch;
        funcMatch = match(newValFunc, exp.func);
        if (funcMatch[0] === -1){
          return funcMatch;
        }
        argMatch = match(newValArg, exp.arg);
        if (argMatch[0] === -1){
          return argMatch;
        }
        return funcMatch.concat(argMatch);
      
      } else if (isNcommas(exp.func.name)){
        return match(value.value[0], exp.arg);
      } else  if (exp.func.name === ':'){
        return match(value, exp.arg);
      } else {
        state.setError("unhandeled case in match func app");
      }

    case "SpecialExp" :
      return [[]];
      
    case "var" :
      if (state.rte.optionAppTable.lookup(exp.name) !== undefined){
        let lookup = state.rte.env.lookup(exp.name);
        if (lookup.value.length > 0 || value.type !== lookup.type){ 
          return [-1] ; 
        }
        return [[]];
      }
      return [[exp, value]];

    case "immediate" :
      // Might not work on strings because of "\" stuff, #FIXME
      if (exp.value === value.value || 
        (exp.valueType === 'EmptyList' && value.type === 'EmptyList')){
        return [[]];
      }
      return [-1];
      
    default :
      state.setError("Exp not yet managed in pattern matching of eval : " + 
        exp.type);
  }
}

/**
 * Match a value with an expression (same logic of match but for constrs)
 * @param {V.Value} value 
 * @param {E.Exp} exp 
 * @returns {[[E.Exp]]}
 */
function matchConstr(value, exp, skip = false){
  let args = listIt(exp);
  let func = args.pop(1);
  if (args.length !== value.value.length || value.type !== func.name){
    return [-1];
  }
  let res = [];
  for (let i = 0; i < args.length; i ++){
    let a = match(value.value[i], args[i]); 
    if (a[0] === -1){
      return a;
    } else {
      res = res.concat(a);
    }
  }
  return res;
}

/**
 * Turns a function app into a list (arg1, arg2, ... , func)
 * @param {E.FunctionApp} exp 
 * @returns {[E.Exp]}
 */
function listIt(exp){
  let args = [exp.arg];
  let pointer = exp.func;
  while (pointer.type === 'functionApp'){
    args.push(pointer.arg);
    pointer = pointer.func;
  }
  args.push(pointer);
  return args;
}

/**
 * Determines if the function app given as param is of a constr
 * @param {E.FunctionApp} exp 
 * @returns {Boolean}
 */
function isFuncAppOfConstr(exp){
  let pointer = exp.func ;
  while (pointer.type === 'functionApp'){
    pointer = pointer.func ;
  }
  return state.rte.optionAppTable.lookup(pointer.name) !== undefined;
}

/**
 * Determines if a given variable is the empty array
 * Required because js compares by reference, so array === [] is always false
 * @param {[]} array 
 * @returns {Boolean}
 */
export function isMTArray(array){
  return Array.isArray(array) && array.length === 0
}

/**
 * Lookup but inside the global environment and a local one given
 * @param {Env} env
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocalEnv(env, name, global_rte, skip = false){
  let res = env.lookup(name);
  if (res !== undefined){
    return res;
  }
  res = global_rte.env.lookup(name);  
  if (res !== undefined){
    return res;
  }
  
  // when the decl hasn't been parsed yet
  for (let term of listOfTerms){
    if (term.name === name){
      return term;
    }  
  }

  state.setError(name + " is undefined.");
}

/**
 * Determines if an str is a list of ','
 * There probably is a more efficent way of doing so than with recursion
 * @param {String} str 
 * @returns {Boolean}
 */
export function isNcommas(str){
  if (str.length === 0){
    return true;
  } else if (str[0] === ","){
    return isNcommas(str.slice(1));
  }
}

/**
 * Evaluates a data declaration (constr) by updating the global env
 * @param {Constr} constr
 */
function evaluateConstr(constr, skip = false){
  for (let option of constr.options){
    if (option.type === 'var'){
      state.rte.env.add(option.name, new V.VConstr(option.name));
    } else {
      state.rte.env.add(getName(option), expToPrim(option, []));
    }
  }
}

/**
 * Returns the primitive form (function) of a functionApp
 * Used to process constr definition to update the global env
 * @param {Exp} exp 
 * @param {[V.Value]} values 
 * @returns {V.Value}
 */
function expToPrim(exp, values){
  if (exp.type === 'functionApp'){
    let res = expToPrim(exp.arg, []);
    if(res !== undefined){ values.push() ; }
    return new Prim(a => expToPrim(exp.func, [a].concat(values)));
  } else if (exp.type === 'var'){
    if (isConstrOrOption(exp.name)){
      return new V.VConstr(exp.name, values);
    }
  }
}

/**
 * Determines if a given name is of a constr or an option in an app
 * @param {String} name 
 * @returns {Boolean}
 */
function isConstrOrOption(name){
  return state.rte.optionAppTable.lookup(name) !== undefined || 
         state.rte.constrTable.lookup(name) !== undefined ;
}

/**
 * Goes through all the func to return it's left most app's name
 * @param {Exp} exp 
 * @returns {String}
 */
function getName(exp){
  if(exp.type === 'functionApp'){
    return getName(exp.func);
  }
  return exp.name;
}