// Parser pour Haskell en Javascript

// Constantes de la grammaire
const HS_special = ["(",")",",",";","[","]","`","{","}"];
const HS_return = "\r";
const HS_linefeed = "\n";
const HS_vertab = "\v";
const HS_formfeed = "\f";
const HS_space = " ";
const HS_tab = "\t";

/**
 * Représente un programme Haskell.
 * Ce programme est construit grâce à un input.
 * Il peut être transformé en tokens grâce à tokenize()
 * Il peut être transformé en AST avec parse()
 */
class Program {
    
    constructor(input){
        this.input = input; // Chaîne de caractère donnée en entrée
        this.index = 0; // Position du curseur sur l'input
        this.tokens = []; // Chaîne de tokens correspondant à l'input
        this.AST = []; // AST correspondant à l'input
        this.isLexed = false; // indique si l'input a déjà été tokenisé ou non
        this.isParsed = false; // indique si l'input a déjà été parse ou non
    }

    /**
     * Permet de transformer l'input en liste de tokens
     * @returns True if Success
     */
    tokenize(){
        isProgram();
        this.isLexed = true;
        return true;
    }

    /**
     * Permet de transformer la liste de tokens en AST
     * @returns True if Success
     */
    parse(){
        if(!this.isLexed){
            this.tokenize();
        }
        // #TODO
        return true;
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
        // #TODO
    }

    static isQvarsym(){
        // #TODO
    }

    static isQconsym(){
        // #TODO
    }

    static isReservedop(){
        // #TODO
    }

    static isReservedid(){
        // #TODO
    }
}





function main(){
    const input1 = "?";
    const program1 = new Program(input1);
    try {
        program1.tokenize();
    } catch (error) {
        console.log("Unsuccessful tokenization :( ");
        console.error(error);
    }
    console.log("Successful tokenization :) ");
    console.log(program1.tokens);
}