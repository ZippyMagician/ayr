import { Rational, Num } from "./number"
import { Value } from "./value"
import { Env } from "./env"

const clone = require('lodash.clonedeep');

export function err(code: number, msg: string = ""): never {
    switch (code) {
        case 0:
            throw (`NUMERIC ERROR [0]${msg ? ": " + msg : ""}`);
        case 1:
            throw (`SYNTAX ERROR [1]${msg ? ": " + msg : ""}`);
        case 2:
            throw (`BOX ERROR [2]${msg ? ": " + msg : ""}`);
        case 3:
            throw (`NAME ERROR [3]${msg ? ": " + msg : ""}`);
        case 4:
            throw (`VALUE ERROR [4]${msg ? ": " + msg : ""}`);
        case 5:
            throw (`ARG ERROR [5]${msg ? ": " + msg : ""}`);
        case 6:
            throw (`RANK ERROR [6]${msg ? ": " + msg : ""}`);
        case 7:
            throw (`DOMAIN ERROR [7]${msg ? ": " + msg : ""}`);
        default:
            throw (`INTERNAL ERROR [${code}]${msg ? ": " + msg : ""}`);
    }
}

export function sta(item: string): Value {
    return Value.new_string(item);
}

export function str(item: any, no_box: boolean = false) {
    let s = item.toString(10, no_box);
    if (typeof item === "number") return s.replace(/\-|Infinity/g, "_");
    return s;
}

// lt | eq | gt
export function ord(left: Value, right: Value): number {
    if (left.is_str() && right.is_str()) return ('' + left).localeCompare('' + right);
    else if (left.is_single() && right.is_single()) return Math.sign(+left.as_num() - +right.as_num());
    else if (left.boxed() && right.boxed()) return ord(left.unbox(), right.unbox());
    else if (equal(left, right)) return 0;
    else {
        if (left.get_dims() != right.get_dims()) return Math.sign(left.get_dims() - right.get_dims());
        for (let i = 0, l = left.get_rank(), r = right.get_rank(); i < left.get_dims(); i++) {
            if (l[i]! != r[i]!) return Math.sign(l[i]! - r[i]!);
        }
        let l = left.to_list(), r = right.to_list();
        for (let i = 0; i < l.length; i++) {
            let o = ord(Value.maybe_num(l[i]!), Value.maybe_num(r[i]!));
            if (o) return o;
        }
        return 0;
    }
}

export function range(first: number, second?: number): Value {
    return primitive([...Array(Math.max(0, second ? second - first : first)).keys()].map(n => n + first));
}

export function equal(a: Value, b: Value): boolean {
    if (a.boxed()) return b.boxed() && equal(a.unbox(), b.unbox());
    else if (a.is_single()) return b.is_single() ? +a.as_num() == +b.as_num() : false;
    else {
        let right = b.to_list();
        return JSON.stringify(a.get_rank()) == JSON.stringify(b.get_rank())
            && a.to_list().reduce((cond, v, i) => cond && equal(Value.maybe_num(v), Value.maybe_num(right[i]!)), true);
    }
}

export function pad_rank(data: Value, target: number[]): Value {
    const dims = data.get_dims();
    const orig_rank = data.get_rank();

    const ndims = Math.max(dims, target.length);
    const rank = ndims > dims
        ? [...orig_rank, ...new Array(ndims - dims).fill(1)]
        : orig_rank;
    const new_rank = ndims < dims
        ? [...target, ...new Array(dims - ndims).fill(1)]
        : target;

    // Already matches
    if (rank.every((v, i) => v == new_rank[i]!)) return data;

    // Calculate offsets
    let offsets = new Array(rank.length);
    let new_offsets = new Array(new_rank.length);
    offsets[0] = new_offsets[0] = 1;
    for (let i = 1; i < rank.length; i++) {
        offsets[i] = offsets[i - 1]! * rank[i - 1]!;
        new_offsets[i] = new_offsets[i - 1]! * new_rank[i - 1]!;
    }

    const values = data.as_list();
    const old_len = rank.reduce((a, b) => a * b, 1);
    const len = new_rank.reduce((a, b) => a * b, 1);
    const new_values = new Array(len).fill(data.is_str() ? 32 : 0);
    for (let src = 0, dst; src < old_len; src++) {
        dst = 0;
        for (let axis = 0; axis < ndims; axis++) {
            dst += Math.floor(src / offsets[axis]!) % rank[axis]! * new_offsets[axis];
        }
        new_values[dst] = values[src]!;
    }

    return primitive(new_values, false, new_rank.length, new_rank);
}

export function primitive(value: number | string | number[] | Num | any[], box: boolean = false, dims: number = 1, rank?: number[], str?: boolean): Value {
    let final: Value;
    if (typeof value == "number") final = Value.new_scalar(Num.from(value));
    else if (value instanceof Num) final = Value.new_scalar(value);
    else if (typeof value == "string") final = Value.new_string(value, dims, rank ?? [value.length]);
    else {
        final = Value.new_ls(value.map((n: number | any): Value | Num => {
            if (typeof n == "number" || n instanceof Num || n instanceof Rational) return Num.from(n);
            else if (n instanceof Value) return n as Value;
            err(-1, "utils.ts::primitive | Unreachable.");
        }) as Value[] | Num[], dims, rank ?? [value.length], str);
    }
    return box ? Value.new_box(final) : final;
}

export type Module = (a: Value, b?: Value, override?: number | [number, number]) => Value;
export type Module2 = (a: Value, b: Value, override?: number | [number, number]) => Value

export function mod_prim(monad: Module, dyad: Module2): Module {
    return (a, b?, override?) => b ? dyad(a, b, override) : monad(a, undefined, override);
}

// Define built in literals
export function init_env(env: Env) {
    env.set("puts", mod_prim(a => {
        let s = str(a);
        process.stdout.write(s + "\n");
        return primitive(s.length);
    }, (a, b) => {
        let s = str(b);
        let i, n;
        for (i = 0, n = +a.as_num(); i < n; i++) process.stdout.write(s);
        console.log();
        return primitive(n * s.length);
    }));
}

// For printing boxed values
export function box_text(str: string, inner: boolean = false, padX: number = 0, padY: number = 0): string {
    // ║ ╓ ─ ╖ ╙ ╜
    const spl = str.split('\n');
    const y = Math.max(spl.length, padY);
    const x = Math.max(spl[0]!.length, padX);
    const chars = inner ? ["│", "┌", "┐", "└", "┘"] : ["║", "╓", "╖", "╙", "╜"];

    let build = chars[1] + "─".repeat(x + 2) + chars[2] + "\n";
    // build += "║" + " ".repeat(x + 2) + "║\n";
    for (let i = 0; i < y; i++) {
        const offset = (x - spl[i]!.length + 2) / 2;
        if (offset != (offset | 0)) build += chars[0] + " ".repeat(Math.floor(offset)) + spl[i] + " ".repeat(Math.ceil(offset));
        else build += chars[0] + " ".repeat(offset) + spl[i] + " ".repeat(offset);
        build += chars[0] + "\n";
    }
    // build += "║" + " ".repeat(x + 2) + "║\n";
    build += chars[3] + "─".repeat(x + 2) + chars[4];

    return build;
}


