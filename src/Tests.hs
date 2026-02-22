--# Tests for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected result : ?'  ? will be what the output will be compared to, 
--#                        must be on one line. for results with multiple
--#                        answers (like in a do stmt) the expected results need
--#                        to be seperated by \n.
--#                        Errors are managed in TestFail.hs. 

--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 1          : integer
-- Expected result : 42

--/
a = 42
main = print a
--/

--------------------------------------------------------------------------------
-- Test 2          : string
-- Expected result : "Hello World!"

--/
b = "Hello World!"
main = print b
--/

--------------------------------------------------------------------------------
-- Test 3          : boolean
-- Expected result : false

--/
c = False
main = print c
--/

--------------------------------------------------------------------------------
-- Test 4          : addition
-- Expected result : 3

--/
main = print (1 + 2)
--/

--------------------------------------------------------------------------------
-- Test 5          : substraction
-- Expected result : -1

--/
main = print (1 - 2)
--/

--------------------------------------------------------------------------------
-- Test 6          : multiplication
-- Expected result : 42

--/
main = print (21 * 2)
--/

--------------------------------------------------------------------------------
-- Test 7          : division
-- Expected result : 21

--/
main = print (42 / 2)
--/

--------------------------------------------------------------------------------
-- Test 8          : multiple addition
-- Expected result : 5

--/
main = print (1 + 1 + 1 + 1 + 1)
--/

--------------------------------------------------------------------------------
-- Test 9          : priority of operations
-- Expected result : 55

--/
main = print (5 + 5 * 10)
--/

--------------------------------------------------------------------------------
-- Test 10         : priority of operations
-- Expected result : 35

--/
main = print (5 * 5 + 10)
--/

--------------------------------------------------------------------------------
-- Test 11         : parenthesis operations
-- Expected result : 100

--/
main = print ((5 + 5) * 10)
--/

--------------------------------------------------------------------------------
-- Test 12         : complex operations
-- Expected result : 25

--/
main = print (5 + 3 * 8 - 12 / 3)
--/

--------------------------------------------------------------------------------
-- Test 13         : if statement
-- Expected result : "not zero"

--/
a = 1
main = print (if a == 0 then "zero" else "not zero")
--/

--------------------------------------------------------------------------------
-- Test 14         : multiple ifs
-- Expected result : "inner fail"

--/
main = print (if (True) 
              then if (False) 
                   then "sucess" 
                   else "inner fail" 
              else "outer fail")
--/

--------------------------------------------------------------------------------
-- Test 15         : let
-- Expected result : 1

--/
main = let x = 1 in print(x)
--/

--------------------------------------------------------------------------------
-- Test 16         : let with multiple vars
-- Expected result : 3

--/
main = let x = 1 ; y = 2 in print(x + y)
--/

--------------------------------------------------------------------------------
-- Test 17         : let in a var not in main
-- Expected result : 1

--/
letx = let x = 1 in print(x)
main = letx
--/

--------------------------------------------------------------------------------
-- Test 18         : let with over-writing a var
-- Expected result : 2

--/
main = print (let x = 1 in let x = 2 in x)
--/

--------------------------------------------------------------------------------
-- Test 19         : let with overriding a var not in main
-- Expected result : 2

--/
lets = let x = 1 in let x = 2 in x
main = print (lets)
--/

--------------------------------------------------------------------------------
-- Test 20         : let with overriding a var not in main
-- Expected result : 3

--/
lets = let x = 1 in (let x = 2 in x ) + x
main = print (lets)
--/

--------------------------------------------------------------------------------
-- Test 21         : let with a lambda
-- Expected result : 2

--/
main = print (let x = 1 ; y = \z -> z + 1 in y x)
--/

--------------------------------------------------------------------------------
-- Test 22         : identity function
-- Expected result : 5

--/
id x = x
main = print (id 5) 
--/

--------------------------------------------------------------------------------
-- Test 23         : inc function
-- Expected result : 6

--/
inc x = x + 1
main = print (inc 5) 
--/

--------------------------------------------------------------------------------
-- Test 24         : function declaration
-- Expected result : 3

--/
add x y = x + y
main = print (add 1 2)
--/

--------------------------------------------------------------------------------
-- Test 25         : function declaration
-- Expected result : 6

