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
 * Function to print in a certain color, indented according to the space
 * variable. Used in rules, branch and data functions to print the path took
 * by the parser.
 * @param {Integer} col color in which to print 
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
    console.log(text, " " + name);
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
      throw Error("In succesion of terms at toplevel, only declarations " + 
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
      throw Error("Unknown term type in evaluation : " + term.metatype);
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
    global_env.add(decl.name, evaluateExp(decl.branches[0], new Env()));
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

  // Not ideal, but the easiest solution
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

    // FIXME: Like `do` you should convert "TupleExp" and "ListExp"
    // to calls to functions like (:) before evaluation/typecheck.
    // ANS : TODO
    case "TupleExp" :
      return new V.Vtuple(exp.elems.map(x => evaluateExp(x,env)));

    case "ListExp" :
      return new V.VList(exp.elems.map(x => evaluateExp(x,env)));

    case "case" :
      return evaluateCase(exp, env);

    // FIXME: Not quite sure how this differs from "ListExp"
    // but I think the same comment applies.
    // ANS : These different from ListExp because in functions and cases, for 
    // pattern matching I can't just transform (0 : a) to [0] or [0,a] since we
    // don't know what a is, (perhaps as a linked list perhaps ?)
    case "ListPatternExp" :
      return evaluateListPatternExp(exp, env);
 
    default :
      console.log(JSON.stringify(exp, null, 2))
      throw Error("exp not yet managed in eval : " + exp.type);
    
  }
}

