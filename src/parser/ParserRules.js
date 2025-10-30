import { branch, data, rule, ref} from "./Elem.js"


export class Rules {

  constructor(){
        this.rules = {};
        this.createRules();
        this.initRules();
  }
  
  createRules(){
    this.rules = {
            exp : rule("exp"),
            infixexp : rule("infixexp"),
            lexp : rule("lexp"),
      stmts : rule("stmts"),            
      fexp : rule("fexp"),
      qop : rule("qop"),
      apat : rule("apat"),
      decl : rule("decl"),
      aexp : rule("aexp"),
      type : rule("type")
    }
  }

  initRules(){
    this.rules.exp.childs = (
        [branch([[ref("infixexp"), 1],                  // expression type signature
                [data("::"), 1],
                [data("context"), 0],
                [data("=>"), 0],
                //[ref("type"), 1]
        ]), 
         branch([[ref("infixexp"), 1]])]);

    this.rules.infixexp.childs = (
        [branch([[ref("lexp"), 1],                      // infix operator application
                [ref("qop"), 1],
                [ref("infixexp"), 1]]),
        branch([[data('-'), 1],                       // prefix negation
                [ref("infixexp"), 1]]),
        branch([[ref("lexp"), 1]])]
        );

        this.rules.lexp.childs = (
        [branch([[data("\\"), 1],                      // lambda abstraction
                [ref("apat"), 2], 
                [data("->"), 1],
                [ref("exp"), 1]]),
        branch([[data("let"), 1],                     // let expression
                [ref("decl"), 1],
                [data("in"), 1],
                [ref("exp"), 1],
                [ref("exp"), 1]]),
        branch([[data("if"), 1],                      // conditional
                [ref("exp"), 1],
                [data(";"), 0],
                [data("then"), 1],
                [ref("exp"), 1],
                [data(";"), 0],
                [data("else"), 1],
                [ref("exp"), 1]]),
        branch([[data("case"), 1],                    // case expression
                [ref("exp"), 1],
                [data("of"), 1],
                [data("{"), 0],
                [ref("alts"), 1],
                [data("}"), 0]]),
        branch([[data("do"), 1],                      // do expression
                [data("{"), 0],
                [ref("stmts"), 1],
                [data("}"), 0]]),
        branch([[ref("fexp"), 1]])
        ]
        );

        this.rules.fexp.childs =(
        [branch([[ref("fexp"), 0],
        [ref("aexp"), 1]])]
        );

        this.rules.stmts.childs = (                        // tmp for testing
        [branch([[data("a"), 0]])]
        );

        this.rules.aexp.childs=(
        [branch([ref("aexp"), 4, ref("qcon")])]
        )
  }

}

// idée pour gérer les [a b] ou [a [b] [c]]
// par défaut si on regarde un un optionnel 
// on dit que si il est suivit d'un optionnel 
// alors il doivent être optionels ensemble 
// sinon on les sépare d'un data vide "obligatoire"
// devra être géré par la fonction principale