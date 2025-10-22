//--  File containing parer functions for type declaration  related rules  --//

/**
 * type → btype [-> type] (function type)
 * @param {Program} program
 * @returns {Boolean}
 */
function getType(program){
    return false;
}

/**
 * btype → [btype] atype (type application)
 * @param {Program} program
 * @returns {Boolean}
 */
function getBtype(program){
    return false;
}

/**
 * atype → gtycon 
 *       | tyvar 
 *       | (type1, ..., typek)  (tuple type, k ≥ 2) 
 *       | [type]               (list type) 
 *       | (type)               (parenthesized constructor)
 * @param {Program} program
 * @returns {Boolean}
 */
function gettype(program){
    return false;
}

/**
 * gtycon → qtycon 
 *        | () (unit type) 
 *        | [] (list constructor) 
 *        | (->) (function constructor) 
 *        | (,{,}) (tupling constructors)
 * @param {Program} program
 * @returns {Boolean}
 */
function getGtycon(program){
    return false;
}

/**
 * context → class 
 *         | (class1, ..., classn) (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getContext(program){
    return false;
}

/**
 * class → qtycls tyvar 
 *       | qtycls (tyvar atype1 ... atypen) (n ≥ 1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getClass(program){
    return false;
}

/**
 * scontext → simpleclass 
 *          | (simpleclass1, ..., simpleclassn) (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getScontext(program){
    return false;
}

/**
 * simpleclass → qtycls tyvar
 * @param {Program} program
 * @returns {Boolean}
 */
function getSimpleClass(program){
    return false;
}

/**
 * simpletype → tycon tyvar1 ... tyvark (k ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getSimpleType(program){
    return false;
}

/**
 * constrs → constr1 | ... | constrn (n ≥ 1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getConstrs(program){
    return false;
}

/**
 * constr → con [!] atype1 ... [!] atypek (arity con = k, k ≥ 0) 
 *        | (btype | ! atype) conop (btype | ! atype) (infix conop) 
 *        | con { fielddecl1, ..., fielddecln } (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getConstr(program){
    return false;
}

/**
 * newconstr → con atype | con { var :: type }
 * @param {Program} program
 * @returns {Boolean}
 */
function getNewconstr(program){
    return false;
}

/**
 * fielddecl → vars :: (type | ! atype)
 * @param {Program} program
 * @returns {Boolean}
 */
function getFielddecl(program){
    return false;
}

/**
 * deriving → deriving (dclass | (dclass1, ..., dclassn)) (n ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getDeriving(program){
    return false;
}

/**
 * dclass → qtycls
 * @param {Program} program
 * @returns {Boolean}
 */
function getDclass(program){
    return false;
}

/**
 * inst → gtycon 
 *      | (gtycon tyvar1 ... tyvark) (k ≥ 0, tyvars distinct) 
 *      | (tyvar1, ..., tyvark) (k ≥ 2, tyvars distinct) 
 *      | [tyvar] 
 *      | (tyvar1 -> tyvar2) (tyvar1 and tyvar2 distinct)
 * @param {Program} program
 * @returns {Boolean}
 */
function getInst(program){
    return false;
}

/**
 * fdecl → import callconv [safety] impent var :: ftype (define variable) 
 *       | export callconv expent var :: ftype          (expose variable)
 * @param {Program} program
 * @returns {Boolean}
 */
function getFdecl(program){
    return false;
}

/**
 * callconv → ccall | stdcall | cplusplus | jvm | dotnet 
 *          | system-specific calling conventions
 * @param {Program} program
 * @returns {Boolean}
 */
function getCallconv(program){
    return false;
}

/**
 * impent → [string] (see Section 8.5.1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getImpent(program){
    return false;
}

/**
 * expent → [string] (see Section 8.5.1)
 * @param {Program} program
 * @returns {Boolean}
 */
function getExpent(program){
    return false;
}

/**
 * safety → unsafe | safe
 * @param {Program} program
 * @returns {Boolean}
 */
function getSafety(program){
    return false;
}

/**
 * ftype → frtype | fatype → ftype
 * @param {Program} program
 * @returns {Boolean}
 */
function getFtype(program){
    return false;
}

/**
 * frtype → fatype | ()
 * @param {Program} program
 * @returns {Boolean}
 */
function getFrtype(program){
    return false;
}

/**
 * fatype → qtycon atype1 ... atypek (k ≥ 0)
 * @param {Program} program
 * @returns {Boolean}
 */
function getFatype(program){
    return false;
}
