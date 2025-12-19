--b = [1,2,3,4]
--main = print (
--          case b of 
--                  (1: 2: []) -> []
--                  (a : b : c) -> c
--              )

a = [1, 2, 4]
main = print (
          case a of 
                  [1, 3, 2] -> [1]
                  [a, b, 3] -> [a + b]
                  a -> a
              )