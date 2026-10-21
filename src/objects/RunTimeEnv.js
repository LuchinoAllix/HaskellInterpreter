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

    // to show context and env in codeboot
    this.globalLocalCtx = [];
    this.globalLocalCtxKeys = [];
    this.globalLocalEnv = [];
    this.globalLocalEnvKeys = [];
  }

  copy(){
    let rte = new RunTimeEnv();
    rte.env = this.env;
    rte.ctx = this.ctx;
    rte.constrTable = this.constrTable;
    rte.optionAppTable = this.optionAppTable;
    rte.globalLocalCtx = this.globalLocalCtx;
    rte.globalLocalCtxKeys = this.globalLocalCtxKeys;
    rte.globalLocalEnv = this.globalLocalEnv;
    rte.globalLocalEnvKeys = this.globalLocalEnvKeys;
    return rte;
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