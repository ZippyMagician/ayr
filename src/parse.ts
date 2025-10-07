import { err, primitive } from "./utils"
import { Value } from "./value"
import { Num } from "./number"
import { eof, Token, TokenIdent } from "./lex"

const clone = require('lodash.clonedeep');

// TODO: Literals are only instant dependent on environment
function is_instant(type: TokenIdent): boolean {
    return type == TokenIdent.Number || type == TokenIdent.String || type == TokenIdent.Literal;
}

function is_whitespace(type: TokenIdent, accept_separator: boolean = true): boolean {
    return type == TokenIdent.Space || accept_separator && type == TokenIdent.Separator;
}

// Next No Whitespace -- Returns [Token, index] where index is the location of the Token in the Token stream
function nnw(tokens: Token[], from: number, accept_separator: boolean = true): [Token, number] {
    let i = from;
    while (i < tokens.length && is_whitespace(tokens[i]!.ident, accept_separator)) i++;
    return i == tokens.length ? [eof(), i] : [tokens[i]!, i];
}

export const enum NodeType {
    Instant,
    
    Operator,
    
    Symbol,
    
    Literal,

    Block,
}

// Operator, Symbol, Block TODO
export type Node =
    [ NodeType.Instant, Value ]  |
    [ NodeType.Literal, string ]

// TODO: Figure out how to parse tokens
// Need to separate literals into arrays.

function eval_instant(token: Token): Value | Num {
    switch (token.ident) {
        case TokenIdent.Number:
            return token.value.as_num();
        case TokenIdent.String:
        // TODO: Literal evaluated differently
        case TokenIdent.Literal:
            return Value.new_string(token.value.as_str());
        default:
            err(-1, "Unreachable.");
    }
}

export function parse_nodes(tokens: Token[]): Node[] {
    let tokens = clone(tokens);
    let stream: Node[] = [];
    let i = 0;

    while (i < tokens.length) {
        let [head, j] = nnw(tokens, i);
        // TODO: Cases such as 1 2 (3 4 5), (1 2 3 4), etc
        if (is_instant(head.ident)) {
            let list: Token[] = [clone(head)];
            let intermediary: (Value | Num)[] = [];
            let next: Token;
            while ([next, j] = nnw(tokens, ++j, false)) {
                // If get_instant_group, add that to intermediary.
                if (!is_instant(next.ident)) break;
                else list.push(clone(next));
            }
            
            // Parse list. Single string, list of numbers, list of numbers + strings
            let is_string = list.length == 1 && list[0]!.ident == TokenIdent.String;
            intermediary = list.map(eval_instant);
            let values: Num[] | Value[] = [];
            if (temp.some(n => n instanceof Value)) values = temp.map(Value.new_box);
            else values = temp as Num[];

            // TODO: Need to account for lists of boxed lists, which are parsed differently(?)
            stream.push([NodeType.Instant, is_string ? (values[0]! as Value).as_list()[0]! as Value : primitive(
                values.length == 1 ? values[0]! as Num : values
            )]);
            i = j;
        } else {
            err(-1, "TODO");
        }
    }

    return stream;
}
