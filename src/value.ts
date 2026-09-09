import { err, str } from "./utils"
import { Rational, Num } from "./number"

const clone = require('lodash.clonedeep');
const is_equal = require('lodash.isequal');

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

    public static maybe_num(value: Value | Num): Value {
        return value instanceof Num ? Value.new_scalar(value) : clone(value);
    }

    public static new_scalar(value: Num): Value {
        return new Value(Type.Scalar, [value], 0, [1], false);
    }

    public static new_box(value: Value | Num): Value {
        if (value instanceof Num) value = Value.new_scalar(value);
        return new Value(Type.Box, [value], 0, [1], false);
    }

    public static new_string(str: string | Num[], dims: number = 1, rank?: number[]): Value {
        let list: Num[] = typeof str === "string" ? str.split('').map(ch => Num.from(ch.charCodeAt(0))) : str;
        return new Value(Type.List, list, dims, rank ?? [list.length], true);
    }

    public static new_list(list: Num[] | Value[], dims: number = 1, rank?: number[]): Value {
        return new Value(Type.List, list, dims, rank ?? [list.length], false);
    }

    public static new_ls(list: string | Num[] | Value[], dims: number = 1, rank?: number[], str?: boolean): Value {
        if (str) return Value.new_string(list as string | Num[], dims, rank);
        else return Value.new_list(list as Num[] | Value[], dims, rank);
    }

    public is_single(): boolean {
        return this.type == Type.Scalar || this.dims == 0 || this.dims == 1 && this.rank[0] == 1;
    }

    public as_list(): Value[] | Num[] {
        return clone(this.inner);
    }

    public get_rank(): number[] {
        return clone(this.rank);
    }

    public is_str(): boolean {
        return this.str;
    }

    public make_str(): Value {
        let v = clone(this);
        v.str = true;
        return v;
    }

    public with_rank(rank: number[]): Value {
        let dims = rank.length;
        if (rank.some((a: number) => !Number.isInteger(a))) err(4);
        let count = rank.reduce((a, b) => a * b, 1);
        let inner = clone(this.inner);

        if (count !== inner.length) {
            let i = 0;
            while (inner.length < count) inner.push(clone(inner[i++ % this.inner.length]));
        }

        return new Value(
            dims == 0 || dims == 1 && rank[0] == 1 ? Type.Scalar : Type.List, 
            inner, dims, rank, this.str
        );
    }

    public get_dims(): number {
        return this.dims;
    }

    public boxed(): boolean {
        return this.type == Type.Box;
    }

    public unbox(): Value {
        if (!this.boxed()) err(2, "Cannot unbox a non-boxed value.");
        return Value.maybe_num(this.inner[0]!);
    }

    public as_num(): Num {
        if (!this.is_single()) err(-1, "Attempted to treat list as single numeric value.");
        if (this.boxed()) err(2, "Cannot convert boxed value to numeric.");
        return this.inner[0]! instanceof Num ? this.inner[0]! : this.inner[0]!.as_num();
    }

    public as_value(): Value {
        if (!this.is_single()) err(-1, "Attempted to treat list as single value.");
        if (this.boxed()) err(2, "Cannot operate on boxed value.");
        return Value.maybe_num(this.inner[0]!);
    }

    // Convert to specific dimension count
    public ranked(dims: number = 0): Value[] {
        if (dims >= this.dims) {
            return [clone(this)];
        } else if (dims == 0) {
            return [...this.inner.map(n => n instanceof Num ? Value.new_scalar(n) : clone(n))]
        } else {
            // Dims < this.dims
            let nums = clone(this.inner);
            let inner_rank = this.rank.slice(0, dims); // Note: apl-like rank would be toSpliced instead
            let chunked = inner_rank.reduce((a: number, b: number) => a * b, 1);
            let res = [];

            while (nums.length) 
                res.push(Value.new_list(nums.splice(0, chunked), inner_rank.length, inner_rank));
            return res;
        }
    }

    // Convert back to original dimension count
    public static unranked(original_dims: number, partial_rank: number[], values: Value[], raw_value: boolean = false): Value {
        if (values.length == 0) return Value.new_list([]);

        let box = false;
        let is_str = values[0]!.str;
        let cuml_rank = values[0]!.rank;
        let boxed_inner = values[0]!.boxed()
        let ranked_dims = values[0]!.is_single() ? 0 : values[0]!.get_dims();
        for (let i = 1; i < values.length; i++) {
            is_str &&= values[i]!.str;
            boxed_inner &&= values[i]!.boxed()
            if (!is_equal(cuml_rank, values[i]!.rank)) {
                box = true;
            }
        }

        if (box) return Value.new_list(values.map(Value.new_box));
        if (values.length == 1 && ranked_dims >= original_dims) return values[0]!;

        let rank = [
            ...partial_rank, 
            ...cuml_rank.slice(0, ranked_dims), 
            values.length / partial_rank.reduce((a, b) => a * b, 1)
        ];
        if (is_str) return Value.new_string(values.map((n: Value) => n.as_list() as Num[]).flat(), original_dims, rank)
        else if (raw_value && !boxed_inner) {
            return Value.new_list(values.map((n: Value): Num[] => n.inner as Num[]).flat(), rank.length, rank);
        } else return Value.new_list(values.map((n: Value): Value[] => n.inner.map(Value.maybe_num)).flat(), rank.length, rank);
    }

    toString(): string {
        let build: string = "";
        if (this.is_single()) {
            build += clone(this.inner).map((n: Num | Value): string => {
                return n instanceof Num && this.str ? String.fromCharCode(+n) : str(n)
            })[0];
        } else if (this.dims == 1) {
            build += clone(this.inner).map((n: Num | Value): string => {
                return this.str ? n instanceof Num ? String.fromCharCode(+n) : err(0, "Invalid string instant.") : str(n)
            }).join(this.str ? "" : " ");
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

