import { Num } from "./number"
import { Value } from "./value"
import { mod } from "./syms"
import { MaybeInstant } from "./env"
import { err, Module } from "./utils"

export type OpMonad = (a: MaybeInstant) => Module;
export type OpDyad = (a: MaybeInstant, b: MaybeInstant) => Module;

type Binder =
    [1, OpMonad] |
    [2, OpDyad];

interface OpsMap {
    [key: string]: Binder
}

export const Operators: OpsMap = {
    // Fold / N-wise fold
    "/": [1, (f: MaybeInstant) => mod(1, a => {
        if (a.is_single()) return a.as_value();
        let arr = a.as_list().map(Value.maybe_num);
        return arr.slice(1).reduce((a, b) => f.as_module()(a, b), arr[0]!);
    }, 99, (a, b) => err(-1, "TODO: Dyadic '/'."), true)],

    // Compose / Atop
    "&": [2, (l: MaybeInstant, r: MaybeInstant) => (a, b?) => 
        b ? l.as_module()(r.as_module()(a, b)) : l.as_module()(r.as_module()(a))
    ],

    // Compose / Over
    "@": [2, (l: MaybeInstant, r: MaybeInstant) => (a, b?) =>
        b ? l.as_module()(r.as_module()(b), a) : l.as_module()(r.as_module()(a))
    ]
}
