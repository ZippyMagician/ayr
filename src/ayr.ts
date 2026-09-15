// import { primitive } from "./utils"
// import { Value } from "./value"
import { ayr } from "./eval"
import { Env } from "./env"

import { Command } from "commander"
const program = new Command();

import * as readline from "node:readline/promises"
const pkg = require('./package.json');

async function cli(_options: { string: string[] }) {
    console.log("ayr: type 'exit' to exit.");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.on('SIGINT', () => rl.close());

    let env = new Env();
    while (true) {
        let prompt = await rl.question("    ");
        if (prompt == "exit") break;
        try {
            let output = ayr(prompt, env);
            if (output) console.log(output.toString());
        } catch (e) {
            console.log(e);
        }
    }

    rl.close();
    process.exit(0);
}

async function run_file(file: string, options: { string: string[] }) {
    console.log(file);
    console.log(options);
    process.exit(0);
}

program
    .name('ayr')
    .description(pkg.description)
    .version(pkg.version);

program
    .option('-0', '0-indexed lists instead of 1');

program.command('run')
    .description('Run from a file')
    .argument('<file>', 'file to run')
    .option('-i, --input <string>', 'alternative to STDIN input')
    .action(run_file);

program.command('cli')
    .description('Run the ayr CLI')
    .action(cli);

program.parse();

