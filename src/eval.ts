import { Value } from "./value"
import { err, Module, str, mod_prim, primitive } from "./utils"
import { Symbols } from "./syms"
import { Node, NodeType, parse_nodes } from "./parse"
import { lex } from "./lex"
import { Env } from "./env"

export function is_instant(node: Node, env: Env): boolean {
    let type = node[0]!;
    if (type == NodeType.Instant) return true;
    if (type == NodeType.Literal) try {
        let maybe = env.get(node[1]! as string);
        return maybe.is_instant();
    } catch (e) {
        return false;
        // err(3, `Undefined literal '${node[1]! as string}.`);
    }

    return false;
}

function as_val(node: Node): Value {
    return node[1]! as Value;
}

function as_mod(node: Node): Module {
    return node[1]! as Module;
}

// TODO: Currently line-by-line basic. Keep?
export function ayr_eval(node_lines: Node[], env: Env, preserve: boolean = false): Value {
    let stack: Value[] = [];

    let nodes_parsed = node_lines.reduce((acc, node) => {
        if (node[0] == NodeType.Line) {
            acc[acc.length - 1]!.push(node);
            acc.push([]);
        } else acc[acc.length - 1]!.push(node);
        return acc;
    }, [[]] as Node[][]);
    let lineskip = 0;
    for (let line = 0; line < nodes_parsed.length; line++) {
        const nodes = nodes_parsed[line]!;

        // If statements
        if (nodes[0] && nodes[0]![0] == NodeType.IfStatement) {
            let top: Node = nodes.shift()!;
            if (!+(top[1] as ((_: Env) => Value))(env).as_num()) continue;
            else lineskip++;
        }
        for (let i = nodes.length - 1; i >= 0; i--) {
            let node = nodes[i]!;
            switch (node[0]!) {
                case NodeType.Instant:
                    stack.push(as_val(node));
                    break;
                case NodeType.Literal:
                    let lit = env.get(node[1]! as string);
                    if (lit.is_instant()) {
                        stack.push(lit.eval<Value>());
                        break;
                    }
                    node = [NodeType.Executable, lit.eval<Module>()];
                case NodeType.Executable:
                    if (!stack.length) err(5);
                case NodeType.LazyExecutable:
                    if (!stack.length) break;
                    let right = stack.pop()!;
                    if (i == 0 || !is_instant(nodes[i - 1]!, env)) stack.push(as_mod(node)(right));
                    else {
                        let left = as_val(nodes[--i]!);
                        stack.push(as_mod(node)(left, right));
                    }
                    break;
                case NodeType.Line:
                    // Clear stack.
                    if (lineskip > 0) {
                        lineskip--;
                        line++;
                    } // else if (!preserve) stack = [];
                    break;
                case NodeType.IfStatement:
                    err(-1, "eval.ts::ayr_eval | Unreachable.");
                default:
                    err(-1, `TODO: Implement evaluation for node '${node}'`);
            }
        }
    }

    return stack.pop()!;
}

// For partial execution in the parsing step.
export function ayr_partial(nodes: Node[], env: Env): Value {
   return ayr_eval(nodes, env, true); 
}

export function ayr(program: string, env?: Env): Value {
    env ??= new Env();
    return ayr_eval(parse_nodes(lex(program), env), env);
}

