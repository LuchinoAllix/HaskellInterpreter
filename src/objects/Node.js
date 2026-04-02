//--                 File containing "type" Node for parser                 --//

export class Node {

  /**
   * Constructor for node (nodes are used to constitue a tree)
   * @param {String} type 
   * @param {String} value 
   * @param {Integer} line 
   * @param {Integer} column 
   * @param {[Node]} childs 
   */  
  constructor(type, value, startLine, startCol, childs, endLine, endCol){
    this.type = type;
    this.value = value;
    this.startLine = startLine;
    this.startCol = startCol;
    this.childs = childs;
    this.endLine = endLine; 
    this.endCol = endCol;
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

  /**
   * get the line and column number of a node as a list
   * @returns {[Integer]}
   */
  getInfo(){
    return [this.startLine, this.startCol, this.endLine, this.endCol];
  }

  /**
   * todo
   * @returns 
   */
  getMinMaxLineCol(){
    if (this.startCol !== null){ 
      return [this.startLine, this.startCol, this.endLine, this.endCol] ;
    }
    if (this.childs === null){ throw new Error("Node without childs and info")}
    let res = this.childs[0].getMinMaxLineCol()
    for (let child of this.childs.slice(1)){
      let n_res = child.getMinMaxLineCol();
      if (res[0] < n_res[0]){ res[0] = n_res[0] ; }
      if (res[1] < n_res[1]){ res[1] = n_res[1] ; }
      if (res[2] > n_res[0]){ res[2] = n_res[3] ; }
      if (res[3] > n_res[0]){ res[3] = n_res[2] ; }
    }
    return res;
  }
}

/**
 * Return a node with null attributes except for the type
 * @param {String} type 
 * @returns {Node}
 */
export function mtNode(type){
  return new Node(type, null, null, null, [], null, null);
}

/**
 * Permet de compresser un arbre, si un noeud ne possède qu'un seul enfant,
 * cet enfant le remplace.
 * AI generated function
 * @param {Node} node 
 * @returns {Node} 
 */
export function compressTree(node) {
  if (!node || !node.childs) return node;

  // D'abord, on compresse récursivement tous les enfants
  node.childs = node.childs.map(compressTree).filter(Boolean);

  // Si le noeud n'a qu'un seul enfant, on le remplace par cet enfant
  if (node.childs.length === 1) {
    return node.childs[0];
  }

  // Sinon, on garde le noeud tel quel
  return node;
}
