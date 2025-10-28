//--  File containing "type" token for lexer and parser  --//

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
  data : "data"
}

const Option = {
  0 : "optional",
  1 : "mandatory",
  2 : "at Least 1",
  3 : "0 or more"
} 

export function rule(branches){
  return new Node("Rule", null, branches);
}

export function branch(nodes){
  return new Node("Branch", null, nodes);
}

export function data(name){
  return new Node("Data", name, null);
}

