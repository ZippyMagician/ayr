#!/usr/bin/env node
if(require!=null){fs=require('fs');argv=require('minimist')(process.argv.slice(2));rl=require('readline-sync')}
function A(d,r,b=0,str=0){
  this.r=typeof r==='number'?[r]:r;this.ds=this.r.length;this.d=d;this.b=b;this.str=str;if(this.d.length==1&&this.d[0].ds&&this.d[0].b&&!this.b)this.d[0].b=0;this.uf=0
  let f=this.d.reduce((acc,x)=>acc||x instanceof A,false);if(f)f=this.d.length>1&&this.ds==1||this.d.reduce((acc,x)=>acc||x instanceof A&&x.b,false)
  if(f)this.d=this.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1));while(this.r[this.ds-1]==1&&this.ds>1){this.r.pop();this.ds-=1}
}
function MoD(f1,f2,...r){this.f1=f1;this.f2=f2;this.bd=[];this.uf=1;this.rk=r.length?r:null}
MoD.prototype.bind=function(...v){this.bd.push(...v);return this}
MoD.prototype.call=function(...a){
  if(this.bd.length+a.length>2)err(0);else if(this.bd.length){return this.f2.call(0,...this.rk!=null?[this.rk[0],...this.bd]:this.bd,a[0])}
  else if(a.length>1)return this.f2.call(0,...this.rk!=null?[this.rk[1],...a]:a)
  else return this.f1.call(0,...this.rk!=null?[this.rk[0],a[0]]:[a[0]])
}
MoD.prototype.cl=function(){let mod=new MoD(this.f1,this.f2);mod.bd=this.bd.cl();if(this.rk!=null)mod.rk=this.rk.cl();return mod}
A.prototype.cl=function(){return new A(this.d.map(n=>n.cl()),this.r.cl(),this.b,this.str)}
A.prototype.rank=function(r,s){
  switch(r){
    case -1:err(1)
    case 0:return sb(this)?this.cl():this.str?(this.d=this.d.map(n=>narr([n],1,0,1)),this.cl()):this.cl()
    case 1:return chnk(this.d,this.r[0],this.str,this.b)
    case 3:case 4:case 5:case 6:case 7:case 8:case 9:
    case 2:return(f=>(f.d=f.d.map(n=>(n.r=this.r.slice(0,this.ds-1),n.ds=this.ds-1,n)),f))(chnk(this.d,pd(this.r.slice(0,this.ds-1)),this.str,this.b))
    default:return s?new A([this.cl()],1,1,0):this.cl()//cant remember what this is for but too afraid to change it
  }
}
A.prototype.has=function(o){for(n of this.d)if(eq(o,n))return 1;return 0}
A.prototype.toString=function(){
  let S="",r=this.r.cl().reverse(),d=this.d.cl()
  while(r.length>1)d=chnk(d,r.pop(),this.str).d
  switch(this.ds){
    case 1:S+=`${this.b?'[ ':''}${this.str?String.fromCharCode(...d):d.map(str).join(" ")}${this.b?' ]':''}`;break
    case 2:
      let l=Math.max(...d.map(n=>Math.max(...n.d.map(r=>str(r).length)))),f=1,ind=0
      if(this.b){S+='[ ';ind=2}
      for(x of d){
        if(!f)S+=' '.repeat(ind);else f=0;if(x.b)S+='[ '
        if(x.str)S+=str(x);else for(y of x.d)S+=(x.b?" ":" ".repeat(l-str(y).length))+str(y)+" ";if(x.b&&!x.str)S=S.trimEnd()+']';S+='\n'
      }
      if(this.b)S=S.trimEnd()+' ]';break
    default:let m=this.cl().rank(this.ds-1);for(let n of m.d)S+=str(n)+"\n"+"\n".repeat(this.ds-2);break
  }
  return !this.str?S.trimEnd():S.replace(/\r?\n$/,"")
}
A.prototype.cl=function(){return new A(this.d.map(n=>n.cl()),this.r.cl(),this.b,this.str)}
Number.prototype.call=function(...v){return +this}
Number.prototype.bind=function(...v){return +this}
Number.prototype.cl=function(){return this==Infinity?+this:+JSON.parse(JSON.stringify(this))}
Number.prototype.rank=function(...v){return narr([+this]).rank(...v)}
Number.prototype.r=[1]
Number.prototype.ds=0
Number.prototype.uf=0
Array.prototype.ds=1
Array.prototype.uf=0
Array.prototype.cl=function(){return[...this.map(n=>typeof n=='function'?n:n.cl())]}
Array.prototype.rot=function(n){this.unshift.apply(this,this.splice(n,this.length));return this}
Object.prototype.cl=function(){return{...this}}
A.prototype.bind=function(...v){return this.cl()}
A.prototype.call=function(...v){return this.cl()}
let envs=[];const sb=a=>a instanceof A&&a.ds==1&&a.r[0]==1
,cle=_=>{envs.push(env);env=envs[envs.length-1].cl()}
,ucle=_=>env=envs.pop()
,ft=a=>a<2?1:eval('for(let n=2,x=1;n<=a;n++)x*=n')
,us=a=>sb(a)?a.d[0]:a.ds==0?a:err(2)
,op=(m,f)=>{let x=new MoD(m?f:null,m?null:f);x.m=m;return x}
,carr=(v,b=0)=>v instanceof A?b?(v.b=1,v):v:new A([v],1,b)
,narr=(a,b=0,ba=0,s=0)=>new A(ba?a.map(n=>n instanceof A?(n.b=1,n):new A([n],1,1)):a,a.length,b,s)
,pon=(d,f,S,p,r,a,b,e=0)=>{
  if(a.ds==1&&!a.b&&a.r[0]==1&&!a.str)a=a.d[0];if(b!=null&&b.ds==1&&!b.b&&b.r[0]==1&&!b.str)b=b.d[0];let l;if(typeof r!='object')r=[r,r];if(S==2){S=0;l=1}//Q:is this worth it?
  const fl=(n,c=1)=>n.flatMap(x=>x.ds&&S&&c?x.d:x);if(!d){
    if(a.str&&sb(a)&&a.d[0]instanceof A)a=a.d[0];let x=a.ds==0&&e;a=carr(a)
    if(r[1]>a.ds-1||r[1]==0&&sb(a))return(n=>p&&a.str&&!(n instanceof A)?new A([n],1,0,1):n)(f(r[1]==0&&sb(a)?a.d[0].cl():a.cl(),p?x?p:a.str:0));let na=a.rank(r[1]),t
    return r[1]>0&&r[1]<a.ds&&S?
      new A(na.d.flatMap(n=>(f=>f instanceof A?f.ds!=n.ds?(t=na.r,f.b=1,f):(t=f.r,f.d):f)(pon(d,f,S,p&&a.str,r,n,0,1))),a.r.map((v,i)=>t[i]??v),a.b,p?a.str:0)
     :new A(fl(na.d.map(n=>pon(d,f,S,p&&a.str,r,n,0,1)),r[1]==0&&a.str),l&&na.ds>1?na.r.slice(1):na.r,a.b,p?a.str:0)
  }else{
    a=carr(a),b=carr(b);if(r[0]==r[1]&&a.ds-1>=r[0]&&b.ds-1>=r[1]&&!sb(a)&&!sb(b)&&JSON.stringify(a.r)!=JSON.stringify(b.r))err(1)
    else{
      if(a.str&&sb(a)&&a.d[0]instanceof A)a=a.d[0];if(b.str&&sb(b)&&b.d[0]instanceof A)b=b.d[0];
      let aln=pd(a.rank(r[0],1).r),bln=pd(b.rank(r[1],1).r),n
      if((r[0]>a.ds-1||sb(a)&&r[0]==0)&&(r[1]>b.ds-1||sb(b)&&r[1]==0))
        return(n=>p&&a.str|b.str&&!(n instanceof A)?new A([n],1,0,1):n)(f(sb(a)&&r[0]==0?a.d[0].cl():a.cl(),sb(b)&&r[1]==0?b.d[0].cl():b.cl(),p?a.str|b.str:0))
      if(aln>bln)
        return new A(fl(a.rank(r[0]).d.map(v=>pon(d,f,S,p,r,v,sb(b)?b.d[0]:b)),n=r[0]>1&&r[0]<a.ds||r[0]==0&&a.str),S&&n?a.r:a.rank(r[0]).r,a.b|b.b,p?a.str|b.str:0)
      else if(bln>aln)
        return new A(fl(b.rank(r[1]).d.map(v=>pon(d,f,S,p,r,sb(a)?a.d[0]:a,v)),n=r[1]>0&&r[1]<b.ds||r[1]==0&&b.str),S&&n?b.r:b.rank(r[1]).r,a.b|b.b,p?a.str|b.str:0)
      return new A(
        fl(a.rank(r[0]).d.map((v,i)=>pon(d,f,S,p,r,v,r[1]==0&&sb(b)?b.d[0]:b.rank(r[1]).d[i])),n=r[0]>1&&r[0]<a.ds||r[0]==0&&a.str)
       ,S&&n?a.r:a.rank(r[0]).r,a.b|b.b,p?a.str|b.str:0)
    }
  }
}
,pd=a=>a.reduce((a,b)=>a*b,1)
,ravel=(a,p=null)=>narr(a.ds==0?[a]:a.d.flatMap(n=>n instanceof A?(p!=null&&n.str&&(p=1),ravel(n).d):n),0,0,p==null?0:p)
,sort=(a,b)=>{
  if(a instanceof A&&b instanceof A){if(pd(a.r)==pd(b.r))for(i=0;1;i++)if(!eq(a.d[i],b.d[i]))return sort(a.d[i],b.d[i]);else return pd(a.r)-pd(b.r)}
  else return(a instanceof A?pd(a.r):+a)-(b instanceof A?pd(b.r):+b)
}
,pr=(a,s=0)=>a.d[0]instanceof A?narr([],1):s||a.str?32:0
,ext=(a,l,str=0)=>(a.d=a.d.concat(rn(0,pd(l)-a.d.length,pr(a,str))),a.r=l,a.ds=l.length,a)
,lc=x=>x>=97&&x<=122
,uc=x=>x>=65&&x<=90
,rn=(l,u=0,f,x=null)=>(x=u?[...Array(u-l)].map((_,i)=>i+l):[...Array(l).keys()],f!=null?x.map(_=>f.cl()):x)
,rnc=(l,u=0,f,x=null)=>(argv!=null&&argv['0']?(l--,u--):0,x=u?[...Array(u-l)].map((_,i)=>i+l):[...Array(l).keys()],f!=null?x.map(_=>f.cl()):x)
,eq=(a,b)=>a instanceof A?b instanceof A?JSON.stringify(a.r)==JSON.stringify(b.r)&&a.d.reduce((a,x,i)=>a&&eq(x,b.d[i]),1):err(2):+a==+b
,eachN=(a,f,p=[])=>{
  let x=a.map((n,i)=>n instanceof A?eachN(n.d,f,[i,...p]).d:f(n,[i,...p])).filter(n=>n!=null&&n.length!=0)
  x=x.flatMap(n=>n instanceof A&&n.d[0].ds==1?n.d:n);return narr(x)
}
,dgs=(f,a,r=0)=>{
  if(!r)a=a.rank(1);let d=[],x=0,y=0;while(1){
    d.push([a.d[y].d[x]]);let o=[x,y];let nx=x,ny=y;while(JSON.stringify(o)!=JSON.stringify([ny,nx]))d[d.length-1].push(a.d[++ny].d[--nx])
    if(x==a.d[0].d.length-1){if(y==a.d.length-1)break;y++}else x++
  }return narr(d.map(a=>f.call(narr(a,1))))
}
,mapd=(a,f,d)=>a instanceof A?d>0?new A(a.d.map(n=>mapd(n,f,d-1)),a.r,a.b,a.str):f(a):f(a)
,get=(a,b,w)=>{
  let m=carr(b.cl()).rank(b.ds-1);if(!w&&carr(a).d.map((n,i)=>n<0||n>=b.r.slice(b.ds-1)[i]).reduce((a,b)=>a||b,0))return pr(b)
  if(a.ds==0||sb(a))return m.d[(sb(a)?a.d[0]:a)%m.d.length]
  else{a.d=a.d.reverse();let r=m.d[a.d[0]%m.d.length];for(n of a.d.slice(1))r=r.d[n%r.d.length];return r}
}
,det=m=>m.d.length==1?m.d[0].d[0]:m.d[0].d.length==2&&m.d.length==2?m.d[0].d[0]*m.d[1].d[1]-m.d[0].d[1]*m.d[1].d[0]:m.d[0].d.reduce((r,e,i)=>
  r+(-1)**(i+2)*e*det(narr(m.d.slice(1).map(c=>narr(c.d.filter((_,j)=>i!=j))))),0
)
,zp=(a,b,f)=>{
  let i=Math.min(a.d.length,b.d.length),n=[];for(let x=0;x<i;x++)n.push(f.call(narr([a.d[x]],0,0,a.str),narr([b.d[x]],0,0,a.str)))
  if(i<a.d.length)n=[...n,...a.d.slice(i).map(n=>narr([n],0,0,a.str))];else if(i<b.d.length)n=[...n,...b.d.slice(i).map(n=>narr([n],0,0,b.str))]
  return new A(n,i<a.d.length?a.r.cl():b.r.cl())
}
,ftrs=n=>{let f=[],i=1,d=0;while(i<Math.sqrt(n)|0){if(n%i==0){f.splice(d,0,i);if(i!=n/i)f.splice(-d,0,n/i);d++}i++}let t=f[f.length-1];f[f.length-1]=f[0];f[0]=t;return f}
,gcd=(x,y)=>{x=Math.abs(x);y=Math.abs(y);while(y)[x,y]=[y,x%y];return x}
,lcm=(x,y)=>x&&y?Math.abs(x*y/gcd(x,y)):0
,geti=(a,b,w)=>a.b==1?get(a,b):a instanceof A?(a.d=a.d.map(n=>geti(n,b,w)).map(n=>b.str&&sb(n)?n.d[0]:n),a=fix(a),a.str=b.str,a):get(a,b,w)
,err=id=>{
  switch(id){
    case 0:if(module==null)console.log("[0] ARG ERROR");throw("[0] ARG ERROR")
    case 1:if(module==null)console.log("[1] RANK ERROR");throw("[1] RANK ERROR")
    case 2:if(module==null)console.log("[2] DOMAIN ERROR");throw("[2] DOMAIN ERROR")
    case 3:if(module==null)console.log("[3] NAME ERROR");throw("[3] NAME ERROR")
    case 4:if(module==null)console.log("[4] FILE ERROR");throw("[4] FILE ERROR")
    case 5:if(module==null)console.log("[5] GROUP ERROR");throw("[5] GROUP ERROR")
    default:if(module==null)console.log(`[${id}] GENERIC ERROR`);throw(`[${id}] GENERIC ERROR`)
  }
}
,mod=(f,f2,...r)=>
  f2?new MoD(f.bind(0),f2.bind(0),...r):f instanceof MoD?(f.f1=f.f1.bind(0),f.f2=f.f2.bind(0),f):new MoD(A=>f.call(A),(A,B)=>f.call(A,B),...r)
