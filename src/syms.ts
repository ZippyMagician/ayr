const clone = require('lodash.clonedeep');

import { Num } from "./number"
import { Value } from "./value"
import { err } from "./utils"

// TODO:
//   Currently, 1 2 3 + 3 3 $ 1 2 3 4 5 6 7 8 9 throws an ERR[4] (value).
//   In the old ayr.js, this also errors, although an ERR[1] (rank).
//   In J, this code works.
//   Look into expanding possibilities.
export function sym(r: number | [number, number], fn: Module, a: Value, b?: Value): Value {
    let rank: [number, number];
    if (typeof r == "number") rank = [r, r];
    else rank = r;

    if (b) {
        // Dyadic call
        let temp;
        let is_rawl = (temp = a.as_list(), temp.length > 0 && temp[0] instanceof Num);
        let is_rawr = (temp = b.as_list(), temp.length > 0 && temp[0] instanceof Num);

        let left_rank  = a.get_rank().slice(0, Math.max(0, a.get_dims() - rank[0] - 1));
        let right_rank = b.get_rank().slice(0, Math.max(0, b.get_dims() - rank[1] - 1));

        let left  = a.ranked(rank[0]);
        let right = b.ranked(rank[1]);

        let left_is_mapper = left.length >= right.length;
        let [mapper, value] = left_is_mapper ? [left, right] : [right, left];
        if (value.length !== mapper.length && value.length - 1) err(4);

        mapper = value.length - 1 ? mapper.map((val, i) => fn(val, value[i]))
                                  : mapper.map(val => fn(val, clone(value[0])));
        return left_is_mapper ? Value.unranked(a.get_dims(), left_rank, mapper, is_rawl)
                              : Value.unranked(b.get_dims(), right_rank, mapper, is_rawr);
    } else {
        // Monadic call
        let temp;
        let is_raw = (temp = a.as_list(), temp.length > 0 && temp[0] instanceof Num);

        let left_rank = a.get_rank().slice(0, Math.max(0, a.get_dims() - rank[0] - 1));
        let left = a.ranked(rank[0]);
        left = left.map(val => fn(val));
        return Value.unranked(a.get_dims(), left_rank, left, is_raw);
    }

    err(-1, "TODO: syms");
}

type Module = (a: Value, b?: Value) => Value;

export function mod(r: number, fn: (a: Value) => Value, r2: number | [number, number], fn2: (a: Value, b: Value) => Value): Module {
    let monad = sym.bind(false, r, fn);
    let dyad  = sym.bind(false, r2, fn2 as Module);

    return (a: Value, b?: Value): Value => b ? dyad(a, b) : monad(a);
}

