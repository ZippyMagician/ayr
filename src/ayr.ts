import { Rational, Num } from "./number"
import { primitive } from "./utils"
import { Value } from "./value"
import { lex } from "./lex"
import { parse_nodes } from "./parse"

let list = primitive([15, 4, 6, 234, 2]);
let mat = primitive([1, 2, 3, 4, -3, 6, new Rational(1, 3), 8, 9], false, 2, [3, 3]);
let d3 = primitive([1, 2, 3, 4, 5, 6, 7, 8], false, 3, [2, 2, 2]);
let value = primitive(14);

//console.log(mat.ranked(1));
//console.log(d3.ranked(1));
// console.log(Value.new_box(Value.new_box(Value.new_box(14))).toString());
console.log(Value.new_box(mat).toString());

const n1 = Num.from(new Rational(5, 20));
const n2 = Num.from(new Rational(1, 3));
const n3 = Num.from(4);
console.log(n1.toString());

let r3 = n1.add(n2);
console.log(r3.toString());

//console.log(n2.sub(n1))
console.log(`${n3.add(n1)}`);

console.log(parse_nodes(lex("1 2 3  e1 e2 e3 e4\n'hello'")).map(n => n[1]!.toString())); // (1 2 3), (e1 e3 e3), 'hello'

// Logarithms: log(xy)  = log(x) + log(y)
//             log(x/y) = log(x) + log(1/y) = log(x) - log(y)
