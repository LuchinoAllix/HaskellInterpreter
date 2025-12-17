--b = [1,2,3,4]
--main = print (
--          case b of 
--                  (1: 2: []) -> []
--                  (a : b : c) -> c
--              )

a = (2, 1)
main = print (
          case (a , 1 : [] ) of 
                  (c, b) -> b  
              )