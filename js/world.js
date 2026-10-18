/* =========================================================
   world.js — مدينة عرعر الأساسية: الأرض، شبكة الطرق، الأحياء،
   الحديقة، المدرسة، معرض السيارات، الاستراحة، والبيت وحوشه
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,stat,col,M,B,lab,rnd,PI}=ND;
const P=ND.P,N=ND.N,bc=ND.bc,HX=ND.HX,HZ=ND.HZ;

/* مواقع الوجهات الأساسية */
ND.SP={ park:{x:bc(3),z:bc(3)}, school:{x:bc(1),z:bc(1)-16}, shop:{x:bc(5),z:bc(1)-16},
        rest:{x:bc(5),z:bc(5)}, home:{x:HX,z:HZ-20} };

/* الأرض */
stat(new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),M(0xcfb27d)).rotateX(-PI/2),0,0,0);

/* شبكة الطرق: 8 طرق عمودية + 8 أفقية (سُجلت في ND.roads) */
for(let k=0;k<8;k++){const p=(k-3.5)*P;ND.road(p,0,7*P+14,0);ND.road(0,p,7*P+14,PI/2)}

/* الأحياء السكنية */
const PAL=[0xf3e3c3,0xe8cfa0,0xffffff,0xd9b88f,0xcfe3d4,0xf4d6c6];
const SPEC={'3,3':1,'1,1':1,'5,1':1,'1,5':1,'5,5':1};
for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const x=bc(i),z=bc(j),k=i+','+j;
  ND.flag(x-29,z-29);ND.flag(x+29,z+29);ND.lamp(x+29,z-29);ND.lamp(x-29,z+29);
  if(SPEC[k])continue;
  ND.pad(x,z,0xb9b29c);
  for(const[a,b]of[[-15,-15],[15,-15],[-15,15],[15,15]])
    ND.bld(x+a+rnd(-1,1),z+b,rnd(18,24),rnd(18,24),rnd(7,17),PAL[Math.floor(rnd(0,6))]);
  ND.palm(x,z-1);ND.palm(x,z+3)}

/* ---------- الحديقة العامة ---------- */
{const x=ND.SP.park.x,z=ND.SP.park.z;
 ND.pad(x,z,0x4f9a4a);
 box(18,.2,13,new THREE.MeshLambertMaterial({color:0x3aa0d8,emissive:0x0a3a5a}),x,.2,z);
 for(let i=0;i<14;i++){const a=i/14*PI*2,tx=x+Math.cos(a)*24,tz=z+Math.sin(a)*24;
   box(.5,3,.5,0x6a4a2a,tx,1.6,tz);stat(new THREE.Mesh(new THREE.SphereGeometry(2.4,8,6),M(0x2e8b3e)),tx,4.4,tz)}
 for(const s of[-1,1]){box(.3,5,.3,0x888888,x+s*13,2.5,z+18);box(.3,5,.3,0x888888,x+s*13,2.5,z+22)}
 box(.3,.3,5,0x888888,x-13,5,z+20);box(.3,.3,5,0x888888,x+13,5,z+20);box(26,.3,.3,0x888888,x,5,z+20);
 box(2,.2,1,0xe74c3c,x-6,2,z+20);box(2,.2,1,0x3498db,x+6,2,z+20);
 ND.addParking(x-20,z-26);ND.addParking(x+20,z-26);
 const l=lab('الحديقة 🌳','#9fffb0',3,1);l.position.set(x,9,z);ND.scene.add(l)}

/* ---------- المدرسة ومعرض السيارات ---------- */
{const a=ND.SP.school;ND.pad(bc(1),bc(1),0xcfc8b0);
 ND.bld(a.x,a.z+34,44,14,11,0xe9d8a6,'المدرسة 📚');ND.flag(a.x+18,a.z+22,12);
 const b=ND.SP.shop;ND.pad(bc(5),bc(1),0xaab0b8);
 ND.bld(b.x,b.z+34,44,14,9,0xcfe3f4,'معرض السيارات 🛍');ND.flag(b.x-18,b.z+22,12);
 for(const s of[a,b]){const m=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.15,24),
   new THREE.MeshBasicMaterial({color:0xffd54a,transparent:true,opacity:.5}));
   ND.stat(m,s.x,.2,s.z)}
 ND.addParking(a.x-24,a.z+2);ND.addParking(a.x+24,a.z+2);
 ND.addParking(b.x-24,b.z+2);ND.addParking(b.x+24,b.z+2)}

