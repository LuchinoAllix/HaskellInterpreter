const path = require('path');

module.exports = {
  entry: './src/inputBundle.js',
  output: {
    filename: 'outputBundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'HaskellParser',
      type: 'var', // Changez de 'umd' à 'var' pour une variable globale simple
      export: 'default'
    },
    // Pas besoin de globalObject ici car 'var' crée une variable globale directement
  },
  mode: 'production'
};