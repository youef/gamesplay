/* =========================================================
   properties.js — العقارات في الواجهة الشمالية:
   شراء القطع، وتطويرها بمستويات (محطات وقود بمضخات تتزايد،
   فنادق، مطاعم، أبراج، مستودعات، ملاعب) وبيعها،
   ودخل تلقائي يُودَع في محفظة المالك
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,box,stat,col,M,B,lab,PI}=ND;

/* القطع: الموقع والسعر ودخلها لكل مستوى */
const PLOTS=ND.PLOTS=[
 {n:'مستودع الشمال', kind:'wh',    p:180000, inc:70,  w:30,d:26,x:-222,z:-288},
 {n:'محل تجاري',     kind:'shop',  p:240000, inc:100, w:26,d:24,x:-148,z:-288},
 {n:'مطعم عرعر',     kind:'rest',  p:320000, inc:130, w:28,d:24,x:-74, z:-288},
 {n:'محطة وقود ١',   kind:'fuel',  p:400000, inc:160, w:32,d:26,x:0,   z:-288},
 {n:'فندق الشمال',   kind:'hotel', p:750000, inc:260, w:30,d:26,x:74,  z:-288},
 {n:'برج المكاتب',   kind:'office',p:900000, inc:300, w:26,d:26,x:148, z:-288},
 {n:'ملعب الحي',     kind:'sport', p:200000, inc:80,  w:32,d:26,x:222, z:-288},
 {n:'مستودع ٢',      kind:'wh',    p:180000, inc:70,  w:30,d:26,x:-185,z:-380},
 {n:'محطة وقود ٢',   kind:'fuel',  p:400000, inc:160, w:32,d:26,x:-111,z:-380},
 {n:'مطعم الحديقة',  kind:'rest',  p:320000, inc:130, w:28,d:24,x:-74, z:-380},
 {n:'مقهى الحي',     kind:'shop',  p:240000, inc:100, w:26,d:24,x:20,  z:-380}];

const vis=[],cslo=[];
ND.plotState=i=>{if(!S.plot[i])S.plot[i]={lv:0,owner:-1};return S.plot[i]};
ND.plotDevCost=i=>Math.round(PLOTS[i].p*(.6+.6*ND.plotState(i).lv));
ND.plotValue=i=>{const pl=PLOTS[i],st=ND.plotState(i);return Math.round(pl.p*(1+st.lv*.7))};

