import { err, str } from "./utils"

const clone = require('lodash.clonedeep');

function gcd(a: number, b: number): number {
    while (a !== b) {
        if (a > b) a -= b;
        else b -= a;
    }
    return a;
}

function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

export class Rational {
    private numer: number;
    private denom: number;

    constructor(numerator: number, denominator: number) {
        this.numer = numerator;
        this.denom = denominator;
        this.simplify();
    }

    private simplify(): void {
        const absn = Math.abs(this.numer);
        const absd = Math.abs(this.denom);

        if (absn == absd) {
            this.numer = Math.sign(this.numer);
            this.denom = Math.sign(this.denom);
        } else if (absn == 1 || absd == 1) {}
        else {
            const f = gcd(absn, absd);
            if (f == 1) return;
            this.numer /= f;
            this.denom /= f;
        }

        if (this.denom == 0) err(0, "Divide by zero.");
        if (this.denom < 0) {
            this.numer *= -1;
            this.denom *= -1;
        }
    }

    public add(other: number | Rational): Rational {
        if (typeof other == "number" && Math.abs(other) == 1)
            return new Rational(this.numer + other * this.denom, this.denom);
        const o = typeof other == "number" ? new Rational(other, 1) : clone(other);

        if (this.denom == o.denom) return new Rational(this.numer + o.numer, this.denom);
        else {
            const m = lcm(this.denom, o.denom);
            const a = m / this.denom;
            const b = m / o.denom;
            
            return new Rational(this.numer * a + o.numer * b, this.denom * a);
        }
    }

    public sub(other: number | Rational): Rational {
        return this.add(typeof other == "number" ? -other : new Rational(-other.numer, other.denom));
    }

    public mul(other: number | Rational): Rational {
        const o = typeof other == "number" ? new Rational(other, 1) : clone(other);
        return new Rational(this.numer * o.numer, this.denom * o.denom);
    }

    public div(other: number | Rational): Rational {
        const o = typeof other == "number" ? new Rational(other, 1) : clone(other);
        return new Rational(this.numer * o.denom, this.denom * o.numer);
    }

    public neg(): Rational {
        return new Rational(-this.numer, this.denom);
    }

    public to_number(): number {
        return this.numer / this.denom;
    }

    public to_lit(): [number, number] {
        return [this.numer, this.denom];
    }

    toString(): string {
        return `${str(this.numer)}/${str(this.denom)}`;
    }

    [Symbol.toPrimitive](hint: string) {
        return hint == "number" ? this.to_number() : this.toString();
    }
}

export class Num {
    private wrap: number | Rational;

    constructor(n: number | Rational) {
        this.wrap = n;
    }

    public static from(n: number | Rational | Num): Num {
        return n instanceof Num ? n : new Num(n);
    }

    public add(other: Num): Num {
        if (typeof this.wrap != "number") return Num.from(this.wrap.add(other.wrap));
        else if (typeof other.wrap != "number") return Num.from(other.wrap.add(this.wrap));
        else return Num.from(this.wrap + other.wrap);
    }

    public sub(other: Num): Num {
        return this.add(other.neg());
    }

    public mul(other: Num): Num {
        if (typeof this.wrap != "number") return Num.from(this.wrap.mul(other.wrap));
        else if (typeof other.wrap != "number") return Num.from(other.wrap.mul(this.wrap));
        else return Num.from(this.wrap * other.wrap);
    }

    public div(other: Num): Num {
        if (typeof this.wrap != "number") return Num.from(this.wrap.div(other.wrap));
        else if (typeof other.wrap != "number") return Num.from(new Rational(1, this.wrap).div(other.wrap));
        else return Num.from(this.wrap / other.wrap);
    }

    public neg(): Num {
        if (typeof this.wrap == "number") return Num.from(-this.wrap);
        else return Num.from(this.wrap.neg());
    }

    toString(): string {
        return str(this.wrap);
    }

    [Symbol.toPrimitive](hint: string) {
        return hint == "number" ? +this.wrap : this.toString();
    }
}
