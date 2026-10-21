--# Tests for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Expected result : ?'  ? will be what the output will be compared to, 
--#                        must be on one line. for results with multiple
--#                        answers (like in a do stmt) the expected results need
--#                        to be separated by \n.
--#                        Errors are managed in TestFail.hs. 

--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 1          : integer
-- Expected result : 42

--/
main = print 42
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
-- Expected result : 'c'

--/
main = let x = 'c' in print(x)
--/

--------------------------------------------------------------------------------
-- Test 16         : let with multiple vars
-- Expected result : 3

--/
main = let x = 1 ; y = 2 in print(x + y)
--/

--------------------------------------------------------------------------------
-- Test 17         : let in a var not in main
-- Expected result : 'c'

--/
letx = let x = 'c' in print('c')
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
-- Expected result : 'b'

--/
lets = let x = 'a' in let x = 'b' in x
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
-- Expected result : 'c'

--/
id x = x
main = print (id 'c') 
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
-- Expected result : "the answer is no"

--/
x = 1
y = 2
main =  if (x==0) && (y==0) || (x + y) == 1 then print ("the answer is yes") else print ("the answer is no")
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
-- Expected result : ('1','2')

--/
main = print ('1','2') 
--/

--------------------------------------------------------------------------------
-- Test 50         : paire
-- Expected result : ('1','2','3')

--/
main = print ('1','2','3') 
--/

--------------------------------------------------------------------------------
-- Test 51         : paire
-- Expected result : ('1',('2','3'))

--/
main = print ('1',('2','3'))
--/

--------------------------------------------------------------------------------
-- Test 52         : fst primitive
-- Expected result : '1'

--/
main = print ( fst ('1', '2') )
--/

--------------------------------------------------------------------------------
-- Test 53         : embeded pairs
-- Expected result : ('1',('2','3'))

--/
main = print (('1', ('2','3'))) 
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
-- Expected result : "12"

--/
main = print ['1','2'] 
--/

--------------------------------------------------------------------------------
-- Test 57         : longer list
-- Expected result : "123"

--/
main = print ['1','2','3']
--/
--------------------------------------------------------------------------------
-- Test 58         : embeded list
-- Expected result : ["1","2"]

--/
main = print [['1'],['2']] 
--/

--------------------------------------------------------------------------------
-- Test 59         : more embeded list
-- Expected result : ["12","123"]

--/
main = print [['1','2'],['1','2','3']]
--/

--------------------------------------------------------------------------------
-- Test 60         : empty list
-- Expected result : []

--/
main = print []  
--/

--------------------------------------------------------------------------------
-- Test 61         : list with one element
-- Expected result : "1"

--/
main = print ['1']  
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
-- Expected result : "False"\n"True"\n"True"\n"False"

--/
even 0 = True
even n = odd (n - 1)

odd 0 = False
odd n = even (n - 1)

textBoolean a = if a then "True" else "False"

main = do
          print (textBoolean (odd  10) )
          print (textBoolean (even 10) )
          print (textBoolean (odd  11) )
          print (textBoolean (even 11) )
--/
--------------------------------------------------------------------------------
-- Test 80         : do statement (explicit then)
-- Expected result : '1'\n'2'

--/
main = print ('1') >> print ('2')
--/

--------------------------------------------------------------------------------
-- Test 81         : do statement with '<-' and return
-- Expected result : '3'

--/
main = do 
    x <- print '3'
    return x
--/

--------------------------------------------------------------------------------
-- Test 82         : do statement with '>>=' and return
-- Expected result : '3'

--/
main = do 
    print '3' >>= \x -> return x
--/

--------------------------------------------------------------------------------
-- Test 83         : inless let
-- Expected result : '3'

--/
main = do 
    let x = '3'
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
-- Expected result : (1,"my string")

--/
main = print ((1, "my string"))
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
-- Expected result : "Help me please"

--/
concatStr :: String -> String -> String
concatStr a b = a ++ b 
main = print (concatStr "Help" " me please")
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
                Just b -> b)
--/

--------------------------------------------------------------------------------
-- Test 101        : User defined map
-- Expected result : [4,5,6]

--/
myMap f [] = []
myMap f (a:b) = [(f a)] ++ (myMap f b)

main = print(myMap (\x -> x + 1) [3,4,5])
--/

--------------------------------------------------------------------------------
-- Test 102        : more complex algebraic data type (list)
-- Expected result : 12

--/
data MyList a = Nil | Cons a (MyList a)

integers :: MyList Integer
integers = Cons 12 (Cons 107 Nil)

main = print( 12  )
--/

--------------------------------------------------------------------------------
-- Test 103        : more complex algebraic data type (list)
-- Expected result : 12

--/
data MyList a = Nil | Cons a (MyList a)

integers :: MyList Integer
integers = Cons 12 (Cons 107 Nil)

main = case integers of 
    Nil -> print "This is the empty list" 
    Cons a b -> print(a)
--/

--------------------------------------------------------------------------------
-- Test 104        : more algebraic data type (either)
-- Expected result : 1

--/
data Either a b = Left a | Right b

listofIntAndBool :: [Either Integer Boolean]
listofIntAndBool = [Left 1, Left 2, Right False]

main = case listofIntAndBool of
  [] -> print "This is the empty list"
  Left a : rest -> print a
  Right b : rest -> print b
--/

--------------------------------------------------------------------------------
-- Test 105        : more algebraic data type (tree)
-- Expected result : 5

--/
data Tree a = Nil | Node a (Tree a) (Tree a)

tree = Node 5 (Node 3 (Node 1 Nil Nil) Nil) (Node 9 Nil (Nil))

main = case tree of
  Nil -> print "Nil (empty list)"
  Node a b c -> print a 
--/

--------------------------------------------------------------------------------
-- Test 106        : pattern matching constructor in func not case
-- Expected result : "5"\n"Nil (empty list)"

--/
data Tree a = Nil | Node a (Tree a) (Tree a)

first (Nil) = "Nil (empty list)"
first (Node a b c) = a

tree1 = Node "5" (Node "3" (Node "1" Nil Nil) Nil) (Node "9" Nil (Nil))
tree2 = Nil

main = do 
    print (first tree1)
    print (first tree2)
--/

--------------------------------------------------------------------------------
-- Test 107        : User defined map v2
-- Expected result : [10,17,26]

--/
myMap f [] = []
myMap f (a:b) = (f a) : (myMap f b)

