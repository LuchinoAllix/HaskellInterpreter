import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import * as E from "../normalize/Exp.js";
import * as V from "../eval/Value.js";


//--               File for functions needed to evaluate a term             --//

// Init global env
let global_env = new Env();
global_env.initGlobal();

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
  let variable = lookupGlobalLocal(env, exp.name);
  if (variable.metatype === "DECL"){
    if (variable.isFunc()){
      return evaluateExp(variable.body, env);
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
 * Evaluate an expression that is only a value
 * @param {E.ValExp} exp 
 * @returns {V.Value}
 */
// Note: Often we call these "immediate"s rather than "value"s.
// TODO : Change value to immediate
function evaluateValue(exp){
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
export function applyFunc(func, arg){
  if (func.subtype === "prim"){
    return func.body(arg);
  } else if (func.subtype === "primio"){
    return new V.Vio(func, arg);
  }

  if (func.param !== null){
    func.addArg(func.param.name, arg);
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
  throw new Error("No pattern was found to match in case with " + exp.exp);
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
 * TODO Pattern matching is not working since funcapp only take one argument, 
 * so FIXME
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
        // It's assumed value.value is a list because we can only have lists and
        // tuples in a funcapp of an exp of a case (perhaps this will change 
        // when we add constructor like Just)

        let newValFunc, newValArg;
        if (value.type === "tuple"){
          newValFunc = new V.Vtuple(value.value.slice(0, -1));
          newValArg = value.value.slice(-1)[0];
        } else if (value.type === "list"){
          newValFunc = value.value[0];
          newValArg = V.makeVList(value.value.slice(1));
        } else {
          throw new Error("unhandeled case in funcapp match")
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
        throw new Error("unhandeled case in match func app");
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
