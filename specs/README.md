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
`ayr` uses the boxed array model, similar to [APL](https://dyalog.com) and [J](https://jsoftware.com). Values can be scalars, vectors, or matrices. These correspond to rank 0, 1, and 2 data respectively. 
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
General types come in the form of signed floats and strings, which may or may not be scalar values. A vector, similar to **APL**, is denoted with a series of these general values separated by spaces. To create a matrix, you can currently use `;` to separate vectors or grouping (`()`) similar to how APL generally does it.

Incomplete operations within groups **or** assigned to a variable are called [Trains](#trains).

Binders are left-assosciative, while symbols are right-assosciative.

### Examples
```
    13
13
    'hello'
hello
    _4 'hello' ; 1 2
[ -4 ] [ 104 105 ] 
 [ 1 ]       [ 2 ]
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
|  Symbol  |   Monadic  | Rank |    Dyadic    |  Rank |
|:--------:|:----------:|:----:|:------------:|:-----:|
|  ```+``` |     Abs    |   0  |      Add     |  0 0  |
|  ```-``` |   Negate   |   0  |   Subtract   |  0 0  |
|  ```*``` |   Signum   |   0  |   Multiply   |  0 0  |
|  ```%``` | Reciprocal |   0  |    Divide    |  0 0  |
|  ```<``` |    Cover   |  99  |   Less Than  |  0 0  |
|  ```>``` |   Uncover  |  99  | Greater Than |  0 0  |
| ```<:``` |    Floor   |   0  |    Less/Eq   |  0 0  |
| ```>:``` |    Ceil    |   0  |  Greater/Eq  |  0 0  |
|  ```^``` |     Exp    |   0  |      Pow     |  0 0  |
|  ```$``` |    Shape   |  99  |    Reshape   | 99 99 |
|  ```[``` |  Identity  |  99  |     Left     | 99 99 |
|  ```]``` |  Identity  |  99  |     Right    | 99 99 |
|  ```~``` |  One-Range |   0  |     Index    | 0 99  |
| ```<.``` | Sort Ascending | 1 |     TBD     |  TBD  |
| ```>.``` | Sort Descending | 1 |    TBD     |  TBD  |

## Binders
|  Binder |   Usage   | Monadic | Dyadic |        Notes       |
|:-------:|:---------:|:-------:|:------:|:------------------:|
| ```"``` |  ```u"``` |   Each  |  Each  |                    |
| ```&``` | ```u&v``` |  Beside |  Atop  | Binds if immediate |
| ``` ` ``` | ```u` ``` | Commute | Flip |                    |
| ```/``` |  ```u/``` |  Reduce | N-wise Reduce |             |
| ```\``` |  ```u\``` |   Scan  |  Table |                    |

## Library Functions
    put A   ->    print A
    A put B ->    print B A times
