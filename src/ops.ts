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
    // Each
    "\"": [1, (f: MaybeInstant) => {
        const fn = f.as_module();
        return mod(-1, fn, -1, fn, true, true);
    }],

    // Repeat / Until
    "\".": [2, (l: MaybeInstant, r: MaybeInstant) => {
        const fn = l.as_module();

        // Repeat
        if (r.is_instant()) {
            const counts = r.eval<Value>().to_list().map(n => +n);
            if (counts.length == 1) return mod(
                99, a => { let v = a; for (let i = 0; i < counts[0]!; i++) v = fn(v); return v },
                99, (a, b) => { let v = b; for (let i = 0; i < counts[0]!; i++) v = fn(a, v); return v },
                true, true
            ); else return mod(
                99, a => {
                    let bl = [...Array(counts.length).keys().map(_ => clone(a))];
                    for (let c in counts) for (let i = 0; i < counts[c]!; i++) {
                        bl[c] = fn(bl[c]!);
                    }
                    return Value.unranked(a.get_dims(), [], bl);
                },
                99, (a, b) => {
                    let bl: Value[] = [...Array(counts.length).keys().map(_ => clone(b))];
                    for (let c in counts) for (let i = 0; i < counts[c]!; i++) {
                        bl[c] = fn(a, bl[c]!);
                    }
                    return Value.unranked(a.get_dims(), [], bl);
                }
            );
        }

        // Until
        const cond = r.as_module();
        return mod(99, a => {
            let p, v = a;
            let condition;
            do {
                p = clone(v);
                v = fn(v);
                let t = cond(p, v).to_list();
                condition = t.length == 0 || !+t[0]!.as_num();
            } while (condition);
            return v;
        }, 99, (_a, _b) => err(7), true);
    }],

    // Tie (Each atom)
    "\":": [1, (f: MaybeInstant) => {
        const fn = f.as_module();
        return mod(0, fn, 0, fn, true, true);
    }],

    // Compose / Atop / Bind (inst. arg)
    "&": [2, (l: MaybeInstant, r: MaybeInstant) => {
        if (l.is_instant() && r.is_instant()) err(5, "Cannot bind an instant to an instant.");
        if (l.is_instant()) return (a, b?, o?) => r.eval<Module>()(l.eval<Value>(), b ?? a, o);
        else if (r.is_instant()) return (a, b?, o?) => l.eval<Module>()(b ?? a, r.eval<Value>(), o); 
        return (a, b?, o?) => l.eval<Module>()(r.eval<Module>()(a, b, o))
    }],

    // Hook / Bind default (inst. arg)
    "&:": [2, (l: MaybeInstant, r: MaybeInstant) => {
        if (l.is_instant() && r.is_instant()) err(5, "Cannot bind an instant to an instant.");
        if (l.is_instant()) return (a, b?, o?) => b
            ? r.eval<Module>()(a, b, o) : r.eval<Module>()(l.eval<Value>(), a, o);
        else if (r.is_instant()) return (a, b?, o?) => l.eval<Module>()(a, b ?? r.eval<Value>(), o);
        return (a, b?) => b
            ? l.eval<Module>()(a, r.eval<Module>()(b))
            : l.eval<Module>()(clone(a), r.eval<Module>()(a));
    }],

    // Tie / Commute
    "`": [1, (f: MaybeInstant) => ((a, b?, override?) => {
        return b ? f.as_module()(b, a, override) : f.as_module()(clone(a), a, override);
    }) as Module],
    
    // Fold / N-wise fold
    "/": [1, (f: MaybeInstant) => mod(1, a => {
        if (a.is_single()) return a.as_value();
        const arr = a.to_list();
        const fn = f.as_module();
        let acc = Value.maybe_num(arr[0]!).as_str(a.is_str());
        for (let i = 1; i < arr.length; i++) acc = fn(acc, Value.maybe_num(arr[i]!).as_str(a.is_str()));
        return acc;
    }, [0, 99], (a, b) => {
        if (b.is_single()) return b.as_value();
        let window = Math.floor(+a.as_num());
        let unique = false;
        if (window < 0) {
            unique = true;
            window = -window;
        }

        const arr = b.to_list();
        const fn = f.as_module();
        const jump = unique ? window : 1;

        let cells = Array(Math.floor((arr.length - window) / jump));
        let index;
        for (let i = 0; i <= arr.length - window; i += jump) {
            index = Math.floor(i / jump);
            cells[index] = Value.maybe_num(arr[i]!).as_str(b.is_str());
            for (let j = i + 1; j < i + window; j++) 
                cells[index] = fn(cells[index], Value.maybe_num(clone(arr[j]!)).as_str(b.is_str()));
        }
        return Value.unranked(b.get_dims(), [], cells, arr[0] instanceof Num);
    }, true)],

    // Compose / Over / Rank (inst. arg)
    "@": [2, (l: MaybeInstant, r: MaybeInstant) => {
        if (!r.is_instant()) {
            // Compose / Over
            const lm = l.as_module(), rm = r.as_module();
            return (a: Value, b?: Value, override?: number | [number, number]) => 
                b ? lm(rm(a), rm(b), override) : lm(rm(a), undefined, override);
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
