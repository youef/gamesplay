/* =========================================================
   vehicles.js — السيارات: الإنشاء، القيادة، الفيزياء، ذكاء
   اصطناعي وقواعد التفاف عند التقاطعات، وإعادة السيارات للمواقف
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,M,B,rnd,wrap,clamp,PI}=ND;
const P=ND.P;

/* كتالوج السيارات — أسعار مضبوطة على اقتصاد 10 مليون */
const CT=ND.CT=[
 {n:'سيارة عائلية',  c:0xe8e8e8,max:30,acc:16,p:0},
 {n:'جيب',           c:0x2d6a4f,max:36,acc:19,p:250000},
 {n:'سبورت أحمر',    c:0xd62828,max:48,acc:27,p:900000},
 {n:'دفع رباعي فخم', c:0x15151c,max:44,acc:24,p:1800000}];

const cars=ND.cars=[];
const WG=new THREE.CylinderGeometry(.55,.55,.45,12),WM=M(0x151515);
const SH=ND.SH=new THREE.CircleGeometry(1,16);
const blobM=ND.blobM=new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.3,depthWrite:false});

ND.mkCar=(ty,x,z,h,c)=>{
  const T=CT[ty],cc=c||T.c,g=new THREE.Group();
  box(2.4,.9,4.8,cc,0,.95,0,g);
  box(2.1,.85,2.6,0x22313f,0,1.85,-.3,g);
  box(2.15,.12,2.65,cc,0,2.32,-.3,g);
  for(const s of[-.8,.8]){
    box(.5,.3,.1,B(0xffffaa),s,1.05,2.41,g);box(.5,.3,.1,B(0xff2222),s,1.05,-2.41,g);
    const a=new THREE.Sprite(ND.GLW),b=new THREE.Sprite(ND.GLR);
    a.scale.set(3,3,1);b.scale.set(2,2,1);a.position.set(s,1.05,2.6);b.position.set(s,1.05,-2.6);
    g.add(a);g.add(b)}
  for(const sx of[-1.3,1.3])for(const sz of[-1.5,1.5]){
    const w=new THREE.Mesh(WG,WM);w.rotation.z=PI/2;w.position.set(sx,.55,sz);g.add(w)}
  if(ty==2){box(2.3,.1,.7,0x111111,0,2,-2.3,g);box(.15,.5,.15,0x111111,-.8,1.75,-2.3,g);box(.15,.5,.15,0x111111,.8,1.75,-2.3,g)}
  if(ty==3)box(2.5,.4,.3,0x888888,0,.6,2.5,g);
  const s=new THREE.Mesh(SH,blobM);s.rotation.x=-PI/2;s.position.y=.07;s.scale.set(2.8,3.4,1);g.add(s);
  ND.scene.add(g);
  const o={g,x,z,h,vx:0,vz:0,occ:null,max:T.max,acc:T.acc,ty,home:{x,z},ret:null,ai:null,
           frozen:0,race:0,temp:0,parked:1,cy:h};
  g.position.set(x,.1,z);g.rotation.y=h;cars.push(o);return o};

/* ---------- القيادة ---------- */
ND.drive=(c,p,ix,iy,dr,dt)=>{
  let fx=Math.sin(c.h),fz=Math.cos(c.h),vf=c.vx*fx+c.vz*fz;
  c.h-=ix*clamp(Math.abs(vf)/8,0,1)*(vf>=0?1:-1)*(dr?2.5:1.7)*dt;
  fx=Math.sin(c.h);fz=Math.cos(c.h);const rx=-Math.cos(c.h),rz=Math.sin(c.h);
  vf=c.vx*fx+c.vz*fz;let vl=c.vx*rx+c.vz*rz;
  vf+=iy*(iy>0?c.acc:c.acc*1.3)*dt;
  if(Math.abs(iy)<.05)vf*=Math.exp(-1.1*dt);
  vf=clamp(vf,-c.max*.4,c.max);
  vl*=Math.exp(-(dr?.8:8)*dt);if(dr)vf*=Math.exp(-.3*dt);
  c.vx=fx*vf+rx*vl;c.vz=fz*vf+rz*vl;
  const al=Math.abs(vl);
  if(dr&&al>3&&vf>8){const g=al*dt*4;p.ds+=g;ND.spawnSmoke(c.x-fx*1.9+rx*1.1,c.z-fz*1.9+rz*1.1);
    ND.spawnSmoke(c.x-fx*1.9-rx*1.1,c.z-fz*1.9-rz*1.1)}
  else if(p.ds>0&&(!dr||vf<5)){if(p.ds>150){ND.gain(Math.round(p.ds*250*(1+S.study*.1)));ND.toast('🔥 تفحيط '+p.nm+' – أرباح مضاعفة!')}
    p.ds=0}
};

