--file to test random haskell scripts


--main = do 
--    x <- getLine
--    putStrLn x

--main = print (1) >> print (2)

--main = do 
--    x <- print 3
--    return x

main = do 
    print 3 >>= \x -> return x
