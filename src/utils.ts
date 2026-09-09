import { Rational, Num } from "./number"
import { Value } from "./value"
import { Env } from "./env"

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

