import Program from './program.js'
import tokenize from './Lexer.js'
import parse from './Parser.js'

function main(){
    const program = new Program("]]]]");
    try {
        if(tokenize(program)){
            console.log("Successful tokenization :) ");
            console.log("Tokens : " + program.tokens);
        } else {
            throw Error("tokenize() returned false");
        }
    } catch (error) {
        console.log("Unsuccessful tokenization :( ");
        console.log("Input : " + program.input);
        console.log("Tokens : " + program.tokens);
        console.error(error);
    }
}

main()