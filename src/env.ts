import { err, Module } from "./utils"
import { Value } from "./value"

const enum MaybeType {
    VALUE = 0,
    MODULE = 1,
}

export class MaybeInstant {
    private type: MaybeType;
    private inner: Value | Module;

    constructor(inner: Value | Module, type: MaybeType) {
        this.inner = inner;
        this.type = type;
    }

    public static new(inner: Value | Module): MaybeInstant {
        let t = inner instanceof Value ? MaybeType.VALUE : MaybeType.MODULE;
        return new MaybeInstant(inner, t);
    }

    public static new_value(value: Value): MaybeInstant {
        return new MaybeInstant(value, MaybeType.VALUE);
    }

    public static new_mod(mod: Module): MaybeInstant {
        return new MaybeInstant(mod, MaybeType.MODULE);
    }

    public is_instant(): boolean {
        return this.type == MaybeType.VALUE;
    }

    // Call eval<Value> or eval<Module>
    public eval<T>(): T {
        try {
            return this.inner as T;
        } catch (e) {
            err(5, `Unexpected type as argument.`);
        }
    }

    public as_module(): Module {
        return this.inner instanceof Value ? ((a, b?) => this.inner as Value) : this.inner;
    }
}

export class Env {
    private map: Map<string, MaybeInstant>;
    private backup: Map<string, MaybeInstant>;

    constructor() {
        this.map = new Map();
        this.backup = new Map();
    }

    public set(name: string, value: Value | Module) {
        this.map.set(name, MaybeInstant.new(value));
    }

    public has(name: string): boolean {
        return this.map.has(name);
    }

    public get(name: string): MaybeInstant {
        if (this.has(name)) return this.map.get(name)!;
        else err(3, `Literal '${name}' is undefined.`);
    }
}
