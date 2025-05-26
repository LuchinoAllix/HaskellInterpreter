const fs = require('fs');
const peggy = require('peggy');

// Charger la grammaire à partir du fichier haskell.pegjs
const grammar = fs.readFileSync('haskell.pegjs', 'utf8');

// Générer le parser
const parser = peggy.generate(grammar);

// Fonction pour tester le parser
function testParser(input) {
  try {
    const ast = parser.parse(input);
    console.log('AST:', JSON.stringify(ast, null, 2));
  } catch (error) {
    //console.log(error);
    console.error('Erreur de parsing:', error.message);
  }
}

// Exemples de tests
testParser('1')
testParser('a');
testParser('--');


//testParser('\\x -> x + 1');
//testParser('if x > 0 then "positive" else "non-positive"');
//testParser('f x y');
