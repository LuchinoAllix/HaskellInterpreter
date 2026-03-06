import { Constr } from "../normalize/Constr.js";
import { FunctionApp, VarExp } from "../normalize/Exp.js";
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

  initConstr(){
    this.add("Maybe", new Constr("Maybe", [
      new FunctionApp(new VarExp("Just"), new VarExp("a")), 
      new VarExp("Nothing")
    ], ["a"]));
  }

  // temp idea, should be moved to another file / object type
  // maps the option to it's arity
  initOption(){
    this.add("Just", 1);
    this.add("Nothing", 0);
  }


}