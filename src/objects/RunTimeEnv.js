import { Env } from "../eval/Env.js";
import { Context } from "../typeCheck/Context.js";
import { TypeTable } from "../typeCheck/TypeTable.js";

//--                 File containing todo             --//

/**
 * todo
 */
export class RunTimeEnv {

  /**
   * todo
   */
  constructor(){
    this.env = new Env();
    this.ctx = new Context();
    this.constrTable = new TypeTable();
    this.optionAppTable = new TypeTable();
  }
}

/**
 * todo
 * @returns {RunTimeEnv}
 */
export function makeGlobalRTE(){
  let rte = new RunTimeEnv();
  rte.env.initGlobal();
  rte.ctx.initGlobal();
  rte.constrTable.initConstr();
  rte.optionAppTable.initOption();
  return rte;
}