//--    File containing functions to make the program layout insensitive   --//

/**
 * TODO
 * Adds the indentation of all tokens as an attribute
 * @param {String} input 
 * @param {[{type: String, value: String}]} tokens 
 * @returns {Boolean}
 */
export function countIndentation(input, tokens){
  t_index = 0; // tokens index
  indentation = 1;
  for (i = 0; i < input.length; i++){
    if (isNewline(input[i])){
      if (tokens[t_index].type === "String"){
        // ??
      } else {
        // ?? 
      }
    } else {
      indentation += 1;
    }
  }
}



/**
 * Determines if a given char is a newline one.
 * @param {Char} char 
 * @returns {Boolean}
 */
function isNewline(char){
  return char === '\n' || char === '\r' || char === '\f';
}