# Specs of ayr
What follows is an in-depth look at the specs of the `ayr` array language, so any individual can gain knowledge of how the language works.

## Table of Contents
* [Array model](#array-model)
* [Basic syntax](#basic-syntax)
* [User functions](#user-functions)
* [Trains](#trains)
* [Symbols](#symbols)
* [Binders](#binders)
* [Library builtins](#library-builtins)

## Array Model
`ayr` uses the based array model, similar to [BQN](https://github.com/mlochbaum/BQN/blob/master/doc/based.md). Values can be scalars, vectors, matrices, etc. These correspond to rank 0, 1, and 2 data respectively. 
<br>*Note: higher rank data will be supported in the future*

### Example Code
```
    <2 3 6
[ 2 3 6 ]
    1
1
    1 2 3 ; _4 5 11
 1  2  3
_4  5 11
```

## Basic syntax
General types come in the form of signed floats and strings, which may or may not be scalar values. A vector, similar to **APL**, is denoted with a series of these general values separated by spaces. To create a matrix, you can currently use `;` to separate vectors or grouping (`()`) similar to how APL generally does it.

Incomplete operations within groups **or** assigned to a variable are called [Trains](#trains). Binders are left-assosciative, while symbols are right-assosciative.

ayr also supports block syntax, which can take one or two variables. The right variable is `y`, and the left is `x`. For example:
```
    {{ 3 * y }} 4
12
```
These can be used in any place any other symbol or group could also be used.

### Data Types
#### Numbers
Numbers are the basis of an array language. `ayr` supports an array of numeric literals, and will support more in the future.
<br>In short, the rules can be summarized by this regex:
```re
((?:_?\d*)?r_?\d+)|^(__|(?:_?\d*\.?\d*)?e?_?\d*\.?\d+|_)
```
`_` represents a negative sign. Literal floats and scientific notation are supported. For example,
```
    e2
100
    _3.76
_3.76
```
`ayr` also supports rational literals, such as `5r4` (`5/4`) and `r3` (`1/3`)

#### Strings
Furthermore, ayr supports strings, albeit in a form nearly indistinguishable from numbers. For example, `'hello world' + 3` will print a string where each character is offset from 3 by the string `hello world`. Character matrices and higher rank data is also supported. To display a string in numeric form, you can use the `+` prefix.

#### Ranked Data
Data in general within ayr, like other array languages, is in the form of arrays. For instance, strings are just arrays of numbers. Every array has rank; that is, the shape of the array. For example, an array of rank `3 2` would look like this:
```
0 0 0
0 0 0
```
As an array gains dimensions, these are represented by a new number being appended to the rank, representing the depth in that dimension. This array has `3` rows and `2` columns. An array that contains two `3 2` arrays would have the shape `3 2 2`, and so on.<br>
These could also be referred to as **axes**: the first axes is the newest dimension; in this case being the *columns*. A one dimensional array's first axes would be its *row*.

### Symbols and Binders
A symbol refers to a built in ascii symbol that denotes a monadic/dyadic operation. A binder refers to a symbol that monadically and/or dyadically takes a symbol and does something with them. For example, take the `+` (add) symbol, `-` (subtract/negate) symbol, `>` (first) symbol, and the `&` (atop) binder:

```
    1 2 + 3
4 5
    > 1 2 3
1
    1 2 3 -&+ 4 5 6
_5 _7 _9
```

### Control Flow
Basic control flow can be achieved in ayr through the use of `:`. In general,
```
COND : IF
ELSE
```
is equivalent to JS'
```
if (COND) { IF }
else { ELSE }
```

## User Functions
User functions refer to, as the name implies, functions defined by the user. For instance,
```
    add: +
    4 add 5
9
```
They are defined with the syntax `<name> : <expression>`. These can be constant values, incomplete trains, blocks, etc.

## Trains
There are two types of trains: partial trains and J-style trains. First the default, J-style:<br>
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

Furthermore, there are currently 3 tokens used in J-style trains that have special meaning:
```
([: f g)         -> f & g
(]: f g)         -> f &: g
(`: f)           -> f`
```

Partial trains are also present in `ayr`, and are usable by prefixing a train with `:`. For example:
```
(: f g h) A      -> f g h A
A (: f g h) B    -> f g A h B
```
Partial trains, of course, support constants within them too.

## Symbols
|  Symbol  |   Monadic  | Rank |    Dyadic    |  Rank | Notes |
|:--------:|:----------:|:----:|:------------:|:-----:|:-----:|
|  ```+``` |     Abs    |   0  |      Add     |  0 0  |Str(m): converts to nums|
| ```+.``` |    TODO    | TODO |      GCD     |  0 0  |       |
| ```+:``` |   Double   |   0  |   Abs Add    |  0 0  |       |
|  ```-``` |   Negate   |   0  |   Subtract   |  0 0  |Str(m): swaps case|
| ```-.``` |  Permute   |  99  | Unintersect  | 99 99 |       |
| ```-:``` |   Halve    |   0  |  Abs Diff    |  0 0  |       |
|  ```*``` |   Signum   |   0  |   Multiply   |  0 0  |Str(m): case sig (`1 _1 0 = *'Ab '`)|
| ```*.``` |   Factors  |   0  |      LCM     |  0 0  |       |
| ```*:``` |   Square   |   0  |   N * \|N\|  |  0 0  |       |
|  ```%``` | Reciprocal |   0  |    Divide    |  0 0  |       |
| ```%.``` |    TODO    | TODO |     TODO     |  TODO |       |
| ```%:``` |  Square Rt |   0  |   Nth Root   |  0 0  |       |
|   `\|`   | Boolean Not|   0  |    Residue   |  0 0  |       |
|  `\|.`   |   Reverse  |   1  |    Rotate    |  0 1  |       |
|  `\|:`   |   Descend  |   0  |     Axes     |  1 99 |       |
|  ```!``` |  Factorial |   0  |   Binomial   |  0 0  |       |
|  ```<``` |    Cover   |  99  |   Less Than  |  0 0  |       |
| ```<.``` | Sort Ascending | 1 |     Nor     |  0 0  |       |
| ```<:``` |  Grade Up  |   1  |    Less/Eq   |  0 0  |       |
|  ```>``` |   Uncover  |  99  | Greater Than |  0 0  |       |
| ```>.``` | Sort Descending | 1 |    Nand    |  0 0  |       |
| ```>:``` | Grade Down |   1  |  Greater/Eq  |  0 0  |       |
|  ```^``` |     Exp    |   0  |      Pow     |  0 0  |       |
| ```^.``` | Up Reverse |  99  |      And     |  0 0  |       |
| ```^:``` |  Ceiling   |   0  |     Max      |  0 0  |Str(m): uppercase|
|  ```$``` |    Shape   |  99  |    Reshape   | 99 99 |       |
|  ```[``` |  Identity  |  99  |     Left     | 99 99 |       |
| ```[.``` | Nudge Left |   1  |    Couple    | 99 99 |       |
|  ```]``` |  Identity  |  99  |     Right    | 99 99 |       |
| ```].``` |    Nudge   |   1  |  Couple Back | 99 99 |       |
|  ```?``` | Dedup Sieve|  99  |     Group    | 99 1  |       |
| ```?.``` |     Roll   |   0  |     Deal     |  1 99 |       |
| ```?:``` |   Shuffle  |   1  |    Without   | 99 99 |m: ```[#(:,^./^./&,&~:\)```|
|  ```=``` | Transpose  |   2  |   Equality   |  0 0  |       |
| ```=.``` |  All Equal |  99  |     Xor      |  0 0  |       |
| ```=:``` |    Eval    |  99  |     Match    | 99 99 |       |
|  ```~``` |  One-Range |   0  |     Index    | 99 99 |Str(m): alphabet upto arg|
| ```~.``` |   Indices  |  99  | Interval Ind |  0 1  |       |
| ```~:``` |   Unique   |  99  |   Unequality |  0 0  |       |
|  ```,``` |   Ravel    |  99  |  Concatenate |  1 1  |       |
| ```,.``` | Determinant|   2  |  Dot Product |  1 1  |       |
| ```,:``` |   Enlist   |  99  |  Membership  | 99 99 |```1 = 'a' ,: 'hola'```|
|  ```;``` |   Mold     |   1  |   Laminate   | 99 99 |       |
| ```;:``` |   Squish   |  99  |    Group     |  99 1 |0s denote new group|
|  ```#``` |    Tally   |  99  |   Replicate  |  99 1 |       |
| ```#.``` | Decode Binary | 0 |    Decode    |  0 0  |       |
| ```#:``` | Encode Binary | 0 |    Encode    |  1 0  |       |
| ```{```  |  Increment |   0  |     Take     | 99 99 |       |
| ```{:``` |     Head   |  99  |   Composite  |  2 1  |       |
| ```{.``` |  Catalogue |   1  |     Union    |  1 1  |       |
| ```}```  |  Decrement |   0  |     Drop     | 99 99 |       |
| ```}:``` |     Tail   |  99  |     Count    | 99 99 |       |
| ``` `.```|    Format  |   0  |     Format   |  0 99 |       |
| ```B:``` | Encode Binary+| 0 |    Encode+   |  1 0  |       |
| ```E.``` |     N/A    | N/A  |    Match     | 99 99 |       |
| ```I.``` |   0-range  |   0  |Wrapping Index| 99 99 |       |
| ```i.``` |  Unindices |   1  | CTX Unindices|  99 1 |(d) case takes orig shape of data on left|
| ```i:``` |  Identity  |   0  |   Index Of   | 99 99 |By items|
| ```K.``` |    Keys    |  99  |    Group+    |  99 1 |m: ```⊢∘⊂⌸```, d: ```#$.&?```|
| ```v.``` |  Nth Prime |   0  |      Or      |  0 0  |       |
| ```v:``` |   Floor    |   0  |     Min      |  0 0  |Str(m): lowercase|

Monadic `B:` is equivalent to ```:;(-`"&:(^:/)#")&.((],`0#[)")#:``` when >r0 data is passed.<br>
Dyadic `B:` is equivalent to ```#:=``` when >r0 data is passed on the right.

## Binders
|  Binder |   Usage   | Monadic | Rank | Dyadic | Rank |        Notes       |
|:-------:|:---------:|:-------:|:----:|:------:|:----:|:------------------:|
| ```"``` |  ```u"``` |   Each  |   0  |  Each  |  0 0 |                    |
| ```".```| ```u".v```|  Repeat |  99  | Repeat | 99 99|                    |
| ```":```| ```u":``` |    Tie  |  99  |   Tie  | 99 99|                    |
| ```&``` | ```u&v``` | Compose |  N/A |  Atop  |  N/A | Binds if immediate |
| ```&.```| ```u&.v```|  Before |  N/A | Before |  N/A | Binds if immediate |
| ```&:```| ```u&:v```|   Hook  |  N/A |  Hook  |  N/A | Binds if immediate |
| ``` ` ```| ```u` ```| Commute |  N/A |  Flip  |  N/A | ```u&`v``` is ```v&u``` |
| ```/``` |  ```u/``` |  Reduce |   1  | N-wise Reduce | 0 1 |              |
| ```/:```| ```u/:``` | Diagonals | 2 | Each left | 99 99 |                 |
| ```/.```| ```u/.``` | Reduce First| 99|Sort Up|99 99 |                    |
| ```\``` |  ```u\``` |   Scan  |   1  |  Table |  1 1 |                    |
| ```\:```| ```u\:``` | Antidiagonals | 2 | Each right | 99 99 |            |
| ```\.```| ```u\.``` | Suffixes|   1  |Sort Down|99 99|                    |
| ```@``` | ```u@v``` | Compose |  N/A |  Over  |  N/A | Rank if right arg is immediate |
| ```@:```| ```u@:``` | Zip Self|  N/A |   Zip  | 99 99| Allows uneven args |
| ```@.```| ```u@.v```|    At   |  99  |    At  | 99 99| Depth if right arg is immediate |
| ```}.```| ```u}.``` |   Runs  |  99  |  Amend |  TODO|                    |
| ```;.```| ```u;.y```|   Cut   |  99  |   N/A  |  N/A |                    |
| ```$:```| ```u$:``` | Fixpoint|  99  |Repeat(n)| 0 99| d: takes left arg, not operand |
| ```$.```| ```u$.``` |  Filter |  99  | Filter | 99 99| d: pass left arg to each check |

## Library Builtins
    put A   ->    print A
    A put B ->    print B A times
    jn A    ->    join vector of strings A on spaces
    A jn B  ->    join vector of strings B with separator A
    sp A    ->    split vector A on spaces
    A sp B  ->    split vector B on character A
    su A    ->    >. A
    A su B  ->    B~>:A
    sd A    ->    <. A
    A sd B  ->    B~<:A

    I       ->    the input
    V.      ->    all vowels, capitalized
    A.      ->    all letters, capitalized
    C.      ->    all consonants, capitalized
