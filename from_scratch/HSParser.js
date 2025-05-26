
const HS_special = ["(",")",",",";","[","]","`","{","}"];
const HS_return = "\r";
const HS_linefeed = "\n";
const HS_vertab = "\v";
const HS_formfeed = "\f";
const HS_space = " ";
const HS_tab = "\t";


class Program {
    
    constructor(input){
        this.input = input;
        this.index = 0;
        this.tokens = []
    }

    tokenize(){
        return isProgram()
    }

    static isProgram(){
        while(isLexeme() || isWhitespace()){} 
        if (this.index > this.input.length){
            return false;
        }
        return true;
    }

    static isLexeme(){
        return isQvarid() 
            || isQconid() 
            || isQvarsym() 
            || isQconsym() 
            || isLiteral() 
            || isSpecial() 
            || isReservedop() 
            || isReservedid();
    }

    static isLiteral(){
        return isInteger()
            || isFloat()
            || isChar()
            || isString();
    }

    static isSpecial(){
        if (HS_special.includes(this.input[this.index])){
            this.index++;
            return true;
        }
        return false;
    }

    static isQconid(){

    }

    static isQvarsym(){

    }

    static isQconsym(){

    }

    static isReservedop(){

    }

    static isReservedid(){

    }
}