--/
mul a b = a * b
main = print (mul 2 3)
--/

--------------------------------------------------------------------------------
-- Test 26         : recursive function declaration
-- Expected result : 120

--/
fact 0 = 1 
fact n = n * fact (n - 1)
main = print (fact 5)
--/

--------------------------------------------------------------------------------
-- Test 27         : recursive function declaration
-- Expected result : 5

--/
fib 0 = 0
fib 1 = 1 
fib a  = (fib (a - 1)) + (fib (a - 2)) 
main = print (fib 5)
--/

--------------------------------------------------------------------------------
-- Test 28         : recursive function declaration on a list
-- Expected result : [3,2,1]

--/
reverse [] = [] 
reverse (head : rest) = (reverse rest) ++ [head]
main = do print (reverse [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 29         : recursive function with type annotation
-- Expected result : 3

--/
sum :: [Integer] -> Integer
sum [] = 0
sum (head: rest) = head + sum rest
main = print (sum [1,2])
--/

--------------------------------------------------------------------------------
-- Test 30         : case of in func
-- Expected result : "black"

--/
cardColour :: [Char] -> [Char]
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
-- Test 31         : lambda
-- Expected result : 3

--/
main = print ((\x -> x + 2) 1 )
--/

--------------------------------------------------------------------------------
-- Test 32         : lambda with multiple arguments
-- Expected result : 5

--/
main = print ((\x y -> x + y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 33         : embeded lambda
-- Expected result : 11

--/
main = print ((\x y -> x + (\a -> a * a) y ) 2 3)
--/

--------------------------------------------------------------------------------
-- Test 34         : type annotation of list of list
-- Expected result : 1

--/
func :: [[Integer]] -> Integer
func [] = 0
func [[]] = 0
func [(a: b)] = a
main = print (func [[1]])
--/

--------------------------------------------------------------------------------
-- Test 35         : lambda in a var
-- Expected result : 2

--/
a = \x -> x + 1
main = do print (a 1)
--/

-------------------------------------------------------------------------------
-- Test 36         : logical operators
-- Expected result : "no"

--/
x = 1
y = 2
main =  if (x==0) && (y==0) || (x + y) == 1 then print ("yes") else print ("no")
--/

--------------------------------------------------------------------------------
-- Test 37         : annotated variable declaration
-- Expected result : 3

--/
x :: Integer
x = 5
main = print ((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 38         : let inside an anonymous function
-- Expected result : 3

--/
main = print((\x -> let x = 3 in x) 1)
--/

--------------------------------------------------------------------------------
-- Test 39         : function with 3 arguments
-- Expected result : 1

--/
f x y z = 1 
main = print ( f 1 2 3)
--/

--------------------------------------------------------------------------------
-- Test 40         : function declaration with main
-- Expected result : 5

--/
f :: Integer -> Integer
f x = x
a = 5

main = do print (f a)
--/

--------------------------------------------------------------------------------
-- Test 41         : currying
-- Expected result : 3

--/
a = (+ 1)
main = do print (a 2)
--/

--------------------------------------------------------------------------------
-- Test 42         : currying
-- Expected result : 3

--/
main = print ((+ 1) 2)
--/

--------------------------------------------------------------------------------
-- Test 43         : currying
-- Expected result : 6

--/
a = \x -> \y -> \z -> x + y + z
main = do print ((a 1 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 44         : currying
-- Expected result : 6

--/
a = \x -> \y -> \z -> x + y + z
main = do print (((a 1) 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 45         : multi-branch main
-- Expected result : 3\n4\n5

--/
a = (+ 1)

main = do 
          print (a 2)
          print (a 3)
          print (a 4)
--/

--------------------------------------------------------------------------------
-- Test 46         : currying
-- Expected result : 6

--/
main = do print (((\x -> \y -> \z -> x + y + z) 1 2) 3)
--/

--------------------------------------------------------------------------------
-- Test 47         : currying
-- Expected result : 4

--/
f a b = ((+ b) a)
main = do print ((f 1) 3)
--/


--------------------------------------------------------------------------------
-- Test 48         : currying et pattern matching
-- Expected result : 3 

--/
func a b = a + b
foo = func 1
main = do 
          print (foo 2) 
--/

--------------------------------------------------------------------------------
-- Test 49         : paire
-- Expected result : (1,2)

--/
main = print (1,2) 
--/

--------------------------------------------------------------------------------
-- Test 50         : paire
-- Expected result : (1,2,3)

--/
main = print (1,2,3) 
--/

--------------------------------------------------------------------------------
-- Test 51         : paire
-- Expected result : (1,(2,3))

--/
main = print (1,(2,3))
--/

--------------------------------------------------------------------------------
-- Test 52         : fst primitive
-- Expected result : 1

--/
main = print ( fst (1, 2) )
--/

--------------------------------------------------------------------------------
-- Test 53         : embeded pairs
-- Expected result : (1,(2,3))

--/
main = print ((1, (2,3))) 
--/

--------------------------------------------------------------------------------
-- Test 54         : pattern matching pair
-- Expected result : 3

--/
main = print ((\(x,y) -> x + y) (1,2))
--/

--------------------------------------------------------------------------------
-- Test 55         : pattern matching pair and another argument
-- Expected result : 0

--/
main = print ((\(x,y) z  -> x + y - z) (1,2) 3)
--/

--------------------------------------------------------------------------------
-- Test 56         : list
-- Expected result : [1,2]

--/
main = print [1,2] 
--/

--------------------------------------------------------------------------------
-- Test 57         : longer list
-- Expected result : [1,2,3]

--/
main = print [1,2,3]
--/
--------------------------------------------------------------------------------
-- Test 58         : embeded list
-- Expected result : [[1],[2]]

--/
main = print [[1],[2]] 
--/

--------------------------------------------------------------------------------
-- Test 59         : more embeded list
-- Expected result : [[1,2],[1,2,3]]

--/
main = print [[1,2],[1,2,3]]
--/

--------------------------------------------------------------------------------
-- Test 60         : empty list
-- Expected result : []

--/
main = print []  
--/

--------------------------------------------------------------------------------
-- Test 61         : list with one element
-- Expected result : [1]

--/
main = print [1]  
--/

--------------------------------------------------------------------------------
-- Test 62         : case of in main
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
-- Test 63         : case of in main with tuple
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
-- Test 64         : case of in main with tuple of tuple
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
-- Test 65         : case of in main with one line
-- Expected result : 3

--/
a = (2, 1)
main = print (
          case a of 
                  (a, b) -> a + b 
              )
--/
--------------------------------------------------------------------------------
-- Test 66         : case of in main with a list on branch and exp
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
-- Test 67         : case of with a list as exp and list patterns on branch
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
-- Test 68         : case of in main with only list patterns as branch and exp
-- Expected result : [2]

--/
a = (1 : [2])
main = print (
          case a of 
                  (0 : b) -> [0]
                  (1 : b) -> b
                  (2 : (1 : b)) -> b
              )
--/
--------------------------------------------------------------------------------
-- Test 69         : case of with a list as branch and list patterns as exp
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
-- Test 70         : case of with a list matched fully
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
-- Test 71         : eval a list as a pattern
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
-- Test 72         : currying and pattern matching in function 
-- Expected result : 1

--/
func 0 1 = 0
func a b = 1

tmp = func 0

main = print (tmp 2)
--/
--------------------------------------------------------------------------------
-- Test 73         : currying and pattern matching in function 
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
-- Test 74         : recursive call with prints
-- Expected result : 2\n1\n0\n"finished"

--/
func a = if (a >= 0) then do
                            print (a)
                            func (a - 1)
                     else print ("finished")

main = func 2
--/
--------------------------------------------------------------------------------
-- Test 75         : different functions calls 
-- Expected result : 1\n1\n1

--/
f x = x + 1
main = do 
          print ((\x -> x + 1) 0)
          print (f 0)
          print ((f) 0)  
--/

--------------------------------------------------------------------------------
-- Test 76         : calling the same function in different statements
-- Expected result : 2\n4\n6

--/
main = do 
          print (1 + 1)
          print (2 + 2)
          print (3 + 3)  
--/

--------------------------------------------------------------------------------
-- Test 77         : lambdas
-- Expected result : 6

--/
l = \x -> \y -> \z -> x + y + z
main = print (l 1 2 3)
--/

--------------------------------------------------------------------------------
-- Test 78         : if as a function
-- Expected result : 0

--/
f x = x - 1
g x = x + 1
a = 1
main = print ((if a < 5 then f else g) a)
--/

--------------------------------------------------------------------------------
-- Test 79         : do statement (implicient then)
-- Expected result : 1\n2

--/
main = do
          print (1)
          print (2)
--/
--------------------------------------------------------------------------------
-- Test 80         : do statement (explicit then)
-- Expected result : 1\n2

--/
main = print (1) >> print (2)
--/

--------------------------------------------------------------------------------
-- Test 81         : do statement with '<-' and return
-- Expected result : 3

--/
main = do 
    x <- print 3
    return x
--/

--------------------------------------------------------------------------------
-- Test 82         : do statement with '>>=' and return
-- Expected result : 3

--/
main = do 
    print 3 >>= \x -> return x
--/

--------------------------------------------------------------------------------
-- Test 83         : inless let
-- Expected result : 3

--/
main = do 
    let x = 3
    print x
--/

--------------------------------------------------------------------------------
-- Test 84         : inless let with something before
-- Expected result : 3\n3

--/
main = do 
    let x = 1; y = 2 in print (x + y)
    let x = 3
    print x
--/

--------------------------------------------------------------------------------
-- Test 85         : <- with line before var call and after
-- Expected result : 3\n1\n()\n0

--/
main = do 
    x <- print 3
    print 1 
    print x
    print 0
--/

--------------------------------------------------------------------------------
-- Test 86         : - with one element
-- Expected result : -6

--/
main = print (-6)
--/

--------------------------------------------------------------------------------
-- Test 87         : complex test with operations
-- Expected result : 16

--/
main = print (- (2 * (- 5) + 2 * 6 / (- 2)))
--/

--------------------------------------------------------------------------------
-- Test 88         : priority of op with booleans
-- Expected result : false

--/
main = print (3 + 4 == 5)
--/

--------------------------------------------------------------------------------
-- Test 89         : infix function call (`f`)
-- Expected result : 7

--/
f  x y = x + y
main = print (3 `f` 4)
--/

--------------------------------------------------------------------------------
-- Test 90         : tuple type annotation
-- Expected result : 0

--/
x :: (Integer, Integer)
x = (1, 0)
main = print (snd x)
--/

--------------------------------------------------------------------------------
-- Test 91         : string in tuple
-- Expected result : (1,"string")

--/
main = print ((1, "string"))
--/

--------------------------------------------------------------------------------
-- Test 92         : id with different types
-- Expected result : (1,false)

--/
id x = x
a = id 1
b = id False
main = print ((a, b))
--/

--------------------------------------------------------------------------------
-- Test 93         : polymorphic list function pattern [a]
-- Expected result : 1

--/
f [a] = a
main = print (f [1])
--/

--------------------------------------------------------------------------------
-- Test 94         : polymorphic list function pattern (a:b)
-- Expected result : 1

--/
f (a:b) = a
main = print (f [1])
--/

--------------------------------------------------------------------------------
-- Test 95         : String type annotation
-- Expected result : "Help me"

--/
concatStr :: String -> String -> String
concatStr a b = a ++ b 
main = print (concatStr "Help" " me")
--/

--------------------------------------------------------------------------------
-- Test 96         : Map function
-- Expected result : [1,4,9,16,25]

--/
l = [1, 2, 3, 4, 5] 
main = print (map (\x -> x * x) l)
--/

--------------------------------------------------------------------------------
-- Test 97         : Main type annotation
-- Expected result : 3

--/
main :: IO ()
main = do 
    print 3
--/

--------------------------------------------------------------------------------
-- Test 98         : Maybe
-- Expected result : Nothing\nJust 5

--/
divv a b = if b == 0
          then Nothing
          else Just (a/b)

main = do 
    print (divv 5 0)
    print (divv 5 1)
--/

--------------------------------------------------------------------------------
-- Test 99         : Algebraic data type definition
-- Expected result : None

--/
data Perhaps a = None | Some a
divv a b = if b == 0
          then None
          else Some (a/b)

main = print (divv 5 0)
--/

--------------------------------------------------------------------------------
-- Test 100        : Algebraic data type in pattern matching
-- Expected result : 5

--/
a = Just 5
main = print(case a of 
                Nothing -> 0
                Just a -> a)
--/

--------------------------------------------------------------------------------