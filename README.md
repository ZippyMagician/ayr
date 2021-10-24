# ayr
A toy array language. For the specs see [here](specs/README.md)

## TODO
Current todo list for myself
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
- [ ] Design and implement more symbols
    * Stencil/cut
    * Mix (inverse of Mold)
    * etc
- [ ] Higher rank data supported
- [x] Change rank of `/` and `\` to be major rank - 1, similar to `#`
- [x] Support more literal num types
- [x] Make sure strings are supported properly
- [ ] Implement variable assignment
- [ ] (Maybe) implement block syntax `{{ x + y }}`
- [ ] Syntactic elements to trains
    * ``` (`: f) ``` ==> ```( (f)` )```
    * ```([: f g)``` ==> ```( (f) (g) )```
    * ```(]: f g)``` ==> ```( (f) & (g) )```
- [ ] More binders
    * Before
    * Inner product
- [ ] Good boolean logic support
    * AND   ^.
    * OR    v.
    * NOT   |
    * XOR   =.
    * NOR   <.
    * NAND  >.