# ayr
A toy array language. For the specs see [here](specs/README.md)

## Installation
```
npm i -g ayr-lang
```

## Usage
Once installed, run
```
ayr help
```
to get a list of commands.

## TODO
Current todo list for myself
- [ ] More symbols + binders
    * Stencil/cut (`;.`)
    * Mix (`;:`)
    * Keys (`?`)
    * Fixpoint (`$:`)
    * Roll/Deal (`?.`)
    * Under (maybe)
    * Filter (`$`)
    * Uniq/Union (`$.`)
    * Reduce First (`/.`)
    * Fold First (```\.````)
    * Without (`?:`)
    * Sieve builtin
- [x] Implement missing symbols + binders
    * ```=```
    * ```~.```
    * ```~:```
    * ```,:```
    * ```/:```
    * ```\:```
    * ```&:```
    * monadic `@`
    * dyadic `>.` and `<.`
- [x] Higher rank data supported
- [x] Change rank of `/` and `\` to be major rank - 1, similar to `#`
- [x] Support more literal num types
- [x] Make sure strings are supported properly
- [x] Implement variable assignment
- [ ] (Maybe) implement block syntax `{{ x + y }}`
- [x] Syntactic elements to trains
    * ``` (`: f) ``` ==> ```( (f)` )```
    * ```([: f g)``` ==> ```( (f) (g) )```
    * ```(]: f g)``` ==> ```( (f) & (g) )```
- [x] More binders
    * Before
    * Inner product
- [x] Good boolean logic support
    * AND   ^.
    * OR    v.
    * NOT   |
    * XOR   =.
    * NOR   <.
    * NAND  >.
