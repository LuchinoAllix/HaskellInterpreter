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
    console.log('AST:', JSON.stringify(ast));
  } catch (error) {
    console.log(error);
    console.error('Erreur de parsing:', error.message);
  }
}

function lireFichierTexte(cheminFichier) {
    return new Promise((resolve, reject) => {
        fs.readFile(cheminFichier, 'utf8', (erreur, contenu) => {
            if (erreur) {
                reject(erreur);
            } else {
                resolve(contenu);
            }
        });
    });
}

function testParserFile(path){
  testParser(lireFichierTexte(path))
}

// Exemples de tests
testParser('1')
testParser('[1,2,3,4,5]\r');
testParser('--\r');
//testParserFile("C:\\Users\\luchi\\Documents\\Uni\\Udem\\Maîtrise\\Mémoire\\HaskellParser\\test_peggy\\test.hs")

testParser('let a = \\x -> x + 1 in a\r');
//testParser('if x > 0 then "positive" else "non-positive"');
//testParser('f x y');
