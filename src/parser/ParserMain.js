import { Node } from "../Node.js";
import { Program, tokenToNode } from "../Program.js";

//--  File containing parser functions for "entry point" related rules  --//

/**
 * module → 'module' modid [exports] 'where' body 
 *        | body
 * @param {Program} program
 * @returns {Node}
 */
function getModule(program){
  let token = program.getToken();
  if (token.type === 'reservdid' && token.value === 'module'){
    let node = tokenToNode(token);
    try {
      program.incCursor();
      token = program.getToken();
      if (token.type === 'modid'){
        node.addChild(tokenToNode(token));
        program.incCursor();
        node.addChild(getExports(program));
        program.incCursor();
        token = program.getToken();
        if (token.type === 'reservdid' && token.value === 'where'){
          node.addChild(tokenToNode(token));
          program.incCursor();
          node.addChild(getBody(program));
        } else {
          throw new Error("'where' was expected after module");
        }
      } else {
        throw new Error("modid was expected after module");
      }
    } catch (error){
      throw new Error("Error in parsing module, probably because not enough "
        + " tokens hav been provided :\n" + error);
    }
    return node;
  } else {
    return getBody(program);
  }
}

/**
 * body → '{' impdecls ';' topdecls '}'
 *	    | '{' impdecls '}'
 *	    | '{' topdecls '}'
 * @param {Program} program
 * @returns {Node}
 */
function getBody(program){
    let token = program.getToken();
  let cnt = 0;
  if (token.value === '{'){
    let node = tokenToNode(token);
    node.type = 'Body';
    try{
      program.incCursor();
      let tmp = getImpledcls(program); 

      if (tmp !== null){
        cnt ++;
        node.addChild(tokenToNode(tmp));
        program.incCursor();
        token = program.getToken();
        if (token.value === ';'){
          program.incCursor();
        }
      }

      tmp = getTopdecls(program)

      if (tmp !== null){
        cnt ++;
        node.addChild(tokenToNode(tmp));
        program.incCursor();
        token = program.getToken();
      }

      if (cnt === 0){
        throw new Error("impdecls or topdecls expected");
      }

      if (token.value === '}'){
        return node;
      } else {
        throw new Error("{ was expected");
      }
    } catch (error){
      throw new Error("Error in body parsing :\n" + error);
    }
  } else {
    throw new Error('{ was expected'); 
    // # FIXME : not sur if should return false or throw an error
  }
}

 
/**
 * impdecls → impdecl1 ';' … ';' impdecln 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getImpledcls(program){
  let node = null;  
  let tmp = null;
  try{
    while(true){
      tmp = getImpdecl(program);
      if (tmp !== null){
        program.incCursor();
        if (program.getToken().value === ';'){
          node.addChild(tokenToNode(tmp));
          program.incCursor();
        } else {
          break;
        }
      }
    node.addChild(tokenToNode(tmp));
    }
  } catch (error){
    throw new Error("illformed impdecls\n" + error)
  }
  return node;
}

 
/**
 * exports → ( export1 , … , exportn [ , ] ) 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getExports(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * export → qvar
 *	      | qtycon [(..) | ( cname1 , … , cnamen )] 	    (n ≥ 0)
 *	      | qtycls [(..) | ( qvar1 , … , qvarn )]    	    (n ≥ 0)
 *	      | module modid
 * @param {Program} program
 * @returns {Node}
 */
function getExport(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * impdecl → import [qualified] modid [as modid] [impspec]
 *	       | (empty declaration)
 * @param {Program} program
 * @returns {Node}
 */
function getImpdecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * impspec → ( import1 , … , importn [ , ] ) 	            (n ≥ 0)
 *	       | hiding ( import1 , … , importn [ , ] ) 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getImpspec(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * import → var
 *	      | tycon [ (..) | ( cname1 , … , cnamen )] 	    (n ≥ 0)
 *	      | tycls [(..) | ( var1 , … , varn )] 	            (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getVar(program){
  return null; // # TODO : not yet implemented
}


/**
 * cname → var | con
 * @param {Program} program
 * @returns {Node}
 */
function getCname(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * topdecls → topdecl1 ; … ; topdecln 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getTopdecls(program){
  return null; // # TODO : not yet implemented
}


/**
 * topdecl → type simpletype = type
 *         | data [context =>] simpletype [= constrs] [deriving]
 * 	       | newtype [context =>] simpletype = newconstr [deriving]
 * 	       | class [scontext =>] tycls tyvar [where cdecls]
 * 	       | instance [scontext =>] qtycls inst [where idecls]
 * 	       | default (type1 , … , typen) 	    (n ≥ 0)
 * 	       | foreign fdecl
 * 	       | decl
 * @param {Program} program
 * @returns {Node}
 */
function getTopdecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * decls → { decl1 ; … ; decln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getDecls(program){
  return null; // # TODO : not yet implemented
}


/**
 * decl → gendecl
 *	    | (funlhs | pat) rhs
 * @param {Program} program
 * @returns {Node}
 */
function getDecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * cdecls → { cdecl1 ; … ; cdecln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getcdecls(program){
  return null; // # TODO : not yet implemented
}


/**
 * cdecl → gendecl
 *	     | (funlhs | var) rhs
 * @param {Program} program
 * @returns {Node}
 */
function getCdecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * idecls → { idecl1 ; … ; idecln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getIdecls(program){
  return null; // # TODO : not yet implemented
}


/**
 * idecl → (funlhs | var) rhs
 *	     | (empty)
 * @param {Program} program
 * @returns {Node}
 */
function getIdecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * gendecl → vars :: [context =>] type 	    (type signature)
 *	       | fixity [integer] ops 	    (fixity declaration)
 *	       |                             (empty declaration)
 * @param {Program} program
 * @returns {Node}
 */
function getGendecl(program){
  return null; // # TODO : not yet implemented
}

 
/**
 * ops → op1 , … , opn 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getOps(program){
  return null; // # TODO : not yet implemented
}


/**
 * vars → var1 , …, varn 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getVars(program){
  return null; // # TODO : not yet implemented
}


/**
 * fixity → infixl | infixr | infix
 * @param {Program} program
 * @returns {Node}
 */
function getFixity(program){
  return null; // # TODO : not yet implemented
}
