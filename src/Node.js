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
   * Adds a child to the list of child for the node
   * @param {Node} node 
   */
  addChild(node){
    if(node !== null){
      this.childs.push(node);
    }
  }

  /**
   * Return a node with null attributes except for the type
   * @param {String} type 
   * @returns {Node}
   */
  typeNode(type){
    return new Node(type, null, null, null);
  }

}