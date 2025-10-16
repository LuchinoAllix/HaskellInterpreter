export class Token {
  constructor(type, value, line, column){
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  constructor(type, value){
    this.type = "indentation " + type;
    this.value = value;
    line = -1;
    column = -1;
  }
}