#!/usr/bin/env node
//TODO:
//  - '@' monadic
//  - Implement missing fns from specs
//  - Variable assignment
//  - Syntactic trains
if(require!=null){f=require('fs');argv=require('minimist')(process.argv.slice(2));rl=require('readline-sync')}
function A(d,r,b=0,str=0){this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;fix(this);this.str=str;
if(this.d.length==1&&this.d[0]&&this.d[0].b)this.d[0].b=0}
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
A.prototype.clone=function(){return new A(this.d,this.r,this.b,this.str)}
A.prototype.rank=function(r,s){
  switch(r){
    case -1:err(1)
    case 0:return this.clone()
    case 1:return chnk(this.d,this.r[0],this.str,this.b)
    case 2:return chnk(chnk(this.d,this.r[0],this.str),this.r[1],this.str,this.b)
    default:return s?new A([this.clone()],1,1,0):this.clone()
  }
}
A.prototype.has=function(o){
  for(n of this.d)if(eq(o,n))return 1
  return 0
}
A.prototype.toString=function(){
  let S="";
  let r=this.r.reverse();
  while(r.length>1)this.d=chnk(this.d,r.pop(),this.str).d;
  switch(this.ds){
    case 1:S+=`${this.b?'[ ':''}${this.str?String.fromCharCode(...this.d):this.d.map(str).join(" ")}${this.b?' ]':''}`;break;
    case 2:
      let l=Math.max(...this.d.map(n=>Math.max(...n.d.map(r=>str(r).length)))),f=1,ind=0
      if(this.b){S+='[ ';ind=2}
      for(x of this.d){
        if(!f)S+=' '.repeat(ind);else f=0;if(x.b)S+='[ ';
        if(x.str)S+=str(x)
        else for(y of x.d)S+=(x.b?" ":" ".repeat(l-str(y).length))+str(y)+" ";
        if(x.b&&!x.str)S=S.trimEnd()+']';S+='\n';
      }
      if(this.b)S=S.trimEnd()+' ]';break;
    default:err(1);
  }
  return S.trimEnd();
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
const sb=a=>a instanceof A&&a.ds==1&&a.r[0]==1
,us=a=>sb(a)?a.d[0]:a.ds==0?a:err(2)
,op=(m,f)=>{let x=new MoD(m?f:null,m?null:f);x.m=m;return x}
,carr=(v,b=0)=>v instanceof A?b?(v.b=1,v):v:new A([v],1,b)
,narr=(a,b=0,ba=0,s=0)=>new A(ba?a.map(n=>n instanceof A?(n.b=1,n):new A([n],1,1)):a,a.length,b,s)
,pon=(d,f,S,p,r,a,b)=>{
  if(typeof r!='object')r=[r,r]
  if(!d){
    a=carr(a)
    if(r[1]>a.ds-1||r[1]==0&&sb(a))return(n=>p&&a.str&&!(n instanceof A)?new A([n],1,0,1):n)(f(r[1]==0&&sb(a)?a.d[0]:a,p?a.str:0))
    let na=a.rank(r[1])
    return r[1]<a.ds&&S?new A(na.d.flatMap(n=>n instanceof A?ravel(f(n,a.str)).d:f(n,a.str)),a.r,a.b,p?a.str:0):new A(na.d.map(n=>f(n,a.str)),na.r,a.b,p?a.str:0)
  }else{
    a=carr(a),b=carr(b)
    if(r[0]==r[1]&&a.ds-1>=r[0]&&b.ds-1>=r[1]&&!sb(a)&&!sb(b)&&JSON.stringify(a.r)!=JSON.stringify(b.r))err(1);
    else{
      let aln=pd(a.rank(r[0],1).r),bln=pd(b.rank(r[1],1).r)
      if((r[0]>a.ds-1||sb(a)&&r[0]==0)&&(r[1]>b.ds-1||sb(b)))
        return(n=>p&&a.str|b.str&&!(n instanceof A)?new A([n],1,0,1):n)(f(sb(a)&&r[0]==0?a.d[0]:a,sb(b)&&r[1]==0?b.d[0]:b,p?a.str|b.str:0))
      if(aln>bln)return new A(a.rank(r[0]).d.map(v=>pon(d,f,S,p,r,v,sb(b)?b.d[0]:b)),a.r,a.b|b.b,p?a.str|b.str:0)
      else if(bln>aln)return new A(b.rank(r[1]).d.map(v=>pon(d,f,S,p,r,sb(a)?a.d[0]:a,v)),b.r,a.b|b.b,p?a.str|b.str:0)
      return new A(a.rank(r[0]).d.map((v,i)=>pon(d,f,S,p,r,v,r[1]==0&&sb(b)?b.d[0]:b.rank(r[1]).d[i])),a.r,a.b|b.b,p?a.str|b.str:0)
    }
  }
}
,pd=a=>a.reduce((a,b)=>a*b,1)
,ravel=(a,p=0)=>narr(a.d.flatMap(n=>n instanceof A?ravel(n).d:n),0,0,p)
,sort=(a,b)=>{
  if(a instanceof A&&b instanceof A){
    if(pd(a.r)==pd(b.r))for(i=0;1;i++)if(!eq(a.d[i],b.d[i]))return sort(a.d[i],b.d[i])
    else return pd(a.r)-pd(b.r)
  }else return(a instanceof A?pd(a.r):+a)-(b instanceof A?pd(b.r):+b)
}
,ext=(a,l,str=0)=>(a.d=a.d.concat(rn(0,pd(l)-a.d.length,str?32:0)),a.r=l,a.ds=l.length,a)
,lc=x=>x>=97&&x<=122
,uc=x=>x>=65&&x<=90
,rn=(l,u=0,f)=>(x=u?[...Array(u-l)].map((_,i)=>i+l):[...Array(l).keys()],f!=null?x.map(_=>f.clone()):x)
,eq=(a,b)=>a instanceof A?b instanceof A?JSON.stringify(a.r)==JSON.stringify(b.r)&&a.d.reduce((a,x,i)=>a&&eq(x,b.d[i]),1):err(2):+a==+b
,eachN=(a,f,p=[])=>{
  let x=a.map((n,i)=>n instanceof A?eachN(n.d,f,[i,...p]).d:f(n,[i,...p])).filter(n=>n!=null&&n.length!=0)
  x=x.flatMap(n=>n instanceof A&&n.d[0].ds==1?n.d:n);return narr(x)
}
,mapd=(a,f,d)=>a instanceof A?d>0?new A(a.d.map(n=>mapd(n,f,d-1)),a.r,a.b,a.str):f(a):f(a)
,get=(a,b)=>{
  let m=carr(b).rank(b.ds-1),i
  if(a.ds==0||sb(a))return carr(m.d[(i=sb(a)?a.d[0]:a)>=m.d.length?err(2):i],1);
  else{a.d=a.d.reverse();let r=m.d[a.d[0]>=m.d.length?err(2):a.d[0]];for(n of a.d.slice(1))r=r.d[n>=r.d.length?err(2):n];return carr(r,1)}
}
,geti=(a,b)=>a.b==1?get(a,b):a instanceof A?(a.d=a.d.map(n=>geti(n,b)),a):get(a,b)
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
  "+":mod(pon.bind(0,0,a=>+a,1,0,0),pon.bind(0,1,(a,b)=>+a+ +b,1,1,0)),
  "-":mod(pon.bind(0,0,(a,p)=>p?lc(a)?a-32:uc(a)?a+32:a:-a,1,1,0),pon.bind(0,1,(a,b)=>+a-+b,1,1,0)),
  "*":mod(pon.bind(0,0,(a,p)=>p?uc(a)?1:lc(a)?-1:0:a==0?0:a>0?1:-1,1,0,0),pon.bind(0,1,(a,b)=>+a*+b,1,0,0)),
  "%":mod(pon.bind(0,0,a=>1/+a,1,0,0),pon.bind(0,1,(a,b)=>+a/+b,1,0,0)),
  "]":mod(pon.bind(0,0,a=>a,1,1,99),pon.bind(0,1,(a,b)=>b,1,1,99)),
  "[":mod(pon.bind(0,0,a=>a,1,1,99),pon.bind(0,1,(a,b)=>a,1,1,99)),
  "<":mod(pon.bind(0,0,a=>a instanceof A?(a.b=1,a):new A([a],[1],1),0,1,99),pon.bind(0,1,(a,b)=>+(a<b),1,0,0)),
  ">":mod(pon.bind(0,0,a=>a instanceof A?a.b?(a.b=0,a):a.d[0]:a,0,1,99),pon.bind(0,1,(a,b)=>+(a>b),0,0,0)),
  "<:":mod(pon.bind(0,0,a=>narr([...Array(a.d.length).keys()].sort((i,j)=>sort(a.d[i],a.d[j]))),0,0,1),pon.bind(0,1,(a,b)=>+(a<=b),1,0,0)),
  ">:":mod(pon.bind(0,0,a=>narr([...Array(a.d.length).keys()].sort((i,j)=>-sort(a.d[i],a.d[j]))),0,0,1),pon.bind(0,1,(a,b)=>+(a>=b),1,0,0)),
  "<.":mod(pon.bind(0,0,a=>{a.d=a.d.sort(sort);return a},1,1,1),pon.bind(0,1,(a,b)=>+(!a&&!b),1,0,0)),
  ">.":mod(pon.bind(0,0,a=>{a.d=a.d.sort((a,b)=>-sort(a,b));return a},1,1,1),pon.bind(0,1,(a,b)=>+!(a&&b),1,0,0)),
  "^":mod(pon.bind(0,0,a=>2.7184*+a,1,0,0),pon.bind(0,1,(a,b)=>(+a)**+b,1,0,0)),
  "$":mod(pon.bind(0,0,a=>a instanceof A?narr(a.r):narr([0]),0,0,99),pon.bind(0,1,(a,b)=>{
    let nr=a instanceof A?a.d:[a]
    if(nr.indexOf(-1)>-1)nr[nr.indexOf(-1)]=pd(b.r)/nr.reduce((a,b)=>a*(b>-1?b:1),1)
    b=carr(b);let[lo,ln]=[pd(b.r),pd(nr)]
    if(lo==ln){b.r=nr;b.ds=nr.length;return b}
    else if(lo>ln){b.r=nr;b.d=b.d.slice(0,ln);b.ds=nr.length;return b}
    else{let nd=[];for(i=0;i<ln;i++)nd.push(b.d[i%lo]);return new A(nd,nr,b.b,b.str)}
  },0,1,99)),
  "~":mod(pon.bind(0,0,(a,p)=>p?uc(a)?narr(rn(65,+a+1),0,0,1):narr(rn(97,+a+1),0,0,1):narr(rn(1,+a+1)),0,1,0),pon.bind(0,1,geti,0,1,99)),
  ",":mod(pon.bind(0,0,ravel,1,1,99),pon.bind(0,1,(a,b,p)=>narr(a.d.concat(b.d),0,0,p),1,1,1)),
  ";":mod(pon.bind(0,0,(a,p)=>{
    let m=Math.max(...a.d.map(n=>n.ds==0?err(2):n.d.length));return new A(a.d.flatMap(n=>(n.str&&(p=1),ext(n,[m],p).d)),[m,...a.r],a.b,p)
  },1,1,1),pon.bind(0,1,(a,b,p)=>{
    if(b.r[0]==1&&b.ds==1)b=narr(rn(0,a.r[0],b.d[0]));
    if(a.r[0]>b.d.length)b=ext(b,[a.r[0]],p);else if(b.d.length>a.r[0])
      for(i=0;i<(a.r[1]||1);i++)a.d.splice(i*pd(a.r.slice(1))+a.r[0],0,...rn(0,b.d.length-a.r[0],p?32:0));a.r[0]=b.d.length
    return new A(a.d.concat(b.d),a.ds>1?[...a.r.slice(0,a.ds-1),a.r.pop()+1]:[a.r[0],2],a.b,p)
  },1,1,[99,1])),
  "#":mod(pon.bind(0,0,a=>a.r[a.ds-1],0,0,99),pon.bind(0,1,(a,b,p)=>{
    [a,b]=[b,a];let v=[];let c=b.rank(b.ds-1);if(a.d.length!=c.d.length)err(2)
    c.d.forEach((n,i)=>v.push(...rn(0,a.d[i],n)));
    return new A(narr(v).d.flatMap(n=>n instanceof A?n.d:n),[...b.r.slice(0,b.ds-1),a.d.reduce((l,r)=>l+r,0)],0,p&&b.str)
  },1,1,[99,1])),
  "#:":mod(pon.bind(0,0,a=>narr(a.toString(2).split("").map(n=>+n)),0,0,0),pon.bind(0,1,(a,b)=>{
    let v=[];for(n of a.d.reverse()){v.push(n==0?b:b%n);b=n==0?b|0:b/n|0};return narr(v.reverse())
  },0,0,[1,0])),
  "=":mod(pon.bind(0,0,a=>{
    a.d=a.rank(1).d,a.d=a.d[0].d.flatMap((_,i)=>a.d.map(x=>x.d[i]));a.r=a.r.length==1?[1,a.r[0]]:a.r.reverse();a.ds=2;return a
  },1,1,2),pon.bind(0,1,(a,b)=>+eq(a,b),1,0,0)),
  "~.":mod(pon.bind(0,0,a=>eachN(carr(a).rank(a.ds?a.ds-1:0).d,(n,i)=>+n==1?narr(i,1):null),0,0,99),pon.bind(0,1,(a,b)=>{
    for(i=0;i<=b.d.length;i++)if(us(a)>us(i==0?-Infinity:b.d[i-1])&&us(a)<=us(i==b.d.length?Infinity:b.d[i]))return i
  },0,0,[0,1])),
  "~:":mod(pon.bind(0,0,(a,p)=>{
    let s=new Set(a.d),d=[];for(n of s.keys())d.push(n);return narr(d,0,0,p?a.str:0)
  },0,1,1),pon.bind(0,0,(a,b)=>+!eq(a,b),0,0,0)),
  ",:":mod(pon.bind(0,0,(a,p)=>narr(a.d,a.b,0,p?a.str:0),0,1,99),pon.bind(0,1,(a,b)=>narr(a.d.map(n=>b.has(n))),0,0,99)),
  "{":mod(pon.bind(0,0,a=>a+1,1,1,0),pon.bind(0,1,(a,b)=>{
    let c=new A([0],1,0,b.str);c=ext(c,a.d,b.str)
    for(let i=0;i<b.ds&&i<a.d.length;i++)
      for(let k=0;k<(a.d[i+1]||1);k++)for(let j=0;j<Math.min(b.r[i],a.d[i]);j++)c.d[j+k*pd(c.r.slice(0,i+1))]=b.d[j+k*pd(b.r.slice(0,i+1))]??0;return c
  },0,1,99)),
  "}":mod(pon.bind(0,0,a=>a-1,1,1,0),pon.bind(0,1,(a,b)=>{
    if(a.d.length>b.ds)err(2);let c=new A([0],1,0,b.str);c=ext(c,a.d.map((n,i)=>b.r[i]-n),b.str)
    for(let i=0;i<b.ds&&i<a.d.length;i++)
      for(let k=a.d[i+1]||0;k>=0;k--)for(let j=a.d[i];j<b.r[i];j++)c.d[j-a.d[i]+k*pd(c.r.slice(0,i+1))]=b.d[j+k*pd(b.r.slice(0,i+1))]??0;return c
  },0,1,99)),
  "|":mod(pon.bind(0,0,a=>+!a,1,0,0),pon.bind(0,1,(a,b)=>b % a,0,0,0)),
  "^:":mod(pon.bind(0,0,(a,p)=>p?lc(a)?a+32:a:Math.ceil(+a),1,1,0),pon.bind(0,1,(a,b)=>Math.max(a,b),1,1,0)),
  "v:":mod(pon.bind(0,0,(a,p)=>p?uc(a)?a-32:a:Math.floor(+a),1,1,0),pon.bind(0,1,(a,b)=>Math.min(a,b),1,1,0)),
}
,bdrs={
  '&':op(0,(a,b)=>mod(l=>l==null?err(0):!a.incomp?b.call(a,l):!b.incomp?a.call(l,b):a.call(b.call(l))
    ,(l,r)=>l==null||r==null?err(0):!a.incomp||!b.incomp?err(0):a.call(b.call(l,r)))),
  '&:':op(0,(f,g)=>mod(a=>a==null?err(0):f.call(a.clone(),g.call(a)),(a,b)=>a==null||b==null?err(0):f.call(a,g.call(b)))),
  '&.':op(0,(f,g)=>mod(a=>a==null?err(0):g.call(f.call(a.clone()),a),(a,b)=>a==null||b==null?err(0):g.call(f.call(a),b))),
  '"':op(1,f=>mod(l=>l==null?err(0):l.ds==0?new A([f.call(l)],1,0):new A(l.rank(l.ds-1).d.map(n=>f.call(n)),l.r,l.b,l.str),(l,r)=>{
    if(l==null||r==null)err(0)
    let j;if(l.ds==0||sb(l))j=1;else if(r.ds==0||sb(r))j=0;
    if(j!=null)return narr(j?r.rank(r.ds-1).d.map(n=>f.call(l.clone(),n)):l.rank(l.ds-1).d.map(n=>f.call(n,r.clone())))
    if(JSON.stringify(l.r)==JSON.stringify(r.r)){let F=l.rank(l.ds-1),S=r.rank(r.ds-1);return narr(F.d.map((n,i)=>f.call(n,S.d[i])))}
    err(1)
  })),
  '":':op(1,f=>mod(l=>l==null?err(0):l.ds==0?new A([f.call(l)],1,0):narr(l.d.map(n=>f.call(n))),(l,r)=>{
    if(l==null||r==null)err(0)
    let j;if(l.ds==0||sb(l))j=1;else if(r.ds==0||sb(r))j=0;if(j!=null)return narr(j?r.d.map(n=>f.call(l.clone(),n)):l.d.map(n=>f.call(n,r.clone())))
    if(JSON.stringify(l.r)==JSON.stringify(r.r))return narr(l.d.map((n,i)=>f.call(n,r.d[i])))
    err(1)
  })),
  "`":op(1,f=>mod(l=>f.call(l.clone(),l),(l,r)=>f.call(r,l))),
  "/":op(1,f=>mod(pon.bind(0,0,x=>x.d.slice(1).reduce((acc,v)=>f.call(acc,v),x.d[0]),0,0,1),pon.bind(0,1,(l,r)=>{
    let p=0;if(l<0)l=Math.abs(l,p=1)
    let n=[];for(let i=0;i<=r.d.length-l;i+=p?l:1)n.push(r.d.slice(i+1,i+l).reduce((acc,v)=>f.call(acc,v),r.d[i]));return narr(n)
  },0,0,[0,1]))),
  "\\":op(1,f=>mod(pon.bind(0,0,x=>(p=x.d[0],new A(x.d.map((n,i)=>i==0?n:(p=f.call(p,n),p)),x.r,x.b,0)),0,0,1),pon.bind(0,1,(x,y)=>{
    let n=[];for(l of x.d)for(r of y.d)n.push(f.call(l,r));return new A(n,[y.d.length,x.d.length],0,0)
  },0,0,1))),
  "@":op(0,(a,b)=>mod(l=>{
    if(b.incomp)return a.call(b.call(l))
    else{if(b<0){b=-b;err(2)}else return mapd(l,n=>a.call(n),b)}
  },(l,r)=>{
    if(b.ds==0)b=narr([b,b]);if(b.incomp)return a.call(b.call(l),b.call(r))
    else{if(b.d[0]<0||b.d[1]<0){err(2)}else return mapd(l,L=>mapd(r,R=>a.call(L,R),b.d[1]),b.d[0])}
  })),
  "/:":op(1,f=>mod(pon.bind(0,0,a=>err(2),0,0,99),(a,b)=>{a=carr(a);a.d=a.d.map(n=>f.call(n,b));fix(a);return a})),
  "\\:":op(1,f=>mod(pon.bind(0,0,a=>err(2),0,0,99),(a,b)=>{b=carr(b);b.d=b.d.map(n=>f.call(a,n));fix(b);return b}))
}
,env={
  put:mod(A=>console.log(A.toString()),(A,B)=>console.log((B.toString()+"\n").repeat(+A.call()).trim()))
}
,chnk=(a,s,str=0,b=0)=>{
  let n=[]
  for(let x,i=0;i<a.length;i+=s){
    if(i+s>a.length){b=1;n=n.map(e=>(e.b=1,e))}
    x=a.slice(i,Math.min(a.length,i+s));n.push(new A(x,Math.min(a.length,i+s)-i,0,str))
  };
  return new A(n,n.length==1?1:[1,n.length],b,str);
}
,fix=a=>{
  let f=a.d.reduce((acc,x)=>acc||x instanceof A,false)
  if(f)f=a.d.length>1&&a.ds==1||a.d.reduce((acc,x)=>acc||x instanceof A&&x.b,false)
  if(f)a.d=a.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1))
  while(a.r[a.ds-1]==1&&a.ds>1){a.r.pop();a.ds-=1}
}
,str=s=>s.toString()
,resc=r=>r.replace(/[^A-Za-z0-9_]/g,'\\$&')
,mex=f=>f.incomp?f:f.call()
,nnw=(t,i)=>{
  let o=1;while(t[i+o]&&t[i+o].t==9)o++;
  return t[i+o]?[i+o,t[i+o]]:[i+o,{t:10}];
}
,inst=o=>o.t<2||o.t==4||o.t==7&&!env[o.v].incomp||o.t==8&&!o.v.incomp
,lex=s=>{
  let m,l,t=[];
  while(s){
    if(m=/^((?:_?\d*)?r_?\d+)|^(__|(?:_?\d*\.?\d*)?e?_?\d*\.?\d+|_)/.exec(s)){
      if(m[2]!=null)m[1]=m[2];let x=m[1].replace(/_/g,'-').replace(/(?<=-?)(?<!\d)(e|r)/,'1$1'),l,r;if(x=="--"||x=="-")t.push({t:0,v:x=="--"?-Infinity:Infinity})
      else if(x.indexOf("r")>-1)t.push({t:0,v:([l,r]=x.split("r"),+l/+r)})
      else if(x.lastIndexOf(".")>x.indexOf("e")&&x.indexOf("e")>-1)t.push({t:0,v:([l,r]=x.split("e"),(+l)**+r)});else t.push({t:0,v:+x})
    }else if(m=/^'((?:[^'\\]|\\.)*)'/.exec(s))t.push({t:1,v:(l=JSON.parse(`"${m[1]}"`),new A(l.split("").map(c=>c.charCodeAt(0)),l.length,0,1))})
    else if(m=RegExp(`^(${Object.keys(syms).sort((a,b)=>b.length-a.length).map(resc).join('|')})`).exec(s))t.push({t:2,v:m[1]})
    else if(m=RegExp(`^(${Object.keys(bdrs).sort((a,b)=>b.length-a.length).map(resc).join('|')})`).exec(s))t.push({t:3,v:m[1]})
    //FREE: t=5
    else if(m=/^:/.exec(s))t.push({t:6})
    else if(m=/^(\s)/.exec(s))t.push({t:9,v:m[1]})
    else if(m=/^([a-zA-Z]+)/.exec(s))t.push({t:7,v:m[1]})
    else if(m=/^\(|^\)/.exec(s))t.push({t:2,v:m[0]})
    else err(3)
    s=s.slice(m&&m[0].length||1);
  }
  return t;
}
,grp=t=>{
  let tn=[],b=[],ig=0,oc=0;
  for(let i=0;i<=t.length;i++){
    if(ig){
      if(t[i]==null)err(5)
      else if(t[i].t==2&&t[i].v=='('){b.push(t[i]);oc++}
      else if(t[i].t==2&&t[i].v==')'){
        if(oc==0){tn.push({t:8,v:exec(strand(grp(b)),1)});ig=0;b=[]}
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
  let tn=[],b=[];
  for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&inst(t[i]))b.push(t[i])
    else if((t[i]==null||t[i].t==9&&t[i].v=='\n'||t[i].t==2||t[i].t==3||t[i].t==7||t[i].t==8)&&b.length==1)
      tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else if((t[i]==null||!(t[i].t==9&&t[i].v==' '))&&b.length){
      let a=narr(b.map(n=>n.t==1||n.t==4?(n.v.b=1,n.v):n.v));tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]));b=[]
    }else tn.push(t[i]);return tn.filter(n=>n!=null);//sometimes happens
}
,ptrain=(t,G=0)=>{
  if(t.length==1)return t[0];if(!t[t.length-1].incomp)G=0;let tn=[];
  if(G){//train
    tn=t.map(n=>n.clone())
    for(let i=tn.length-1;i>=0;){
      if(i>=2&&t[i-1].incomp){i-=2;let x=tn.map(n=>n.clone());tn.splice(i,0,mod(
        A=>x[i+1].call(x[i].call(A.clone()),x[i+2].call(A)),(A,B)=>x[i+1].call(x[i].call(A.clone(),B.clone()),x[i+2].call(A,B)),
      ))}else if(i>=1&&!t[i-1].incomp){
        i-=1;let x=tn.map(n=>n.clone());tn.splice(i,0,mod(A=>x[i+1].call(x[i],A),(A,B)=>err(0)))
      }else if(i>=1){
        i-=1;let x=tn.map(n=>n.clone());tn.splice(i,0,mod(A=>x[i].call(x[i+1].call(A)),(A,B)=>x[i].call(A,x[i+1].call(B))))
      }else i--
    }return tn[0]
  }else{//normal
    if(t[t.length-1].incomp)return ptrain(t,1);
    tn.push(t[t.length-1]);
    for(let i=t.length-2;i>=0;i--){
      if(t[i-1]!=null&&!(t[i-1]instanceof MoD)){
        let x=tn.pop();i--;tn.push(mod(A=>t[i+1].call(t[i].call(),x.call()),(A,B)=>t[i+1].call(t[i].call(),x.call())))
      }else{let x=tn.pop();tn.push(mod(A=>t[i].call(x.call()),(A,B)=>t[i].call(x.call())))}
    }let x=tn.pop();x.incomp=0;return x
  }
}
,exec=(t,G=0)=>{
  let fq=[];for(let i=0;i<t.length;i++){
    let o=t[i];if(o.t==9&&o.v=='\n'&&fq.length){
      let x=ptrain(fq,G).call();if(!G&&x!=null)console.log(x.toString());fq=[]
    }
    if(o.t==7){
      if(nnw(t,i)[1].t==6){[i,]=nnw(t,i);err(5)}
      else if(env[o.v]&&env[o.v].incomp)fq.push(env[o.v])
      else if(env[o.v]!=null)q.push(env[o.v])
      else err(3)
    }else if(o.t==2||o.t==8&&o.v.incomp){
      let [ni,b]=nnw(t,i);
      if(inst(b)||ni!=i&&b.t==8){
        i=ni;if(b.t==8){
          if(b.v.incomp)fq.push((o.t==8?o.v:syms[o.v]),b.v)
          else fq.push(o.t==8?o.v:syms[o.v],b.v)
        }else fq.push(o.t==8?o.v:syms[o.v],b.v)
      }else fq.push(o.t==8?o.v:syms[o.v])
    }else if(o.t==3){
      if(!fq.length)err(0)
      else if(!bdrs[o.v].m){
        [i,f]=nnw(t,i);if(!inst(f)&&f.t!=2&&f.t!=8)err(0);fq.push(bdrs[o.v].call(fq.pop(),inst(f)||f.t==8?f.v:syms[f.v]))
      }else fq.push(bdrs[o.v].call(fq.pop()))
    }else if(o.t<2||o.t==4||o.t==8){
      if(t.slice(i,nnw(t,i)[0]-i).reduce((a,b)=>a||b.t==9&&b.v=='\n',false)){
        if(G&&nnw(t,i)[0]+1>=t.length)return o.v
        else if(!G)console.log(o.v.toString())
      }else fq.push(o.v);
    }
  }
  if(fq.length){
    if(!G&&fq[fq.length-1].incomp)err(0)
    else var x=ptrain(fq,G)
    if(G)return mex(x);else{x=x.call();if(x!=null)console.log(x.toString())}
  }
}
,run=d=>{
  if(module!=null&&argv.debug)
  (console.log(lex(d)),console.log(grp(lex(d))),console.log(strand(grp(lex(d)))),exec(strand(grp(lex(d)))))
  else if(module!=null){try{exec(strand(grp(lex(d))))}catch(e){argv.debug||e.toString().startsWith("[")?console.error(e):console.error("[/] INTERNAL ERROR")}}
  else{try{return exec(strand(grp(d)),1)}catch(e){return e.toString().startsWith("[")?e:"[/] INTERNAL ERROR"}}
}
if(module&&module.exports){
if(argv._[0]=='help'||argv.h||argv.help)console.log(`ayr ${require('./package.json').version}:
Usage:
    ayr <file> - run a file
    ayr -u <code> - run the code

Args:
    --debug - Debug code (for internal use)`),process.exit(0);
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
}else f.readFile(__dirname+"/"+argv._[0],'utf8',(e,d)=>e?err(4):run(d.replace(/\r\n/g,"\n").trim()))
}else{(self||globalThis||window).runAyr=run}