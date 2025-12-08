import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
import { Value } from "./Value.js";

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
      throw Error("In succesion of terms at toplevel, only declarations " + 
        "are allowed.");
    }
    evaluateDecl(term);
  }

  execute(global_env.lookup("main")); 
  // should verify that there is at least one IO ?

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
 * TODO determine what is returned
 * @param {Term} term 
 * @param {Env} env 
 * @returns {IO ?}
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
 * would need to verify first that the type of the expression isn't IO
 * @param {?} output 
 */
function output(output){
  console.log(output);
}


/**
 * Adds a declaration to the global env
 * Notes :
 *  - Technically a main function is not the only way to execute code in Haskell
 *    but we assume it is for the sake of simplicity.
 *  - We assume declaration can only be at the top level, let's or where are
 *    considered expressions.
 *  - We assume that there can be no declarations inside main, there can be 
 *    'inless' let's but they are considered expressions.
 * @param {Decl} decl 
 */
function evaluateDecl(decl){ 
  global_env.add(decl);
}

/**
 * Evaluates an expression in a given (local) environement
 * Returns a list of the values evaluated (there can be nested lists)
 * @param {Exp} exp 
 * @param {Env} env 
 * @returns {[Value]}
 */
function evaluateExp(exp, env){
  switch (exp.type){
    case "functionApp" :
      let f = env.lookupGlobalLocal(exp.name);
      if (f !== undefined){
        return [evaluateFunc(f, exp.args, env)];
      } else {
        throw Error("function " + exp.name + " is undefined");
      }
    
    case "var" :
      let variable = env.lookupGlobalLocal(exp.name);
      if (variable !== undefined){
        return [new Value("?", variable.branches[0].value)];
      } else {
        throw Error("variable " + exp.name + " is undefined");
      }

    case "do" :
      let res = []
      for (let e of exp.exps){
        res.push(evaluateExp(e, env)); // can create nested lists
      }
      return res;
    
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
 * @returns {Value}
 */
function evaluateFunc(decl, args, env){
  if (decl.isPrim()){
    // We assume that evalExp returns a list of one element (no do in args)
    
    return decl.lambdaCall(args.map(x => evaluateExp(x, env)[0]));
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
  global_env = {};
  global_env = global_env.initGlobal();
}


/**
 * todo
 */
function execute(){

}
