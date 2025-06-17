/**
 * Rule lexeme → qvarid | qconid | qvarsym | qconsym | literal | special | 
 *                reservedop | reservedid 
 * @param {Program} program 
 * @returns true if success, false otherwise 
 */
function getLexeme(program){
  return getQvarid(program)
    || getQconid(program)
    || getQvarsym(program)
    || getQconsym(program)
    || getLiteral(program)
    || getSpecial(program)
    || getReservedop(program)
    || getReservedid(program);
}

function getQvarid(){
    // #TODO
    return false;
}

function getQconid(){
    // #TODO
    return false;
}

function getQvarsym(){
    // #TODO
    return false;
}

function getQconsym(){
    // #TODO
    return false;
}

function getReservedop(){
    // #TODO
    return false;
}

function getReservedid(){
    // #TODO
    return false;
}


/**
 * Rule : varid → (small {small | large | digit | ' })⟨reservedid⟩
 * @returns true if sucess
 */
function getVarid(){
    // # TODO
    return false;
}

/**
 * Rule : conid → large {small | large | digit | ' }
 * @returns true if sucess
 */
function getConid(){
    if (getLarge()){
        while(true){
            if (getSmall() || getLarge() || getDigit()){} 
            else if (index <= input.length && input[index] === "\'"){index ++;}
            else {break;}
        }
        return true
    }
    return false
}