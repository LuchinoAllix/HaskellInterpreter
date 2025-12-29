import { readline } from 'readline/promises';
import { Env } from './eval/Env.js';
import { Program } from './objects/Program.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

let program;
let env = new Env();

rl.on('line', (input) => {
  switch (input){
    case "test" :
      //todo special actions commands like reset env...
    break ;

    case "help" :
      printHelp();
    break;

    default :
      run(input, env);


  }

  rl.prompt();
}).on('close', () => {
  console.log('Bye!');
  process.exit(0);
});

function printHelp(){

}

function run(input, env){
  program = new Program(input);

  try {
    tokenize(program);
  } catch (error) {
    console.log("Error while tokenizating :");
    console.log(error);
    return false;
  }

  try {
    parse(program);
  } catch (error) {
    console.log("Error while parsing :");
    console.log(error);
    return false;
  }

  try {
    normalize(program);
  } catch (error) {
    console.log("Error while tokenizating :");
    console.log(error);
    return false;
  }

  // todo eval


}