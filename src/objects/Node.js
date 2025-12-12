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
}

/**
 * Return a node with null attributes except for the type
 * @param {String} type 
 * @returns {Node}
 */
export function mtNode(type){
  return new Node(type, null, null, null, []);
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
