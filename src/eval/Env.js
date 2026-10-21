import { Prim } from "./Prim.js";
import { VList, Vtuple, Vio, Unit, Value, Vfunc, VConstr, Vint, 
         Vbool } from "./Value.js";
import { applyFunc } from "./eval.js";
import { popVal } from "./State.js";

//--                   File for environment object definition               --//

export let outputs = [];

let state ;

export function initStateForEnv(nState){
  state = nState;
}

export function resetOutputs(){
  outputs = [];
}

/**
 * Environment object definition, used in evaluation
 * An environement is a mapping of names of primitives to their actual Prim
 * definitions 
 */
export class Env {

  /**
   * Constructor for env, always empty.
   * decls is a dictionnary String (name) -> Value
   */
  constructor(){
    this.decls = {};
    this.isEnv = true;
  }

  /**
   * Determines if a declaration exists in an environment
   * @param {String} name 
   * @returns { Value | undefined } undefined if declaration doesn't exists
   */
  lookup(name){
    let res = this.decls[name];
    if(res !== undefined && !state.rte.globalLocalEnvKeys.includes(name)){ // not ideal for efficency
      state.rte.globalLocalEnvKeys.push(name);
      state.rte.globalLocalEnv.push([name, res]);
    }
    return res;
  }


  /**
   * Adds an element to an environment
   * Throws an error if the declaration already exists, unless overide is true
   * @param {String} name 
   * @param {Value} val
   * @param {Boolean}
   */
  add(name, val, overide = false){
    // state != undefined allows to only add to global used env the one added after
    // state is initialized, i.e. user entered
    if(state !== undefined && !state.rte.globalLocalEnvKeys.includes(name)){ // not ideal for efficency
      state.rte.globalLocalEnvKeys.push(name);
      state.rte.globalLocalEnv.push([name, val]);
    }
    if (this.decls[name] !== undefined){
      if (!overide){
        throw new Error("This declaration already exists in the environment : " 
          + name);
      }
    }
    this.decls[name] = val;
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
    this.add('+', new Prim(a => new Prim(b => Vint(a.value + b.value, "Integer"))));

    this.add('*', new Prim(a => new Prim(b => Vint(a.value * b.value))));
    
    this.add('-', new Prim(a => new Prim(b => Vint(a.value - b.value))));

    this.add('neg', new Prim(a => Vint(- a.value)));

    this.add('/', new Prim(a => new Prim(b => Vint(Math.round(a.value / b.value)))));
    
    this.add('mod', new Prim(a => new Prim(b => Vint(a.value % b.value))));

    this.add("print", new Prim(a => {
      var str= makeStr(a); 
      console.log(str);    
      outputs.push(str);    
      state.result = str;  
      return new Vio(
      function print(){
        return Unit ;
      }
    )}));

    this.add("==", 
      new Prim(a => new Prim(b => Vbool(equal(a,b)))));

    this.add("!=", 
      new Prim(a => new Prim(b => Vbool(a.value !== b.value))));
    
    this.add("&&", new Prim(a => new Prim(b => Vbool(a.value && b.value))));
    
    this.add("||", new Prim(a => new Prim(b => Vbool(a.value || b.value))));

    this.add("<=", new Prim(a => new Prim(b => Vbool(a.value <= b.value))));

    this.add(">=", new Prim(a => new Prim(b => Vbool(a.value >= b.value))));
    
    this.add("<", new Prim(a => new Prim(b => Vbool(a.value < b.value))));
    
    this.add(">", new Prim(a => new Prim(b => Vbool(a.value > b.value))));

    this.add("map", new Prim(f => new Prim(l => map(f,l))));

    this.add("fst", new Prim(
      function fst(a){
        if (a.type !== "tuple"){
          throw new Error("fst can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw new Error("fst can only be applied to tuples of 2 elements, not"
             + a.value.length);
        }
      return a.value[0];  
      }));

    this.add("snd", new Prim(
      function snd(a){
        if (a.type !== "tuple"){
          throw new Error("snd can only be applied to tuple, not " + a.type);
        } else if (a.value.length !== 2){
          throw new Error("snd can only be applied to tuples of 2 elements, not"
             + a.value.length);
        }
      return a.value[1];  
      }));

    this.add("++", new Prim( a => new Prim(b => {
      if (a.type === "EmptyList"){
        return b;
      } else if (b.type === "EmptyList"){
        return a; 
      }
      let elem = a;
      while(elem.snd.type !== "EmptyList"){
        elem = elem.snd;
      }
      elem.snd = b
      return a})));

    this.add(':', new Prim(a => new Prim(b => {
      return new VList(a, b);
    })));

    this.add(',', new Prim(a => new Prim(b => new Vtuple([a, b]))));

    this.add('return', new Prim(() => new Vio(a => a)));

    this.add(">>", new Prim(a => new Prim(b => new Vio(() => {
      state.pushCall(b.func, []);
      state.pushCall(a.func, []);
      // not ideal, every print will be run at the end... FIXME
    }))));

    this.add(">>=", new Prim(a => new Prim(b => new Vio(() => {
      state.pushCall((a) => a.func(), [popVal]);
      state.pushCall(applyFunc, [popVal, b]);
      state.pushCall(a.func, []);
    }))));

    this.add("Just", new Prim(a => new VConstr("Just", [a])));

    this.add("Nothing", new VConstr("Nothing"));
    
    //this.add("getChar", new Prim (() => new Vio(() => new Vchar("a"))));
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

/**
 * Function used in the print primitive, can be seen as a pretty printer
 * Converts a value into a string
 * @param {Value} val 
 * @returns {String}
 */
function makeStr(val){
  if (val.type === "Char"){
    return "\'" + val.value + "\'";
  }
  if (val.type === "unit"){
    return "()";
  } else if (val.type === "EmptyList"){
    return "[]";
  } else if (val.type !== "tuple" && Array.isArray(val.value)){ // constr
    let res = '' + val.type;

    for (let a of val.value){res += ' ' + makeStr(a);} 
    return res;
  }

  let bord = null;
  if (val.type === "tuple"){
    bord = "()";
    let res = bord[0];
    for (let t of val.value){
      res += makeStr(t);
      res += ",";
    }
    return res.slice(0,-1) + bord[1] ;
  } else if (val.type === "list"){
    bord = "[]";
    if (val.fst === null){
      return bord;
    } else if (val.fst.type === "Char"){
      // converting lists of char to strings
      return "\"" + charListToStr(val) +  "\"";
    }
  }

  if (bord !== null){
    let fst = makeStr(val.fst);
    if (val.snd.type === "EmptyList"){
      return bord[0] + fst + bord[1];
    }
    let snd = makeStr(val.snd);
    snd = snd.substring(1, snd.length - 1);
    return bord[0] + fst + ',' + snd + bord[1];
  } else {
    return val.value;
  }
}

/**
 * Turns a vlist of chars into a string
 * @param {VList} val 
 * @returns {String}
 */
function charListToStr(val){
  let res = val.fst.value;
  if (val.snd.type === 'EmptyList'){ return res ; }
  return res + charListToStr(val.snd);
}

/**
 * function used in the map primitive
 * implementation of map
 * @param {Vfunc} f 
 * @param {VList} l 
 * @returns {VList}
 */
function map(f,l){
  if (l.type === "EmptyList"){ state.pushVal(l); }
  else {
    state.pushCall((x,y) => state.pushVal(new VList(y,x)), [popVal, popVal]);
    state.pushCall(map, [f, l.snd]);
    state.pushCall(applyFunc, [l.fst, f]);
  }
}

function equal(a,b){
  if (a.type === 'list' && b.type ==='list'){
    return equal(a.fst, b.fst) && equal(a.snd, b.snd);
  } else if (a.type === 'tuple' && b.type === 'tuple'){
    if (a.value.length !== b.value.length){
      return false ;
    }
    for (let i = 0; i < a.value.length; i++){
      if (! equal(a.value[i], b.value[b])){
        return false ;
      }
    }
    return true ;
  } else if (a.type === "EmptyList" && b.type === "EmptyList"){
    return true
  } 
  return a.value === b.value ;
}

