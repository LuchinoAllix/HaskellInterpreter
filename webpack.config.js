const path = require('path');

module.exports = {
  entry: './src/inputBundle.js',
  output: {
    filename: 'outputBundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'HaskellParser', // Le nom de la variable globale
      type: 'umd',           // Supporte CommonJS, AMD et global
      export: 'default'      // Exporte l'export par défaut
    },
    // Si vous visez uniquement le navigateur (ES5), vous pouvez aussi ajouter:
    // globalObject: 'this' 
  },
  mode: 'production'
};