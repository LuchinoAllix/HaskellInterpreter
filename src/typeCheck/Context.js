import * as T from "./TypeO.js";


// tmetavar variables for primitives 
const print = T.freshVar();
const eq = T.freshVar();
const neq = T.freshVar();
const and = T.freshVar();
const or = T.freshVar();
const lt = T.freshVar();
const leq = T.freshVar();
const gt = T.freshVar();
const geq = T.freshVar();
const fst1 = T.freshVar();
const fst2 = T.freshVar();
const snd1 = T.freshVar();
const snd2 = T.freshVar();
const concat = T.freshVar();
const cons = T.freshVar();
const comma1 = T.freshVar();
const comma2 = T.freshVar();
const map1 = T.freshVar();
const map2 = T.freshVar();
const varReturn = T.freshVar();
const varThen1 = T.freshVar();
const varThen2 = T.freshVar();
const varBind1 = T.freshVar();
const varBind2 = T.freshVar();
const just = T.freshVar();
const maybe = T.freshVar();

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
   * @param {Boolean} overide
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
    this.add('+', new T.TArrow(T.TInt(), new T.TArrow(T.TInt(), T.TInt())));
    this.add('*', new T.TArrow(T.TInt(), new T.TArrow(T.TInt(), T.TInt())));
    this.add('-', new T.TArrow(T.TInt(), new T.TArrow(T.TInt(), T.TInt())));
    this.add('/', new T.TArrow(T.TInt(), new T.TArrow(T.TInt(), T.TInt())));
    this.add('neg', new T.TArrow(T.TInt(), T.TInt()));

    this.add('print', new T.TForall([print.name], 
                                    new T.TArrow(print, 
                                      new T.TApp(T.TIO(), T.TUnit())))); 

    this.add("==", new T.TForall([eq.name], 
                                 new T.TArrow(eq, 
                                  new T.TArrow(eq, T.TBool()))));
    this.add("!=", new T.TForall([neq.name], 
                                 new T.TArrow(neq, 
                                  new T.TArrow(neq, T.TBool()))));
    this.add("||", new T.TForall([or.name], 
                                 new T.TArrow(or, 
                                  new T.TArrow(or, T.TBool()))));
    this.add("&&", new T.TForall([and.name], 
                                 new T.TArrow(and, 
                                  new T.TArrow(and, T.TBool()))));
    this.add("<", new T.TForall([lt.name], 
                                 new T.TArrow(lt, 
                                  new T.TArrow(lt, T.TBool()))));
    this.add(">", new T.TForall([gt.name], 
                                 new T.TArrow(gt, 
                                  new T.TArrow(gt, T.TBool()))));
    this.add("<=", new T.TForall([leq.name], 
                                 new T.TArrow(leq, 
                                  new T.TArrow(leq, T.TBool()))));
    this.add(">=", new T.TForall([geq.name], 
                                 new T.TArrow(geq, 
                                  new T.TArrow(geq, T.TBool()))));

    // Very repetitive, should find an other way or it's fine ?

    this.add("fst", new T.TForall([fst1.name, fst2.name],
      new T.TArrow(new T.TApp(new T.TApp(T.TTuple(), fst1), fst2), fst1)));

    this.add("snd", new T.TForall([snd1.name, snd2.name],
      new T.TArrow(new T.TApp(new T.TApp(T.TTuple(), snd1), snd2), snd2)));

    // Where do we add the verification that fst and snd can only be called on
    // tuples of size two ? Or does this yield from the fact that we only have 
    // two TApps ?

    this.add("++", new T.TForall([concat.name],
      new T.TArrow(new T.TApp(T.TList(), concat), 
        new T.TArrow(new T.TApp(T.TList(), concat), 
          new T.TApp(T.TList(), concat)))));
    
    this.add(":", new T.TForall([cons.name],
      new T.TArrow(cons, 
        new T.TArrow(new T.TApp(T.TList(), cons), 
          new T.TApp(T.TList(), cons)))));
      
    this.add(",", new T.TForall([comma1.name, comma2.name],
      new T.TArrow(comma1, new T.TArrow(comma2, new T.TApp(
        new T.TApp(T.TTuple(), comma1), comma2)))));

    this.add("map", new T.TForall([map1.name, map2.name],
      new T.TArrow(
        new T.TArrow(map1, map2), 
        new T.TArrow(
          new T.TApp(T.TList(), map1), 
          new T.TApp(T.TList(), map2)))));

    // ∀ a m. a → m a
    this.add('return', new T.TForall([varReturn.name],
      new T.TArrow(varReturn, new T.TApp(T.TIO(), varReturn))));
    
    // ∀ a b m. m a → m b → m b
    this.add('>>', new T.TForall([varThen1.name, varThen2.name],
      new T.TArrow(
        new T.TApp(T.TIO(), varThen1),
        new T.TArrow(
          new T.TApp(T.TIO(), varThen2),
          new T.TApp(T.TIO(), varThen2)))));

    // ∀ a b m. m a → (a → m b) → m b
    this.add('>>=', new T.TForall([varBind1.name, varBind2.name],
      new T.TArrow(
        new T.TApp(T.TIO(), varBind1),
        new T.TArrow(
            new T.TArrow(
              varBind1,
              new T.TApp(T.TIO(), varBind2)),
            new T.TApp(T.TIO(), varBind2)))));

    this.add("Just", new T.TForall([just.name],
      new T.TArrow(
        just, 
        new T.TApp(T.TMaybe(), just))));

    this.add("Maybe", new T.TForall([maybe.name],
      new T.TArrow(
        maybe, 
        new T.TApp(T.TMaybe(), maybe))));

    //this.add("getChar", ); // TODO
  }

  // TODO : add function to verify that global env and gloabl context have the 
  // same functions definition 

  /**
   * Copy function to return a copy of a context, not a reference
   * @returns {Context}
   */
  clone(){
    let tmp = new Context();
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
 * Makes a curryfied type that take n arguments (for comma functions)
 * @param {Integer} n number of recursive calls required
 * @returns {Value}
 */
function makeFunc(n){
  let forAlls, arrows ;
  let lstForall, lstArrow, lstApp;
  for (let i = 0; i < n; i++){
    let tvar = T.freshVar();
    let nForAll = new T.TForall([tvar.name], null); 
    let nArrow = new T.TArrow(tvar, null);
    let nApp;
    if (i === 0){
      forAlls = nForAll;
      arrows = nArrow;
      nApp = new T.TApp(new T.TBuiltin(','.repeat(n)), tvar);
    } else {
      lstForall.body = nForAll;
      lstArrow.to = nArrow;
      nApp = new T.TApp(lstApp, tvar);
      lstApp = nApp;
    }
    lstForall = nForAll;
    lstArrow = nArrow;
    lstApp = nApp
  }
  lstArrow.to = lstApp;
  lstForall.body = arrows;
  return forAlls;
}


