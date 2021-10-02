#!/usr/bin/env node
// t:
//  0 -> int
//  1 -> char[]
//  2 -> symbol
//  3 -> binder
//  4 -> arr
//  5 -> ;
//  6 -> :
//  7 -> var
//  8 -> group
//  9 -> whitespace
let f=require('fs'),
    argv=require('minimist')(process.argv.slice(2)),
    rl=require('readline-sync');
function A(d,r,b=0){this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;fix(this)}
function MoD(f1,f2){this.f1=f1;this.f2=f2;this.bd=[];this.incomp=1;}
MoD.prototype.bind=function(...v){
  if(v[1]!=null)this.bd.push(...v);
  return this;
}
MoD.prototype.call=function(...a){
  if(this.bd.length){this.f2=this.f2.bind(...this.bd);return this.f2.call(0,a[0])}
  else if(a.length>1)return this.f2.call(0,a[0],a[1]);
  else return this.f1.call(0,a[0]);
}
A.prototype.rank=function(r){
  switch(r){
    case 0:return new A(this.d,this.r,this.b);
    case 1:return chnk(this.d,this.r[this.r.length-1]);
    case 2:return chnk(chnk(this.d,this.r[this.r.length-2]),this.r[this.r.length-1]);
    default:err(1);
  }
}
A.prototype.toString=function(){
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
    default:err(1);
  }
  return S.trim();
}
Number.prototype.call=function(...v){return this;}
Number.prototype.bind=function(...v){return this;}
Number.prototype.ds=0;
Array.prototype.ds=1;
A.prototype.bind=function(...v){return this;}
A.prototype.call=function(...v){return this;}
const bc=arr=>arr instanceof A&&arr.d[0]&&arr.d[0].b
,sb=arr=>arr instanceof A&&arr.ds==1&&arr.r[0]==1
,pon=(d,f,r,a,b)=>{
  if(!d){
    if(bc(a)&&r<a.ds)return new A(a.rank(r).d.map(n=>pon(d,f,r,n)),a.r,a.b);
    else if(r>=a.ds)return f(a);
    else if(r<a.ds)return new A(a.rank(r).d.map(n=>pon(d,f,r,n)),a.r,a.b);
    else return new A(a.d.map(n=>f(n)),a.r,a.b);
  }else{
    if(a.ds>r&&b.ds>r&&JSON.stringify(a.r)!=JSON.stringify(b.r))err(1);
    if(a.ds<b.ds)return pon(d,f,r,b,a)//lower last
    else if(bc(a)||r<a.ds&&!sb(a)){
      return new A(a.rank(r).d.map((v,i)=>pon(d,f,r,v,sb(b)?b.d[0]:b.ds==0?b:b.rank(r).d[i])),a.r,a.b);
    }else if((r>=a.ds||sb(a))&&(r>=b.ds||sb(b)))return f(sb(a)?a.d[0]:a,sb(b)?b.d[0]:b);
    else return new A(a.rank(r).d.map((v,i)=>pon(d,f,r,v,b.ds==0?b:b.d[i])),a.r,a.b);
  }
}
,err=id=>{
  switch(id){
    case 0:console.error("[0] ARG ERROR");break;
    case 1:console.error("[1] RANK ERROR");break;
    case 2:console.error("[2] DOMAIN ERROR");break;
    case 3:console.error("[3] NAME ERROR");break;
    case 4:console.error("[4] FILE ERROR");break;
    default:console.error(`[${id}] GENERIC ERROR`);break;
  }
  process.exit(id);
}
,mod=(f,f2)=>
  f2?new MoD(f.bind(0),f2.bind(0)):f instanceof MoD?(f.f1=f.f1.bind(0),f.f2=f.f2.bind(0),f):new MoD(A=>f.call(A),(A,B)=>f.call(A,B))
