const path = require('path');

module.exports = {
  entry: './src/parserBundle.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'HaskellParser', // Nom de la variable globale si utilisé en script
      type: 'umd', // Format universel (compatible require, import, et script global)
      export: 'default', // Exporte par défaut
    },
    globalObject: 'this', // Pour la compatibilité Node.js et navigateur
  },
  mode: 'production',
};
