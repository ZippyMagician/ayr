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
//console.log(n1.toString());

let r3 = n1.add(n2);
//console.log(r3.toString());

//console.log(n2.sub(n1))
//console.log(`${n3.add(n1)}`);

console.log(parse_nodes(lex("(1 2 3 4) (5 6) 6\n1 2\n'hello'  (1 2 e5)")).map(n => n[1]!.toString())); // (1 2 3), (e1 e3 e3), 'hello'

const { sym } = require("./syms");
// Matrix's rows are sorted in ascending order
let transformation = sym(1, (a: Value) => Value.new_list(a.as_list().toSorted((a,b)=>+a.as_num().sub(b.as_num()))), mat);
console.log("3x3 Matrix :: Each row sorted (ascending)");
console.log(transformation.toString());

let transformation2 = sym(1, (a: Value) => primitive([1,2,3,4],false,2,[2,2]), mat);
console.log("3x3 Matrix :: Each row replaced with 2x2 matrix");
console.log(transformation2.toString());

let transformation3 = sym(0, (a: Value) => primitive([1,2,3,4],false,2,[2,2]), mat);
console.log("3x3 Matrix :: Each element replaced with 2x2 matrix");
console.log(transformation3.toString());
// console.log(sym(0, (a: Value) => primitive(a.as_num().add(Num.from(1))), mat).toString());

// If transformed values are same rank, success. Otherwise, box values
// Shape is values[0].rank + [values.length] assuming success.
// value.ranked(1).map(transform).unranked(value.dims)

// Logarithms: log(xy)  = log(x) + log(y)
//             log(x/y) = log(x) + log(1/y) = log(x) - log(y)
