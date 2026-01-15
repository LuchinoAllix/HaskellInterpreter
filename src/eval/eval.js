import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import * as E from "../normalize/Exp.js";
import * as V from "../eval/Value.js";


//--               File for functions needed to evaluate a term             --//

// Init global env
let global_env = new Env();
global_env.initGlobal();

let printDebug = false; // for debug, edited in activateDebugEval

/** 
 * Function to print wich function of eval is taken
 * @param {String} text text to print 
 * @param {Boolean} val additional result to print
 */
function debug(text, val){
  if(printDebug){
    let name = JSON.stringify(val);
    try {
      let a = val.name;
      if (a !== undefined){
        name = a;
      } else {
        let b = val.type
        name = b;
      }
    } catch(error){}
//    console.log(" - ");
    console.log(text)
    console.log(val);
    console.log(" - ");
  }
}

/**
 * Sets printDebug to true, used in TestFile.
 */
export function activateDebugEval(){
  printDebug = true;
}

/**
 * Entry point of evaluation for "compiled" programs
 * @param {Program} program
 * @returns {Boolean}
 */
export function initEvalComp(program){
  
  resetGlobalEnv();
  
  let terms = program.normalizedForm;
  let main_decl;
  
  if (terms.constructor !== Array){ // because if there is only main
    terms = [terms];
  }

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

  return execute(global_env.lookup("main")); 

}

/**
 * Entry point of evaluation for "interactive" programs
 * @param {Program} program 
 */
export function initEvalInter(program){
  // TODO
}

/**
 * Main function to evaluate an expression
 * Would be used in evalInitInter()
 * @param {Term} term 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluate(term, env){
  switch (term.metatype){
    case "EXP" :
      return evaluateExp(term, env);
    case "DECL" :
      return evaluateDecl(term, env);
    default :
      throw new Error("Unknown term type in evaluation : " + term.metatype);
  }
}

/**
 * Output function, to chose what to do with the final output of each evaluation
 * currently : just print it to the console
 * would be used in interactive mode
 * would need to verify first that the type of the value isn't IO
 * @param {?} output 
 */
function output(output){
  console.log(output);
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
  debug("Decl", decl);
  if (decl.name === "main"){
    global_env.add(decl.name, evaluateExp(decl.def, new Env()));
  } else {
    global_env.add(decl.name, decl);
  }
}

/**
 * Evaluates an expression in a given (local) environement
 * Returns a list of the values evaluated
 * can take as argument a value because in case, we need to evaluate before 
 * giving it as an argument 
 * @param {E.Exp} exp
 * @param {Env} env 
 * @returns {V.Value} or Prim in case of Curryfied function call
 */