/* ---------- استراحة الشباب ---------- */
{const x=ND.SP.rest.x,z=ND.SP.rest.z;
 ND.pad(x,z,0xd6c295);
 box(22,.2,16,0x7a1f2b,x,.2,z-6);box(24,.6,18,0xb23a48,x,7,z-6);
 for(const a of[-11,11])for(const b of[-8,8])box(.5,7,.5,0xdddddd,x+a,3.5,z-6+b);
 box(20,.25,10,new THREE.MeshLambertMaterial({color:0x38bdf8,emissive:0x0a4a7a}),x,.25,z+16);
 for(let i=0;i<8;i++)ND.palm(x-26+i*7.4,z+27);
 for(let i=0;i<8;i++)stat(new THREE.Mesh(new THREE.SphereGeometry(.5,6,5),
   B(i%2?0x7CFC00:0xffd54a)),x-24+i*7,8.5,z-14);
 ND.addParking(x-26,z-20);ND.addParking(x+26,z-20);
 const l=lab('استراحة الشباب 🏕','#ffd54a',3,1);l.position.set(x,11,z);ND.scene.add(l)}

/* ---------- بيت فواز وزياد ---------- */
{ND.pad(HX,HZ,0xbcb6a0);
 const cx=HX,cz=HZ+10,w=28,d=20;
 const wl=(x,z,a,b,H)=>{H=H||12;box(a,H,b,0xf3ead7,x,H/2,z);col(x,z,a,b)};
 const sf=(x,z,a,b,c)=>{box(a,1.3,b,c,x,.8,z);col(x,z,a,b)};
 box(w,.3,d,0xc8a56a,cx,.2,cz);
 wl(cx,cz+d/2,w,1);wl(cx-w/2,cz,1,d);wl(cx+w/2,cz,1,d);
 wl(cx-8.5,cz-d/2,11,1,6);wl(cx+8.5,cz-d/2,11,1,6);
 sf(cx+11,cz-5,2.6,8,0x8a2b2b);box(.4,3.5,8,0x111111,cx+13.2,3.4,cz-5);
 box(3,.8,5,0x6b4423,cx+3,.7,cz-4);col(cx+3,cz-4,3,5);
 box(w-1,.4,9,new THREE.MeshLambertMaterial({color:0xd8c9a8,transparent:true,opacity:.5,depthWrite:false}),cx,6.1,cz+5.5);
 for(let k=0;k<10;k++)box(3.5,.6*(k+1),1,0x8a6a4a,cx-11.75,.3*(k+1),cz-8.5+k);
 box(6,1,3.4,0x2c5aa0,cx+8,6.9,cz+6);box(3,5,3,0x7a5a3a,cx-8,8.8,cz+8);
 const l=lab('بيت فواز وزياد 🏠 (دورين)','#ffd54a',3,1);l.position.set(cx,15,cz-d/2);ND.scene.add(l);
 ND.flag(cx+w/2-2,cz+d/2-2,14);
 /* مواقف سيارات البيت (تعود إليها السيارات تلقائيًا) */
 for(let i=0;i<5;i++){box(1.6,.08,7,0x3a3d44,cx-26+i*7,.12,HZ-28);ND.addParking(cx-26+i*7,HZ-28)}
 const pl=lab('🅿️ مواقف البيت','#ffe9a0',1.8,1);pl.position.set(cx-12,5,HZ-28);ND.scene.add(pl)}

/* ---------- تطوير حوش البيت ---------- */
ND.yardBuild=function(){
  while(ST.yd<S.yard){
    ST.yd++;const x=HX,z=HZ;
    if(ST.yd==1){box(58,.14,27,0x4fa34f,x,.14,z-16);for(const a of[-24,24])ND.palm(x+a,z-4)}
    if(ST.yd==2){const a=x-20,b=z-10;box(11,.3,9,0xa61e2b,a,.3,b);box(12,.5,10,0xc0392b,a,5,b);
      for(const i of[-5,5])for(const j of[-4,4])box(.4,5,.4,0xeeeeee,a+i,2.5,b+j)}
    if(ST.yd==3)box(14,.3,9,new THREE.MeshLambertMaterial({color:0x38bdf8,emissive:0x0a4a7a}),x+18,.3,z-10);
    if(ST.yd==4){box(26,.2,8,0x2e9e4d,x,.25,z-25);for(const s of[-13,13])box(.3,3,6,0xffffff,x+s,1.5,z-25)}
    if(ST.yd==5){const m=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,1,16),M(0xcccccc));
      ND.stat(m,x,.6,z-10);
      stat(new THREE.Mesh(new THREE.SphereGeometry(1.2,10,8),
        new THREE.MeshBasicMaterial({color:0x7fe3ff})),x,2.4,z-10);
      for(const a of[-28,28]){ND.flag(x+a,z-4,9);ND.lamp(x+a,z-14)}}
  }
};
})();
