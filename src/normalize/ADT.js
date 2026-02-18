import { TypeO } from "../typeCheck/TypeO";

/**
 * 
 */
export class ADT extends Term {

  /**
   * 
   * @param {String} name 
   * @param {[String]} params 
   * @param {[TypeO]} options 
   * @param {[Integer]} options 
   */
  constructor(name, params, options, info){
    super("ADT");
    this.name = name ;
    this.params = params ;
    this.options = options ;
    this. info = info ;
  }
}