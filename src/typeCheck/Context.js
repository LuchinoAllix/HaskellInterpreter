import * as T from "./TypeO";

/**
 * Context object definition, used in type inference
 */
export class Context {

  /**
   * Constructor for env, always empty.
   * decls is a dictionnary String (name) -> Term
   */
  constructor(){
    this.decls = {};
  }

  /**
   * Determines if a declaration exists in a context
   * @param {String} name 
   * @returns {T.TypeO} - Type or undefined if declaration doesn't exists
   */
  lookup(name){
    return this.decls[name];
  }


  /**
   * Adds an element to a context
   * Throws an error if the declaration already exists, unless overide is true
   * @param {String} name 
   * @param {Value} val
   * @param {Boolean}
   */
  add(name, val, overide = false){
    if (this.decls[name] !== undefined){
      if (!overide){
        throw new Error("This declaration already exists in the context : " 
          + name);
      }
    }
    this.decls[name] = val;
  }

  /**
   * Initialises the context with all primitive functions type
   */
  initGlobal(){
    this.add('+', new T.TArrow(T.TInt(), T.TArrow(T.TInt(), T.TInt())));
    this.add('*', new T.TArrow(T.TInt(), T.TArrow(T.TInt(), T.TInt())));
    this.add('-', new T.TArrow(T.TInt(), T.TArrow(T.TInt(), T.TInt())));
    this.add('/', new T.TArrow(T.TInt(), T.TArrow(T.TInt(), T.TInt())));
    this.add('neg', new T.TArrow(T.TInt(), T.TInt()));
    this.add('print', new T.TArrow(new ?? , T.TUnit()));

    this.add("==", );
    this.add("!=", );
    this.add("&&", );
    this.add("||", );
    this.add("<=", );
    this.add(">=", );
    this.add("<", );
    this.add(">", );
    this.add("fst", new T.TArrow(T.TApp(T.TTuple(), ????)));
    this.add("snd", );
    this.add("++", );
    this.add(':', );
    this.add(',', );
    this.add('return', );
    this.add(">>", );
    this.add(">>=", );
    this.add("getChar", );
  }

  /**
   * TODO : add function to verify that global env and context have the same 
   * functions definition 
   */

  /**
   * Copy function to return a copy of a context, not a reference
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
   * Adds a comma function to the context
   * Required for tuples
   * @param {String} str 
   */
  addNcommas(str){
    if (this.decls[str] === undefined){
      this.add(str, makeFunc(str.length + 1, []));
    }
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