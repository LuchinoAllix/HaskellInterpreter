import { Term } from "../normalize/Term.js";
import { Decl } from "../normalize/Decl.js"
import { Env } from "./Env.js";
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
  let terms = program.normalizedForm;

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
 * Returns a list of the values evaluated (there can be nested lists)
 * @param {Exp} exp 
 * @param {Env} env 
 * @returns {[V.Value]}
 */
function evaluateExp(exp, env){
  switch (exp.type){
    case "functionApp" :
      let f = lookupGlobalLocal(env, exp.name);
      if (f !== undefined){
        return [evaluateFunc(f, exp.args, env)];
      } else {
        throw Error("function " + exp.name + " is undefined");
      }
    
    case "var" :
      let variable = lookupGlobalLocal(env, exp.name);
      if (variable !== undefined){
        return evaluateExp(variable.branches[0]);
      } else {
        throw Error("variable " + exp.name + " is undefined");
      }

    case "do" :
      let res = []
      for (let e of exp.exps){
        res.push(evaluateExp(e, env)); // can create nested lists
      }
      return res;
    
    case "value" :

      switch (exp.valueType){
        case "integer" :
          return [new Value.Vint(exp.value)];
    
        case "string" :
          return [new Value.Vstring(exp.value)];

        case "boolean" :
          return [new Value.Vbool(exp.value)];

        default :
          throw Error("value type not yet managed in eval : " + exp.valueType);
      }
    
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
 * @returns {V.Value}
 */
function evaluateFunc(decl, args, env){
  if (decl.isPrim() || decl.isPrimIO()){
    // We assume that evalExp returns a list of one element (no do in args)
    return decl.lambdaCall(args.map(x => evaluateExp(x, env)[0]));
  }

  // We can assume we have a manually declared function call
  // the call can have fewer arguments given than requested (currying)
  
  args = args.map(x => evaluateExp(x, env)[0]); // evaluate the function args

  // TODO : manualy defined functions
  throw Error("Manualy defined functions are not yet implemented in eval : "
              + decl.name);
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
 * Function to actually run the program, with all IO functions
 * @param {[V.Vio]} main_decl 
 */
function execute(main_decl){
  main_decl = main_decl.flat(); // required because evalExp can return nested 
                                // lists
  for (let exp of main_decl){
    if (exp.value.type !== "IO"){
      throw Error("Only IO functions can be given to main");
    }
    exp.value.call();
  }
}


