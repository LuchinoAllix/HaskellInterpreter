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

  switch (exp.type){
    // FIXME: Why do we have three kinds of "FuncApp"s ?
    // ANS : We have FUNCtion APPlication for : 
    //        - regular functions (defined with a name)
    //        - anonymous functions
    //        - curryfied calls (we already know the function will wait for
    //                           additional arguments)
    // These yield from the normaliser 
    case "functionApp" :
      return evaluateFuncApp(exp, env);
    
    case "aFunctionApp" :
      return evaluateAFunctionApp(exp, env);

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

    case "curFunctionApp" :
      return evaluateCurFunctionApp(exp, env);

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
 * Evaluates a function application by looking up it's definition in the env and
 * giving it it's arguments.
 * @param {Decl} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncApp(exp, env){
    // FIXME: I think this should be `evaluateExp (exp.name, env)`
    // and naming that field "name" was a poor choice, it should be called
    // "f/func/function" or something like that.
    // ANS : ???? what should be evaluateExp ? 
    //     : TODO change filed 'name' to 'function'
  let f = lookupGlobalLocal(env, exp.name);
  if (f !== undefined){
    return evaluateFunc(f, exp.args, env);
  } else {
    throw Error("function " + exp.name + " is undefined");
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
        variable.metatype + "is not handeled");
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
 * Evaluates a curryfied expression
 * A curryfied expression has an expression and some arguments, so it first
 * evaluates the expression waiting for arguments and then evaluates the whole
 * with the "extra" arguments
 * @param {E.CurFunctionApp} exp 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateCurFunctionApp(exp, env){
  debug("Cur Function App", exp);
  let vfunc = evaluateExp(exp.func, env);
  if (vfunc.type === "func"){
    let closure = env.clone();
    for (let variable in vfunc.closure.decls){
      closure.add(variable, vfunc.closure.lookup(variable), true);
    }
    return evaluateFunc(vfunc.value, exp.args.concat(vfunc.extraArgs), closure);
  }
  else {
    throw new Error("Unhandeled case in curified function app : " + vfunc);
  }
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
 * Executes a function that is given (not the name, the actual body) 
 * with it's arguments
 * If it's a primitive function (+, print, ... ) recursively curryfies it
 * If it's a manually defined function, if it has pattern matching, 
 * evaluateFuncPM manages it. If not, depending on if arguments are still 
 * needed or not, is curryfied / evaluated
 * @param {Term} decl 
 * @param {[E.Exp]} args 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFunc(decl, args, env){
  debug("Func", decl);

  if (decl.isPrim() || decl.isPrimIO()){
    // For primitives, we can recursivly call with the given arguments, if 
    // enough are given we have an actual value / IO, if not we have a Vfunc 
    // value, which are required by currified calls
    return decl.lambdaCall(args.map(x => evaluateExp(x, env)));
  }

  // In case of a LambdaExp, if we have arguments we can simply evaluate it 
  // through anonymous function evaluation with the arguments, if not we add the
  // args to the Vfunc which the curryfication will handle (we should not be in
  // else statement if the call doesn't originate from the curr func eval)
  if (decl.type === "LambdaExp"){
    if (args.length > 0){
      return evaluateAFunctionApp(new E.AFunctionApp(args, decl), env);
    }
    else {
      return new V.Vfunc(decl, env, args);
    }
  }

  // We can assume we have a manually declared function call

  let func = lookupGlobalLocal(env, decl.name);
  if (func === undefined){
    throw new Error(decl.name + " is undefined.");
  }

  if (func.nbArgs === null){
    if (args.length === 0){
      return evaluateExp(func.branches[0], env);
    } else { // We assume func.branches[0] is a function waiting for arguments
      // could this loop indefinetly ? because if we have a recursive func that
      // doesn't require args so nbargs is null but some arguments are given
      // Yes but it's not our job to identify such cases (if it even is 
      // possible)

      return evaluateFunc(func.branches[0], args, env);
    }
  } else {
    if (decl.type === "functionApp"){
      args = decl.args.concat(args);
    }
    
    if (func.metatype === "PRIM" || func.type === "LambdaExp"){
      return evaluateFunc(func, args, env);
    }
    
    if (func.type === "variable"){      
      return evaluateFunc(func.branches[0], args, env);
    }
    
    if (args.length < func.nbArgs){ 
      // If we are still waiting for arguments, we delay the evaluation for the
      // currying
      return new V.Vfunc(func, env, args);
    } else {
      return evaluateFuncPM(func, args, env);
    }
  }
}

/**
 * Executes a function that requires pattern matching
 * We assume all the args are in args
 * There can be more args than required for currying
 * Implicitly converts args as a tuple to use the same pattern matching as cases
 * @param {Term} func 
 * @param {[E.Exp]} args 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncPM(func, args, env){
  debug("Func PM", func);
  let evalArgs = new V.Vtuple(
    args.slice(0, func.nbArgs).map(x => evaluateExp(x, env)));

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
      if (args.length > func.nbArgs){ // If we still have arguments left
        return evaluateFunc(branch.branchBody, 
                            args.slice(func.nbArgs), closure);
      }

      if (branch.type === "LambdaExp"){
        return evaluateExp(branch.body, closure);
      }
      
      return evaluateExp(branch.branchBody, closure);
    }

  }
  throw new Error("No match found for pattern matching in func : " + func.name);
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

/**
 * Function to actually run the program, with all IO functions
 * @param {V.Vio} main_decl 
 */
function execute(main_decl){
  debug("execution");
  let res = []
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
 * Evaluates an anonymous function by recursion until no more arguments needs
 * to be added to the closure, then it is evaluated by eval exp or func 
 * depending on the type of the function
 * @param {E.AFunctionApp} exp 
 * @param {Env} env
 * @returns {V.Value}
 */
// FIXME: I don't understand what you mean by "evaluate" above.
// Usually evaluating an anonymous function is trivial and just constructs
// a closure object.  I don't know what you mean by "add[ing arguments]
// to the closure".
// ANS : What I mean is for (\x -> \y -> x + y) 1 2 we add the arg x = 1 to the
//       closure then start again (by recursion) with the rest of the arguments 
// I also don't understand what "App" means in the function name.
// ANS : "App" means application in this case, admittedly we will always have a 
//       application of function but it's to seperate from function like
//       evaluateFunc where we have the body of the func (not the name) and the
//       args as different arguments, which is the 'general' function evaluation
//       function
function evaluateAFunctionApp(exp, env){
  debug("A Function App", exp);
  if (exp.args.length === 0){
    if (exp.func.type === "LambdaExp"){
      return evaluateFunc(exp.func, [], env);
    }
    return evaluateExp(exp.func, env);
  } else {
    let closure = env.clone();
    if (exp.args[0].type === "TupleExp"){
      if (exp.args[0].elems.length !== exp.func.args[0].elems.length){
        throw new Error("Mismatch between number of arguments given and " + 
          "expected in tuple of anonymous function");
      }
      closure.add(exp.func.args[0].elems[0].name, exp.args[0].elems[0], true);
      exp.args[0].elems.shift();
      exp.func.args[0].elems.shift();

      if (exp.args[0].elems.length === 0){
        exp.args.shift();
        exp.func.args.shift();
      }
    } else {
      closure.add(exp.func.args[0].name, exp.args[0], true);
      exp.args.shift();
      exp.func.args.shift();
    }
    if (exp.func.args.length === 0){
      if (exp.func.type === "LambdaExp"){
        exp.func = exp.func.body;
      }
      else {
        throw new Error("Unhandeled case in Lambda Exp evaluation");
      }
    }
    return evaluateExp(exp, closure);
  }
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