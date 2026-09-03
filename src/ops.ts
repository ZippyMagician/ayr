import { Num } from "./number"
import { Value } from "./value"
import { mod } from "./syms"
import { err, Module, Monad, Dyad } from "./utils"

type Binder = 
    [1, Monad<Module>] |
    [2, Dyad<Module>];

interface OpsMap {
    [key: string]: Binder
}

export const Operators: OpsMap = {
    "/": [1, (f: Module) => mod(1, a => {
        if (a.is_single()) return a.as_value();
        let arr = a.as_list().map(Value.maybe_num);
        return arr.slice(1).reduce((a, b) => f(a, b), arr[0]!);
    }, 99, (a, b) => err(-1, "TODO: Dyadic '/'."), true)],
}
