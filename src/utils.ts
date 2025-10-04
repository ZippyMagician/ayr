import { Rational, Num } from "./number"
import { Value } from "./value"

export function err(code: number, msg: string = ""): never {
    switch (code) {
        case 0:
            throw(`NUMERIC ERROR [0]${msg ? ": " + msg : ""}`);
        case 1:
        case 2:
        case 3:
            throw(`NAME ERROR [3]${msg ? ": " + msg : ""}`);
        case 4:
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

export function primitive(value: number | string | number[] | Num | any[], box: boolean = false, dims: number = 1, rank?: number[]): Value {
    let final: Value;
    if (typeof value == "number") final = Value.new_scalar(Num.from(value));
    else if (value instanceof Num) final = Value.new_scalar(value);
    else if (typeof value == "string") final = Value.new_string(value, dims, rank ?? [value.length]);
    else {
        final = Value.new_list(value.map((n: number | any): Num => {
            if (typeof n == "number" || n instanceof Num || n instanceof Rational) return Num.from(n);
            err(-1, "unreachable.");
        }), dims, rank ?? [value.length]);
    }
    return box ? Value.new_box(final) : final;
}

