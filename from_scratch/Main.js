import { Program } from './Program.js'
import { tokenize }from './Lexer.js'
import { parse } from './Parser.js'
import { Token } from "./Token.js";


import { readdir, readFile } from 'fs/promises';
import { extname, join } from 'path';

const test_folder = './tests';

/**
 * # FIXME : Change order of evaluation to make sure it happens sequentially
 * Main function to test Parser
 */
async function main(){
  switch (process.argv.length){

    // test all files
    case 2 :
      const files = await readdir(test_folder);
      for (const file of files) {
        if (extname(file) === '.hs') {
          testFile(join(test_folder, file));
        }
      }
      break;

    // test a single file
    case 3 :
      testFile(process.argv[2]);
      break;

    default :
      console.log("Wrong number of arguments, usage :" + 
                  "\n\t<Node Main.js> \t\t\tto test all files in /tests, or " + 
                  "\n\t<Node Main.js pathToFile> \tto test a specific file");
  }
}

/**
 * Function to test a specific file
 * @param {String} file_path 
 */
async function testFile(file_path) {
  try {
    const content = await readFile(file_path, 'utf8');
    const program = new Program(content);
    console.log("\nTest file : " + file_path);
    console.log("Input : " + program.input);
    try {
      if (tokenize(program)){
        console.log("Successful tokenization :) ");
      } else {
        console.log("Unsuccessful tokenization :( ");
      }
      showTokens(program.tokens);

    } catch (error) {
      console.log("Error while tokenization :");
      showTokens(program.tokens);
      console.error(error);
    }
  } catch (err) {
    console.error("Error while reading test file:", err);
  }
}

/**
 * Prints on the console all the tokens in a single line
 * @param {Token} tokens 
 */
function showTokens(tokens){
  console.log("Tokens : " );
  for (let token of tokens){
    console.log("\t" + JSON.stringify(token));
  }
}

main()