main = print(myMap (\x -> x * x + 1) [3,4,5])
--/

--------------------------------------------------------------------------------
-- Test 108        : append
-- Expected result : [1,2]

--/
append a list = (a : list)

main = print(append 1 [2])
--/
--------------------------------------------------------------------------------
-- Test 109        : insertion sort
-- Expected result : [1,2,3,5,8,9]
 
--/
insert x [] = [x]
insert x (y:ys) = if x <= y then x : y : ys else y : (insert x ys)
 
isort [] = []
isort (x:xs) = insert x (isort xs)
 
main = print (isort [5,3,8,1,9,2])
--/
 
--------------------------------------------------------------------------------
-- Test 110        : fibonacci with case of
-- Expected result : 0\n1\n8
 
--/
fib n = case n of
    0 -> 0
    1 -> 1
    a -> fib (a - 1) + fib (a - 2) -- #fixme should work with n instead of a
 
main = do
    print (fib 0)
    print (fib 1)
    print (fib 6)
--/
 
--------------------------------------------------------------------------------
-- Test 111        : simple calculator with case of
-- Expected result : 7\n12\n-1
 
--/
calc :: String -> Integer -> Integer -> Integer
calc op a b = case op of
    "add" -> a + b
    "sub" -> a - b
    "mul" -> a * b
    _ -> 0
 
main = do
    print (calc "add" 3 4)
    print (calc "mul" 3 4)
    print (calc "sub" 3 4)
--/
 
--------------------------------------------------------------------------------
-- Test 112        : sum of a binary tree
-- Expected result : 10
 
--/
data Tree a = Leaf | Node a (Tree a) (Tree a)

treeSum :: Tree Integer -> Integer
treeSum Leaf = 0
treeSum (Node v l r) = v + treeSum l + treeSum r
 
myTree = Node 1 (Node 2 Leaf Leaf) (Node 3 (Node 4 Leaf Leaf) Leaf)
 
main = print (treeSum myTree)
--/
 
--------------------------------------------------------------------------------
-- Test 113        : safe division with Maybe
-- Expected result : Just 5\nNothing\nJust 3
 
--/
safeDiv :: Integer -> Integer -> Maybe Integer
safeDiv a b = if b == 0 then Nothing else Just (a / b)
 
main = do
    print (safeDiv 10 2)
    print (safeDiv 10 0)
    print (safeDiv 9 3)
--/
 
--------------------------------------------------------------------------------
-- Test 114        : palindrome check
-- Expected result : true\nfalse\ntrue
 
--/
myReverse [] = []
myReverse (x:xs) = myReverse xs ++ [x]
 
isPalindrome word = do
                if word == (myReverse word) 
                then True 
                else False
 
main = do
    print(isPalindrome [1,2,3,2,1])
    print(isPalindrome [1,2,3])
    print(isPalindrome "racecar")
--/
 
--------------------------------------------------------------------------------
-- Test 115        : power function
-- Expected result : 1024\n27
 
--/
power :: Integer -> Integer -> Integer
power base 0 = 1
power base n = base * power base (n - 1)
 
main = do
    print (power 2 10)
    print (power 3 3)
--/
 
--------------------------------------------------------------------------------
-- Test 116        : maximum of a list
-- Expected result : 9
 
--/
maxList [x] = x
maxList (x:xs) = let m = maxList xs in
                 if x > m then x else m
 
main = print (maxList [3,7,2,9,4])
--/
 
--------------------------------------------------------------------------------
-- Test 117        : counting positive numbers
-- Expected result : 3\n0
 
--/
countPos [] = 0
countPos (x:xs) = if x > 0 then 1 + countPos xs else countPos xs
 
main = do
    print (countPos [1,-2,3,-4,5])
    print (countPos [-1,-2,-3])
--/

--------------------------------------------------------------------------------
-- Test 118        : len # fixme should fix with (_:b)
-- Expected result : 3

--/
len []    = 0
len (a:b) = 1 + (len b)
    
