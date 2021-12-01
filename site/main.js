function RUNCODE(code, stdin, flags) {
    argv = Object.fromEntries(flags.split("").map(n=>[n,1]));
    out.innerText = "";
    if(stdin.length) env.I = ayr(stdin);
    runAyr(code);
}