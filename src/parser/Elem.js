//--  File containing "type" elem for parser  --//
import { Node } from "../Node.js";

export class Elem {

  /**
   * Constructor for elem
   * 
   * in the grammar :
   *  R1 : A B C
   *     | B "y"
   *     | "x" R1
   *  
   * R1 on the left is a rule
   * A, B, C and R1 are references to rules
   * A B C is a branch (so are B "y" and "x" R1)
   * "x" and "y" are data elements
   * references may be a reference to a rule not defined in the parser
   * but in the lexer, in this case they become 'token type'.
   * 
   * 
   * @param {Genre} type Rule | Branch | data
   * @param {String} value name of rule or data 
   * @param {[[[Node, Option]]]} childs 
   * @param {Token} data 
   */  
  constructor(type, value, childs){
    this.type = type;
    this.value = value;
    this.childs = childs;
  }
}

// kinds of elements
const Genre = {
  rule : "rule",
  branch : "branch",
  data : "data",
  ref : "ref",
  toktype : "tokentype"
}

// options for elements
const Option = {
  0 : "optional",
  1 : "mandatory",
  2 : "at Least 1",
  3 : "0 or more",
  4 : "negate"
} 

/**
 * construcotr for rule kind of element
 * @param {String} name 
 * @returns {Elem}
 */
export function rule(name){
  return new Elem("rule", name, []);
}

/**
 * construcotr for branch kind of element
 * @param {[Elem]} elems 
 * @returns {Elem}
 */
export function branch(elems){
  return new Elem("branch", null, elems);
}

/**
 * construcotr for data kind of element
 * @param {String} name 
 * @returns {Elem}
 */
export function data(name){
  return new Elem("data", name, null);
}

/**
 * construcotr for ref kind of element
 * @param {String} name 
 * @returns {Elem}
 */
export function ref(name){
  return new Elem("ref", name, null);
}

/**
 * construcotr for ref kind of element
 * @param {String} name 
 * @returns {Elem}
 */
export function tokentype(name){
  return new Elem("tokentype", name, null);
}


