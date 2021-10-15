# ayr
A toy array language. For the specs see [here](specs/README.md)

## TODO
Current todo list for myself
- [ ] Implement missing symbols + binders
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
    * Residue
    * Grade
    * Stencil/cut
    * Head
    * Tail
    * etc
- [ ] Higher rank data supported
    * Change rank of `/` and `\` to be major rank - 1, similar to `#`
- [ ] Support more literal num types
- [ ] Make sure strings are supported properly
- [ ] Implement variable assignment
- [ ] (Maybe) implement block syntax `{{ x + y }}`
- [ ] Syntactic elements to trains
    * ``` (`: f) ``` ==> ```( (f)` )```
    * ```([: f g)``` ==> ```( (f) (g) )```
    * ```(]: f g)``` ==> ```( (f) & (g) )```
- [ ] More combinators
    * Before