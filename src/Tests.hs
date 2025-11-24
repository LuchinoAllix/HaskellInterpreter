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
42
--/

--------------------------------------------------------------------------------
-- Test 1          : string
-- Expected result : "Hello World!"

--/
"Hello World"
--/

--------------------------------------------------------------------------------
-- Test 2          : boolean
-- Expected result : False

--/
False
--/

--------------------------------------------------------------------------------
-- Test 3          : addition
-- Expected result : 3

--/
1 + 2
--/

--------------------------------------------------------------------------------
-- Test 4          : substraction
-- Expected result : -1

--/
1 - 2
--/

--------------------------------------------------------------------------------
-- Test 5          : multiplication
-- Expected result : 42

--/
21 * 2
--/

--------------------------------------------------------------------------------
-- Test 6          : division
-- Expected result : 21

--/
42 / 2
--/

--------------------------------------------------------------------------------
-- Test 7          : equality
-- Expected result : True

--/
(3 * 4) == 12
--/

--------------------------------------------------------------------------------
-- Test 8          : let
-- Expected result : 1

--/
let x = 1 in x
--/

--------------------------------------------------------------------------------
-- Test 9          : let with addition
-- Expected result : 6

--/
let x = 3 in x + 3
--/

--------------------------------------------------------------------------------
-- Test 10         : let with a string
-- Expected result : "hello world"

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
-- Test 13         : recursive function declaration
-- Expected result : function

--/
fact 0 = 1 
fact n = n * fact n - 1
--/

--------------------------------------------------------------------------------
-- Test 14         : recursive function declaration and call
-- Expected result : 3

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib a - 1) + (fib a - 2) 
fib 3
--/

--------------------------------------------------------------------------------
-- Test 15         : recursive function declaration on a list
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
sum (head: rest) = head + sum rest
--/

--------------------------------------------------------------------------------
-- Test 17         : if statement
-- Expected result : "not zero"

--/
func a = if a == 0 then "zero" else "not zero"
func 1
--/

--------------------------------------------------------------------------------
-- Test 18         : case of
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
-- Test 19         : lambda
-- Expected result : 2

--/
(\x -> x + 1) 1 
--/

--------------------------------------------------------------------------------
-- Test 20         : lambda with multiple arguments
-- Expected result : 5

--/
(\x y -> x + y ) 2 3
--/

--------------------------------------------------------------------------------
-- Test 21         : embeded lambda
-- Expected result : 11

--/
(\x y -> x + (\a -> a * a) y ) 2 3
--/

--------------------------------------------------------------------------------
-- Test 22         : type annotation of list of list
-- Expected result : function

--/
func :: [[Int]] -> Int
func [] = 0
func [[]] = 0
func [(a: b)] = a
--/

--------------------------------------------------------------------------------
-- Test 23         : let without in
-- Expected result : variable

--/
let x = "3"
--/

--------------------------------------------------------------------------------
-- Test 24         : multiple inless lets
-- Expected result : variable 
-- Do we actually want to accept this ? FIXME

--/
let x = "3"
let y = 6
--/

--------------------------------------------------------------------------------
-- Test 25         : multiple infull lets
-- Expected result : 6

--/
let x = "3" in x
let y = 6 in y
--/

--------------------------------------------------------------------------------
-- Test 26         : logical operators
-- Expected result : function

--/
f x y = if (x==0) && (y==0) ||  (x + y) == 1 then "yes" else "no"
--/

--------------------------------------------------------------------------------
-- Test 27         : annotated variable declaration
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
-- Test 28         : let inside an anonymous function
-- Expected result : 3

--/
(\x -> let x = 3 in x) 1
--/

--------------------------------------------------------------------------------
-- Test 29         : function with 3 arguments
-- Expected result : function

--/
f x y z = 1 
--/

--------------------------------------------------------------------------------