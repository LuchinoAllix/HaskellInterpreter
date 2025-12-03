import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";

//--               File for functions needed to evaluate a term             --//

// Init global env
let global_env = new Env();
global_env.initGlobal();

/**
 * Entry point of evaluation
 * @param {Program} program
 * @returns {Boolean}
 */
export function initEval(program){
  let terms = program.normalizedForm;
  if (terms.length === 1){
    // output(evaluate(terms[0], ??? )); 
    // todo manage env for interactive (need to save env somewhere, but for 
    // that we need to know how interactiveness is managed)
    return true;
  }

  
  //console.log("env init " + JSON.stringify(global_env));


  for (let term of terms){
    if (term.metatype === "EXP"){
      throw Error("In succesion of terms, only declarations are allowed.");
    }
    evaluate(term, global_env); // TODO .copy());
  }
  //console.log("env final " + JSON.stringify(global_env));
  return true;

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
 * 
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
 * 
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


// TODO global env or return it