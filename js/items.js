/* =========================================================
   items.js — العناصر القابلة للجمع، المؤثرات، المهام،
              المكافآت (كلها موزّعة على محفظتي اللاعبين)
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,stat,M,B,rnd,PI}=ND;

/* ---------- مواقع عشوائية على الطرق (المدينة + الواجهة الشمالية) ---------- */
ND.rroad=function(){
  const useN=Math.random()<.35;
  if(useN){const k=Math.floor(rnd(0,4)),x=(k-1.5)*74+rnd(-4,4);return [x,rnd(-545,-340)]}
  const k=Math.floor(rnd(0,8)),p=(k-3.5)*74+rnd(-4,4),a=rnd(-250,250);
  return Math.random()<.5?[p,a]:[a,p]};

const items=ND.items=[];
ND.spawnItem=function(ty,x,z){
  const pos=(x==null)?ND.rroad():[x,z];
  const g=new THREE.Group();
  const bm=(c,h)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,h,6),
    new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.35}));
    m.position.y=h/2;g.add(m)};
  if(ty==='flag'){
    box(.15,3,.15,0xffffff,0,1.5,0,g);
    const fm=new THREE.Mesh(new THREE.PlaneGeometry(2,1.3),ND.FM);fm.position.set(1,2.4,0);g.add(fm);
    bm(0x46ff8a,40)}
  else if(ty==='gift'){
    box(2,2,2,0xff4fa0,0,1.2,0,g);box(2.1,.3,2.1,0xffd54a,0,2.3,0,g);bm(0xffd54a,70)}
  else{
    const m=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.2,14),
      new THREE.MeshLambertMaterial({color:0xffd54a,emissive:0x8a6a00}));
    m.rotation.x=PI/2;m.position.y=1.6;g.add(m)}
  g.position.set(pos[0],0,pos[1]);ND.scene.add(g);
  items.push({g,x:pos[0],z:pos[1],ty})};

ND.updItems=function(dt){
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.g.rotation.y+=dt*2;
    let got=0;
    for(const p of ND.PL.slice(0,S.players))
      if(ND.dist(p.x,p.z,it.x,it.z)<(p.car?4.5:3))got=1;
    if(!got)continue;
    ND.scene.remove(it.g);items.splice(i,1);
    if(it.ty==='coin'){ND.gain(Math.round(5000*(1+S.study*.1)));ND.snd(1200,.08)}
    else if(it.ty==='gift'){ND.gain(60000);ND.toast('🎁 هدية! +60,000 💰');ND.snd(1000,.3)}
    else{
      ND.snd(800,.15);
      if(ND.mis().ty==='flag'){ST.mp++;ND.toast('🇸🇦 '+Math.min(ST.mp,ND.need())+'/'+ND.need())}
      ND.gain(Math.round(8000*(1+S.study*.1)))}
    if(it.ty!=='gift')ND.spawnItem(it.ty);
  }
};

/* ---------- المؤثرات: دخان وانفجارات ---------- */
const sm=ND.sm=[],smG=new THREE.SphereGeometry(.6,6,5),
      smM=new THREE.MeshBasicMaterial({color:0xeeeeee,transparent:true,opacity:.45,depthWrite:false});
let si=0;
for(let i=0;i<60;i++){const m=new THREE.Mesh(smG,smM);m.visible=false;ND.scene.add(m);sm.push({m,l:0})}
ND.spawnSmoke=(x,z)=>{const s=sm[si++%60];s.l=.9;s.m.visible=true;s.m.position.set(x,.8,z);s.m.scale.setScalar(1)};

const FX=ND.FX=[];
const FC=[0x00ff7f,0xffffff,0xffd54a,0xff5577,0x66ccff];
ND.burst=function(x,y,z,n,sz,vel,c){
  const g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),vs=[];
  for(let i=0;i<n;i++){pos.set([x,y,z],i*3);
    const a=rnd(0,2*PI),b=Math.acos(rnd(-1,1)),s=vel*rnd(.5,1);
    vs.push(s*Math.sin(b)*Math.cos(a),s*Math.cos(b),s*Math.sin(b)*Math.sin(a))}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color:c,size:sz,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const pt=new THREE.Points(g,m);pt.frustumCulled=false;ND.scene.add(pt);
  FX.push({pt,vs,l:1.6,n,g,m})};

ND.updFX=function(dt){
  for(const s of sm)if(s.l>0){s.l-=dt;s.m.scale.setScalar(1+(.9-s.l)*3);s.m.position.y+=dt*2;
    if(s.l<=0)s.m.visible=false}
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.l-=dt;
    const a=f.g.attributes.position.array;
    for(let j=0;j<f.n;j++){f.vs[j*3+1]-=9*dt;a[j*3]+=f.vs[j*3]*dt;a[j*3+1]+=f.vs[j*3+1]*dt;a[j*3+2]+=f.vs[j*3+2]*dt}
    f.g.attributes.position.needsUpdate=true;
    f.m.opacity=Math.max(0,Math.min(1,f.l/1.1));
    if(f.l<=0){ND.scene.remove(f.pt);f.g.dispose();f.m.dispose();FX.splice(i,1)}}};

/* ---------- المهمة الحالية ---------- */
const MS=[
 {t:'اجمعوا {n} أعلام سعودية 🇸🇦',ty:'flag',n:6,r:80000},
 {t:'وصّلوا الحديقة 🌳',           ty:'go',  z:'park', r:50000},
 {t:'فحّطوا واجمعوا {n} نقطة 🔥',  ty:'drift',n:600, r:120000},
 {t:'ادرسوا في المدرسة 📚',        ty:'study',z:'school',r:90000},
 {t:'زر المطار الجديد 🛫 وقفوا أمام الصالة',ty:'go',z:'airport',r:150000},
 {t:'اسبقوا حول الحلبة الشمالية 🏁 واجمعوا {n} أعلام',ty:'flag',n:10,r:180000},
 {t:'روحوا الاستراحة 🏕 وشاهدوا العرض',ty:'go',z:'rest',r:140000}];
ND.mis  =()=>MS[S.mi%MS.length];
ND.mult =()=>1+Math.floor(S.mi/MS.length)*.5;
ND.need =()=>Math.round((ND.mis().n||0)*ND.mult());

const beacon=ND.beacon=new THREE.Mesh(new THREE.CylinderGeometry(5,5,70,16,1,true),
  new THREE.MeshBasicMaterial({color:0xffd54a,transparent:true,opacity:.3,side:THREE.DoubleSide,fog:false}));
ND.scene.add(beacon);
ND.setB=function(){const m=ND.mis(),s=ND.SP[m.z];
  beacon.visible=!!s;if(s)beacon.position.set(s.x,35,s.z)};
ND.done=function(){
  const m=ND.mis(),r=Math.round(m.r*ND.mult()*(1+S.study*.1));
  ND.gain(r);
  ND.toast('✅ أنجزتم المهمة! +'+ND.fmt(r)+' 💰 (مقسومة بين المحفظتين)');
  ND.snd(660,.3);ND.snd(990,.4);
  S.mi++;ST.mp=0;
  if(m.z==='rest')ND.showFx(10);
  ND.save();ND.setB()};

/* عرض الألعاب النارية */
ND.showFx=function(d){ST.showT=d;ND.toast('🎆 عرض الألعاب النارية – كل عام والوطن بخير!')};
})();