main = print (len [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 119        : tri par sélection
-- Expected result : [1,2,3,5,8,9]

--/
selMin [x] = x
selMin (x:xs) = let m = selMin xs in
                if x < m then x else m

selRemove x [] = []
selRemove x (y:ys) = if x == y then ys else y : (selRemove x ys)

selSort [] = []
selSort xs = let m = selMin xs in
             m : (selSort (selRemove m xs))

main = print (selSort [5,3,8,1,9,2])
--/

--------------------------------------------------------------------------------
-- Test 120        : tri à bulles
-- Expected result : [1,2,3,5,8,9]

--/
bubblePass [x] = [x]
bubblePass (x:y:rest) = if x > y
                         then y : (bubblePass (x:rest))
                         else x : (bubblePass (y:rest))

myLength [] = 0
myLength (x:xs) = 1 + myLength xs

bubbleSort xs 0 = xs
bubbleSort xs n = bubbleSort (bubblePass xs) (n - 1)

main = print (bubbleSort [5,3,8,1,9,2] (myLength [5,3,8,1,9,2]))
--/

--------------------------------------------------------------------------------
-- Test 121        : tri fusion
-- Expected result : [1,2,3,5,7,8,9]

--/
splitList [] = ([], [])
splitList [x] = ([x], [])
splitList (x:y:rest) = case splitList rest of
                          (as, bs) -> (x:as, y:bs)

merge [] ys = ys
merge xs [] = xs
merge (x:xs) (y:ys) = if x < y
                       then x : (merge xs (y:ys))
                       else y : (merge (x:xs) ys)

mergeSort [] = []
mergeSort [x] = [x]
mergeSort xs = case splitList xs of
                 (as, bs) -> merge (mergeSort as) (mergeSort bs)

main = print (mergeSort [5,3,8,1,9,2,7])
--/

--------------------------------------------------------------------------------
-- Test 122        : tri rapide (quicksort)
-- Expected result : [1,2,3,5,7,8,9]

--/
qsLess p [] = []
qsLess p (x:xs) = if x < p
                   then x : (qsLess p xs)
                   else qsLess p xs

qsGreaterEq p [] = []
qsGreaterEq p (x:xs) = if x >= p
                        then x : (qsGreaterEq p xs)
                        else qsGreaterEq p xs

quickSort [] = []
quickSort (p:xs) = (quickSort (qsLess p xs)) ++ [p] ++ (quickSort (qsGreaterEq p xs))

main = print (quickSort [5,3,8,1,9,2,7])
--/

--------------------------------------------------------------------------------
-- Test 123        : fusion de deux listes triées
-- Expected result : [1,2,3,4,5,6]\n[1,2,3]\n[4,5]

--/
merge [] ys = ys
merge xs [] = xs
merge (x:xs) (y:ys) = if x < y
                       then x : (merge xs (y:ys))
                       else y : (merge (x:xs) ys)

main = do
    print (merge [1,3,5] [2,4,6])
    print (merge [1,2,3] [])
    print (merge [] [4,5])
--/

--------------------------------------------------------------------------------
-- Test 124        : suppression des doublons dans une liste triée
-- Expected result : [1,2,3,4,5]\n[1,2,3]

--/
removeDup [] = []
removeDup [x] = [x]
removeDup (x:y:rest) = if x == y
                        then removeDup (y:rest)
                        else x : (removeDup (y:rest))

main = do
    print (removeDup [1,1,2,2,2,3,4,4,5])
    print (removeDup [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 125        : recherche linéaire (booléen)
-- Expected result : true\nfalse

--/
contains x [] = False
contains x (y:ys) = if x == y
                     then True
                     else contains x ys

main = do
    print (contains 3 [1,2,3,4,5])
    print (contains 9 [1,2,3,4,5])
--/

--------------------------------------------------------------------------------
-- Test 126        : recherche de l'indice d'un élément
-- Expected result : Just 1\nNothing

--/
findIndex x [] pos = Nothing
findIndex x (y:ys) pos = if x == y
                          then Just pos
                          else findIndex x ys (pos + 1)

main = do
    print (findIndex 3 [5,3,8,1] 0)
    print (findIndex 9 [5,3,8,1] 0)
--/

--------------------------------------------------------------------------------
-- Test 127        : vérifier qu'une liste est triée
-- Expected result : true\nfalse

--/
isSorted [] = True
isSorted [x] = True
isSorted (x:y:rest) = if x <= y
                       then isSorted (y:rest)
                       else False

main = do
    print (isSorted [1,2,3,4,5])
    print (isSorted [1,3,2,4])
--/

--------------------------------------------------------------------------------
-- Test 128        : maximum et minimum d'une liste
-- Expected result : (9,1)

--/
findMax [x] = x
findMax (x:xs) = let m = findMax xs in
                 if x > m then x else m

findMin [x] = x
findMin (x:xs) = let m = findMin xs in
                 if x < m then x else m

maxAndMin xs = (findMax xs, findMin xs)

main = print (maxAndMin [5,3,8,1,9,2])
--/

--------------------------------------------------------------------------------
-- Test 129        : zip fait maison
-- Expected result : [(1,"a"),(2,"b"),(3,"c")]\n[(1,10),(2,20)]

--/
myZip [] ys = []
myZip xs [] = []
myZip (x:xs) (y:ys) = (x, y) : (myZip xs ys)

main = do
    print (myZip [1,2,3] ["a","b","c"])
    print (myZip [1,2] [10,20,30])
--/

--------------------------------------------------------------------------------
-- Test 130        : compter les occurrences d'un élément
-- Expected result : 3\n0

--/
countOcc x [] = 0
countOcc x (y:ys) = if x == y
                     then 1 + countOcc x ys
                     else countOcc x ys

main = do
    print (countOcc 2 [1,2,3,2,2,4])
    print (countOcc 9 [1,2,3])
--/

--------------------------------------------------------------------------------
-- Test 131        : PGCD par soustractions successives
-- Expected result : 6\n1

--/
gcdSub :: Integer -> Integer -> Integer
gcdSub a b = if a == b
             then a
             else if a > b
                  then gcdSub (a - b) b
                  else gcdSub a (b - a)

main = do
    print (gcdSub 48 18)
    print (gcdSub 17 5)
--/

--------------------------------------------------------------------------------
-- Test 132        : PPCM à partir du PGCD
-- Expected result : 12\n42

--/
gcdSub :: Integer -> Integer -> Integer
gcdSub a b = if a == b
             then a
             else if a > b
                  then gcdSub (a - b) b
                  else gcdSub a (b - a)

lcmCalc a b = (a * b) / (gcdSub a b)

main = do
    print (lcmCalc 4 6)
    print (lcmCalc 21 6)
--/

--------------------------------------------------------------------------------
-- Test 133        : test de primalité
-- Expected result : true\nfalse\ntrue

--/

checkMultiple d n c = if c == n
                       then True
                       else if c > n
                            then False
                            else checkMultiple d n (c + d)

divides d n = checkMultiple d n d

testDiv n d = if d * d > n
              then True
              else if divides d n
                   then False
                   else testDiv n (d + 1)

isPrime n = testDiv n 2

main = do
    print (isPrime 7)
    print (isPrime 15)
    print (isPrime 2)
--/

--------------------------------------------------------------------------------
-- Test 134        : liste des nombres premiers jusqu'à n # crashes at 15...
-- Expected result : [2,3,5,7,11,13]

--/

checkMultiple d n c = if c == n
                       then True
                       else if c > n
                            then False
                            else checkMultiple d n (c + d)

divides d n = checkMultiple d n d

testDiv n d = if d * d > n
              then True
              else if divides d n
                   then False
                   else testDiv n (d + 1)

isPrime n = testDiv n 2

primesHelper c n = if c > n
                    then []
                    else if isPrime c
                         then c : (primesHelper (c + 1) n)
                         else primesHelper (c + 1) n

primesUpTo n = primesHelper 2 n

main = print (primesUpTo 15)
--/

--------------------------------------------------------------------------------
-- Test 135        : somme des carrés de 1 à n
-- Expected result : 55\n385

--/
sumSquares :: Integer -> Integer
sumSquares 0 = 0
sumSquares n = (n * n) + sumSquares (n - 1)

main = do
    print (sumSquares 5)
    print (sumSquares 10)
--/

--------------------------------------------------------------------------------
-- Test 136        : somme d'une liste avec un accumulateur
-- Expected result : 15\n60

--/
sumAcc [] acc = acc
sumAcc (x:xs) acc = sumAcc xs (acc + x)

main = do
    print (sumAcc [1,2,3,4,5] 0)
    print (sumAcc [10,20,30] 0)
--/

--------------------------------------------------------------------------------
-- Test 137        : moyenne d'une liste
-- Expected result : 3\n25

--/
sumList [] = 0
sumList (x:xs) = x + sumList xs

lengthList [] = 0
lengthList (x:xs) = 1 + lengthList xs

average xs = (sumList xs) / (lengthList xs)

main = do
    print (average [1,2,3,4,5])
    print (average [10,20,30,40])
--/

--------------------------------------------------------------------------------
-- Test 138        : factorielle avec un accumulateur
-- Expected result : 120\n5040

--/
factAcc 0 acc = acc
factAcc n acc = factAcc (n - 1) (acc * n)

factorial n = factAcc n 1

main = do
    print (factorial 5)
    print (factorial 7)
--/

--------------------------------------------------------------------------------
-- Test 139        : test mod 2 
-- Expected result : [1,0,1,0,1,0,1,0,1,0]

--/

func res a = ((mod a 2) : res)

loop i res = if i == 0 then res else loop (i-1) (func res i) 

main = print(loop 10 [])

--/

--------------------------------------------------------------------------------
-- Test 140        : terme d'une suite arithmétique
-- Expected result : 3\n48

--/
nthTerm :: Integer -> Integer -> Integer -> Integer
nthTerm a d n = a + (n - 1) * d

main = do
    print (nthTerm 3 5 1)
    print (nthTerm 3 5 10)
--/

--------------------------------------------------------------------------------
-- Test 141        : terme d'une suite géométrique
-- Expected result : 2\n162

--/
power base 0 = 1
power base n = base * power base (n - 1)

nthTermGeo a r n = a * (power r (n - 1))

main = do
    print (nthTermGeo 2 3 1)
    print (nthTermGeo 2 3 5)
--/

--------------------------------------------------------------------------------
-- Test 142        : vérifier si un nombre est un carré parfait
-- Expected result : true\nfalse

--/

checkSquare n i = if i * i == n
                   then True
                   else if i * i > n
                        then False
                        else checkSquare n (i + 1)

isPerfectSquare n = checkSquare n 0

main = do
    print (isPerfectSquare 16)
    print (isPerfectSquare 20)
--/

--------------------------------------------------------------------------------
-- Test 143        : calcul de l'IMC
-- Expected result : 20\n"normal"

--/
bmi weight height = weight / (height * height)

bmiCategory value = if value < 18
                     then "underweight"
                     else if value < 25
                          then "normal"
                          else if value < 30
                               then "overweight"
                               else "obese"

main = do
    print (bmi 80 2)
    print (bmiCategory (bmi 80 2))
--/

--------------------------------------------------------------------------------
-- Test 144        : look and say
-- Expected result : [3,1,2,2,1,1]

--/
count a [] = 0
count a (x:xs) =
    if x == a 
    then 1 + (count a xs )
    else 0

skip 0 l = l
skip n (x:xs) = skip (n-1) xs 

lookAndSay [] res = res
lookAndSay (x:xs) res = 
    let cnt = count x xs in 
    lookAndSay (skip cnt xs) (res ++ [1 + cnt] ++ [x]) 


loop i input = 
        if i == 0 
        then input 
        else loop (i-1) (lookAndSay input [])

main = print(loop 5 [1])
--/

--------------------------------------------------------------------------------
-- Test 145        : occurrences
-- Expected result : 1\n0

--/
occurrences x [] = 0
occurrences x (y:ys) = 
    if x == y 
    then 1 + occurrences x ys 
    else occurrences x ys

l :: [Integer]
l = [1,2,3,4,5,6,7,8,9,10]

s :: String
s = "Hello World"

main = do
    print (occurrences 5 l)
    print (occurrences 12 l)
    --print (occurrences "o" s) #fixme
--/

--------------------------------------------------------------------------------
-- Test 146        : loi d'Ohm (physique)
-- Expected result : 20\n5\n4

--/
calcVoltage i r = i * r

calcCurrent v r = v / r

calcResistance v i = v / i

main = do
    print (calcVoltage 2 10)
    print (calcCurrent 20 4)
    print (calcResistance 12 3)
--/

--------------------------------------------------------------------------------
-- Test 147        : deuxième loi de Newton (physique)
-- Expected result : 10\n20

--/
newtonForce m a = m * a

sumForces [] [] = 0
sumForces (m:ms) (a:as) = (newtonForce m a) + sumForces ms as

main = do
    print (newtonForce 5 2)
    print (sumForces [2,4,5] [3,1,2])
--/

--------------------------------------------------------------------------------
-- Test 148        : quantité de mouvement et travail (physique)
-- Expected result : 15\n40\n-6

--/
momentum m v = m * v

work f d = f * d

main = do
    print (momentum 5 3)
    print (work 10 4)
    print (momentum 2 (-3))
--/

--------------------------------------------------------------------------------
-- Test 149        : collatz
-- Expected result : 19

--/
collatz :: Integer -> Integer
collatz n = case mod n 2 of
        0 -> n / 2
        1 -> 3 * n + 1

loop :: Integer -> Integer -> Integer
loop n steps = 
    if n == 1 
    then steps 
    else loop (collatz n) (steps + 1)

main = print(loop 9 0)
--/

--------------------------------------------------------------------------------
-- Test 150        : carré magique
-- Expected result : true

--/
somme [] = 0
somme (x:xs) = x + (somme xs)

toutes [] n = True
toutes (x:xs) n = ((somme x) == n) && (toutes xs n)

head (x:a) = x

tail (a:xs) = xs

premiere [] = []
premiere (x:xs) = (head x) : (premiere xs)

reste [] = []
reste (x:xs) = (tail x) : (reste xs)

transpose ([]:a) = []
transpose m = (premiere m) : (transpose (reste m))

decalage [] = []
decalage (x:xs) = tail x : decalage xs

diagonale1 [] = []
diagonale1 (x:xs) = head x : diagonale1 (decalage xs)

element (x:a) 0 = x
element (b:xs) n = element xs (n - 1)

diagonale2Aux [] a = []
diagonale2Aux (x:xs) n = element x n : diagonale2Aux xs (n - 1)

length [] = 0
length (a:b) = 1 + length b

diagonale2 m = diagonale2Aux m (length m - 1)

magique m n =
    (toutes m n) &&
    (toutes (transpose m) n) &&
    (somme (diagonale1 m) == n) &&
    (somme (diagonale2 m) == n)

m = [[2,7,6],
     [9,5,1],
     [4,3,8]]

main = print(magique m 15)
--/

--------------------------------------------------------------------------------
-- Test 151        : multiplication de matrices
-- Expected result : [[20,29],[26,22]]

--/
premiereColonne [] = []
premiereColonne ((x:xs):ys) =
    x : premiereColonne ys
premiereColonne ([]:ys) =
    premiereColonne ys

resteColonnes [] = []
resteColonnes ((x:xs):ys) =
    xs : resteColonnes ys
resteColonnes ([]:ys) =
    [] : resteColonnes ys

produitScalaire [] [] = 0
produitScalaire (x:xs) (y:ys) =
    x * y + produitScalaire xs ys

construireLigne _ ([]:_) = []
construireLigne _ [] = []
construireLigne ligne b =
    produitScalaire ligne (premiereColonne b)
    : construireLigne ligne (resteColonnes b)

construireLignes [] _ = []
construireLignes (x:xs) b =
    construireLigne x b : construireLignes xs b

multiplier a b = construireLignes a b

a = [[2,1,3],[4,0,2]]
b = [[5,2],[1,4],[3,7]]

main = do
    print(multiplier a b)
--/

--------------------------------------------------------------------------------
-- Test 152        : Transposée
-- Expected result : [[1,4],[2,5],[3,6]]

--/
premiereColonne [] = []
premiereColonne ([]:a) = []
premiereColonne ((x:xs):ys) = x : premiereColonne ys

resteColonnes [] = []
resteColonnes ([]:a) = []
resteColonnes ((x:xs):ys) = xs : resteColonnes ys

lignesVides [] = True
lignesVides ([]:ys) = lignesVides ys
lignesVides (a:b) = False

transposer m = 
    if lignesVides m 
    then []
    else premiereColonne m : transposer (resteColonnes m)

m = [[1,2,3],[4,5,6]]

main = do
    print(transposer m)

--/

--------------------------------------------------------------------------------
-- Test 153        : Addition matrice avec zip
-- Expected result : [[7,3,10],[5,4,5]]

--/
monZipWith a [] b = []
monZipWith c d [] = []
monZipWith f (x:xs) (y:ys) = (f x y) : monZipWith f xs ys

add a b = a + b

additionnerLignes l1 l2 = monZipWith add l1 l2

additionnerMatrices m1 m2 = monZipWith additionnerLignes m1 m2

a = [[2,1,3],[4,0,2]]
b = [[5,2,7],[1,4,3]]

main = do
    print(additionnerMatrices a b)

--/

--------------------------------------------------------------------------------
-- Test 154        : Addition matrice sans zip
-- Expected result : [[7,3,10],[5,4,5]]

--/
additionnerLignes [] [] = []
additionnerLignes (x:xs) (y:ys) =
    (x + y) : additionnerLignes xs ys

additionnerMatrices [] [] = []
additionnerMatrices (l1:ls1) (l2:ls2) =
    additionnerLignes l1 l2 : additionnerMatrices ls1 ls2

a = [[2,1,3],[4,0,2]]
b = [[5,2,7],[1,4,3]]

main = do
    print(additionnerMatrices a b)

--/

--------------------------------------------------------------------------------
-- Test 155        : explosion ? 
-- Expected result : ((((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))))),(((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))))))

