--file to test random haskell scripts

fact 0 = 1 
fact n = n * fact (n - 1)

factt 0 = 1 
factt n = n * factt n - 1

main = do 
    print (fact 5)
    print (factt 5) -- will never finish