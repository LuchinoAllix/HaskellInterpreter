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
  return false;
}

/**
 * rhs → = exp [where decls] | gdrhs [where decls]
 * @param {Program} program
 * @returns {Node}
 */
function getRhs(program){
  return false;
}

/**
 * gdrhs → guards = exp [gdrhs]
 * @param {Program} program
 * @returns {Node}
 */
function getGdrhs(program){
  return false;
}

/**
 * guards → | guard1, …, guardn (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getGuards(program){
  return false;
}

/**
 * guard → pat <- infixexp | let decls | infixexp
 * @param {Program} program
 * @returns {Node}
 */
function getGuard(program){
  return false;
}

/**
 * exp → infixexp :: [context =>] type | infixexp
 * @param {Program} program
 * @returns {Node}
 */
function getExp(program){
  return false;
}

/**
 * infixexp → lexp qop infixexp | - infixexp | lexp
 * @param {Program} program
 * @returns {Node}
 */
function getInfixexp(program){
  return false;
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
  return false;
}

/**
 * fexp → [fexp] aexp
 * @param {Program} program
 * @returns {Node}
 */
function getFexp(program){
  return false;
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
  return false;
}

/**
 * qual → pat <- exp | let decls | exp
 * @param {Program} program
 * @returns {Node}
 */
function getQual(program){
  return false;
}

/**
 * alts → alt1 ; … ; altn (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getAlts(program){
  return false;
}

/**
 * alt → pat -> exp [where decls] 
 *     | pat gdpat [where decls] 
 *     | (empty alternative)
 * @param {Program} program
 * @returns {Node}
 */
function getAlt(program){
  return false;
}

/**
 * gdpat → guards -> exp [ gdpat ]
 * @param {Program} program
 * @returns {Node}
 */
function getGdpat(program){
  return false;
}

/**
 * stmts → stmt1 … stmtn exp [;] (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getStmts(program){
  return false;
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
  return false;
}

/**
 * fbind → qvar = exp
 * @param {Program} program
 * @returns {Node}
 */
function getFbind(program){
  return false;
}

/**
 * pat → lpat qconop pat | lpat
 * @param {Program} program
 * @returns {Node}
 */
function getPat(program){
  return false;
}

/**
 * lpat → apat 
 *      | - (integer | float) 
 *      | gcon apat1 … apatk
 * @param {Program} program
 * @returns {Node}
 */
function getLpat(program){
  return false;
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
  return false;
}

/**
 * fpat → qvar = pat
 * @param {Program} program
 * @returns {Node}
 */
function getFpat(program){
  return false;
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
  return false;
}

/**
 * var → varid | ( varsym )
 * @param {Program} program
 * @returns {Node}
 */
function getVar(program){
  return false;
}

/**
 * qvar → qvarid | ( qvarsym )
 * @param {Program} program
 * @returns {Node}
 */
function getQvar(program){
  return false;
}

/**
 * con → conid | ( consym )
 * @param {Program} program
 * @returns {Node}
 */
function getCon(program){
  return false;
}

/**
 * qcon → qconid | ( gconsym )
 * @param {Program} program
 * @returns {Node}
 */
function getQcon(program){
  return false;
}

/**
 * varop → varsym | ` varid `
 * @param {Program} program
 * @returns {Node}
 */
function getVarop(program){
  return false;
}

/**
 * qvarop → qvarsym | ` qvarid `
 * @param {Program} program
 * @returns {Node}
 */
function getQvarop(program){
  return false;
}

/**
 * conop → consym | ` conid `
 * @param {Program} program
 * @returns {Node}
 */
function getConop(program){
  return false;
}

/**
 * qconop → gconsym | ` qconid `
 * @param {Program} program
 * @returns {Node}
 */
function getQconop(program){
  return false;
}

/**
 * op → varop | conop
 * @param {Program} program
 * @returns {Node}
 */
function getOp(program){
  return false;
}

/**
 * qop → qvarop | qconop
 * @param {Program} program
 * @returns {Node}
 */
function getQop(program){
  return false;
}

/**
 * gconsym → : | qconsym
 * @param {Program} program
 * @returns {Node}
 */
function getGconsym(program){
  return false;
}
