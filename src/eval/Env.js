import { Decl } from "../normalize/Decl.js";
import { Term } from "../normalize/Term.js";
import { Prim, PrimIO } from "./Prim.js";
import { Value, Vint, Vbool, Vfunc, Vstring } from "./Value.js";

//--                   File for environment object definition               --//


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
   * @returns {Term} - Decl or Prim or undefined if declaration doesn't exists
   */
  lookup(name){
    return this.decls[name];
  }


  /**
   * Adds an element to an environment
   * Throws an error if the declaration already exists
   * @param {String} name 
   * @param {Term} term - Decl or Prim
   */
  add(name, term){
    if (this.decls[name] !== undefined){
      throw Error("This declaration already exists in the environment : " 
        + name);
    }
    this.decls[name] = term;
  }

  /**
   * Initialises the environment with all primitive functions
   *  putChar  :: Char -> IO ()  
   *  putStr   :: String -> IO ()  
   *  putStrLn :: String -> IO ()  -- adds a newline  
   *  print
   * https://www.haskell.org/onlinereport/haskell2010/haskellch7.html
   */
  initGlobal(){
    this.add('+', new Prim(
      function add(a, b){
        return new Vint(a.value + b.value);
      }
    , 2));

    this.add('*', new Prim(
      function mul(a, b){
        return new Vint(a.value * b.value);
      }
    , 2));
    

    this.add('-', new Prim(
      function sub(a,b){
        return new Vint(a.value - b.value);
      }
    , 2));
    

    this.add('/', new Prim(
      function div(a, b){
        return new Vint(a.value / b.value);
      }
    , 2));

    this.add("print", new PrimIO(
      function print(a){
        console.log(a.value);
      }
    , 1));

    this.add("==", new Prim(
      function equals(a,b){
        return new Vbool(a.value === b.value);
      }
    , 2));

    this.add("!=", new Prim(
      function diff(a,b){
        return new Vbool(a.value !== b.value);
      }
    , 2));

    this.add("&&", new Prim(
      function and(a,b){
        return new Vbool(a.value && b.value);
      }
    , 2));

        this.add("||", new Prim(
      function or(a,b){
        return new Vbool(a.value || b.value);
      }
    , 2));

  }
}