const clone = require("lodash.clonedeep");

import { Num } from "./number"
import { Value } from "./value"
import { err, Module, Module2, primitive as prim, range } from "./utils"

interface SymEnv {
    preserve_str?: boolean,
}

// Symbol creation.
// r: Rank of function
// fn: Function being run (the 'symbol')
// a: Monadic input
// b: Dyadic input, optional
// OVERRIDE: Overrides symbol rank, for use by the '@' operator
// Returns a value
// Utilizes Value.ranked and Value.unranked to operate on some arbitrary rank
function sym(this: SymEnv, r: number | [number, number], fn: Module, a: Value, b?: Value, OVERRIDE?: number | [number, number]): Value {
    let rank: [number, number];
    if (OVERRIDE) r = OVERRIDE;
    if (typeof r == "number") rank = [r, r];
    else rank = r;

    this.preserve_str ??= false;

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

        let mstr = left_is_mapper ? a.is_str() : b.is_str();
        let vstr = left_is_mapper ? b.is_str() : a.is_str();
        mapper = mapper.map((val, i) => {
            let args: [Value, Value] = [
                mstr && this.preserve_str ? val.make_str() : val,
                vstr && this.preserve_str ? value[i]!.make_str() : value[i]!,
            ];
            if (!left_is_mapper) args = args.reverse() as [Value, Value];
            return fn(args[0], args[1]);
        });
        return left_is_mapper ? Value.unranked(a.get_dims(), left_rank, mapper, is_rawl)
                              : Value.unranked(b.get_dims(), right_rank, mapper, is_rawr);
    } else {
        // Monadic call
        let temp;
        let is_raw = (temp = a.as_list(), temp.length > 0 && temp[0] instanceof Num);

        let left_rank = a.get_rank().slice(0, Math.max(0, a.get_dims() - rank[0] - 1));
        let left = a.ranked(rank[0]);
        left = left.map(val => fn(a.is_str() && this.preserve_str ? val.make_str() : val));
        return Value.unranked(a.get_dims(), left_rank, left, is_raw);
    }
}


export function mod(r: number, fn: Module, r2: number | [number, number], fn2: Module2, pstrm: boolean = false, pstrd: boolean = false): Module {
    let monad = sym.bind({ preserve_str: pstrm }, r, fn);
    let dyad  = sym.bind({ preserve_str: pstrd }, r2, fn2 as Module);

    return (a, b?, override?) => b ? dyad(a, b, override) : monad(a, undefined, override);
}

function mod_todo(symbol: string): Module {
    return mod(0, _ => err(-1, `TODO: Monad ${module}.`), 0, (_a, _b) => err(-1, `TODO: Dyad ${symbol}.`));
}

interface SymbolMap {
    [key: string]: Module
}

export const Symbols: SymbolMap = {
    // Abs (0) / Add (0, 0)
    "+": mod(0, a => a.map_num(n => n.abs()), 0, (a, b) => {
        let sum = a.map_num(l => l.add(b.as_num()));
        return b.is_str() ? sum.as_str() : sum;
    }, false, true),
    // TODO / GCD (0, 0)
    "+.": mod_todo("+."),
    // Double (0) / Abs Add (0, 0)
    "+:": mod(0, a => a.map_num(n => n.mul(Num.from(2))), 0, (a, b) => a.map_num(n => n.add(b.as_num()).abs()), true, true),
    // Negate (0) / Subtract (0, 0)
    "-": mod(0, a => a.map_num(n => n.neg()), 0, (a, b) => {
        let sub = a.map_num(n => n.sub(b.as_num()));
        return b.is_str() ? sub.as_str() : sub;
    }, false, true),
    // Signum | Case [strings] (0) / Multiply (0, 0)
    "*": mod(0, a => {
        if (a.is_str()) {
            let char = String.fromCharCode(+a.as_num());
            let lower = char.toLowerCase(), upper = char.toUpperCase();
            return prim(lower == upper ? 0 : char == lower ? -1 : 1);
        } else {
            return prim(Math.sign(+a.as_num()));
        }
    }, 0, (a, b) => a.map_num(n => n.mul(b.as_num())), true),
    // Reciprocal (0) / Divide (0, 0)
    "%": mod(0, a => a.map_num(n => Num.from(1).div(n)), 0, (a, b) => a.map_num(n => n.div(b.as_num()))),
    // Box (99) / Less Than (0, 0)
    "<": mod(99, a => Value.new_box(a), 0, (a, b) => err(-1, "TODO: Dyad '<'.")),
    // Unbox (99) / Greater Than (0, 0)
    ">": mod(0, a => a.boxed() ? a.unbox() : a, 0, (a, b) => err(-1, "TODO: Dyad '>'."), true),
    // Exponent (0) / Power (0, 0)
    "^": mod_todo("^"),
    // Shape (99) / Reshape (1, 99)
    "$": mod(99, a => prim(a.get_rank()), [1, 99], (a, b) => {
        let rank = a.as_list();
        if (rank[0] instanceof Value) err(4, "Rank must be list of literal numbers.");
        return b.with_rank((rank as Num[]).map(a => +a));
    }),
    // Identity (99) / Left (99, 99)
    "[": mod(99, a => a, 99, (a, _) => a, true, true),
    // Identity (99) / Right (99, 99)
    "]": mod(99, a => a, 99, (_, b) => b, true, true),
    // Transpose (2) / Equality (0, 0)
    "=": mod(2, a => {
        let dims = a.get_dims();
        if (dims == 1) return a.with_rank([1, a.get_rank()[0]!]);
        let rank = a.get_rank();
        [rank[0], rank[1]] = [rank[1]!, rank[0]!];
        if ((rank[0]! == 1) != (rank[1]! == 1)) {
            return a.with_rank(rank);
        }

        let rows = a.ranked(1).map(x => x.as_list());
        return Value.new_ls(rows[0]!.flatMap((_, i) => rows.map(x => x[i]!)) as Value[] | Num[], dims, rank, a.is_str());
    }, 0, (a, b) => err(-1, "TODO: Dyad '='."), true),
    // 1-Range (0) / Index (99, 99)
    "~": mod(0, a => {
        let n = +a.as_num();
        if (a.is_str()) return range(n < 97 ? 65 : 97, n + 1).as_str();
        return range(1, n + 1);
    }, 99, (a, b) => {
        let index = (b.boxed() ? Value.maybe_num(b.as_list()[0]!) : b).as_list().map(n => +n.as_num());

        if (a.get_dims() < index.length) err(4, `Index ${""+index} does not exist.`);
        let rank = a.get_rank();
        let i = 0, prefix = 0;
        for (let j = 0; j < index.length; j++) {
            i += index[j]! * (prefix || 1);
            prefix += rank[j]!;
        }

        // FIXME: This is very impractical for very large amounts of data
        // I probably won't fix this
        let list = a.ranked(a.get_dims() - index.length);
        return list[i] ?? err(4, `Index ${""+index} does not exist.`);
    }, true),
    // Flatten [Ravel] (99) / Concatenate (1, 1)
    ",": mod(99, a => {
        let flat = prim(a.as_list());
        return a.is_str() ? flat.as_str() : flat;
    }, 1, (a, b) => {
        let concat = prim([...a.as_list(), ...b.as_list()]);
        return a.is_str() && b.is_str() ? concat.as_str() : concat;
    }, true, true),
};