function evaluateExp(exp, env){
  debug("Exp", exp);

  //not ideal but easiest solution
  if (exp.metatype === "VALUE"){
    return exp;
  }

  switch (exp.type){

    case "functionApp" :
      return evaluateFuncApp(exp, env);

    case "var" :
      return evaluateVar(exp, env);

    case "do" :
      return evaluateDo(exp, env);
    
    case "value" :
      return evaluateValue(exp);
    
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
  return new V.Vfunc(exp.body, exp.namedArg.name, env);
}

/**
 * Evaluate a var by looking in the environment the value of the var, if it is
 * not yet evaluated, the result will be (evaluated)
 * @param {E.VarExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateVar(exp, env){
  debug("Var ", exp);
  let variable = lookupGlobalLocal(env, exp.name);
  if (variable.metatype === "DECL"){
    if (variable.isFunc()){
      return new V.Vfunc(evaluateExp(variable.body, env), null, env);
    } else if (variable.isVar()){
      return evaluateExp(variable.def, env);
    } else {
      throw new Error("Decls must be either a Func or a var");
    }
  } else if (variable.metatype === "EXP"){
    return evaluateExp(variable, env);
  } else if (variable.metatype === "VALUE"){
    if (variable.type === "func" && 
      (variable.subtype === "prim" || variable.subtype === 'primio')){
      variable.closure = env;
    }
    return variable;
  } else {
    throw new Error("variable " + exp.name + " of metatype " + 
      variable.metatype + " is not handeled");
  }
}

/**
 * Evaluates a do expression by evaluating every statement individually and
 * adding them to a Do value
 * For each statement, we do not propagate the effects on the env, reseting it
 * everytime // Is this true ? #HELP
 * // FIXME: Yes and no: AFAICT currently you only support
 * // `do { A; B; C }` so there's no new binding, but once you add
 * // support for things like `do { x <- A; let y = B; return (x, y) }`,
 * // it gets different.  I recommend you macro-expand `do` to
 * // a bunch of calls to `>>=` before evaluation (and before type-inference).
 * // ANS : TODO
 * @param {E.DoExp} exp 
 * @param {Env} env
 * @returns {V.Value}
 */
function evaluateDo(exp, env){
  debug("Do", exp);
  let res = []
  for (let e of exp.exps){
    let clone = env.clone() // not needed if all adds are protected by clone()
    res = res.concat(evaluateExp(e, clone));
  }
  return new V.Vdo(res);
}

/**
 * Evaluate an expression that is only a value
 * @param {E.ValExp} exp 
 * @returns {V.Value}
 */
// Note: Often we call these "immediate"s rather than "value"s.
// TODO : Change value to immediate
function evaluateValue(exp){
  debug("Value", exp);
  switch (exp.valueType){
    case "integer" :
      return new V.Vint(exp.value);

    case "Boolean" :
      return new V.Vbool(exp.value);

    case "Char" :
      return new V.Vchar(exp.value);

    case "Special" :
      if (isMTArray(exp.value)){
        return new V.VList([]);
      }

    default :
      throw new Error("value type not yet managed in eval : " + exp.valueType);
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
 * work in progress to refactor evaluation of functions
 * @param {Vfunc} func a decl, exp or prim(io) 
 * @param {Value} arg 
 * @returns 
 */
function applyFunc(func, arg){
  console.log(func)
  console.log(arg)
  if (func.subtype === "prim"){
    return func.body(arg);
  } else if (func.subtype === "primio"){
    return new V.Vio(func, arg);
  }

  if (func.param !== null){
    func.addArg(func.param, arg);
  }

  return evaluateExp(func.body, func.closure);
}

/**
 * Evaluate an if expression by first testing the condition, if it is a boolean
 * then it returns the evaluation of the corresponding branch
 * @param {E.IfExp} exp an if expression
 * @param {Env} env the environement 
 * @returns {V.Value}
 */
function evaluateIf(exp, env){
  debug("If", exp);
  let cond = evaluateExp(exp.condition, env);
  if (cond.type !== "bool"){
    throw new Error("Expression in if condition did not evaluate to boolean.");
  } else if (cond.value){
    return evaluateExp(exp.success, env);
  } else {
    return evaluateExp(exp.fail, env);
  }
}

/**
 * Evaluates a let exp (if is has an in part, if not it won't work)
 * @param {E.LetExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateLet(exp, env){
  debug("Let", exp);
  let clone = env.clone();
  for (let decl of exp.decls){
    clone.add(decl.name, decl.def, true);
  }
  return evaluateExp(exp.body, clone);
}

/**
 * Evaluates a case by determining which case needs to be chosen (with match)
 * and returning the evaluation of the correspong branch with the updated 
 * closure
 * @param {E.CaseExp} exp 
 * @param {Env} env
 * @returns {V.Value}
 */
function evaluateCase(exp, env){
  debug("Case", exp);
  let val = evaluateExp(exp.exp, env);
  for (let branch of exp.branches){
    let matches = match(val, branch.args[0]); 
    if (matches.length >= 1 && matches[0] !== -1){
      let closure = env.clone();
      for (let match of matches){
        if (match.length >= 1){
          closure.add(match[0].name, match[1]);
        }
      }
      return evaluateExp(branch.branchBody, closure);
    }
  }
  throw new Error("No pattern was found to match in case with " + exp.exp);
}

/** 
 * Does a pattern matching on all the values and exps given (1 to 1)
 * Is used in evaluateFunctionPM rather than implicitly converting the args to 
 * pm into tuples
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
  debug("match", exp);
  // we assume the pattern matching can only be on one element
  switch (exp.type){

    case "functionApp" :

      if (isNcommas(exp.func.name)){ // Tuples
        if (value.type !== "tuple"){
          throw new Error("Pattern matching in case not of the same type, tuple"
             + " !== " + value.type);
        }
        else if (value.value.length !== exp.args.length){
          throw new Error("Pattern matching between different tuples should"
           + " have the same amount of elements");
        }
        else {
          let res = [];
          for (let i = 0; i < value.value.length; i++){
            let recursive = match(value.value[i], exp.args[i]);
            for (let rec of recursive){
              if (rec === -1){
                return [-1];
              }
              res.push(rec);
            }
          }
          return res;
        }

      } else if (exp.func.name === ':'){ // Lists
        if (value.type !== "list"){
          return [-1];
        } else {
          let arg1 = match(value.value[0], exp.args[0]);
          if (arg1[0] === -1){
            return arg1;
          }
          if (value.value.length === 0){
            if (isMTArray(exp.args[1])){
              return [[]];
            } else {
              return [-1];
            }
          }
          let tmp = value.value;
          value.value = value.value.slice(1);
          let arg2 = match(value, exp.args[1]);
          if (arg2[0] === -1){
            value.value = tmp;
            return arg2;
          }
          return arg1.concat(arg2);
        }
      }

    case "SpecialExp" :
      return [[]];
      
    case "var" :
      return [[exp, value]];

    case "value" :
      // Might not work on strings because of "\" stuff, #FIXME
      if (exp.value === value.value || 
          (isMTArray(exp.value) && isMTArray(value.value))){
            // second condition of if is to verify [] =? []
        return [[]];
      }
      return [-1];
      
    default :
      throw new Error("Exp not yet managed in pattern matching of eval : " + 
        exp.type);
  }
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
 * @param {V.Vio} main_decl 
 */
function execute(main_decl){
  debug("execution");
  let res = [];
  if (main_decl.type === "IO"){
    let a = main_decl.func.body(main_decl.arg);
    res.push(a);
  } else if (main_decl.type === "do"){
    for (let exp of main_decl.value){
      res = res.concat(execute(exp));
    }
  } else {
    throw new Error(
      "Only IO functions and 'do' statements can be given to main");
  }
  return res;
}

/**
 * Lookup but inside the global environment and a local one given
 * @param {Env} env 
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocal(env, name){
  let res = env.lookup(name);
  if (res !== undefined){
    return res;
  } 
  res = global_env.lookup(name);  
  if (res !== undefined){
    return res;
  }
  if (isNcommas(name)){ // Add the comma function to the global env if need be
    global_env.addNcommas(name);
    return global_env.lookup(name);
  }
  throw new Error(name + " is undefined.");
}

/**
 * Allows to reset the global environment
 * To be used in interactive mode
 */
function resetGlobalEnv(){
  global_env = new Env();
  global_env.initGlobal();
}

/**
 * Determines if an str is a list of ','
 * There probably is a more efficent way of doing so than with recursion
 * @param {String} str 
 * @returns {Boolean}
 */
function isNcommas(str){
  if (str.length === 0){
    return true;
  } else if (str[0] === ","){
    return isNcommas(str.slice(1));
  }
}
