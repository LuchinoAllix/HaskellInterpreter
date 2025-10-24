import { Node } from "../Node.js";


//--  File containing parser functions for expressions  related rules  --//

/**
 * funlhs → var apat { apat } 
 *        | pat varop pat 
 *        | ( funlhs ) apat { apat }
 * @param {Program} program
 * @returns {Node}
 */
function getFunlhs(program){
  return null; // # TODO : not yet implemented
}

/**
 * rhs → = exp [where decls] | gdrhs [where decls]
 * @param {Program} program
 * @returns {Node}
 */
function getRhs(program){
  return null; // # TODO : not yet implemented
}

/**
 * gdrhs → guards = exp [gdrhs]
 * @param {Program} program
 * @returns {Node}
 */
function getGdrhs(program){
  return null; // # TODO : not yet implemented
}

/**
 * guards → | guard1, …, guardn (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getGuards(program){
  return null; // # TODO : not yet implemented
}

/**
 * guard → pat <- infixexp | let decls | infixexp
 * @param {Program} program
 * @returns {Node}
 */
function getGuard(program){
  return null; // # TODO : not yet implemented
}

/**
 * exp → infixexp :: [context =>] type | infixexp
 * @param {Program} program
 * @returns {Node}
 */
function getExp(program){
  return null; // # TODO : not yet implemented
}

/**
 * infixexp → lexp qop infixexp | - infixexp | lexp
 * @param {Program} program
 * @returns {Node}
 */
function getInfixexp(program){
  return null; // # TODO : not yet implemented
}

/**
 * lexp → \ apat1 … apatn -> exp 
 *      | let decls in exp 
 *      | if exp [;] then exp [;] else exp 
 *      | case exp of { alts } 
 *      | do { stmts } 
 *      | fexp
 * @param {Program} program
 * @returns {Node}
 */
function getLexp(program){
  return null; // # TODO : not yet implemented
}

/**
 * fexp → [fexp] aexp
 * @param {Program} program
 * @returns {Node}
 */
function getFexp(program){
  return null; // # TODO : not yet implemented
}

/**
 * aexp → qvar 
 *      | gcon 
 *      | literal 
 *      | ( exp ) 
 *      | ( exp1 , … , expk ) 
 *      | [ exp1 , … , expk ] 
 *      | [ exp1 [, exp2] .. [exp3] ] 
 *      | [ exp | qual1 , … , qualn ] 
 *      | ( infixexp qop ) 
 *      | ( qop⟨-⟩ infixexp ) 
 *      | qcon { fbind1 , … , fbindn } 
 *      | aexp⟨qcon⟩ { fbind1 , … , fbindn }
 * @param {Program} program
 * @returns {Node}
 */
function getAexp(program){
  return null; // # TODO : not yet implemented
}

/**
 * qual → pat <- exp | let decls | exp
 * @param {Program} program
 * @returns {Node}
 */
function getQual(program){
  return null; // # TODO : not yet implemented
}

/**
 * alts → alt1 ; … ; altn (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getAlts(program){
  return null; // # TODO : not yet implemented
}

/**
 * alt → pat -> exp [where decls] 
 *     | pat gdpat [where decls] 
 *     | (empty alternative)
 * @param {Program} program
 * @returns {Node}
 */
function getAlt(program){
  return null; // # TODO : not yet implemented
}

/**
 * gdpat → guards -> exp [ gdpat ]
 * @param {Program} program
 * @returns {Node}
 */
function getGdpat(program){
  return null; // # TODO : not yet implemented
}

/**
 * stmts → stmt1 … stmtn exp [;] (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getStmts(program){
  return null; // # TODO : not yet implemented
}

/**
 * stmt → exp ; 
 *      | pat <- exp ; 
 *      | let decls ; 
 *      | ;             (empty statement)
 * @param {Program} program
 * @returns {Node}
 */
function getStmt(program){
  return null; // # TODO : not yet implemented
}

/**
 * fbind → qvar = exp
 * @param {Program} program
 * @returns {Node}
 */
function getFbind(program){
  return null; // # TODO : not yet implemented
}

/**
 * pat → lpat qconop pat | lpat
 * @param {Program} program
 * @returns {Node}
 */
function getPat(program){
  return null; // # TODO : not yet implemented
}

/**
 * lpat → apat 
 *      | - (integer | float) 
 *      | gcon apat1 … apatk
 * @param {Program} program
 * @returns {Node}
 */
function getLpat(program){
  return null; // # TODO : not yet implemented
}

/**
 * apat → var [ @ apat] 
 *      | gcon 
 *      | qcon { fpat1 , … , fpatk } 
 *      | literal 
 *      | _ 
 *      | ( pat ) 
 *      | ( pat1 , … , patk ) 
 *      | [ pat1 , … , patk ] 
 *      | ~ apat
 * @param {Program} program
 * @returns {Node}
 */
function getApat(program){
  return null; // # TODO : not yet implemented
}

/**
 * fpat → qvar = pat
 * @param {Program} program
 * @returns {Node}
 */
function getFpat(program){
  return null; // # TODO : not yet implemented
}

/**
 * gcon → () 
 *      | [] 
 *      | (,{,}) 
 *      | qcon
 * @param {Program} program
 * @returns {Node}
 */
function getGcon(program){
  return null; // # TODO : not yet implemented
}

/**
 * var → varid | ( varsym )
 * @param {Program} program
 * @returns {Node}
 */
function getVar(program){
  return null; // # TODO : not yet implemented
}

/**
 * qvar → qvarid | ( qvarsym )
 * @param {Program} program
 * @returns {Node}
 */
function getQvar(program){
  return null; // # TODO : not yet implemented
}

/**
 * con → conid | ( consym )
 * @param {Program} program
 * @returns {Node}
 */
function getCon(program){
  return null; // # TODO : not yet implemented
}

/**
 * qcon → qconid | ( gconsym )
 * @param {Program} program
 * @returns {Node}
 */
function getQcon(program){
  return null; // # TODO : not yet implemented
}

/**
 * varop → varsym | ` varid `
 * @param {Program} program
 * @returns {Node}
 */
function getVarop(program){
  return null; // # TODO : not yet implemented
}

/**
 * qvarop → qvarsym | ` qvarid `
 * @param {Program} program
 * @returns {Node}
 */
function getQvarop(program){
  return null; // # TODO : not yet implemented
}

/**
 * conop → consym | ` conid `
 * @param {Program} program
 * @returns {Node}
 */
function getConop(program){
  return null; // # TODO : not yet implemented
}

/**
 * qconop → gconsym | ` qconid `
 * @param {Program} program
 * @returns {Node}
 */
function getQconop(program){
  return null; // # TODO : not yet implemented
}

/**
 * op → varop | conop
 * @param {Program} program
 * @returns {Node}
 */
function getOp(program){
  return null; // # TODO : not yet implemented
}

/**
 * qop → qvarop | qconop
 * @param {Program} program
 * @returns {Node}
 */
function getQop(program){
  return null; // # TODO : not yet implemented
}

/**
 * gconsym → : | qconsym
 * @param {Program} program
 * @returns {Node}
 */
function getGconsym(program){
  return null; // # TODO : not yet implemented
}
