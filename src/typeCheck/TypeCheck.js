import { Program } from "../objects/Program.js";
import { Decl } from "../normalize/Decl.js";
import * as T from "./TypeO.js";

//--        File containing functions to type check the program             --//

/**
 * Verifies that a given program type checks
 * This is the point of entry function for type checking
 * 
 * @param {Program} program
 * @returns {Boolean}
 */
export function typeCheck(program){
  annotate(program.normalizedForm);
  return true;
}

/**
 * TODO
 * @param {[Decl]} decls 
 */
function annotate(decls){
  for (let decl of decls){
    if (!decl.isAnnotated()){
        // TODO
    }
  }
  
}

function unify(){
    //todo
}

function occursCheck(){
    //todo
}