/* ---------- حركة وتصادم ---------- */
ND.moveCar=(c,dt)=>{
  c.x+=c.vx*dt;c.z+=c.vz*dt;
  if(ND.push(c,2.1)){c.vx*=.55;c.vz*=.55}
  ND.constrain(c,2.1);
  c.g.position.set(c.x,.1,c.z);c.g.rotation.y=c.h};

/* ---------- ذكاء اصطناعي: قواعد التفاف عند التقاطعات ---------- */
ND.aiCar=(c,dt)=>{
  const a=c.ai;a.cool-=dt;
  c.h+=wrap(a.th-c.h)*Math.min(1,4*dt);
  const hz=Math.abs(Math.sin(a.th))>.5,al=hz?c.x:c.z,pq=hz?c.z:c.x;
  const rc=(Math.round(pq/P+3.5)-3.5)*P,tq=rc+(hz?Math.sin(a.th):-Math.cos(a.th))*3.6;
  const nq=pq+(tq-pq)*Math.min(1,2*dt);
  if(hz)c.z=nq;else c.x=nq;
  const rl=(Math.round(al/P+3.5)-3.5)*P,fx=Math.sin(c.h),fz=Math.cos(c.h);
  /* قرار الالتفاف عند التقاطع: استقامة 55%، يمين 25%، يسار 20% (ممنوع الرجوع للخلف) */
  if(a.cool<=0&&Math.abs(al-rl)<1.2){
    a.cool=3;const r=Math.random();
    if(r<.55){/* استقامة */}
    else if(r<.8)a.th+=PI/2;
    else a.th-=PI/2}
  if(a.cool<=0&&Math.abs(al)>ND.LIM-12&&al*(hz?fx:fz)>0){a.th+=PI;a.cool=3}
  if(a.cool<=0&&al<ND.NZ+14&&al*(hz?fx:fz)<0){a.th+=PI;a.cool=3}
  let v=a.v;
  for(const o of cars) if(o!==c&&(o.ai||o.occ)){
    const dx=o.x-c.x,dz=o.z-c.z,f=dx*fx+dz*fz;
    if(f>0&&f<10&&Math.abs(dx*fz-dz*fx)<3){v=0;break}                    // سيارة أمامك
    if(f>2&&f<22&&Math.abs(dx*fz-dz*fx)<7&&(o.vx*o.vx+o.vz*o.vz)>4) v=Math.min(v,7); // أعطِ أسبقية من في التقاطع
  }
  c.vx=fx*v;c.vz=fz*v};

/* ---------- العودة التلقائية إلى الموقف ---------- */
ND.retCar=(c,dt)=>{
  const t=c.ret;if(!t){c.ret=null;return}
  const dx=t.x-c.x,dz=t.z-c.z,d=Math.hypot(dx,dz);
  if(d<1.6){c.ret=null;c.vx=c.vz=0;c.parked=1;return}
  const th=Math.atan2(dx,dz);
  c.h+=wrap(th-c.h)*Math.min(1,3.2*dt);
  const fx=Math.sin(c.h),fz=Math.cos(c.h);
  let v=Math.min(13,d*1.1);if(d<9)v=Math.min(v,4.5);
  for(const o of cars)if(o!==c){const ox=o.x-c.x,oz=o.z-c.z,f=ox*fx+oz*fz;
    if(f>0&&f<9&&Math.abs(ox*fz-oz*fx)<3){v=0;break}}
  for(const p of ND.PL){const ox=p.x-c.x,oz=p.z-c.z,f=ox*fx+oz*fz;
    if(f>0&&f<8&&Math.abs(ox*fz-oz*fx)<2.5){v=0;break}}
  c.vx=fx*v;c.vz=fz*v};

/* مواقف السيارات المسجّلة (للعودة التلقائية) */
ND.parking=[];
ND.addParking=(x,z)=>ND.parking.push({x,z});
/* أقرب موقف لسيارة */
ND.nearParking=(x,z,r)=>{let b=null,bd=(r||30)**2;
  for(const s of ND.parking){const d=(s.x-x)**2+(s.z-z)**2;if(d<bd){bd=d;b=s}}return b};
})();
