//--    File containing functions to make the program layout insensitive   --//

const r1_vars = ["let","where","do","of"];

/**
 * Adds the indentation <n> rules :
 * 
 * Rule 1 : If a let, where, do, or of keyword is not followed by the lexeme {,
 *          the token {n} is inserted after the keyword, where n is the 
 *          indentation of the next lexeme if there is one, or 0 if the end of 
 *          file has been reached.
 * 
 * Rule 2 : If the first lexeme of a module is not { or module, then it is 
 *          preceded by {n} where n is the indentation of the lexeme.
 * 
 * # FIXME : this is a big funciton, perhaps it should be split
 * @param {String} input 
 * @param {[{type: String, value: String, 
 *           line: Integer, column: Integer}]} tokens 
 * @returns {Boolean}
 */
export function addIndentation(input, tokens){
  for (i=0; i < tokens.length; i++){
    if (r1_vars.includes(tokens[i].value)){ // --- rule 1
      if (i+1 < tokens.length){
        if (tokens[i+1].value !== "{"){
          var indent = tokens[i+1].column;
          tokens.splice(i+1, 0, {type: "indentation",
                                 value: "{" + indent + "}",
                                 line: -1,
                                 column: -1});
        } 
      } else { // end of file reached
        tokens.splice(i+1, 0, {type: "indentation",
                                 value: "{0}",
                                 line: -1,
                                 column: -1});
      }
    } else if (?){ // --- rule 2 TODO

    }
  }
}

