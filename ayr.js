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
function A(d,r,b=0,str=0){this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;fix(this);this.str=str;
if(this.d.length==1&&this.d[0].b)this.d[0].b=0}
function MoD(f1,f2){this.f1=f1;this.f2=f2;this.bd=[];this.incomp=1;}
MoD.prototype.bind=function(...v){
  this.bd.push(...v);
  return this;
}
MoD.prototype.call=function(...a){
  if(this.bd.length+a.length>2)err(0)
  else if(this.bd.length){return this.f2.call(0,...this.bd,a[0])}
  else if(a.length>1)return this.f2.call(0,...a);
  else return this.f1.call(0,a[0]);
}
MoD.prototype.clone=function(){let mod=new MoD(this.f1,this.f2);mod.bd=this.bd;return mod}
A.prototype.rank=function(r){
  switch(Math.min(r,this.ds-1)){
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
    case 1:S+=`${this.b?'[ ':''}${this.str?String.fromCharCode(...this.d):this.d.map(str).join(" ")}${this.b?' ]':''}`;break;
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
A.prototype.clone=function(){return new A(this.d.map(n=>n.clone()),this.r,this.b,this.str)}
Number.prototype.call=function(...v){return +this;}
Number.prototype.bind=function(...v){return +this;}
Number.prototype.clone=function(){return +this;}
Number.prototype.ds=0;
Array.prototype.ds=1;
Array.prototype.clone=function(){return this;}
A.prototype.bind=function(...v){return this;}
A.prototype.call=function(...v){return this;}
const bc=arr=>arr instanceof A&&arr.d[0]&&arr.d[0].b
,sb=arr=>arr instanceof A&&arr.ds==1&&arr.r[0]==1
,op=(m,f)=>{let x=new MoD(m?f:null,m?null:f);x.m=m;return x}
,carr=v=>v instanceof A?v:new A([v],1)
,narr=(a,b=0,ba=0)=>new A(ba?a.map(n=>n instanceof A?(n.b=1,n):new A([n],1,1)):a,a.length,b)
,pon=(d,f,r,a,b)=>{
  if(typeof r!='object')r=[r,r]
  if(!d){
    a=carr(a)
    if(bc(a)&&r[1]<a.ds)return narr(a.rank(r[1]).d.map(n=>pon(d,f,r,n)))
    else if(r[1]>=a.ds)return f(a)
    else if(r[1]<a.ds)return narr(a.rank(r[1]).d.map(n=>pon(d,f,r,n)))
    else return narr(a.d.map(n=>f(n)))
  }else{
    a=carr(a),b=carr(b);
    if(a.ds-1>r[0]&&b.ds-1>r[1]&&r[0]==r[1]&&JSON.stringify(a.r)!=JSON.stringify(b.r))err(1);
    else{
      let na=r[0]>a.ds-1?new A([a],1):r[0]==0&&sb(a)?a.d[0]:a.rank(r[0])
         ,nb=r[1]>b.ds-1?new A([b],1):r[1]==0&&sb(b)?b.d[0]:b.rank(r[1])
      return narr(na.d.map((v,i)=>f(v,nb.d[i])),0,1)
    }
  }
}
,err=id=>{
  switch(id){
    case 0:throw("[0] ARG ERROR")
    case 1:throw("[1] RANK ERROR")
    case 2:throw("[2] DOMAIN ERROR")
    case 3:throw("[3] NAME ERROR")
    case 4:throw("[4] FILE ERROR")
    case 5:throw("[5] GROUP ERROR")
    default:throw(`[${id}] GENERIC ERROR`)
  }
}
,mod=(f,f2)=>
  f2?new MoD(f.bind(0),f2.bind(0)):f instanceof MoD?(f.f1=f.f1.bind(0),f.f2=f.f2.bind(0),f):new MoD(A=>f.call(A),(A,B)=>f.call(A,B))
,syms={
  "+":mod(pon.bind(0,0,a=>+a,0),pon.bind(0,1,(a,b)=>a+b,0)),
  "-":mod(pon.bind(0,0,a=>-a,0),pon.bind(0,1,(a,b)=>a-b,0)),
  "]":mod(pon.bind(0,0,a=>a,99),pon.bind(0,1,(a,b)=>b,99)),
  "[":mod(pon.bind(0,0,a=>a,99),pon.bind(0,1,(a,b)=>a,99)),
  "<":mod(pon.bind(0,0,a=>a instanceof A?(a.b=1,a):new A([a],[1],1)),pon.bind(0,1,(a,b)=>+(a<b),0)),
  ">":mod(pon.bind(0,0,a=>a instanceof A?a.b?(a.b=0,a):a.d[0]:a),pon.bind(0,1,(a,b)=>+(a>b),0)),
  "$":mod(pon.bind(0,0,a=>a instanceof A?narr(a.r):narr([0]),99),pon.bind(0,1,(a,b)=>{
    let nr=a instanceof A?a.d:[a]
    b=carr(b);
    let [lo,ln]=[b.r.reduce((a,b)=>a*b,1),nr.reduce((a,b)=>a*b,1)]
    if(lo==ln){b.r=nr;b.ds=nr.length;return b}
    else if(lo>ln){b.r=nr;b.d=b.d.slice(0,ln);b.ds=nr.length;return b}
    else{let nd=[];for(i=0;i<ln;i++)nd.push(b.d[i%lo]);return new A(nd,nr,b.b,b.str)}
  },99))
}
,bdrs={
  '&':op(0,(a,b)=>mod(
    l=>l==null?err(0):!a.incomp?b.call(a,l):!b.incomp?a.call(l,b):a.call(b.call(l))
   ,(l,r)=>l==null||r==null?err(0):!a.incomp||!b.incomp?err(0):a.call(b.call(l,r)))
  ),
  '"':op(1,f=>mod(l=>l==null?err(0):l.ds==0?new A([l],1,1):narr(l.rank(l.ds-1).d.map(n=>f.call(n)),0,1),(l,r)=>{
    if(l==null||r==null)err(0)
    else if(l.ds==0||sb(l)){let v=carr(r);return narr(v.rank(v.ds-1).d.map(n=>f.call(l,n)),0,1)}
    else if(r.ds==0||sb(r)){let v=carr(l);return narr(v.rank(v.ds-1).d.map(n=>f.call(n,r)),0,1)}
    else if(JSON.stringify(l.r)==JSON.stringify(r.r)){let F=l.rank(l.ds-1),S=r.rank(r.ds-1);return narr(F.d.map((n,i)=>f.call(n,S.d[i])),0,1)}
    else err(1)
  }))
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
  let f=a.d.reduce((acc,x)=>acc||x instanceof A,false)
  if(f)f=a.d.length>1&&a.d.slice(1).reduce((acc,b)=>acc||JSON.stringify(a.d[0].r)!=JSON.stringify(b.r),false)
  if(f)a.d=a.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1))
}
,str=s=>s.toString()
,resc=r=>r.replace(/[^A-Za-z0-9_]/g,'\\$&')
,mex=f=>f.incomp?f:f.call()
,nnw=(t,i)=>{
  let o=1;
  while(t[i+o]&&t[i+o].t==9)o++;
  return t[i+o]?[i+o,t[i+o]]:[i+o,t[i+o-1]];
}
,inst=o=>o.t<2||o.t==4||o.t==7&&!env[o.v].incomp||o.t==8&&!o.v.incomp
,lex=s=>{
  let test,
      toks=[];
  while(s){
    if(test=/^(_?[0-9]*\.?[0-9]+)/.exec(s))toks.push({t:0,v:+test[1].replace(/_/g,'-')});
    else if(test=/^'((?:[^']|\\')*)'/.exec(s))toks.push({t:1,v:new A(test[1].split("").map(c=>c.charCodeAt(0)),test[1].length,0,1)});
    else if(test=/^;/.exec(s))toks.push({t:5});
    else if(test=/^:/.exec(s))toks.push({t:6});
    else if(test=RegExp(`^(${Object.keys(syms).map(resc).join('|')})`).exec(s))toks.push({t:2,v:test[1]});
    else if(test=RegExp(`^(${Object.keys(bdrs).map(resc).join('|')})`).exec(s))toks.push({t:3,v:test[1]});
    else if(test=/^(\s)/.exec(s))toks.push({t:9,v:test[1]});
    else if(test=/^([a-zA-Z]+)/.exec(s))toks.push({t:7,v:test[1]});
    else if(test=/^\(|\)/.exec(s))toks.push({t:2,v:test[0]})
    else err(3)
    s=s.slice(test&&test[0].length||1);
  }
  return toks;
}
,grp=t=>{
  let tn=[]
      ,b=[]
      ,ig=0
      ,oc=0;
  for(let i=0;i<=t.length;i++){
    if(ig){
      if(t[i]==null)err(5)
      else if(t[i].t==2&&t[i].v=='('){b.push(t[i]);oc++}
      else if(t[i].t==2&&t[i].v==')'){
        if(oc==0){tn.push({t:8,v:exec(strand(grp(b)),1)});ig=0;oc=0;b=[]}
        else{b.push(t[i]);oc--}
      }else b.push(t[i])
    }else if(t[i]!=null&&t[i].t==2&&t[i].v=='(')ig=1
    else if(t[i]!=null&&t[i].t==2&&t[i].v==')')err(5)
    else if(t[i]!=null)tn.push(t[i])
  }
  return tn
}
,strand=t=>{
  if(t.length==1)return t
  let tn=[]
      ,b=[]
      ,bn=[];
  for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&t[i].t==5){bn.push(b);b=[]}
    else if(t[i]!=null&&inst(t[i]))b.push(t[i]);
    else if((t[i]==null||t[i].t==9&&t[i].v=='\n'||t[i].t==2||t[i].t==3||t[i].t==7||t[i].t==8)&&b.length==1&&bn.length==0)
      tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else if((t[i]==null||!(t[i].t==9&&t[i].v==' '))&&b.length){
      if(bn.length){
        let s,bx=0;
        bn=bn.concat([b]);
        if(!bn.reduce((acc,x)=>acc&&x.length==bn[0].length)
          ||bn.reduce((acc,x)=>acc||(x[0] instanceof A&&x[0].d.length!=bn[0].length),false)){
          s=bn.map(n=>new A(n.map(n=>n.t==1||n.t==4?(n.v.b=1,n.v):n.v),n.length,1));
          bx=1;
        }else s=bn.flat().map(n=>n.t==1||n.t==4?(n.v.b=1,n.v):n.v);
        let t4={t:4,v:new A(s,bx?s.length:[s[0].b?1:bn[0].length,bn.length])};
        tn.push(...(t[i]!=null?[t4,t[i]]:[t4]))
        bn=[]
      }else{
        let a=narr(b.map(n=>n.t==1||n.t==4?(n.v.b=1,n.v):n.v))
        tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]))
      }
      b=[]
    }
    else tn.push(t[i]);
  return tn.filter(n=>n!=null);//sometimes happens
}
,ptrain=(t,G=0)=>{
  if(t.length==1)return t[0];
  if(!t[t.length-1].incomp)G=0
  let tn=[];
  if(G){//train
    for(let i=t.length-1;i>=0;i--)
      if(i>=1&&t[i].incomp&&!t[i-1].incomp){t.splice(i-1,2,t[i].bind(t[i-1]));i--}
    tn=t.map(n=>n.clone())
    for(let i=tn.length-1;i>=0;){
      if(i>=2&&t[i-1].incomp){i-=2;tn.splice(i,0,mod(
        A=>t[i+1].call(t[i].call(A),t[i+2].call(A)),
        (A,B)=>t[i+1].call(t[i].call(A,B),t[i+2].call(A,B)),
      ))}else if(i>=1){
        i-=1;tn.splice(i,0,mod(
          A=>t[i].call(t[i+1].call(A)),
          (A,B)=>t[i].call(A,t[i+1].call(B)),
        ))
      }else i--
    }
    return tn[0]
  }else{//normal
    if(t[t.length-1].incomp)return ptrain(t,1);
    tn.push(t[t.length-1]);
    for(let i=t.length-2;i>=0;i--){
      if(t[i-1]!=null&&!(t[i-1]instanceof MoD)){
        let x=tn.pop();
        i--;
        tn.push(mod(A=>t[i+1].call(t[i].call(),x.call()),(A,B)=>t[i+1].call(t[i].call(),x.call())));
      }else {let x=tn.pop();tn.push(mod(A=>t[i].call(x.call()),(A,B)=>t[i].call(x.call())))}
    }
    let x = tn.pop();
    x.incomp=0;
    return x
  }
}
,exec=(t,G=0)=>{
  let fq=[]
  for(let i=0;i<t.length;i++){
    let o=t[i];
    if(o.t==9&&o.v=='\n'&&fq.length){
      let x=ptrain(fq,G).call();
      if(!G&&x!=null)console.log(x.toString())
      fq=[]
    }
    if(o.t==7){
      if(nnw(t,i)[1].t==6){[i,]=nnw(t,i);err(5)} // TODO: declaration
      else if(env[o.v]&&env[o.v].incomp)fq.push(env[o.v])
      else if(env[o.v]!=null)q.push(env[o.v])
      else err(3)
    }else if(o.t==2||o.t==8&&o.v.incomp){
      let [ni,b]=nnw(t,i);
      if(inst(b)||b.t==8){
        i=ni
        if(b.t==8){
          if(b.v.incomp)fq.push((o.t==8?o.v:syms[o.v]).bind(0,q.pop()),ptrain(b.v,1));
          else {
            fq.push(o.t==8?o.v:syms[o.v],b.v)
          }
        }else fq.push(o.t==8?o.v:syms[o.v],b.v)
      }else fq.push(o.t==8?o.v:syms[o.v]);
    }else if(o.t==3){
      if(!fq.length)err(0)
      else if(!bdrs[o.v].m){
        [i,f]=nnw(t,i);
        if(!inst(f)&&f.t!=2)err(0);
        fq.push(bdrs[o.v].call(fq.pop(),inst(f)?f.v:syms[f.v]))
      }else fq.push(bdrs[o.v].call(fq.pop()))
    }else if(o.t<2||o.t==4||o.t==8){
      if(t.slice(i,nnw(t,i)[0]-i).reduce((a,b)=>a||b.t==9&&b.v=='\n',false)){
        if(G&&nnw(t,i)[0]+1>=t.length)return o.v;
        else if(!G)console.log(o.v.toString())
      }else fq.push(o.v);
    }
  }
  if(fq.length){
    if(fq[fq.length-1].incomp)err(0)
    else var x=ptrain(fq,G)
    if(G)return mex(x);else{x=x.call();if(x!=null)console.log(x.toString())}
  }
}
,run=d=>{try{exec(strand(grp(lex(d))))}catch(e){console.error(e)}}
if(argv._[0]=='help'||argv.h||argv.help)console.log(`ayr ${require('./package.json').version}:
Usage:
    ayr <file> - run a file
    ayr -u <code> - run the code`),process.exit(0);
if(argv.u)run(argv.u)
else if(!argv._.length){
  console.log(`ayr ${require('./package.json').version}: type 'exit' to exit`)
  while((inp=rl.question('\t'))&&inp!="exit"){
    run(inp)
    //what the fuck javascript
    Object.values(syms).forEach(mod=>{mod.bd=[]})
    Object.values(bdrs).forEach(mod=>{mod.bd=[]})
    Object.values(env).forEach(mod=>{if(mod.incomp)mod.bd=[]})
  }
}else f.readFile(
  __dirname+"/"+argv._[0],
  'utf8',
  (e,d)=>e?err(4):run(d.replace(/\r\n/g,"\n").trim())
)