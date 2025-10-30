//--  File containing "type" token for lexer and parser  --//
import { Node } from "../Node.js";

export class Elem {

  /**
   * Constructor for node
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

const Genre = {
  rule : "rule",
  branch : "branch",
  data : "data",
  ref : "ref"
}

const Option = {
  0 : "optional",
  1 : "mandatory",
  2 : "at Least 1",
  3 : "0 or more",
  4 : "negate"
} 

export function rule(name){
  return new Elem("rule", name, []);
}

export function branch(nodes){
  return new Elem("branch", null, nodes);
}

export function data(name){
  return new Elem("data", name, null);
}

export function ref(name){
  return new Elem("ref",name,null);
}

