/* =========================================================
   game.js — الحلقة الرئيسية: تحديث العالم، تقسيم الشاشة،
   حركة المرور والمشاة والكرات، وإقلاع اللعبة
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,rnd,PI}=ND, $=ND.$;

/* ---------- مركبات الشوارع ---------- */
const CC=[0xe8e8e8,0xc0392b,0x2c3e50,0xf1c40f,0x7f8c8d,0x2980b9];
ND.homeCars=[];
ND.spawnHome=function(){S.cars.forEach((t,i)=>{
  if(!ND.homeCars[i])ND.homeCars[i]=ND.mkCar(t,ND.HX-24+i*9,ND.HZ-28,0)})};

function spawnTraffic(){
  /* سيارات ركن حول المدينة */
  for(let i=0;i<6;i++){
    const k=Math.floor(rnd(0,8)),v=Math.random()<.5,
          p=(k-3.5)*74+(Math.random()<.5?-3.6:3.6),a=rnd(-240,240);
    const c=ND.mkCar(0,v?a:p,v?p:a,v?PI/2:0,CC[i%6]);
    c.home={x:c.x,z:c.z};c.parked=1;
  }
  /* سيارات ذكية تسير في الطرق وترتبط بقواعد الالتفاف */
  for(let i=0;i<14;i++){
    const k=Math.floor(rnd(0,8)),a=rnd(-250,250),hz=Math.random()<.5,
          dir=Math.random()<.5?1:-1,
          h=hz?(dir>0?PI/2:-PI/2):(dir>0?0:PI),
          rc=(k-3.5)*74;
    const c=ND.mkCar(i%4?0:1,hz?a:rc-Math.cos(h)*3.6,hz?rc+Math.sin(h)*3.6:a,h,CC[i%6]);
    c.ai={th:h,cool:0,v:12+rnd(0,5),last:0};c.parked=0;
    c.home={x:c.x,z:c.z};
  }
}

/* ---------- تقسيم الشاشة والعرض ---------- */
const lay=i=>S.players==1?[0,0,1,1]:S.split=='h'?[i*.5,0,.5,1]:[0,i*.5,1,.5];
ND.applyQ=function(){
  const sh=S.q==3?1:0;
  if(sh!==ND.shOn){ND.shOn=sh;ND.R.shadowMap.enabled=!!sh;ND.sun.castShadow=!!sh;
    ND.scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}
  ND.R.setPixelRatio([1,Math.min(devicePixelRatio,1.5),Math.min(devicePixelRatio,2)][S.q-1]);
  ND.R.setSize(innerWidth,innerHeight);
  ND.UI.forEach((d,i)=>{const l=lay(i);
    d.style.cssText=`left:${l[0]*100}%;top:${l[1]*100}%;width:${l[2]*100}%;height:${l[3]*100}%;`
      +`display:${i<S.players?'block':'none'}`});
  const v=$('dv');
  v.style.display=S.players==2?'block':'none';
  v.style.cssText=`${S.split=='h'?'left:50%;top:0;width:2px;height:100%':'left:0;top:50%;width:100%;height:2px'}`;
  v.style.position='fixed';v.style.background='#fff';v.style.opacity='.8';v.style.zIndex='2';
};
ND.render=function(){
  const W=innerWidth,H=innerHeight;
  for(let i=0;i<S.players;i++){
    const l=lay(i),x=l[0]*W,y=(1-l[1]-l[3])*H,w=l[2]*W,h=l[3]*H,c=ND.PL[i].cam;
    ND.R.setViewport(x,y,w,h);ND.R.setScissor(x,y,w,h);
    c.aspect=w/h;c.updateProjectionMatrix();
    ND.sun.target.position.set(ND.PL[i].x,0,ND.PL[i].z);
    ND.sun.position.set(ND.PL[i].x-80,140,ND.PL[i].z+60);
    ND.R.render(ND.scene,c);
  }
};

