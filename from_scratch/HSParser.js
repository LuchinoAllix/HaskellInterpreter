// Parser pour Haskell en Javascript

// Constantes de la grammaire
const HS_special = ["(",")",",",";","[","]","`","{","}"];
const HS_return = "\r";
const HS_linefeed = "\n";
const HS_vertab = "\v";
const HS_formfeed = "\f";
const HS_space = " ";
const HS_tab = "\t";
const HS_uniWhite = ["\u0085","\u00A0","\u1680","\u180E","\u2000-","\u200A","\u2028","\u2029","\u202F","\u205F","\u3000"] // TODO: Vérifier

var input = ""
var index = 0
var tokens = []
var AST = []

/**
 * Permet de transformer l'input en liste de tokens
 * @returns True if Success
 */
function tokenize(){
    getProgram();
    return true;
}

/**
 * Permet de transformer la liste de tokens en AST
 * @returns True if Success
 */
function parse(){
    if(!this.isLexed){
        this.tokenize();
    }
    // #TODO
    return true;
}

/**
 * Fait un programme basé sur l'input
 * @returns true s'il a réussi à faire un programme basé sur l'input
 */
function getProgram(){
    while(getLexeme() || getWhitespace()){} 
    if (index == input.length){
        return true;
    } else if (index < input.length){
        throw Error("Not all input was parsed");
    }
    throw Error("Index > input.length");
}

function getLexeme(){
    return getQvarid()
        || getQconid()
        || getQvarsym()
        || getQconsym()
        || getLiteral()
        || getSpecial()
        || getReservedop()
        || getReservedid();
}

function getLiteral(){
    return getInteger()
        || getFloat()
        || getChar()
        || getString();
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