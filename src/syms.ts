const clone = require('lodash.clonedeep');

import { Num } from "./number"
import { Value } from "./value"
import { err } from "./utils"

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
        if (value.length !== mapper.length) {
            if (mapper.length % value.length) err(4);
            else {
                // The # elements might not match, but there is a conceivable/intuitive way
                // The user may expect the values to work. In that case, make sure the program
                // Does work as intended. e.g. 1 2 + 2 2 $ 1 2 3 4, or 5 + 1 2 3.
                let t = Array(mapper.length)
                for (let i = 0; i < mapper.length; i++) t[i] = clone(value[i % value.length]);
                value = t;
            }
        }

        mapper = mapper.map((val, i) => fn(val, value[i]));
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

