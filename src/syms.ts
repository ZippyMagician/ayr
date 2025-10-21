import { Num } from "./number"
import { Value } from "./value"
import { err } from "./utils"

export function sym(r: number | [number, number], fn: (a: Value, b?: Value) => Value, a: Value, b?: Value): Value {
    let rank: [number, number];
    if (typeof r == "number") rank = [r, r];
    else rank = r;

    if (b) {
        // Dyadic call
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
