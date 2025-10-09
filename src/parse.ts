import { err, primitive } from "./utils"
import { Value } from "./value"
import { Num } from "./number"
import { eof, Token, TokenIdent } from "./lex"

const clone = require('lodash.clonedeep');

// TODO: Literals are only instant dependent on environment
function is_instant(tokens: Token[], i: number): boolean {
    if (i >= tokens.length) return false;
    let type: TokenIdent = tokens[i]!.ident;
    if (type == TokenIdent.Number || type == TokenIdent.String || type == TokenIdent.Literal)
        return true;
    if (type == TokenIdent.LParen) {
        return get_group(tokens, i)[0];
    }

    return false;
}

function is_whitespace(type: TokenIdent, accept_separator: boolean = true): boolean {
    return type == TokenIdent.Space || accept_separator && type == TokenIdent.Separator;
}

function is_line_end(tokens: Token[], i: number): boolean {
    let { ident, value } = tokens[i] ?? eof();
    return ident == TokenIdent.Separator && value.as_str() == "\n" || ident == TokenIdent.EOF;
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

    // Line Separator
    Line,
}

// Operator, Symbol, Block TODO
export type Node =
    [ NodeType.Instant, Value ]  |
    [ NodeType.Literal, string ] |
    [ NodeType.Line, "\n" ]

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

// TODO: Only works for instant groups
function get_group(tokens: Token[], i: number): [ boolean, Token[], number ] {
    let parens: number = 1;
    i++;
    let build: Token[] = [];

    let node: Token;
    while (([node, i] = nnw(tokens, i), node.ident != TokenIdent.EOF)) {
        if (node.ident == TokenIdent.LParen) ++parens;
        else if (node.ident == TokenIdent.RParen && --parens == 0) break;
        build.push(clone(node));
        i++;
    }

    return [true, build, i];
}

export function parse_nodes(tokens: Token[]): Node[] {
    // let tokens = clone(tokens);
    let stream: Node[] = [];
    let i = 0;

    while (i < tokens.length) {
        let [head, j] = nnw(tokens, i, false);
        if (is_instant(tokens, j)) {
            // An instant value
            let list: Token[] = [];
            let intermediary: (Value | Num)[] = [];
            let next: Token;

            j--; // Start from head.
            while ([next, j] = nnw(tokens, ++j, false)) {
                if (next.ident == TokenIdent.LParen) {
                    let [ inst, group, k ] = get_group(tokens, j);
                    if (inst) {
                        let group_parsed: Value = parse_nodes(group)[0]![1]! as Value;
                        intermediary = intermediary.concat(list.map(eval_instant));
                        intermediary.push(group_parsed);
                        list = [];
                    } else err(-1, "TODO: Non instant groups interrupting literal chain.");
                    j = k;
                } else if (!is_instant(tokens, j)) break;
                else list.push(clone(next));
            }
            
            // Parse list. Single string, list of numbers, list of numbers + strings, list of boxed elements
            let is_string = list.length == 1 && !intermediary.length && list[0]!.ident == TokenIdent.String;
            intermediary = intermediary.concat(list.map(eval_instant));
            let values: Num[] | Value[] = [];
            if (intermediary.some(n => n instanceof Value)) values = intermediary.map(Value.new_box);
            else values = intermediary as Num[];

            // Lists of single numbers or single values (1 elem list of boxed list) handled differently.
            // A 1 elem list of a Value should not be boxed. A single number is a scalar.
            stream.push([
                NodeType.Instant, 
                is_string ? (values[0]! as Value).as_list()[0]! as Value : 
                            values.some(n => n instanceof Num) ? primitive(
                                values.length == 1 ? values[0]! as Num : values
                            ) : values.length == 1 ? (values[0]! as Value).as_list()[0]! as Value : 
                                                     primitive(values)
            ]);
            
            i = j;
            if (is_line_end(tokens, i)) stream.push([NodeType.Line, "\n"]); // Add trailing newline
        } else if (head.ident == TokenIdent.LParen) {
            // Left parens denote a group. A train if parser reaches this branch.
            let [ inst, group, j ] = get_group(tokens, i);
            err(-1, "TODO: Non instant groups.");
            i = j;
        } else if (is_line_end(tokens, j)) {
            // Line separator (right → left, top → bottom parse order)
            stream.push([NodeType.Line, "\n"]);
            i = j;
        } else if (head.ident == TokenIdent.Separator) {
            // Other separators are syntactically insignificant in this branch.
            i = j;
        } else {
            err(-1, "TODO");
        }
        i++;
    }

    return stream;
}