,syms={
  "+":mod(pon.bind(0,0,a=>+a,0),pon.bind(0,1,(a,b)=>a+b,0)),
  "-":mod(pon.bind(0,0,a=>-a,0),pon.bind(0,1,(a,b)=>a-b,0)),
  "]":mod(a=>a,(a,b)=>b),
  "[":mod(a=>a,(a,b)=>a),
  "<":mod(a=>a instanceof A?(a.b=1,a):new A([a],[1],1),pon.bind(0,1,(a,b)=>+(a<b),99)),
  ">":mod(a=>a instanceof A?a.b?(a.b=0,a):a.d[0]:a,pon.bind(0,1,(a,b)=>+(a>b),99))
}
,bdrs={
  '.':[(a,b)=>r=>a(b(r)),(a,b)=>(l,r)=>a(l,b(r))],
  '"':[(a,b)=>r=>a(b(r)),(a,b)=>(l,r)=>a(b(l,r))]
}
,env={
  put:mod(A=>console.log(A.toString()),(A,B)=>console.log((B.toString()+"\n").repeat(+A.call()).trim()))
}
,chnk=(a,s)=>{
  let n=[],
      b=0;
  for(let x,i=0;i<a.length;i+=s){
    if(i+s>a.length){b=1;n=n.map(e=>eval('e.b=1;e'))}
    x=a.slice(i,Math.min(a.length,i+s));n.push(new A(x,Math.min(a.length,i+s)-i))
  };
  return new A(n,n.length==1?1:[1,n.length],b);
}
,fix=a=>{
  let f=0;for(v of a.d)if(v instanceof A&&v.b)f=1;if(f)a.d=a.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1))
}
,str=s=>s.toString()
,resc=r=>r.replace(/[^A-Za-z0-9_]/g,'\\$&')
,nnw=(t,i)=>{
  let o=1;
  while(t[i+o]&&t[i+o].t==9)o++;
  return t[i+o]?[i+o,t[i+o]]:[i+o,t[i+o-1]];
}
,inst=o=>o.t<2||o.t==4||o.t==8
,lex=s=>{
  let test,
      toks=[];
  while(s){
    if(test=/^(_?[0-9]*\.?[0-9]+)/.exec(s))toks.push({t:0,v:+test[1].replace(/_/g,'-')});
    else if(test=/^'((?:[^']|\\')*)'/.exec(s))toks.push({t:1,v:new A(test[1].split("").map(c=>c.charCodeAt(0)),test[1].length)});
    else if(test=/^;/.exec(s))toks.push({t:5});
    else if(test=/^:/.exec(s))toks.push({t:6});
    else if(test=RegExp(`^(${Object.keys(syms).map(resc).join('|')})`).exec(s))toks.push({t:2,v:test[1]});
    else if(test=RegExp(`^(${Object.keys(bdrs).map(resc).join('|')})`).exec(s))toks.push({t:3,v:test[1]});
    else if(test=/^(\s)/.exec(s))toks.push({t:9,v:test[1]});
    else if(test=/^([a-zA-Z]+)/.exec(s))toks.push({t:7,v:test[1]});
    s=s.slice(test&&test[0].length||1);
  }
  return toks;
}
// TODO: This should work for groups too
,strand=t=>{
  let tn=[],
      b=[],
      bn=[];
  for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&t[i].t==5){bn.push(b);b=[]}
    else if(t[i]!=null&&(t[i].t<2||(t[i].t==7&&!env[t[i].v].incomp)))b.push(t[i]);
    else if((t[i]==null||t[i].t==9&&t[i].v=='\n'||t[i].t==2||t[i].t==3||t[i].t==7)&&b.length==1)
      tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else if((t[i]==null||!(t[i].t==9&&t[i].v==' '))&&b.length){
      if(bn.length){
        let s,bx=0;
        bn=bn.concat([b]);
        if(!bn.reduce((acc,x)=>acc&&x.length==bn[0].length)){
          s=bn.map(n=>new A(n.map(n=>n.t==1||n.t==4?new A(n.v,n.v.length,1):n.v),n.length,1));
          bx=1;
        }else s=bn.flat().map(n=>n.t==1||n.t==4?new A(n.v,n.v.length,1):n.v);
        let t4={t:4,v:new A(s,bx?s.length:[s[0].b?1:bn[0].length,bn.length])};
        tn.push(...(t[i]!=null?[t4,t[i]]:[t4]))
        bn=[]
      }else{
        b=b.map(n=>n.t==1?new A(n.v,[n.v.length],1):n.v);
        let a=new A(b,b.length,0);
        tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]))
      }
      b=[]
    }
    else tn.push(t[i]);
  return tn;
}
,ptrain=(t,G=0)=>{
  if(t.length==1)return t[0];
  let tn=[];
  if(G){//train
    for(let i=t.length-1;i>=0;i--){
      if(i>=2){i-=2;tn.push(mod(
        A=>t[i+1].call(t[i].call(A),t[i+2].call(A)),
        (A,B)=>t[i+1].call(t[i].call(A,B),t[i+2].call(A,B)),
      ))}else{
        i-=1;
        if(!(t[i]instanceof MoD))tn.push(mod(A=>t[i+1].call(t[i],A),(A,B)=>err(0)));
        else tn.push(mod(
          A=>t[i].call(t[i+1].call(A)),
          (A,B)=>t[i].call(A,t[i+1].call(B)),
        ))
      }
    }
    return ptrain(tn,G);
  }else{//normal
    tn.push(t[t.length-1]);
    for(let i=t.length-2;i>=0;i--){
      if(t[i-1]!=null&&!(t[i-1]instanceof MoD)){
        let x=tn.pop();
        i--;
        tn.push(mod(A=>t[i+1].call(t[i].call(),x.call()),(A,B)=>t[i+1].call(t[i].call(),x.call())));
      }else {let x=tn.pop();tn.push(mod(A=>t[i].call(x.call()),(A,B)=>t[i].call(x.call())))}
    }
    return tn.pop();
  }
}
,exec=(t,G=0)=>{
  let fq=[]
  for(let i=0;i<t.length;i++){
    let o=t[i];
    if(o.t==9&&o.v=='\n'&&fq.length){
      if(!G)console.log(ptrain(fq).call().toString())
      fq=[]
    }
    if(o.t==7){
      if(nnw(t,i)[1].t==6){[i,]=nnw(t,i);err(5)} // TODO: declaration
      else if(env[o.v]&&env[o.v].incomp)fq.push(env[o.v])
      else if(env[o.v]!=null)q.push(env[o.v])
      else err(3)
    }else if(o.t==2){
      if(inst(nnw(t,i)[1])){
        let b;
        [i,b]=nnw(t,i);
        if(b.t==8){
          let t=ptrain(b.v);
          if(t.incomp)fq.push(syms[o.v].bind(0,q.pop()),t);
          else {
            fq.push(ptrain(fq).call(t.call()));
            fq=[]
          }
        }else fq.push(syms[o.v],b.v)
      }else fq.push(syms[o.v]);
    }else if(o.t<2||o.t==4){
      if(t.slice(i,nnw(t,i)[0]-i).reduce((a,b)=>a||b.t==9&&b.v=='\n',false)){
        if(G&&nnw(t,i)[0]+1>=t.length)return o.v.toString();
        else if(!G)console.log(o.v.toString())
      }else fq.push(o.v);
    }
  }
  if(fq.length){let x=ptrain(fq).call();if(G)return x;else if(x!=null)console.log(x.toString())}
}
if(argv._[0]=='help'||argv.h||argv.help)console.log(`UMBR ${require('./package.json').version}:
Usage:
    umbr <file> - run a file
    umbr -u <code> - run the code`),process.exit(0);
if(argv.u)exec(strand(lex(argv.u)))
else if(!argv._.length){
  console.log(`UMBR ${require('./package.json').version}: type 'exit' to exit`)
  while((inp=rl.question('\t'))&&inp!="exit")exec(strand(lex(inp)))
}else f.readFile(
  __dirname+"/"+argv._[0],
  'utf8',
  (e,d)=>e?err(4):exec(strand(lex(d.replace(/\r\n/g,"\n").trim())))
)