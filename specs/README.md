# Specs of ayr
*Todo: Formatting of sections, expand once more things implemented*

What follows is an in-depth look at the specs of the `ayr` array language, so any individual can gain knowledge of how the language works.

## Table of Contents
* [Array model](#array-model)
* [Basic syntax](#basic-syntax)
* [User functions](#user-functions)
* [Trains](#trains)
* [Symbols](#symbols)
* [Binders](#binders)
* [Library functions](#library-functions)

## Array Model
`ayr` uses the based array model, similar to [BQN](https://github.com/mlochbaum/BQN/blob/master/doc/based.md). Values can be scalars, vectors, or matrices. These correspond to rank 0, 1, and 2 data respectively. 
<br>*Note: higher rank data will be supported in the future*

### Examples
```
    <2 3 6
[ 2 3 6 ]
    1
1
    1 2 3 ; _4 5 11
 1  2  3
-4  5 11
```

## Basic syntax
General types come in the form of signed floats and strings, which may or may not be scalar values. A vector, similar to **APL**, is denoted with a series of these general values separated by spaces. To create a matrix, you can currently use `;` to separate vectors or grouping (`()`) similar to how APL generally does it. Note that `;` is not a symbol—rather, it is used solely for matrix denotion

Incomplete operations within groups **or** assigned to a variable are called [Trains](#trains).

Binders are left-assosciative, while symbols are right-assosciative.

### Examples
```
    13
13
    'hello'
hello
    _4 'hello' ; 1 2
[ -4 ] [ hello ] 
 [ 1 ]     [ 2 ]
```
*The way output is stylized is implementation dependant*

A symbol refers to a built in ascii symbol that denotes a monadic/dyadic operation. A binder refers to a symbol that monadically and/or dyadically takes a symbol on does something with them. For example, take the `+` (add) symbol, `-` (subtract/negate) symbol, `>` (first) symbol, and the `&` (atop) binder

### Examples
```
    1 2 + 3
4 5
    > 1 2 3
1
    1 2 3 -&+ 4 5 6
-5 -7 -9
```

## User Functions
User functions refer to, as the name implies, functions defined by the user. For instance,
```
    add: +
    4 add 5
9
```
They are defined with the syntax `<name> : <expression>`

## Trains
*Key: lowercase letters represent symbols and uppercase represent immediates*

```
(f g) A          -> f g A
A (f g) B        -> A f g B
(A f) B          -> A f B
(f g h) A        -> (f A) g h A
A (f g h) B      -> (A f B) g A h B
(f g h i) A      -> f (g A) h i A
..etc
```
Note that this is not an exhaustive list, there may be some edge cases not included.

## Symbols
|  Symbol  |   Monadic  | Rank |    Dyadic    |  Rank | Notes |
|:--------:|:----------:|:----:|:------------:|:-----:|:-----:|
|  ```+``` |     Abs    |   0  |      Add     |  0 0  |Str(m): converts to nums|
|  ```-``` |   Negate   |   0  |   Subtract   |  0 0  |Str(m): swaps case|
|  ```*``` |   Signum   |   0  |   Multiply   |  0 0  |Str(m): case sig (`1 _1 0 = *'Ab '`)|
|  ```%``` | Reciprocal |   0  |    Divide    |  0 0  |       |
|  ```<``` |    Cover   |  99  |   Less Than  |  0 0  |       |
|  ```>``` |   Uncover  |  99  | Greater Than |  0 0  |       |
| ```<:``` |    Floor   |   0  |    Less/Eq   |  0 0  |Str(m): lowercase|
| ```>:``` |    Ceil    |   0  |  Greater/Eq  |  0 0  |Str(m): uppercase|
|  ```^``` |     Exp    |   0  |      Pow     |  0 0  |       |
|  ```$``` |    Shape   |  99  |    Reshape   | 99 99 |       |
|  ```[``` |  Identity  |  99  |     Left     | 99 99 |       |
|  ```]``` |  Identity  |  99  |     Right    | 99 99 |       |
|  ```~``` |  One-Range |   0  |     Index    | 0 99  |Str(m): alphabet upto arg|
| ```<.``` | Sort Ascending | 1 |     TBD     |  TBD  |       |
| ```>.``` | Sort Descending | 1 |    TBD     |  TBD  |       |
|  ```,``` |   Ravel    |  99  |  Concatenate |  1 1  |       |
| ```;:``` |   Mold     |   1  |   Laminate   |  99 1 |       |
|  ```#``` |    Tally   |  99  |   Replicate  |  99 1 |       |
|  ```=``` | Transpose  |   2  |   Equality   |  0 0  |       |
| ```~.``` |   Indices  |  99  | Interval Ind |  0 1  |       |
| ```~:``` |   Unique   |   1  |   Unequality |  0 0  |       |
| ```,:``` |   Enlist   |  99  |  Membership  | 99 99 |```1 = 'a' ,: 'hola'```|
| ```#:``` | Encode Binary | 0 |    Encode    |  1 0  |       |
| ```{```  |  Increment |   0  |     Take     | 99 99 |       |
| ```}```  |  Decrement |   0  |     Drop     | 99 99 |       |
| ```|```  | Boolean Not|   0  |    Residue   |  0 0  |       |

## Binders
|  Binder |   Usage   | Monadic | Rank | Dyadic | Rank |        Notes       |
|:-------:|:---------:|:-------:|:----:|:------:|:----:|:------------------:|
| ```"``` |  ```u"``` |   Each  |   0  |  Each  |  0 0 |                    |
| ```":```| ```u":``` |    Tie  |  99  |   Tie  | 99 99|                    |
| ```&``` | ```u&v``` | Compose |  N/A |  Atop  |  N/A | Binds if immediate |
| ```&:``` | ```u&:v``` | Hook  |  N/A |  Hook  |  N/A | Binds if immediate |
| ```&.``` | ```u&.v``` | Before|  N/A | Before |  N/A | Binds if immediate |
| ``` ` ``` | ```u` ``` |Commute|  N/A |  Flip  |  N/A |                    |
| ```/``` |  ```u/``` |  Reduce |   1  | N-wise Reduce | 0 1 |              |
| ```\``` |  ```u\``` |   Scan  |   1  |  Table |  1 1 |                     |
| ```@``` | ```u@v``` |  TBD    |  TBD |  Over  |  N/A | Binds to both sides if immediate |
| ```/:``` | ```u/:``` | Diagonals | 2 | Each left | 0 99 |                 |
| ```\:``` | ```u\:``` | Antidiagonals | 2 | Each right | 99 0 |            |

## Library Functions
    put A   ->    print A
    A put B ->    print B A times
    A  i  B ->    3 = 1 2 3;4 5 6 i` <0 2
                  ~ of rank 99 99
