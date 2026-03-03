import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import * as E from "../normalize/Exp.js";
import * as V from "../eval/Value.js";
import { Constr } from "../normalize/Constr.js";
import { typeTable } from "../typeCheck/TypeCheck.js"
import { Prim } from "./Prim.js";


//--               File for functions needed to evaluate a term             --//

// Init global env
let global_env;
let main;

export function initGlobal(){
  global_env = new Env();
  global_env.initGlobal();
}

/**
 * Entry point of evaluation for "compiled" programs
 * @param {Program} program
 * @returns {Boolean}
 */
export function initEvalComp(program){
  
  resetGlobalEnv();
  main = null; // reseting main
  
  let terms = program.normalizedForm;
  let main_decl;

  for (let term of terms){
    
    if (term.metatype === "EXP"){
      throw new Error("In succesion of terms at toplevel, only declarations " + 
        "are allowed.");
    } 
    
    else if (term.name === "main"){
      main_decl = term;
    } 

    else {
      evaluateDecl(term);
    }
  }

  evaluateDecl(main_decl); // To ensure that main is evaluated only once every 
                           // other decl is added in the global env

  return execute(main); 

}

/**
 * Entry point of evaluation for "interactive" programs
 * @param {Program} program 
 * @param {Env} env
 */
export function initEvalInter(program, env){

  let terms = program.normalizedForm;
  if (terms.length > 1){
    throw new Error("Only one term allowed in repl mode")
  }
  if (terms[0].metatype === 'DECL'){
    env.add(terms[0].name,evaluateExp(terms[0].body, env));
  } else {
    let exp = evaluateExp(terms[0], env);
    if (exp.type !== 'IO'){ // might not be best verification
      const print = global_env.lookup('print');
      print.body(exp).exec();
    } else {
      exp.exec()
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
function evaluateDecl(decl){
  if (decl.name === "main"){
    main = evaluateExp(decl.body, new Env());
  } else if (decl.isConstr()){
    evaluateConstr(decl);
  } else {
    global_env.add(decl.name, evaluateExp(decl.body, new Env()));
  }
}

/**
 * Evaluates an expression in a given (local) environement
 * can take as argument a value because in case, we need to evaluate before 
 * giving it as an argument 
 * @param {E.Exp} exp
 * @param {Env} env 
 * @returns {V.Value} or Prim in case of Curryfied function call
 */
function evaluateExp(exp, env){

  switch (exp.type){

    case "functionApp" :
      return evaluateFuncApp(exp, env);

    case "var" :
      return evaluateVar(exp, env);
    
    case "immediate" :
      return evaluateImmediate(exp);
    
    case "let" :
      return evaluateLet(exp, env);

    case "if" :
      return evaluateIf(exp, env);

    case "case" :
      return evaluateCase(exp, env);
    
    case "LambdaExp" :
      return evaluateLambda(exp, env);
 
    default :
      console.log(JSON.stringify(exp, null, 2))
      throw new Error("exp not yet managed in eval : " + exp.type);
    
  }
}

function evaluateLambda(exp, env){
  return new V.Vfunc(exp.body, exp.namedArg, env);
}

/**
 * Evaluate a var by looking in the environment the value of the var, if it is
 * not yet evaluated, the result will be (evaluated)
 * @param {E.VarExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateVar(exp, env){
  let variable = lookupGlobalLocalEnv(env, exp.name);
  if (variable.metatype === "DECL"){
    return evaluateExp(variable.body, env);
  } else if (variable.metatype === "EXP"){
    return evaluateExp(variable, env);
  } else if (variable.metatype === "VALUE"){
    if (variable.type === "func" && variable.subtype === "prim"){
      variable.closure = env;
    }
    return variable;
  } else {
    throw new Error("variable " + exp.name + " of metatype " + 
      variable.metatype + " is not handeled");
  }
}

/**
 * Evaluate an expression that is only a value
 * @param {E.ImExp} exp 
 * @returns {V.Value}
 */
function evaluateImmediate(exp){
  switch (exp.valueType){
    case "Integer" :
      return new V.Vint(exp.value);

    case "Boolean" :
      return new V.Vbool(exp.value);

    case "Char" :
      return new V.Vchar(exp.value);
      
    default :
      let res = typeTable.lookup(exp.valueType); 
      if (res !== undefined){
        if (res.arity === 0){
          return new V.VConstr(exp.valueType);
        }
        return new V.VConstr(exp.valueType, [exp.value]);
      } else {
        throw new Error("value type not yet managed in eval : " +
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
function evaluateFuncApp(exp, env){
  let func = evaluateExp(exp.func, env);
  let arg = evaluateExp(exp.arg, env);
  return applyFunc(func, arg);
}

/**
 * todo
 * @param {Vfunc} func a decl, exp or prim
 * @param {Value} arg 
 * @returns 
 */
export function applyFunc(func, arg){
  if (func.subtype === "prim"){
    return func.body(arg);
  }

  if (func.param !== null){
    func.addArg(func.param.name, arg);
  }

  return evaluateExp(func.body, func.closure);
}

/**
 * Evaluates a let exp 
 * @param {E.LetExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateLet(exp, env){
  if (exp.body !== null){
    let clone = env.clone();
    for (let decl of exp.decls){
      clone.add(decl.name, evaluateExp(decl.body, env), true);
    }
    return evaluateExp(exp.body, clone);
  }
  for (let decl of exp.decls){
    env.add(decl.name, evaluateExp(decl.body, env), true);
  }
  return new V.Vio(() => V.Unit);
}

/**
 * Evaluates a case by determining which case needs to be chosen (with match)
 * and returning the evaluation of the corresponding branch with the updated 
 * closure
 * @param {E.CaseExp} exp 
 * @param {Env} env
 * @returns {V.Value}
 */
function evaluateCase(exp, env){
  let vals = exp.exps.map(x => evaluateExp(x, env));
  for (let branch of exp.branches){
    let matches = matchAll(vals, branch.args); 
    if (matches.length >= 1 && matches[0] !== -1){
      let closure = env.clone();
      for (let match of matches){
        if (match.length >= 1){
          closure.add(match[0].name, match[1], true);
        }
      }
      return evaluateExp(branch.branchBody, closure);
    }
  }
  throw new Error("No pattern was found to match in case with " + exp.exps);
}

/** 
 * Does a pattern matching on all the values and exps given (1 to 1)
 * @param {[V.Value]} values 
 * @param {[E.Exp]} exps 
 * @returns {[[E.Exp]]} 
 */
function matchAll(values, exps){
  if (values.length !== exps.length){
    throw new Error("Match should be called on values and exps of same length");
  }
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
function match(value, exp){
  switch (exp.type){

    case "functionApp" :

      if (exp.func.type === "functionApp"){

        let newValFunc, newValArg;
        if (value.type === "tuple"){
          newValFunc = new V.Vtuple(value.value.slice(0, -1));
          newValArg = value.value.slice(-1)[0];
        } else if (value.type === "list"){
          newValFunc = value.fst;
          newValArg = value.snd;
        } else {
          throw new Error("unhandeled case in funcapp match");
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
      } else if (typeTable.lookup(exp.func.name)){ 
        // will not work for constructor of arity >= 2
        return matchConstr(value, exp);
      } else {
        throw new Error("unhandeled case in match func app");
      }

    case "SpecialExp" :
      return [[]];
      
    case "var" :
      return [[exp, value]];

    case "immediate" :
      // Might not work on strings because of "\" stuff, #FIXME
      if (exp.value === value.value || 
        (exp.valueType === 'EmptyList' && value.type === 'EmptyList')){
        return [[]];
      }
      return [-1];
      
    default :
      throw new Error("Exp not yet managed in pattern matching of eval : " + 
        exp.type);
  }
}

function matchConstr(value, exp){
  let args = listIt(exp);
  let func = args.pop(1);
  if (args.length !== value.value.length || value.type !== func.name){
    return [-1];
  }
  let res = []
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
 * 
 * @param {*} exp 
 * @returns {[Exp]}
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
 * Determines if a given variable is the empty array
 * Required because js compares by reference, so array === [] is always false
 * @param {[]} array 
 * @returns {Boolean}
 */
export function isMTArray(array){
  return Array.isArray(array) && array.length === 0
}

/**
 * Function to actually run the program, with all IO functions
 * returns a list of what io functions return
 * @param {V.Vio} main_decl 
 */
function execute(main_decl){

  if (main_decl.type === "IO"){
    return main_decl.exec();
  }
  
  throw new Error("Only IO functions can be given to main");
  
}

/**
 * Lookup but inside the global environment and a local one given
 * @param {Env} env
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocalEnv(env, name){
  let res = env.lookup(name);
  if (res !== undefined){
    return res;
  }
  res = global_env.lookup(name);  
  if (res !== undefined){
    return res;
  }
  throw new Error(name + " is undefined.");
}

/**
 * Allows to reset the global environment
 * Remembers the commas function (tuples) because the env is reset at the start
 * of each test, but the commas functions are added in normalisation (before 
 * reset)
 * HELP : is this a good idea ? or should the env be reset after each test ?
 */
function resetGlobalEnv(){
  let tmp_env = new Env();
  // going through each value in the env and keeping only ncommas functions
  for (let [key, value] of Object.entries(global_env.decls)){
    if (isNcommas(key) && key.length > 1){
      tmp_env.add(key, value);
    }
  }
  global_env = tmp_env;
  global_env.initGlobal();
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
 * Allows to add to the global env from other files (used in normalisation) when
 * working on tuples to add the ncommas function before evaluation
 * @param {String} str 
 */
export function addNcommasToGlobalEnv(str){
  global_env.addNcommas(str);
}

/**
 * todo
 * @param {Constr} constr
 */
function evaluateConstr(constr){
  for (let option of constr.options){
    if (option.type === 'var'){
      global_env.add(option.name, new Prim(() => new V.VConstr(option.name)));
    } else {
      global_env.add(option.name, 
        new Prim((a) => new V.VConstr(option.func.name, a.value)));

      /* not working, todo generalise for any number of args
      let func = option.func;
      let args = [];
      let constr;
      let prim = new Prim(a => constr);
      while (func.type === "functionApp"){
        args.push(func.arg);
        prim = new Prim (a => prim);
        func = func.func;
      }
      constr = new V.VConstr(func.name, prim)
      */
    }
  }
}