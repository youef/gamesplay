/* =========================================================
   core.js — أدوات عامة، الحالة المحفوظة، الصوت، العارض والمشهد،
             أدوات الرسم والتصادم وأساسيات شبكة المدينة
   ========================================================= */
(function(){
'use strict';
const ND = window.ND = window.ND || {};
const PI = Math.PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a),
      wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
Object.assign(ND,{PI,clamp,rnd,wrap});
const $ = ND.$ = i => document.getElementById(i);
ND.dist = (a,b,c,d)=>Math.hypot(a-c,b-d);
ND.fmt  = n => Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ---------- الحالة المحفوظة ---------- */
const S = ND.S = {
  players:2, split:'h', q:2, sound:1,
  wal:[10000000,10000000],                                     // محفظة كل لاعب (10 مليون)
  cam:[{yaw:0,zoom:1,tilt:.45},{yaw:0,zoom:1,tilt:.45}],       // زاوية الكاميرا لكل لاعب
  cars:[0], yard:0, study:0, mi:0,
  skin:[{c:0xffffff,g:1},{c:0x1f7a3d,g:2}],
  builds:[], decor:[], plot:[]
};
try{ Object.assign(S, JSON.parse(localStorage.getItem('nd96')||'{}')); }catch(e){}
if(!Array.isArray(S.wal)||S.wal.length<2) S.wal=[10000000,10000000];
if(!Array.isArray(S.cam)) S.cam=[null,null];
S.cam=[0,1].map(i=>{const c=S.cam[i]||{};return{yaw:+c.yaw||0,zoom:+c.zoom>0?+c.zoom:1,tilt:typeof c.tilt=='number'?c.tilt:.45}});
if(!Array.isArray(S.builds))S.builds=[];
if(!Array.isArray(S.decor))S.decor=[];
if(!Array.isArray(S.plot))S.plot=[];
ND.save=()=>{try{localStorage.setItem('nd96',JSON.stringify(S))}catch(e){}};

/* ---------- حالة التشغيل (غير محفوظة) ---------- */
const ST = ND.ST = {
  T:0, fr:0, mp:0, studyT:0, giftT:40, raceT:90, showT:0, evT:20, popT:1,
  yd:0, race:null, freeze:0, incomeT:0, run:0, paused:1
};

/* ---------- الصوت ---------- */
let AC;
ND.snd=(f,d,v)=>{ if(!S.sound)return; try{
  AC=AC||new(window.AudioContext||window.webkitAudioContext)();
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='triangle';o.frequency.value=f;g.gain.value=v||.05;
  g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);
  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);
}catch(e){} };

/* ---------- إشعارات ---------- */
let tt;
ND.toast=t=>{const e=$('toast');if(!e)return;e.textContent=t;e.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>e.style.opacity=0,2600)};

/* ---------- كانفس وقواميس ---------- */
ND.cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
ND.tex=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};

/* ---------- العارض والمشهد ---------- */
const R=ND.R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
R.setScissorTest(true);R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.2;
R.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=ND.scene=new THREE.Scene();scene.fog=new THREE.Fog(0xa88a86,120,470);
scene.add(new THREE.HemisphereLight(0xc4ceff,0x7a6a4a,1));
const sun=ND.sun=new THREE.DirectionalLight(0xffe0b0,.9);sun.position.set(-80,140,60);
scene.add(sun);sun.target=sun.target;scene.add(sun.target);
sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0006;
{const k=sun.shadow.camera;k.left=k.bottom=-70;k.right=k.top=70;k.near=10;k.far=400}

/* توهج الأضواء */
const glowT=ND.glowT=new THREE.CanvasTexture(ND.cv(64,64,(g,w,h)=>{
  const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.35)');
  r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}));
const glM=c=>new THREE.SpriteMaterial({map:glowT,color:c,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true});
ND.GLY=glM(0xffe9a0);ND.GLW=glM(0xffffcc);ND.GLR=glM(0xff3030);

/* النجوم والقمر والسماء */
{const g=new THREE.BufferGeometry(),a=new Float32Array(1500);
 for(let i=0;i<500;i++){const u=rnd(0,2*PI),v=rnd(.15,1.3);a.set([Math.cos(u)*Math.cos(v)*700,Math.sin(v)*700,Math.sin(u)*Math.cos(v)*700],i*3)}
 g.setAttribute('position',new THREE.BufferAttribute(a,3));
 scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false})));
 const mo=new THREE.Sprite(glM(0xfff3c4));mo.scale.set(110,110,1);mo.position.set(-300,380,420);scene.add(mo)}
