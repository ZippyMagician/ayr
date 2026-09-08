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
    }, [0, 99], (a, b) => err(-1, "TODO: Dyadic '/'."), true)],

    // Compose / Atop
    "&": [2, (l: MaybeInstant, r: MaybeInstant) => (a, b?) =>
        b ? l.as_module()(r.as_module()(a, b)) : l.as_module()(r.as_module()(a))
    ],

    // Compose / Over
    "@": [2, (l: MaybeInstant, r: MaybeInstant) => (a, b?) =>
        r.is_instant() ? (() => {
            // When right argument is an instant, this is the rank operator
            let rank = r.eval<Value>().as_list().map(n => +n);
            let fn = l.as_module();

            if (b) return fn(
                a, b, rank.length - 1 ? rank.length == 2 ? rank as [number, number] : err(6, "Dyadic call requires either one or two itnegers as rank.") : rank[0]!
            );
            else return fn(a, undefined, rank.length == 1 ? rank[0]! : err(6, "Monadic call requires single integer rank."));
        })() : b ? l.as_module()(r.as_module()(b), a) : l.as_module()(r.as_module()(a))
    ]
}
