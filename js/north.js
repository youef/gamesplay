/* =========================================================
   north.js — الواجهة الشمالية الجديدة:
   ✈ مطار عرعر (مدرج، صالة، برج مراقبة، حظيرة، طائرة تقلع وتهبط)
   🏁 حديقة شمالية ومسار سباق دائري حولها مع بوابة خط النهاية
   🛣 شبكة طرق الحي + ساحات ومواقف
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,stat,col,M,B,lab,rnd,PI,wrap}=ND;

/* ---------- الحلبة الدائرية حول الحديقة ---------- */
const CX=150, CZ=-455, R=100;      // مركز/نصف قطر مسار السباق
const CC={x:-150,z:-452};           // مركز دورة الطائرة ومركز المطار
ND.RACE={CX,CZ,R};

function decal(w,h,d,x,y,z,ry,c){const m=box(w,h,d,c,x,y,z);m.rotation.y=ry;m.updateMatrix();return m}

/* ---------- طرق الحي الشمالي ---------- */
for(const x of[-259,-185,-111,-37,37,111,185,259]) ND.road(x,-292,60,0); // وصلات من المدينة
ND.road(0,-322,532,PI/2);                    // الشارع الرئيسي الشمالي
ND.road(-140,-336,40,0);                     // مدخل المطار
ND.road(150,-336,44,0);                      // مدخل الحديقة والحلبة
/* الطريق الدائري حول المطار */
ND.road(-150,-350,230,PI/2);
ND.road(-150,-555,230,PI/2);
ND.road(-265,-452,205,0);
ND.road(-35,-452,205,0);

/* ---------- المطار ---------- */
/* ساحة المطار */
stat(new THREE.Mesh(new THREE.PlaneGeometry(216,188),M(0x8f8f8f)).rotateX(-PI/2),-150,.1,-452);
/* المدرج */
stat(new THREE.Mesh(new THREE.PlaneGeometry(200,30),M(0x35383f)).rotateX(-PI/2),-150,.14,-452);
for(let x=-244;x<-56;x+=14) decal(6,.1,1.1,x,.17,-452,0,0xf2f2f2);      // خط المدرج
for(const z of[-466,-438]){                                             // أضواء المدرج
  for(let x=-248;x<-52;x+=16){stat(new THREE.Mesh(new THREE.SphereGeometry(.45,6,5),B(0xfff2a8)),x,.4,z);
    const gl=new THREE.Sprite(ND.GLY);gl.scale.set(6,6,1);gl.position.set(x,.9,z);ND.scene.add(gl)}}
/* الصالة والبرج والحظيرة */
ND.bld(-150,-380,64,22,11,0xe6dcc6,'مطار عرعر ✈️');
ND.col(-150,-400,64,10);
{const x=-80,z=-388;
 box(12,1,12,0xd8d0c0,x,.5,z);
 box(9,26,9,0xbfc6cf,x,13,z);col(x,z,9,9);
 box(14,4.5,14,0x2c3e50,x,27.5,z);col(x,z,14,14);
 box(14,.6,14,0xf0f0f0,x,30.1,z);
 box(.6,5,.6,0xcc3333,x,33,z);
 const gl=new THREE.Sprite(ND.GLR);gl.scale.set(8,8,1);gl.position.set(x,36,z);ND.scene.add(gl);
 const l=lab('🗼 برج المراقبة','#9fd8ff',2.4,1);l.position.set(x,40,z);ND.scene.add(l)}
{const x=-220,z=-398;
 box(34,13,26,0xb9b2a2,x,6.5,z);col(x,z,34,26);
 box(36,2,28,0x8f8878,x,14,z);
 box(30,8,.6,0x5a5a5a,x,4.2,z-13.2);
 const l=lab('🛠 الحظيرة','#d8d0c0',2,1);l.position.set(x,19,z);ND.scene.add(l)}
/* لوحة المطار ومواقف */
{const l=lab('الحي الشمالي – مطار عرعر 🛫','#ffd54a',4,1);l.position.set(-150,46,-360);ND.scene.add(l)}
for(let i=0;i<8;i++){const x=-226+i*16;box(1.6,.08,7,0x3a3d44,x,.16,-338);ND.addParking(x,-338)}

