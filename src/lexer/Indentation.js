import { Token, newLayoutToken } from "../objects/Token.js";

//--    File containing functions to make the program layout insensitive    --//

const r1_vars = ["let","where","do","of"]; // reserved names that can introduce 
                                           // indentation dependencies

/**
 * Applies the indentation <n> rules and then the application to make the 
 * program layout insensitive
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
  program.tokens = bigL(program.tokens, [], []);
  return true;
}

// FIXME : add line indentation in lexing


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
        program.tokens.splice(index+1, 0, newLayoutToken("{" + indent + "}", 
                                                         "R1"));
        return 1 // (larger offset to avoid collision between R1 and R3)
      }
    } else { // end of file reached
      program.tokens.splice(index+1, 0, newLayoutToken("{0}", "R1"));
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
      program.tokens.splice(0, 0, newLayoutToken( 
        "{" + program.tokens[0].column + "}", "R2"));
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
  if (index > 1 && index < program.tokens.length-1 &&
      program.tokens[index].line !== program.tokens[index-1].line &&
      program.tokens[index].column > 0 &&
      program.tokens[index-1].type !== "layout R1"){ 
        // no need to check for R2 since we start at index 1
    var indent = program.tokens[index].column ;
    program.tokens.splice(index, 0, newLayoutToken("<" + indent + ">", "R3"));
    return 1;
  }
  return 0;
}

/**
 * Applies the application `L tokens []` to set the program to be layout 
 * insensitive.
 * This function could be merged with addIndentation to be more efficent.
 * In following the rules, we assume :
 * - that if the parameter is not represented by [] then it cannot be empty
 * 
 * For each '{' counts the number of '(' opened, like [1,0,1] would mean
 * {({{( were read
 * Covers note 5 problem, there could be a way to manage it with the stack
 * but it works
 * 
 * @param {Program} program 
 * @param {[Integer]} nbOpen counts the number of '('closed per '{'
 * @returns {Boolean}
 */
function bigL(tokens, stack, nbOpen){

  updateStack(tokens, stack);

  // | L (< n >: ts) (m : ms) 
  // | L (< n >: ts) ms 
  if (tokens.length > 0 && 
      tokens[0].type === "layout R3" && 
      stack.length > 0){
    return bigLR3(tokens, stack, nbOpen);
  } 
  
  // | L ({n} : ts) (m : ms)
  // | L ({n} : ts) []
  // | L ({n} : ts) ms 
  else if (tokens.length > 0 && 
           (tokens[0].type === "layout R2" || 
            tokens[0].type === "layout R1")){
    return bigLR2(tokens, stack, nbOpen);           
  }
  
  // | L (} : ts) (0 : ms)	= }  :  (L ts ms) (Note 3)
  // | L (} : ts) ms        = parse-error     (Note 3) 
  else if (tokens.length > 0 && tokens[0].value === "}" && stack.length > 0){
    if (stack[0][0] === 0){
      if (nbOpen.pop() !== 0) {
        throw new Error("Cannot close '}' because '(' still open");
      }
      return [newLayoutToken("}","1")].concat(bigL(tokens.slice(1), 
                                               stack.slice(1), nbOpen));
    } else {
      throw new Error("Parse error bigL (note 3)");
    }
  } 
  
  // | L ({ : ts) ms = {  :  (L ts (0 : ms)) (Note 4) 
  else if (tokens.length > 0 && tokens[0].value === "{" && stack.length > 0){
    nbOpen.push(0);
    return [newLayoutToken("{","2")].concat(bigL(tokens.slice(1),
                                             [[0, tokens[0]]].concat(stack), 
                                             nbOpen));
  }
  
  // | L (t : ts) (m : ms) = }  :  (L (t : ts) ms) if m∕ = 0 and parse-error(t)
  //                                               (Note 5)
  // | L (t : ts) ms       = t  :  (L ts ms) 
  //
  // Note 5 :
  //   - The side condition parse-error(t) is to be interpreted as follows: if 
  //     the tokens generated so far by L together with the next token t 
  //     represent an invalid prefix of the Haskell grammar, and the tokens 
  //     generated so far by L followed by the token “}” represent a valid 
  //     prefix of the Haskell grammar, then parse-error(t) is true. 
  //   - The test m∕ = 0 checks that an implicitly-added closing brace would 
  //     match an implicit open brace. 
  else if (tokens.length > 0 && stack.length > 0){

    if (tokens[0].value === "("){
      nbOpen[nbOpen.length-1] ++;
    } 
    if (isPrefixInvalid(tokens, nbOpen)) {
      if (nbOpen.pop() !== 0) {
        throw new Error("Cannot close '}' because '(' still open");
      }
      if (tokens[0].value === ")"){
        nbOpen[nbOpen.length-1] --;
      }
      return [newLayoutToken("}", "5"), tokens[0]].concat(bigL(tokens.slice(1),
                                                               stack.slice(1), 
                                                               nbOpen));
    }
    if (tokens[0].value === ")"){
      nbOpen[nbOpen.length-1] --;
    }

    // Sinon, on continue normalement avec le token actuel
    return [tokens[0]].concat(bigL(tokens.slice(1), stack, nbOpen));
  }
  
  // |  L [] [] = [] 
  else if (tokens.length === 0 && stack.length === 0){
    return [];
  }
  
  // |  L [] (m : ms) = }  :  L [] ms if m≠0 (Note 6) 
  else if (tokens.length === 0 && stack[0][0] !== 0){
    if (stack.length === 1){
      stack = [];
    }
    if (nbOpen.pop() !== 0) {
      throw new Error("Cannot close '}' because '(' still open");
    }
    return [newLayoutToken("}","4")].concat(bigL([], stack.slice(1), nbOpen));
  }
  
  else {
    throw new Error("Pattern matching not exhaustive in bigL, stack : " +  
      stack);
  }
}

