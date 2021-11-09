# Comparisons
Comparisons between `ayr` and a few other languages

## Raze boxed list
|  Language  |   Program  | Notes |
|:----------:|:----------:|:-----:|
|    ayr     | ```,``` |   Works for arbitrary depth   |
|    APL     | ```(⊃,/)⍣≡``` |   Works for arbitrary depth. Without `⍣≡`, it doesn't   |
|     J      | ```;``` |   Doesn't work for arbitrary depth |
|   Haskell  | ```concat``` | Doesn't work for arbitrary depth |

## Sum rows of matrix, then get the product of those sums
|  Language  |   Program  | Notes |
|:----------:|:----------:|:-----:|
|    ayr     | ```*/+/``` | |
|    APL     | ```×/+/``` | |
|     J      | ```*/+/"1``` | J's reduce operates on the data as a whole, instead of rank 1 by default |
|   Haskell  | ```foldr (*) 1 . map (foldr (+) 0)``` | |

## Check if parens are balanced
| Language | Programs | Notes |
|:--------:|:--------:|:-----:|
|    ayr   | ```((=/+/)^.(</>&~."))'()'=\``` | `:((\|+/)^.1=>)(+/1 _1*)"'()'=\:` |
|    APL   | ```((=/+/)∧(</⊃⍤⍸⍤1))'()'∘.=⊢``` | ```{((=/+/)∧'('=1⌷⍵/⍨∨⌿)'()'∘.=⍵}``` |

## Generate N rows of Pascal's triangle
| Language | Programs | Notes |
|:--------:|:--------:|:-----:|
|    ayr   | ```!\`~``` | ```:;1,1,"!&:~"~``` |
|    APL   | ```⍉(∘.!⍨⍳)``` ||

## Matrix multiplication
| Language | Programs | Notes |
|:--------:|:--------:|:-----:|
|    ayr   |```,.\=```|```+/&*\=```|
|    APL   |```+.×``` |```∘.(+/⍤×)⍥↓∘⍉```|
|     K    |```+/'*\:```|     |
|     J    |```+/ .*```|```+/@:*"$```|
