/* =========================================================
   buildings.js — قائمة البناء: المباني، أسعارها، إنشاؤها
   وهدمها (مع تفاصيل حسب موقع البناء)
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,box,lab}=ND;

/* كتالوج المباني — أسعار مضبوطة على اقتصاد 10 مليون */
const BT=ND.BT=[
 {n:'فيلا 🏡',      w:22,d:20,h:9, p:150000,c:0xf3e3c3},
 {n:'عمارة 🏢',     w:20,d:20,h:20,p:400000,c:0xd9b88f},
 {n:'محل 🏪',       w:16,d:12,h:6, p:120000,c:0xcfe3f4},
 {n:'استراحة 🏕',   w:22,d:16,h:5, p:250000,c:0xe8cfa0},
 {n:'برج 🗼',       w:16,d:16,h:42,p:900000,c:0xcfd8e3}];
const BR=ND.BR=[];

ND.canB=(b,x,z)=>{
  if(!ND.inBlk(x,b.w/2)||!ND.inBlk(z,b.d/2))return 0;
  for(const c of ND.CB)if(x+b.w/2+1>c[0]&&x-b.w/2-1<c[1]&&z+b.d/2+1>c[2]&&z-b.d/2-1<c[3])return 0;
  return 1};

ND.mkB=(i,x,z)=>{
  const b=BT[i],n0=ND.scene.children.length,c0=ND.CB.length;
  ND.bld(x,z,b.w,b.d,b.h,b.c,b.n);
  ND.flag(x+b.w/2-1,z+b.d/2-1,b.h+4);
  BR.push({o:ND.scene.children.slice(n0),c:c0})};

/* حساب موضع البناء أمام اللاعب (محاذاة الشبكة) */
ND.buildSpot=(i,pi)=>{
  const b=BT[i],p=ND.PL[pi||0],o=Math.max(b.w,b.d)/2+6;
  return {x:Math.round((p.x+Math.sin(p.cy)*o)/2)*2, z:Math.round((p.z+Math.cos(p.cy)*o)/2)*2}};

ND.buildAdd=function(i,pi){
  const b=BT[i],s=ND.buildSpot(i,pi);
  if(!ND.canB(b,s.x,s.z))return '🚫 المكان غير مناسب: لازم داخل الحارة وفاضي';
  const who=ND.pay(b.p);if(who<0)return '💸 الرصيد ما يكفي ('+ND.fmt(b.p)+')';
  ND.mkB(i,s.x,s.z);
  S.builds.push([i,s.x,s.z]);ND.save();
  return '🏗 تم بناء '+b.n+' — يعطي إيجارًا لحظيًا للمحفظتين!'};

ND.buildDel=function(){
  if(!S.builds.length)return '🚫 لا توجد مبانٍ لهدمها';
  const q=S.builds.pop(),r=BR.pop();
  r.o.forEach(o=>ND.scene.remove(o));
  ND.CB[r.c]=[1e9,1e9,1e9,1e9];
  ND.gain(Math.round(BT[q[0]].p*.5));
  ND.save();
  return '🗑 تم هدم '+BT[q[0]].n+' (استرجاع 50%)'};

ND.buildsInit=()=>S.builds.forEach(b=>ND.mkB(b[0],b[1],b[2]));
ND.rentPerSec=()=>{let r=0;for(const b of S.builds)r+=BT[b[0]].p*.0005;return r};
})();
