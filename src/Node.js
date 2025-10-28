//--  File containing "type" token for lexer and parser  --//

export class Node {

  /**
   * Constructor for node
   * @param {Elem} type Rule | Branch | data
   * @param {String} value name of rule or data 
   * @param {[[[Node, Option]]]} childs 
   * @param {Token} data 
   */  
  constructor(type, value, childs, data){
    this.type = type;
    this.value = value;
    this.childs = childs;
    this.data = data;
  }
}

const Elem = {
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
  return new Node("Rule", null, branches, null);
}

export function branch(nodes){
  return new Node("Branch", null, nodes, null);
}

export function newData(name, data){
  return new Node("Data", name, null, data);
}

function mainLoop(){
  
}