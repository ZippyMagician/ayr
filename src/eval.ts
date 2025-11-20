import { Value } from "./value"
import { err, Module, str, primitive } from "./utils"
import { Symbols } from "./syms"
import { Node, NodeType, parse_nodes } from "./parse"
import { lex } from "./lex"
import { Env } from "./env"

function is_instant(node: Node, env: Env): boolean {
    let type = node[0]!;
    if (type == NodeType.Instant) return true;
    if (type == NodeType.Literal) err(-1, "TODO: Evaluate if literal is an instant (./eval.ts)");

    return false;
}

function as_val(node: Node): Value {
    return node[1]! as Value;
}

function as_mod(node: Node): Module {
    return node[1]! as Module;
}

// TODO: Currently line-by-line basic. Keep?
export function ayr_eval(nodes: Node[]): Value {
    let env = new Env();
    let stack: Value[] = [];

    for (let i = nodes.length - 1; i >= 0; i--) {
        let node = nodes[i]!;
        switch (node[0]!) {
            case NodeType.Instant:
                stack.push(as_val(node));
                break;
            case NodeType.Literal:
                err(-1, "TODO: Implement evaluation of literals.");
            case NodeType.Symbol:
            case NodeType.Train:
                if (!stack.length) err(5);
                let right = stack.pop()!;
                if (i == 0 || !is_instant(nodes[i - 1]!, env)) stack.push(as_mod(node)(right));
                else {
                    let left = as_val(nodes[--i]!);
                    stack.push(as_mod(node)(left, right));
                }
                break;
            default:
                err(-1, `TODO: Implement evaluation for node '${node}'`);
        }
    }

    return stack.pop()!;
}

// TODO: Currently doesn't work fully.
export function ayr(program: string): Value {
    return ayr_eval(parse_nodes(lex(program)));
}