,syms={
  "+":mod(pon.bind(0,0,a=>a<0?-a:+a,1,0),pon.bind(0,1,(a,b)=>+a+ +b,1,1),0,0),
  "+.":mod(pon.bind(0,0,a=>err(2),0,0),pon.bind(0,1,(a,b)=>gcd(a,b),0,0),99,0),
  "+:":mod(pon.bind(0,0,a=>a*2,1,1),pon.bind(0,1,(a,b)=>Math.abs(a+b),1,0),0,0),
  "-":mod(pon.bind(0,0,(a,p)=>p?lc(a)?a-32:uc(a)?a+32:a:-a,1,1),pon.bind(0,1,(a,b)=>+a-+b,1,1),0,0),
  "-.":mod(pon.bind(0,0,a=>{
    let y=a.rank(a.ds-1).d,r=[];const p=(y,t)=>{let i,x;if(!y.length)r.push(t);for(i=0;i<y.length;i++){x=y.splice(i,1)[0];p(y,t.concat(x));y.splice(i,0,x)}};p(y,[])
    return new A(r.flatMap(n=>n.flatMap(x=>n.ds>1&&x.ds?x.d:x)),[...a.r,ft(y.length)],a.b,a.str)
  },0,0),pon.bind(0,1,(a,b)=>{
    a=a.rank(a.ds-1),b=b.rank(b.ds-1);let r=[],A=new Set(...a.d),B=new Set(...b.d);for(let a of a.d)if(!B.has(a))r.push(a.cl());for(let b of b.d)if(!A.has(b))r.push(b.cl())
    return narr(r)
  },0,0),99,99),
  "-:":mod(pon.bind(0,0,a=>a/2,1,1),pon.bind(0,1,(a,b)=>Math.abs(a-b),1,0),0,0),
  "*":mod(pon.bind(0,0,(a,p)=>p?uc(a)?1:lc(a)?-1:0:a==0?0:a>0?1:-1,1,1),pon.bind(0,1,(a,b)=>+a*+b,1,0),0,0),
  "*.":mod(pon.bind(0,0,a=>narr(ftrs(a)),0,0),pon.bind(0,1,(a,b)=>lcm(a,b),0,0),0,0),
  "*:":mod(pon.bind(0,0,a=>a**2,1,0),pon.bind(0,1,(a,b)=>a*Math.abs(b),1,0),0,0),
  "%":mod(pon.bind(0,0,a=>1/+a,1,0),pon.bind(0,1,(a,b)=>+a/+b,1,0),0,0),
  "%.":mod(pon.bind(0,0,a=>err(2),0,0),pon.bind(0,1,(a,b)=>err(2),0,0),99,0),
  "%:":mod(pon.bind(0,0,a=>a**.5,1,1),pon.bind(0,1,(a,b)=>b**(1/a),1,0),0,0),
  "]":mod(pon.bind(0,0,a=>a,1,1),pon.bind(0,1,(a,b)=>b,1,1),99,99),
  "[":mod(pon.bind(0,0,a=>a,1,1),pon.bind(0,1,(a,b)=>a,1,1),99,99),
  "<":mod(pon.bind(0,0,a=>a instanceof A?(a.b=1,a):new A([a],[1],1),0,1),pon.bind(0,1,(a,b)=>+(a<b),1,0),99,0),
  ">":mod(pon.bind(0,0,a=>a instanceof A?a.b?(a.b=0,a):a.d[0]:a,0,1),pon.bind(0,1,(a,b)=>+(a>b),0,0),99,0),
  "<:":mod(pon.bind(0,0,a=>narr([...Array(a.d.length).keys()].sort((i,j)=>sort(a.d[i],a.d[j]))),0,0),pon.bind(0,1,(a,b)=>+(a<=b),1,0),1,0),
  ">:":mod(pon.bind(0,0,a=>narr([...Array(a.d.length).keys()].sort((i,j)=>-sort(a.d[i],a.d[j]))),0,0),pon.bind(0,1,(a,b)=>+(a>=b),1,0),1,0),
  "<.":mod(pon.bind(0,0,a=>{a.d=a.rank(a.ds-1).d.sort(sort).flatMap(n=>n.d??n);return a},1,1),pon.bind(0,1,(a,b)=>+(!a&&!b),1,0),1,0),
  ">.":mod(pon.bind(0,0,a=>{a.d=a.rank(a.ds-1).d.sort((a,b)=>-sort(a,b)).flatMap(n=>n.d??n);return a},1,1),pon.bind(0,1,(a,b)=>+!(a&&b),1,0),1,0),
  "^":mod(pon.bind(0,0,a=>2.7184*+a,1,0),pon.bind(0,1,(a,b)=>(+a)**+b,1,0),0,0),
  "$":mod(pon.bind(0,0,a=>a instanceof A?narr(a.r):narr([0]),0,0),pon.bind(0,1,(a,b)=>{
    let wc=[-1,1/0],nr=a instanceof A?a.d:[a]
    if(wc.map(n=>nr.indexOf(n)>-1).reduce((a,b)=>a||b,1))nr[nr.indexOf(wc.filter(n=>nr.indexOf(n)>-1)[0])]=pd(b.r)/nr.reduce((a,b)=>a*(wc.indexOf(b)==-1?b:1),1)
    b=carr(b);let[lo,ln]=[pd(b.r),pd(nr)];if(lo==ln){b.r=nr;b.ds=nr.length;return b}else if(lo>ln){b.r=nr;b.d=b.d.slice(0,ln);b.ds=nr.length;return b}
    else{let nd=[];for(i=0;i<ln;i++)nd.push(b.d[i%lo]);return new A(nd,nr,b.b,b.str)}
  },0,1),99,99),
  "~":mod(pon.bind(0,0,(a,p)=>p?uc(a)?narr(rnc(65,+a+1),0,0,1):narr(rnc(97,+a+1),0,0,1):narr(rnc(1,+a+1)),1,1),pon.bind(0,1,(a,b)=>geti(b,a),0,1),0,99),
  "I.":mod(pon.bind(0,0,(a,p)=>(cid=n=>n.map(n=>argv&&argv['0']?n+1:n-1),p)?uc(a)?narr(cid(rnc(65,+a+1)),0,0,1):narr(cid(rnc(97,+a+1)),0,0,1):narr(cid(rnc(1,+a+1))),1,1)
    ,pon.bind(0,1,(a,b,p)=>(f=>f instanceof A?(f.str=p,f):p?narr([f],0,0,1):f)(geti(b,a,1)),0,1),0,99),
  ",":mod(pon.bind(0,0,(a,p)=>ravel(a,p),1,1),pon.bind(0,1,(a,b,p)=>narr(a.d.cl().concat(b.d.cl()),0,0,p),0,1),99,1),
  ";":mod(pon.bind(0,0,a=>ayr(';/').call(a),1,1),pon.bind(0,1,(a,b)=>a.ds==b.ds?ayr(`{{sh:($x)^:"$yNL.(x,@,:@(sh{)y)$\`sh,2}}`).call(a,b)
    :ayr(`{{sh:($x)^:@:$yNL.arr:x,@,:@(,&{{sh{\`$$y}}&.{)yNL.arr$\`sh+1,\`0#}($$x)^:$$y}}`).call(a,b),0,1),1,99),
  "#":mod(pon.bind(0,0,a=>a.r[a.ds-1],0,0),pon.bind(0,1,(b,a,p)=>{
    let bC=b.cl(),v=[],ba=b.d[0].b&&sb(b),c=b.rank(b.ds-1);if(a.ds==0||sb(a))a=narr([...Array(c.d.length)].map(_=>sb(a)?a.d[0]:a))
    if(a.d.length!=c.d.length)err(2);c.d.forEach((n,i)=>v.push(...rn(0,a.d[i],n)));return(n=>ba?(n.r=[n.d.length],n.ds=1,n):n)(
      b.ds<2?narr(v.flatMap(n=>bC.str&&!sb(bC)&&!bC.d[0].ds?n.d[0]:n),a.b|b.b,0,p)
      :new A(narr(v).d.flatMap(n=>n instanceof A?n.d:n),[...b.r.slice(0,b.ds-1),a.d.reduce((l,r)=>l+r,0)],0,p)
    )
  },1,1),99,[99,1]),
  "#.":mod(pon.bind(0,0,a=>parseInt(a.d.join(""),2),0,0),pon.bind(0,1,(a,b)=>{
    let n=0;for(let i=0;i<b.d.length;i++)n+=b.d[b.d.length-i-1]*a**i;return n
  },0,0),1,[0,1]),
  "#:":mod(pon.bind(0,0,a=>narr(a.toString(2).split("").map(n=>+n)),0,0),pon.bind(0,1,(a,b)=>{
    let v=[];for(n of a.d.reverse()){v.push(n==0?b:b%n);b=n==0?b|0:b/n|0};return narr(v.reverse())
  },0,0),0,[1,0]),
  "=":mod(pon.bind(0,0,a=>{
    a.d=a.rank(1).d,a.d=a.d[0].d.flatMap((_,i)=>a.d.map(x=>x.d[i]));a.r=a.r.length==1?[1,a.r[0]]:a.r.reverse();a.ds=2;return a
  },1,1),pon.bind(0,1,(a,b)=>+eq(a,b),1,0),2,0),
  "~.":mod(pon.bind(0,0,a=>eachN(carr(a).rank(a.ds?a.ds-1:0).d,(n,i)=>+n==1?narr(i,1):null),0,0),pon.bind(0,1,(a,b)=>{
    for(i=0;i<=b.d.length;i++)if(us(a)>us(i==0?-Infinity:b.d[i-1])&&us(a)<=us(i==b.d.length?Infinity:b.d[i]))return i
  },0,0),99,[0,1]),
  "~:":mod(pon.bind(0,0,(a,p)=>{
    let s=new Set(a.rank(a.ds-1).d),d=[];for(n of s.keys())d.push(n);return narr(d,0,0,p?a.str:0)
  },0,1),pon.bind(0,1,(a,b)=>+!eq(a,b),1,0),99,0),
  ",:":mod(pon.bind(0,0,(a,p)=>narr(a.d,a.b,0,p?a.str:0),0,1),pon.bind(0,1,(a,b)=>a.str?b.str?eq(a,b):b.has(a):new A(a.d.map(n=>b.has(n)),a.r.cl(),a.b),1,0),99,99),
  "{":mod(pon.bind(0,0,a=>a+1,1,1),pon.bind(0,1,(a,b)=>{//FIXME: 2 2 { 5 ; 6 is incorrect, yields 5 6 ; 6 0 instead of 5 0 ; 6 0
    if(ayr("[=:$&]").call(a,b))return b//TODO: Fix >r2 takes (kill me)
    let c=new A([0],1,0,b.str);c=ext(c,a.d,b.str)
    for(let i=0;i<b.ds&&i<a.d.length;i++)
      for(let k=0;k<(a.d[i+1]||1);k++)for(let j=0;j<Math.min(b.r[i],a.d[i]);j++)c.d[j+k*pd(c.r.slice(0,i+1))]=b.d[j+k*pd(b.r.slice(0,i+1))]??0;return c
  },0,1),0,99),
  "{.":mod(pon.bind(0,0,a=>ayr(']$`|.@.#&[').call(a,ayr(";,\\/:/").call(a)),0,0),pon.bind(0,1,(a,b,p)=>{
    let n=a.d.cl();b.d.map(v=>n.indexOf(v)>-1?0:n.push(v));return narr(n,a.b,0,p)
  },0,1),1,1),
  "{:":mod(pon.bind(0,0,(a,p)=>p?narr(a.d[0].cl(),0,0,1):a.d[0].cl(),0,1),pon.bind(0,1,(b,a)=>{
    if(a.r[0]!=b.r[0])err(1);let B=b.cl().rank(b.ds-1);let n=[];for(let i=0;i<a.r[0];i++)n.push(a.d[i]>=B.d.length?err(2):B.d[a.d[i]].d[i]);return narr(n,0,0,b.str)
  },0,0),99,[2,1]),
  "}":mod(pon.bind(0,0,a=>a-1,1,1),pon.bind(0,1,(a,b)=>{
    if(a.d.length>b.ds)err(2);try{let c=new A([0],1,0,b.str),d=[]
    for(let i=0;i<a.d.length;i++)if(a.d[i]<0){a.d[i]=-a.d[i];b.d=b.rank(i+1).d.flatMap(n=>n.d.reverse());d[i]=1}
    c=ext(c,a.d.map((n,i)=>b.r[i]-n),b.str);for(let i=0;i<b.ds&&i<a.d.length;i++)
      for(let k=a.d[i+1]||0;k>=0;k--)for(let j=a.d[i];j<b.r[i];j++)c.d[j-a.d[i]+k*pd(c.r.slice(0,i+1))]=b.d[j+k*pd(b.r.slice(0,i+1))]??0
    for(let i=0;i<a.d.length;i++)if(d[i])c.d=c.rank(i+1).d.flatMap(n=>n.d.reverse());return c}catch(_){return narr([])}
  },0,1),0,99),
  "}:":mod(pon.bind(0,0,(a,p)=>p?narr(a.d[a.d.length-1].cl(),0,0,1):a.d[a.d.length-1].cl(),0,1),pon.bind(0,1,(a,b)=>ayr("[:+/@1&`,:~:&[=:\\]").call(a,b),0,0),99,99),
  "|":mod(pon.bind(0,0,a=>+!a,1,0),pon.bind(0,1,(a,b)=>b % a,0,0),0,0),
  "^:":mod(pon.bind(0,0,(a,p)=>p?lc(a)?a-32:a:Math.ceil(+a),1,1),pon.bind(0,1,(a,b)=>Math.max(a,b),1,1),0,0),
  "v:":mod(pon.bind(0,0,(a,p)=>p?uc(a)?a+32:a:Math.floor(+a),1,1),pon.bind(0,1,(a,b)=>Math.min(a,b),1,1),0,0),
  "!":mod(pon.bind(0,0,ft,1,0),pon.bind(0,1,(a,b)=>a<b?0:ft(a)/(ft(b)*ft(a-b)),1,0),0,0),
  ";:":mod(pon.bind(0,0,a=>new A(carr(a).rank(a.ds?a.ds-1:0).d,a.r.slice(a.ds-1),a.b,a.str),0,1),pon.bind(0,1,(b,a,p)=>{
    b=b.rank(b.ds-1);if(b.d.length!=a.d.length)err(1);let n=[];for(i=0;i<a.d.length;i++){
      if(i==0&&a.d[i]!=0)n.push([b.d[i].cl()]);else if(a.d[i]!=0)n[n.length-1].push(b.d[i].cl());else n.push([])
    }if(n.length==1)return narr(n[0],0,0,p||b.str);return narr(n.map(n=>narr(n,1,0,p||b.str)))
  },0,1),99,[99,1]),
  "=.":mod(pon.bind(0,0,a=>a.d.length?+a.d.map(n=>eq(a.d[0],n)).reduce((a,b)=>a&&b,1):1,0,0),pon.bind(0,1,(a,b)=>a^b,1,0),99,0),
  "i.":mod(pon.bind(0,0,a=>{
    if(a.d.length==0)err(2);let r=[],i;for(i=0;i<=a.d[0].ds;i++)r.push(Math.max(...a.d.map(n=>n instanceof A?n.d[i]:i?err(2):n))+1)
    a.d=a.d.map(carr);let x=new A(rn(pd(r),0,0),r);for(let l of a.d)x.d[l.d.map((n,i)=>n*pd(r.slice(r.length-i))).reduce((a,b)=>a+b,0)]=1;return x
  },0,0),pon.bind(0,1,(a,b)=>{
    let r=a.d;b.d=b.d.map(carr);let x=new A(rn(pd(r),0,0),r);for(let l of b.d){
      let n=l.d.map((n,i)=>n*pd(r.slice(0,i))).reduce((a,b)=>a+b,0);if(n>=x.d.length)continue;x.d[n]=1
    }return x
  },0,0),1,[99,1]),
  ",.":mod(pon.bind(0,0,a=>det(carr(a,0).rank(1)),0,1),pon.bind(0,1,(a,b)=>a.d.map((n,i)=>n*b.d[i]).reduce((a,b)=>a+b,0),0,0),2,1),
  "i:":mod(pon.bind(0,0,a=>{let r=new A(rn(a*a,0,0),[a,a]);for(let i=0;i<a;i++)r.d[i*a+i]=1;return r},0,0),pon.bind(0,1,(a,b)=>{
    if(b.ds>=a.ds){a=a.rank(a.ds-1);b=b.rank(b.ds-1);return narr(b.d.map(b=>{for(i=0;i<a.d.length;i++)if(eq(a.d[i],b))return i;return a.d.length}))}
    else{a=a.rank(b.ds);for(i=0;i<a.d.length;i++)if(eq(a.d[i],b))return i;return a.d.length}
  },0,0),0,99),
  "^.":mod(pon.bind(0,0,a=>new A(a.rank(a.ds-1).d.reverse().flatMap(n=>n instanceof A?n.d:n),a.r,a.b,a.str),1,1),pon.bind(0,1,(a,b)=>a&b,1,0),99,0),
  "v.":mod(pon.bind(0,0,n=>{
    if(argv!=null&&argv['0'])n++;if(n<2)return 2;if(n==2)return 3;let l=n*(Math.log(n)+Math.log(Math.log(n)))|0,r=Math.sqrt(l)+1|0,c=1,i=0,s,p,j;l=(l-1)/2|0;r=r/2-1|0;s=Array(l)
    for(;i<r;++i)if(!s[i]){++c;for(j=2*i*(i+3)+3,p=2*i+3;j<l;j+=p)s[j]=1}for(p=r;c<n;++p)if(!s[p])++c;return 2*p+1
  },1,0),pon.bind(0,1,(a,b)=>a|b,1,0),0,0),
  "|.":mod(pon.bind(0,0,a=>(a.d=a.rank(a.ds-1).d.reverse().flatMap(n=>a.d[0].ds?n:n.d??n),a),1,1),pon.bind(0,1,(a,b)=>(b.d=b.rank(b.ds-1).d.rot(+a).flatMap(n=>n.d??n),b),1,1),1,[0,1]),
  "B:":mod(a=>a.ds>0?ayr(':;(,`0#)"&:(-`"&:(^:/)#")#:').call(a):ayr('#:').call(a),(a,b)=>b.ds>0?ayr(';&#:').call(a,b):ayr('#:').call(a,b)),
  "=:":mod(pon.bind(0,0,a=>a.str?ayr(str((a.b=0,a))):(a.d=a.d.map(n=>ayr(str((n.b=0,n)))),a),1,0)
          ,pon.bind(0,1,(a,b)=>+eq(a,b),0,0),99,99),
  "?":mod(pon.bind(0,0,(a,p)=>{
    let s=new Set();return narr(a.rank(a.ds-1).d.map(v=>s.has(v)?0:s.add(v)&&1),a.b,0,p)
  },0,1),pon.bind(0,1,(a,b)=>{
    if(sb(b)||typeof b!='object')return(a.b=1,a);if(a.r[a.ds-1]!=b.r[0])err(2)
    let m=new Map([...Array(Math.max(...b.d)+1).keys()].map(n=>[n,[]])),s=[];a.rank(a.ds-1).d.forEach((v,i)=>b.d[i]>-1?m.get(b.d[i]).push(v):0)
    for(let v of m.values())s.push(narr(v,1,0,a.str));return narr(s)
  },0,0),99,[99,1]),
  "?.":mod(pon.bind(0,0,a=>Math.floor(Math.random()*a),1,1),pon.bind(0,1,(a,b)=>ayr("{{x{?:I.y}}").call(a,b),0,0),0,0),
  "?:":mod(pon.bind(0,0,a=>{
    for(let i=a.r[0]-1;i;i--){let j=Math.random()*(i+1)|0;[a.d[i],a.d[j]]=[a.d[j],a.d[i]]}return a
  },1,1),pon.bind(0,1,(a,b)=>ayr("[#(:,^./^./&,&~:\\)").call(a,b),0,1),1,99),
  "`.":mod(pon.bind(0,0,a=>sta(a.toString()),1,1),pon.bind(0,1,(a,b)=>{
    b=b.toString();let[fl,fr]=[Math.ceil((+a-b.length)/2),Math.ceil((+a-b.length)/2)-(b.length%2?!(a%2):a%2)]
    return sta(" ".repeat(fl<0?0:fl)+b+" ".repeat(fr<0?0:fr))
  },0,1),0,0),
  "[.":mod(pon.bind(0,0,a=>(a.d=a.rank(a.ds-1).d,a.d.shift(),a.d=a.d.flatMap(n=>n.d??n),a.r[a.ds-1]--,a),1,1),pon.bind(0,1,(a,b)=>narr([carr(a),carr(b)]),0,0),1,99),
  "].":mod(pon.bind(0,0,(a,p)=>(a.d=[pr(a,p),...a.d],a.r[0]++,a),1,1),pon.bind(0,1,(a,b)=>narr([carr(b),carr(a)]),0,0),1,99),
  "K.":mod(pon.bind(0,0,a=>{
    a=a.rank(a.ds-1);let r=[];let m=new Map([...a.d.map(n=>[str(n),[]])]);a.d.forEach((n,i)=>m.set(str(n),[...m.get(str(n)),i]))
    return narr(Array.from(m.values()).map(n=>narr(n,1)))
  },0,0),pon.bind(0,1,(a,b)=>ayr("#$.&?").call(a,b),0,0),99,[99,1]),
  "|:":mod(pon.bind(0,0,(a,p)=>ayr("|.~").call(narr([a],0,0,p)),1,1),pon.bind(0,1,(a,b)=>{
    b=b.cl();for(let i of a.d){let[n]=b.r.splice(a.ds-i-1,1);b.r.push(n)}return b
  },0,1),0,[1,99]),
  "E.":mod(pon.bind(0,0,a=>err(2),0,0),pon.bind(0,1,(a,b)=>ayr("{{(x=:);.($x)]y}}").call(a,b),1,0),99,99)
}
,bdrs={
  '&':op(0,(a,b)=>mod(l=>l==null?err(0):!a.uf?b.call(a,l):!b.uf?a.call(l,b):a.call(b.call(l))
    ,(l,r)=>l==null||r==null?err(0):!a.uf||!b.uf?err(0):a.call(b.call(l,r)))),
  '&:':op(0,(f,g)=>mod(a=>a==null?err(0):f.call(a.cl(),g.call(a)),(a,b)=>a==null||b==null?err(0):f.call(a,g.call(b)))),
  '&.':op(0,(f,g)=>mod(a=>a==null?err(0):g.call(f.call(a.cl()),a),(a,b)=>a==null||b==null?err(0):g.call(f.call(a),b))),
  '"':op(1,f=>mod(l=>l==null?err(0):l.ds==0?new A([f.call(l)],1,0):new A(l.rank(l.ds-1).d.map(n=>(l=>sb(l)?l.d[0]:l)(f.call(sb(n)?n.d[0]:n))),l.rank(l.ds-1).r,l.b,l.str)
  ,(l,r)=>{
    if(l==null||r==null)err(0);let j,b=l=>sb(l)?l.d[0]:l;if(l.ds==0||sb(l))j=1;else if(r.ds==0||sb(r))j=0;
    if(j!=null)return narr(j?r.rank(r.ds-1).d.map(n=>b(f.call(l.cl(),n))):l.rank(l.ds-1).d.map(n=>b(f.call(n,r.cl()))))
    if(JSON.stringify(l.r)==JSON.stringify(r.r)){let F=l.rank(l.ds-1),S=r.rank(r.ds-1);return narr(F.d.map((n,i)=>b(f.call(n,S.d[i]))))}err(1)
  })),
  '".':op(0,(f,c)=>mod(x=>{
    if(c.uf){let p;do{p=x.cl();x=f.call(x)}while(!c.call(p,x.cl()))}else for(let i=0;i<+c.call();i++)x=f.call(x);return x
  },(x,y)=>{if(c.uf)err(2);for(let i=0;i<+c;i++)y=f.call(x.cl(),y);return y})),
  '":':op(1,f=>mod(l=>l==null?err(0):l.ds==0?new A([f.call(l)],1,0):new A(l.d.map(n=>f.call(n)),l.r,l.b,l.str),(l,r)=>{
    if(l==null||r==null)err(0);let j,b=l=>sb(l)?l.d[0]:l
    if(l.ds==0||sb(l))j=1;else if(r.ds==0||sb(r))j=0;if(j!=null)return new A(j?r.d.map(n=>b(f.call(l.cl(),n))):l.d.map(n=>b(f.call(n,r.cl()))),j?r.r:l.r,l.b|r.b,l.str|r.str)
    if(JSON.stringify(l.r)==JSON.stringify(r.r))return new A(l.d.map((n,i)=>b(f.call(n,r.d[i]))),r.r,l.b|r.b,l.str|r.str);err(1)
  })),
  "`":op(1,f=>mod(l=>f.call(l.cl(),l),(l,r)=>f.call(r,l))),
  "/":op(1,f=>mod((r,x)=>x.ds?x.d.length==1?x.d[0]:
    x.ds<=r?x.d.slice(1).reduce((a,v)=>f.call(a,v),x.d[0])
   :new A(x.rank(r,1).d.map(n=>n.d.slice(1).reduce((a,v)=>f.call(a,v),n.d[0])),x.r.slice(1),x.b):x
  ,pon.bind(0,1,(l,r)=>{
    if(r.ds==0)return r;let p=0,n=[];r=r.rank(r.ds-1);if(l<0)l=Math.abs(l,p=1)
    for(let i=0;i<=r.d.length-l;i+=p?l:1)n.push(r.d.slice(i+1,i+l).reduce((a,v)=>f.call(a,v),r.d[i]));return narr(n)
  },0,0),1,[0,99])),
  "/.":op(1,f=>mod(pon.bind(0,0,x=>x.ds?(x=x.rank(x.ds-1),x.d.slice(1).reduce((a,v)=>f.call(a,v),x.d[0])):x,2,0)
    ,pon.bind(0,1,(x,y)=>ayr("]~<:&[").call(bdrs['"'].call(f).call(x),y),1,1),99,99)),
  "\\":op(1,f=>mod((r,x)=>x.ds?
    x.ds<=r?(p=x.d[0],new A(x.d.map((n,i)=>i==0?n:(p=f.call(p,n),p)),x.r,x.b))
   :new A(x.rank(r,1).d.flatMap(x=>(p=x.d[0],x.d.map((n,i)=>i==0?n:(p=f.call(p,n),p)))),x.r,x.b):x
  ,pon.bind(0,1,(x,y)=>{
    let n=[];x=carr(x,0).rank(x.ds-1);y=carr(y,0).rank(y.ds-1);for(l of x.d)for(r of y.d)n.push(f.call(l,r));return new A(n,[y.d.length,x.d.length],0,0)
  },0,0),1,99)),
  "\\.":op(1,f=>mod(pon.bind(0,0,x=>x.ds?(bd=x.rank(x.ds-1),narr(bd.d.map((n,i,o)=>f.call(narr(o.slice(0,o.length-i).cl(),0,0,n.ds==0?bd.str:n.str))),x.b)):x,1,0)
    ,pon.bind(0,1,(x,y)=>ayr("]~>:&[").call(bdrs['"'].call(f).call(x),y),1,1),1,99)),
  "@":op(0,(a,b)=>mod(l=>{
    if(b.uf)return a.call(b.call(l));else if(a.rk==null)err(1);else{let n=a.cl();n.rk[0]=b;return n.call(l)}
  },(l,r)=>{
    if(b.uf)return a.call(b.call(l),b.call(r));if(b.ds==0)b=[b,b];if(a.rk==null)err(1);else{let n=a.cl();n.rk[1]=b;return n.call(l,r)}
  })),
  "/:":op(1,f=>mod(pon.bind(0,0,dgs.bind(0,f),0,0),(_,a,b)=>{a=carr(a,0).rank(Math.max(0,a.ds-1));a.d=a.d.map(n=>f.call(n,b.cl()));a=fix(a);a.str=0;return a},2,99)),
  "\\:":op(1,f=>mod(pon.bind(0,0,a=>{a=a.rank(1);a.d=a.d.map(n=>(n.d=n.d.reverse(),n));return dgs(f,a,1)},0,0),(_,a,b)=>{
    b=carr(b,0).rank(Math.max(0,b.ds-1));b.d=b.d.map(n=>f.call(a.cl(),n));b=fix(b);b.str=0;return b
  },2,99)),
  "@:":op(1,f=>mod(a=>zp(a.cl(),a,f),(a,b)=>zp(a,b,f))),
  "@.":op(0,(a,b)=>mod(l=>{
    if(b.uf)return a.call(bdrs['":'].call(b).call(l));else{if(b<0){b=-b;err(2)}else return mapd(l,n=>a.call(n),b)}
  },(l,r)=>{
    if(b.ds==0)b=narr([b.cl(),b]);if(b.uf)a.call(bdrs['":'].call(b).call(l,r))
    else{let w=0;if(b.d[0]<0||b.d[1]<0){if(b.d[0]<0){b.d[0]=0;l=narr([l],1,1);w=1}if(b.d[1]<0){b.d[1]=0;r=narr([r],1,1)}}return mapd(l,L=>mapd(r,R=>a.call(L,R),b.d[1]),b.d[0])}
  })),
  ";.":op(0,(f,g)=>mod(a=>{
    if(g.uf)err(2);let r=carr(g.cl()).d;let s=ayr("$$~.").call(new A(rn(pd(r),0,1),r)).d.map(n=>n.d.length<a.ds?n.d.concat(rn(a.ds-n.d.length,0,0)):n.d);let N=a.cl()
    for(let i=0;i<a.d.length;i++){
      let n=a.r.map((v,y,_,z=pd(a.r.slice(0,y)))=>(i%(v*z))/z|0);let o=n.map((v,i)=>s.length%2?v-s[Math.floor(s.length/2)][i]:v)
      N.d[i]=f.call(geti((f=>(f.d=f.d.map(n=>(n.b=1,n)),f))(new A(s.map(C=>narr(C.map((v,i)=>v+o[i]))),r)),a.cl()))
    }N.str=0;return N
  },err.bind(0,2))),
  "$:":op(1,f=>mod(a=>{let c=[f.call(a.cl())],n;while(!eq(c[0],n=f.call(c[c.length-1].cl()))&&!eq(c[c.length-1],n))c.push(n);return narr(c)}
    ,(a,b)=>{for(let i=0;i<+a;i++)b=f.call(b);return b})),
  "$.":op(1,f=>mod(a=>{let c=0;return new A((v=>a.ds>1?v.flatMap(n=>n.d??n):v)(a.rank(a.ds-1).d.filter(v=>f.call(v.cl())&&++c)),[...a.r.slice(0,a.ds-1),c],a.b,a.str)}
    ,(a,b)=>{let c=0;return new A((v=>b.ds>1?v.flatMap(n=>n.d??n):v)(b.rank(b.ds-1).d.filter(v=>f.call(a,v)&&++c)),[...b.r.slice(0,b.ds-1),c],b.b,b.str)})),
  "}.":op(1,f=>mod(pon.bind(0,0,a=>ayr("[K.1+\\&,|&]").call(a.rank(a.ds-1),bdrs["/"].call(f).call(2,a.rank(a.ds-1))),0,0),(_,a,b)=>err(2),99,99))
}
,chnk=(a,s,str=0,b=0)=>{
  let n=[];for(let x,i=0;i<a.length;i+=s){
    if(i+s>a.length){b=1;n=n.map(e=>(e.b=1,e))}x=a.slice(i,Math.min(a.length,i+s));n.push(new A(x,Math.min(a.length,i+s)-i,0,str))
  }return new A(n,n.length==1?1:[1,n.length],b,str);
}
,fix=a=>{
  let f=a.d.reduce((acc,x)=>acc||x instanceof A,false);if(f)f=a.d.length>1&&a.ds==1||a.d.reduce((acc,x)=>acc||x instanceof A&&x.b,false)
  if(f)a.d=a.d.map(e=>e instanceof A?(e.b=1,e):new A([e],1,1));while(a.r[a.ds-1]==1&&a.ds>1){a.r.pop();a.ds-=1}return a
}
,str=s=>argv!=null&&!argv.n&&typeof s=='number'?s.toString().replace('-','_').replace('Infinity','_'):s.toString()
,sta=s=>narr(s.split("").map(n=>n.charCodeAt(0)),0,0,1)
,resc=r=>r.replace(/[^A-Za-z0-9_]/g,'\\$&')
,mex=f=>f.uf?f:f.call()
,nnw=(t,i)=>{
  let o=1;while(t[i+o]&&t[i+o].t==9)o++;return t[i+o]?[i+o,t[i+o]]:[i+o,{t:10}]
}
,mvr=n=>n.vr?n.call():n
,ste=n=>n.v=='[:'?bdrs['&']:n.v==']:'?bdrs['&:']:n.v=='`:'?bdrs['`']:err(3)
,inst=o=>o.t<2||o.t==4||o.t==7&&(env[o.v]==null?0:!env[o.v].uf)||o.t==8&&!o.v.uf
,lex=s=>{
  let m,l,t=[];if(s!=null)s=s.replace(/NL\./g,"\n").replace(/DS\..*(?:\n|$)/g,"\n");while(s){
    if(m=/^((?:_?\d*)?r_?\d+)|^(__|(?:_?\d*\.?\d*)?(?:e_?)?\d*\.?\d+|_)/.exec(s)){
      if(m[2]!=null)m[1]=m[2];let x=m[1].replace(/_/g,'-').replace(/(?<=-?)(?<!\d)(e|r)/,'1$1'),l,r;if(x=="--"||x=="-")t.push({t:0,v:x=="--"?-Infinity:Infinity})
      else if(x.indexOf("r")>-1)t.push({t:0,v:([l,r]=x.split("r"),+l/+r)})
      else if(x.lastIndexOf(".")>x.indexOf("e")&&x.indexOf("e")>-1)t.push({t:0,v:([l,r]=x.split("e"),(+l)**+r)});else t.push({t:0,v:+x})
    }else if(m=/^'((?:[^'\\]|\\.)*)'/.exec(s))t.push({t:1,v:(l=JSON.parse(`"${m[1].replace(/"/g,'\\"').replace(/\n/g,'\\n')}"`),sta(l))})
    else if(m=/^\[:|^\]:|^`:/.exec(s))t.push({t:5,v:m[0]})
    else if(m=/^\(|^\)|^{{|^}}/.exec(s))t.push({t:2,v:m[0]})
    else if(m=RegExp(`^(${Object.keys(syms).concat(Object.keys(bdrs)).sort((a,b)=>b.length-a.length).map(resc).join('|')})`).exec(s))t.push({t:bdrs[m[1]]!=null?3:2,v:m[1]})
    else if(m=/^:/.exec(s))t.push({t:6})
    else if(m=/^(\s)/.exec(s))t.push({t:9,v:m[1]})
    else if(m=RegExp(`^(${Object.keys(env).sort((a,b)=>b.length-a.length).map(resc).join('|')})`).exec(s))t.push({t:7,v:m[1]})
    else if(m=/^([a-zA-Z]+)/.exec(s))t.push({t:7,v:m[1]})
    else err(3)
    s=s.slice(m&&m[0].length||1)
  }
  return t
}
,grp=t=>{//TODO: Variable declaration inside of parens, use. Eval line by line instead of pre-parsing first?
  let tn=[],b=[],ig=0,oc=0,ib=0,i2=(x,n)=>x!=null&&x.t==2&&x.v==n;for(let i=0;i<=t.length;i++){if(ig){
    if(t[i]==null)err(5);else if(i2(t[i],'(')){b.push(t[i]);oc++}else if(i2(t[i],')')){
      if(oc==0){
        let v;try{v=exec(strand(grp(b)),1)}catch(e){
          let B=b.cl(),u;v=mod(a=>exec(strand(grp(B)),1).call(a),(a,b)=>exec(strand(grp(B)),1).call(a,b))
          v.uf=(inst(u=nnw(t,i)[1])||u.t==3)&&u.t!=10&&!t.slice(i,nnw(t,i)[0]).reduce((a,b)=>a||b.t==9&&b.v=='\n',0)&&!inst(B.filter(n=>n.t!=9).reduce((a,b)=>b,{t:10}),1)
        }tn.push({t:8,v});ig=0;b=[]
      }else{b.push(t[i]);oc--}
    }else b.push(t[i])
  }else if(ib){
    if(t[i]==null)err(5);else if(i2(t[i],'{{')){b.push(t[i]);oc++}else if(i2(t[i],'}}')){
      if(oc==0){let B=b.cl()
        tn.push({t:8,v:mod(a=>{cle();env.y=a;let r=exec(strand(grp(B)),1);ucle();return r},(a,b)=>{cle();env.x=a;env.y=b;let r=exec(strand(grp(B)),1);ucle();return r})})
        ib=0;b=[]
      }else{b.push(t[i]);oc--}}else b.push(t[i])
  }else if(i2(t[i],'('))ig=1;else if(i2(t[i],')'))err(5);else if(i2(t[i],'{{'))ib=1;else if(i2(t[i],'}}'))err(5);else if(t[i]!=null)tn.push(t[i])}return tn
}
,strand=t=>{
  if(t.length==1)return t;let tn=[],b=[];for(let i=0;i<=t.length;i++)
    if(t[i]!=null&&t[i].t==7&&t[i].v=='js'&&nnw(t,i)[1].v&&nnw(t,i)[1].v.str){[i,]=nnw(t,i);tn.push({t:7,v:'js'},t[i])}
    else if(t[i]!=null&&inst(t[i]))b.push(t[i].t==7?{t:env[t[i].v].call()instanceof A?4:0,v:env[t[i].v].call()}:t[i])
    else if((t[i]==null||t[i].t==9&&t[i].v=='\n'||t[i].t==2||t[i].t==3||t[i].t==7||t[i].t==8)&&b.length==1)
      tn.push(...(t[i]!=null?[b.pop(),t[i]]:[b.pop()]));
    else if((t[i]==null||!(t[i].t==9&&t[i].v==' '))&&b.length){
      let a=narr(b.map(n=>n.t==1||n.t==4?(n.v.b=1,n.v):n.v));tn.push(...(t[i]!=null?[{t:4,v:a},t[i]]:[{t:4,v:a}]));b=[]
    }else tn.push(t[i]);return tn.filter(n=>n!=null);//sometimes happens
}
,ptrain=(t,G=0)=>{
  if(t.length==1)return t[0];if(!t[t.length-1].uf&&!t[t.length-1].vr||t[t.length-1].vr&&!t[t.length-1].call().uf)G=0;let tn=[]
  if(t[0].t==6){
    tn=t.cl();let i=tn.length-2
    if(i>0&&!tn[i].uf){let x=tn.cl();i--;tn.push(mod(A=>mvr(x[x.length-1]).call(x[x.length-2],A),(A,B)=>err(0)))}
    else{let x=tn.cl();tn.push(mod(A=>mvr(x[x.length-1]).call(A),(A,B)=>mvr(x[x.length-1]).call(A,B)))}
    for(;i>0;i--){
      if(!tn[i-1].uf&&i>1){
        let x=tn.cl();i--;let I=i.cl();tn.push(mod(A=>mvr(x[I+1]).call(x[I],mvr(x[x.length-1]).call(A)),(A,B)=>mvr(x[I+1]).call(x[I],mvr(x[x.length-1]).call(A,B))))
      }else{let x=tn.cl();let I=i.cl();tn.push(mod(A=>mvr(x[I]).call(mvr(x[x.length-1]).call(A)),(A,B)=>mvr(x[I]).call(mvr(x[x.length-1]).call(A,B))))}
    }return tn[tn.length-1]
  }if(G){//train
    tn=t.cl();for(let i=tn.length-1;i>=0;){
      if(i>=2&&(t[i-1].uf||t[i-1].vr&&t[i-1].call().uf)){i-=2;let x=tn.cl();tn.splice(i,0,mod(
        A=>x[i].t==5?ste(x[i]).call(mvr(x[i+1]),mvr(x[i+2])).call(A):mvr(x[i+1]).call(mvr(x[i]).call(A.cl()),mvr(x[i+2]).call(A))
       ,(A,B)=>x[i].t==5?ste(x[i]).call(mvr(x[i+1]),mvr(x[i+2])).call(A,B):mvr(x[i+1]).call(mvr(x[i]).call(A.cl(),B.cl()),mvr(x[i+2]).call(A,B)),
      ))}else if(i>=1&&!t[i-1].uf&&!t[i-1].vr){
        i-=1;let x=tn.cl()
        tn.splice(i,0,mod(A=>x[i].t==5?ste(x[i]).call(mvr(x[i+1])).call(A):mvr(x[i+1]).call(x[i],A),(A,B)=>x[i].t==5?ste(x[i]).call(mvr(x[i+1])).call(A,B):err(0)))
      }else if(i>=1){
        i-=1;let x=tn.cl();tn.splice(i,0,mod(A=>mvr(x[i]).call(mvr(x[i+1]).call(A)),(A,B)=>mvr(x[i]).call(A,mvr(x[i+1]).call(B))))
      }else i--
    }return tn[0]
  }else{//normal
    if(t[t.length-1].uf||t[t.length-1].vr&&t[t.length-1].call().uf)return ptrain(t,1);tn.push(t[t.length-1]);for(let i=t.length-2;i>=0;i--){
      if(t[i-1]!=null&&!t[i-1].uf){
        let x=tn.pop();i--;tn.push(mod(_=>mvr(t[i+1]).call(mvr(t[i]).call(),x.call()),_=>mvr(t[i+1]).call(t[i].call(),x.call())))
      }else{let x=tn.pop();tn.push(mod(_=>mvr(t[i]).call(x.call()),_=>mvr(t[i]).call(x.call())))}
    }let x=tn.pop();x.uf=0;return x
  }
}
const exec=(t,G=0)=>{
  let fq=[],V,h,j,F=[0];for(let i=0;i<t.length;i++){
    let o=t[i];if(o.t==9&&o.v=='\n'&&fq.length){
      if(F[0]==1)F=[2,F[1],fq.cl()];else if(F[0]==2){let x;if(ptrain(F[1],0).call())x=ptrain(F[2],0).call();else x=ptrain(fq,0).call();if(x!=null)return x;F=[0]}
      else if(V&&fq.length){env[V]=(h=ptrain(fq,1),h.uf?h:h.call());V=0}else{let x=ptrain(fq,0).call();if(G)return x;if(x!=null)console.log(str(x))}fq=[]
    }if(o.t==7){
      if(o.v=='js'&&nnw(t,i)[1].t==1&&nnw(t,i)[1].v.str){[i,o]=nnw(t,i);fq.push(eval(str(o.v)))}
      else if(nnw(t,i)[1].t==6){[i,]=nnw(t,i);if(fq.length)fq.push((f=>(f.uf=0,f))(mod(a=>(env[o.v]=a),(a,b)=>err(2))));else V=o.v}
      else if(!fq.length&&env[o.v]==null)err(3)
      else fq.push(fq.length?env[o.v]!=null&&env[o.v].uf?env[o.v]:(f=>(f.uf=0,f.vr=1,f))(_=>env[o.v]??err(3)):env[o.v])
    }else if(o.t==2||o.t==8&&o.v.uf){
      let[ni,b]=nnw(t,i);if(t.slice(i,ni).reduce((a,b)=>a||b.t==9&&b.v=='\n',false))fq.push(o.t==8?o.v:syms[o.v])
      else if(inst(b)||ni!=i&&b.t==8){
        i=ni;if(b.t==8){if(b.v.uf||b.t==7&&env[b.v]!=null&&env[b.v].uf)fq.push((o.t==8?o.v:syms[o.v]),b.t==7?env[b.v]:b.v);else fq.push(o.t==8?o.v:syms[o.v],b.v)}
        else fq.push(o.t==8?o.v:syms[o.v],b.t==7?env[b.v]:b.v)
      }else fq.push(o.t==8?o.v:syms[o.v])
    }else if(o.t==3){
      if(!fq.length)err(0)
      else if(!bdrs[o.v].m){
        let f;[i,f]=nnw(t,i),j=0;if(f.t==3&&f.v=='`')[i,f]=nnw(t,i),j=1;if(!inst(f)&&f.t!=2&&f.t!=8)err(0)
        fq.push(bdrs[o.v].call(...(f=>j?f.reverse():f)([fq.pop(),inst(f)||f.t==8?f.t==7?env[f.v]:f.v:syms[f.v]])))
      }else fq.push(bdrs[o.v].call(fq.pop()))
    }else if(o.t<2||o.t==4||o.t==8){
      if(!fq.length&&!V&&F[0]==0&&t.slice(i,nnw(t,i)[0]).reduce((a,b)=>a||b.t==9&&b.v=='\n',false)){
        if(G&&nnw(t,i)[0]+1>=t.length)return o.v;else if(!G)console.log(str(o.v))
      }else fq.push(o.v);
    }else if(o.t==5)fq.push(o);else if(o.t==6&&fq.length)(F=[1,fq.cl()],fq=[]);else if(o.t==6)fq.push(o)
  }if(fq.length){
    if(F[0]==1){let x;if(ptrain(F[1],0).call())x=ptrain(fq,0).call();if(x!=null){if(G)return x;else console.log(str(x))}}
    else if(F[0]==2){let x;if(ptrain(F[1],0).call())x=ptrain(F[2],0).call();else x=ptrain(fq,0).call();if(x!=null){if(G)return x;else console.log(str(x))}}
    else if(V)env[V]=ptrain(fq,1);else if(!G&&fq[fq.length-1].uf)err(0)
    else var x=ptrain(fq,G);if(G)return mex(x);else if(x!=null){x=x.call();if(x!=null)console.log(str(x))}
  }
}
,ayr=(d,g=1)=>exec(strand(grp(lex(d))),g)
,run=d=>{
  if(module!=null&&argv.debug)(console.log(lex(d)),console.log(grp(lex(d))),console.log(strand(grp(lex(d)))),ayr(d,0))
  else if(module!=null){try{ayr(d,0)}catch(e){argv.debug||e.toString().startsWith("[")?console.error(e):console.error("[/] INTERNAL ERROR")}}
  else{try{return ayr(d,0)}catch(e){e.toString().startsWith("[")?0:console.log(e)}}
}
let env={
  put:mod(A=>console.log(A.toString()),(A,B)=>console.log((B.toString()+"\n").repeat(+A.call()).trim())),
  jn:mod(A=>ayr("([,' ',])/").call(A),(A,B)=>B.str?B:ayr(`#&[}[:,,\\:`).call(A,B)),
  sp:mod(A=>ayr("];:' '~:").call(A),(A,B)=>ayr("];:[~:]").call(A,B)),
  fread:mod(A=>narr(fs.readFileSync(str(A),"utf8").split(/\r?\n/g).map(sta)),(A,B)=>narr(fs.readFileSync(str(A),str(B)).split(/\r?\n/g).map(sta))),
  su:ayr("~`&.`<:"),
  sd:ayr("~`&.`>:"),
  'V.':sta('AEIOU'),
  'A.':sta('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  'C.':sta('BCDFGHJKLMNPQRSTVWXYZ')
}
if(module&&module.exports){
if(argv._[0]=='help'||argv.h||argv.help)console.log(`ayr ${require('./package.json').version}:
Usage:
    ayr <file> [stdin]    - run a file
    ayr -u <code> [stdin] - run the code

Args:
    --debug - Debug code (for internal use)
    -0      - The one-range symbol '~' creates a range from [0, N) instead
    -n      - Numbers are outputted in classic JS style instead of ayr style`),process.exit(0);if(argv.u){
  env.I=argv._.length?ayr(argv._[argv._.length-1]):sta("");run(argv.u)
}else if(!argv._.length){console.log(`ayr ${require('./package.json').version}: type 'exit' to exit`);env.I=argv._.length?ayr(argv._[argv._.length-1]):sta("")
while((inp=rl.question('    '))&&inp!="exit"){
  run(inp)
  //what the fuck javascript
  Object.values(syms).forEach(mod=>{mod.bd=[]})
  Object.values(bdrs).forEach(mod=>{mod.bd=[]})
  Object.values(env).forEach(mod=>{if(mod.uf)mod.bd=[]})
}}else{env.I=ayr(argv._[1],1);fs.readFile(process.cwd()+"/"+argv._[0],'utf8',(e,d)=>e?err(4):run(d.replace(/\r\n/g,"\n").replace(/\#\!\/.+\n/,"").trim()))}}
if(require==null)window.runAyr=run