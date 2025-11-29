import { Term } from "./Term.js";
import { ValExp } from "./normalize/Exp.js";

//--               File for functions needed to evaluate a term             --//


/**
 * Entry point of evaluation
 * @param {[Term]} terms 
 * @returns {Boolean}
 */
export function initEval(terms){
  if (terms.length === 1){
    output(evaluate(terms[0], initGlobalEnv())); 
    // todo manage env for interactive (need to save env somewhere, but for 
    // that we need to know how interactiveness is managed)
    return true;
  }

  let global_env = initGlobalEnv();
  for (let term of terms){
    if (term.metatype === "EXP"){
      throw Error("In succesion of terms, only declarations are allowed.");
    }
    output(evaluate(term, global_env));
  }
  return true;

}


/**
 * Main function to evaluate an expression
 * TODO determine what is returned
 * @param {Term} term 
 * @param {?} env 
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
      return evaluaterExp(term, env);
    case "DECL" :
      return evaluateDecl(term, env);
    default :
      throw Error("Unknown term type : " + term.metatype);
  }
}

/**
 * Output function, to chose what to do with the final output of each evaluation
 * currently : just print it to the console
 * @param {?} output 
 */
function output(output){
  console.log(output);
}

/**
 * 
 * @returns 
 */
function initGlobalEnv(){
  // todo
  return []
}

/**
 * 
 * @param {*} decl 
 * @param {*} env 
 */
function evaluateDecl(decl, env){

}

/**
 * 
 * @param {*} decl 
 * @param {*} env 
 */
function evaluaterExp(decl, env){

}
