--# Tests for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected result : ?'  ? will be what the output will be compared to, 
--#                        must be on one line. for results with multiple
--#                        answers (like in a do stmt) the expected results need
--#                        to be seperated by \n.
--#                        Errors are not yet managed. 

--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 0          : integer
-- Expected result : 42

--/
a = 42
main = print a
--/

--------------------------------------------------------------------------------
-- Test 1          : string
-- Expected result : [H,e,l,l,o, ,W,o,r,l,d,!]

--/
b = "Hello World!"
main = print b
--/

--------------------------------------------------------------------------------
-- Test 2          : boolean
-- Expected result : false

--/
c = False
main = print c
--/

--------------------------------------------------------------------------------
-- Test 3          : addition
-- Expected result : 3

--/
main = print (1 + 2)
--/

--------------------------------------------------------------------------------
-- Test 4          : substraction
-- Expected result : -1

--/
main = print (1 - 2)
--/

--------------------------------------------------------------------------------
-- Test 5          : multiplication
-- Expected result : 42

--/
main = print (21 * 2)
--/

--------------------------------------------------------------------------------
-- Test 6          : division
-- Expected result : 21

--/
main = print (42 / 2)
--/

--------------------------------------------------------------------------------
-- Test 7          : multiple addition
-- Expected result : 5

--/
main = print (1 + 1 + 1 + 1 + 1)
--/

--------------------------------------------------------------------------------
-- Test 8          : priority of operations
-- Expected result : 55

--/
main = print (5 + 5 * 10)
--/

--------------------------------------------------------------------------------
-- Test 9          : priority of operations
-- Expected result : 35

--/
main = print (5 * 5 + 10)
--/

--------------------------------------------------------------------------------
-- Test 10         : parenthesis operations
-- Expected result : 100

--/
main = print ((5 + 5) * 10)
--/

--------------------------------------------------------------------------------
-- Test 11          : complex operations
-- Expected result  : 25

--/
main = print (5 + 3 * 8 - 12 / 3)
--/

--------------------------------------------------------------------------------
-- Test 12         : if statement
-- Expected result : [n,o,t, ,z,e,r,o]

--/
a = 1
main = print (if a == 0 then "zero" else "not zero")
--/

--------------------------------------------------------------------------------
-- Test 13         : multiple ifs
-- Expected result : [i,n,n,e,r, ,f,a,i,l]

--/
main = print (if (True) 
              then if (False) 
                   then "sucess" 
                   else "inner fail" 
              else "outer fail")
--/

--------------------------------------------------------------------------------
-- Test 14         : let
-- Expected result : 1

--/
main = let x = 1 in print(x)
--/

--------------------------------------------------------------------------------
-- Test 15         : let with multiple vars
-- Expected result : 3

--/
main = let x = 1 ; y = 2 in print(x + y)
--/

--------------------------------------------------------------------------------
-- Test 16         : let in a var not in main
-- Expected result : 1

--/
letx = let x = 1 in print(x)
main = letx
--/

--------------------------------------------------------------------------------
-- Test 17         : let with over-writing a var
-- Expected result : 2

--/
main = print (let x = 1 in let x = 2 in x)
--/

--------------------------------------------------------------------------------
-- Test 18         : let with overriding a var not in main
-- Expected result : 2

--/
lets = let x = 1 in let x = 2 in x
main = print (lets)
--/

--------------------------------------------------------------------------------
-- Test 19         : let with overriding a var not in main
-- Expected result : 3

--/
lets = let x = 1 in (let x = 2 in x ) + x
main = print (lets)
--/

--------------------------------------------------------------------------------
-- Test 20         : let with a lambda
-- Expected result : 2

--/
main = print (let x = 1 ; y = \z -> z + 1 in y x)
--/

--------------------------------------------------------------------------------
-- Test 21         : identity function
-- Expected result : 5

--/
id x = x
main = print id 5 
--/

--------------------------------------------------------------------------------
-- Test 22         : function declaration
-- Expected result : 3

--/
add x y = x + y
main = print (add 1 2)
--/

