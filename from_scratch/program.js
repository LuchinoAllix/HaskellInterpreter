//--  File containing Program object used for lexing and parsing  --//

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
   * Increments the index if it does not surpasses the input length
   */
  incIndexN(i){
    if(this.index + i > this.input.length){
        throw Error("Index went too far over input :(");
    }
    this.index += i;
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

  /**
   * Verifies if the next chars in input is part of a given list 
   * if so add's it to the token list and increments the index accordingly
   * @param {Array} list 
   * @returns {Boolean}
   */
  isNextInList(list){
    for (let word of list){
      var len = word.length;
      if (len + this.index <= this.input.length){
        if (this.input.substring(this.index,this.index + len) === word){
          this.addWordToken(type,word);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Adds the current char to list of tokens as type provided
   * Verifies if the last token is of the same type, if so, merges the tokens
   * @param {String} type 
   * @returns {Boolean}
   */
  addToken(type){
    if (this.tokens.length > 0 && 
        this.tokens[this.tokens.length - 1].type === type){
      this.tokens[this.tokens.length - 1].value += this.getChar();
    } else {
      this.tokens.push({type:type,value:this.getChar()});
    }
    this.incIndex();
    return true;
  }

  /**
   * Adds a whole word as a token and increments the index accordingly
   * @param {String} type 
   * @param {String} word 
   * @returns 
   */
  addWordToken(type, word){
    this.tokens.push({type:type,value:word});
    this.incIndexN(word.length);
    return true;
  }

  /**
   * Overwrites the type of the last token, if the token before that is of the
   * same type, merges the two tokens
   * @param {String} type 
   * @returns {Boolean}
   */
  overwriteTypeLastToken(type){
    // Could use some refactoring
    if (this.tokens.length > 0){
      this.tokens[this.tokens.length - 1].type = type;
      if (this.tokens.length > 1){
        if (this.tokens[this.tokens.length - 1].type === 
            this.tokens[this.tokens.length - 2].type){
          this.tokens[this.tokens.length - 2].value += 
          this.tokens[this.tokens.length - 1].value;
          this.tokens.pop();
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 
   */
  removeLastToken(){
    if (this.tokens.length > 0){
      var len = this.tokens.pop().value.length;
      this.index -= len;
      return true;
    }
    return false;
  }

  /**
   * 
   */
  removeLastTokensLastValue(){
    if (this.tokens.length > 0){
      if (this.tokens[this.tokens.length - 1].value.length > 0){
        this.tokens[this.tokens.length - 1].value.pop();
        this.index --;
        if (this.tokens[this.tokens.length - 1].value.length === 0){
          this.tokens[this.tokens.length - 1].pop();
        }
        return true;
      }
    }
    return false;
  }

}