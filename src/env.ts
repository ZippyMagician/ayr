import { err, Module } from "./utils"
import { Value } from "./value"

const enum MaybeType {
    VALUE = 0,
    MODULE = 1,
}

class MaybeInstant {
    private type: MaybeType;
    private inner: Value | Module;

    constructor(inner: Value | Module, type: MaybeType) {
        this.inner = inner;
        this.type = type;
    }

    public static new_value(value: Value): MaybeInstant {
        return new MaybeInstant(value, MaybeType.VALUE);
    }

    public static new_mod(mod: Module): MaybeInstant {
        return new MaybeInstant(mod, MaybeType.MODULE);
    }
}

interface EnvMap {
    [key: string]: MaybeInstant,
}

export class Env {
    private map: EnvMap;
    private backup: EnvMap;

    constructor() {
        this.map = {};
        this.backup = {};
    }
}
