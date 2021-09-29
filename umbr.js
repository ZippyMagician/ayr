#!/usr/bin/env node
// t:
//  0 -> int
//  1 -> char[]
//  2 -> symbol
//  3 -> binder
//  4 -> arr
//  5 -> ;
//  6 -> :
function A(d,r,b=0){this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;
fix(this)}
A.prototype.toString = function(){
  let S="";
  let r=this.r.reverse();
  while(r.length>1)this.d=chnk(this.d,r.pop());
  switch(this.ds){
    case 1:S+=`${this.b?'[ ':''}${this.d.map(str).join(" ")}${this.b?' ]':''}`;break;
    case 2:
      let l=Math.max(...this.d.d.map(n=>Math.max(...n.d.map(r=>str(r).length))))
      let f=1,
          ind=0;
      if(this.b){S+='[ ';ind=2}
      for(x of this.d.d){
        if(!f)S+=' '.repeat(ind);
        else f=0;
        if(x.b)S+='[ ';
        for(y of x.d)S+=(x.b?" ":" ".repeat(l-str(y).length))+str(y)+" ";
        if(x.b)S=S.trim()+']';
        S+='\n';
      };
      if(this.b)S=S.trim()+' ]';break;
  }
  return S;
}
const syms="+-".split("")
     ,bdrs='."'.split("")

,chnk=(a,s)=>{
  let n=[],
      b=0;
  for(let x,i=0;i<a.length;i+=s){
    if(i+s>a.length){b=1;n=n.map(e=>eval('e.b=1;e'))}
    x=a.slice(i,Math.min(a.length,i+s));n.push(new A(x,Math.min(a.length,i+s)-i))
  };
  return new A(n,[b?1:s,n.length],b);
}
,fix=a=>{
  let f=0;for(v of a.d)if(v instanceof A&&v.b)f=1;if(f)a.d=a.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1))
}
,str=s=>s.toString()
,resc=r=>r.replace(/[^A-Za-z0-9_]/g,'\\$&')
,lex=s=>{
  let test,
      toks=[];
  while(s){
    if(test=/^(-?[0-9]*\.?[0-9]+)/.exec(s))toks.push({t:0,v:+test[1]});
    else if(test=/^'((?:[^']|\\')*)'/.exec(s))toks.push({t:1,v:test[1].split("").map(c=>c.charCodeAt(0))});
    else if(test=/^;/.exec(s))toks.push({t:5});
    else if(test=/^:/.exec(s))toks.push({t:6});
    else if(test=RegExp(`^(${syms.map(resc).join('|')})`).exec(s))toks.push({t:2,v:test[1]});
    else if(test=RegExp(`^(${syms.map(bdrs).join('|')})`).exec(s))toks.push({t:3,v:test[1]});
    s=s.slice(test[0].length).trim();
  }
  return toks;
},
strand=t=>{
  let tn=[],
      b=[];
  for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&t[i].t<2)b.push(t[i]);
    else if(b.length==1)tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else {
      for(x in b)if(b[x].t==1)b[x]=new A(b[x].v,[b[x].v.length],1);else b[x]=b[x].v;
      let a=new A(b,b.length,0);
      tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]))
      b=[]
    }
  return tn;
}
console.log(strand(lex(process.argv[2])));