/* ---------- الطائرة ---------- */
function mkPlane(){
  const g=new THREE.Group();
  box(3,3,26,0xf4f4f4,0,3.6,0,g);
  box(2.6,2.2,5,0x9fd8ff,0,4.6,10.5,g);
  box(34,.7,5.4,0xe6e6e6,0,3.9,-1,g);
  box(10,.5,3,0xe6e6e6,0,6.4,-11,g);
  box(1.4,4.6,.6,0xd05a3a,0,7.6,-11.4,g);
  for(const s of[-1,1]){
    box(2.6,2.4,4.6,0xdddddd,s*9,2.7,-1,g);
    const gl=new THREE.Sprite(ND.GLY);gl.scale.set(3,3,1);gl.position.set(s*9,2.7,-3.5);g.add(gl);
    const wl=new THREE.Sprite(ND.GLR);wl.scale.set(2.5,2.5,1);wl.position.set(s*17,3.9,-1);g.add(wl)}
  for(let i=-9;i<=9;i+=2){box(.16,.5,.7,0x22313f,1.53,4.4,i,g);box(.16,.5,.7,0x22313f,-1.53,4.4,i,g)}
  const s=new THREE.Mesh(ND.SH,ND.blobM);s.rotation.x=-PI/2;s.position.y=.14;s.scale.set(18,15,1);g.add(s);
  ND.scene.add(g);return g}
const plane=ND.plane={g:mkPlane(),x:CC.x-100,y:0,z:CC.z,h:PI/2,phase:'roll',t:0,v:0,a:0,pitch:0,bank:0};
ND.updPlane=function(dt){
  const p=plane;p.t+=dt;
  if(p.phase==='roll'){                                  // تسارع على المدرج للإقلاع
    p.v=Math.min(92,p.v+24*dt);p.x+=Math.sin(p.h)*p.v*dt;
    p.pitch=Math.min(.06,p.v/1400);p.bank=0;
    if(p.x>-52){p.phase='climb';p.t=0}}
  else if(p.phase==='climb'){                            // ارتفاع مع ميلان للسماء
    p.y+=26*dt;p.x+=Math.sin(p.h)*86*dt;p.pitch=.36;p.bank=.1;
    if(p.y>72){p.phase='cruise';p.t=0;p.a=Math.atan2(p.z-CC.z,p.x-CC.x)}}
  else if(p.phase==='cruise'){                           // دورة في السماء بميلان جانبي
    const r=Math.max(140,Math.hypot(p.x-CC.x,p.z-CC.z));
    p.a+=(86/r)*dt;
    p.x=CC.x+Math.cos(p.a)*r;p.z=CC.z+Math.sin(p.a)*r;
    p.h=-p.a;p.y=72+Math.sin(p.t*.4)*7;p.pitch=.05;p.bank=.45;
    if(p.t>26){p.phase='approach';p.t=0}}
  else if(p.phase==='approach'){                         // اقتراب ثم هبوط على المدرج
    const tx=74,tz=CC.z,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);
    p.h+=wrap(Math.atan2(dx,dz)-p.h)*Math.min(1,1.4*dt);
    p.x+=Math.sin(p.h)*74*dt;p.z+=Math.cos(p.h)*74*dt;
    p.y=Math.max(0,p.y-22*dt);p.pitch=p.y>1?-.16:0;p.bank=.08;
    if(p.y<=.2&&d<46){p.y=0;p.h=-Math.PI/2;p.phase='landroll';p.v=80;p.t=0}}
  else if(p.phase==='landroll'){                         // تباطؤ على المدرج
    p.h=-Math.PI/2;p.v=Math.max(0,p.v-26*dt);p.x+=Math.sin(p.h)*p.v*dt;
    p.pitch=0;p.bank=0;
    if(p.v<4){p.phase='wait';p.t=0}}
  else if(p.t>7){                                        // انتظار ثم إقلاع جديد
    p.x=CC.x-100;p.y=0;p.z=CC.z;p.h=Math.PI/2;p.v=0;p.phase='roll';p.t=0}
  p.g.position.set(p.x,p.y,p.z);
  p.g.rotation.order='YXZ';
  p.g.rotation.set(-p.pitch,p.h,p.bank);
};

