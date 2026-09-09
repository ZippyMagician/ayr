import { Rational, Num } from "./number"
import { str, Module, primitive } from "./utils"
import { Value } from "./value"
import { lex } from "./lex"
import { parse_nodes } from "./parse"
import { mod, Symbols } from "./syms"
import { Operators } from "./ops"

import { ayr } from "./eval"
import { Env } from "./env"

/*let list = primitive([15, 4, 6, 234, 2]);
let mat = primitive([1, 2, 3, 4, -3, 6, new Rational(1, 3), 8, 9], false, 2, [3, 3]);
let d3 = primitive([1, 2, 3, 4, 5, 6, 7, 8], false, 3, [2, 2, 2]);
let value = primitive(14);
let uneven = primitive([1, 2, 3, 4, 5, 6], false, 2, [3, 2]);


ayr(`
X: 457
z: %
y: z+
puts y X
`);

console.log(ayr(`+/@2 ]3 3$~9`).toString());
//console.log(ayr(`4 (-&[%+) ~5`).toString())
*/

import * as readline from "node:readline/promises"

async function cli() {
    console.log("type 'exit' to exit.");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.on('SIGINT', () => rl.close());

    let env = new Env();
    while (true) {
        let prompt = await rl.question("    ");
        if (prompt == "exit") break;
        try {
            let output = ayr(prompt, env);
            if (output) console.log(output.toString());
        } catch (e) {
            console.log(e);
        }
    }

    rl.close();
}

cli();