/* ---------- بناء بصر القطعة حسب النوع والمستوى ---------- */
function drawPlot(i){
  const pl=PLOTS[i],st=ND.plotState(i),x=pl.x,z=pl.z,o=[];
  if(vis[i]){vis[i].forEach(m=>ND.scene.remove(m));vis[i]=null}
  const set=(w,d)=>ND.CB[cslo[i]]=w?[x-w/2,x+w/2,z-d/2,z+d/2]:[-1e9,-1e9,-1e9,-1e9];
  /* أرضية القطعة دائمًا */
  o.push(box(pl.w,.12,pl.d,st.owner<0?0xbdb49c:(st.owner?0xb6c9cf:0xd2c6b2),x,.12,z));
  for(const sx of[-1,1])for(const sz of[-1,1])
    o.push(box(1.4,1.2,1.4,0xe8e0d0,x+sx*(pl.w/2-1),.7,z+sz*(pl.d/2-1)));
  const lv=st.lv;
  set(0);
  if(lv>=1){
    if(pl.kind==='fuel'){
      /* محطة وقود: مظلة + مضخات (2 + المستوى) + كشك + لوحة */
      const np=2+lv;
      o.push(box(24,1,14,0xf0f0f0,x,7,z));
      for(const sx of[-11,11])for(const sz of[-6,6])o.push(box(.8,7,.8,0xdddddd,x+sx,3.5,z+sz));
      for(let k=0;k<np;k++){const px=x-9+ (k%2?18:0), pz=z-4+Math.floor(k/2)*3.2;
        o.push(box(1.2,2,1,0xe74c3c,px,1.1,pz));
        o.push(box(1.3,.4,1.1,0x111111,px,2.3,pz))}
      o.push(box(12,5,10,0xe8e0d0,x,2.6,z+10));
      o.push(box(3,3.5,.3,0x5a3a22,x,1.9,z+5.1));
      o.push(box(1.2,14,1.2,0xcccccc,x+14,7,z-10));
      const l=lab('⛽ '+pl.n,'#ffd54a',2.4,1);l.position.set(x+14,15,z-10);ND.scene.add(l);o.push(l);
      set(24,22);
    }else if(pl.kind==='hotel'){
      const h=6+lv*5;
      o.push(box(pl.w,h,pl.d,0xdfe6ee,x,h/2+.1,z));
      for(let k=1;k<=lv+1;k++)o.push(box(pl.w+.4,.4,pl.d+.4,0xb8c4d0,x,k*4,z));
      o.push(box(14,3,6,0x2c3e50,x,2,z+pl.d/2+2.5));
      o.push(box(3,4,.3,0x5a3a22,x,2.1,z+pl.d/2));
      o.push(box(1.2,6,1.2,0xdddddd,x-pl.w/2+2,3,z+pl.d/2+2));
      if(lv>=2)o.push(box(12,.3,7,new THREE.MeshLambertMaterial({color:0x38bdf8,emissive:0x0a4a7a}),x+pl.w/2-8,.3,z+pl.d/2+6));
      const l=lab('🏨 '+pl.n+' ⭐'+lv,'#9fd8ff',2.6,1);l.position.set(x,h+4,z);ND.scene.add(l);o.push(l);
      set(pl.w,pl.d);
    }else if(pl.kind==='rest'){
      const h=4+lv*1.6;
      o.push(box(pl.w,h,pl.d,0xe8cfa0,x,h/2+.1,z));
      o.push(box(pl.w+.6,.5,pl.d+.6,0xc0392b,x,h+.3,z));
      for(let k=-1;k<=1;k++)o.push(box(6,.4,4,k%2?0xffffff:0xc0392b,x+k*9,h-.9,z+pl.d/2+2));
      for(let k=-1;k<=1;k++){o.push(box(1.6,.15,1.6,0xf5f5f5,x+k*9,.9,z+pl.d/2+6));
        o.push(box(.3,.9,.3,0x888888,x+k*9,.45,z+pl.d/2+6))}
      const l=lab('🍽 '+pl.n+' ⭐'+lv,'#ffd54a',2.4,1);l.position.set(x,h+4,z);ND.scene.add(l);o.push(l);
      set(pl.w,pl.d);
    }else if(pl.kind==='shop'){
      const h=4+lv*1.6;
      o.push(box(pl.w,h,pl.d,0xcfe3f4,x,h/2+.1,z));
      o.push(box(pl.w-3,2.4,.3,0x22313f,x,1.6,z+pl.d/2+.1));
      o.push(box(pl.w+1,.6,2,0xffd54a,x,h+.4,z+pl.d/2));
      const l=lab('🏪 '+pl.n+' ⭐'+lv,'#9fffb0',2.2,1);l.position.set(x,h+3.5,z);ND.scene.add(l);o.push(l);
      set(pl.w,pl.d);
    }else if(pl.kind==='wh'){
      const h=5+lv*1.8;
      o.push(box(pl.w,h,pl.d,0xb9b2a2,x,h/2+.1,z));
      o.push(box(pl.w+.8,1,pl.d+.8,0x8f8878,x,h+.4,z));
      o.push(box(10,4,.4,0x5a5a5a,x,2.1,z+pl.d/2+.2));
      const l=lab('📦 '+pl.n+' ⭐'+lv,'#d8d0c0',2.2,1);l.position.set(x,h+3.5,z);ND.scene.add(l);o.push(l);
      set(pl.w,pl.d);
    }else if(pl.kind==='office'){
      const h=16+lv*10;
      o.push(box(pl.w,h,pl.d,0xcfd8e3,x,h/2+.1,z));
      for(let k=1;k*4<h;k++)o.push(box(pl.w+.4,.3,pl.d+.4,0x9fb0c0,x,k*4,z));
      o.push(box(1,6,1,0xcc3333,x,h+3,z));
      const gl=new THREE.Sprite(ND.GLR);gl.scale.set(7,7,1);gl.position.set(x,h+6.5,z);ND.scene.add(gl);o.push(gl);
      const l=lab('🏢 '+pl.n+' ⭐'+lv,'#9fd8ff',2.6,1);l.position.set(x,h+9,z);ND.scene.add(l);o.push(l);
      set(pl.w,pl.d);
    }else if(pl.kind==='sport'){
      o.push(box(pl.w,.2,pl.d,0x2e9e4d,x,.2,z));
      for(const sz of[-1,1]){o.push(box(.4,3,.4,0xffffff,x-6,1.6,z+sz*(pl.d/2-2)));
        o.push(box(.4,3,.4,0xffffff,x+6,1.6,z+sz*(pl.d/2-2)));
        o.push(box(12.6,.4,.4,0xffffff,x,3.1,z+sz*(pl.d/2-2)))}
      if(lv>=2)o.push(box(pl.w,4,1,0xd8d0c0,x,2,z-pl.d/2));
      const l=lab('⚽ '+pl.n+' ⭐'+lv,'#9fffb0',2.4,1);l.position.set(x,9,z);ND.scene.add(l);o.push(l);
      set(0);
    }
  }else{
    /* قطعة أرض: لافتة للبيع أو بملكية لاعب */
    const owner=st.owner;
    const l=lab(owner<0? pl.n+' — للبيع '+ND.fmt(pl.p) : pl.n+' —ملك '+ND.walName(owner),
      owner<0?'#ffd54a':(owner?'#5eead4':'#ffb347'),2.6,1);
    l.position.set(x,7,z);ND.scene.add(l);o.push(l);
  }
  vis[i]=o;
}

