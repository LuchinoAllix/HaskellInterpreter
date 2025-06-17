export class Program {
  constructor(input){
    this.input = input;
    this.index = 0;
    this.tokens = [];
    this.AST = [];
    this.isLexed = false;
    this.isParsed = false;
  }

  /**
   * Increments the index if it does not surpasses the input length
   */
  incIndex(){
    if(this.index + 1 > this.input.length){
        throw Error("Index went too far over input :(");
    }
    this.index ++;
  }

  /**
   * @returns {Char} the char at this.index of the input
   */
  getChar(){
    return this.input[this.index];
  }
  
  /**
   * @returns {Char} the char at this.index + 1 of the input
   */
  getNextChar(){
    if(this.index + 1 > this.input.length){
        throw Error("Index + 1 went too far over input :(");
    }
    return this.input[this.index+1];
  }
}