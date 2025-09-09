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
   * @returns {Boolean}
   */
  incIndex(){
    if(this.index + 1 > this.input.length){
        throw Error("Index went too far over input :(");
    }
    this.index ++;
    return true;
  }

  /**
   * Decrements the index if it does not go below 0
   * @returns {Boolean}
   */
  decIndex(){
    if(this.index === 0){
        throw Error("Index went too far backwards :(");
    }
    this.index --;
    return true;
  }

  /**
   * Increments the index if it does not surpasses the input length
   * @param {Int}
   * @returns {Boolean}
   */
  incIndexN(i){
    if(this.index + i > this.input.length){
        throw Error("Index went too far over input :(");
    }
    this.index += i;
    return true;
  }

  /**
   * Decrements the index if it does not go below 0
   * @param {Int}
   * @returns {Boolean}
   */
  decIndexN(i){
    if (this.index - i < 0){
        throw Error("Index went too far backwards:(");
    }
    this.index -= i;
    return true;
  }

  /**
   * Set the index over the input 
   * @param {Int}
   * @returns {Boolean}
   */
  setIndex(i){
    if (i <0){
      throw Error("Set index got negative value");
    }
    this.index = i;
    return true;
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
  isNextInList(list,type){
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
   * FIXME : Could it happen that two tokens of the same type follow 
   * eachother ? Thus this function would merge them even though it should not
   * This problem could be solved using merge.
   * 
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
   * same new type, merges the two tokens
   * @param {String} type 
   * @returns {Boolean}
   */
  overwriteTypeLastToken(type){
    var len = this.tokens.length
    if (len > 0){
      this.tokens[len - 1].type = type;
      if (len > 1){
        if (this.tokens[len - 1].type === this.tokens[len - 2].type){
          this.tokens[len - 2].value += this.tokens[len - 1].value;
          this.tokens.pop();
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Removes the last token in the program if possible
   * @returns {Boolean}
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
   * Removes the last char of the last token if possible
   * (removes the token if the value becomes empty)
   * @returns {Boolean}
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

  /**
   * Adds a mark in the tokens list that all following token must be merged as
   * one. The merging will be done by calling endMerge.
   * @returns {Boolean}
   */
  startMerge(){
    this.tokens.push({type:"MERGE-START",value:this.index});
    return true;
  }

  /**
   * Merges all the tokens util the "MERGE-START" as one of the specified type 
   * @param {String} type 
   * @returns {Integer}
   */
  endMerge(type){
    var accumulator = ""; 
    var last = this.tokens.length-1
    if (last < 0){
      throw Error("End Merge was called on token list of size : " + (last + 1));
    }
    while (this.tokens[last].type !== "MERGE-START"){
      accumulator = this.tokens[last].value + accumulator;
      this.tokens.pop();
      last --;
      if (last <= 0){
        throw Error("End Merge did not find MERGE-START");
      }
    }
    var startIndex = this.tokens.pop().value;
    if (type !== "NULL"){
      this.tokens.push({type:type,value:accumulator});
    }
    return startIndex;
  }

  /**
   * Return the last token made in the program if there is one
   * @returns {{type: String, value: String}}
   */ 
  getLastToken(){
    if (this.tokens.length < 0){
      throw Error("Tried to get last token out of empty token list");
    }
    return this.tokens[this.tokens.length-1];
  }

}