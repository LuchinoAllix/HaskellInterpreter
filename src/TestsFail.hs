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