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
let f=require('fs')
function A(d,r,b=0){this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;
fix(this)}
function MoD(f1,f2){this.f1=f1;this.f2=f2;this.bd=[];this.incomp=1;}
MoD.prototype.bind=function(...v){
  if(v[0]!=null)this.bd.push(...v);
  return this;
}
MoD.prototype.call=function(...a){
  if(this.bd.length){this.f2=this.f2.bind(...this.bd);return this.f2.call(0,a[0])}
  else if(a.length>1)return this.f2.call(0,a[0],a[1]);
  else return this.f1.call(a[0]);
}
A.prototype.rank=function(r){
  switch(r){
    case 0:return this.d;
    case 1:return chnk(this.d,this.r[this.r.length-1]);
    case 2:return chnk(chnk(this.d,this.r[this.r.length-1]),this.r[this.r.length-2]);
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
  return S;
}
const pon=(d,f,r,a,b)=>{
  if(!d){
    if(r>=a.ds)return f(a);
    else if(r==1){let n=a.rank(1).d.map(n=>pon(0,f,0,n));return new A(n.flat(),a.r,a.b)}
    else return new A(a.d.map(n=>f(n)),a.r,a.b);
  }else{
    if(JSON.stringify(a.r)!=JSON.stringify(b.r))err(1);
    if(r>=a.ds)return f(a,b);
    else if(r==1){let b=b.rank(1);let n=a.rank(1).d.map((n,i)=>pon(0,f,0,n,b.d[i]));return new A(n.flat(),a.r,a.b)}
    else return new A(a.d.map((n,i)=>f(n,b.d[i])),a.r,a.b);
  }
}
,err=id=>{
  switch(id){
    case 0:console.error("[0] ARG ERROR");break;
    case 1:console.error("[1] RANK ERROR");break;
    case 2:console.error("[2] DOMAIN ERROR");break;
    case 3:console.error("[3] NAME ERROR");break;
    case 4:console.error("[4] FILE ERROR");break;
    default:console.error("[_] ERROR");break;
  }
  process.exit(1);
}
,syms={
  "+":new MoD(pon.bind(0,0,a=>+a,0),pon.bind(0,1,(a,b)=>a+b,0)),
  "-":new MoD(pon.bind(0,0,a=>-a,0),pon.bind(0,1,(a,b)=>a-b,0)),
}
,bdrs={
  '.':[(a,b)=>r=>a(b(r)),(a,b)=>(l,r)=>a(l,b(r))],
  '"':[(a,b)=>r=>a(b(r)),(a,b)=>(l,r)=>a(b(l,r))]
}
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
,nnw=(t,i)=>{
  let o=1;
  while(t[i+o]&&t[i+o].t==9)o++;
  return t[i+o]?[i+o,t[i+o]]:[i+o,t[i+o-1]];
}
,inst=o=>o.t<2||o.t==8
,lex=s=>{
  let test,
      toks=[];
  while(s){
    if(test=/^(_?[0-9]*\.?[0-9]+)/.exec(s))toks.push({t:0,v:+test[1].replace(/_/g,'-')});
    else if(test=/^'((?:[^']|\\')*)'/.exec(s))toks.push({t:1,v:test[1].split("").map(c=>c.charCodeAt(0))});
    else if(test=/^;/.exec(s))toks.push({t:5});
    else if(test=/^:/.exec(s))toks.push({t:6});
    else if(test=RegExp(`^(${Object.keys(syms).map(resc).join('|')})`).exec(s))toks.push({t:2,v:test[1]});
    else if(test=RegExp(`^(${Object.keys(bdrs).map(resc).join('|')})`).exec(s))toks.push({t:3,v:test[1]});
    else if(test=/^(\s)/.exec(s))toks.push({t:9,v:test[1]});
    else if(test=/^([a-zA-Z]+)/.exec(s))toks.push({t:7,v:test[1]});
    s=s.slice(test&&test[0].length||1);
  }
  return toks;
},
// TODO: This should work for groups too
strand=t=>{
  let tn=[],
      b=[];
  for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&(t[i].t<2||t[i].t==7))b.push(t[i]);
    else if((t[i]==null||t[i].t==9&&t[i].v=='\n'||t[i].t==2||t[i].t==3)&&b.length==1)
      tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else if((t[i]==null||!(t[i].t==9&&t[i].v==' '))&&b.length){
      for(x in b)if(b[x].t==1)b[x]=new A(b[x].v,[b[x].v.length],1);else b[x]=b[x].v;
      let a=new A(b,b.length,0);
      tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]))
      b=[]
    }
  return tn;
},
ptrain=t=>{
  if(t.length==1)return t[0];
  let tn=[];
  for(let i=t.length-1;i>=0;i--){
    if(i>=2){t-=2;tn.push(new MoD(
      (A=>t[i+1].call(t[i].call(A),t[i+2].call(A))).bind(0),
      ((A,B)=>t[i+1].call(t[i].call(A,B),t[i+2].call(A,B))).bind(0),
    ))}else{t-=1;tn.push(new MoD(
      (A=>t[i].call(t[i+1].call(A))).bind(0),
      ((A,B)=>t[i].call(A,t[i+1].call(B))).bind(0),
    ))}
  }
  return ptrain(tn);
}
exec=t=>{
  let q=[],
      fq=[],
      env={};
  for(let i=0;i<t.length;i++){
    let o=t[i];
    if(o.t==9&&o.v=='\n'&&fq.length){
      if(q.length)console.log(ptrain(fq).call(q.pop()).toString())
      else err(0)
      fq=[]
    }
    if(o.t==7){
      if(nnw(t,i)[1].t==6){[i,]=nnw(t,i);err(5)} // TODO: declaration
      else if(env[o.v]&&env[o.v].incomp){
        if(env[o.v].m==1)fq.push(env[o.v]);
        else if(!q.length)err(0);
        else fq.push(env[o.v].bind(0,q.pop()));
      } else if(env[o.v]!=null)q.push(env[o.v]);
      else err(3);
    }else if(o.t==2){
      if(inst(nnw(t,i)[1])){
        let b;
        [i,b]=nnw(t,i);
        if(b.t==8){
          let t=ptrain(b.v);
          if(t.incomp)fq.push(syms[o.v].bind(0,q.pop()),t);
          else {
            q.push(ptrain(fq).call(...(q.length?[q.pop(),t.call()]:[t.call()])))
            fq=[]
          }
        }
      } else fq.push(syms[o.v].bind(0,q.pop()));
    }else if(o.t<2||o.t==4){
      if(t.slice(i,nnw(t,i)[0]-i).reduce((a,b)=>a||b.t==9&&b.v=='\n',false))console.log(o.v.toString());
      else q.push(o.v);
    }
  }
  if(fq.length)console.log(ptrain(fq).call(q.pop()).toString())
  q.map(n=>console.log(n.toString()))
}
f.readFile(
  __dirname+"/"+process.argv[2],
  'utf8',
  (e,d)=>e?err(4):console.log(strand(lex(d.replace(/\r\n/g,"\n").trim())))
)