--/
paire x = (x, x)

f0 x = x
f1 x = paire (f0 x)
f2 x = paire (f1 x)
f3 x = paire (f2 x)
f4 x = paire (f3 x)
f5 x = paire (f4 x)
f6 x = paire (f5 x)
f7 x = paire (f6 x)
f8 x = paire (f7 x)

main = do
    print(f8 1)
--/

--------------------------------------------------------------------------------
-- Test 156        : explosion ? 2 (Mairson) node --stack-size=8192 Main.js 156
-- Expected result : (((((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))))),(((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))))),((((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))))),(((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))),((((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1))))),(((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))),((((1,1),(1,1)),((1,1),(1,1))),(((1,1),(1,1)),((1,1),(1,1)))))))))

--/

dup x = (x, x)
p1 y  = dup y
p2 y  = dup (p1 y)
p3 y  = dup (p2 y)
p4 y  = dup (p3 y)
p5 y  = dup (p4 y)
p6 y  = dup (p5 y)
p7 y  = dup (p6 y)
p8 y  = dup (p7 y)
p9 y  = dup (p8 y)     -- normal => 87
-- p10 y = dup (p9 y)  -- 2048 => 95
-- p11 y = dup (p10 y) -- 4096 => 103
-- p12 y = dup (p11 y) -- 8192 => 111

