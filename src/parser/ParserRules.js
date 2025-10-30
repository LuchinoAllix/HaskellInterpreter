import { branch, data, rule, ref} from "./Elem.js"

export class Rules {
  constructor() {
    this.rules = {};
    this.createRules();
    this.initRules();
  }

  /**
   * Adds the (empty) rules to the dictionnary
   */
  createRules() {
    this.rules = {
      module: rule("module"),
      body: rule("body"),
      impdecls: rule("impdecls"),
      exports: rule("exports"),
      export: rule("export"),
      impdecl: rule("impdecl"),
      impspec: rule("impspec"),
      import_: rule("import_"),
      cname: rule("cname"),
      topdecls: rule("topdecls"),
      topdecl: rule("topdecl"),
      decls: rule("decls"),
      decl: rule("decl"),
      cdecls: rule("cdecls"),
      cdecl: rule("cdecl"),
      idecls: rule("idecls"),
      idecl: rule("idecl"),
      gendecl: rule("gendecl"),
      ops: rule("ops"),
      vars: rule("vars"),
      fixity: rule("fixity"),
      type: rule("type"),
      btype: rule("btype"),
      atype: rule("atype"),
      gtycon: rule("gtycon"),
      context: rule("context"),
      class_: rule("class_"),
      scontext: rule("scontext"),
      simpleclass: rule("simpleclass"),
      simpletype: rule("simpletype"),
      constrs: rule("constrs"),
      constr: rule("constr"),
      newconstr: rule("newconstr"),
      fielddecl: rule("fielddecl"),
      deriving: rule("deriving"),
      dclass: rule("dclass"),
      inst: rule("inst"),
      fdecl: rule("fdecl"),
      callconv: rule("callconv"),
      impent: rule("impent"),
      expent: rule("expent"),
      safety: rule("safety"),
      ftype: rule("ftype"),
      frtype: rule("frtype"),
      fatype: rule("fatype"),
      funlhs: rule("funlhs"),
      rhs: rule("rhs"),
      gdrhs: rule("gdrhs"),
      guards: rule("guards"),
      guard: rule("guard"),
      exp: rule("exp"),
      infixexp: rule("infixexp"),
      lexp: rule("lexp"),
      fexp: rule("fexp"),
      aexp: rule("aexp"),
      qual: rule("qual"),
      alts: rule("alts"),
      alt: rule("alt"),
      gdpat: rule("gdpat"),
      stmts: rule("stmts"),
      stmt: rule("stmt"),
      fbind: rule("fbind"),
      pat: rule("pat"),
      lpat: rule("lpat"),
      apat: rule("apat"),
      fpat: rule("fpat"),
      gcon: rule("gcon"),
      var: rule("var"),
      qvar: rule("qvar"),
      con: rule("con"),
      qcon: rule("qcon"),
      varop: rule("varop"),
      qvarop: rule("qvarop"),
      conop: rule("conop"),
      qconop: rule("qconop"),
      op: rule("op"),
      qop: rule("qop"),
      gconsym: rule("gconsym"),
    };
  }

