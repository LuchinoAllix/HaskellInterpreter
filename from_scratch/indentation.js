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
 * @param {Program} program
 * @returns {Boolean}
 */
export function addIndentation(program){
  ApplyRule2(program);
  for (let i=0; i < program.tokens.length; i++){
    // offsets added when we add an element in tokens
    if (r1_vars.includes(program.tokens[i].value)){ // --- rule 1
      if (i+1 < program.tokens.length){
        if (program.tokens[i+1].value !== "{"){
          var indent = program.tokens[i+1].column;
          program.tokens.splice(i+1, 0, {type: "indentation R1",
                                         value: "{" + indent + "}",
                                         line: -1,
                                         column: -1});
          i += 2; // offset (larger to avoid collision between R1 and R3)

        }
      } else { // end of file reached
        program.tokens.splice(i+1, 0, {type: "indentation R1",
                                       value: "{0}",
                                       line: -1,
                                       column: -1});
        i += 1; // offset
      }
    } 
    
    // --- rule 3
    if (i < program.tokens.length-1 
        && program.tokens[i].line !== program.tokens[i+1].line 
        && program.tokens[i+1].column > 1){
      var indent = program.tokens[i+1].column;
      program.tokens.splice(i+1, 0, {type: "indentation R3",
                                     value: "<" + indent + ">",
                                     line: -1,
                                     column: -1});
      i += 1; // offset 
    }
  }
  return true;
}


/**
 * Applies the rule 2 to the list of tokens
 * 
 * Rule 2 : If the first lexeme of a module is not { or module, then it is 
 *          preceded by {n} where n is the indentation of the lexeme.
 * 
 * @param {Program} program
 */
function ApplyRule2(program){
  if (program.tokens.length > 0){
    if (program.tokens[0].value !== "module" && 
        program.tokens[0].value !== "{"){
      program.tokens.splice(0, 0, {type: "indentation R2",
                                   value: "{" + program.tokens[0].column + "}",
                                   line: program.tokens[0].line,
                                   column: program.tokens[0].column});
        }
    }
}
