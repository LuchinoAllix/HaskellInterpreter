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
 * Rule 3 : Where the start of a lexeme is preceded only by white space on the 
 *          same line, this lexeme is preceded by < n > where n is the 
 *          indentation of the lexeme, provided that it is not, as a consequence
 *          of the first two rules, preceded by {n}. (NB: a string literal may
 *          span multiple lines).
 * 
 * # FIXME : this is a big funciton, perhaps it should be split
 * @param {String} input 
 * @param {[{type: String, value: String, 
 *           line: Integer, column: Integer}]} tokens 
 * @returns {Boolean}
 */
export function addIndentation(tokens){
  ApplyRule2(tokens);
  for (i=0; i < tokens.length; i++){

    if (r1_vars.includes(tokens[i].value)){ // --- rule 1
      if (i+1 < tokens.length){
        if (tokens[i+1].value !== "{"){
          var indent = tokens[i+1].column;
          tokens.splice(i+1, 0, {type: "indentation {",
                                 value: "{" + indent + "}",
                                 line: -1,
                                 column: -1});
        }
      } else { // end of file reached
        tokens.splice(i+1, 0, {type: "indentation {",
                                 value: "{0}",
                                 line: -1,
                                 column: -1});
      }
    } 
    
    // --- rule 3
    if (i < tokens.length-1 
        && tokens[i].line !== tokens[i+1].line 
        && tokens[i+1].column > 1){
      var indent = tokens[i+1].column;
      tokens.splice(i+1, 0, {type: "indentation <",
                             value: "<" + indent + ">",
                             line: -1,
                             column: -1});
    }
  }
}


/**
 * Applies the rule 2 to the list of tokens
 * 
 * Rule 2 : If the first lexeme of a module is not { or module, then it is 
 *          preceded by {n} where n is the indentation of the lexeme.
 * 
 * @param {[{type: String, value: String, 
 *           line: Integer, column: Integer}]} tokens
 */
function ApplyRule2(tokens){
  if (tokens.length > 0){
    if (tokens[0].value !== "module" && tokens[0].value !== "{"){
      tokens.splice(0, 0, {type: "indentation",
                           value: "{" + tokens[0].column + "}",
                           line: tokens[0].line,
                           column: tokens[0].column});
        }
    }
}
