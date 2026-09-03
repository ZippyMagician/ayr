import { err, Module, mod_prim, primitive, str } from "./utils"
import { Value } from "./value"
import { Num } from "./number"
import { eof, Token, TokenIdent } from "./lex"
import { Symbols } from "./syms"
import { ayr_partial, is_instant as is_node_instant } from "./eval"
import { Env, MaybeInstant } from "./env"

const clone = require('lodash.clonedeep');

function is_instant(tokens: Token[], i: number, env: Env): boolean {
    if (i >= tokens.length) return false;
    let type: TokenIdent = tokens[i]!.ident;
    if (type == TokenIdent.Number || type == TokenIdent.String)
        return true;
    if (type == TokenIdent.Literal)
        // If the literal exists, is an instant, and is not being redefined, then return true
        try {
            let lit = env.get(tokens[i]!.value.as_str());
            if (lit.is_instant()) return nnw(tokens, i + 1, false)[0]!.ident != TokenIdent.Colon;
        } catch (e) {
            return false;
        }
    if (type == TokenIdent.LParen)
        return get_group(tokens, i, env)[0];

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

    Train,

    Block,

    // Line Separator
    Line,
}

// TODO: Operators. Assignment handled in `parse_nodes` step.
export type Node =
    [NodeType.Instant, Value] |
    [NodeType.Literal, string] |
    [NodeType.Symbol, Module] |
    [NodeType.Train, Module] |
    [NodeType.Block, Module] |
    [NodeType.Line, "\n"]

function eval_instant(this: Env, token: Token): Value | Num {
    switch (token.ident) {
        case TokenIdent.Number:
            return token.value.as_num();
        case TokenIdent.String:
            return Value.new_string(token.value.as_str());
        case TokenIdent.Literal:
            return this.get(token.value.as_str()).eval<Value>();
        default:
            err(-1, "Unreachable.");
    }
}

function get_group(tokens: Token[], i: number, env: Env): [boolean, Token[], number] {
    let parens: number = 1;
    let instant: boolean = true;
    let build: Token[] = [];
    let node: Token;

    while (([node, i] = nnw(tokens, ++i), node.ident != TokenIdent.EOF)) {
        if (node.ident == TokenIdent.LParen) ++parens;
        else if (node.ident == TokenIdent.RParen && --parens == 0) break;
        build.push(clone(node));
    }

    // TODO: Needs to work for non-instant literals as well.
    instant = build.length == 0 ||
        is_instant(build, build.length - 1, env) && build[0]!.ident != TokenIdent.Colon;

    return [instant, build, i];
}

