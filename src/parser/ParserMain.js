//--  File containing parser functions for "entry point" related rules  --//

/**
 * module → module modid [exports] where body 
 *        | body
 * @param {Program} program
 * @returns {Boolean}
 */
function getModule(program){
    return false;
}

/**
 * body → { impdecls ; topdecls }
 *	    | { impdecls }
 *	    | { topdecls }
 * @param {Program} program
 * @returns {Boolean}
 */
function getBody(program){
    return false;
}

 
/**
 * impdecls → impdecl1 ; … ; impdecln 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getImpledcls(program){
    return false;
}

 
/**
 * exports → ( export1 , … , exportn [ , ] ) 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getExports(program){
    return false;
}

 
/**
 * export → qvar
 *	      | qtycon [(..) | ( cname1 , … , cnamen )] 	    (n ≥ 0)
 *	      | qtycls [(..) | ( qvar1 , … , qvarn )]    	    (n ≥ 0)
 *	      | module modid
 * @param {Program} program
 * @returns {Boolean}
 */
function getExport(program){
    return false;
}

 
/**
 * impdecl → import [qualified] modid [as modid] [impspec]
 *	       | (empty declaration)
 * @param {Program} program
 * @returns {Boolean}
 */
function getImpdecl(program){
    return false;
}

 
/**
 * impspec → ( import1 , … , importn [ , ] ) 	            (n ≥ 0)
 *	       | hiding ( import1 , … , importn [ , ] ) 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getImpspec(program){
    return false;
}

 
/**
 * import → var
 *	      | tycon [ (..) | ( cname1 , … , cnamen )] 	    (n ≥ 0)
 *	      | tycls [(..) | ( var1 , … , varn )] 	            (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getVar(program){
    return false;
}


/**
 * cname → var | con
 * @param {Program} program
 * @returns {Boolean}
 */
function getCname(program){
    return false;
}

 
/**
 * topdecls → topdecl1 ; … ; topdecln 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getTopdecls(program){
    return false;
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
 * @returns {Boolean}
 */
function getTopdecl(program){
    return false;
}

 
/**
 * decls → { decl1 ; … ; decln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getDecls(program){
    return false;
}


/**
 * decl → gendecl
 *	    | (funlhs | pat) rhs
 * @param {Program} program
 * @returns {Boolean}
 */
function getDecl(program){
    return false;
}

 
/**
 * cdecls → { cdecl1 ; … ; cdecln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getcdecls(program){
    return false;
}


/**
 * cdecl → gendecl
 *	     | (funlhs | var) rhs
 * @param {Program} program
 * @returns {Boolean}
 */
function getCdecl(program){
    return false;
}

 
/**
 * idecls → { idecl1 ; … ; idecln } 	    (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getIdecls(program){
    return false;
}


/**
 * idecl → (funlhs | var) rhs
 *	     | (empty)
 * @param {Program} program
 * @returns {Boolean}
 */
function getIdecl(program){
    return false;
}

 
/**
 * gendecl → vars :: [context =>] type 	    (type signature)
 *	       | fixity [integer] ops 	    (fixity declaration)
 *	       |                             (empty declaration)
 * @param {Program} program
 * @returns {Boolean}
 */
function getGendecl(program){
    return false;
}

 
/**
 * ops → op1 , … , opn 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getOps(program){
    return false;
}


/**
 * vars → var1 , …, varn 	    (n ≥ 1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getVars(program){
    return false;
}


/**
 * fixity → infixl | infixr | infix
 * @param {Program} program
 * @returns {Boolean}
 */
function getFixity(program){
    return false;
}
