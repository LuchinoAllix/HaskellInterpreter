-- Ceci est un fichier hasell utiliser pour vérifier si le parseur fonctionne correctement

{-
Mon commentaire multiligne
-}

sum :: [Int] -> Int
sum [] = 0
sum (x:xs) = x + (sum xs)