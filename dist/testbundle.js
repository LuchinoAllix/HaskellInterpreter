// index.js
async function main() {
  // Import dynamique qui retourne un objet avec 'default'
  const module = await import("./outputBundle.js");
  
  // La fonction est dans la propriété 'default'
  const parseHaskell = module.default;

  if (!parseHaskell) {
    throw new Error("La fonction parseHaskell n'a pas été trouvée dans le module.");
  }

  const result = parseHaskell("main = print 42");
  console.log(result);
}

main().catch(console.error);