scene.add(new THREE.Mesh(new THREE.SphereGeometry(800,16,12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ND.cv(16,256,(g,w,h)=>{
  const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'#0b1233');r.addColorStop(.35,'#3b4a86');
  r.addColorStop(.5,'#f0a070');r.addColorStop(1,'#f0a070');g.fillStyle=r;g.fillRect(0,0,w,h)})),side:THREE.BackSide,fog:false})));

/* ---------- أدوات رسم ---------- */
const BG=new THREE.BoxGeometry(1,1,1),mc={},mb={};
ND.M=c=>mc[c]||(mc[c]=new THREE.MeshLambertMaterial({color:c}));
ND.B=c=>mb[c]||(mb[c]=new THREE.MeshBasicMaterial({color:c}));
ND.box=(w,h,d,c,x,y,z,par)=>{
  const m=new THREE.Mesh(BG,typeof c=='number'?ND.M(c):c);
  m.scale.set(w,h,d);m.castShadow=m.receiveShadow=true;m.position.set(x,y,z);
  if(par)par.add(m);else{m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m)}return m};
ND.stat=(m,x,y,z)=>{m.receiveShadow=true;m.castShadow=m.geometry.type!='PlaneGeometry';
  m.position.set(x,y,z);m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);return m};
ND.lab=(t,c,s,dt)=>{
  const k=ND.cv(256,64,(g,w,h)=>{g.font='bold 36px sans-serif';g.textAlign='center';
    g.fillStyle='#0009';g.fillRect(0,8,w,48);g.fillStyle=c;g.fillText(t,w/2,45)});
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),transparent:true,depthTest:!!dt,fog:false}));
  sp.scale.set(s*4,s,1);return sp};

/* ---------- التصادم ---------- */
const CB=ND.CB=[];
ND.col=(x,z,w,d)=>CB.push([x-w/2,x+w/2,z-d/2,z+d/2]);
ND.push=(p,r)=>{let h=0;for(const b of CB){
  const cx=clamp(p.x,b[0],b[1]),cz=clamp(p.z,b[2],b[3]);
  let dx=p.x-cx,dz=p.z-cz,d=dx*dx+dz*dz;
  if(d<r*r){if(d<1e-6){p.x=b[1]+r;h=1;continue}d=Math.sqrt(d);p.x=cx+dx/d*r;p.z=cz+dz/d*r;h=1}}return h};

/* ---------- الشبكة والحدود ---------- */
ND.P=74;ND.N=7;ND.bc=i=>(i-3)*74;
ND.HX=ND.bc(1);ND.HZ=ND.bc(5);
ND.LIM=3.5*74+7;          // 266 : حد الشرق/الجنوب
ND.NZ=-600;               // حد الواجهة الشمالية الجديدة
ND.HCX=ND.HX;ND.HCZ=ND.HZ+10;   // مركز البيت (للدرج والسطح)
ND.inBlk=(v,h)=>Math.abs(v-(Math.round(v/74+3.5)-3.5)*74)>=8+h;
/* تقييد أي نقطة داخل العالم (+ حواجز الحلبة الشمالية إن وُجدت) */
ND.constrain=(p,r)=>{p.x=clamp(p.x,-ND.LIM,ND.LIM);p.z=clamp(p.z,ND.NZ,ND.LIM);if(ND.ringCol)ND.ringCol(p,r||1)};

/* ---------- الطرق (مسجّلة للاستخدام في الخريطة والاختبارات) ---------- */
ND.roads=[];
ND.roadMat=ND.tex(ND.cv(32,128,(g,w,h)=>{
  g.fillStyle='#3a3d44';g.fillRect(0,0,w,h);
  g.fillStyle='#e8e8e8';g.fillRect(0,0,2,h);g.fillRect(w-2,0,2,h);
  g.fillStyle='#f4d03f';g.fillRect(w/2-1,0,2,64)}));
/* ry=0 → طريق يمتد محور z | ry=PI/2 → طريق يمتد محور x */
ND.road=(x,z,L,ry)=>{
  const g=new THREE.PlaneGeometry(14,L),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/20);
  const m=new THREE.Mesh(g,ND.roadMat);m.rotation.set(-PI/2,0,ry||0);
  ND.stat(m,x,.05,z);
  ND.roads.push({x,z,w:ry?L:14,d:ry?14:L});
  return m};
