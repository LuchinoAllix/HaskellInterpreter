import { Constr } from "../normalize/Constr.js";
import { TInt, TypeO } from "./TypeO.js";

//--                 File containing Type option for type check             --//

/**
 * Type options is a mapping between types and their definition (constr)
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
   * @param {TypeO} type
   * @param {Constr} cons
   * @param {Boolean} overide
   */
  add(type, cons, overide = false){
    if (this.decls[type.name] !== undefined){
      if (!overide){
        throw new Error("This type def already exists in the table : " 
          + type.name);
      }
    }
    this.decls[type.name] = cons;
  }

  initGlobal(){
    this.add(TInt(), new Constr("Integer", [], []));
    this.add(TBool(), new Constr("Boolean", [], []));
    this.add(TChar(), new Constr("Char", [], []));
    this.add(TUnit(), new Constr("Unit", [], []));
    this.add(TList(), new Constr("List", [], []));
    this.add(TTuple(), new Constr("Tuple", [], []));
    this.add(TIO(), new Constr("IO", [], []));
    this.add(TJust(), new Constr("Just", [], []));
    this.add(TMaybe(), new Constr("Maybe", [], []));
  }
  // this should not be manually done FIXME
}