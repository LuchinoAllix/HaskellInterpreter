
//--              File containing "type" TypeO for type checking            --//

/**
 * Represents a the type of a term
 */
export class TypeO {
  
  /**
   * todo
   */
  constructor(){
    this.metatype = "TYPEO";
  }

}

/**
 * todo
 */
export class TypeArrow extends TypeO {

  /**
   * todo
   * @param {TypeO} from 
   * @param {TypeO} to 
   */  
  constructor(from, to){
    super();
    this.type = "Arrow"
    this.from = from;
    this.to = to;
  }
}

/**
 * todo
 */
export class TypeInt extends TypeO {

  /**
   * todo
   */
  constructor(){
    super();
    this.type = "Integer";
  }
}

/**
 * todo
 */
export class TypeBool extends TypeO {

  /**
   * todo
   */
  constructor(){
    super();
    this.type = "Bool";
  }
}

/**
 * todo
 */
export class TypeChar extends TypeO {

  /**
   * todo
   */
  constructor(){
    super();
    this.type = "Char";
  }
}

// how should we manage the type of expressions like '_' ?