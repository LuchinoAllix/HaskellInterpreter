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
        this.isProgram();
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

    isProgram(){
        while(this.isLexeme() || this.isWhitespace()){} 
        if (this.index == this.input.length){
            return true;
        } else if (this.index < this.input.length){
            throw Error("Not all input was parsed");
        }
        throw Error("Index > input.length");
    }

    isLexeme(){
        return this.isQvarid()
            || this.isQconid()
            || this.isQvarsym()
            || this.isQconsym()
            || this.isLiteral()
            || this.isSpecial()
            || this.isReservedop()
            || this.isReservedid();
    }

    isLiteral(){
        return this.isInteger()
            || this.isFloat()
            || this.isChar()
            || this.isString();
    }

    isSpecial(){
        if (HS_special.includes(this.input[this.index])){
            // TODO : make tokens
            this.tokens.push(this.input[this.index]);
            this.index++;
            return true;
        }
        return false;
    }

    isQvarid(){
        // #TODO
        return false;
    }

    isQconid(){
        // #TODO
        return false;
    }

    isQvarsym(){
        // #TODO
        return false;
    }

    isQconsym(){
        // #TODO
        return false;
    }

    isReservedop(){
        // #TODO
        return false;
    }

    isReservedid(){
        // #TODO
        return false;
    }

    isInteger(){
        // #TODO
        return false;
    }

    isFloat(){
        // #TODO
        return false;
    }

    isChar(){
        // #TODO
        return false;
    }

    isString(){
        // #TODO
        return false;
    }

    isWhitespace(){
        // #TODO
        return false;
    }
}

function main(){
    const input1 = "]]]]";
    const program1 = new Program(input1);
    try {
        if(program1.tokenize()){
            console.log("Successful tokenization :) ");
            console.log("Tokens : " + program1.tokens);
        } else {
            throw Error("tokenize() returned false");
        }
    } catch (error) {
        console.log("Unsuccessful tokenization :( ");
        console.log("Input : " + input1);
        console.log("Tokens : " + program1.tokens);
        console.error(error);
    }
}

main()