/**
 * Evaluate a var by looking in the environment the value of the var, if it is
 * not yet evaluated, the result will be
 * @param {E.VarExp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateVar(exp, env){
  debug("Var ", exp);
  let variable = lookupGlobalLocal(env, exp.name);
  if (variable !== undefined){
    if (variable.metatype === "DECL"){
      return evaluateExp(variable.branches[0], env);
    } else if (variable.metatype === "EXP"){
      return evaluateExp(variable, env);
    } else if (variable.metatype === "VALUE"){
      return variable;
    } else {
      throw new Error("variable " + exp.name + " of metatype " + 
        variable.metatype + " is not handeled");
    }
  } else {
    throw new Error("variable " + exp.name + " is undefined");
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
      throw Error("value type not yet managed in eval : " + exp.valueType);
  }
}

/**
 * Evaluates a function application by looking up it's definition in the env and
 * giving it it's arguments.
 * 
 * This function is different from evaluateFunc because here we may only have a
 * ref to the function, in evaluateFunc we suppose we always have the body of 
 * the function we're evaluating
 * 
 * Note, this cannot be replaced by "evaluateExp (exp.body, env)" because then
 * we lose the arguments
 * @param {Exp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncApp(exp, env){
  let f = undefined;
  if (exp.body.type === 'var'){ // named functions
    f = lookupGlobalLocal(env, exp.body.name); 
  } else if (exp.body.type === 'LambdaExp' || exp.body.type === 'functionApp'){ 
    // anonymous functions and currified calls
    f = exp.body;
  } 
  if (f !== undefined){
    return evaluateFunc(f, exp.args, env);
  } else {
    throw Error("function " + exp.name + " is undefined");
  }
}

/**
 * Executes a function that is given (not the name, the actual body) 
 * with it's arguments
 * @param {Term} func can be a Prim, Decl or lambdaExp
 * @param {[E.Exp]} args 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFunc(func, args, env){
  debug("Func", func);

  if (args.length === 0){ // All the args have been given
      
    if (func.isPrimIO()){
      if (func.nbArgs < func.args.length){
        throw new Error("Too many args");
      }
      
      return new V.Vio(
        function f(){
          return func.run()
        }
      ); // Return the IO to be called at exec
    
    } else if (func.isPrim()){
      if (func.nbArgs < func.args.length){ 
        console.log(func)
        throw new Error("Too many args");
      }
      return func.run(); // Call the primitive
    
    } else if (func.isDecl()){

      return evaluateFuncPM(func, env); // call the func 

    } else if (func.type === "LambdaExp"){ 
      
      let closure = env.clone();
      for (let i = 0; i < func.nbArgs; i ++){
        let matches = match(func.args[i], func.namedArgs[i]);
        if (matches[0] === -1){
          // should never happen
          throw new Error("no match found in pattern matching in lambda");
        }
        for (let j = 0; j < matches.length; j ++){
          closure.add(matches[j][0].name, matches[j][1]);
        }
      }

      if (func.nbArgs < func.args.length){ // we have too many args
        return evaluateFunc(func.body, func.args.slice(func.nbArgs), closure);
      }

      return evaluateExp(func.body, closure);
    
    } else {
      throw new Error("Func not managed in evalFunc : " + func);
    }

  }

  if (func.type === "functionApp"){
    let f = func.clone();
    f.args = func.args.concat(args);
    return evaluateFuncApp(f, env);
  }

  if (func.nbArgs > func.args.length + args.length){
    throw new Error("Not enough arguments were given to func " + func);
  }
  
  let f = func.clone();
  f.args = args.map(x => evaluateExp(x, env));

  return evaluateFunc(f, [], env);
    
}

/**
 * Executes a function that requires pattern matching
 * Implicitly converts args as a tuple to use the same pattern matching as cases
 * @param {Term} func 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncPM(func, env){
  console.log(func)
  debug("Func PM", func);
  if (func.nbArgs === 0 || func.nbArgs === null){
    return evaluateFunc(func.branches[0], func.args, env);
  }
  let overflow = [];
  if (func.nbArgs < func.args.length){
    overflow = func.args.slice(func.nbArgs);
    func.args = func.args.slice(0, func.nbArgs);
  }
  let evalArgs = new V.Vtuple(func.args);
  for (let branch of func.branches){
    let patterns = new E.TupleExp(branch.args);
    let matches = match(evalArgs, patterns);
    if (matches.length > 0 && matches[0] !== -1){
      let closure = env.clone();
      for (let match of matches){
        if (match.length >= 1){
          closure.add(match[0].name, match[1], true);
        }
      }
      if (overflow.length > 0){
        return evaluateFunc(branch.branchBody, overflow, closure);
      }
      return evaluateExp(branch.branchBody, closure);
    }
  }
  console.log(func)
  throw new Error("No match found for pattern matching in func : " + func.name);
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
    throw Error("Expression in if condition did not evaluate to boolean.");
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
    clone.add(decl.name, decl.branches[0], true);
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

    case "TupleExp" :
      if (value.type !== "tuple"){
        throw new Error("Pattern matching in case not of the same type, tuple" +
          " !== " + value.type);
      } else if (value.value.length !== exp.elems.length){
        throw new Error("Pattern matching between different tuples should have"
          + " the same amount of elements");
      } else {
        let res = [];
        for (let i = 0; i < value.value.length; i++){
          let recursive = match(value.value[i], exp.elems[i]);
          for (let rec of recursive){
            if (rec === -1){
              return [-1];
            }
            res.push(rec);
          }
        }
        return res;
      }

    case "ListExp" :
      if (value.type !== "list" || value.value.length !== exp.elems.length){
        return [-1];
      } else {
        let res = [];
        for (let i = 0; i < exp.elems.length; i ++){
          let recursive = match(value.value[i], exp.elems[i]);
          for (let rec of recursive){
            if (rec === -1){
              return [-1];
            }
            res.push(rec);
          }
        }
        return res;
      }

    case "SpecialExp" :
      return [[]];

    case "ListPatternExp" :
      if (value.type !== "list" || value.value.length <= 0){
        throw new Error("A list pattern in a case requires a list with at " + 
          "least one element :" + value.value );
      } else {
        let match_head = match(value.value[0], exp.head);
        if(match_head.length > 0 && match_head[0] === -1){
          return [-1]
        }
        let match_rest;
        if (value.value.length === 1){
          match_rest = match(new V.VList([]), exp.rest);
        } else {
          match_rest = match(new V.VList(value.value.slice(1)), exp.rest);
        }
        if(match_rest.length > 0 && match_rest[0] === -1){
          return [-1]
        }
        return match_head.concat(match_rest);
      }
      
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
 * Evalues a list pattern like (1 : 2 : [3,4]) to [1,2,3,4]
 * @param {E.ListPatternTerm} exp 
 * @param {Env} env 
 * @returns {V.VList}
 */
function evaluateListPatternExp(exp, env){
  debug("List Pattern Exp", exp);
  let newList = [];
  newList.push(evaluateExp(exp.head, env));
  if (exp.rest.type === "ListExp"){
    newList = newList.concat(evaluateExp(exp.rest, env).value);
  } else if (!isMTArray(exp.rest.value)){
    let tmp = evaluateExp(exp.rest, env);
    if (tmp.type === "list"){
      tmp = tmp.value;
    }
    newList = newList.concat(tmp);
  }
  return new V.VList(newList);
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
    let a = main_decl.value.call();
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
  throw Error(name + " is undefined.");
}

/**
 * Allows to reset the global environment
 * To be used in interactive mode
 */
function resetGlobalEnv(){
  global_env = new Env;
  global_env.initGlobal();
}