--------------------------------------------------------------------------------
-- Test 23         : function declaration
-- Expected result : 6

--/
mul a b = a * b
main = print (mul 2 3)
--/

--------------------------------------------------------------------------------
-- Test 24         : recursive function declaration
-- Expected result : 120

--/
fact 0 = 1 
fact n = n * fact (n - 1)
main = print (fact 5)
--/

--------------------------------------------------------------------------------
-- Test 25         : recursive function declaration
-- Expected result : 5

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib (a - 1)) + (fib (a - 2)) 
main = print (fib 5)
--/

--------------------------------------------------------------------------------
-- Test 26         : recursive function declaration on a list
-- Expected result : [3,2,1]

--/
reverse [] = [] 
reverse (head : rest) = (reverse rest) ++ [head]
main = do print (reverse [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 27         : recursive function with type annotation
-- Expected result : 3

--/
sum :: [Int] -> Int
sum [] = 0
sum (head: rest) = head + sum rest
main = print (sum [1,2])
--/

--------------------------------------------------------------------------------
-- Test 28         : case of in func
-- Expected result : [b,l,a,c,k]

--/
cardColour :: String -> String
cardColour suit =
  case suit of
    "hearts" -> "red"
    "diamonds" -> "red"
    "spades" -> "black"
    "clubs" -> "black"
    _ -> "I am not familiar with this card suit."

main = print (cardColour "clubs")
--/

--------------------------------------------------------------------------------
-- Test 29         : lambda
-- Expected result : 2

--/
main = print ((\x -> x + 1) 1 )
--/

--------------------------------------------------------------------------------
-- Test 30         : lambda with multiple arguments
-- Expected result : 5

--/
main = print ((\x y -> x + y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 31         : embeded lambda
-- Expected result : 11

--/
main = print ((\x y -> x + (\a -> a * a) y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 32         : type annotation of list of list
-- Expected result : 1

--/
func :: [[Int]] -> Int
func [] = 0
func [[]] = 0
func [(a: b)] = a
main = print (func [[1]])
--/

--------------------------------------------------------------------------------
-- Test 33         : lambda in a var
-- Expected result : 2

--/
a = \x -> x + 1
main = do print (a 1)
--/

-------------------------------------------------------------------------------
-- Test 34         : logical operators
-- Expected result : [n,o]

--/
x = 1
y = 2
main =  if (x==0) && (y==0) || (x + y) == 1 then print ("yes") else print ("no")
--/

--------------------------------------------------------------------------------
-- Test 35         : annotated variable declaration
-- Expected result : 3

--/
x :: Int
x = 5
main = print ((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 36         : let inside an anonymous function
-- Expected result : 3

--/
main = print((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 37         : function with 3 arguments
-- Expected result : 1

--/
f x y z = 1 
main = print ( f 1 2 3)
--/

--------------------------------------------------------------------------------
-- Test 38         : function declaration with main
-- Expected result : 5

--/
f :: Int -> Int
f x = x
a = 5

main = do print (f a)
--/

--------------------------------------------------------------------------------
-- Test 39         : currying
-- Expected result : 3

--/
a = (+ 1)
main = do print (a 2)
--/

--------------------------------------------------------------------------------
-- Test 40         : currying
-- Expected result : 3

--/
main = print ((+ 1) 2)
--/

--------------------------------------------------------------------------------
-- Test 41         : currying
-- Expected result : 6

--/
a = \x -> \y -> \z -> x + y + z
main = do print ((a 1 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 42         : currying
-- Expected result : 6

--/
a = \x -> \y -> \z -> x + y + z
main = do print (((a 1) 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 43         : multi-branch main
-- Expected result : 3\n4\n5
-- TODO manage multiline results

--/
a = (+ 1)

main = do 
          print (a 2)
          print (a 3)
          print (a 4)
--/

--------------------------------------------------------------------------------
-- Test 44         : currying
-- Expected result : 6

--/
main = do print (((\x -> \y -> \z -> x + y + z) 1 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 45         : currying
-- Expected result : 4

--/
f a b = ((+ b) a)
main = do print ((f 1) 3)
--/


--------------------------------------------------------------------------------
-- Test 46         : currying et pattern matching
-- Expected result : 3 

--/
func a b = a + b
foo = func 1
main = do 
          print (foo 2) 
--/

--------------------------------------------------------------------------------
-- Test 47         : paire
-- Expected result : (1,2)

--/
main = print (1,2) 
--/

--------------------------------------------------------------------------------
-- Test 48         : paire
-- Expected result : (1,2,3)

--/
main = print (1,2,3) 
--/

--------------------------------------------------------------------------------
-- Test 49         : paire
-- Expected result : (1,(2,3))

--/
main = print (1,(2,3))
--/

--------------------------------------------------------------------------------
-- Test 50         : fst primitive
-- Expected result : 1

--/
main = print ( fst (1, 2) )
--/

--------------------------------------------------------------------------------
-- Test 51         : embeded pairs
-- Expected result : (1,(2,3))

--/
main = print ((1, (2,3))) 
--/

--------------------------------------------------------------------------------
-- Test 52         : pattern matching pair
-- Expected result : 3

--/
main = print ((\(x,y) -> x + y) (1,2))
--/

--------------------------------------------------------------------------------
-- Test 53         : list
-- Expected result : [1,2]

--/
main = print [1,2] 
--/

--------------------------------------------------------------------------------
-- Test 54         : longer list
-- Expected result : [1,2,3]

--/
main = print [1,2,3]
--/
--------------------------------------------------------------------------------
-- Test 55         : embeded list
-- Expected result : [[1],[2]]

--/
main = print [[1],[2]] 
--/

--------------------------------------------------------------------------------
-- Test 56         : more embeded list
-- Expected result : [[1,2],[1,2,3]]

--/
main = print [[1,2],[1,2,3]]
--/

--------------------------------------------------------------------------------
-- Test 57         : empty list
-- Expected result : []

--/
main = print []  
--/

--------------------------------------------------------------------------------
-- Test 58         : list with one element
-- Expected result : [1]

--/
main = print [1]  
--/

--------------------------------------------------------------------------------
-- Test 59         : case of in main
-- Expected result : [o,n,e]

--/
a = 1
main = print (
          case a of 
                  0 -> "zero"
                  1 -> "one"
                  _ -> "number higher than 1" 
              )
--/
--------------------------------------------------------------------------------
-- Test 60         : case of in main with tuple
-- Expected result : [o,n,e, ,z,e,r,o, ,l,e,f,t]

--/
a = (0, 2)
main = print (
          case a of 
                  (0, 0) -> "two zero"
                  (_, 0) -> "one zero right"
                  (0, _) -> "one zero left"
                  (_, _) -> "no zero" 
              )
--/
--------------------------------------------------------------------------------
-- Test 61         : case of in main with tuple of tuple
-- Expected result : 4

--/
a = (2, (1,1))
main = print (
          case a of 
                  (0, (1,2)) -> 0
                  (0, (2,1)) -> 1
                  (1, (1,1)) -> 2
                  (0, (1,1)) -> 3
                  (a, (b,c)) -> b + (3 * c)
              )
--/
--------------------------------------------------------------------------------
-- Test 62         : case of in main with one line
-- Expected result : 3

--/
a = (2, 1)
main = print (
          case a of 
                  (a, b) -> a + b 
              )
--/
--------------------------------------------------------------------------------
-- Test 63         : case of in main with a list on branch and exp
-- Expected result : 3

--/
a = [1, 2, 3]
main = print (
          case a of 
                  [1, 3, 2] -> 1
                  [a, b, 3] -> a + b
              )
--/
--------------------------------------------------------------------------------
-- Test 64         : case of with a list as exp and list patterns on branch
-- Expected result : 2 

--/
a = [1, 2, 3]
main = print (
          case a of 
                  (0 : [1, 2]) -> 0
                  [1, 3, 2] -> 1
                  (1 : 2 : 3 : []) -> 2
              )
--/
--------------------------------------------------------------------------------
-- Test 65         : case of in main with only list patterns as branch and exp
-- Expected result : [2]

--/
a = (1 : [2])
main = print (
          case a of 
                  (0 : b) -> b + 1
                  (1 : b) -> b
                  ([2] : ([1] : b) : c) -> 0
              )
--/
--------------------------------------------------------------------------------
-- Test 66         : case of with a list as branch and list patterns as exp
-- Expected result : 2 

--/
a = (1 : 2 : [3])
main = print (
          case a of 
                  [1, 3, 2] -> 1
                  [1, 2, 3] -> 2
                  [2, 3, 1] -> 3
              )
--/
--------------------------------------------------------------------------------
-- Test 67         : case of with a list matched fully
-- Expected result : [1,2,4]

--/
a = [1, 2, 4]
main = print (
          case a of 
                  [1, 3, 2] -> [1]
                  [a, b, 3] -> [a + b]
                  a -> a
              )
--/
--------------------------------------------------------------------------------
-- Test 68         : eval a list as a pattern
-- Expected result : [1,2]\n[1]\n[[1,2],[2]]\n[1,2,3]\n[1,2,3,4]

--/
main = do 
          print ((1 : [2]))
          print ((1 : []))
          print (((1:[2]) : [[2]]))
          print (1 : 2 : [3])
          print (1 : 2 : 3 : [4])
--/
--------------------------------------------------------------------------------
-- Test 69         : currying and pattern matching in function 
-- Expected result : 1

--/
func 0 1 = 0
func a b = 1

tmp = func 0

main = print (tmp 2)
--/
--------------------------------------------------------------------------------
-- Test 70         : currying and pattern matching in function 
-- Expected result : 2

--/
func 0 1 = 0
func 1 1 = 1
func a b = 2

tmp1 2 3 = func 0
tmp1 c d = func 1

tmp2 = tmp1 2

main = print (tmp2 4 2)
--/
--------------------------------------------------------------------------------
-- Test 71         : recursive call with prints
-- Expected result : 2\n1\n0\n[f,i,n,i,s,h,e,d]

--/
func a = if (a >= 0) then do
                            print (a)
                            func (a - 1)
                     else print ("finished")

main = func 2
--/
--------------------------------------------------------------------------------
-- Test 72         : different functions calls 
-- Expected result : 1\n1\n1

--/
f x = x + 1
main = do 
          print ((\x -> x + 1) 0)
          print (f 0)
          print ((f) 0)  
--/

--------------------------------------------------------------------------------
-- Test 73         : calling the same function in different statements
-- Expected result : 2\n4\n6

--/
main = do 
          print (1 + 1)
          print (2 + 2)
          print (3 + 3)  
--/

--------------------------------------------------------------------------------
-- Test 74         : lambdas
-- Expected result : 6

--/
l = \x -> \y -> \z -> x + y + z
main = print (l 1 2 3)
--/

--------------------------------------------------------------------------------
-- Test 75         : if as a function
-- Expected result : 0

--/
f x = x - 1
g x = x + 1
a = 1
main = print ((if a < 5 then f else g) a)
--/

--------------------------------------------------------------------------------
-- Test 76         : do statement (implicient then)
-- Expected result : 1\n2

--/
main = do
          print (1)
          print (2)
--/
--------------------------------------------------------------------------------
-- Test 77         : do statement (explicit then)
-- Expected result : 1\n2

--/
main = print (1) >> print (2)
--/

--------------------------------------------------------------------------------
-- Test 78         : do statement with '<-'
-- Expected result : ?
-- This would not work if, it would need to be putStrLn instead of print

--/
main = do 
    x <- getLine
    print x
--/

--------------------------------------------------------------------------------
-- Test 79         : do statement with '<-' and return
-- Expected result : 3

--/
main = do 
    x <- print 3
    return x
--/

--------------------------------------------------------------------------------
-- Test 80         : do statement with '>>=' and return
-- Expected result : 3

--/
main = do 
    print 3 >>= \x -> return x
--/

--------------------------------------------------------------------------------

