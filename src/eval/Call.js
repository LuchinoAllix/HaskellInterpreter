export class Call {

  constructor(func, args, skip = false){
    this.func = func ;
    this.args = args ;
    this.skip = skip ;
  }
}