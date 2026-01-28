
//--              File containing "type" TypeO for type checking            --//

let count = 0;


/**
 * Makes a new name for a type (t0, t1, t2, ...)
 * @returns {String}
 */
function makeNewTypeName(){
  let name = "t" + count;
  count ++;
  return name
}

/**
 * Represents the type of a term (Algebric Data Type)
 */
export class TypeO {
  
  /**
   * Constructor for the abstract class
   */
  constructor(){
    this.metatype = "TYPEO";
  }

}

/**
 * Type of functions 
 */
export class TArrow extends TypeO {

  /**
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
 * Type of builtin types (String, Int, Bool)
 */
export class TBuiltin extends TypeO {

  /**
   * @param {String} type
   */
  constructor(type){
    super();
    this.type = type;
  }
}

/**
 * Type of application of type
 */
export class TApp extends TypeO {

  /**
   * @param {TypeO} func
   * @param {TypeO} arg
   */
  constructor(func, arg){
    super();
    this.func = func;
    this.arg = arg;
  }
}

/**
 * Type for polymorphism
 */
export class TForall extends TypeO {

  /**
   * @param {String} name
   * @param {TypeO} body
   */
  constructor(name, body){
    super();
    this.name = name;
    this.body = body;
  }
}

/**
 * Type for type variable
 */
export class TVar extends TypeO {

  /**
   * @param {String} name
   * @param {Int} num
   */
  constructor(name, num){
    super();
    this.name = name;
    this.num = num;
  } 
}

/**
 * Type for unknown types
 */
export class TMetavar extends TypeO {

  /**
   * @param {String} name
   * @param {Int} num
   */
  constructor(name, num){
    super();
    this.name = name;
    this.num = num;
  }
}

// how should we manage the type of expressions like '_' ?