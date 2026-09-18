import { box_text, err, str } from "./utils"
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

        // Remove trailing ones
        if (this.rank.length - 1) {
            while (this.rank[this.rank.length - 1] == 1) this.rank.pop();
            this.dims = this.rank.length;
        }
    }

    // Value.maybe_num can map over a list of Value | Num to convert it into guaranteed Values
    public static maybe_num(value: Value | Num): Value {
        return value instanceof Num ? Value.new_scalar(value) : clone(value);
    }

    // A new Value that is a scalar instant
    public static new_scalar(value: Num): Value {
        return new Value(Type.Scalar, [value], 0, [1], false);
    }

    // A new boxed Value
    public static new_box(value: Value | Num): Value {
        if (value instanceof Num) value = Value.new_scalar(value);
        return new Value(Type.Box, [value], 0, [1], false);
    }

    // A new string
    public static new_string(str: string | Num[], dims: number = 1, rank?: number[]): Value {
        let list: Num[] = typeof str === "string" ? str.split('').map(ch => Num.from(ch.charCodeAt(0))) : str;
        return new Value(Type.List, list, dims, rank ?? [list.length], true);
    }

    // A new list
    public static new_list(list: Num[] | Value[], dims: number = 1, rank?: number[]): Value {
        return new Value(Type.List, list, dims, rank ?? [list.length], false);
    }

    // A generic that can create a new list of either numbers or characters
    public static new_ls(list: string | Num[] | Value[], dims: number = 1, rank?: number[], str?: boolean): Value {
        if (str) return Value.new_string(list as string | Num[], dims, rank);
        else return Value.new_list(list as Num[] | Value[], dims, rank);
    }

    // Box this
    public box(): Value {
        return new Value(Type.Box, [this], 0, [1], false);
    }

    // Is this value a singleton immediate?
    public is_single(): boolean {
        return this.type == Type.Scalar || this.dims == 0 || this.dims == 1 && this.rank[0] == 1;
    }

    // Return a clone of the internal array
    public as_list(): Value[] | Num[] {
        return clone(this.inner);
    }

    public to_list(): Value[] | Num[] {
        return this.inner;
    }

    // Return the rank of this Value
    public get_rank(): number[] {
        return this.rank.slice();
    }

    // Is this Value a string?
    public is_str(): boolean {
        return this.str;
    }

    // Return a string version of this value (clone)
    public make_str(): Value {
        let v = clone(this);
        v.str = true;
        return v;
    }

    // Return in-place string version
    public as_str(): Value {
        this.str = true;
        return this;
    }

    // Return a new Value from this Value's instant representation, with a new rank
    public with_rank(rank: number[]): Value {
        let dims = rank.length;
        if (rank.some((a: number) => !Number.isInteger(a))) err(4);
        let count = rank.reduce((a, b) => a * b, 1);
        let inner = this.boxed() ? [clone(this)] : clone(this.inner);

        if (count > inner.length) {
            let i = 0;
            while (inner.length < count) inner.push(clone(inner[i++ % this.inner.length]));
        } else if (count < inner.length) inner = inner.slice(0, count);
        return new Value(
            dims == 0 || dims == 1 && rank[0] == 1 ? Type.Scalar : Type.List,
            inner, dims, rank, this.str
        );
    }

    // Return this Value's dimensions
    public get_dims(): number {
        return this.dims;
    }

    // Is this Value boxed?
    public boxed(): boolean {
        return this.type == Type.Box;
    }

    // Unbox this Value
    public unbox(): Value {
        if (!this.boxed()) err(2, "Cannot unbox a non-boxed value.");
        return Value.maybe_num(this.inner[0]!);
    }

    // Return the internal Num of this singleton Value
    public as_num(): Num {
        if (!this.is_single()) err(4, "Instant cannot be treated as numeric scalar.");
        if (this.boxed()) err(2, "Cannot convert boxed value to numeric.");
        return this.inner[0]! instanceof Num ? this.inner[0]! : this.inner[0]!.as_num();
    }

    public map_num(fn: (a: Num) => Num): Value {
        let n = this.as_num();
        return new Value(Type.Scalar, [fn(n)], 0, [1], this.str);
    }

    // Return the internal Value of this singleton Value
    public as_value(): Value {
        if (!this.is_single()) err(-1, "Instant cannot be treated as scalar.");
        if (this.boxed()) err(2, "Cannot operate on boxed value.");
        return Value.maybe_num(this.inner[0]!);
    }

    public map_value(fn: (a: Value) => Value): Value {
        let v = this.as_value();
        return new Value(Type.Scalar, [fn(v)], 0, [1], this.str);
    }

    // Convert to specific dimension count
    public ranked(dims: number = 0): Value[] {
        if (this.boxed() || dims >= this.dims) {
            return [clone(this)];
        } else if (dims == 0) {
            return this.inner.map(n => n instanceof Num ? Value.new_scalar(n) : clone(n));
        } else {
            // Dims < this.dims
            const inner_rank = this.rank.slice(0, dims); // Note: apl-like rank would be toSpliced instead
            const chunked = inner_rank.reduce((a: number, b: number) => a * b, 1);
            let res = [];

            for (let i = 0; i < this.inner.length; i += chunked) {
                res.push(Value.new_ls(this.inner.slice(i, i + chunked), inner_rank.length, inner_rank, this.str));
            }
            return res;
        }
    }

    // Convert back to original dimension count
    public static unranked(original_dims: number, partial_rank: number[], values: Value[], raw_value: boolean = false): Value {
        if (values.length == 0) return Value.new_list([]);

        let uneven = false;
        let is_str = values[0]!.str;
        let cuml_rank = values[0]!.rank;
        let boxed_inner = values[0]!.boxed()
        let ranked_dims = values[0]!.is_single() ? 0 : values[0]!.get_dims();
        for (let i = 1; i < values.length; i++) {
            is_str &&= values[i]!.str;
            boxed_inner &&= values[i]!.boxed()
            if (!is_equal(cuml_rank, values[i]!.rank)) {
                uneven = true;
            }
        }

        // In J, this would keep it unboxed by "spreading it out" into something such as a matrix
        // TODO: Maybe I should add a flag to toggle this behavior?
        if (uneven) return Value.new_list(values.map(Value.new_box));
        // Single value. Originally was values.length == 1 && ranked_dims >= original_dims, I do not believe this second condition to be necessary.
        if (values.length == 1) return values[0]!;
        // List of boxes
        if (boxed_inner) return Value.new_list(values);

        let rank = [
            ...cuml_rank.slice(0, ranked_dims),
            ...partial_rank,
            values.length / partial_rank.reduce((a, b) => a * b, 1)
        ];
        if (is_str) return Value.new_string(values.flatMap((n: Value) => n.as_list() as Num[]), original_dims, rank)
        else if (raw_value) {
            return Value.new_list(values.flatMap((n: Value): Num[] => n.inner as Num[]), rank.length, rank);
        } else return Value.new_list(values.flatMap((n: Value): Value[] => n.inner.map(Value.maybe_num)), rank.length, rank);
    }

    // Box elements of list neatly (for printing)
    private inner_box(lines: string[], padX?: number, padY?: number): string {
        let build = "";

        const elements = lines.length;
        let maxX = padX ?? 0, maxY = padY ?? 0, y;
        if (!padX || !padY) for (let box of lines) {
            y = box.split('\n');
            maxX = Math.max(maxX, y[0]!.length);
            maxY = Math.max(maxY, y.length);
        }

        let tmp = lines.map(b => box_text(b, true, maxX, maxY).split('\n'));
        for (let i = 0; i < maxY + 2; i++) {
            const start = i == 0, end = i == maxY + 1;
            let b = tmp[0]![i]!;
            for (let j = 1; j < elements; j++) {
                if (start || end) b = b.substring(0, b.length - 1) + (start ? "┬" : "┴");
                b += tmp[j]![i]!.substring(1);
            }
            build += b + "\n";
        }

        return build;
    }

    private inner_stringify(n: Num | Value, boxed: boolean = false): string {
        if (!this.str) return str(n, boxed);
        if (n instanceof Num) return String.fromCharCode(+n);
        err(0, "Invalid string instant.");
    }

    // Primitive toString for printing an instant
    toString(_: number = 10, no_box: boolean = false): string {
        let build: string = "";
        const inner_boxed = this.inner[0]! instanceof Value && this.inner[0]!.boxed();
        if (this.is_single()) {
            build += this.inner_stringify(this.inner[0]!);
        } else if (this.dims == 1) {
            let tmp = this.inner.map(n => this.inner_stringify(n, inner_boxed));
            if (inner_boxed) build = this.inner_box(tmp);
            else build = tmp.join(this.str ? "" : " ");
        } else if (this.dims == 2) {
            let elements: string[][] = this.ranked(this.dims - 1).map(n => n.inner.map(v => this.inner_stringify(v, inner_boxed)));
            if (!inner_boxed) {
                let len = 1;
                for (const line of elements) for (const element of line) len = Math.max(len, element.length);
                build += elements.map(line =>
                    line.map(element => ' '.repeat(len - element.length) + element).join(this.str ? "" : " ")
                ).join("\n");
            } else {
                let x = 0, y = 0;
                for (const line of elements) {
                    for (const element of line) {
                        const sp = element.split('\n');
                        x = Math.max(x, sp[0]!.length);
                        y = Math.max(y, sp.length);
                    }
                }

                // Build the list of joined boxes
                elements = elements.map(line => this.inner_box(line, x, y).trimEnd().split('\n'));
                const border_map: Record<string, string> = { "┘": "┤", "└": "├", "┴": "┼" };
                for (let i = 0; i < elements.length - 1; i++) {
                    if (i == 0) build += elements[0]![0] + "\n";
                    for (let j = 1; j < elements[i]!.length - 1; j++)
                        build += elements[i]![j]! + "\n";
                    build += elements[i]![elements[i]!.length - 1]!.replace(/└|┴|┘/g, m => border_map[m]!) + "\n";
                }
                const last = elements[elements.length - 1]!;
                for (let i = elements.length > 1 ? 1 : 0; i < last.length; i++)
                    build += elements[elements.length - 1]![i]! + "\n";
            }
        } else {
            let depth = this.dims;
            let chunked = this.ranked(depth - 1);
            for (let inner of chunked) {
                build += str(inner);
                build += '\n'.repeat(depth - 1);
            }
        }

        if (!no_box && this.boxed()) build = box_text(build.trimEnd());

        return !this.str ? build.trimEnd() : build;
    }
}

