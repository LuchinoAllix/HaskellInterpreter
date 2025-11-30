import { Decl } from "../normalize/Decl.js";
import { Term } from "../normalize/Term.js";
import { Prim } from "./Prim.js";

//--                   File for environment object definition                --//


/**
 * Environment object definition, used in evaluation
 */
export class Env {

  /**
   * Constructor for env, always empty.
   * decls is a dictionnary String (name) -> Term
   */
  constructor(){
    this.decls = {}
  }

  /**
   * Determines if a declaration exists in an environment
   * @param {Decl} decl 
   * @returns {Term} - Decl or Prim
   */
  lookup(decl){
    return this.decls[decl.name];
  }


  /**
   * Adds an element to an environment
   * @param {Decl} decl 
   * @param {Term} term - Decl or Prim
   */
  add(decl, term){
    this.decls[decl.name] = term;
  }

  /**
   * Initialises the environment with all primitive functions
   */
  initGlobal(){
    this.add('+', new Prim(
      function add(a, b){
        return a + b;
      }
    ));

    this.add('*', new Prim(
      function mul(a, b){
        return a * b;
      }
    ));

    this.add('-', new Prim(
      function sub(a,b){
        return a - b;
      }
    ));

    this.add('/', new Prim(
      function div(a, b){
        return a / b;
      }
    ));

    this.add("print", new Prim(
      function print(a){
        console.log(a);
      }
    ));
  }
}