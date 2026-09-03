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
        err(3, `Undefined literal '${node[1]! as string}.`);
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
export function ayr_eval(nodes: Node[], env: Env, preserve: boolean = false): Value {
    let stack: Value[] = [];

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
                node = [NodeType.Block, lit.eval<Module>()];
            case NodeType.Symbol:
            case NodeType.Train:
            case NodeType.Block:
                if (!stack.length) err(5);
                let right = stack.pop()!;
                if (i == 0 || !is_instant(nodes[i - 1]!, env)) stack.push(as_mod(node)(right));
                else {
                    let left = as_val(nodes[--i]!);
                    stack.push(as_mod(node)(left, right));
                }
                break;
            case NodeType.Line:
                // Clear stack.
                if (!preserve) stack = [];
                break;
            default:
                err(-1, `TODO: Implement evaluation for node '${node}'`);
        }
    }

    return stack.pop()!;
}

// For partial execution in the parsing step.
export function ayr_partial(nodes: Node[], env: Env): Value {
   return ayr_eval(nodes, env, true); 
}

// TODO: Currently doesn't work fully.
export function ayr(program: string): Value {
    let env = new Env();
    env.set("puts", mod_prim(a => {
        let s = str(a);
        process.stdout.write(s + "\n");
        return primitive(s.length);
    }, (a, b) => {
        let s = str(b);
        let i, n;
        for (i = 0, n = +a.as_num(); i < n; i++) process.stdout.write(s);
        console.log();
        return primitive(n * s.length);
    }));
    return ayr_eval(parse_nodes(lex(program), env), env);
}

