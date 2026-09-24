const clone = require("lodash.clonedeep");

import { ayrfn } from "./eval"
import { Num } from "./number"
import { Value } from "./value"
import { equal, err, INTERNAL, Module, Module2, ord, pad_rank, primitive as prim, range } from "./utils"

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
    // Negative rank represents leading axis
    if (rank[0] < 0) rank[0] = a.get_dims() - 1;
    if (rank[1] < 0) rank[1] = (b ?? a).get_dims() - 1;

    if (b) {
        // Dyadic call
        let temp;
        let is_rawl = (temp = a.as_list(), temp.length > 0 && temp[0] instanceof Num);
        let is_rawr = (temp = b.as_list(), temp.length > 0 && temp[0] instanceof Num);

        let left_rank = a.get_rank().slice(rank[0]);
        let right_rank = b.get_rank().slice(rank[1]);

        let left = a.ranked(rank[0]);
        let right = b.ranked(rank[1]);

        let left_is_mapper = left.length >= right.length;
        let [mapper, value] = left_is_mapper ? [left, right] : [right, left];
        if (value.length !== mapper.length) {
            if (mapper.length % value.length) err(6, "Operand ranks are not compatible.");
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
                mstr && this.preserve_str ? val.as_str() : val,
                vstr && this.preserve_str ? value[i]!.as_str() : (value[i] ?? (left_is_mapper ? b : a)),
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

        let left_rank = a.get_rank().slice(rank[0]);
        let left = a.ranked(rank[0]);
        left = left.map(val => fn(a.is_str() && this.preserve_str ? val.make_str() : val));
        return Value.unranked(a.get_dims(), left_rank, left, is_raw);
    }
}


export function mod(r: number, fn: Module, r2: number | [number, number], fn2: Module2, pstrm: boolean = false, pstrd: boolean = false): Module {
    let monad = sym.bind({ preserve_str: pstrm }, r, fn);
    let dyad = sym.bind({ preserve_str: pstrd }, r2, fn2 as Module);

    return (a, b?, override?) => b ? dyad(a, b, override) : monad(a, undefined, override);
}

function mod_todo(symbol: string): Module {
    return mod(0, _ => err(-1, `TODO: Monad ${module}.`), 0, (_a, _b) => err(-1, `TODO: Dyad ${symbol}.`));
}

