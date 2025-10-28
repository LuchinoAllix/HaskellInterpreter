import { branch, data, rule } from "./src/Node"

export const rules = {
  exp : 
    rule([branch([[rules.infixexp, 1], // expression type signature
                  [data("::"), 1],
                  [data("context"), 0],
                  [data("=>"), 0],
                  [rules.type, 1]]), 
          branch([[rules.infixexp, 1]])]),

  infixexp :
    rule([branch([[rules.lexp, 1], // infix operator application
                  [rules.qop, 1],
                  [rules.infixexp, 1]]),
          branch([[data('-'), 1], // prefix negation
                  [rules.infixexp, 1]]),
          branch([[rules.lexp, 1]])]),
  lexp : 
    rule([branch([[data("\\"), 1], // lambda abstraction
                  [rules.apat, 2], 
                  [data("->"), 1],
                  [rules.exp, 1]]),
          branch([[data("let"), 1], // let expression
                  [rules.decl, 1],
                  [data("in"), 1],
                  [rules.exp, 1],
                  [rules.exp, 1]]),
          branch([[data("if"), 1], // conditional
                  [rules.exp, 1],
                  [data(";"), 0],
                  [data("then"), 1],
                  [rules.exp, 1],
                  [data(";"), 0],
                  [data("else"), 1],
                  [rules.exp, 1]]),
          branch([[data("case"), 1], // case expression
                  [rules.exp, 1],
                  [data("of"), 1],
                  [data("{"), 0],
                  [rules.alts, 1],
                  [data("}"), 0]]),
          branch([[data("do"), 1], // do expression
                  [data("{"), 0],
                  [rules.stmts, 1],
                  [data("}"), 0]]),
          branch([[rules.fexp, 1]])]),

  fexp : 
    rule([branch([[rules.fexp, 0],
                  [rules.aexp, 1]])])
}



// idée pour gérer les [a b] ou [a [b] [c]]
// par défaut si on regarde un un optionnel 
// on dit que si il est suivit d'un optionnel 
// alors il doivent être optionels ensemble 
// sinon on les sépare d'un data vide "obligatoire"
// devra être géré par la fonction principale