/** 
 * Applies the following rules :
 *  L (< n >: ts) (m : ms) = ;  :  (L ts (m : ms))     if m = n
 *                         = }  :  (L (< n >: ts) ms)  if n < m
 *  L (< n >: ts) ms       = L ts ms 
 * 
 * @param {[Token]} tokens
 * @param {[Integer, Token]} stack 
 * @param {[Integer]} nbOpen
 * @returns {[Token]}
 */
function bigLR3(tokens, stack, nbOpen){
  let n = parseInt(tokens[0].value.substring(1, tokens[0].value.length-1));
  let m = stack[0][0];
  if (m === n){ 
    return [newLayoutToken(";", " f")].concat(bigL(tokens.slice(1), stack, 
                                                   nbOpen));
  } else if (n < m){
    if (nbOpen.pop() !== 0) {
      throw new Error("Cannot close '}' because '(' still open");
    }
    return [newLayoutToken("}","5")].concat(bigL(tokens, stack.slice(1), 
                                                 nbOpen));
  } else {
    return bigL(tokens.slice(1), stack, nbOpen);
  } 
}

/**
 * Applies the following rules :
 *  L ({n} : ts) (m : ms) = {  :  (L ts (n : m : ms))       if n > m (Note 1)
 *  L ({n} : ts) []       = {  :  (L ts [n])                if n > 0 (Note 1)
 *  L ({n} : ts) ms       = {  :  }  :  (L (< n >: ts) ms)           (Note 2)
 *  
 * @param {[Token]} tokens
 * @param {[[Integer, Token]]} stack 
 * @param {[Integer]} nbOpen
 * @returns {[Token]}
 */
function bigLR2(tokens, stack, nbOpen){ 
  let n = parseInt(tokens[0].value.substring(1, tokens[0].value.length-1));
  if (n === NaN){
    throw new Error("Something other than an int ended up in layout token : ", 
                tokens[0]);
  }
  if (stack.length > 0){
    let m = stack[0][0];
    if (n > m){
      stack  = [[n, tokens[0]]].concat(stack);
      nbOpen.push(0);
      return [newLayoutToken("{", "8")].concat(bigL(tokens.slice(1), stack,
                                                    nbOpen));
    } else {
      return [newLayoutToken("{","6"), newLayoutToken("}","6")].concat(
        bigL([newLayoutToken("<" + n + ">", "R3")].concat(tokens.slice(1)),
                                                          stack, nbOpen));
    }
  } else if (n > 0){
    nbOpen.push(0);
    return [newLayoutToken("{","7")].concat(bigL(tokens.slice(1), 
                                                 [[n, tokens[0]]], nbOpen));
  } else {
    throw new Error("Pattern matching not exhaustive in bigLR2, stack : " +  
      stack);
  }
}

/**
 * Determines if a '}' needs to be added
 * This function is the note 5 (from the specification, see bigL) condition
 * Could there be other cases than "in" and ")" where a "}" needs to be added ?
 * #HELP
 * @param {[Token]} tokens
 * @param {[Integer]} nbOpen
 * @returns {Boolean}
 */
function isPrefixInvalid(tokens, nbOpen) {
  if (tokens.length >= 1) {
    let nextToken = tokens[0];
    if (nextToken.value === "in"){
      return true;
    }
    if (nbOpen[nbOpen.length-1] === 0 && nextToken.value === ")"){
      return true;
    }
  }
  return false;
}


/**
 * Updates the stack according to the spec  :
 * A stack of “layout contexts”, in which each element is either :
 * 
 *  - Zero, indicating that the enclosing context is explicit (i.e. the 
 *    programmer supplied the opening brace). If the innermost context is 0, 
 *    then no layout tokens will be inserted until either the enclosing context 
 *    ends or a new context is pushed.
 * 
 *  - A positive integer, which is the indentation column of the enclosing 
 *    layout context.
 * 
 * @param {[Token]} tokens 
 * @param {[[Integer, Token]]} stack 
 */
function updateStack(tokens, stack){
  if (tokens.length > 0 && r1_vars.includes(tokens[0].value)){
    stack = [[stack[0][1].column ,tokens[0]]].concat(stack);
  } else if (tokens.length > 0 && tokens[0].value === '{'){
    if (stack[0][0] !== 0){ // FIXME : what to do if stack empty ?
                                      // (as in '{' was provided )
      stack = [[0, tokens[0]]].concat(stack);
    }
  }
}
