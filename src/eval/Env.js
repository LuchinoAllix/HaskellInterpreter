import { Term } from "../normalize/Term.js";
import { Prim, PrimIO } from "./Prim.js";
import { Vint, Vbool, VList, Vtuple, makeVList, Vio, Vfunc, 
         Unit } from "./Value.js";
import { applyFunc } from "./eval.js";

//--                   File for environment object definition               --//

export let outputs = [];

export function resetOutputs(){
  outputs = [];
}

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
        throw new Error("This declaration already exists in the environment : " 
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
    this.add('+', new Prim(a => new Prim(b => new Vint(a.value + b.value))));

    this.add('*', new Prim(a => new Prim(b => new Vint(a.value * b.value))));
    
    this.add('-', new Prim(a => new Prim(b => new Vint(a.value - b.value))));

    this.add('/', new Prim(a => new Prim(b => new Vint(a.value / b.value))));

    this.add("print", new PrimIO( // should automatially convert list of chars 
                                  // to sring ? #fixme
      function print(a){
        function makeStr(val){
          if (val.type === "unit"){
            return "()";
          }
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
        outputs.push(str);
        return Unit ;
      }
    ));

    this.add("==", 
      new Prim(a => new Prim(b => new Vbool(a.value === b.value))));

    this.add("!=", 
      new Prim(a => new Prim(b => new Vbool(a.value !== b.value))));
    
    this.add("&&", new Prim(a => new Prim(b => new Vbool(a.value && b.value))));
    
    this.add("||", new Prim(a => new Prim(b => new Vbool(a.value || b.value))));

    this.add("<=", new Prim(a => new Prim(b => new Vbool(a.value <= b.value))));

    this.add(">=", new Prim(a => new Prim(b => new Vbool(a.value >= b.value))));
    
    this.add("<", new Prim(a => new Prim(b => new Vbool(a.value < b.value))));
    
    this.add(">", new Prim(a => new Prim(b => new Vbool(a.value > b.value))));

    this.add("fst", new Prim(
      function fst(a){
        if (a.type !== "tuple"){
          throw new Error("fst can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw new Error("fst can only be applied to tuples of 2 elements, not"
             + a.value.length);
        }
      return a.value[0];  
      }
    , 1));

    this.add("snd", new Prim(
      function snd(a){
        if (a.type !== "tuple"){
          throw new Error("snd can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw new Error("snd can only be applied to tuples of 2 elements, not"
             + a.value.length);
        }
      return a.value[1];  
      }
    , 1));

    this.add("++", new Prim( a => new Prim(b => {
      if (a.type !== "list" || b.type !== "list"){
        throw new Error("++ can only be applied between lists, not " + a.type  
          + " and " + b.type);
      }
      return makeVList(a.value.concat(b.value))})));

    this.add(':', new Prim(a => new Prim(b => new VList([a, b]))));

    this.add(',', new Prim(a => new Prim(b => new Vtuple([a, b]))));

    this.add('return', new Prim(a => new Vio (new Prim(()=> a))));

    this.add(">>", new Prim(a => 
      new Prim(b =>
        new Vio(new Prim(() => {
          a.exec();
          return b.exec();
        }), null ))));

    this.add(">>=", new Prim(a => 
      new Prim(b =>
        new Vio(new Prim(() => {
          let first  = a.exec();
          let lambda = applyFunc(b, first);
          return lambda.exec();
        }), null ))));
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

  /**
   * Adds a comma function to the env
   * Required for tuples
   * @param {String} str 
   */
  addNcommas(str){
    this.add(str, makeFunc(str.length + 1, []));
  }
}

/**
 * Makes a curryfied function that take n arguments (for comma functions)
 * @param {Integer} n number of recursive calls required
 * @param {[any]} list arguments to the recursive calls
 * @returns {Value}
 */
function makeFunc(n, list){
  if (n === 0){
    return new Vtuple(list)
  } else {
    return new Prim(a => makeFunc(n-1, [...list, a]));
  }
}