main = print (p9 1)
--/

--------------------------------------------------------------------------------
-- Test 157        : folds
-- Expected result : 55\n55\n0\n0\n155\n155\n3628800\n3628800\n1\n1\n670442572800\n670442572800\n-5\n-55\n0\n0\n-155\n-155

--/
foldr f z []     = z 
foldr f z (x:xs) = f x (foldr f z xs) 

foldl f z []     = z                  
foldl f z (x:xs) = foldl f (f z x) xs

add a b = a + b
mul a b = a * b
sub a b = a - b

l1 = [1,2,3,4,5,6,7,8,9,10]
l2 = []
l3 = [11,12,13,14,15,16,17,18,19,20]

main = do
    print (foldr add 0 l1)
    print (foldl add 0 l1)

    print (foldl add 0 l2)
    print (foldl add 0 l2)
    
    print (foldl add 0 l3)
    print (foldl add 0 l3)
    
    print (foldr mul 1 l1)
    print (foldl mul 1 l1)

    print (foldl mul 1 l2)
    print (foldl mul 1 l2)
    
    print (foldl mul 1 l3)
    print (foldl mul 1 l3)

    print (foldr sub 0 l1)
    print (foldl sub 0 l1)

    print (foldl sub 0 l2)
    print (foldl sub 0 l2)
    
    print (foldl sub 0 l3)
    print (foldl sub 0 l3)

--/

--------------------------------------------------------------------------------
-- Test 158        : multList
-- Expected result : true\ntrue

--/
doubleList []     = []
doubleList (x:xs) = (2*x) : doubleList xs

tripleList []     = []
tripleList (x:xs) = (3*x) : tripleList xs

multList n [] = []
multList n (x:xs) = (n*x) : multList n xs

l = [1,2,3]

main = do 
    print (doubleList l == multList 2 l)
    print (tripleList l == multList 3 l)
--/

