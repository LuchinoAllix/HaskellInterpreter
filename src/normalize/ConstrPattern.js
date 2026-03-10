import { Term } from "./Term.js";

export class ConstrPattern extends Term {
  
  constructor(values){
    super("PATTERN");
    this.type = "Constr" ;
    this.values = values ;
  }
}