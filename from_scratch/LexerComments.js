export function getComment(program){
  if(getDashes(program)){
    while(!getNewline(program)){
      // règle : comment = dashes (any !symbol any*)? newline
      // #TODO ce n'est pas ce qui est implémenté ici
      program.incIndex();
    }
    return true;
  }
  return false
}

function getDashes(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "-" && program.getNextChar() === "-"){
      program.index += 2;
      while(program.index < program.input.length && program.getChar() ==="-"){
        program.incIndex();
      }
      return true;
    }
  }
  return false;
}

function getOpencom(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "{" && program.getNextChar() === "-"){
      program.incIndex();
      program.incIndex();
      return true;
    }
  }
}

function getClosecom(program){
  if(program.index + 1 < program.input.length){
    if(program.getChar() === "-" && program.getNextChar() === "}"){
      program.index += 2;
      return true;
    }
  }
}

function getNcomment(program){
  // TODO
  return false ;
}

function getAnySeq(program){
  // TODO
  return false ;
}

function getANY(program){
  return getGraphic(program)
    || getWhitechar(program);
}

function getAny(program){
  return getGraphic(program)
    || getSpace(program)
    || getTab(program);
}

function getGraphic(program){
  if (program.getChar() === "\"" || program.getChar() === "\'"){
    program.incIndex() ;
    return true ;
  }
  return getSmall(program)
    || getLarge(program)
    || getSymbol(program)
    || getDigit(program)
    || getSpecial(program);
}