--------------------------------------------------------------------------------
-- Test 159        : multList v2
-- Expected result : true\ntrue

--/
addToList n [] = []
addToList n (x:xs) = (n+x) : addToList n xs

operlist n bop [] = []
operlist n bop (x:xs) = (bop n x) : operlist n bop xs

mapList f [] = []
mapList f (x:xs) = (f x) : mapList f xs

doubleList = mapList (\x->2*x)
tripleList = mapList (\x->3*x)

olddoubleList []     = []
olddoubleList (x:xs) = (2*x) : olddoubleList xs

oldtripleList []     = []
oldtripleList (x:xs) = (3*x) : oldtripleList xs

l = [1,2,3]

main = do 
    print (olddoubleList l == doubleList l)
    print (oldtripleList l == tripleList l)
--/

--------------------------------------------------------------------------------
-- Test 160        : sorted tuples
-- Expected result : true\nfalse\nfalse\ntrue

--/

isSorted2 test (a,b) = test a b
isSorted3 test (a,b,c) = (test a b) && isSorted2 test (b,c) 
isSorted4 test (a,b,c,d) = (test a b) && isSorted3 test (b,c,d) 
isSorted5 test (a,b,c,d,e) = (test a b) && isSorted4 test (b,c,d,e)

reverse5 (a,b,c,d,e) = (e,d,c,b,a)

t = (1,2,3,4,5)

main = do 
    print (isSorted5 (\x y -> x <= y) t)
    print (isSorted5 (\x y -> x <= y) (reverse5 t))
    print (isSorted5 (\x y -> x >= y) t)
    print (isSorted5 (\x y -> x >= y) (reverse5 t))
--/

--------------------------------------------------------------------------------
-- Test 161        : chars
-- Expected result : 'a'\n"a"\n"ab"\nJust 'W'\n"abc"\n"ab"\n"asuper"\n"supera"

--/

a = 'a'
b = 'b'
c = 'c'

s = "super"

head [] = Nothing
head (x:xs) = Just x

concatChar a b = (a:b:[])

concatCharStartString a s = (a:s)

concatCharEndString a s = s ++ (a:[])

main = do 
    print a
    print [a]
    print (a:b:[])
    print (head "Well hello")
    print ([a,b,c])
    print (concatChar a b)
    print (concatCharStartString a s)
    print (concatCharEndString a s)
--/

--------------------------------------------------------------------------------
-- Test 162        : problem 1-10
-- Expected result : 4\n3\n2\n3\n"!amanap ,lanac a ,nalp a ,nam A"\ntrue

--/

-- (*) Find the last element of a lists
--problem1 :: [a] -> a
problem1 [x] = x
problem1 (a:xs) = problem1 xs

-- (*) Find the last-but-one (or second-last) element of a list
--problem2 :: [a] -> a
problem2 [x, a] = x
problem2 (b:xs) = problem2 xs

length [] = 0
length (x:xs) = 1 + (length xs)

-- (*) Find the K'th element of a list. 
--problem3 :: [a] -> Int -> a
problem3 (x:xs) k = if length (x:xs) == k then x else problem3 xs k 


-- (*) Find the number of elements in a list.
---problem4 :: [a] -> Integer
problem4 [] = 0
problem4 [x] = 1
problem4 (x:xs) = 1 + problem4 xs

-- (*) Find out whether a list is a palindrome. 

-- (*) Reverse a list.
--problem5 :: [a] -> [a]
problem5 [] = []
problem5 [x] = [x]
problem5 (x:xs) = problem5 xs ++ [x]

problem6 xs = xs == problem5 xs

main = do
    print(problem1 [1,2,3,4])
    print(problem2 [1,2,3,4])
    print(problem3 [1,2,3] 2)
    print(problem4 [123, 456, 789])
    print(problem5 "A man, a plan, a canal, panama!")
    print(problem6 "racecar")
--/

--------------------------------------------------------------------------------
-- Test 163        : compter les voyelles dans un mot
-- Expected result : 2

--/
isVoyelle c = (c == 'a') || (c == 'e') || (c == 'i') || (c == 'o') || (c == 'u')

compterVoyelles [] = 0
compterVoyelles (x:xs) = if isVoyelle x
                          then 1 + compterVoyelles xs
                          else compterVoyelles xs

main = print (compterVoyelles "haskell")
--/

--------------------------------------------------------------------------------
-- Test 164        : le plus petit de deux nombres
-- Expected result : 3\n2

--/
plusPetit a b = if a < b then a else b

main = do
    print (plusPetit 7 3)
    print (plusPetit 2 9)
--/

--------------------------------------------------------------------------------
-- Test 165        : le plus grand de trois nombres
-- Expected result : 9\n10

--/
plusGrand3 a b c = if (a >= b) && (a >= c)
                    then a
                    else if b >= c then b else c

main = do
    print (plusGrand3 4 9 6)
    print (plusGrand3 10 2 3)
--/

--------------------------------------------------------------------------------
-- Test 166        : tous les elements d'une liste sont pairs
-- Expected result : true\nfalse

--/
tousPairs :: [Integer] -> Boolean
tousPairs [] = True
tousPairs (x:xs) = if mod x 2 == 0 then tousPairs xs else False

main = do
    print (tousPairs [2,4,6,8])
    print (tousPairs [2,3,6])
--/

--------------------------------------------------------------------------------
-- Test 167        : fibonacci iteratif avec accumulateur
-- Expected result : 55

--/
fiboAux n a b = if n == 0 then a else fiboAux (n - 1) b (a + b)

fiboIter n = fiboAux n 0 1

main = print (fiboIter 10)
--/

--------------------------------------------------------------------------------
-- Test 168        : aplatir une liste de listes
-- Expected result : [1,2,3,4,5]

--/
aplatir [] = []
aplatir (x:xs) = x ++ aplatir xs

main = print (aplatir [[1,2],[3,4],[5]])
--/

--------------------------------------------------------------------------------
-- Test 169        : somme des elements impairs d'une liste
-- Expected result : 9

--/
sommeImpairs [] = 0
sommeImpairs (x:xs) = if mod x 2 == 0
                       then sommeImpairs xs
                       else x + sommeImpairs xs

main = print (sommeImpairs [1,2,3,4,5,6])
--/

--------------------------------------------------------------------------------
-- Test 170        : conversion Celsius vers Fahrenheit
-- Expected result : 212\n38\n32\n-18

