const { parseHaskell } = require('./bundle.js');

const result = parseHaskell("let x = 1 in x");
console.log(result);