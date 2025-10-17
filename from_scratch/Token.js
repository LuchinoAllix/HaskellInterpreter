export class Token {
  constructor(type, value, line, column){
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  static new(type, value){
    return new Token("indentation " + type, value,  -1, -1);
  }
}