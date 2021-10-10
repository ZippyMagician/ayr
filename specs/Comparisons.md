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