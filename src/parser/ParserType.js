import { Node } from "../Node.js";

//--  File containing parer functions for type declaration  related rules  --//

/**
 * type → btype [-> type] (function type)
 * @param {Program} program
 * @returns {Node}
 */
function getType(program){
  return null; // # TODO : not yet implemented
}

/**
 * btype → [btype] atype (type application)
 * @param {Program} program
 * @returns {Node}
 */
function getBtype(program){
  return null; // # TODO : not yet implemented
}

/**
 * atype → gtycon 
 *       | tyvar 
 *       | (type1, ..., typek)  (tuple type, k ≥ 2) 
 *       | [type]               (list type) 
 *       | (type)               (parenthesized constructor)
 * @param {Program} program
 * @returns {Node}
 */
function gettype(program){
  return null; // # TODO : not yet implemented
}

/**
 * gtycon → qtycon 
 *        | () (unit type) 
 *        | [] (list constructor) 
 *        | (->) (function constructor) 
 *        | (,{,}) (tupling constructors)
 * @param {Program} program
 * @returns {Node}
 */
function getGtycon(program){
  return null; // # TODO : not yet implemented
}

/**
 * context → class 
 *         | (class1, ..., classn) (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getContext(program){
  return null; // # TODO : not yet implemented
}

/**
 * class → qtycls tyvar 
 *       | qtycls (tyvar atype1 ... atypen) (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getClass(program){
  return null; // # TODO : not yet implemented
}

/**
 * scontext → simpleclass 
 *          | (simpleclass1, ..., simpleclassn) (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getScontext(program){
  return null; // # TODO : not yet implemented
}

/**
 * simpleclass → qtycls tyvar
 * @param {Program} program
 * @returns {Node}
 */
function getSimpleClass(program){
  return null; // # TODO : not yet implemented
}

/**
 * simpletype → tycon tyvar1 ... tyvark (k ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getSimpleType(program){
  return null; // # TODO : not yet implemented
}

/**
 * constrs → constr1 | ... | constrn (n ≥ 1)
 * @param {Program} program
 * @returns {Node}
 */
function getConstrs(program){
  return null; // # TODO : not yet implemented
}

/**
 * constr → con [!] atype1 ... [!] atypek (arity con = k, k ≥ 0) 
 *        | (btype | ! atype) conop (btype | ! atype) (infix conop) 
 *        | con { fielddecl1, ..., fielddecln } (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getConstr(program){
  return null; // # TODO : not yet implemented
}

/**
 * newconstr → con atype | con { var :: type }
 * @param {Program} program
 * @returns {Node}
 */
function getNewconstr(program){
  return null; // # TODO : not yet implemented
}

/**
 * fielddecl → vars :: (type | ! atype)
 * @param {Program} program
 * @returns {Node}
 */
function getFielddecl(program){
  return null; // # TODO : not yet implemented
}

/**
 * deriving → deriving (dclass | (dclass1, ..., dclassn)) (n ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getDeriving(program){
  return null; // # TODO : not yet implemented
}

/**
 * dclass → qtycls
 * @param {Program} program
 * @returns {Node}
 */
function getDclass(program){
  return null; // # TODO : not yet implemented
}

/**
 * inst → gtycon 
 *      | (gtycon tyvar1 ... tyvark) (k ≥ 0, tyvars distinct) 
 *      | (tyvar1, ..., tyvark) (k ≥ 2, tyvars distinct) 
 *      | [tyvar] 
 *      | (tyvar1 -> tyvar2) (tyvar1 and tyvar2 distinct)
 * @param {Program} program
 * @returns {Node}
 */
function getInst(program){
  return null; // # TODO : not yet implemented
}

/**
 * fdecl → import callconv [safety] impent var :: ftype (define variable) 
 *       | export callconv expent var :: ftype          (expose variable)
 * @param {Program} program
 * @returns {Node}
 */
function getFdecl(program){
  return null; // # TODO : not yet implemented
}

/**
 * callconv → ccall | stdcall | cplusplus | jvm | dotnet 
 *          | system-specific calling conventions
 * @param {Program} program
 * @returns {Node}
 */
function getCallconv(program){
  return null; // # TODO : not yet implemented
}

/**
 * impent → [string] (see Section 8.5.1)
 * @param {Program} program
 * @returns {Node}
 */
function getImpent(program){
  return null; // # TODO : not yet implemented
}

/**
 * expent → [string] (see Section 8.5.1)
 * @param {Program} program
 * @returns {Node}
 */
function getExpent(program){
  return null; // # TODO : not yet implemented
}

/**
 * safety → unsafe | safe
 * @param {Program} program
 * @returns {Node}
 */
function getSafety(program){
  return null; // # TODO : not yet implemented
}

/**
 * ftype → frtype | fatype → ftype
 * @param {Program} program
 * @returns {Node}
 */
function getFtype(program){
  return null; // # TODO : not yet implemented
}

/**
 * frtype → fatype | ()
 * @param {Program} program
 * @returns {Node}
 */
function getFrtype(program){
  return null; // # TODO : not yet implemented
}

/**
 * fatype → qtycon atype1 ... atypek (k ≥ 0)
 * @param {Program} program
 * @returns {Node}
 */
function getFatype(program){
  return null; // # TODO : not yet implemented
}
