import { Rational, Num } from "./number"
import { Module, primitive } from "./utils"
import { Value } from "./value"
import { lex } from "./lex"
import { parse_nodes } from "./parse"
import { mod, Symbols } from "./syms"

let list = primitive([15, 4, 6, 234, 2]);
let mat = primitive([1, 2, 3, 4, -3, 6, new Rational(1, 3), 8, 9], false, 2, [3, 3]);
let d3 = primitive([1, 2, 3, 4, 5, 6, 7, 8], false, 3, [2, 2, 2]);
let value = primitive(14);
let uneven = primitive([1, 2, 3, 4, 5, 6], false, 2, [3, 2]);

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
console.log(parse_nodes(lex("$ 1 2 3 4")));

const ayr = (prog: string) => parse_nodes(lex(prog))[0]![1]! as Module;

const program = `(2 2 $) 1 2 3 4`;
const nodes = parse_nodes(lex(program));
console.log(program+" ::\n"+(nodes[0]![1]! as Module)(nodes[1]![1]! as Value));

let test1 = ayr(`(+%-)`);
console.log(""+test1(primitive(3), primitive(7))); // (10 % _4)

// Matrix's rows are sorted in ascending order
/*let transformation = sym.bind(false, 1, (a: Value) => Value.new_list(a.as_list().toSorted((a,b)=>+a.as_num().sub(b.as_num()))));
console.log("3x3 Matrix :: Each row sorted (ascending)");
console.log(""+transformation(mat));

let transformation2 = sym.bind(false, 1, (a: Value) => primitive([1,2,3,4],false,2,[2,2]));
console.log("3x3 Matrix :: Each row replaced with 2x2 matrix");
console.log(""+transformation2(mat));

let transformation3 = sym.bind(false, 0, (a: Value) => primitive([1,2,3,4],false,2,[2,2]));
console.log("3x3 Matrix :: Each element replaced with 2x2 matrix");
console.log(""+transformation3(mat));*/
// console.log(sym(0, (a: Value) => primitive(a.as_num().add(Num.from(1))), mat).toString());

const addition = Symbols["+"]!;
console.log("\n'+' Symbol test");
console.log("Monadic: +r4 -- "+addition(Value.new_scalar(n1)));
console.log("Dyadic: 3+r4 -- "+addition(primitive(3), Value.new_scalar(n1)));

console.log("3x3 Matrix & Scalar:\n"+addition(mat, Value.new_scalar(n3)));
console.log("3x3 Matrix & 3 list:\n"+addition(mat, primitive([1, 2, 3])));

/*console.log("\nTranspose test");

const transpose_inner = (a: Value) => {
    let dims = a.get_dims();
    if (dims == 1) return a.with_rank([1, a.get_rank()[0]!]);
    let rank = a.get_rank();
    [rank[0], rank[1]] = [rank[1]!, rank[0]!];
    if ((rank[0]! == 1) != (rank[1]! == 1)) {
        return a.with_rank(rank);
    }

    let rows = a.ranked(1).map(x => x.as_list());
    return Value.new_ls(rows[0]!.flatMap((_, i) => rows.map(x => x[i]!)) as Value[] | Num[], dims, rank, a.is_str());
};

let transpose = sym.bind(false, 2, transpose_inner);

console.log(""+list+"\nTO:");
console.log(""+transpose(list)+"");
console.log("\n"+uneven+"\nTO:");
console.log(""+transpose(uneven));

console.log("\n=@1 ]3 3$~9\n"+sym(1, transpose_inner, primitive([1,2,3,4,5,6,7,8,9], false, 2, [3,3])));*/

const mul = Symbols["*"]!;
console.log("\n'*' Symbol test");
console.log("-2 -1 0 1 2 :: "+mul(primitive([-2,-1,0,1,2])));
console.log(""+mul(value, uneven));
console.log("'Ab ' :: "+mul(primitive("Ab ")));

// If transformed values are same rank, success. Otherwise, box values
// Shape is values[0].rank + [values.length] assuming success.
// value.ranked(1).map(transform).unranked(value.dims)

// Logarithms: log(xy)  = log(x) + log(y)
//             log(x/y) = log(x) + log(1/y) = log(x) - log(y)
