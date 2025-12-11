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
main = do print a
--/

--------------------------------------------------------------------------------
-- Test 1          : string
-- Expected result : "Hello World!"

--/
b = "Hello World"
main = do print b
--/

--------------------------------------------------------------------------------
-- Test 2          : boolean
-- Expected result : False

--/
c = False
main = do print c
--/

--------------------------------------------------------------------------------
-- Test 3          : addition
-- Expected result : 3

--/
main = do print (1 + 2)
--/

--------------------------------------------------------------------------------
-- Test 4          : substraction
-- Expected result : -1

--/
main = do print (1 - 2)
--/

--------------------------------------------------------------------------------
-- Test 5          : multiplication
-- Expected result : 42

--/
main = do print (21 * 2)
--/

--------------------------------------------------------------------------------
-- Test 6          : division
-- Expected result : 21

--/
main = do print (42 / 2)
--/

--------------------------------------------------------------------------------
-- Test 7          : multiple addition
-- Expected result : 5

--/
main = do print (1 + 1 + 1 + 1 + 1)
--/

--------------------------------------------------------------------------------
-- Test 8          : priority of operations
-- Expected result : 55

--/
main = do print (5 + 5 * 10)
--/

--------------------------------------------------------------------------------
-- Test 9          : priority of operations
-- Expected result : 35

--/
main = do print (5 * 5 + 10)
--/

--------------------------------------------------------------------------------
-- Test 10          : parenthesis operations
-- Expected result : 100

--/
main = do print ((5 + 5) * 10)
--/

--------------------------------------------------------------------------------
-- Test 11          : complex operations
-- Expected result  : 25

--/
main = do print (5 + 3 * 8 - 12 / 3)
--/

--------------------------------------------------------------------------------
-- Test 12          : if statement
-- Expected result : "not zero"

--/
a = 1
main = do print (if a == 0 then "zero" else "not zero")
--/

--------------------------------------------------------------------------------
-- Test 13          : multiple ifs
-- Expected result : "inner fail"

--/
main = do print (if (True) then if (False) then "sucess" else "inner fail" else "outer fail")
--/

--------------------------------------------------------------------------------
-- Test 14          : let
-- Expected result : 1

--/
main = do print (let x = 1 in x)
--/

--------------------------------------------------------------------------------
-- Test 15          : let with multiple vars 
-- Expected result : 2

--/
main = do print (let x = 1 ; y = \z -> z + 1 in y x)
--/

--------------------------------------------------------------------------------
-- Test 16          : let with addition
-- Expected result : 6

--/
main = do print (let x = 3 in x + 3)
--/

--------------------------------------------------------------------------------
-- Test 17          : let with a string
-- Expected result : "hello world"

--/
main = do print (let x = "hello world" in x)
--/

--------------------------------------------------------------------------------
-- Test 18          : function declaration
-- Expected result : 3

--/
add x y = x + y
main = do print (add 1 2)
--/

--------------------------------------------------------------------------------
-- Test 19          : function declaration
-- Expected result : 6

--/
mul a b = a * b
main = do print (mul 2 3)
--/

--------------------------------------------------------------------------------
-- Test 20          : recursive function declaration
-- Expected result : 120

--/
fact 0 = 1 
fact n = n * fact (n - 1)
main = do print (fact 5)
--/

--------------------------------------------------------------------------------
-- Test 21          : recursive function declaration
-- Expected result : 5

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib a - 1) + (fib a - 2) 
main = do print (fib 5)
--/

--------------------------------------------------------------------------------
-- Test 22          : recursive function declaration on a list
-- Expected result : [3,2,1]

--/
reverse [] = [] 
reverse (head, rest) = reverse rest ++ head
main = do print (reverse [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 23          : recursive function with type annotation
-- Expected result : 3

--/
sum :: [Int] -> Int
sum [] = 0
sum (head: rest) = head + sum rest
main = do print (sum [1,2])
--/

--------------------------------------------------------------------------------
-- Test 24          : case of
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
main = do print (cardColour "clubs")
-- FIXME : error in parsing with main, but not without
--/

--------------------------------------------------------------------------------
-- Test 25          : lambda
-- Expected result : 2

--/
main = do print ((\x -> x + 1) 1 )
--/

--------------------------------------------------------------------------------
-- Test 26          : lambda with multiple arguments
-- Expected result : 5

--/
main = do print ((\x y -> x + y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 27          : embeded lambda
-- Expected result : 11

--/
main = do print ((\x y -> x + (\a -> a * a) y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 28          : type annotation of list of list
-- Expected result : 1

--/
func :: [[Int]] -> Int
func [] = 0
func [[]] = 0
func [(a: b)] = a
main = do print (func [[1]])
--/

--------------------------------------------------------------------------------
-- Test 29          : multiple inless lets
-- Expected result : variable 
-- 

--/
let x = "3"
let y = 6
--/

--------------------------------------------------------------------------------
-- Test 30          : multiple infull lets
-- Expected result : 6

--/
main = do print ( let x = "3" in let y = 6 in y )
--/

--------------------------------------------------------------------------------
-- Test 31          : lambda in a var
-- Expected result : 2

--/
a = \x -> x + 1
main = do print (a 1)
--/

-------------------------------------------------------------------------------
-- Test 32          : logical operators
-- Expected result : function

--/
f x y = if (x==0) && (y==0) ||  (x + y) == 1 then "yes" else "no"
--/

--------------------------------------------------------------------------------
-- Test 33          : annotated variable declaration
-- Expected result : function
-- temporary decls to see the different ast output

--/
x :: Int
x :: [Int]
x :: [Int] -> Int 
x :: Int -> Int
x = 5
x y = y + 1
(\x -> let x = 3 in x) 1
--/

--------------------------------------------------------------------------------
-- Test 34          : let inside an anonymous function
-- Expected result : 3

--/
(\x -> let x = 3 in x) 1
--/

--------------------------------------------------------------------------------
-- Test 35          : function with 3 arguments
-- Expected result : function

--/
f x y z = 1 
--/

--------------------------------------------------------------------------------
-- Test 36          : variable declaration with main print
-- Expected result : 5

--/
a = 5

main = do print (a)
--/

--------------------------------------------------------------------------------
-- Test 37          : function declaration with main
-- Expected result : 5

--/
f :: Int -> Int
f x = x
a = 5

main = do print (f a)
--/

--------------------------------------------------------------------------------
-- Test 38          : currying
-- Expected result : 3

--/
a = (+ 1)

main = do print (a 2)
--/

--------------------------------------------------------------------------------
-- Test 39          : multi-branch main
-- Expected result : "3/n4" 
-- TODO manage multiline results

--/
a = (+ 1)

main = do 
          print (a 2)
          print (a 3)
--/

--------------------------------------------------------------------------------
-- Test 40          : fonction funky pattern matching
-- Expected result : "fail" 
-- Todo gérer les fails 

--/
func a "str" 0 True [] (a:b) = 1 

main = do 
          print (func 1) 
--/

--------------------------------------------------------------------------------
-- Test 41          : currying et pattern matching
-- Expected result : "3" 

--/
func a b = a + b
foo = func 1
main = do 
          print (foo 2) 
--/

--------------------------------------------------------------------------------