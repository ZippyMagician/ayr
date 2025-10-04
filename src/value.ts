import { err, str } from "./utils"
import { Rational, Num } from "./number"

const clone = require('lodash.clonedeep');

const enum Type {
    // Single Value
    Scalar,
    // Array
    List,
    // Transparent (in some cases) Scalar wrapper
    Box,
}

export class Value {
    private type: Type;
    private inner: Value[] | Num[];
    private dims: number;
    private rank: number[];
    private str: boolean;

    constructor(type: Type, inner: Value[] | Num[], dims: number, rank: number[], str: boolean) {
        this.type = type;
        this.inner = inner;
        this.dims = dims;
        this.rank = rank;
        this.str = str;
    }

    public static new_scalar(value: Num): Value {
        return new Value(Type.Scalar, [value], 0, [1], false);
    }

    public static new_box(value: Value | Num): Value {
        if (value instanceof Num) value = this.new_scalar(value);
        return new Value(Type.Box, [value], 0, [1], false);
    }

    public static new_string(str: string | Num[], dims: number = 1, rank?: number[]): Value {
        let list: Num[] = typeof str === "string" ? str.split('').map(ch => Num.from(+ch)) : str;
        return new Value(Type.List, list, dims, rank ?? [list.length], true);
    }

    public static new_list(list: Num[] | Value[], dims: number = 1, rank?: number[]): Value {
        return new Value(Type.List, list, dims, rank ?? [list.length], false);
    }

    public is_single(): boolean {
        return this.type == Type.Scalar || this.dims == 0 || this.dims == 1 && this.rank[0] == 1;
    }

    public ranked(dims: number = 0): Value[] {
        if (dims >= this.dims) {
            return [clone(this)];
        } else if (dims == 0) {
            return [...this.inner.map(n => n instanceof Num ? Value.new_scalar(n) : clone(n))]
        } else {
            // Dims < this.dims
            let nums = clone(this.inner);
            let inner_rank = this.rank.toSpliced(0, dims);
            let chunked = inner_rank.reduce((a: number, b: number) => a * b, 1);
            let res = [];

            while (nums.length) 
                res.push(Value.new_list(nums.splice(0, chunked), inner_rank.length, inner_rank));
            return res;
        }
    }

    toString(): string {
        let build: string = "";
        if (this.is_single()) {
            build += clone(this.inner).map((n: Num | Value): string => {
                return n instanceof Num && this.str ? String.fromCharCode(+n) : str(n)
            })[0];
        } else if (this.dims == 1) {
            build += clone(this.inner).map(str).join(" ");
        } else if (this.dims == 2) {
            let elements: string[][] = this.ranked(this.dims - 1).map(n => n.inner.map(str));
            let len = 1;
            for (let element of elements.flat()) len = Math.max(len, element.length);
            build += elements.map(line => line.map(element => ' '.repeat(len - element.length) + element).join(" ")).join("\n");
        } else {
            let depth = this.dims;
            let chunked = this.ranked(depth - 1);
            for (let inner of chunked) {
                build += str(inner);
                build += [...Array(depth - 1).fill('\n')].join('');
            }
        }

        // Box the value
        if (this.type == Type.Box) {
            let lines = build.split('\n');
            build = "";
            for (const [i, line] of lines.entries()) {
                let is_line_one = i == 0;
                // 2 * (+!i ^ 1) returns 2 when i == 0, 0 otherwise
                build += " ".repeat(2 * (+!i ^ 1)) + line + "\n";
            }
            build = "[ " + build.trimEnd() + " ]";
        }
        return !this.str ? build.trimEnd() : build;
    }
}

