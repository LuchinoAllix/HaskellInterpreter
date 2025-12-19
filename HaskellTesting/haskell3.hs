--b = [1,2,3,4]
--main = print (
--          case b of 
--                  (1: 2: []) -> []
--                  (a : b : c) -> c
--              )

-- a = (1 : [2])
main = do 
          print ((1 : [2]))
          print ((1 : []))
          print (((1:[2]) : [[2]]))