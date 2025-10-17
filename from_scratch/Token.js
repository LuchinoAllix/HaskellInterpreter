export class Token {
  constructor(type, value){
    this.type = "indentation " + type;
    this.value = value;
    this.line = -1;
    this.column = -1;
  }
}