import { Program } from './Program.js'
import { tokenize }from './Lexer.js'
import { parse } from './Parser.js'

function main(){
    const program = new Program("(let x = 3 in x + 3)");
    try {
        if(tokenize(program)){
            console.log("Successful tokenization :) ");
            console.log("Tokens : " );
            for (let token of program.tokens){
                console.log("\t" + JSON.stringify(token));
            }
        } else {
            throw Error("tokenize() returned false");
        }
    } catch (error) {
        console.log("Unsuccessful tokenization :( ");
        console.log("Input : " + program.input);
        console.log("Tokens : " );
        for (let token of program.tokens){
            console.log("\t" + JSON.stringify(token));
        }
        console.error(error);
    }
}

main()