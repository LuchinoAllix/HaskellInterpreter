--# Tests for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected result : ?'  ? will be what the output will be compared to, 
--#                        must be on one line.

--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 0          : Integer
-- Expected result : 42

--/
42
--/

--------------------------------------------------------------------------------
-- Test 1          : String
-- Expected result : "Hello World!"

--/
"Hello World"
--/

--------------------------------------------------------------------------------
-- Test 2          : Boolean
-- Expected result : False

--/
False
--/

--------------------------------------------------------------------------------
-- Test 3          : Addition
-- Expected result : 3

--/
1 + 2
--/

--------------------------------------------------------------------------------
-- Test 4          : Substraction
-- Expected result : -1

--/
1 - 2
--/

--------------------------------------------------------------------------------
-- Test 5          : Multiplication
-- Expected result : 42

--/
21 * 2
--/

--------------------------------------------------------------------------------
-- Test 6          : Division
-- Expected result : 21

--/
42 / 2
--/

--------------------------------------------------------------------------------
-- Test 7          : Equality
-- Expected result : True

--/
(3 * 4) == 12
--/

--------------------------------------------------------------------------------
-- Test 8          : Let
-- Expected result : 1

--/
let x = 1 in x
--/

--------------------------------------------------------------------------------
-- Test 9          : Let with addition
-- Expected result : 6

--/
let x = 3 in x + 3
--/

--------------------------------------------------------------------------------
-- Test 10         : Let with a string
-- Expected result : 42

--/
let x = "hello world" in x
--/

--------------------------------------------------------------------------------
-- Test 11         : function declaration
-- Expected result : function

--/
add x y = x + y
--/

--------------------------------------------------------------------------------
-- Test 12         : function declaration and call
-- Expected result : 6

--/
mul a b = a * b
mul 1 2
--/

--------------------------------------------------------------------------------
-- Test 13         : Recursive function declaration
-- Expected result : function

--/
fact 0 = 1 
fact n = n * fact n - 1
--/

--------------------------------------------------------------------------------
-- Test 14         : Recursive function declaration and call
-- Expected result : 3

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib a - 1) + (fib a - 2) 
fib 3
--/

--------------------------------------------------------------------------------
-- Test 15         : Recursive function declaration on a list
-- Expected result : function

--/
reverse [] = [] 
reverse (head, rest) = reverse rest ++ head
--/

--------------------------------------------------------------------------------
-- Test 16         : recursive function with type annotation
-- Expected result : function

--/
sum :: [Int] -> Int
sum [] = 0
sum (head, rest) = head + sum rest
--/

--------------------------------------------------------------------------------
-- Test 17         : If statement
-- Expected result : "not zero"

--/
func a = if a == 0 then "zero" else "not zero"
func 1
--/

--------------------------------------------------------------------------------
-- Test 18         : Case of
-- Expected result : function

--/
cardColour :: String -> String
cardColour suit =
  case suit of
    "hearts" -> "red"
    "diamonds" -> "red"
    "spades" -> "black"
    "clubs" -> "black"
    _ -> "I am not familiar with this card suit."
--/

--------------------------------------------------------------------------------
-- Test 19         : Lambda
-- Expected result : function

--/
\x -> x + 1 
--/

--------------------------------------------------------------------------------
-- Test 20         : Lambda with multiple arguments
-- Expected result : 5

--/
(\x y -> x + y ) 2 3
--/

--------------------------------------------------------------------------------
-- Test 21         : Embeded lambda
-- Expected result : 11

--/
(\x y -> x + (\a -> a * a) y ) 2 3
--/

--------------------------------------------------------------------------------
-- Test 22         : type annotation of list of list
-- Expected result : function

--/
func :: [[Int]] -> Int
--/

--------------------------------------------------------------------------------