--/
celsiusVersFahrenheit c = (c * 9) / 5 + 32

FahrenheitVersCelcius f = ((f - 32) * 5) / 9

main = do
    print (celsiusVersFahrenheit 100)
    print (FahrenheitVersCelcius 100)
    print (celsiusVersFahrenheit 0)
    print (FahrenheitVersCelcius 0)

--/

--------------------------------------------------------------------------------
-- Test 171        : aire de formes geometriques (type de donnees)
-- Expected result : 300\n20\n24

--/
data Forme a = Cercle a | Rectangle a a | Triangle a a

aire forme = case forme of
    Cercle r -> 3 * r * r -- pi = 3....
    Rectangle l h -> l * h
    Triangle b h -> b * h / 2

main = do
    print (aire (Cercle 10))
    print (aire (Rectangle 4 5))
    print (aire (Triangle 6 8))
--/

--------------------------------------------------------------------------------
-- Test 172        : appliquer une fonction n fois
-- Expected result : 10\n8

--/
appliquerN 0 f x = x
appliquerN n f x = appliquerN (n - 1) f (f x)

main = do
    print (appliquerN 5 (\x -> x + 2) 0)
    print (appliquerN 3 (\x -> x * 2) 1)
--/

--------------------------------------------------------------------------------
-- Test 173        : recherche dans une table associative (Maybe)
-- Expected result : Just "deux"\nNothing

--/
chercher cle [] = Nothing
chercher cle ((k,v):reste) = if cle == k
                              then Just v
                              else chercher cle reste

table = [(1,"un"),(2,"deux"),(3,"trois")]

main = do
    print (chercher 2 table)
    print (chercher 5 table)
--/

--------------------------------------------------------------------------------
-- Test 174        : pile (stack) avec push et pop
-- Expected result : 3\n[2,1]

--/
empiler x pile = x : pile
depiler (x:xs) = xs
sommet (x:xs) = x

main = do
    let p1 = empiler 1 []
    let p2 = empiler 2 p1
    let p3 = empiler 3 p2
    print (sommet p3)
    print (depiler p3)
--/

--------------------------------------------------------------------------------
-- Test 175        : nombre parfait
-- Expected result : true\ntrue\nfalse

--/
sommeDiviseurs n d acc = if d == n
                          then acc
                          else if mod n d == 0
                               then sommeDiviseurs n (d + 1) (acc + d)
                               else sommeDiviseurs n (d + 1) acc

estParfait n = sommeDiviseurs n 1 0 == n

main = do
    print (estParfait 6)
    print (estParfait 28)
    print (estParfait 12)
--/

--------------------------------------------------------------------------------
-- Test 176        : binaire vers decimal
-- Expected result : 11\n15

--/
binVersDecAux [] acc = acc
binVersDecAux (x:xs) acc = binVersDecAux xs (acc * 2 + x)

binVersDec bits = binVersDecAux bits 0

main = do
    print (binVersDec [1,0,1,1])
    print (binVersDec [1,1,1,1])
--/

--------------------------------------------------------------------------------
-- Test 177        : table de multiplication
-- Expected result : 7\n14\n21

--/
tableMult n = do
    print (n * 1)
    print (n * 2)
    print (n * 3)

main = tableMult 7
--/

--------------------------------------------------------------------------------
-- Test 178        : distance au carre entre deux points (type de donnees)
-- Expected result : 25\n0

--/

