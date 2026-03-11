--# Tests that are supposed to fail for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected crash : ?'  ? will be in which phase the test is expected to fail
--# Phases :
--#   0 : Lexing  
--#   1 : Indentation  
--#   2 : Parsing
--#   3 : Normalizing  
--#   4 : Type checking
--#   5 : Evaluation


--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 1         : calling add with a char and not an integer 
-- Expected crash : 4

--/
main = 1 + "1" 
--/

--------------------------------------------------------------------------------
-- Test 2         : type annotation does not correspond
-- Expected crash : 4

--/
x :: (Integer, Integer)
x = (1, False)
main = print (snd x)
--/

--------------------------------------------------------------------------------
-- Test 3         : main incorrect type annotation
-- Expected crash : 4

--/
main :: Integer
main = do 
    print 3
--/

--------------------------------------------------------------------------------
-- Test 4         : incorrect type in constructor pattern matching
-- Expected crash : 4

--/
a = Just 5
main = print(case a of 
                Nothing -> 0
                Just "5" -> 1)
--/
--------------------------------------------------------------------------------
-- Test 5         : Incorrect type in type annotation of constructor
-- Expected crash : 4

--/
data Either a b = Left a | Right b

listofIntAndBool :: [Either Integer]
listofIntAndBool = [Left 1, Left 2, Right False]

main = case listofIntAndBool of
  [] -> print "[]"
  Left a : rest -> print a  
  Right b : rest -> print b 
--/

--------------------------------------------------------------------------------
-- Test 6         : Incorrect type in type annotation of constructor
-- Expected crash : 4

--/
data Either a b = Left a | Right b

listofIntAndBool :: [Either Integer Boolean]
listofIntAndBool = [Left 1, Left 2, Right False]

main = case listofIntAndBool of
  [] -> print "[]"
  Left a : rest -> print a  
  Right : rest -> print b 
--/

--------------------------------------------------------------------------------
-- Test 7         : Occurs check failure
-- Expected crash : 4

--/
f x = x : x

main = print(f 1)
--/

--------------------------------------------------------------------------------