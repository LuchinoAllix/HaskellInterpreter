import { Program } from './Program.js'
import { tokenize }from './Lexer.js'
import { parse } from './Parser.js'

import { readdir, readFile } from 'fs/promises';
import { extname, join } from 'path';

const test_folder = './tests';

/**
 * Main function to test Parser
 */
async function main(){
  const files = await readdir(test_folder);
  for (const file of files) {
    if (extname(file) === '.hs') {
      testFile(join(test_folder, file));
    }
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
    try {
      if(tokenize(program)){
        console.log("Successful tokenization :) ");
      } else { 
        console.log("Unsuccessful tokenization :( ");
        console.log("Input : " + program.input);
      }
      showTokens(program.tokens);

    } catch (error) {
      console.log("Error while tokenization :");
      console.log("Input : " + program.input);
      showTokens(program.tokens);
      console.error(error);
    }
  } catch (err) {
    console.error("Error while reading test file:", err);
  }
}

function showTokens(tokens){
  console.log("Tokens : " );
  for (let token of tokens){
    console.log("\t" + JSON.stringify(token));
  }
}

main()