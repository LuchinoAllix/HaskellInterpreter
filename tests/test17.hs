cardColour :: String -> String
cardColour suit =
  case suit of
    "hearts" -> "red"
    "diamonds" -> "red"
    "spades" -> "black"
    "clubs" -> "black"
    _ -> "I am not familiar with this card suit."

-- https://haskell.hpmeducation.com/defining-functions-working-with-functions/conditionals/case-of-statements