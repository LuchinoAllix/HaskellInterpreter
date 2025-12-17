
/**
 * Abstract class
 */
export class Value {
  constructor(type, value){
    this.metatype = "VALUE";
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

export class Vtuple extends Value {
  
  /**
   * 
   * @param {[Value]} values 
   */
  constructor(values){
    super("tuple", values)
  }
}

export class VList extends Value {
  
  /**
   * 
   * @param {[Value]} values 
   */
  constructor(values){
    if (values.length > 1){
      let t0 = values[0].type;
      for (let i = 1; i < values.length; i ++){
        if (values[i].type !== t0){
          throw Error("Elements in list are not homogenous (run-time error)");
          // This test is not recursive, so #FIXME
        }
      }
    }
    super("list", values)
  }
}