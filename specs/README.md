# Specs of ayr
*Todo: Formatting of sections, expand once more things implemented*

What follows is an in-depth look at the specs of the `ayr` array language, so any individual can gain knowledge of how the language works.

## Table of Contents
* [Array model](#array-model)
* [Basic syntax](#basic-syntax)
* [User functions](#user-functions)
* [Monadic symbols](#monadic-symbols)
* [Dyadic symbols](#dyadic-symbols)
* [Monadic binders](#monadic-binders)
* [Dyadic binders](#dyadic-binders)
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
General types come in the form of signed floats and strings, which may or may not be scalar values. A vector, similar to **APL**, is denoted with a series of these general values separated by spaces. To create a matrix, you can currently use `;` to separate vectors. In the future, grouping (`()`) will accomplish the same thing.

Currently, strings are outputted as a vector of numbers. In the future, they will displayed as an actual string instead

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

A symbol refers to a built in ascii symbol that denotes a monadic/dyadic operation. A binder refers to a symbol that monadically and/or dyadically takes a symbol on does something with them. For example, take the `+` (add) symbol, `-` (subtract/negate) symbol, `>` (first) symbol, and the `.` (compose) binder

### Examples
```
    1 2 + 3
4 5
    > 1 2 3
1
    1 2 3 -.+ 4 5 6
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

## Monadic Symbols
    +   ->   currently unary plus in js, undecided   r0
    -   ->   negate                                  r0
    <   ->   box value                               r99
    >   ->   first                                   r99
    ]   ->   identity                                r99
    [   ->   identity                                r99

## Dyadic Symbols
    +   ->   add            r0
    -   ->   subtract       r0
    <   ->   less than      r0
    >   ->   greater than   r0
    ]   ->   right arg      r99
    [   ->   left arg       r99

## Monadic Binders
TODO

## Dyadic Binders
TODO

## Library Functions
    put A   ->    print A
    A put B ->    print B A times