// Implemented with ayr code
function mod_ayr(monad: string, dyad: string) {
    const m = ayrfn(monad);
    const d = ayrfn(dyad);
    return (a: Value, b?: Value, override?: number | [number, number]) => b ? m(a, undefined, override) : d(a, b, override);
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
    "+:": mod(0, a => a.map_num(n => n.muli(2)), 0, (a, b) => a.map_num(n => n.add(b.as_num()).abs()), true, true),
    // Negate | Swap case [strings] (0) / Subtract (0, 0)
    "-": mod(0, a => {
        if (a.is_str()) {
            const n = +a.as_num();
            return prim(n > 96 && n < 123 ? n - 32 : n > 64 && n < 91 ? n + 32 : n).as_str();
        } else return a.map_num(n => n.neg());
    }, 0, (a, b) => {
        let sub = a.map_num(n => n.sub(b.as_num()));
        return b.is_str() ? sub.as_str() : sub;
    }, false, true),
    // Signum | Identify case [strings] (0) / Multiply (0, 0)
    "*": mod(0, a => {
        if (a.is_str()) {
            let char = String.fromCharCode(+a.as_num());
            let lower = char.toLowerCase(), upper = char.toUpperCase();
            return prim(lower == upper ? 0 : char == lower ? -1 : 1);
        } return a.map_num(n => Num.from(Math.sign(+n)));
    }, 0, (a, b) => a.map_num(n => n.mul(b.as_num())), true),
    // Reciprocal (0) / Divide (0, 0)
    "%": mod(0, a => a.map_num(n => n.recip()), 0, (a, b) => a.map_num(n => n.div(b.as_num()))),
    // Not (0) / Residue (0, 0)
    "|": mod(0, a => a.map_num(n => Num.from(+!+n)), 0, (a, b) => b.map_num(n => Num.from(+n % +a.as_num()))),
    // Factorial (0) / Or (0, 0)
    "!": mod(0, a => a.map_num(n => {
        const val = +n;
        if (val < 0) err(0, "Factorial of negative number.");
        if (val < 2) return Num.from(1);
        let s = 2;
        for (let i = 3; i <= val; i++) s *= i;
        return Num.from(s);
    }), 0, (a, b) => a.map_num(n => Num.from(+n | +b.as_num()))),
    // Box (99) / Less Than (0, 0)
    "<": mod(99, a => Value.new_box(a), 0, (a, b) => prim(+(ord(a, b) == -1))),
    // Unbox (99) / Greater Than (0, 0)
    ">": mod(
        99, a => {
            let first = Value.maybe_num(a.to_list()[0] ?? err(4, "Take first of empty list."));
            return first.as_str(a.is_str() || a.boxed() && first.is_str());
        },
        0, (a, b) => prim(+(ord(a, b) == 1)), true
    ),
    // Exp (0) / And (0, 0)
    "^": mod(0, a => a.map_num(n => Num.from(Math.E ** +n)), 0, (a, b) => a.map_num(n => Num.from(+n & +b.as_num()))),
    // Shape (99) / Reshape (1, 99) -- _, _1 are wildcards
    "$": mod(99, a => prim(a.get_rank()), [1, 99], (a, b) => {
        const list = a.as_list();
        if (list[0] instanceof Value) err(4, "Rank must be list of literal numbers.");
        let rank = list.map(a => +a);

        const orig_rank = b.get_rank();
        let i, prod = 1;
        for (let j = 0; j < rank.length; j++) {
            prod *= rank[j]! == Infinity || rank[j]! == -1
                ? orig_rank[j] || 1 : (orig_rank[j] || 1) / rank[j]!;
            if (rank[j]! == Infinity || -1 == rank[j]!) i = j;
        }
        i && (rank[i] = prod);

        return b.with_rank(rank);
    }),
    // Identity (99) / Left (99, 99)
    "[": mod(99, a => a, 99, (a, _) => a, true, true),
    // Identity (99) / Right (99, 99)
    "]": mod(99, a => a, 99, (_, b) => b, true, true),
    // Dedup sieve (99) / Group (99, 1)
    "?": mod(99, a => {
        let s: Value[] = [];
        const spl = a.ranked(a.get_dims() - 1);
        let ret = Array(spl.length);
        for (let i = 0; i < spl.length; i++) {
            if (s.some(v => equal(v, spl[i]!))) ret[i] = 0;
            else {
                s.push(spl[i]!);
                ret[i] = 1;
            }
        }
        return prim(ret);
    }, [99, 1], (a, b) => {
        if (b.boxed()) return Value.new_box(a);
        if (a.get_rank()[a.get_dims() - 1]! != b.get_rank()[0]!) err(4);
        const bucket = b.to_list().map(n => +(n as Num));
        let map: Map<number, Value[]> = new Map([...Array(Math.max(...bucket) + 1).keys()].map(key => [key, []]));
        let sieved = [], leading = a.ranked(a.get_dims() - 1);
        for (let i = 0; i < leading.length; i++) if (bucket[i]! > -1) map.get(bucket[i]!)!.push(leading[i]!);
        for (let val of map.values())
            sieved.push(
                Value.new_box(Value.unranked(a.get_dims() - 1, a.get_rank().slice(0, a.get_dims() - 1), val))
            );
        return prim(sieved);
    }),
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
    }, 0, (a, b) => Value.new_scalar(Num.from(+equal(a, b))), true),
    // 1-Range (0) / Index (99, 0)
    "~": mod(0, a => {
        let n = +a.as_num();
        const s = INTERNAL.get_range();
        if (a.is_str()) return range(n < 97 ? 65 : 97, n + 1).as_str();
        return range(s, s + n);
    }, [99, 0], (a, b) => {
        if (!b.boxed()) return a.ranked(a.get_dims() - 1)[+b]!.as_str(a.is_str());
        let index = Value.maybe_num(b.as_list()[0]!).to_list().map(n => +n);

        if (a.get_dims() < index.length) err(4, `Index does not exist.`);
        let rank = a.get_rank();
        let i = 0, prefix = 1;
        for (let j = 0; j < index.length; j++) {
            i += index[j]! * prefix;
            prefix *= rank[rank.length - j - 1]!;
        }

        // FIXME: This is very impractical for very large amounts of data
        // I probably won't fix this
        let list = a.ranked(a.get_dims() - index.length);
        return (list[i] ?? err(4, `Index does not exist.`)).as_str(a.is_str());
    }, true, true),
    // Flatten [Ravel] (99) / Concatenate (1, 1)
    ",": mod(99, a => {
        let flat = prim(a.as_list());
        return a.is_str() ? flat.as_str() : flat;
    }, 1, (a, b) => {
        let valuesl = [...a.boxed() ? [a] : b.boxed() ? [a.box()] : a.to_list()];
        let valuesr = [...b.boxed() ? [b] : a.boxed() ? [b.box()] : b.to_list()];

        let ib = false;
        for (let i = 0; !ib && i < valuesl.length; i++) 
            if (valuesl[i]!.boxed()) ib = true;
        for (let i = 0; !ib && i < valuesr.length; i++)
            if (valuesr[i]!.boxed()) ib = true;
        if (ib) {
            for (let i = 0; i < valuesl.length; i++) 
                if (!valuesl[i]!.boxed()) {
                    let tmp = a.is_str() ? Value.maybe_num(valuesl[i]!).as_str() : valuesl[i]!;
                    valuesl[i] = Value.new_box(tmp);
                }
            for (let i = 0; i < valuesr.length; i++)
                if (!valuesr[i]!.boxed()) {
                    let tmp = b.is_str() ? Value.maybe_num(valuesr[i]!).as_str() : valuesr[i]!;
                    valuesr[i] = Value.new_box(tmp);
                }
        }
        return prim(valuesl.concat(...valuesr)).as_str(a.is_str() && b.is_str());
    }, true, true),
    // Mold (1) / Laminate (99, 99)
    ";": mod(1, a => {
        let values = a.as_list();
        if (values[0] && values[0]! instanceof Num) return a;
        let unboxed = values.map(n => (n as Value).unbox());

        let max_rank: number[] = [];
        for (let i = 0; i < unboxed.length; i++) {
            for (let j = 0, rank = unboxed[i]!.get_rank(), dims = unboxed[i]!.get_dims(); j < dims; j++)
                max_rank[j] = Math.max(max_rank[j] ?? 1, rank[j]!);
        }

        let new_values = unboxed.flatMap(value => pad_rank(value, max_rank).to_list() as Num[]);
        return prim(new_values, false, max_rank.length + 1, [...max_rank, values.length], unboxed[0]!.is_str());
    }, 99, (a, b) => {
        let left_dims = a.get_dims();
        let left_rank = a.get_rank();
        let right_dims = b.get_dims();
        let right_rank = b.get_rank();

        let dims = Math.max(left_dims, right_dims);
        let rank = new Array(dims).fill(1);
        for (let i in (left_dims - right_dims ? left_rank : right_rank))
            rank[i] = Math.max(left_rank[i] ?? 1, right_rank[i] ?? 1);

        let new_values = [...pad_rank(a, rank).to_list(), ...pad_rank(b, rank).to_list()];
        return prim(new_values, false, dims + 1, [...rank, 2], a.is_str() && b.is_str());
    }, true, true),
    // Tally (99) / Replicate (99, 1)
    "#": mod(99, a => Value.new_scalar(Num.from(a.get_rank()[a.get_dims() - 1]!)), [99, 1], (a, b) => {
        if (b.boxed()) err(2, "Boxed replication count.");
        const axis = Math.max(0, a.get_dims() - 1);
        let elements = a.ranked(axis);
        let counts = b.ranked(0);

        const size = Math.max(elements.length, counts.length);
        if (elements.length != counts.length) {
            if (elements.length % counts.length || elements.length < counts.length) err(4, "Operand ranks are not compatible.");
            else {
                let t = Array(size);
                for (let i = 0; i < size; i++) t[i] = counts[i % counts.length];
                counts = t;
            }
        }

        const counts_sum = counts.reduce((a, b) => a + +b, 0);
        let values: Value[] = Array(counts_sum);
        let tally = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0, max = +counts[i]!; j < max; j++)
                values[tally + j] = clone(elements[i]);
            tally += +counts[i]!;
        }
        // Finagling is required, since Value.unranked assumes nothing was __fully__ removed
        return Value.unranked(axis + 1, [], values, a.to_list()[0] instanceof Num);
    }, false, true),
    // Decode Binary (1), Decode (0, 1)
    "#.": mod(1, a => Symbols["#."]!(prim(2), a), [0, 1], (a, b) => {
        let n = Num.from(0);
        let atoms = b.to_list().map(n => n.as_num());
        let base = +a.as_num();
        for (let i = 0; i < atoms.length; i++)
            n = n.add(atoms[atoms.length - i - 1]!.muli(base ** i));
        return Value.new_scalar(n);
    }),
    // Encode Binary (0), Encode Base | Encode Mixed Radix (1, 0)
    // Monadic could be {{(y):(x,`2|y)v 0!`y%2NL.x}}@1 0&`.E
    "#:": mod(0, a => prim((+a).toString(2).split('').map(n => +n)), [1, 0], (a, b) => {
        let radices = a.to_list().map(n => +n);
        let atoms = Array(radices.length);
        let num = +b;
        for (let i = radices.length - 1; i >= 0; i--, num |= 0) {
            const n = radices[i]!;
            atoms[i] = n == 0 ? num : num % n;
            num = n == 0 ? num : num / n;
        }
        return prim(atoms);
    }),
    // Increment (0) / Take (1, 99)
    "{": mod(0, a => a.map_num(n => n.addi(1)), [1, 99], (a, b) => {
        const lrk = a.to_list().map(n => +n);
        const rrk = b.get_rank();
        const values = b.to_list();

        // Single row
        if (lrk.length == 1) {
            let sz = lrk[0]!;
            let count = rrk[0] || 0;
            return prim([
                ...values.slice(0, Math.min(count, sz)), 
                ...Array(Math.max(0, sz - count)).fill(Num.from(b.is_str() ? 32 : 0))
            ], false, 1, [sz], b.is_str());
        }

        const rstrides = strides(rrk);
        const ls = lrk.length;
        const rs = rrk.length;
        const min = Math.min(ls, rs);

        const lsz = lrk.reduce((a, b) => a * b, 1);
        const fill = b.is_str() ? 32 : 0;
        let bucket: (Value | Num)[] = Array(lsz);

        for (let i = 0; i < lsz; i++) {
            let idx = Array(ls).fill(0);
            for (let k = i, j = 0; j < ls; j++) {
                idx[j] = k % lrk[j]!;
                k = Math.floor(k / lrk[j]!);
            }

            let oldi = 0;
            let valid = true;
            for (let j = 0; j < min; j++) {
                if (idx[j]! >= rrk[j]!) { valid = false; break; }
                oldi += rstrides[j]! * idx[j]!;
            }
            for (let j = min; j < ls; j++)
                if (idx[j] != 0) { valid = false; break; }

            bucket[i] = valid ? values[oldi]! : Num.from(fill);
        }

        return prim(bucket, false, ls, lrk, b.is_str());
    }, true, true),
    // Decrement (0) / Drop (1, 99)
    "}": mod(0, a => a.map_num(n => n.subi(1)), [1, 99], (a, b) => {
        if (a.get_rank()[0]! > b.get_dims()) err(4);
        const leading: number = +a.to_list()[0]!;
        const resta = a.to_list().slice(1);

        let split = b.ranked(b.get_dims() - 1);
        if (leading < 0) split = split.slice(0, split.length + leading);
        else split = split.slice(leading);

        let rebuilt = Value.unranked(b.get_dims(), b.get_rank().slice(0, b.get_dims() - 1), split);
        if (resta.length) return Symbols["}"]!(prim(resta), rebuilt);
        else return rebuilt;
    }, true, true),
};

function strides(n: number[]): number[] {
    let s = Array(n.length);
    let acc = 1;
    for (let i = 0; i < n.length; i++) {
        s[i] = acc;
        acc *= n[i]!;
    }
    return s;
}

