--# Tests for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected result : ?'  ? will be what the output will be compared to, 
--#                        must be on one line.

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
-- Expected result : "Hello World!"

--/
b = "Hello World"
main = print b
--/

--------------------------------------------------------------------------------
-- Test 2          : boolean
-- Expected result : False

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
-- Expected result : "not zero"

--/
a = 1
main = print (if a == 0 then "zero" else "not zero")
--/

--------------------------------------------------------------------------------
-- Test 13         : multiple ifs
-- Expected result : "inner fail"

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
-- Expected result : 2

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
-- Test 19         : let with a lambda
-- Expected result : 2

--/
main = print (let x = 1 ; y = \z -> z + 1 in y x)
--/

--------------------------------------------------------------------------------
-- Test 20         : function declaration
-- Expected result : 3

--/
add x y = x + y
main = print (add 1 2)
--/

--------------------------------------------------------------------------------
-- Test 21         : function declaration
-- Expected result : 6

--/
mul a b = a * b
main = print (mul 2 3)
--/

--------------------------------------------------------------------------------
-- Test 22         : recursive function declaration
-- Expected result : 120

--/
fact 0 = 1 
fact n = n * fact (n - 1)
main = print (fact 5)
--/

--------------------------------------------------------------------------------
-- Test 23         : recursive function declaration
-- Expected result : 5

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib a - 1) + (fib a - 2) 
main = do print (fib 5)
--/

--------------------------------------------------------------------------------
-- Test 24         : recursive function declaration on a list
-- Expected result : [3,2,1]

--/
reverse [] = [] 
reverse (head, rest) = reverse rest ++ head
main = do print (reverse [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 25         : recursive function with type annotation
-- Expected result : 3

--/
sum :: [Int] -> Int
sum [] = 0
sum (head: rest) = head + sum rest
main = do print (sum [1,2])
--/

--------------------------------------------------------------------------------
-- Test 26         : case of in func
-- Expected result : "black"

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
-- Test 27         : lambda
-- Expected result : 2

--/
main = print ((\x -> x + 1) 1 )
--/

--------------------------------------------------------------------------------
-- Test 28         : lambda with multiple arguments
-- Expected result : 5

--/
main = print ((\x y -> x + y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 29         : embeded lambda
-- Expected result : 11

--/
main = print ((\x y -> x + (\a -> a * a) y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 30         : type annotation of list of list
-- Expected result : 1

--/
func :: [[Int]] -> Int
func [] = 0
func [[]] = 0
func [(a: b)] = a
main = print (func [[1]])
--/

--------------------------------------------------------------------------------
-- Test 31         : lambda in a var
-- Expected result : 2

--/
a = \x -> x + 1
main = do print (a 1)
--/

-------------------------------------------------------------------------------
-- Test 32         : logical operators
-- Expected result : "no"

--/
x = 1
y = 2
main =  if (x==0) && (y==0) || (x + y) == 1 then print ("yes") else print ("no")
--/

--------------------------------------------------------------------------------
-- Test 33         : annotated variable declaration
-- Expected result : 3

--/
x :: Int
x = 5
main = print ((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 34         : let inside an anonymous function
-- Expected result : 3

--/
main = print((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 35         : function with 3 arguments
-- Expected result : function

--/
f x y z = 1 
main = print ( f 1 2 3)
--/

--------------------------------------------------------------------------------
-- Test 36         : variable declaration with main print
-- Expected result : Error

--/
a = 5
a = 6 
main = do print (a)
--/

--------------------------------------------------------------------------------
-- Test 37         : function declaration with main
-- Expected result : 5

--/
f :: Int -> Int
f x = x
a = 5

main = do print (f a)
--/

--------------------------------------------------------------------------------
-- Test 38         : currying
-- Expected result : 3

--/
a = (+ 1)
main = do print (a 2)
--/

--------------------------------------------------------------------------------
-- Test 39         : currying
-- Expected result : 3

--/
main = print ((+ 1) 2)
--/

--------------------------------------------------------------------------------
-- Test 40         : currying
-- Expected result : 3

--/
a = \x -> \y -> \z -> x + y + z
main = do print ((a 1 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 41         : currying
-- Expected result : 3

--/
a = \x -> \y -> \z -> x + y + z
main = do print (((a 1) 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 42         : multi-branch main
-- Expected result : "3\n4" 
-- TODO manage multiline results

--/
a = (+ 1)

main = do 
          print (a 2)
          print (a 3)
          print (a 4)
--/

--------------------------------------------------------------------------------
-- Test 43         : fonction funky pattern matching
-- Expected result : "fail" 
-- Todo gérer les fails 

--/
func a "str" 0 True [] (a:b) = 1 

main = do 
          print (func 1) 
--/

--------------------------------------------------------------------------------
-- Test 44         : currying et pattern matching
-- Expected result : 3 

--/
func a b = a + b
foo = func 1
main = do 
          print (foo 2) 
--/

--------------------------------------------------------------------------------
-- Test 45         : paire
-- Expected result : (1,2) 

--/
main = print (1,2) 
--/

--------------------------------------------------------------------------------
-- Test 46         : fst primitive
-- Expected result : 1

--/
main = print ( fst (1, 2) )
--/

--------------------------------------------------------------------------------
-- Test 47         : embeded pairs
-- Expected result : (1, (2,3))

--/
main = print ((1, (2,3))) 
--/

--------------------------------------------------------------------------------
-- Test 48         : pattern matching pair
-- Expected result : 3

--/
main = print ((\(x,y) -> x + y) (1,2))
--/

--------------------------------------------------------------------------------
-- Test 49         : list
-- Expected result : [1,2] 

--/
main = print [1,2] 
--/

--------------------------------------------------------------------------------
-- Test 50         : list
-- Expected result : [1,[1,2,3]] 

--/
main = print [[1,2],[1,2,3]]  
--/

--------------------------------------------------------------------------------
-- Test 51         : empty list
-- Expected result : [] 

--/
main = print []  
--/

--------------------------------------------------------------------------------
-- Test 52         : list with one element
-- Expected result : [1] 

--/
main = print [1]  
--/

--------------------------------------------------------------------------------
-- Test 53         : case of in main
-- Expected result : "one" 

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
-- Test 54         : case of in main with tuple
-- Expected result : "one zero left" 

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
-- Test 55         : case of in main with tuple of tuple
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
-- Test 56         : case of in main with o
-- Expected result : error 

--/
a = (2, 1)
main = print (
          case a of 
                  (a, b) -> 0
              )
--/
--------------------------------------------------------------------------------
-- Test 57         : case of in main with o
-- Expected result : error 

--/
a = (2, 1)
main = print (
          case (a , (1 : 2 : 3 : []) ) of 
                  (a, a) -> 0
              )
--/
--------------------------------------------------------------------------------