import { Rational, Num } from "./number"
import { Value } from "./value"
import { Env } from "./env"

const clone = require('lodash.clonedeep');

export function err(code: number, msg: string = ""): never {
    switch (code) {
        case 0:
            throw(`NUMERIC ERROR [0]${msg ? ": " + msg : ""}`);
        case 1:
            throw(`SYNTAX ERROR [1]${msg ? ": " + msg : ""}`);
        case 2:
            throw(`BOX ERROR [2]${msg ? ": " + msg : ""}`);
        case 3:
            throw(`NAME ERROR [3]${msg ? ": " + msg : ""}`);
        case 4:
            throw(`VALUE ERROR [4]${msg ? ": " + msg : ""}`);
        case 5:
            throw(`ARG ERROR [5]${msg ? ": " + msg : ""}`);
        case 6:
            throw(`RANK ERROR [6]${msg ? ": " + msg : ""}`);
        default:
            throw(`INTERNAL ERROR [${code}]${msg ? ": " + msg : ""}`);
    }
}

export function sta(item: string): Value {
    return Value.new_string(item);
}

export function str(item: any) {
    let s = item.toString();
    if (typeof item === "number") return s.replace(/\-|Infinity/g, "_");
    return s;
}

export function range(first: number, second?: number): Value {
    return primitive([...Array(Math.max(0, second ? second - first : first)).keys()].map(n => n + first));
}

export function pad_axis(data: Value, axis: number, size: number): Value {
    const dims = data.get_dims();
    const orig_rank = data.get_rank();

    if (dims > axis && orig_rank[axis]! > size) err(-1, "utils.ts::pad_axis");

    const rank = dims <= axis
    ? [...orig_rank, ...new Array(axis - dims + 1).fill(1)]
    : orig_rank;

    const new_rank = rank.slice();
    const old_axis_size = rank[axis]!;
    new_rank[axis] = size;

    const block = rank.slice(0, axis).reduce((a, b) => a * b, 1);
    const rest = rank.slice(axis + 1).reduce((a, b) => a * b, 1);
    const copy_count = old_axis_size * block;
    const pad_count = (size - old_axis_size) * block;
    const len = block * size * rest;

    const values = data.as_list();
    const new_values = new Array(len);

    let src = 0, dst = 0;
    for (let r = 0; r < rest; r++) {
    for (let i = 0; i < copy_count; i++) new_values[dst++] = values[src++]!;
    new_values.fill(0, dst, dst + pad_count);
    dst += pad_count;
}

return primitive(new_values, false, new_rank.length, new_rank);
}

export function primitive(value: number | string | number[] | Num | any[], box: boolean = false, dims: number = 1, rank?: number[]): Value {
    let final: Value;
    if (typeof value == "number") final = Value.new_scalar(Num.from(value));
    else if (value instanceof Num) final = Value.new_scalar(value);
    else if (typeof value == "string") final = Value.new_string(value, dims, rank ?? [value.length]);
    else {
        final = Value.new_list(value.map((n: number | any): Value | Num => {
            if (typeof n == "number" || n instanceof Num || n instanceof Rational) return Num.from(n);
            else if (n instanceof Value) return n as Value;
            err(-1, "unreachable.");
        }) as Value[] | Num[], dims, rank ?? [value.length]);
    }
    return box ? Value.new_box(final) : final;
}

export type Module  = (a: Value, b?: Value, override?: number | [number, number]) => Value;
export type Module2 = (a: Value, b:  Value, override?: number | [number, number]) => Value

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

