--# Tests that are supposed to fail for the haskell interpreter in js

--# Each test must follow the same pattern :
--# 2 dashes and a \  before and after the input and nowhere else.
--# 'Test x : blabla' blabla will be the info of the test, must be on one line.
--# 'Espected crash : ?'  ? will be in which phase the test is expected to fail
--# Phases :
--#   1 : Lexing  
--#   2 : Indentation  
--#   3 : Parsing
--#   4 : Normalizing  
--#   5 : Type checking
--#   6 : Evaluation


--# Tests are processed by makeTests() in Main.js.

--------------------------------------------------------------------------------
-- Test 1         : Calling add with a char and not an integer 
-- Expected crash : 5

--/
main = 1 + "1" 
--/

--------------------------------------------------------------------------------