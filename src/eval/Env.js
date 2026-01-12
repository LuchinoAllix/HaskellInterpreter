import { Term } from "../normalize/Term.js";
import { Prim, PrimIO } from "./Prim.js";
import { Vint, Vbool, VList, Vtuple } from "./Value.js";

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
   * Throws an error if the declaration already exists, unless overide is true
   * @param {String} name 
   * @param {Term} term - Decl, Exp  or Prim
   * @param {Boolean}
   */
  add(name, term, overide = false){
    if (this.decls[name] !== undefined){
      if (!overide){
        throw Error("This declaration already exists in the environment : " 
          + name);
      }
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
      function sub(a, b){
        return new Vint(a.value - b.value);
      }
    , 2));
    

    this.add('/', new Prim(
      function div(a, b){
        return new Vint(a.value / b.value);
      }
    , 2));

    this.add("print", new PrimIO( // should automatially convert list of chars 
                                  // to sring ? #fixme
      function print(a){
        function makeStr(val){
          let bord = null;
          if (val.type === "tuple"){
            bord = "()";
          } else if (val.type === "list"){
            bord = "[]";
            if (val.value.length === 0){
              return bord;
            }
          }

          if (bord !== null){
            let res = bord[0];
            for (let t of val.value){
              res += makeStr(t);
              res += ",";
            }
            return res.slice(0,-1) + bord[1] ;
          } else {
            return val.value;
          }
        }
        let str = makeStr(a);
        console.log(str);
        return str; // for verification puposes
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

    this.add("<", new Prim(
      function lt(a,b){
        return new Vbool(a.value < b.value);
      }
    , 2));

    this.add("<=", new Prim(
      function le(a,b){
        return new Vbool(a.value <= b.value);
      }
    , 2));

    this.add(">=", new Prim(
      function ge(a,b){
        return new Vbool(a.value >= b.value);
      }
    , 2));

    this.add(">", new Prim(
      function gt(a,b){
        return new Vbool(a.value > b.value);
      }
    , 2));

    this.add("fst", new Prim(
      function fst(a){
        if (a.type !== "tuple"){
          throw Error("fst can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw Error("fst can only be applied to tuples of 2 elements, not" + 
            a.value.length);
        }
      return a.value[0];  
      }
    , 1));

    this.add("snd", new Prim(
      function snd(a){
        if (a.type !== "tuple"){
          throw Error("snd can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw Error("snd can only be applied to tuples of 2 elements, not" + 
            a.value.length);
        }
      return a.value[1];  
      }
    , 1));

    this.add("++", new Prim(
      function concat(a, b){
        if (a.type !== "list" || b.type !== "list"){
          throw new Error("++ can only be applied between lists, not " + a.type  
            + " and " + b.type);
        }
      return new VList(a.value.concat(b.value));  
      }
    , 2));

    this.add(':', new Prim(
      function consList(a, b){
        return new VList([a, b]);
      }
    , 2));

    this.add(',', new Prim(
      function consTuple(a, b){
        return new Vtuple([a, b]);
      }
    , 2));
  }

  /**
   * Copy function to return a copy of an env, not a reference
   * @returns {Env}
   */
  clone(){
    let tmp = new Env();
    for (let decl in this.decls){
      tmp.add(decl, this.decls[decl]); // decl is a ref
    }
    return tmp;
  }

  addNcommas(str){
    this.add(str, new Prim(
      function consNTuple(...a){
        return new Vtuple(a);
      }
    , str.length + 1));
  }
}