/* =========================================================
   decor.js — كتالوج عناصر الديكور + آلية الوضع والإزالة
   (مواقف السيارات، النخلة، المسبح، النافورة، السور، الأرجوحة،
    المرمى، شجرة، إنارة، بوابة المدخل...)
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,box,stat,col,M,B,lab,rnd,PI}=ND;

const decR=ND.decR=[];      // الديكور الموضوع (لإزالته لاحقًا)

/* ---------- الكتالوج ---------- */
const DEC=ND.DEC=[
 {id:'park',n:'🅿 موقف سيارات',p:30000,w:16,d:26,b:(x,z,o)=>{
    o.push(box(15,.1,25,0x3a3d44,x,.09,z));
    for(let i=-2;i<=2;i++)o.push(box(12,.12,.5,0xf2f2f2,x,.15,z+i*4.6));
    o.push(box(.3,4,.3,0x555555,x+7.5,2,z-12));
    const l=lab('🅿️ الموقف','#ffe9a0',1.6,1);l.position.set(x+7.5,4.6,z-12);ND.scene.add(l);o.push(l);
    ND.addParking(x,z)}},
 {id:'palm',n:'🌴 نخلة',p:8000,w:6,d:6,b:(x,z,o)=>{o.push(...ND.palm(x,z))}},
 {id:'tree',n:'🌳 شجرة',p:6000,w:6,d:6,b:(x,z,o)=>{
    o.push(box(.6,4,.6,0x6a4a2a,x,2,z));
    o.push(stat(new THREE.Mesh(new THREE.SphereGeometry(2.6,8,6),M(0x2e8b3e)),x,5,z))}},
 {id:'pool',n:'🏊 مسبح',p:90000,w:22,d:14,b:(x,z,o)=>{
    o.push(box(22,.4,14,0xdcd6c4,x,.22,z));
    o.push(box(19,.25,11,new THREE.MeshLambertMaterial({color:0x38bdf8,emissive:0x0a4a7a}),x,.42,z))}},
 {id:'fountain',n:'⛲ نافورة',p:60000,w:10,d:10,b:(x,z,o)=>{
    const m=new THREE.Mesh(new THREE.CylinderGeometry(4,4.4,1,18),M(0xcccccc));m.position.set(x,.6,z);stat(m);
    o.push(m);
    const w=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.6,.2,18),
      new THREE.MeshBasicMaterial({color:0x7fe3ff}));w.position.set(x,1.15,z);stat(w);o.push(w);
    o.push(box(.6,3,.6,0xdddddd,x,2.4,z));
    const s=new THREE.Sprite(ND.GLY);s.scale.set(7,7,1);s.position.set(x,4.4,z);ND.scene.add(s);o.push(s)}},
 {id:'wall',n:'🧱 سور',p:15000,w:24,d:2,b:(x,z,o)=>{
    o.push(box(24,3,1,0xe8e0d0,x,1.6,z));
    for(const s of[-11,11])o.push(box(1.6,4,1.6,0xd8cebb,x+s,2,z))}},
 {id:'swing',n:'🪢 أرجوحة',p:40000,w:12,d:8,b:(x,z,o)=>{
    for(const s of[-5,5]){o.push(box(.4,5,.4,0x888888,x+s,2.5,z-3));o.push(box(.4,5,.4,0x888888,x+s,2.5,z+3))}
    o.push(box(.4,.4,7,0x888888,x-5,5,z));o.push(box(.4,.4,7,0x888888,x+5,5,z));
    o.push(box(11,.4,.4,0x888888,x,5,z));
    for(const s of[-2,2]){o.push(box(.2,3.4,.2,0xdddddd,x+s,3.3,z));o.push(box(1.6,.3,1,0x2c5aa0,x,s?1.6:1.6,z))}}},
 {id:'goal',n:'🥅 مرمى كرة',p:35000,w:14,d:4,b:(x,z,o)=>{
    for(const s of[-6.5,6.5])o.push(box(.5,4,.5,0xffffff,x+s,2,z));
    o.push(box(13.5,.5,.5,0xffffff,x,4,z));
    for(let i=-6;i<=6;i+=1.5)o.push(box(.12,3.6,.12,0xffffff,x+i,1.9,z-.4))}},
 {id:'lamp',n:'💡 عمود إنارة',p:12000,w:4,d:4,b:(x,z,o)=>{o.push(ND.lamp(x,z))}},
 {id:'bench',n:'🪑 مقعد',p:10000,w:6,d:4,b:(x,z,o)=>{
    o.push(box(4,.4,1.4,0x8a6a4a,x,.9,z));o.push(box(4,.9,.3,0x8a6a4a,x,1.5,z-.6));
    for(const s of[-1.6,1.6])o.push(box(.3,.9,.3,0x555555,x+s,.45,z))}},
 {id:'gate',n:'🚪 بوابة مدخل',p:120000,w:26,d:4,b:(x,z,o)=>{
    for(const s of[-11,11]){o.push(box(3,9,3,0xe8e0d0,x+s,4.5,z));
      const l=lab(s<0?'فواز':'زياد',s<0?'#ffb34a':'#5eead4',2,1);l.position.set(x+s,11,z);ND.scene.add(l);o.push(l)}
    o.push(box(25,2,2,0xd8cebb,x,10,z));
    o.push(box(25,.6,2.4,0x006c35,x,11.4,z))}}
];
ND.decorById=id=>DEC.find(d=>d.id===id);

