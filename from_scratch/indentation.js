//--    File containing functions to make the program layout insensitive    --//

const r1_vars = ["let","where","do","of"];

/**
 * Applies the indentation <n> rules 
 * 
 * @param {String} input 
 * @param {Program} program
 * @returns {Boolean}
 */
export function addIndentation(program){
  ApplyRule2(program);
  for (let i=0; i < program.tokens.length; i++){
    i += ApplyRule1(program,i);
    i += ApplyRule3(program,i);
  }
  proram.tokens = bigL(program,[]);
  return true;
}

/**
 * Applies the rule 1 to the list of tokens. Returns an offset because we may
 * add elements to the list of tokens
 * 
 * Rule 1 : If a let, where, do, or of keyword is not followed by the lexeme {,
 *          the token {n} is inserted after the keyword, where n is the 
 *          indentation of the next lexeme if there is one, or 0 if the end of 
 *          file has been reached.
 * 
 * @param {Program} program 
 * @param {Integer} index where we are in the list of tokens
 * @returns {Integer} Number of elements to skip in list of tokens 
 */
function ApplyRule1(program, index){
  if (r1_vars.includes(program.tokens[index].value)){
    if (index+1 < program.tokens.length){
      if (program.tokens[index+1].value !== "{"){
        var indent = program.tokens[index+1].column;
        program.tokens.splice(index+1, 0, {type: "indentation R1",
                                            value: "{" + indent + "}",
                                            line: -1,
                                            column: -1});
        return 2 // (larger offset to avoid collision between R1 and R3)
      }
    } else { // end of file reached
      program.tokens.splice(index+1, 0, {type: "indentation R1",
                                          value: "{0}",
                                          line: -1,
                                          column: -1});
      return 1;
    }
  }
  return 0;
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

/**
 * Applies the rule 3 to the list of tokens. Returns an offset because we may
 * add elements to the list of tokens
 * 
 * Rule 3 : Where the start of a lexeme is preceded only by white space on the 
 *          same line, this lexeme is preceded by < n > where n is the 
 *          indentation of the lexeme, provided that it is not, as a consequence
 *          of the first two rules, preceded by {n}. (NB: a string literal may
 *          span multiple lines).
 * 
 * @param {Program} program 
 * @param {Integer} index where we are in the list of tokens
 * @returns {Integer} Number of elements to skip in list of tokens
 */
function ApplyRule3(program, index){
  if (index < program.tokens.length-1 && 
      program.tokens[index].line !== program.tokens[index+1].line && 
      program.tokens[index+1].column > 1){
    var indent = program.tokens[index+1].column;
    program.tokens.splice(index+1, 0, {type: "indentation R3",
                                       value: "<" + indent + ">",
                                       line: -1,
                                       column: -1});
    return 1;
  }
  return 0;
}

/**
 * Applies the application `L tokens []` to set the program to be layout 
 * insensitive.
 * This function could be merged with addIndentation to be more efficent.
 * @param {Program} program 
 * @returns {Boolean}
 */
function bigL(tokens, stack){

  // Maj stack
  if (r1_vars.includes(program.tokens[0].value)){
    stack.push(tokens[getNextNotIndentTokenIndex(tokens,0)].column);
  } else if (program.tokens[i].value === '{'){
    stack.push(0);
  }

  //  L (< n >: ts) (m : ms)
  if (tokens[i].type === "indentation R3"){
    if (stack.length >= 0){
      return bigLR3(tokens, stack);
    }
  } 
}

/** # TODO documentation
 * 
 * @param {*} tokens 
 * @param {*} stack 
 * @returns 
 */
function bigLR3(tokens, stack){
  let m = tokens[i].value.substring(1, tokens[i].value.length-2);
  let n = stack[stack.length-1];
      
  // = ;  :  (L ts (m : ms)) if m = n 
  if (m === n){ 
    return [{type: "indentation L",
                    value: ";",
                    line: -1,
                    column: -1}].concat(bigL(tokens.slice(1), stack));                
  } 
  
  // =  }  :  (L (< n >: ts) ms) if n < m 
  else if (n < m){
    return [{type: "indentation L",
                    value: "}",
                    line: -1,
                    column: -1}].concat(bigL(tokens.slice(1), 
                                              stack.slice(1)));
  }

  //  L (< n >: ts) ms = L ts ms 
  // # FIXME can stack be empty in this rule ?? if so change needed
  else {return bigL(token.slice(1),stack);} 
}


/**
 * Return the index of the next token (starting at i) which is not an 
 * indentation token
 * @param {[{type: String, 
 *           value: String, 
 *           line: Integer, 
 *           column: Integer}]} tokens
 * @param {Integer} i starting index
 * @returns {Integer} 
*/
function getNextNotIndentTokenIndex(tokens, i){
  if (i >= tokens.length){
    throw new Error("No not indentation token found, index too high.");
  } else if (tokens[i].type.startsWith("indentation")){
    this.getNextNotIndentTokenIndex(tokens, i+1);
  } else {
    return i;
  }
}
