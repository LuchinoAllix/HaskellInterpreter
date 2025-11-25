//--                 File containing "type" Decl for normalize              --//

/**
 * 
 */
export class Term {
  
  /**
   * 
   * @param {*} metatype 
   */
  constructor(metatype){
    this.metatype = metatype;
  }

  /**
   * 
   * @returns 
   */
  isExp(){
    return this.metatype === "EXP";
  }

  /**
   * 
   * @returns 
   */
  isDecl(){
    return this.metatype === "DECL";
  }
}