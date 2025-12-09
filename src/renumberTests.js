import {readFileSync, writeFileSync} from 'fs';

// AI generated script to renumber the tests 

// ---- Config ----
const inputFile = "Tests.hs";        // fichier source
const outputFile = "Tests.hs";       // fichier corrigé
// -----------------

// Charge le contenu
let content = readFileSync(inputFile, "utf8");

// Sépare en lignes
let lines = content.split(/\r?\n/);

let testIndex = 0;
let outputLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // On cherche une ligne du type :
    // -- Test X          : description
    let match = line.match(/^--\s*Test\s+\d+\s*:(.*)$/);

    if (match) {
        // réécrit la ligne avec le bon numéro
        const description = match[1];
        line = `-- Test ${testIndex}          :${description}`;
        testIndex++;
    }

    outputLines.push(line);
}

// Écrit le résultat
writeFileSync(outputFile, outputLines.join("\n"), "utf8");

console.log("Tests renumérotés avec succès !");
