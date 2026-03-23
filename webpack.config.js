const path = require('path');

module.exports = {
  entry: './src/inputBundle.js',
  output: {
    filename: 'outputBundle.cjs',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'HaskellParser',
      type: 'commonjs2',
      export: 'default'
    },
    // Ajoutez cette ligne pour forcer l'usage de 'this' (window dans le navigateur)
    // au lieu de 'self' qui n'existe pas en Node.js
    globalObject: 'this' 
  },
  mode: 'production'
};