/* ---------- الحديقة الشمالية والمسار الدائري ---------- */
stat(new THREE.Mesh(new THREE.CircleGeometry(112,48),M(0x4f9a4a)).rotateX(-PI/2),CX,.11,CZ);
{const as=new THREE.Mesh(new THREE.RingGeometry(R-8.5,R+8.5,72),M(0x3a3d44));
 as.rotation.x=-PI/2;ND.stat(as,CX,.13,CZ);
 /* خط الوسط المتقطع + أسهم اتجاه السباق */
 for(let i=0;i<36;i++){
   const a=i/36*2*PI,x=CX+Math.cos(a)*R,z=CZ+Math.sin(a)*R;
   if(i%2===0)decal(1.2,.1,4,x,.16,z,-a,0xf4d03f);
   if(i%3===0){decal(2.6,.1,1.2,CX+Math.cos(a+.13)*(R-5),.17,CZ+Math.sin(a+.13)*(R-5),-a,0x66ff99);
     decal(2.6,.1,1.2,CX+Math.cos(a+.13)*(R+5),.17,CZ+Math.sin(a+.13)*(R+5),-a,0x66ff99)}}
 /* أشجار ونخل ونوافير داخل الحديقة */
 for(let i=0;i<22;i++){const a=rnd(0,2*PI),r2=rnd(18,80);
   const x=CX+Math.cos(a)*r2,z=CZ+Math.sin(a)*r2;
   if(i%3===0)ND.palm(x,z);else stat(new THREE.Mesh(new THREE.SphereGeometry(rnd(2,3.2),8,6),M(0x2e8b3e)),x,rnd(3.5,5),z),
     box(.6,3,.6,0x6a4a2a,x,1.5,z)}
 {const x=CX,z=CZ;
  const m=new THREE.Mesh(new THREE.CylinderGeometry(7,7.6,1.2,20),M(0xcccccc));ND.stat(m,x,.7,z);
  const w=new THREE.Mesh(new THREE.CylinderGeometry(6.4,6.4,.3,20),new THREE.MeshBasicMaterial({color:0x7fe3ff}));
  ND.stat(w,x,1.35,z);
  box(1,4,1,0xdddddd,x,3,z);
  const s=new THREE.Sprite(ND.GLY);s.scale.set(9,9,1);s.position.set(x,5.5,z);ND.scene.add(s)}
 /* بوابة خط البداية/النهاية فوق الحلبة (باتجاه المدينة) */
 {const x=CX,z=CZ+R;
  box(2,10,2,0xe8e0d0,x,5,z-12);box(2,10,2,0xe8e0d0,x,5,z+12);
  box(2,1.6,26,0x006c35,x,10.5,z);box(2.6,.8,26,0xffd54a,x,11.6,z);
  for(let i=-2;i<=2;i++)decal(2.8,.1,2.6,x,.18,z+i*5,0,i%2?0xffffff:0x111111);
  const l=lab('🏁 سباق التحدي','#ffd54a',3,1);l.position.set(x,15,z);ND.scene.add(l)}
 const gl=lab('الحديقة الشمالية 🌴','#9fffb0',3.5,1);gl.position.set(CX,14,CZ-40);ND.scene.add(gl)}
/* مواقف سيارات عند مدخل الحديقة (غربًا عن الحلبة) */
for(let i=0;i<6;i++){const px=40+i*8;
  box(1.6,.08,7,0x3a3d44,px,.16,-338);ND.addParking(px,-338)}

/* ---------- حواجز الحلبة (يبقى السيارات على المسار) ---------- */
ND.ringCol=function(p,r){
  const dx=p.x-CX,dz=p.z-CZ,d=Math.hypot(dx,dz);
  if(d>134)return 0;
  if(d<1.2){p.x=CX;p.z=CZ+R;return 1}   // نقطة عند المركز: تُدفع إلى الحلبة
  const a=Math.atan2(dz,dx);
  if(Math.abs(wrap(a-PI/2))<.3)return 0;              // فتحة المدخل
  if(d<R-9+r){const k=(R-9+r)/d;p.x=CX+dx*k;p.z=CZ+dz*k;return 1}
  if(d>R+9-r){const k=(R+9-r)/d;p.x=CX+dx*k;p.z=CZ+dz*k;return 1}
  return 0};
})();
