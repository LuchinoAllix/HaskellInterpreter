

export class AST {
  constructor(){
    this.col_offset;
    this.end_col_offset;
    this.end_lineno;
    this.lineno;
    this.id;
    this.localEnv;
    this.localCtx;
  }

  copy(){
    const copy = new AST();
    copy.col_offset = this.col_offset;
    copy.end_col_offset = this.end_col_offset;
    copy.end_lineno = this.end_lineno;
    copy.lineno = this.lineno;
    copy.id = this.id;
    copy.localEnv = this.localEnv;
    copy.localCtx = this.localCtx;
    return copy ;
  }
  


  // to highligh multiple blocs, one could lookup the highlight funciton in codeboot
  // from codemirror and make some sort of loop to highlight different
  // elements
  fromExpsToAst(msg, args, func){ // how to choose id ? with the call ?
    this.id = msg;

    let col_offset = undefined;
    let end_col_offset = undefined;
    let end_lineno = undefined;
    let lineno = undefined;

    if (Array.isArray(args[0]) && args[0].length > 0){
      args = args[0].concat(args.slice(1));
    }

    args.push(func)
    
    for (let term of args){
      if (term !== null && term.isEnv !== undefined){
        this.localEnv = term ;
      } else if (term !== null && term.isCtx !== undefined){
        this.localCtx = term ;
      } else if (term === null || term.pos === undefined || term.pos === null){
        // do nothing
      } else {
        let pos = term.pos;
        if (col_offset === undefined || 
            col_offset > pos.startCol){
          col_offset = pos.startCol;
        } if (end_col_offset === undefined || 
              end_col_offset < pos.endCol){
          end_col_offset = pos.endCol;
        } if (lineno === undefined || 
              lineno > pos.startLine){
          lineno = pos.startLine;
        } if (end_lineno === undefined ||
              end_lineno < pos.endLine){
          end_lineno = pos.endLine;
        }
      }
    }

    // only update if not undefined
    if (   col_offset !== undefined && col_offset !== null 
        && end_col_offset !== undefined && end_col_offset !== null 
        && end_lineno !== undefined && end_lineno !== null 
        && lineno !== undefined && lineno !== null){
      this.col_offset = col_offset -1;
      this.end_col_offset = end_col_offset-1;
      this.end_lineno = end_lineno+1;
      this.lineno = lineno+1;
    }

  }

}