/* ---------- التحديث الرئيسي ---------- */
function upd(dt){
  ST.T+=dt;ST.fr++;
  ND.PL.slice(0,S.players).forEach(p=>ND.updP(p,dt));

  /* السيارات: عودة تلقائية للمواقف، ذكاء اصطناعي، حركة */
  for(const c of ND.cars){
    if(c.occ&&ND.PL.indexOf(c.occ)>=S.players){c.occ.car=null;c.occ.kid.g.visible=true;c.occ=null}
    if(!c.occ){
      if(c.ret)ND.retCar(c,dt);
      else if(c.ai)ND.aiCar(c,dt);
      else{c.vx*=Math.exp(-2.5*dt);c.vz*=Math.exp(-2.5*dt)}
    }
    ND.moveCar(c,dt);
  }
  for(let i=0;i<ND.cars.length;i++)for(let j=i+1;j<ND.cars.length;j++){
    const a=ND.cars[i],b=ND.cars[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
    if(d<4.4&&d>.01){const o=(4.4-d)/2,nx=dx/d,nz=dz/d;
      a.x-=nx*o;a.z-=nz*o;b.x+=nx*o;b.z+=nz*o;
      a.vx*=.8;a.vz*=.8;b.vx*=.8;b.vz*=.8}
  }

  ND.updNPCs(dt);
  ND.updBalls(dt);ND.ballHit(dt);
  ND.updItems(dt);
  ND.updFX(dt);
  ND.updPlane(dt);
  ND.walletTick(dt);
  ND.raceTick(dt);

  /* الألعاب النارية والاحتفال */
  ST.evT-=dt;
  if(ST.evT<=0){ST.evT=45;ND.showFx(7)}
  if(ST.showT>0){ST.showT-=dt;
    if(Math.random()<dt*2.5){
      const p=ND.PL[Math.floor(rnd(0,S.players))];
      ND.burst(p.x+rnd(-90,90),rnd(55,95),p.z+rnd(-90,90),60,2.4,24,
        [0x00ff7f,0xffffff,0xffd54a,0xff5577,0x66ccff][Math.floor(rnd(0,5))]);
      ND.snd(rnd(120,200),.4,.07)}}
  ST.popT-=dt;
  if(ST.popT<=0&&ND.npcs.length){ST.popT=rnd(.8,2);
    const n=ND.npcs[Math.floor(rnd(0,ND.npcs.length))];
    ND.burst(n.x,1.5,n.z,14,.7,7,0xffd54a);ND.snd(rnd(500,900),.05,.03)}

  /* الهدايا والسباق الدوري */
  ST.giftT-=dt;
  if(ST.giftT<=0){ST.giftT=70;ND.spawnItem('gift');
    ND.toast('🎁 نزلت هدية بالحارة! دوّروا الشعاع الذهبي')}
  ST.raceT-=dt;
  if(ST.raceT<=0){
    const driving=ND.PL.slice(0,S.players).some(p=>p.car);   // لا نقتحم أثناء القيادة
    if(ST.race)ST.raceT=20;
    else if(driving)ST.raceT=30;
    else{ST.raceT=150;ND.toast(ND.startRace())}
  }

  /* المهام والدراسة */
  const m=ND.mis();
  if(m.ty==='go'){const s=ND.SP[m.z];
    for(const p of ND.PL.slice(0,S.players))
      if(ND.dist(p.x,p.z,s.x,s.z)<13){ND.done();break}}
  let inS=0;
  for(const p of ND.PL.slice(0,S.players))
    if(!p.car&&ND.dist(p.x,p.z,ND.SP.school.x,ND.SP.school.z)<8)inS=1;
  if(inS){ST.studyT+=dt;
    if(ST.studyT>=6){ST.studyT=0;S.study=Math.min(S.study+1,20);
      ND.gain(25000);
      ND.toast('📚 دراستكم تنمو: مستوى '+S.study+' (+10% دخل)');ND.snd(700,.3);
      if(m.ty==='study')ND.done()}}
  else ST.studyT=0;
  if((m.ty==='flag'||m.ty==='drift')&&ST.mp>=ND.need())ND.done();

  if(ST.fr%8==0){ND.hud();ND.miniDraw()}
  if(ST.fr%300==0)ND.save();
}

/* ---------- الإقلاع ---------- */
ND.buildsInit();
ND.decorInit();
ND.propInit();
ND.yardBuild();
ND.spawnHome();
spawnTraffic();
ND.spawnNPCs(30);
for(let i=0;i<10;i++){
  const col=[0xffffff,0xff6644,0x3388ff][i%3];
  if(i<5)ND.mkBall(ND.SP.park.x+rnd(-20,20),ND.SP.park.z+rnd(-18,18),col);
  else ND.mkBall(150+rnd(-70,70),-455+rnd(-70,70),col);
}
ND.setB();
ND.buildCross();
ND.applyQ();
ND.menu('start');

addEventListener('resize',ND.applyQ);
document.addEventListener('touchmove',e=>{if(!e.target.closest('#card'))e.preventDefault()},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());

/* ---------- حلقة اللعبة ---------- */
const clk=new THREE.Clock();
(function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clk.getDelta(),.05);
  if(ST.run&&!ST.paused)upd(dt);
  else ND.PL.forEach(p=>p.cam.lookAt(p.x,1.5,p.z));
  ND.render();
})();
})();
