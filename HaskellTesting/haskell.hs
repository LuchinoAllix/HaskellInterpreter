--file to test random haskell scripts

fact 0 = 1 
fact n = n * fact (n - 1)

factt 0 = 1 
factt n = n * factt n - 1

suml :: [Int] -> Int
suml [] = 0
suml (head: rest) = head + suml rest

main = do 
    fact 5
    -- print (fact 5)
    -- print (factt 5) -- would never finish
    -- print (suml [1,2,3])