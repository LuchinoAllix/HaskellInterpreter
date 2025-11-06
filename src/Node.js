//--  File containing "type" token for lexer and parser  --//

export class Node {

  /**
   * Constructor for node
   * @param {String} type 
   * @param {String} value 
   * @param {Integer} line 
   * @param {Integer} column 
   * @param {[Node]} childs 
   */  
  constructor(type, value, line, column, childs){
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
    this.childs = childs
  }

  /**
   * Adds a child to the list of childs for the node
   * @param {Node} node 
   */
  addChild(node){
    if(node !== null){
      this.childs.push(node);
    }
  }

  /*
   * 
   * 
  empty(){
    if (this.childs.length === 0){
      if (this.value !== null) {
        return false;
      }
      return true;
    }
    for (let i = 0; i<this.childs.length; i++){
      if (!this.childs[i].empty()){
        return false;
      }
    }
    return true;
  }
  
  */
}

/**
 * Return a node with null attributes except for the type
 * @param {String} type 
 * @returns {Node}
 */
export function mtNode(type){
  return new Node(type, null, null, null, []);
}