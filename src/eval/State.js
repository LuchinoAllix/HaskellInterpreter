import { Call } from "./Call.js";
import { AST } from "./AST.js";
import { makeGlobalRTE } from '../objects/RunTimeEnv.js';
import { allTestsInfo } from "../Main.js";


export const popVal = "popVal" ; // Term used to specify that the arg needed 
                                 // will be on the valStack

export class State {

  constructor(){
    this.msg = null ;          // message a afficher à cette étape
    this.rte = makeGlobalRTE();// global rte (env, ctx, ...)
    this.main = null ;         // main du programme
    this.mainType = null ;     // type du main du programme
    this.callStack = [];       // call stack pour fonction
    this.valStack = [];        // resultats de fonction
    this.nb_steps = 0 ;        // number of steps taken (function calls)
    this.sizeOfTest = null;    // number of tokens per test (needed for review)
    this.avgCtx = 0;           // avg of info in ctx (needed fo review)
    this.error = null ;        // the error when fail

    this.ast = new AST();      // the ast pos (codeboot)
    this.result = undefined;   // the output
    this.eval = false;         // to mark when type inference finished
    this.reset = false;

    this.showInRepl = undefined ; // to show in repl when used with codeboot 
                                  // (function given by cb)
  }

  // todo : update the ast with pos

  call(){
    if (this.eval && this.result !== undefined){
      if (this.showInRepl !== undefined){ // so it doesn't crash when not in cb
        this.showInRepl(this.result);
      }
      this.result = undefined;
    }

    if (this.eval && !this.reset){
      let avg = Math.round(this.avgCtx / this.nb_steps)
      console.log("✅ Type checking finished in", this.nb_steps, 
        "steps, avg = ", avg, 
        " size ", this.sizeOfTest);
      //allTestsInfo.push([this.nb_steps, avg, this.sizeOfTest])
      this.reset = true;
    }

    if (this.isCallStackEmpty()){
      throw new Error("Cannot call, callStack empty");
    }
    
    const call = this.callStack.pop();
    
    for (let i = 0; i < call.args.length; i ++){
      if (call.args[i] === popVal){
        call.args[i] = this.popVal();
      }
    }

    call.args.push(call.skip); // to transfer the information to the callee
                               // that it is skipped to not show a msg

    const returned = call.func(...call.args);

    if (returned !== undefined){
      this.pushVal(returned);
    }

    // To skip eval
    if (this.eval){
      if (!this.isCallStackEmpty()){
         this.callStack[this.callStack.length-1].skip = true ;
      }
    }

    if (!call.skip){ // update only if it's a step that has to be shown
      this.nb_steps += 1 ;
      this.avgCtx += this.rte.globalLocalCtx.length;
      this.ast.fromExpsToAst(this.msg, call.args, call.func);
      //console.log(this.nb_steps, " " + this.msg);
      //console.log(this.rte.globalLocalCtx);
    }

    if (!this.isCallStackEmpty() && 
         this.callStack[this.callStack.length-1].skip) {
      const saveMsg = this.msg;
      this.call();
      this.msg = saveMsg;
    }

  }

  makeMsg(skip, msg){
    if (skip === undefined || !skip){
      this.msg = msg ;
    }
  }

  isCallStackEmpty(){
    return this.callStack.length === 0 ;
  }

  popCall(){
    if (this.isCallStackEmpty()){
      throw new Error("Tried to popCall when callStack is empty");
    }
    return this.callStack.pop();
  }

  popVal(){
    if (this.valStack.length === 0){
      throw new Error("Tried to popRes when valStack is empty");
    }
    return this.valStack.pop();
  }

  pushVal(val){
    this.valStack.push(val);
  }

  pushCall(func, args, skip, rep){
    this.callStack.push(new Call(func, args, skip, rep));
  }

  hasCont(){
    return this.callStack.length > 0 ;
  }

  setError(msg){
    this.error = msg ;
    this.callStack = [];
    this.valStack = [];
  }
}