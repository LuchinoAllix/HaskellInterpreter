const path = require('path');

module.exports = {
  entry: './src/parserBundle.js', // Point d'entrée de votre application
  output: {
    filename: 'bundle.js', // Nom du fichier de sortie
    path: path.resolve(__dirname, 'dist'), // Dossier de sortie
  },
  mode: 'production', // Mode production pour optimiser le code
};