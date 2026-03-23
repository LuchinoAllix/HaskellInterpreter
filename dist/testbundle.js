
const module = await import("./outputBundle.cjs");

console.log(module.HaskellParser("main = print 42")); 
