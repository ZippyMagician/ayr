import { Rational, Num } from "./number"
import { Value } from "./value"

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
        default:
            throw(`INTERNAL ERROR [${code}]${msg ? ": " + msg : ""}`);
            break;
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

export type Module = (a: Value, b?: Value) => Value;

export function mod_prim(monad: (a: Value) => Value, dyad: (a: Value, b: Value) => Value): Module {
    return (a: Value, b?: Value) => b ? dyad(a, b) : monad(a);
}