/* ---------- عمليات العقارات ---------- */
ND.propInit=function(){
  PLOTS.forEach((pl,i)=>{
    cslo[i]=ND.CB.length;ND.CB.push([-1e9,-1e9,-1e9,-1e9]);
    S.plot[i]=S.plot[i]||{lv:0,owner:-1};
    drawPlot(i);
  });
};
ND.plotBuy=function(i){
  const pl=PLOTS[i],st=ND.plotState(i);
  if(st.owner>=0)return 'ℹ️ '+pl.n+' مملوكة بالفعل';
  if(ND.onRoad(pl.x,pl.z,4))return '🚫 الموقع غير صالح';
  const who=ND.pay(pl.p);if(who<0)return '💸 الرصيد لا يكفي ('+ND.fmt(pl.p)+')';
  st.owner=who;drawPlot(i);ND.save();ND.snd(700,.3);
  return '🏠 اشتريتم '+pl.n+' — المحفظة المسؤولة: '+ND.walName(who);
};
ND.plotDev=function(i){
  const pl=PLOTS[i],st=ND.plotState(i);
  if(st.owner<0)return '⚠️ اشترِ الأرض أولًا';
  if(st.lv>=3)return '✅ '+pl.n+' وصلت للمستوى الأقصى (3)';
  const c=ND.plotDevCost(i);
  const who=ND.pay(c);if(who<0)return '💸 الترقية تكلف '+ND.fmt(c);
  st.lv++;drawPlot(i);ND.save();ND.snd(820,.3);
  return '🏗 تم تطوير '+pl.n+' إلى المستوى '+st.lv+' (−'+ND.fmt(c)+')';
};
ND.plotSell=function(i){
  const pl=PLOTS[i],st=ND.plotState(i);
  if(st.owner<0)return '⚠️ الأرض غير مملوكة';
  const v=ND.plotValue(i);
  ND.gainTo(st.owner,Math.round(v*.85));
  st.owner=-1;st.lv=0;drawPlot(i);ND.save();
  return '💰 بيعت '+pl.n+' بـ '+ND.fmt(Math.round(v*.85))+' لمحفظة المالك';
};

/* الدخل التلقائي (لصاحب القطعة فقط) */
ND.propTick=function(dt){
  const m=1+S.study*.1;
  for(let i=0;i<PLOTS.length;i++){
    const st=S.plot[i];
    if(!st||st.owner<0||st.lv<1)continue;
    ND.gainTo(st.owner,PLOTS[i].inc*st.lv*m*dt);
  }
};
ND.propIncomePerSec=function(){let t=0;const m=1+S.study*.1;
  for(let i=0;i<PLOTS.length;i++){const st=S.plot[i];
    if(st&&st.owner>=0&&st.lv>0)t+=PLOTS[i].inc*st.lv*m}
  return t};
})();
