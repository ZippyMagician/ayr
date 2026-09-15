import { Num } from "./number"
import { Value } from "./value"
import { mod } from "./syms"
import { MaybeInstant } from "./env"
import { err, Module } from "./utils"

const clone = require('lodash.clonedeep');

export type OpMonad = (a: MaybeInstant) => Module;
export type OpDyad = (a: MaybeInstant, b: MaybeInstant) => Module;

type Binder =
    [1, OpMonad] |
    [2, OpDyad];

interface OpsMap {
    [key: string]: Binder
}

export const Operators: OpsMap = {
    // Compose / Atop / Bind (inst. arg)
    "&": [2, (l: MaybeInstant, r: MaybeInstant) => (a, b?) => {
        if (l.is_instant() && r.is_instant()) err(5, "Cannot bind an instant to an instant.");
        if (l.is_instant()) return r.as_module()(l.eval<Value>(), b ?? a);
        else if (r.is_instant()) return l.as_module()(b ?? a, r.eval<Value>()); // b ? l.as_module()(a, r.eval<Value>()) : l.as_module()(r.eval<Value>());
        return b ? l.as_module()(r.as_module()(a, b)) : l.as_module()(r.as_module()(a))
    }],

    // Tie / Commute
    "`": [1, (f: MaybeInstant) => ((a, b?, override?) => {
        return b ? f.as_module()(b, a, override) : f.as_module()(clone(a), a, override);
    }) as Module],
    
    // Fold / N-wise fold
    "/": [1, (f: MaybeInstant) => mod(1, a => {
        if (a.is_single()) return a.as_value();
        let arr = a.as_list().map(Value.maybe_num);
        const fn = f.as_module();
        let acc = arr[0]!;
        for (let i = 1; i < arr.length; i++) acc = fn(acc, arr[i]!);
        return acc;
    }, [0, 99], (a, b) => err(-1, "TODO: Dyadic '/'."), true)],

    // Compose / Over / Rank (inst. arg)
    "@": [2, (l: MaybeInstant, r: MaybeInstant) => {
        if (!r.is_instant()) {
            // Compose / Over
            const lm = l.as_module(), rm = r.as_module();
            return (a: Value, b?: Value) => b ? lm(rm(b), a) : lm(rm(a));
        }
        // Rank
        const rank = r.eval<Value>().as_list().map(n => +n);
        const fn = l.as_module();
        return (a: Value, b?: Value) => {
            const parsed_rank = b
                ? rank.length - 1 ? rank.length == 2 ? rank as [number, number]
                : err(6, "Dyadic call requires either one or two integers as rank.")
                : rank[0]! : rank.length == 1 ? rank[0]!
                : err(6, "Monadic call requires single integer rank.");
            return mod(
                b ? 0 : parsed_rank as number,
                a => fn(a, undefined, parsed_rank),
                parsed_rank, (a, b) => fn(a, b, parsed_rank), true, true
            )(a, b);
        };
    }],
}
