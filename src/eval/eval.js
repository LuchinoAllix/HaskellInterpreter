import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";

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
  let terms = program.normalizedForm;
  let local_env = new Env();
  for (let term of terms){
    if (term.metatype === "EXP"){
      throw Error("In succesion of terms, only declarations are allowed.");
    }
    evaluate(term, local_env);
  }

  return true;
}

/**
 * Entry point of evaluation for "compiled" programs
 * @param {Program} program 
 */
export function initEvalInter(program){
  // TODO
}


/**
 * Main function to evaluate an expression
 * TODO determine what is returned
 * @param {Term} term 
 * @param {Env} env 
 * @returns {IO ?}   where should we ensure that we encounter the main ?
 *                   should which functions should we expect for output ?
 *                   putChar  :: Char -> IO ()  
 *                   putStr   :: String -> IO ()  
 *                   putStrLn :: String -> IO ()  -- adds a newline  
 *                   print
 * https://www.haskell.org/onlinereport/haskell2010/haskellch7.html
 */
function evaluate(term, env){
  switch (term.metatype){
    case "EXP" :
      evaluateExp(term, env);
      return env;
    case "DECL" :
      return evaluateDecl(term, env);
    default :
      throw Error("Unknown term type : " + term.metatype);
  }
}

/**
 * Output function, to chose what to do with the final output of each evaluation
 * currently : just print it to the console
 * would be used in interactive mode
 * @param {?} output 
 */
function output(output){
  console.log(output);
}


/**
 * Evaluates a declaration and adds it to the global environment
 * @param {Decl} decl 
 * @param {Env} env 
 */
function evaluateDecl(decl, env){
  if (decl.name === "main"){
    // can there be a decl in a main ? could main have more than one branch ?
    // is there another way for a decl to execute an exp ?
    evaluateExp(decl.branches[0], env);
    return undefined;
  }

  env.add(decl.name, decl);
  return  env;
}

/**
 * Evaluates an expression in a given environement
 * @param {Exp} exp 
 * @param {Env} env 
 */
function evaluateExp(exp, env){
  switch (exp.type){
    case "functionApp" :
      let f = env.lookup(exp.name);
      if (f !== undefined){
        return evaluateFunc(f, exp.args, env);
      } else {
        throw Error("function " + exp.name + " is undefined");
      }
    
    case "var" :
      let variable = env.lookup(exp.name);
      if (variable !== undefined){
        return variable.branches[0].value;
      } else {
        throw Error("variable " + exp.name + " is undefined");
      }

    case "do" :
      for (let e of exp.exps){
        evaluateExp(e, env);
      }
      break;
    
    case "let" :
      throw Error("let not yet managed in eval");
      break;

    case "if" :
      throw Error("if not yet managed in eval");
      break;

    case "case" :
      throw Error("case not yet managed in eval");
      break;

    default :
      throw Error("exp not yet managed in eval : " + exp.type);
    
  }
}

/**
 * Executes a function 
 * @param {Term} decl 
 * @param {[Exp]} args 
 * @param {Env} env 
 * @returns ??
 */
function evaluateFunc(decl, args, env){
  if (decl.isPrim()){
    return decl.call(args.map(x => evaluateExp(x, env)[0]));
  } else if (decl.isFunc()) {
    // TODO evaluate input to know the branch
  } else {
    // TODO create function
    return evaluateFunc(decl, args, env);
  }
}


/**
 * Lookup but inside the global environment and a local one given
 * @param {Env} env 
 * @param {String} name 
 * @returns {Term}
 */
function lookupGlobalLocal(env, name){
  let res = global_env.lookup(name);
  if (res !== undefined){
    return res;
  } 
  res = env.lookup(name);
  if (res !== undefined){
    return res;
  }
  throw Error(name + " is undefined.")
}

/**
 * Allows to reset the global environment
 */
function resetGlobalEnv(){
  global_env = {};
  global_env = global_env.initGlobal();
}
