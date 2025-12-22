import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import { Exp } from "../normalize/Exp.js";
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
  if (terms.constructor !== Array){ // because if there is only main
    terms = [terms];
  }
  for (let term of terms){
    if (term.metatype === "EXP"){
      throw Error("In succesion of terms at toplevel, only declarations " + 
        "are allowed.");
    }
    evaluateDecl(term);
  }

  execute(global_env.lookup("main")); 

  return true;
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
 * @param {Exp} exp or V.Value, not ideal but not problematic
 * @param {Env} env 
 * @returns {[V.Value]}
 */
function evaluateExp(exp, env){

  if (exp.metatype === "VALUE"){
    return [exp];
  }

  switch (exp.type){
    
    case "functionApp" :
      let f = lookupGlobalLocal(env, exp.name);
      if (f !== undefined){
        return [evaluateFunc(f, exp.args, env)];
      } else {
        throw Error("function " + exp.name + " is undefined");
      }
    
    case "aFunctionApp" :
      return evaluateLambda(exp, env);

    case "var" :
      let variable = lookupGlobalLocal(env, exp.name);
      if (variable !== undefined){
        if (variable.metatype === "DECL"){
          return evaluateExp(variable.branches[0], env);
        }
        return evaluateExp(variable, env); // We assume it's an EXP metatype
      } else {
        throw Error("variable " + exp.name + " is undefined");
      }

    case "do" :
      let res = []
      for (let e of exp.exps){
        res = res.concat(evaluateExp(e, env));
        env = new Env(); 
                  // Reseting the env because it is not kept in different 
                  // branches of a do expression
                  // Is this true ? #HELP
      }
      return res;
    
    case "value" :

      switch (exp.valueType){
        case "integer" :
          return [new V.Vint(exp.value)];
    
        case "String" :
          return [new V.Vstring(exp.value)];

        case "Boolean" :
          return [new V.Vbool(exp.value)];

        case "Special" :
          if (isMTArray(exp.value)){
            return [new V.VList([])];
          }

        default :
          throw Error("value type not yet managed in eval : " + exp.valueType);
      }
    
    case "let" :
      return evaluateLet(exp, env);

    case "if" :
      // we suppose evaluateExp returns a list of one element
      let cond = evaluateExp(exp.condition, env)[0];
      if (cond.type !== "bool"){
        throw Error("Expression in if condition did not evaluate to boolean.");
      } else if (cond.value){
        return evaluateExp(exp.success, env);
      } else {
        return evaluateExp(exp.fail, env);
      }

    case "TupleExp" :
      return [new V.Vtuple(exp.elems.map(x => evaluateExp(x,env)[0]))];

    case "ListExp" :
      return [new V.VList(exp.elems.map(x => evaluateExp(x,env)[0]))];

    case "curFunctionApp" :
        return [evaluateFunc(evaluateExp(exp.func, env)[0], exp.args, env)];

    case "case" :
      return evaluateCase(exp, env);

    case "ListPatternExp" :
      return evaluateListPatternExp(exp, env);
 
    default :
    //console.log(exp)
      throw Error("exp not yet managed in eval : " + exp.type);
    
  }
}

/**
 * Executes a function 
 * @param {Term} decl 
 * @param {[Exp]} args 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFunc(decl, args, env){
  if (decl.type === "branch"){
    decl = decl.branchBody;
  }
  if (decl.isPrim() || decl.isPrimIO()){
    // We assume that evalExp returns a list of one element (no do in args)
    return decl.lambdaCall(args.map(x => evaluateExp(x, env)[0]));
  }

  // We can assume we have a manually declared function call
  // the call can have fewer arguments given than requested (currying)
  
  //args = args.map(x => evaluateExp(x, env)[0]); // evaluate the function args
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
    args = func.args.concat(args);

    if (args.length < func.nbArgs){
      throw new Error("Not enough arguments given to function : " + func.name);
    } else {
      return evaluateFuncPM(func, args, env);
    }
  }
}


/**
 * Executes a function that requites pattern matching
 * We assume all the args are in args
 * There can be more args than required for currying
 * @param {Term} func 
 * @param {[Exp]} args 
 * @param {Env} env 
 * @returns {V.Value}
 */
function evaluateFuncPM(func, args, env){
  // TODO
  // need to eval args
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
 * @param {[V.Vio]} main_decl 
 */
function execute(main_decl){
  for (let exp of main_decl){
    if (exp.type !== "IO"){
      throw new Error("Only IO functions can be given to main");
    }
    exp.value.call();
  }
}

/**
 * Evaluates an let exp (if is has an in part, if not breaks)
 * @param {LetExp} exp 
 * @param {Env} env 
 * @returns {[V.Value]}
 */
function evaluateLet(exp, env){
  for (let decl of exp.decls){
    env.add(decl.name, decl.branches[0], true);
    // Over writing decls that already exits, i'm not sure it's the best idea
    // but i don't see where they could be used
    // Is this a good idea ? #HELP
  }
  return evaluateExp(exp.body, env);
}

/**
 * todo
 * @param {Exp} exp 
 * @param {Env} env
 * @returns {[V.Value]}
 */
function evaluateLambda(exp, env){
  if (exp.args.length === 0){
    return evaluateExp(exp.func.body, env);
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
    return evaluateExp(exp, closure);
  }
}

/**
 * todo
 * @param {Exp} exp 
 * @param {Env} env
 * @returns {[V.Value]}
 */
function evaluateCase(exp, env){
  let val = evaluateExp(exp.exp, env)[0];
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
 * todo
 * @param {V.Value} value 
 * @param {Exp} exp 
 * @returns {[[Exp]]}
 */
function match(value, exp){
  // we assume the pattern matching can only be on one element
  switch (exp.type){

    case "TupleExp" :
      if (value.type !== "tuple"){
        throw new Error("Pattern matching in case not of same type, tuple" +
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
 * TODO
 * @param {*} exp 
 * @param {*} env 
 * @returns 
 */
function evaluateListPatternExp(exp, env){
  let newList = [];
  newList.push(evaluateExp(exp.head, env)[0]);
  if (exp.rest.type === "ListExp"){
    newList = newList.concat(evaluateExp(exp.rest, env)[0].value);
  } else if (!isMTArray(exp.rest.value)){
    let tmp = evaluateExp(exp.rest, env);
    if (tmp[0].type === "list"){
      tmp = tmp[0].value;
    }
    newList = newList.concat(tmp);
  }
  return [new V.VList(newList)];
}


/**
 * Determines if a given variable is the empty array
 * Required because js compares by reference, so array === [] is always false
 * @param {[]} array 
 * @returns {Boolean}
 */
function isMTArray(array){
  return Array.isArray(array) && array.length === 0
}