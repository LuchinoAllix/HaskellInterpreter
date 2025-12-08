
/**
 * Abstract class
 */
export class Value {
  constructor(type, value){
    this.type = type;
    this.value = value;
  }
}

export class Vint extends Value {

  /**
   * 
   * @param {Integer} value 
   */
  constructor(value){
    super("int", value);
  }
}

export class Vstring extends Value {

  /**
   * 
   * @param {String} value 
   */
  constructor(value){
    super("string", value);
  }
}

export class Vfunc extends Value {

  /**
   * I don't think this will be used 
   * @param {function} value 
   */
  constructor(value){
    super("func", value);
  }
}

export class Vio extends Value {

  /**
   * 
   * @param {function} value 
   */
  constructor(value){
    super("IO", value);
  }
}

export class Vbool extends Value {

  /**
   * 
   * @param {Boolean} value 
   */
  constructor(value){
    super("bool", value);
  }
}