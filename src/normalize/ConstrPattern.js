import { Term } from "./Term.js";

//--                File containing Constr Pattern for normalizing          --//

// NOT YET USED
export class ConstrPattern extends Term {
  
  constructor(values){
    super("PATTERN");
    this.type = "Constr" ;
    this.values = values ;
  }
}