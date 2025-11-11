reverse [] = []
reverse (head, rest) = reverse rest ++ head 