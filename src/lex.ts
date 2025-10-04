import { err, str } from "./utils"
import { Rational, Num } from "./number"

export const enum TokenIdent {
    // ^((?:_?\d*)?r_?\d+)|^(__|(?:_?\d*\.?\d*)?(?:e_?)?\d*\.?\d+|_)
    Number,
    // 'hello'
    String,
    // + - | etc
    Symbol,
    // & @ ` etc
    Operator,
    // :
    Colon,
    // [_a-zA-Z][a-zA-Z0-9_]*
    Literal,
    // `: [: ]:
    TrainMod,
    // (
    LParen,
    // )
    RParen,
    // {{
    LCurly,
    // }}
    RCurly,
    // <space>
    Space,
    // <tab> | <newline>
    Separator,
}

// Wrapper around a semi-any type. Number tokens specifically are better stored as numbers, not string slices
// For simplicities' sake. The original program ran exec(strand(grp(lex))), with ptrain called within exec.
// To be honest I can't remember my original reasoning completely, or even what these did. I believe group
// Gathered elements within ( ... ) and {{ ... }}, and strand worked on lists... Either way, the logic is simpler
// If the tokens are stored as numbers from the get-go when possible, hence this kinda hacky class.
class TokenValue {
    private inner: any;

    constructor(value: any) {
        this.inner = value;
    }

    public as_str(): string {
        if (typeof this.inner == "string") return this.inner as string;
        else return str(this.inner);
    }

    public as_num(): Num {
        if (this.inner instanceof Num) return this.inner as Num;
        if (typeof this.inner == "number") return Num.from(this.inner);
        else err(-1, "implementation error.");
    }
    
    [Symbol.toPrimitive](hint: string) {
        return hint == "number" ? this.as_num() : this.as_str()
    }
}

export type Token = {
    ident: TokenIdent,
    value: TokenValue,
}

export function lex(str: string): Token[] {
    let tokens: Token[] = [];
    const push = (ident: TokenIdent, value: any) => tokens.push({ ident: ident, value: new TokenValue(value) });
    let match;

    // TODO: Symbols + Operators
    while (str) {
        // Numbers
        if (match = /^((?:_?\d*)?r_?\d+)|^(__|(?:_?\d*\.?\d*)?(?:e_?)?\d*\.?\d+|_)/.exec(str)) {
            // _ is a negative sign, e4 and r3 are shorthand for 1e4 and 1r3
            let lit = (match[1] || match[2])!.replace(/_/g, "-").replace(/(?<=-?)(?<!\d)(e|r)/, "1$1");
            if (lit == "-") push(TokenIdent.Number, +Infinity); // Positive infinity is _
            else if (lit == "--") push(TokenIdent.Number, -Infinity); // Negative infinity is __
            else if (match[1]) { // It is a rational
                let [l, r] = lit.split("r");
                push(TokenIdent.Number, Num.from(new Rational(+l!, +r!)));
            } else if (lit.lastIndexOf(".") > lit.indexOf("e") && lit.indexOf("e") > -1) { // It is an exponentiation
                let [l, r] = lit.split("e");
                push(TokenIdent.Number, Num.from((+l!)**+r!));
            } else push(TokenIdent.Number, Num.from(+lit)); // Normal number
        // Strings, denoted with ' character
        } else if (match = /^'((?:[^'\\]|\\.)*)'/.exec(str)) {
            push(TokenIdent.String, JSON.parse(`"${match[1]!.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`));
        // [: ]: `: are train markers with special syntactic meaning
        } else if (match = /^\[:|^\]:|^`:/.exec(str)) push(TokenIdent.TrainMod, match[0]);
        // Parens or curly braces, for groups, trains, and functions
        else if (match = /^\(|^\)|^\{\{|^\}\}/.exec(str)) {
            push({ 
                "(": TokenIdent.LParen, 
                ")": TokenIdent.RParen, 
                "{{": TokenIdent.LCurly, 
                "}}": TokenIdent.RCurly,
            }[match[0]]!, match[0]);
        // The colon is used as an assignment and at the start of some trains
        } else if (match = /^:/.exec(str)) push(TokenIdent.Colon, match[0]);
        // Whitespace has syntactic meaning in certain situations
        else if (match = /^(\s+)/.exec(str)) push(match[0] == " " ? TokenIdent.Space : TokenIdent.Separator, match[1]!);
        // Literals (environment variables & user defined variables
        else if (match = /^([a-zA-Z][a-zA-Z_]*)/.exec(str)) push(TokenIdent.Literal, match[1]!);
        else err(3);

        str = str.slice(match && match[0].length || 1);
    }

    return tokens;
}
