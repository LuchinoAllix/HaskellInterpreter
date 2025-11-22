//--                 File containing "type" Decl for interForm              --//


export class Decl {

  /**
   * 
   * @param {DeclType} type 
   * @param {String} name 
   * @param {?} typeAnnotation 
   * @param {[?]} values 
   */
  constructor(type, name, typeAnnotation, values){
    this.type = type;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.values = values
  }
}

const DeclType = {
  function : "function",
  variable : "variable"
}