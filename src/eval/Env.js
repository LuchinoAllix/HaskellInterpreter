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
    this.decls = {};
  }

  /**
   * Determines if a declaration exists in an environment
   * @param {String} name 
   * @returns {Term} - Decl or Prim
   */
  lookup(name){
    return this.decls[name];
  }


  /**
   * Adds an element to an environment
   * @param {String} name 
   * @param {Term} term - Decl or Prim
   */
  add(name, term){
    this.decls[name] = term;
  }

  /**
   * Initialises the environment with all primitive functions
   */
  initGlobal(){
    this.add('+', new Prim(
      function add(a, b){
        return a + b;
      }
    , 2));

    this.add('*', new Prim(
      function mul(a, b){
        return a * b;
      }
    , 2));
    

    this.add('-', new Prim(
      function sub(a,b){
        return a - b;
      }
    , 2));
    

    this.add('/', new Prim(
      function div(a, b){
        return a / b;
      }
    , 2));
    

    this.add("print", new Prim(
      function print(a){
        console.log(a);
      }
    , 1));
    

    this.add("do", new Prim(
      function doa(a){
        return a;
      }
    , 1));

  }
}