/* ---------- الوضع والإزالة ---------- */
function reg(o,i,x,z,w,d){
  const ci=ND.CB.length;if(w)ND.col(x,z,w,d);
  const rec={o,i,x,z,ow:w,od:d,ci};decR.push(rec);return rec}

ND.placeDecor=function(i,pi){
  const d=DEC[i],p=ND.PL[pi||0];
  const o=Math.max(d.w,d.d)/2+5;
  const x=Math.round((p.x+Math.sin(p.cy)*o)/2)*2, z=Math.round((p.z+Math.cos(p.cy)*o)/2)*2;
  if(ND.onRoad(x,z,3))return '🚫 المكان لازم داخل الحي مو على الشارع';
  if(!ND.inBlk(x,d.w/2)||!ND.inBlk(z,d.d/2))return '🚫 ابتعد عن خط الشارع';
  for(const c of ND.CB)if(x+d.w/2+1>c[0]&&x-d.w/2-1<c[1]&&z+d.d/2+1>c[2]&&z-d.d/2-1<c[3])
    return '🚫 المكان مشغول';
  const who=ND.pay(d.p);if(who<0)return '💸 الرصيد ما يكفي';
  /* إزالة أي ديقور متداخل مع استرجاع نصف قيمته */
  for(let k=decR.length-1;k>=0;k--){const q=decR[k];
    if(Math.abs(q.x-x)<(d.w+q.ow)/2&&Math.abs(q.z-z)<(d.d+q.od)/2){
      ND.gainTo(who,DEC[q.i].p*.5);ND.removeDecorAt(k)}}
  const meshes=[];d.b(x,z,meshes);
  reg(meshes,i,x,z,d.w,d.d);
  S.decor.push([i,x,z]);ND.save();
  ND.snd(520,.2);return '✅ تم وضع '+d.n};

ND.removeDecorAt=function(k){
  const q=decR[k];if(!q)return;
  q.o.forEach(m=>{ND.scene.remove(m)});
  ND.CB[q.ci]=[1e9,1e9,1e9,1e9];
  decR.splice(k,1);
  const si=S.decor.findIndex(d=>d[1]===q.x&&d[2]===q.z);
  if(si>=0)S.decor.splice(si,1);
  ND.save()};

ND.removeLastDecor=function(){
  if(!decR.length)return '🚫 لا يوجد ديكور لإزالته';
  const q=decR[decR.length-1],d=DEC[q.i];
  if(q.id==='gate'){} /* البوابة كأي عنصر */
  ND.gain(d.p*.3);
  ND.removeDecorAt(decR.length-1);
  return '🗑 تمت إزالة '+d.n+' (+30%)'};

/* إزالة الديكور القريب عند الحاجة (مثلاً عند ركن سيارة في مكان ضيق) */
ND.clearNearDecor=function(x,z,r){
  let n=0;
  for(let k=decR.length-1;k>=0;k--){const q=decR[k];
    if((q.x-x)**2+(q.z-z)**2<(r||8)**2){ND.gain(DEC[q.i].p*.3);ND.removeDecorAt(k);n++}}
  return n};

/* استعادة الديكور المحفوظ */
ND.decorInit=function(){
  for(const d of S.decor){
    const def=DEC[d[0]];if(!def)continue;
    const meshes=[];def.b(d[1],d[2],meshes);
    reg(meshes,d[0],d[1],d[2],def.w,def.d)}
};
})();
