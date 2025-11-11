sum :: [Int] -> Int
sum [] = 0
sum (head, rest) = head + sum rest