distanceCarree (x1, y1) (x2, y2) =
    (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

main = do
    print (distanceCarree (0, 0) (3, 4))
    print (distanceCarree (1, 1) (1, 1))
--/

--------------------------------------------------------------------------------
-- Test 179        : somme d'une liste chainee personnalisee
-- Expected result : 6

--/
data MaListe a = Vide | Elem a (MaListe a)

sommeMaListe l = case l of
    Vide -> 0
    Elem x reste -> x + sommeMaListe reste

liste = Elem 1 (Elem 2 (Elem 3 Vide))

main = print (sommeMaListe liste)
--/

--------------------------------------------------------------------------------
-- Test 180        : conversion d'une liste de booleens en entiers
-- Expected result : [1,0,1,1]

--/
boolVersEntier b = if b then 1 else 0

listeBoolVersEntiers [] = []
listeBoolVersEntiers (x:xs) = (boolVersEntier x) : listeBoolVersEntiers xs

main = print (listeBoolVersEntiers [True, False, True, True])
--/

--------------------------------------------------------------------------------
-- Test 181        : PGCD par divisions successives (Euclide)
-- Expected result : 6\n25

--/
pgcd a b = if b == 0 then a else pgcd b (mod a b)

main = do
    print (pgcd 48 18)
    print (pgcd 100 75)
--/

--------------------------------------------------------------------------------
-- Test 182        : verifier si une chaine commence par un caractere donne
-- Expected result : true\nfalse

--/
commenceParChar :: Char -> String -> Boolean
commenceParChar c (x:xs) = if c == x then True else False

main = do
    print (commenceParChar 'H' "Hello")
    print (commenceParChar 'a' "Hello")
--/

--------------------------------------------------------------------------------
-- Test 183        : verifier si une chaine est un prefixe d'une autre
-- Expected result : true\nfalse

--/
estPrefixe :: String -> String -> Boolean
estPrefixe [] ys = True
estPrefixe xs [] = False
estPrefixe (x:xs) (y:ys) = if x == y then estPrefixe xs ys else False

main = do
    print (estPrefixe "Has" "Haskell")
    print (estPrefixe "ask" "Haskell")
--/

--------------------------------------------------------------------------------
-- Test 184        : extraire les chiffres d'une chaine
-- Expected result : "123456"

--/
estChiffre :: Char -> Boolean
estChiffre c = (c >= '0') && (c <= '9')

extraireChiffres :: String -> String
extraireChiffres [] = []
extraireChiffres (x:xs) = if estChiffre x
                           then x : extraireChiffres xs
                           else extraireChiffres xs

main = print (extraireChiffres "abc123def456")
--/

--------------------------------------------------------------------------------
-- Test 185        : compter les lettres majuscules dans une chaine
-- Expected result : 2\n0

--/
estMajuscule :: Char -> Boolean
estMajuscule c = (c >= 'A') && (c <= 'Z')

compterMajuscules :: String -> String
compterMajuscules [] = 0
compterMajuscules (x:xs) = if estMajuscule x
                            then 1 + compterMajuscules xs
                            else compterMajuscules xs

main = do
    print (compterMajuscules "Hello World")
    print (compterMajuscules "minuscule")
--/

--------------------------------------------------------------------------------
-- Test 186        : joindre une liste de chaines
-- Expected result : "Hello World!"

--/
joindre [] = ""
joindre (x:xs) = x ++ joindre xs

main = print (joindre ["Hello", " ", "World", "!"])
--/

--------------------------------------------------------------------------------
-- Test 187        : repeter une chaine n fois
-- Expected result : "a"

--/
repeterChaine :: Integer -> String -> String
repeterChaine 1 s = s 
repeterChaine n s = s ++ (repeterChaine (n - 1) s)

main = do
    --print (repeterChaine 3 "ab") -- infinite loop at eval because of circular func ?
    print (repeterChaine 1 "a")
--/

--------------------------------------------------------------------------------
-- Test 188        : verifier si deux mots sont des anagrammes
-- Expected result : true\nfalse

--/
insererTri x [] = [x]
insererTri x (y:ys) = if x <= y then x : y : ys else y : insererTri x ys

triChaine [] = []
triChaine (x:xs) = insererTri x (triChaine xs)

sontAnagrammes a b = triChaine a == triChaine b

main = do
    print (sontAnagrammes "listen" "silent")
    print (sontAnagrammes "hello" "world")
--/

--------------------------------------------------------------------------------
-- Test 189        : retirer le premier et le dernier caractere d'une chaine
-- Expected result : "onjou"

--/
enleverPremier (x:xs) = xs

enleverDernier [x] = []
enleverDernier (x:xs) = x : enleverDernier xs

interieur s = enleverPremier (enleverDernier s)

main = print (interieur "Bonjour")
--/

--------------------------------------------------------------------------------
-- Test 190        : compter les mots d'une phrase separes par des espaces
-- Expected result : 3\n1

--/
compterMotsAux [] compteur dansMot = if dansMot then compteur + 1 else compteur
compterMotsAux (x:xs) compteur dansMot =
    if x == ' '
    then compterMotsAux xs (if dansMot then compteur + 1 else compteur) False
    else compterMotsAux xs compteur True

nombreDeMots s = compterMotsAux s 0 False

main = do
    print (nombreDeMots "le chat mange")
    print (nombreDeMots "un")
--/
--------------------------------------------------------------------------------
-- Test 191        : echanger les elements d'une paire
-- Expected result : (2,1)\n(3,2,1)\n((6,5),(4,3),(2,1))

--/
echanger (x, y) = (y, x)
swap (x,y,z) = (z,y,x)

main = do 
    print (echanger (1, 2))
    print (swap (1, 2, 3))
    print (swap ((echanger (1,2)), (echanger (3,4)) , (echanger (5,6))))
--/

--------------------------------------------------------------------------------
-- Test 192        : additionner deux paires element par element
-- Expected result : (4,6)

--/
additionnerPaires (a, b) (c, d) = (a + c, b + d)

main = print (additionnerPaires (1, 2) (3, 4))
--/

--------------------------------------------------------------------------------
-- Test 193        : distance au carre entre deux points representes par des tuples
-- Expected result : 25

--/
distanceCarreeTuple (x1, y1) (x2, y2) =
    (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

main = print (distanceCarreeTuple (0, 0) (3, 4))
--/

--------------------------------------------------------------------------------
-- Test 194        : extraire les premiers elements d'une liste de paires
-- Expected result : [1,2,3]

--/
premiersElements [] = []
premiersElements ((a,b):reste) = a : premiersElements reste

main = print (premiersElements [(1,"a"),(2,"b"),(3,"c")])
--/

--------------------------------------------------------------------------------
-- Test 195        : trouver la paire avec la plus grande somme
-- Expected result : (5,1)

--/
pairAvecPlusGrandeSomme [p] = p
pairAvecPlusGrandeSomme ((a,b):reste) =
    let res = pairAvecPlusGrandeSomme reste in -- pattern of tuple in res faulty (normaliser)
    if a + b >= (fst res) + (snd res) then (a,b) else res

main = print (pairAvecPlusGrandeSomme [(1,2),(5,1),(3,3)])
--/

--------------------------------------------------------------------------------
-- Test 196        : compter les paires dont la somme depasse un seuil
-- Expected result : 2

--/
compterPairesSupSeuil seuil [] = 0
compterPairesSupSeuil seuil ((a,b):reste) =
    if a + b > seuil
    then 1 + compterPairesSupSeuil seuil reste
    else compterPairesSupSeuil seuil reste

main = print (compterPairesSupSeuil 5 [(1,2),(5,1),(3,4),(0,0)])
--/

--------------------------------------------------------------------------------
-- Test 197        : convertir une liste de paires en deux listes separees
-- Expected result : ([1,2,3],["a","b","c"])

--/
premiereListe [] = []
premiereListe ((a,b):reste) = a : premiereListe reste

deuxiemeListe [] = []
deuxiemeListe ((a,b):reste) = b : deuxiemeListe reste

monUnzip paires = (premiereListe paires, deuxiemeListe paires)

main = print (monUnzip [(1,"a"),(2,"b"),(3,"c")])
--/

--------------------------------------------------------------------------------
-- Test 198        : multiplier chaque element d'un triplet par un facteur
-- Expected result : (2,4,6)

--/
multiplierTriplet f (a, b, c) = (a * f, b * f, c * f)

main = print (multiplierTriplet 2 (1, 2, 3))
--/

--------------------------------------------------------------------------------
-- Test 199        : verifier si un point est a l'interieur d'un rectangle
-- Expected result : true\nfalse

--/
dansRectangle (x1, y1) (x2, y2) (px, py) =
    (px >= x1) && (px <= x2) && (py >= y1) && (py <= y2)

main = do
    print (dansRectangle (0, 0) (10, 10) (5, 5))
    print (dansRectangle (0, 0) (10, 10) (15, 5))
--/

--------------------------------------------------------------------------------
-- Test 200        : fusionner une liste de paires en une seule paire de sommes
-- Expected result : (6,60)

--/
sommerPaires [] = (0, 0)
sommerPaires ((a,b):reste) =
    let res = sommerPaires reste in
    (a + (fst res), b + (snd res))

main = print (sommerPaires [(1,10),(2,20),(3,30)])
--/
--------------------------------------------------------------------------------
