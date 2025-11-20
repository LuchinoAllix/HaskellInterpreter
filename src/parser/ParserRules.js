import { branch, data, rule, ref, tokentype} from "./Elem.js";

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
      export_1: rule("export_1"),
      export_2: rule("export_2"),
      impdecl: rule("impdecl"),
      impspec: rule("impspec"),
      import: rule("import"),
      import_1: rule("import_1"),
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
      class: rule("class"),
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
      aexp_: rule("aexp_"),
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
      interactive: rule("interactive"),
      literal: rule("literal")
    };
  }

  /**
   * Adds the elements of the rules (seperated from createRules to avoid 
   * circular definitions problems)
   */
  initRules() {

    /** -------------------------
     * module -> module modid [exports] where body
     *         | body
     * ------------------------- */
    this.rules.module.childs = [
      branch([
        [data("module"), 1],
        [tokentype("Modid"), 1],
        [ref("exports"), 0],
        [data("where"), 1],
        [ref("body"), 1],
      ]),
      branch([[ref("body"), 1]])
    ];

    /** -------------------------
     * body -> '{' impdecls ';' topdecls '}'
     *       | '{' impdecls '}'
     *       | '{' topdecls '}'
     *       | '{' interactive '}' // added rule to be ghci-like 
     * ------------------------- */
    this.rules.body.childs = [
      branch([
        [data("{"), 1],
        [ref("impdecls"), 1],
        [data(";"), 1],
        [ref("topdecls"), 1],
        [data("}"), 1]
      ]),
      branch([
        [data("{"), 1], 
        [ref("impdecls"), 1], 
        [data("}"), 1]
      ]),
      branch([
        [data("{"), 1], 
        [ref("topdecls"), 1], 
        [data("}"), 1]
      ]),
      branch([
        [data("{"), 1], 
        [ref("interactive"), 1],
        [data("}"), 1]
      ])
    ];

    /** ------------------------- // added rule to be ghci-like
     * interactive -> exp
     * ------------------------- */
    this.rules.interactive.childs = [
      branch([[ref("exp"),1]])
    ];

    /** -------------------------
     * impdecls -> impdecl1 ';' … ';' impdecln                           (n ≥ 1)
     * ------------------------- */
    this.rules.impdecls.childs = [
      branch([
        [branch([
          [ref("impdecl"), 1], 
          [data(";"), 1], 
        ]), 3],
        [ref("impdecl"), 1]
      ])
    ];

    /** -------------------------
     * exports -> '(' export1 ',' … ',' exportn [ ',' ] ')'              (n ≥ 0) 
     * ------------------------- */
    this.rules.exports.childs = [
      branch([
        [data("("), 1],
        [ref("export"), 0],
        [branch([
          [ref("export"),1]
          [data(","), 1]
        ]), 3]
        [data(","), 0]
        [data(")"), 1],
      ])
    ];

    /** -------------------------
     * export -> qvar
     *         | qtycon ['(..)' | '(' cname1 ',' … ',' cnamen ')']       (n ≥ 0) 
     *         | qtycls ['(..)' | '(' qvar1 ',' … ',' qvarn ')']         (n ≥ 0)
     *         | module modid
     * ------------------------- */
    this.rules.export.childs = [
      branch([[ref("qvar"), 1]]),
      branch([
        [tokentype("Qtycon"), 1],          
        [ref("export_1"), 0]
      ]),
      branch([
        [tokentype("Qtycls"), 1],
        [ref("export_2"), 0]
      ]),
      branch([[data("module"), 1], [tokentype("Modid"), 1]])
    ];

    /** ------------------------- (added rule for export)
     * export_1 -> '(..)' | '(' cname1 ',' … ',' cnamen ')'              (n ≥ 0)
     * ------------------------- */
    this.rules.export_1.childs = [
      branch([
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [data("("), 1],
        [branch([
          [ref("cname"), 1],
          [data(','), 1]
        ]), 3],
        [ref("cname"), 0],
        [data(")"), 1]
      ])
    ]

    /** ------------------------- (added rule for export)
     * export_2 -> '(..)' | '(' qvar1 ',' … ',' qvar ')'                 (n ≥ 0)
     * ------------------------- */
    this.rules.export_2.childs = [
      branch([
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [data("("), 1],
        [branch([
          [ref("qvar"), 1],
          [data(','), 1]
        ]), 3],
        [ref("qvar"), 0],
        [data(")"), 1]
      ])
    ]

    /** -------------------------
     * impdecl -> import [qualified] modid [as modid] [impspec]
     *          | (empty declaration)
     * ------------------------- */
    this.rules.impdecl.childs = [
      branch([
        [data("import"), 1],
        [data("qualified"), 0],
        [tokentype("Modid"), 1],
        [branch([
          [data("as"), 1],
          [tokentype("Modid"), 1],
        ]), 0],
        [ref("impspec"), 0]
      ]),
      branch([]) // empty declaration
    ];

    /** -------------------------
     * impspec -> '(' import1 ',' … ',' importn [ ',' ] ')'              (n ≥ 0)
     *           | 'hiding (' import1 ',' … ',' importn [ ',' ] ')'      (n ≥ 0)
     * ------------------------- */
    this.rules.impspec.childs = [
      branch([
        [data("("), 1],
        [branch(
          [ref("import"), 1],
          [data(","), 1]
        ), 3],
        [ref("import"), 0],
        [data(")"), 1]
      ]),
      branch([
        [data("hiding"), 1],
        [data("("), 1],
        [branch(
          [ref("import"), 1],
          [data(","), 1]
        ), 3],
        [ref("import"), 0],
        [data(")"), 1]
      ])
    ];

    /** -------------------------
     * import -> var
     *         | tycon ['(..)' | '(' cname1 ',' … ',' cnamen ')']        (n ≥ 0)
     *         | tycls ['(..)' | '(' var1 ',' … ',' varn ')']            (n ≥ 0)
     * ------------------------- */
    this.rules.import.childs = [
      branch([[ref("var"), 1]]),
      branch([
        [tokentype("Tycon"), 1],
        [ref("export_1"), 0]
      ]),
      branch([
        [tokentype("Tycls"), 1], // fixme
        [ref("import_1"), 0]
      ])
    ];

    /** ------------------------- (added rule for import)
     * import_1 -> '(..)' | '(' var1 ',' … ',' varn ')'                  (n ≥ 0)
     * ------------------------- */
    this.rules.import_1.childs = [
      branch([
        [data("("), 1],
        [data(".."), 1],
        [data(")"), 1],
      ]),
      branch([
        [data("("), 1],
        [branch([
          [ref("var"), 1],
          [data(','), 1]
        ]), 3],
        [ref("var"), 0],
        [data(")"), 1]
      ])
    ]

    /** -------------------------
     * cname -> var | con
     * ------------------------- */
    this.rules.cname.childs = [
      branch([[ref("var"), 1]]),
      branch([[ref("con"), 1]]),
    ];

    /** -------------------------
     * topdecls -> topdecl1 ; … ; topdecln                               (n ≥ 0)
     * ------------------------- */
    this.rules.topdecls.childs = [
      branch([
        [branch([
          [ref("topdecl"), 1], 
          [data(";"), 1], 
        ]), 3],
        [ref("topdecl"), 1]
      ])
    ];

    /** -------------------------
     * topdecl -> 'type' simpletype '=' type
     *          | 'data' [context '=>'] simpletype ['=' constrs] [deriving]
     *          | 'newtype' [context '=>'] simpletype '=' newconstr [deriving]
     *          | 'class' [scontext '=>'] tycls tyvar ['where' cdecls]
     *          | 'instance' [scontext '=>'] qtycls inst ['where' idecls]
     *          | 'default' (type1 , … , typen)                          (n ≥ 0) 
     *          | 'foreign' fdecl
     *          | decl
     * ------------------------- */
    this.rules.topdecl.childs = [
      branch([
        [data("type"), 1], 
        [ref("simpletype"), 1], 
        [data("="), 1], 
        [ref("type"), 1]
      ]),
      branch([
        [data("data"), 1],
        [branch([
          [ref("context"), 0],
          [data("=>"), 1]
        ]), 0]
        [ref("simpletype"), 1],
        [branch([
          [data("="), 1],
          [ref("constrs"), 1]
        ]), 0]
        [ref("deriving"), 0],
      ]),
      branch([
        [data("newtype"), 1],
        [branch([
          [ref("context"), 0],
          [data("=>"), 1]
        ]), 0]
        [ref("simpletype"), 1],
        [branch([
          [data("="), 1],
          [ref("newconstr"), 1]
        ]), 0]
        [ref("deriving"), 0],
      ]),
      branch([
        [data("class"), 1],
        [branch([
          [ref("scontext"), 0],
          [data("=>"), 1]
        ]), 0]
        [tokentype("Tycls"), 1],
        [tokentype("Tyvar"), 1],
        [branch([
          [data("where"), 1],
          [ref("cdecls"), 1]
        ]), 0]
      ]),
      branch([
        [data("instance"), 1],
        [branch([
          [ref("scontext"), 0],
          [data("=>"), 1]
        ]), 0]
        [tokentype("Qtycls"), 1],
        [ref("inst"), 1],
        [branch([
          [data("where"), 1],
          [ref("idecls"), 1]
        ]), 0]
      ]),
      branch([
        [data("default"), 1],
        [data("("), 1],
        [branch([
          [ref("type"), 1],
          [data(","), 1]
        ]), 3]
        [ref("type"), 0],
        [data(")"), 1],
      ]),
      branch([
        [data("foreign"), 1], 
        [ref("fdecl"), 1]
      ]),
      branch([[ref("decl"), 1]])
    ];

    /** -------------------------
     * decls -> '{' decl1 ';' … ';' decln '}'                            (n ≥ 0)
     * ------------------------- */
    this.rules.decls.childs = [
      branch([
        [data("{"), 1],
        [branch([
          [ref("decl"), 1],
          [data(";"), 1]
        ]), 3],
        [ref("decl"), 1],
        [data("}"), 1]
      ])
    ];

    /** -------------------------
     * decl -> gendecl
     *       | (funlhs | pat) rhs
     * ------------------------- */
    this.rules.decl.childs = [
      branch([[ref("gendecl"), 1]]),
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("pat"), 1], [ref("rhs"), 1]])
    ];

    /** -------------------------
     * cdecls -> '{' cdecl1 ';' … ';' cdecln '}'                         (n ≥ 0)
     * ------------------------- */
    this.rules.cdecls.childs = [
      branch([
        [data("{"), 1],
        [branch([
          [ref("cdecl"), 1],
          [data(";"), 1],
        ]), 3],
        [ref("cdecl"), 1],
        [data("}"), 1],
      ])
    ];

    /** -------------------------
     * cdecl -> gendecl | (funlhs | var) rhs
     * ------------------------- */
    this.rules.cdecl.childs = [
      branch([[ref("gendecl"), 1]]),
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("var"), 1], [ref("rhs"), 1]])
    ];

    /** -------------------------
     * idecls -> '{' idecl1 ';' … ';' idecln '}'                         (n ≥ 0)
     * ------------------------- */
    this.rules.idecls.childs = [
      branch([
        [data("{"), 1],
        [branch([
          [ref("idecl"), 1],
          [data(";"), 1],
        ]), 3],
        [ref("idecl"), 0],
        [data("}"), 1],
      ])
    ];

    /** -------------------------
     * idecl -> (funlhs | var) rhs | (empty)
     * ------------------------- */
    this.rules.idecl.childs = [
      branch([[ref("funlhs"), 1], [ref("rhs"), 1]]),
      branch([[ref("var"), 1], [ref("rhs"), 1]]),
      branch([])
    ];

    /** -------------------------
     * gendecl -> vars '::' [context '=>'] type
     *           | fixity [integer] ops
     *           | (empty declaration)
     * ------------------------- */
    this.rules.gendecl.childs = [
      branch([
        [ref("vars"), 1],
        [data("::"), 1],
        [branch([
          [ref("context"), 1],
          [data("=>"), 1]
        ]), 0],
        [ref("type"), 1]
      ]),
      branch([
        [ref("fixity"), 1], 
        [tokentype("integer"), 0], 
        [ref("ops"), 1]
      ]),
      //branch([]) FIXME : normal que ceci soit commenté ?
    ];
    
    /** -------------------------
     * ops -> op1 ',' … ',' opn                                          (n ≥ 1)
     * ------------------------- */
    this.rules.ops.childs = [
      branch([
        [ref("op"), 1],
        [branch([
          [data(","), 1], 
          [ref("op"), 1]
        ]), 3],
      ])
    ];        

    /** -------------------------
     * vars -> var1 ',' … ',' varn                                       (n ≥ 1)
     * ------------------------- */
    this.rules.vars.childs = [
      branch([
        [ref("var"), 1],
        [branch([
          [data(","), 1], 
          [ref("var"), 1]
        ]), 3]
      ])
    ];

    /** -------------------------
     * fixity -> 'infixl' | 'infixr' | 'infix'
     * ------------------------- */
    this.rules.fixity.childs = [
      branch([[data("infixl"), 1]]),
      branch([[data("infixr"), 1]]),
      branch([[data("infix"), 1]])
    ];

    /** -------------------------
     * type -> btype ['->' type]                                 (function type) 
     * ------------------------- */
    this.rules.type.childs = [
      branch([
        [ref("btype"), 1],
        [branch([
          [data("->"), 1], 
          [ref("type"), 1]
        ]), 0]
      ])
    ];

    /** -------------------------
     * btype -> [btype] atype                                 (type application)
     * ------------------------- */
    this.rules.btype.childs = [
      branch([
        [ref("atype"), 2]
      ])
    ];

    /** -------------------------
     * atype -> gtycon
     *        | tyvar
     *        | '(' type1 ',' … ',' typek ')'               (tuple type,  k ≥ 2)
     *        | '[' type ']'                                         (list type)
     *        | '(' type ')'                         (parenthesized constructor)
     * ------------------------- */
    this.rules.atype.childs = [
      branch([[ref("gtycon"), 1]]),
      branch([[tokentype("Tyvar"), 1]]),
      branch([
        [data("("), 1],
        [ref("type"), 1],
        [data(","), 1],
        [ref("type"), 1],
        [branch([
          [data(","), 1],
          [ref("type"), 1],
        ]),3]
        [data(")"), 1]
      ]),
      branch([[data("["), 1], [ref("type"), 1], [data("]"), 1]]),
      branch([[data("("), 1], [ref("type"), 1], [data(")"), 1]])
    ];

    /** ------------------------- 
     * gtycon -> qtycon
     *         | '()'
     *         | '[]'
     *         | '(->)'
     *         | '(,'{','}')' // FIXME : not sure this will be matched because
     *                        // always comparing to a single token, need to 
     *                        // verify how input like (,,,,,,) would be 
     *                        // tokenized 
     * ------------------------- */
    this.rules.gtycon.childs = [
      branch([[tokentype("Qtycon"), 1]]), 
      branch([[data("()"), 1]]),
      branch([[data("[]"), 1]]),
      branch([[data("(->)"), 1]]),
      branch([
        [data("(,"), 1],
        [data(","), 3], 
        [data(")"), 1]
      ])
    ];

    /** ------------------------- 
     * context -> class
     *          | ( class1 , … , classn )                                (n ≥ 0) 
     * ------------------------- */
    this.rules.context.childs = [
      branch([[ref("class"), 1]]),
      branch([
        [data("("), 1],
        [branch([
          [ref("class"), 1],
          [data(","), 1]
        ]), 3],
        [ref("class"), 0],
        [data(")"), 1]
      ])
    ];

    /** -------------------------
     * class -> qtycls tyvar
     *        | qtycls ( tyvar atype1 … atypen )                         (n ≥ 1) 
     * ------------------------- */
    this.rules.class.childs = [
      branch([[tokentype("Qtycls"), 1], [tokentype("Tyvar"), 1]]),
      branch([
        [tokentype("Qtycls"), 1],
        [data("("), 1],
        [tokentype("Tyvar"), 1],
        [ref("atype"), 2],
        [data(")"), 1],
      ]),
    ];

    /** -------------------------
     * scontext -> simpleclass
     *           | ( simpleclass1 , … , simpleclassn )                   (n ≥ 0) 
     * ------------------------- */
    this.rules.scontext.childs = [ // TODO
      branch([[ref("simpleclass"), 1]]),
      branch([
        [data("("), 1], 
        [branch([
          [ref("simpleclass"), 1], 
          [data(","), 1], 
        ])]
        [ref("simpleclass"), 0], 
        [data(")"), 1]
      ]),
    ];

    /** -------------------------
     * simpleclass -> qtycls tyvar
     * ------------------------- */
    this.rules.simpleclass.childs = [
      branch([[tokentype("Qtycls"), 1], [tokentype("Tyvar"), 1]]),
    ];

    /** -------------------------
     * simpletype -> tycon tyvar1 … tyvark                               (k ≥ 0)
     * ------------------------- */
    this.rules.simpletype.childs = [
      branch([[tokentype("Tycon"), 1], [tokentype("Tyvar"), 3]])
    ];

    /** -------------------------
     * constrs -> constr1 | … | constrn                                  (n ≥ 1) 
     * ------------------------- */
    this.rules.constrs.childs = [
      branch([
        [branch([
          [ref("constr"), 1], 
          [data("|"), 1], 
        ]), 2],
        [ref("constr"), 0]
      ])
    ];

    /** ------------------------- (arity con not used)
     * constr -> con ['!'] atype1 … ['!'] atypek        (arity con  =  k, k ≥ 0) 
     *         | (btype | '!'atype) conop (btype | '!'atype)       (infix conop) 
     *         | con '{' fielddecl1 ',' … ',' fielddecln '}'             (n ≥ 0) 
     * ------------------------- */
    this.rules.constr.childs = [
      branch([
        [ref("con"), 1],
        [branch([
          [data("!"), 0]
          [ref("atype"), 1]
        ]), 3] 
      ]),
      branch([
        [ref("btype"), 1], 
        [ref("conop"), 1], 
        [ref("btype"), 1]
      ]),
      branch([
        [data("!"), 1], [ref("atype"), 1], 
        [ref("conop"), 1], 
        [ref("btype"), 1]
      ]),
      branch([
        [ref("btype"), 1], 
        [ref("conop"), 1],
        [data("!"), 1], [ref("atype"), 1]
      ]),
      branch([
        [data("!"), 1], [ref("atype"), 1], 
        [ref("conop"), 1],
        [data("!"), 1], [ref("atype"), 1]
      ]),
      branch([
        [ref("con"), 1],
        [data("{"), 1],
        [branch([
          [ref("fielddecl"), 1],
          [data(","), 1],
        ]), 3] 
        [ref("fielddecl"), 0],
        [data("}"), 1],
      ]),
    ];

    /** -------------------------
     * newconstr -> con atype
     *             | con '{' var '::' type '}'
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

    /** -------------------------
     * fielddecl -> vars :: (type | '!'atype)
     * ------------------------- */
    this.rules.fielddecl.childs = [
      branch([
        [ref("vars"), 1], [data("::"), 1], [ref("type"), 1]
      ]),
      branch([
        [ref("vars"), 1], [data("::"), 1], [data("!"), 1], [ref("atype"), 1]
      ]),
    ];

    /** -------------------------
     * deriving -> 'deriving' (dclass | '('dclass1 ',' … ',' dclassn')') (n ≥ 0) 
     * ------------------------- */
    this.rules.deriving.childs = [
      branch([[data("deriving"), 1], [ref("dclass"), 1]]),
      branch([
        [data("deriving"), 1],
        [data("("), 1],
        [branch([
          [ref("dclass"), 1],
          [data(","), 1],
        ]), 3]
        [ref("dclass"), 0],
        [data(")"), 1],
      ]),
    ];

    /** -------------------------
     * dclass -> qtycls
     * ------------------------- */
    this.rules.dclass.childs = [
      branch([[tokentype("Qtycls"), 1]]),
    ];

    /** ------------------------- (distinctness not verified)
     * inst -> gtycon
     *        | '(' gtycon tyvar1 … tyvark ')'          (k ≥ 0, tyvars distinct) 
     *        | '(' tyvar1 ',' … ',' tyvark ')'         (k ≥ 2, tyvars distinct) 
     *        | '[' tyvar ']'
     *        | '(' tyvar1 '->' tyvar2 ')'            tyvar1 and tyvar2 distinct 
     * ------------------------- */
    this.rules.inst.childs = [
      branch([[ref("gtycon"), 1]]),
      branch([
        [data("("), 1], 
        [ref("gtycon"), 1], 
        [tokentype("Tyvar"), 3], 
        [data(")"), 1]
      ]),
      branch([
        [data("("), 1], 
        [tokentype("Tyvar"), 1],
        [data(","), 1], 
        [tokentype("Tyvar"), 1],
        [branch([
          [data(","), 1], 
          [tokentype("Tyvar"), 1]
        ]), 3],
        [data(")"), 1]
      ]),
      branch([
        [data("["), 1], 
        [tokentype("Tyvar"), 1], 
        [data("]"), 1]
      ]),
      branch([
        [data("("), 1], 
        [tokentype("Tyvar"), 1], 
        [data("->"), 1], 
        [tokentype("Tyvar"), 1], 
        [data(")"), 1]
      ]),
    ];

    /** -------------------------
     * fdecl -> 'import' callconv [safety] impent var '::' ftype
     *        | 'export' callconv expent var '::' ftype
     * ------------------------- */
    this.rules.fdecl.childs = [
      branch([
        [data("import"), 1], 
        [ref("callconv"), 1], 
        [ref("safety"), 0], 
        [ref("impent"), 1], 
        [ref("var"), 1], 
        [data("::"), 1], 
        [ref("ftype"), 1]
      ]),
      branch([
        [data("export"), 1], 
        [ref("callconv"), 1], 
        [ref("expent"), 1], 
        [ref("var"), 1], 
        [data("::"), 1], 
        [ref("ftype"), 1]
      ]),
    ];

    /** -------------------------
     * callconv -> ccall | stdcall | cplusplus | jvm | dotnet | system-specific
     * ------------------------- */
    this.rules.callconv.childs = [
      branch([[data("ccall"), 1]]),
      branch([[data("stdcall"), 1]]),
      branch([[data("cplusplus"), 1]]),
      branch([[data("jvm"), 1]]),
      branch([[data("dotnet"), 1]])
    ];

    /** -------------------------
     * impent -> [string]                                    (see Section 8.5.1) 
     * ------------------------- */ 
    this.rules.impent.childs = [branch([[tokentype("String"), 0]])];

    /** -------------------------
     * expent -> [string]                                    (see Section 8.5.1) 
     * ------------------------- */
    this.rules.expent.childs = [branch([[tokentype("String"), 0]])];

    /** -------------------------
     * safety -> 'unsafe' | 'safe'
     * ------------------------- */
    this.rules.safety.childs = [
      branch([[data("unsafe"), 1]]),
      branch([[data("safe"), 1]]),
    ];

    /** -------------------------
     * ftype -> frtype | fatype '->' ftype
     * ------------------------- */
    this.rules.ftype.childs = [
      branch([[ref("frtype"), 1]]),
      branch([[ref("fatype"), 1], [data("->"), 1], [ref("ftype"), 1]]),
    ];

    /** -------------------------
     * frtype -> fatype | ()
     * ------------------------- */
    this.rules.frtype.childs = [
      branch([[ref("fatype"), 1]]),
      branch([[data("()"), 1]]),
    ];

    /** -------------------------
     * fatype -> qtycon atype1 … atypek                                (k  ≥  0) 
     * ------------------------- */
    this.rules.fatype.childs = [
      branch([[tokentype("Qtycon"), 1], [ref("atype"), 3]]),
    ];

    /** -------------------------
     * funlhs -> var apat { apat }
     *          | pat varop pat
     *          | '(' funlhs ')' apat { apat }
     * ------------------------- */
    this.rules.funlhs.childs = [
      branch([[ref("var"), 1], [ref("apat"), 2]]),
      branch([[ref("pat"), 1], [ref("varop"), 1], [ref("pat"), 1]]),
      branch([
        [data("("), 1], [ref("funlhs"), 1], [data(")"), 1], [ref("apat"), 2]
      ]),
    ];

    /** -------------------------
     * rhs -> '=' exp [where decls]
     *      | gdrhs [where decls]
     * ------------------------- */
    this.rules.rhs.childs = [
      branch([
        [data("="), 1], 
        [ref("exp"), 1], 
        [branch([
          [data("where"), 1], 
          [ref("decls"), 1]
        ]), 0]
      ]),
      branch([
        [ref("gdrhs"), 1],
        [branch([
          [data("where"), 1], 
          [ref("decls"), 1]
        ]), 0]
      ])
    ];

    /** -------------------------
     * gdrhs -> guards '=' exp [gdrhs]
     * ------------------------- */
    this.rules.gdrhs.childs = [
      branch([
        [ref("guards"), 1], 
        [data("="), 1], 
        [ref("exp"), 1], 
        [ref("gdrhs"), 0]
      ])
    ];

    /** -------------------------
     * guards -> | guard1 ',' … ',' guardn                               (n ≥ 1)
     * ------------------------- */
    this.rules.guards.childs = [
      branch([
        [data("|"), 1],
        [ref("guard"), 1],
        [branch([
          [data(","), 1],
          [ref("guard"), 1]
        ]), 3]
      ])
    ];

    /** -------------------------
     * guard -> pat '<-' infixexp                                (pattern guard)
     *        | let decls                                    (local declaration)
     *        | infixexp                                         (boolean guard) 
     * ------------------------- */
    this.rules.guard.childs = [
      branch([[ref("pat"), 1], [data("<-"), 1], [ref("infixexp"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1]]),
      branch([[ref("infixexp"), 1]])
    ];
    
     /** -------------------------
     * exp -> infixexp '::' [context '=>'] type      (expression type signature) 
     *      | infixexp
     * ------------------------- */
    this.rules.exp.childs = [
      branch([
        [ref("infixexp"), 1], 
        [data("::"), 1], 
        [branch([
          [ref("context"), 1], 
          [data("=>"), 1]
        ]), 0]
        [ref("type"), 1]
      ]),
      branch([[ref("infixexp"), 1]])
    ];

    /** -------------------------
     * infixexp -> lexp qop infixexp                (infix operator application) 
     *            | '-' infixexp                               (prefix negation) 
     *            | lexp
     * ------------------------- */
    this.rules.infixexp.childs = [
      branch([[ref("lexp"), 1], [ref("qop"), 1], [ref("infixexp"), 1]]),
      branch([[data("-"), 1], [ref("infixexp"), 1]]),
      branch([[ref("lexp"), 1]])
    ];

    /** -------------------------
     * lexp -> '\' apat1 … apatn '->' exp            (lambda abstraction, n ≥ 1) 
     *        | 'let' decls 'in' exp                            (let expression) 
     *        | 'if' exp [';'] 'then' exp [';'] 'else' exp         (conditional) 
     *        | 'case' exp 'of' '{' alts '}'                   (case expression) 
     *        | 'do' '{' stmts '}'                               (do expression) 
     *        | fexp
     * ------------------------- */
    this.rules.lexp.childs = [
      branch([
        [data("\\"), 1],
        [ref("apat"), 2], 
        [data("->"), 1], 
        [ref("exp"), 1]
      ]),
      branch([
        [data("let"), 1], 
        [ref("decls"), 1], 
        [data("in"), 1], 
        [ref("exp"), 1]
      ]),
      branch([
        [data("if"), 1],
        [ref("exp"), 1],
        [data(";"), 0],
        [data("then"), 1],
        [ref("exp"), 1],
        [data(";"), 0],
        [data("else"), 1],
        [ref("exp"), 1]
      ]),
      branch([
        [data("case"), 1], 
        [ref("exp"), 1], 
        [data("of"), 1], 
        [data("{"), 1], 
        [ref("alts"), 1], 
        [data("}"), 1]
      ]),
      branch([
        [data("do"), 1], 
        [data("{"), 1], 
        [ref("stmts"), 1], 
        [data("}"), 1]
      ]),
      branch([[ref("fexp"), 1]])
    ];

    /** ------------------------- (modified to avoid infinite loop)
     * fexp -> [fexp] aexp                                (function application) 
     * ------------------------- */
    this.rules.fexp.childs = [
      branch([[ref("aexp"), 2]])
    ];

    /** -------------------------
     * aexp -> aexp_ { <qcon> '{' fbind1 ',' … ',' fbindn '}'} 
     *                                                     (labeled update, n≥1) 
     * ------------------------- */
    this.rules.aexp.childs = [
      branch([
        [ref("aexp_"), 1],
        [branch([
          [ref("qcon"), 4], // FIXME : verify negation
          [data("{"), 1], 
          [ref("fbind"), 1], 
          [branch([
            [data(","), 1],
            [ref("fbind"), 1], 
          ]), 3],
          [data("}"), 1] 
        ]), 3]
      ])
    ];

    /** ------------------------- (added rule to avoid cyclic problems)
     * aexp_ -> qvar                                                  (variable) 
     *       | gcon                                        (general constructor) 
     *       | literal
     *       | '(' exp ')'                            (parenthesized expression) 
     *       | '(' exp1 ',' … ',' expk ')'                        (tuple, k ≥ 2) 
     *       | '[' exp1 ',' … ',' expk ']'                         (list, k ≥ 1) 
     *       | '[' exp1 [',' exp2] '..' [exp3] ']'         (arithmetic sequence) 
     *       | '[' exp '|' qual1 ',' … ',' qualn ']' (list comprehension, n ≥ 1) 
     *       | '(' infixexp qop ')'                               (left section) 
     *       | '(' qop infixexp ')'                              (right section) 
     *       | qcon '{' fbind1 ',' … ',' fbindn '}'(labeled construction, n ≥ 0) 
     * ------------------------- */
    this.rules.aexp_.childs = [
      branch([[ref("qvar"), 1]]),
      branch([[ref("gcon"), 1]]),
      branch([[ref("literal"), 1]]),
      branch([
        [data("("), 1], [ref("exp"), 1], [data(")"), 1]
      ]),
      branch([
        [data("("), 1], 
        [ref("exp"), 1], 
        [data(","), 1], 
        [ref("exp"), 1], 
        [branch([
          [data(","), 1], 
          [ref("exp"), 1]
        ]), 3],
        [data(")"), 1]
      ]),
      branch([
        [data("["), 1], 
        [ref("exp"), 1], 
        [branch([
          [data(","), 1], 
          [ref("exp"), 1]
        ]), 3],
        [data("]"), 1]
      ]),
      branch([
        [data("["), 1], 
        [ref("exp"), 1], 
        [branch([
          [data(","), 1], 
          [ref("exp"), 1]
        ]), 0]
        [data(".."), 1],
        [ref("exp"), 1],
        [data("]"), 1]
      ]),
      branch([
        [data("["), 1], 
        [ref("exp"), 1],
        [data("|"), 1], 
        [ref("qual"), 1]
        [branch([
          [data(","), 1], 
          [ref("qual"), 1]
        ]), 3],
        [data("]"), 1]
      ]),
      branch([
        [data("("), 1], [ref("infixexp"), 1], [ref("qop"), 1], [data(")"), 1]
      ]),
      branch([
        [data("("), 1], [ref("qop"), 1], [ref("infixexp"), 1], [data(")"), 1]
      ]),
      branch([
        [ref("qcon"), 1], 
        [data("{"), 1],
        [branch([
          [ref("fbind"), 1], 
          [data(","), 1],
        ]), 3]
        [ref("fbind"), 0], 
        [data("}"), 1]
      ]),
    ];

    /** -------------------------
     * qual -> pat '<-' exp                                          (generator) 
     *       | 'let' decls                                   (local declaration) 
     *       | exp                                                       (guard) 
     * ------------------------- */
    this.rules.qual.childs = [
      branch([[ref("pat"), 1], [data("<-"), 1], [ref("exp"), 1]]),
      branch([[data("let"), 1], [ref("decls"), 1]]),
      branch([[ref("exp"), 1]])
    ];

    /** -------------------------
     * alts -> alt1 ';' … ';' altn                                       (n ≥ 1) 
     * ------------------------- */
    this.rules.alts.childs = [
      branch([
        [ref("alt"), 1],
        [branch([
          [data(";"), 1], 
          [ref("alt"), 1]
        ], 3), 3]
      ]),
    ];

    /** -------------------------
     * alt -> pat '->' exp ['where' decls]
     *      | pat gdpat ['where' decls]
     *      | (empty)                                        (empty alternative) 
     * ------------------------- */
    this.rules.alt.childs = [
      branch([
        [ref("pat"), 1], 
        [data("->"), 1], 
        [ref("exp"), 1],
        [branch([
          [data("where"), 1],
          [ref("ecls"), 1]
        ]), 0]
      ]),
      branch([
        [ref("pat"), 1], 
        [ref("gdpat"), 1]
        [branch([
          [data("where"), 1],
          [ref("ecls"), 1]
        ]), 0]
      ]),
      //branch([])
    ];

    /** -------------------------
     * gdpat -> guards '->' exp [gdpat]
     * ------------------------- */
    this.rules.gdpat.childs = [
      branch([
        [ref("guards"), 1], 
        [data("->"), 1], 
        [ref("exp"), 1], 
        [ref("gdpat"), 0]
      ])
    ];

    /** -------------------------
     * stmts -> stmt1 … stmtn exp [';']                                  (n ≥ 0) 
     * ------------------------- */
    this.rules.stmts.childs = [
      branch([[ref("stmt"), 3], [ref("exp"), 1], [data(";"), 0]]),
    ];

    /** -------------------------
     * stmt -> exp ';'
     *        | pat '<-' exp ;
     *        | 'let' decls ;
     *        | ';'                                            (empty statement)
     * ------------------------- */
    this.rules.stmt.childs = [
      branch([[ref("exp"), 1], [data(";"), 1]]),
      branch([
        [ref("pat"), 1], 
        [data("<-"), 1], 
        [ref("exp"), 1], 
        [data(";"), 1]
      ]),
      branch([[data("let"), 1], [ref("decls"), 1], [data(";"), 1]]),
      branch([[data(";"), 1]]),
    ];

    /** -------------------------
     * fbind -> qvar '=' exp
     * ------------------------- */
    this.rules.fbind.childs = [
      branch([[ref("qvar"), 1], [data("="), 1], [ref("exp"), 1]])
    ];

     /** -------------------------
     * pat -> lpat qconop pat                                (infix constructor) 
     *      | lpat 
     * ------------------------- */
    this.rules.pat.childs = [
      branch([[ref("lpat"), 1], [ref("qconop"), 1], [ref("pat"), 1]]),
      branch([[ref("lpat"), 1]])
    ];

    /** -------------------------
     * lpat -> apat
     *       | '-' (integer | float)                          (negative literal) 
     *       | gcon apat1 … apatk                      (arity gcon  =  k, k ≥ 1) 
     * ------------------------- */
    this.rules.lpat.childs = [
      branch([[ref("apat"), 1]]),
      branch([
        [data("-"), 1],
        [tokentype("integer"), 1]
      ]),
      branch([
        [data("-"), 1],
        [tokentype("Float"), 1]
      ]),
      branch(
        [[ref("gcon"), 1], 
        [ref("apat"), 2]
      ])
    ];

    /** -------------------------
     * apat -> var [@ apat]                                         (as pattern) 
     *       | gcon                                             (arity gcon = 0)
     *       | qcon '{' fpat1 ',' … ',' fpatk '}'       (labeled pattern, k ≥ 0) 
     *       | literal
     *       | '_'                                                    (wildcard)
     *       | '(' pat ')'                               (parenthesized pattern)
     *       | '(' pat1 ',' … ',' patk ')'                (tuple pattern, k ≥ 2)
     *       | '[' pat1 ',' … ',' patk ']'                 (list pattern, k ≥ 1)
     *       | '~' apat                                    (irrefutable pattern) 
     * ------------------------- */
    this.rules.apat.childs = [
      branch([
        [ref("var"), 1], 
        [branch([
          [data("@"), 1], 
          [ref("apat"), 1]
        ]), 0]
      ]),
      branch([[ref("gcon"), 1]]),
      branch([
        [ref("qcon"), 1], 
        [data("{"), 1],
        [branch([
          [ref("fpat"), 1], 
          [data(","), 1]
        ]), 3],
        [ref("fpat"), 1], 
        [data("}"), 1]
      ]),
      branch([[ref("literal"), 1]]),
      branch([[data("_"), 1]]),
      branch([
        [data("("), 1],
        [ref("pat"), 1], 
        [data(")"), 1]
      ]),
      branch([
        [data("("), 1],
        [branch([
          [ref("pat"), 1], 
          [data(","), 1]
        ]), 3],
        [ref("pat"), 1], 
        [data(")"), 1]
      ]),
      branch([
        [data("["), 1],
        [branch([
          [ref("pat"), 1], 
          [data(","), 1]
        ]), 3],
        [ref("pat"), 1], 
        [data("]"), 1]
      ]),
      branch([[data("~"), 1], [ref("apat"), 1]]),
    ];

    /** -------------------------
     * fpat -> qvar '=' pat
     * ------------------------- */
    this.rules.fpat.childs = [
      branch([[ref("qvar"), 1], [data("="), 1], [ref("pat"), 1]])
    ];

    /** -------------------------
     * gcon -> '()' 
     *       | '[]' 
     *       | '(,'{','}')' 
     *       | qcon           // FIXME : not sure this will be matched because
     *                        // always comparing to a single token, need to 
     *                        // verify how input like (,,,,,,) would be 
     *                        // tokenized 
     * ------------------------- */
    this.rules.gcon.childs = [
      branch([[data("()"), 1]]),
      branch([[data("[]"), 1]]),
      branch([
        [data("(,"), 1],
        [data(","), 3],
        [data(")"), 1]      
      ]),
      branch([[ref("qcon"), 1]]),
    ];

    /** -------------------------
     * var -> varid | '(' varsym ')'                                  (variable) 
     * ------------------------- */
    this.rules.var.childs = [
      branch([[tokentype("Qvarid"), 1]]),
      branch([[data("("), 1], [tokentype("Varsym"), 1], [data(")"), 1]])
    ];

    /** -------------------------
     * qvar -> qvarid | '(' qvarsym ')'                     (qualified variable) 
     * ------------------------- */
    this.rules.qvar.childs = [
      branch([[tokentype("Qvarid"), 1]]),
      branch([[data("("), 1], [tokentype("Qvarsym"), 1], [data(")"), 1]])
    ];

    /** -------------------------
     * con -> conid | '(' consym ')'                               (constructor) 
     * ------------------------- */
    this.rules.con.childs = [
      branch([[tokentype("Conid"), 1]]),
      branch([[data("("), 1], [tokentype("Consym"), 1], [data(")"), 1]])
    ];

    /** -------------------------
     * qcon -> qconid | '(' gconsym ')'                  (qualified constructor) 
     * ------------------------- */
    this.rules.qcon.childs = [
      branch([[tokentype("Qconid"), 1]]),
      branch([[data("("), 1], [ref("gconsym"), 1], [data(")"), 1]])
    ];

    /** -------------------------
     * varop -> varsym | '`' varid '`'                       (variable operator) 
     * ------------------------- */
    this.rules.varop.childs = [
      branch([[tokentype("Varsym"), 1]]),
      branch([[data("`"), 1], [tokentype("Varid"), 1], [data("`"), 1]])
    ];

    /** -------------------------
     * qvarop -> qvarsym | '`' qvarid '`'          (qualified variable operator) 
     * ------------------------- */
    this.rules.qvarop.childs = [
      branch([[tokentype("Qvarsym"), 1]]),
      branch([[data("`"), 1], [tokentype("Qvarid"), 1], [data("`"), 1]])
    ];

    /** -------------------------
     * conop -> consym | '`' conid '`'                    (constructor operator) 
     * ------------------------- */
    this.rules.conop.childs = [
      branch([[tokentype("Consym"), 1]]),
      branch([[data("`"), 1], [tokentype("Conid"), 1], [data("`"), 1]])
    ];

    /** -------------------------
     * qconop -> gconsym | '`' qconid '`'       (qualified constructor operator) 
     * ------------------------- */
    this.rules.qconop.childs = [
      branch([[ref("gconsym"), 1]]),
      branch([[data("`"), 1], [tokentype("Qconid"), 1], [data("`"), 1]])
    ];

    /** -------------------------
     * op -> varop | conop                                            (operator) 
     * ------------------------- */
    this.rules.op.childs = [
      branch([[ref("varop"), 1]]),
      branch([[ref("conop"), 1]])
    ];

    /** -------------------------
     * qop -> qvarop | qconop                               (qualified operator)
     * ------------------------- */
    this.rules.qop.childs = [
      branch([[ref("qvarop"), 1]]),
      branch([[ref("qconop"), 1]])
    ];

    /** -------------------------
     * gconsym -> : | qconsym                                
     * ------------------------- */
    this.rules.gconsym.childs = [
      branch([[data(":"), 1]]),
      branch([[tokentype("Qconsym"), 1]])
    ];

    /** ------------------------- added rule that is in lexical syntax
     * literal -> integer | float | char | string                                
     * ------------------------- */
    this.rules.literal.childs = [
      // TODO verify if capital letter or not
      branch([[tokentype("integer"), 1]]),
      branch([[tokentype("float"), 1]]),
      branch([[tokentype("char"), 1]]),
      branch([[tokentype("String"), 1]])
    ];
  }
}