// TODO: Blocks, Literals, Operators
export function parse_nodes(tokens: Token[], env?: Env): Node[] {
    env ??= new Env();
    let stream: Node[] = [];
    let i = 0;

    while (i < tokens.length) {
        let [head, j] = nnw(tokens, i, false);
        if (is_instant(tokens, j, env)) {
            // An instant value
            let list: Token[] = [];
            let intermediary: (Value | Num)[] = [];
            let next: Token;

            j--; // Start from head.
            while ([next, j] = nnw(tokens, ++j, false)) {
                if (next.ident == TokenIdent.LParen) {
                    let [inst, group, k] = get_group(tokens, j, env);
                    if (inst) {
                        let group_parsed: Value = ayr_partial(parse_nodes(group, env), env);
                        intermediary = intermediary.concat(list.map(eval_instant.bind(env)));
                        intermediary.push(group_parsed);
                        list = [];
                    } else {
                        j--;
                        break;
                    }
                    j = k;
                } else if (!is_instant(tokens, j, env)) {
                    j--;
                    break;
                } else list.push(clone(next));
            }

            // Parse list. Single string, list of numbers, list of numbers + strings, list of boxed elements
            let is_string = list.length == 1 && !intermediary.length && list[0]!.ident == TokenIdent.String;
            intermediary = intermediary.concat(list.map(eval_instant.bind(env)));
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
            let [inst, group, j] = get_group(tokens, i, env);
            if (group.length && group[0]!.ident == TokenIdent.Colon) {
                let [head, ...rest] = group;
                stream.push([NodeType.Train, parse_train(parse_nodes(rest, env), env, true)]);
            } else stream.push([NodeType.Train, parse_train(parse_nodes(group, env), env)]);
            i = j;
        } else if (head.ident == TokenIdent.Symbol) {
            // Symbols
            stream.push([NodeType.Symbol, Symbols[head.value.as_str()]!]);
            i = j;
        } else if (is_line_end(tokens, j)) {
            // Line separator (right → left, top → bottom parse order)
            stream.push([NodeType.Line, "\n"]);
            i = j;
        } else if (head.ident == TokenIdent.Separator) {
            // Other separators are syntactically insignificant in this branch.
            i = j;
        } else if (head.ident == TokenIdent.Literal) {
            // Non imm. literal.
            let [maybe_colon, k] = nnw(tokens, j + 1, true);
            if (maybe_colon.ident == TokenIdent.Colon) {
                let k = j + 2;
                let def_token;
                [def_token, k] = nnw(tokens, k, false);
                if (def_token.ident == TokenIdent.LCurly) err(-1, "TODO: Parse imm. def with {{ .. }}.");
                else {
                    let def = [def_token];
                    while ([def_token, k] = nnw(tokens, ++k, false)) {
                        if (def_token.ident == TokenIdent.Separator) break;
                        def.push(def_token);
                    }
                    if (!def.length) err(1, `Empty literal definition for '${head.value}.`);
                    let colon = false;
                    if (def[0]!.ident == TokenIdent.Colon) {
                        colon = true;
                        def.shift();
                    }
                    let nodes = parse_nodes(def, env);
                    if (is_node_instant(nodes[nodes.length - 1]!, env)) 
                        if (colon) err(1, "Invalid use of the colon token.");
                        else env.set(head.value.as_str(), ayr_partial(nodes, env));
                    else {
                        let train = parse_train(nodes, env, colon);
                        env.set(head.value.as_str(), mod_prim(
                            a => train(a),
                            (a, b) => train(a, b),
                        ));
                    }
                }
                j = k;
            } else {
                stream.push([NodeType.Literal, head.value.as_str()]);
            }
            i = j;
        } else if (head.ident == TokenIdent.Colon) {
            // Possible if/then statement
            if (stream.length) {
                let [last_type, last_val] = stream[stream.length - 1]!;
                if (last_type != NodeType.Instant) err(1, "Invalid use of the colon token.");
                err(-1, "TODO: If/then statement definitions.");
            } else err(1, "Invalid use of the colon token.");
        } else {
            err(-1, `TODO: Parse token '${JSON.stringify(head)}'.`);
        }
        i++;
    }

    return stream;
}

// TODO: Operators pass first
function parse_train(nodes: Node[], env: Env, has_colon: boolean = false): Module {
    if (nodes.length == 1) return nodes[0]![1]! as Module;
    let build: Module[] = [];

    for (let i = nodes.length - 1; i >= 0; i--) {
        let node = nodes[i]!;

        // Patterns:
        // A f
        //   f g
        // f g h
        if (is_node_instant(node, env)) {
            let top = build.pop()!;
            let left = clone(node[0] == NodeType.Instant ? node[1] as Value : env.get(node[1] as string).eval<Value>());
            build.push(mod_prim(a => top(clone(left), a), (a, b) => top(clone(left), b)));
        } else if (typeof node[1] == 'function') {
            if (has_colon) {
                if (build.length) {
                    let g = build.pop()!;
                    let f = node[1];
                    build.push(mod_prim(a => f(g(a)), (a, b) => f(g(a, b))));
                } else build.push(node[1]);
                continue;
            }

            if (build.length == 2) {
                let f = node[1];
                let g = build.pop()!;
                let h = build.pop()!;

                build.push(mod_prim(a => g(f(clone(a)), h(clone(a))), (a, b) => g(f(clone(a), clone(b)), h(clone(a), clone(b)))));
            } else build.push(node[1]);
        } else if (node[0] == NodeType.Literal) {
            err(-1, "TODO: Support non imm. literals in train");
        } else {
            err(1, "Unexpected node in train: '" + str(node[1]!) + "'.");
        }
    }

    if (build.length == 2) {
        let f = build.pop()!;
        let g = build.pop()!;

        return mod_prim(a => f(g(clone(a))), (a, b) => f(clone(a), g(clone(b))));
    } else return build[0]!;
}

