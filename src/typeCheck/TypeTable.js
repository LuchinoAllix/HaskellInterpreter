import { Constr } from "../normalize/Constr.js";
import * as T from "./TypeO.js";

//--                 File containing Type option for type check             --//

/**
 * Type options is a mapping between types (names) and their definition (constr)
 */
export class TypeTable {

  /**
   * todo
   */
  constructor(){
    this.decls = {};
    this.init();
  }

  /**
   * Determines if a type def exists in the table
   * @param {String} name 
   * @returns { Constr | undefined } - undefined if type doesn't exists
   */
  lookup(name){
    return this.decls[name];
  }

  /**
   * Adds an element to the type option table
   * Throws an error if the type def already exists, unless overide is true
   * @param {String} name
   * @param {Constr} cons
   * @param {Boolean} overide
   */
  add(name, cons, overide = false){
    if (this.decls[name] !== undefined){
      if (!overide){
        throw new Error("This type def already exists in the table : " 
          + name);
      }
    }
    this.decls[name] = cons;
  }

  init(){
    this.add("Integer", new Constr("Integer", [], []));
    this.add("Boolean", new Constr("Boolean", [], []));
    this.add("Char", new Constr("Char", [], []));
    this.add("Unit", new Constr("Unit", [], []));
    this.add("List", new Constr("List", [], ["a"]));
    this.add("Tuple", new Constr("Tuple", [], ["a"]));
    this.add("IO", new Constr("IO", [], [])); //FIXME
    this.add("Just", new Constr("Just", [], [])); //FIXME
    this.add("Maybe", new Constr("Maybe", [], [])); //FIXME
  }
  // this should not be manually done FIXME

}