  /**
   * Adds the elements of the rules (seperated from createRules to avoid 
   * circular definitions problems)
   * AI tags are indicated next to rules made by AI based on the haskell
   * context free syntax documentation and not manually verified.
   * (the abscence of tag does not imply the abscence of errors).
   */
  initRules() {

    /** ------------------------- AI
     * module -> module modid [exports] where body
     *         | body
     * ------------------------- */
    this.rules.module.childs = [
      branch([
        [data("module"), 1],
        [ref("modid"), 1],
        [ref("exports"), 0],
        [data("where"), 1],
        [ref("body"), 1],
      ]),
      branch([[ref("body"), 1]]),
    ];

    /** ------------------------- AI
     * body -> { impdecls ; topdecls }
     *       | { impdecls }
     *       | { topdecls }
     * ------------------------- */
    this.rules.body.childs = [
      branch([
        [data("{"), 1],
        [ref("impdecls"), 1],
        [data(";"), 1],
        [ref("topdecls"), 1],
        [data("}"), 1]
      ]),
      branch([[data("{"), 1], [ref("impdecls"), 1], [data("}"), 1]]),
      branch([[data("{"), 1], [ref("topdecls"), 1], [data("}"), 1]])
    ];

    /** ------------------------- AI
     * impdecls -> impdecl1 ; … ; impdecln (n ≥ 1)
     * ------------------------- */
    this.rules.impdecls.childs = [
      branch([[ref("impdecl"), 1], [data(";"), 0], [ref("impdecls"), 0]])
    ];

    /** ------------------------- AI
     * impent -> [string]  (see Section 8.5.1) 
     * ------------------------- */ 
    this.rules.impent.childs = [branch([[data("string"), 0]])];

    /** ------------------------- AI
     * expent -> [string]  (see Section 8.5.1) 
     * ------------------------- */
    this.rules.expent.childs = [branch([[data("string"), 0]])];

    /** ------------------------- AI
     * exports -> ( export1 , … , exportn [ , ] )
     * ------------------------- */
    this.rules.exports.childs = [
      branch([
        [data("("), 1],
        [ref("export"), 0],
        [data(","), 0],
        [ref("export"), 0],
        [data(")"), 1],
      ]),
    ];

    /** ------------------------- AI
     * export -> qvar
     *         | qtycon [(..) | ( cname1 , … , cnamen )]
     *         | qtycls [(..) | ( qvar1 , … , qvarn )]
     *         | module modid
     * ------------------------- */
    this.rules.export.childs = [
      branch([[ref("qvar"), 1]]),
      branch([
        [ref("qtycon"), 1],
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [ref("qtycon"), 1],
        [data("("), 1],
        [ref("cname"), 1],
        [data(","), 0],
        [ref("cname"), 0],
        [data(")"), 1],
      ]),
      branch([
        [ref("qtycls"), 1],
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [ref("qtycls"), 1],
        [data("("), 1],
        [ref("qvar"), 1],
        [data(","), 0],
        [ref("qvar"), 0],
        [data(")"), 1],
      ]),
      branch([[data("module"), 1], [ref("modid"), 1]]),
    ];

    /** ------------------------- AI
     * impdecl -> import [qualified] modid [as modid] [impspec]
     *          | (empty declaration)
     * ------------------------- */
    this.rules.impdecl.childs = [
      branch([
        [data("import"), 1],
        [data("qualified"), 0],
        [ref("modid"), 1],
        [data("as"), 0],
        [ref("modid"), 0],
        [ref("impspec"), 0],
      ]),
      branch([]), // empty declaration
    ];

    /** ------------------------- AI

     * impspec -> ( import1 , … , importn [ , ] )
     *           | hiding ( import1 , … , importn [ , ] )
     * ------------------------- */
    this.rules.impspec.childs = [
            [data("("), 1],
      branch([
        [ref("import_"), 1],
        [data(","), 0],
        [ref("import_"), 0],
        [data(")"), 1],
      ]),
      branch([
        [data("hiding"), 1],
        [data("("), 1],
        [ref("import_"), 1],
        [data(","), 0],
        [ref("import_"), 0],
        [data(")"), 1],
      ]),
    ];

    /** ------------------------- AI
     * import -> var
     *         | tycon [(..) | ( cname1 , … , cnamen )]
     *         | tycls [(..) | ( var1 , … , varn )]
     * ------------------------- */
    this.rules.import_.childs = [
      branch([[ref("var"), 1]]),
      branch([
        [ref("tycon"), 1],
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [ref("tycon"), 1],
        [data("("), 1],
        [ref("cname"), 1],
        [data(","), 0],
        [ref("cname"), 0],
        [data(")"), 1],
      ]),
      branch([
        [ref("tycls"), 1],
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [ref("tycls"), 1],
        [data("("), 1],
        [ref("var"), 1],
        [data(","), 0],
        [ref("var"), 0],
        [data(")"), 1],
      ]),
    ];

    /** ------------------------- AI
     * cname -> var | con
     * ------------------------- */
    this.rules.cname.childs = [
      branch([[ref("var"), 1]]),
      branch([[ref("con"), 1]]),
    ];

    /** ------------------------- AI
     * topdecls -> topdecl1 ; … ; topdecln (n ≥ 0)
     * ------------------------- */
    this.rules.topdecls.childs = [
      branch([[ref("topdecl"), 1], [data(";"), 0], [ref("topdecls"), 0]]),
    ];

    /** ------------------------- AI
     * topdecl -> type simpletype = type
     *          | data [context =>] simpletype [= constrs] [deriving]
     *          | newtype [context =>] simpletype = newconstr [deriving]
     *          | class [scontext =>] tycls tyvar [where cdecls]
     *          | instance [scontext =>] qtycls inst [where idecls]
     *          | default (type1 , … , typen)
     *          | foreign fdecl
     *          | decl
     * ------------------------- */
    this.rules.topdecl.childs = [
      branch([[data("type"), 1], [ref("simpletype"), 1], [data("="), 1], [ref("type"), 1]]),
      branch([
        [data("data"), 1],
        [ref("context"), 0],
        [data("=>"), 0],
        [ref("simpletype"), 1],
        [data("="), 0],
        [ref("constrs"), 0],
        [ref("deriving"), 0],
      ]),
      branch([
        [data("newtype"), 1],
        [ref("context"), 0],
        [data("=>"), 0],
        [ref("simpletype"), 1],
        [data("="), 1],
        [ref("newconstr"), 1],
        [ref("deriving"), 0],
      ]),
      branch([
        [data("class"), 1],
        [ref("scontext"), 0],
        [data("=>"), 0],
        [ref("tycls"), 1],
        [ref("tyvar"), 1],
        [data("where"), 0],
        [ref("cdecls"), 0],
      ]),
      branch([
        [data("instance"), 1],
        [ref("scontext"), 0],
        [data("=>"), 0],
        [ref("qtycls"), 1],
        [ref("inst"), 1],
        [data("where"), 0],
        [ref("idecls"), 0],
      ]),
      branch([
        [data("default"), 1],
        [data("("), 1],
        [ref("type"), 0],
        [data(","), 0],
        [ref("type"), 0],
        [data(")"), 1],
      ]),
      branch([[data("foreign"), 1], [ref("fdecl"), 1]]),
      branch([[ref("decl"), 1]]),
    ];

    /** ------------------------- AI
     * decls -> { decl1 ; … ; decln } (n ≥ 0)
     * ------------------------- */
    this.rules.decls.childs = [
      branch([
        [data("{"), 1],
        [ref("decl"), 0],
        [data(";"), 0],
        [ref("decl"), 0],
        [data("}"), 1],
      ]),
    ];

    /** ------------------------- AI
     * decl -> gendecl
     *       | (funlhs | pat) rhs
     * ------------------------- */
    this.rules.decl.childs = [
      branch([[ref("gendecl"), 1]]),
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("pat"), 1], [ref("rhs"), 1]]),
    ];

    /** ------------------------- AI
     * cdecls -> { cdecl1 ; … ; cdecln } (n ≥ 0)
     * ------------------------- */
    this.rules.cdecls.childs = [
      branch([
        [data("{"), 1],
        [ref("cdecl"), 0],
        [data(";"), 0],
        [ref("cdecl"), 0],
        [data("}"), 1],
      ]),
    ];

    /** ------------------------- AI
     * cdecl -> gendecl | (funlhs | var) rhs
     * ------------------------- */
    this.rules.cdecl.childs = [
      branch([[ref("gendecl"), 1]]),
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("var"), 1], [ref("rhs"), 1]]),
    ];

    /** ------------------------- AI
     * idecls -> { idecl1 ; … ; idecln } (n ≥ 0)
     * ------------------------- */
    this.rules.idecls.childs = [
      branch([
        [data("{"), 1],
        [ref("idecl"), 0],
        [data(";"), 0],
        [ref("idecl"), 0],
        [data("}"), 1],
      ]),
    ];

    /** ------------------------- AI
     * idecl -> (funlhs | var) rhs | (empty)
     * ------------------------- */
    this.rules.idecl.childs = [
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("var"), 1], [ref("rhs"), 1]]),
      branch([]),
    ];

    /** ------------------------- AI
     * gendecl -> vars :: [context =>] type
     *           | fixity [integer] ops
     *           | (empty declaration)
     * ------------------------- */
    this.rules.gendecl.childs = [
      branch([
        [ref("vars"), 1],
        [data("::"), 1],
        [ref("context"), 0],
        [data("=>"), 0],
        [ref("type"), 1],
      ]),
      branch([[ref("fixity"), 1], [ref("ops"), 1]]),
      branch([]),
    ];
    
    /** ------------------------- AI
     * ops -> op1 , … , opn
     * ------------------------- */
    this.rules.ops.childs = [
      branch([[ref("op"), 1], [data(","), 0], [ref("ops"), 0]]),
    ];
        

    /** ------------------------- AI
     * vars -> var1 , … , varn
     * ------------------------- */
    this.rules.vars.childs = [
      branch([[ref("var"), 1], [data(","), 0], [ref("vars"), 0]]),
    ];

    /** ------------------------- AI
     * fixity -> infixl | infixr | infix
     * ------------------------- */
    this.rules.fixity.childs = [
      branch([[data("infixl"), 1]]),
      branch([[data("infixr"), 1]]),
      branch([[data("infix"), 1]]),
    ];

    /** ------------------------- AI
     * type -> btype [-> type]
     * ------------------------- */
    this.rules.type.childs = [
      branch([[ref("btype"), 1], [data("->"), 0], [ref("type"), 0]]),
    ];

    /** ------------------------- AI
     * btype -> [btype] atype (type application)
     * ------------------------- */
    this.rules.btype.childs = [
      branch([[ref("btype"), 0], [ref("atype"), 1]]),
    ];

    /** ------------------------- AI
     * atype ->
     *     gtycon
     *   | tyvar
     *   | ( type1 , … , typek ) (tuple type)
     *   | [ type ] (list type)
     *   | ( type ) (parenthesized constructor)
     * ------------------------- */
    this.rules.atype.childs = [
      branch([[ref("gtycon"), 1]]),
      branch([[ref("tyvar"), 1]]),
      branch([
        [data("("), 1],
        [ref("type"), 1],
        [data(","), 1],
        [ref("type"), 1],
        [data(")"), 1],
      ]),
      branch([[data("["), 1], [ref("type"), 1], [data("]"), 1]]),
      branch([[data("("), 1], [ref("type"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI
     * gtycon ->
     *     qtycon
     *   | ()
     *   | []
     *   | (->)
     *   | (,{,})
     * ------------------------- */
    this.rules.gtycon.childs = [
      branch([[ref("qtycon"), 1]]),
      branch([[data("()"), 1]]),
      branch([[data("[]"), 1]]),
      branch([[data("(->)"), 1]]),
      branch([[data("(,)"), 1]]),
    ];

    /** ------------------------- AI
     * context -> class
     *          | ( class1 , … , classn )
     * ------------------------- */
    this.rules.context.childs = [
      branch([[ref("class_"), 1]]),
      branch([[data("("), 1], [ref("class_"), 1], [data(","), 0], [ref("class_"), 0], [data(")"), 1]]),
    ];

    /** ------------------------- AI
     * class -> qtycls tyvar
     *        | qtycls ( tyvar atype1 … atypen )
     * ------------------------- */
    this.rules.class_.childs = [
      branch([[ref("qtycls"), 1], [ref("tyvar"), 1]]),
      branch([
        [ref("qtycls"), 1],
        [data("("), 1],
        [ref("tyvar"), 1],
        [ref("atype"), 1],
        [data(")"), 1],
      ]),
    ];

    /** ------------------------- AI
     * scontext -> simpleclass
     *           | ( simpleclass1 , … , simpleclassn )
     * ------------------------- */
    this.rules.scontext.childs = [
      branch([[ref("simpleclass"), 1]]),
      branch([[data("("), 1], [ref("simpleclass"), 1], [data(","), 0], [ref("simpleclass"), 0], [data(")"), 1]]),
    ];

    /** ------------------------- AI
     * simpleclass -> qtycls tyvar
     * ------------------------- */
    this.rules.simpleclass.childs = [
      branch([[ref("qtycls"), 1], [ref("tyvar"), 1]]),
    ];

    /** ------------------------- AI
     * simpletype -> tycon tyvar1 … tyvark (k ≥ 0)
     * ------------------------- */
    this.rules.simpletype.childs = [
      branch([[ref("tycon"), 1], [ref("tyvar"), 0]]),
    ];

    /** ------------------------- AI
     * constrs -> constr1 | … | constrn
     * ------------------------- */
    this.rules.constrs.childs = [
      branch([[ref("constr"), 1], [data("|"), 0], [ref("constrs"), 0]]),
    ];

    /** ------------------------- AI
     * constr ->
     *   con [!] atype1 … [!] atypek
     *   | (btype | !atype) conop (btype | !atype)
     *   | con { fielddecl1 , … , fielddecln }
     * ------------------------- */
    this.rules.constr.childs = [
      branch([[ref("con"), 1], [ref("atype"), 0]]),
      branch([
        [data("("), 1],
        [ref("btype"), 1],
        [data(")"), 0],
        [ref("conop"), 1],
        [data("("), 1],
        [ref("btype"), 1],
        [data(")"), 0],
      ]),
      branch([
        [ref("con"), 1],
        [data("{"), 1],
        [ref("fielddecl"), 0],
        [data(","), 0],
        [ref("fielddecl"), 0],
        [data("}"), 1],
      ]),
    ];

    /** ------------------------- AI
     * newconstr -> con atype
     *             | con { var :: type }
     * ------------------------- */
    this.rules.newconstr.childs = [
      branch([[ref("con"), 1], [ref("atype"), 1]]),
      branch([
        [ref("con"), 1],
        [data("{"), 1],
        [ref("var"), 1],
        [data("::"), 1],
        [ref("type"), 1],
        [data("}"), 1],
      ]),
    ];

    /** ------------------------- AI
     * fielddecl -> vars :: (type | !atype)
     * ------------------------- */
    this.rules.fielddecl.childs = [
      branch([[ref("vars"), 1], [data("::"), 1], [ref("type"), 1]]),
      branch([[ref("vars"), 1], [data("::"), 1], [data("!"), 1], [ref("atype"), 1]]),
    ];

    /** ------------------------- AI
     * deriving -> deriving (dclass | (dclass1, … , dclassn))
     * ------------------------- */
    this.rules.deriving.childs = [
      branch([[data("deriving"), 1], [data("("), 1], [ref("dclass"), 1], [data(")"), 1]]),
      branch([
        [data("deriving"), 1],
        [data("("), 1],
        [ref("dclass"), 1],
        [data(","), 0],
        [ref("dclass"), 0],
        [data(")"), 1],
      ]),
    ];

    /** ------------------------- AI
     * dclass -> qtycls
     * ------------------------- */
    this.rules.dclass.childs = [
      branch([[ref("qtycls"), 1]]),
    ];

    /** ------------------------- AI
     * inst -> gtycon
     *        | ( gtycon tyvar1 … tyvark )
     *        | ( tyvar1 , … , tyvark )
     *        | [ tyvar ]
     *        | ( tyvar1 -> tyvar2 )
     * ------------------------- */
    this.rules.inst.childs = [
      branch([[ref("gtycon"), 1]]),
      branch([[data("("), 1], [ref("gtycon"), 1], [ref("tyvar"), 1], [data(")"), 1]]),
      branch([[data("("), 1], [ref("tyvar"), 1], [data(","), 1], [ref("tyvar"), 1], [data(")"), 1]]),
      branch([[data("["), 1], [ref("tyvar"), 1], [data("]"), 1]]),
      branch([[data("("), 1], [ref("tyvar"), 1], [data("->"), 1], [ref("tyvar"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI---------------
     * fdecl ->
     *   import callconv [safety] impent var :: ftype
     *   | export callconv expent var :: ftype
     * ---------------------------------------- */
    this.rules.fdecl.childs = [
      branch([[data("import"), 1], [ref("callconv"), 1], [ref("safety"), 0], [ref("impent"), 1], [ref("var"), 1], [data("::"), 1], [ref("ftype"), 1]]),
      branch([[data("export"), 1], [ref("callconv"), 1], [ref("expent"), 1], [ref("var"), 1], [data("::"), 1], [ref("ftype"), 1]]),
    ];

    /** ------------------------- AI---------------
     * callconv -> ccall | stdcall | cplusplus | jvm | dotnet | system-specific
     * ---------------------------------------- */
    this.rules.callconv.childs = [
      branch([[data("ccall"), 1]]),
      branch([[data("stdcall"), 1]]),
      branch([[data("cplusplus"), 1]]),
      branch([[data("jvm"), 1]]),
      branch([[data("dotnet"), 1]]),
    ];

    /** ------------------------- AI---------------
     * safety -> unsafe | safe
     * ---------------------------------------- */
    this.rules.safety.childs = [
      branch([[data("unsafe"), 1]]),
      branch([[data("safe"), 1]]),
    ];

    /** ------------------------- AI---------------
     * ftype -> frtype | fatype -> ftype
     * ---------------------------------------- */
    this.rules.ftype.childs = [
      branch([[ref("frtype"), 1]]),
      branch([[ref("fatype"), 1], [data("->"), 1], [ref("ftype"), 1]]),
    ];

    /** ------------------------- AI---------------
     * frtype -> fatype | ()
     * ---------------------------------------- */
    this.rules.frtype.childs = [
      branch([[ref("fatype"), 1]]),
      branch([[data("()"), 1]]),
    ];

    /** ------------------------- AI---------------
     * fatype -> qtycon atype1 … atypek
     * ---------------------------------------- */
    this.rules.fatype.childs = [
      branch([[ref("qtycon"), 1], [ref("atype"), 0]]),
    ];

    /** ------------------------- AI
     * funlhs -> var apat { apat }
     *          | pat varop pat
     *          | ( funlhs ) apat { apat }
     * ------------------------- */
    this.rules.funlhs.childs = [
      branch([[ref("var"), 1], [ref("apat"), 1]]),
      branch([[ref("pat"), 1], [ref("varop"), 1], [ref("pat"), 1]]),
      branch([[data("("), 1], [ref("funlhs"), 1], [data(")"), 1], [ref("apat"), 1]]),
    ];

    /** ------------------------- AI
     * rhs -> = exp [where decls]
     *      | gdrhs [where decls]
     * ------------------------- */
    this.rules.rhs.childs = [
      branch([[data("="), 1], [ref("exp"), 1], [data("where"), 0], [ref("decls"), 0]]),
      branch([[ref("gdrhs"), 1], [data("where"), 0], [ref("decls"), 0]]),
    ];

    /** ------------------------- AI
     * gdrhs -> guards = exp [gdrhs]
     * ------------------------- */
    this.rules.gdrhs.childs = [
      branch([[ref("guards"), 1], [data("="), 1], [ref("exp"), 1], [ref("gdrhs"), 0]]),
    ];

    /** ------------------------- AI
     * guards -> | guard1, …, guardn (n ≥ 1)
     * ------------------------- */
    this.rules.guards.childs = [
      branch([[data("|"), 1], [ref("guard"), 1], [data(","), 0], [ref("guard"), 0]]),
    ];

    /** ------------------------- AI
     * guard -> pat <- infixexp
     *        | let decls
     *        | infixexp
     * ------------------------- */
    this.rules.guard.childs = [
      branch([[ref("pat"), 1], [data("<-"), 1], [ref("infixexp"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1]]),
      branch([[ref("infixexp"), 1]]),
    ];
    
     /** ------------------------- AI---------------
     * exp -> infixexp :: [context =>] type
     *      | infixexp
     * ---------------------------------------- */
    this.rules.exp.childs = [
      branch([[ref("infixexp"), 1], [data("::"), 1], [ref("type"), 1]]),
      branch([[ref("infixexp"), 1]]),
    ];

    /** ------------------------- AI---------------
     * infixexp -> lexp qop infixexp
     *            | - infixexp
     *            | lexp
     * ---------------------------------------- */
    this.rules.infixexp.childs = [
      branch([[ref("lexp"), 1], [ref("qop"), 1], [ref("infixexp"), 1]]),
      branch([[data("-"), 1], [ref("infixexp"), 1]]),
      branch([[ref("lexp"), 1]]),
    ];

    /** ------------------------- AI---------------
     * lexp -> \ apat1 … apatn -> exp
     *        | let decls in exp
     *        | if exp [;] then exp [;] else exp
     *        | case exp of { alts }
     *        | do { stmts }
     *        | fexp
     * ---------------------------------------- */
    this.rules.lexp.childs = [
      branch([[data("\\"), 1], [ref("apat"), 1], [data("->"), 1], [ref("exp"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1], [data("in"), 1], [ref("exp"), 1]]),
      branch([
        [data("if"), 1],
        [ref("exp"), 1],
        [data(";"), 0],
        [data("then"), 1],
        [ref("exp"), 1],
        [data(";"), 0],
        [data("else"), 1],
        [ref("exp"), 1],
      ]),
      branch([[data("case"), 1], [ref("exp"), 1], [data("of"), 1], [data("{"), 1], [ref("alts"), 1], [data("}"), 1]]),
      branch([[data("do"), 1], [data("{"), 1], [ref("stmts"), 1], [data("}"), 1]]),
      branch([[ref("fexp"), 1]]),
    ];

    /** ------------------------- AI---------------
     * fexp -> [fexp] aexp
     * ---------------------------------------- */
    this.rules.fexp.childs = [
      branch([[ref("fexp"), 0], [ref("aexp"), 1]]),
    ];

    /** ------------------------- AI---------------
     * aexp ->
     *   qvar | gcon | literal
     *   | ( exp )
     *   | ( exp1 , … , expk )
     *   | [ exp1 , … , expk ]
     *   | [ exp1 [, exp2] .. [exp3] ]
     *   | [ exp | qual1 , … , qualn ]
     *   | ( infixexp qop )
     *   | ( qop infixexp )
     *   | qcon { fbind1 , … , fbindn }
     *   | aexp qcon { fbind1 , … , fbindn }
     * ---------------------------------------- */
    this.rules.aexp.childs = [
      branch([[ref("qvar"), 1]]),
      branch([[ref("gcon"), 1]]),
      branch([[ref("literal"), 1]]),
      branch([[data("("), 1], [ref("exp"), 1], [data(")"), 1]]),
      branch([[data("("), 1], [ref("exp"), 1], [data(","), 1], [ref("exp"), 1], [data(")"), 1]]),
      branch([[data("["), 1], [ref("exp"), 1], [data(","), 0], [ref("exp"), 0], [data("]"), 1]]),
      branch([[data("["), 1], [ref("exp"), 1], [data("|"), 1], [ref("qual"), 1], [data("]"), 1]]),
      branch([[data("("), 1], [ref("qop"), 1], [ref("infixexp"), 1], [data(")"), 1]]),
      branch([[data("("), 1], [ref("infixexp"), 1], [ref("qop"), 1], [data(")"), 1]]),
      branch([[ref("qcon"), 1], [data("{"), 1], [ref("fbind"), 0], [data("}"), 1]]),
      branch([[ref("aexp"), 1], [ref("qcon"), 1], [data("{"), 1], [ref("fbind"), 1], [data("}"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qual -> pat <- exp | let decls | exp
     * ---------------------------------------- */
    this.rules.qual.childs = [
      branch([[ref("pat"), 1], [data("<-"), 1], [ref("exp"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1]]),
      branch([[ref("exp"), 1]]),

    ];
    /** ------------------------- AI---------------
     * alts -> alt1 ; … ; altn
     * ---------------------------------------- */
    this.rules.alts.childs = [
      branch([[ref("alt"), 1], [data(";"), 0], [ref("alts"), 0]]),
    ];
    /** ------------------------- AI---------------

     *      | pat gdpat [where decls]
     * alt -> pat -> exp [where decls]
     *      | (empty)
     * ---------------------------------------- */
    this.rules.alt.childs = [
      branch([[ref("pat"), 1], [data("->"), 1], [ref("exp"), 1]]),
      branch([[ref("pat"), 1], [ref("gdpat"), 1]]),
    ];

    /** ------------------------- AI---------------
     * gdpat -> guards -> exp [gdpat]
     * ---------------------------------------- */
    this.rules.gdpat.childs = [
      branch([[ref("guards"), 1], [data("->"), 1], [ref("exp"), 1], [ref("gdpat"), 0]]),
    ];

    /** ------------------------- AI---------------
     * stmts -> stmt1 … stmtn exp [;]
     * ---------------------------------------- */
    this.rules.stmts.childs = [
      branch([[ref("stmt"), 0], [ref("exp"), 1], [data(";"), 0]]),
    ];

    /** ------------------------- AI---------------
     * stmt -> exp ;
     *        | pat <- exp ;
     *        | let decls ;
     *        | ; (empty)
     * ---------------------------------------- */
    this.rules.stmt.childs = [
      branch([[ref("exp"), 1], [data(";"), 1]]),
      branch([[ref("pat"), 1], [data("<-"), 1], [ref("exp"), 1], [data(";"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1], [data(";"), 1]]),
      branch([[data(";"), 1]]),
    ];

    /** ------------------------- AI---------------
     * fbind -> qvar = exp
     * ---------------------------------------- */
    this.rules.fbind.childs = [
      branch([[ref("qvar"), 1], [data("="), 1], [ref("exp"), 1]]),
    ];

     /** ------------------------- AI---------------
     * pat -> lpat qconop pat | lpat
     * ---------------------------------------- */
    this.rules.pat.childs = [
      branch([[ref("lpat"), 1], [ref("qconop"), 1], [ref("pat"), 1]]),
      branch([[ref("lpat"), 1]]),
    ];

    /** ------------------------- AI---------------
     * lpat ->
     *   apat
     *   | - (integer | float)
     *   | gcon apat1 … apatk
     * ---------------------------------------- */
    this.rules.lpat.childs = [
      branch([[ref("apat"), 1]]),
      branch([[data("-"), 1], [data("("), 1], [ref("literal"), 1], [data(")"), 1]]),
      branch([[ref("gcon"), 1], [ref("apat"), 1]]),
    ];

    /** ------------------------- AI---------------
     * apat ->
     *   var [@ apat]
     *   | gcon (arity gcon = 0)
     *   | qcon { fpat1 , … , fpatk }
     *   | literal
     *   | _
     *   | ( pat )
     *   | ( pat1 , … , patk )
     *   | [ pat1 , … , patk ]
     *   | ~ apat
     * ---------------------------------------- */
    this.rules.apat.childs = [
      branch([[ref("var"), 1], [data("@"), 0], [ref("apat"), 0]]),
      branch([[ref("gcon"), 1]]),
      branch([[ref("qcon"), 1], [data("{"), 1], [ref("fpat"), 0], [data("}"), 1]]),
      branch([[ref("literal"), 1]]),
      branch([[data("_"), 1]]),
      branch([[data("("), 1], [ref("pat"), 1], [data(")"), 1]]),
      branch([[data("("), 1], [ref("pat"), 1], [data(","), 1], [ref("pat"), 1], [data(")"), 1]]),
      branch([[data("["), 1], [ref("pat"), 1], [data(","), 0], [ref("pat"), 0], [data("]"), 1]]),
      branch([[data("~"), 1], [ref("apat"), 1]]),
    ];

    /** ------------------------- AI---------------
     * fpat -> qvar = pat
     * ---------------------------------------- */
    this.rules.fpat.childs = [
      branch([[ref("qvar"), 1], [data("="), 1], [ref("pat"), 1]]),
    ];

    /** ------------------------- AI---------------
     * gcon -> () | [] | (,{,}) | qcon
     * ---------------------------------------- */
    this.rules.gcon.childs = [
      branch([[data("()"), 1]]),
      branch([[data("[]"), 1]]),
      branch([[data("(,)"), 1]]),
      branch([[ref("qcon"), 1]]),
    ];

    /** ------------------------- AI---------------
     * var -> varid | ( varsym )
     * ---------------------------------------- */
    this.rules.var.childs = [
      branch([[ref("varid"), 1]]),
      branch([[data("("), 1], [ref("varsym"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qvar -> qvarid | ( qvarsym )
     * ---------------------------------------- */
    this.rules.qvar.childs = [
      branch([[ref("qvarid"), 1]]),
      branch([[data("("), 1], [ref("qvarsym"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI---------------
     * con -> conid | ( consym )
     * ---------------------------------------- */
    this.rules.con.childs = [
      branch([[ref("conid"), 1]]),
      branch([[data("("), 1], [ref("consym"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qcon -> qconid | ( gconsym )
     * ---------------------------------------- */
    this.rules.qcon.childs = [
      branch([[ref("qconid"), 1]]),
      branch([[data("("), 1], [ref("gconsym"), 1], [data(")"), 1]]),
    ];

    /** ------------------------- AI---------------
     * varop -> varsym | ` varid `
     * ---------------------------------------- */
    this.rules.varop.childs = [
      branch([[ref("varsym"), 1]]),
      branch([[data("`"), 1], [ref("varid"), 1], [data("`"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qvarop -> qvarsym | ` qvarid `
     * ---------------------------------------- */
    this.rules.qvarop.childs = [
      branch([[ref("qvarsym"), 1]]),
      branch([[data("`"), 1], [ref("qvarid"), 1], [data("`"), 1]]),
    ];

    /** ------------------------- AI---------------
     * conop -> consym | ` conid `
     * ---------------------------------------- */
    this.rules.conop.childs = [
      branch([[ref("consym"), 1]]),
      branch([[data("`"), 1], [ref("conid"), 1], [data("`"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qconop -> gconsym | ` qconid `
     * ---------------------------------------- */
    this.rules.qconop.childs = [
      branch([[ref("gconsym"), 1]]),
      branch([[data("`"), 1], [ref("qconid"), 1], [data("`"), 1]]),
    ];

    /** ------------------------- AI---------------
     * op -> varop | conop
     * ---------------------------------------- */
    this.rules.op.childs = [
      branch([[ref("varop"), 1]]),
      branch([[ref("conop"), 1]]),
    ];

    /** ------------------------- AI---------------
     * qop -> qvarop | qconop
     * ---------------------------------------- */
    this.rules.qop.childs = [
      branch([[ref("qvarop"), 1]]),
      branch([[ref("qconop"), 1]]),
    ];

    /** ------------------------- AI---------------
     * gconsym -> : | qconsym
     * ---------------------------------------- */
    this.rules.gconsym.childs = [
      branch([[data(":"), 1]]),
      branch([[ref("qconsym"), 1]]),
    ];
  }

}



// idée pour gérer les [a b] ou [a [b] [c]]
// par défaut si on regarde un un optionnel 
// on dit que si il est suivit d'un optionnel 
// alors il doivent être optionels ensemble 
// sinon on les sépare d'un data vide "obligatoire"
// devra être géré par la fonction principale