ND.onRoad=(x,z,m)=>{m=(m==null?3:m);for(const r of ND.roads)
  if(Math.abs(x-r.x)<r.w/2+m&&Math.abs(z-r.z)<r.d/2+m)return 1;return 0};
ND.overlap=(a,b,m)=>{m=m||0;return Math.abs(a.x-b.x)<(a.w+b.w)/2+m&&Math.abs(a.z-b.z)<(a.d+b.d)/2+m};

/* ---------- قواميس ---------- */
const flagT=new THREE.CanvasTexture(ND.cv(128,80,(g,w,h)=>{
  g.fillStyle='#006c35';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='bold 15px sans-serif';
  g.textAlign='center';g.fillText('لا إله إلا الله',64,34);g.fillText('محمد رسول الله',64,52);g.fillRect(22,60,84,3)}));
ND.FM=new THREE.MeshBasicMaterial({map:flagT,side:THREE.DoubleSide,fog:false});
ND.GHT=ND.tex(ND.cv(16,16,g=>{g.fillStyle='#fff';g.fillRect(0,0,16,16);g.fillStyle='#d62828';
  for(let i=0;i<16;i+=4)for(let j=0;j<16;j+=4)if((i+j)%8==0)g.fillRect(i,j,4,4)}));
ND.facade=ND.tex(ND.cv(64,64,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#37506b';
  g.fillRect(10,10,18,26);g.fillRect(38,10,18,26);g.fillStyle='#ffe9a0';g.fillRect(12,12,14,10);
  g.fillRect(40,12,14,10);g.fillStyle='#ccc';g.fillRect(0,56,w,8)}));
ND.facadeE=ND.tex(ND.cv(64,64,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);
  g.fillStyle='#ffc866';g.fillRect(12,12,14,10);g.fillRect(40,12,14,10)}));
ND.ROOF=ND.M(0xb8a888);

/* ---------- عناصر عامة ---------- */
ND.pad=(x,z,c)=>ND.box(60,.12,60,c,x,.06,z);
ND.flag=(x,z,h)=>{const hh=h||7;ND.box(.2,hh,.2,0xdddddd,x,hh/2,z);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.3),ND.FM);ND.stat(f,x+1.8,hh-1.3,z);return f};
ND.palmG=[new THREE.CylinderGeometry(.25,.4,6,6),new THREE.ConeGeometry(3,1.3,7)];
ND.palm=(x,z)=>{const a=[
  ND.stat(new THREE.Mesh(ND.palmG[0],ND.M(0x7a5a3a)),x,3,z),
  ND.stat(new THREE.Mesh(ND.palmG[1],ND.M(0x2f8f3e)),x,6.4,z),
  ND.stat(new THREE.Mesh(ND.palmG[1],ND.M(0x3aa24c)),x,7.2,z)];
  a[2].scale.set(.6,.8,.6);a[2].updateMatrix();return a};
ND.lamp=(x,z)=>{ND.box(.25,6,.25,0x444444,x,3,z);
  ND.stat(new THREE.Mesh(new THREE.SphereGeometry(.5,6,5),ND.B(0xfff2a8)),x,6.2,z);
  const gs=new THREE.Sprite(ND.GLY);gs.scale.set(10,10,1);gs.position.set(x,6.2,z);scene.add(gs);return gs};
/* مبنى بواجهة مكرّرة */
const msC={};
ND.bld=(x,z,w,d,h,c,txt)=>{
  const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(w,d)/7,uv.getY(i)*h/6);
  const ms=msC[c]||(msC[c]=new THREE.MeshLambertMaterial({map:ND.facade,color:c,emissive:0xffffff,emissiveMap:ND.facadeE}));
  ND.stat(new THREE.Mesh(g,[ms,ms,ND.ROOF,ND.ROOF,ms,ms]),x,h/2+.1,z);
  ND.col(x,z,w,d);
  ND.box(3,4,.3,0x5a3a22,x,2.1,z-d/2-.1);
  if(txt){const l=ND.lab(txt,'#ffd54a',3,1);l.position.set(x,h+3,z);scene.add(l)}};

/* ---------- محاذاة نقطة داخل العالم ---------- */
ND.constrainPos=p=>ND.constrain(p,1);
})();
