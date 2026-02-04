import { TypeO } from "./TypeO.js";

/**
 * Substitions class, contains a dict of mapping names to types
 */
export class Subs {

  /**
   * Initialises the dictionnary of substitutions
   */
  constructor(){
    this.subs = {};
  }

  /**
   * Allow to add a substitution to the dictionnary
   * @param {String} name 
   * @param {TypeO} type 
   */
  add(name, type){
    if (this.subs[name] !== undefined){
      throw new Error("This substitution already exists  : " + name);
    } else {
      this.subs[name] = type;
    }
  }

  /**
   * Allows to merge two subs
   * @param {Subs} newSubs 
   */
  merge(newSubs){
    for (let subKey of Object.keys(newSubs)){
      this.subs.add(subKey, newSubs.subs[subKey]);
    }
  }

}

/**
 * Creates a new sub but with already one mapping (given as argument)
 * @param {String} name 
 * @param {TypeO} type 
 * @returns {Subs}
 */
export function newSub(name, type){
  let subs = new Subs();
  subs.add(name, type);
  return subs;
}