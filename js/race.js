/* =========================================================
   race.js — سباق التحدي بين سيارتين حول الحديقة الشمالية:
   عد تنازلي يجمّد السيارات، نقاط التفاف على الحلبة،
   علامات الفوز، وتقاسم المكافآت بين المحفظتين
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,wrap,dist,PI}=ND;

/* نقاط التفاف المسار الدائري (6 نقاط) */
const CP=ND.CP=[];
{const R=ND.RACE;
 for(let i=0;i<6;i++){const a=PI/2+(i+1)*(2*PI/6);
   CP.push({x:R.CX+Math.cos(a)*R.R, z:R.CZ+Math.sin(a)*R.R})}}

ND.cdText=function(t){const e=ND.$('cd');if(!e)return;e.textContent=t||'';e.style.opacity=t?1:0};

/* ---------- بدء السباق ---------- */
ND.startRace=function(){
  if(ST.race)return '⏳ يوجد سباق تحدٍ جارٍ حاليًا';
  const R=ND.RACE, a0=PI/2-.16, h0=-a0;   // خلف خط البداية، والاتجاه على الحلبة
  const parts=[];
  ND.PL.slice(0,S.players).forEach((p,i)=>{
    let car=p.car;
    p.preRace={x:p.x,z:p.z,y:p.y,cy:p.cy,car:!!car};       // نحفظ موقعه ليعود بعدها
    if(!car){car=ND.mkCar(S.cars.includes(2)?2:0,0,0,h0);car.temp=1;
      p.car=car;car.occ=p;p.kid.g.visible=false}
    const rr=R.R+(i?5:-5);
    car.x=R.CX+Math.cos(a0)*rr;car.z=R.CZ+Math.sin(a0)*rr;
    car.h=h0;car.vx=car.vz=0;car.ai=null;car.ret=null;
    car.race=1;car.frozen=1;car.parked=0;
    car.g.position.set(car.x,.1,car.z);car.g.rotation.y=car.h;
    parts.push({p,car,cp:0,fin:0,ai:0});
  });
  if(S.players<2){                     // خصم ذكي حين يلعب لاعب واحد
    const rr=R.R+5,car=ND.mkCar(3,0,0,h0);
    car.x=R.CX+Math.cos(a0)*rr;car.z=R.CZ+Math.sin(a0)*rr;
    car.h=h0;car.race=1;car.frozen=1;
    car.g.position.set(car.x,.1,car.z);car.g.rotation.y=car.h;
    parts.push({p:null,car,cp:0,fin:0,ai:1});
  }
  ST.race={phase:'cd',t:3.7,parts,tm:0,win:-1,marks:[]};
  ST.freeze=1;
  return '🏁 تحدٍ: 6 نقاط حول الحديقة الشمالية — نُقلت سيارتك إلى خط الانطلاق!';
};

/* ---------- منطق السباق ---------- */
ND.endRace=function(){
  const r=ST.race;if(!r)return;
  for(const q of r.parts){
    q.car.race=0;q.car.frozen=0;q.car.vx=q.car.vz=0;
    if(q.car.temp){
      /* سيارة مؤقتة: نزيلها ونعيد اللاعب إلى موقعه قبل السباق */
      const i=ND.cars.indexOf(q.car);if(i>=0)ND.cars.splice(i,1);
      ND.scene.remove(q.car.g);
      if(q.p){q.p.car=null;q.p.kid.g.visible=true;backToPre(q.p)}}
    else q.car.ret=null}
  (r.marks||[]).forEach(m=>ND.scene.remove(m));
  ST.race=null;ST.freeze=0;ND.cdText('');ND.save();
};
/* إعادة اللاعب إلى موقعه قبل السباق (لسيارات السباق المؤقتة فقط) */
function backToPre(p){
  const b=p.preRace;p.preRace=null;if(!b)return;
  p.x=b.x;p.z=b.z;p.y=b.y||0;p.cy=b.cy||0;p.ry=b.cy||0;
  ND.push(p,1);ND.constrain(p,1);
  p.kid.g.position.set(p.x,.1+p.y,p.z);
}

function winMark(car){
  const R=ST.race;
  const l=ND.lab('🏆 الفائز','#ffd54a',4,1);
  l.position.set(car.x,10,car.z);ND.scene.add(l);R.marks.push(l);
  const m=new THREE.Mesh(new THREE.TorusGeometry(4,.45,8,22),
    new THREE.MeshBasicMaterial({color:0xffd54a,fog:false}));
  m.rotation.x=-PI/2;m.position.set(car.x,.7,car.z);ND.scene.add(m);R.marks.push(m);
}

ND.raceTick=function(dt){
  const r=ST.race;if(!r)return;
  if(r.phase==='cd'){                                  // العد التنازلي وتجميد السيارات
    r.t-=dt;
    for(const q of r.parts){q.car.frozen=1;q.car.vx=q.car.vz=0}
    ND.cdText(r.t>.7?String(Math.max(1,Math.ceil(r.t-.7))):'🚀 انطلق!');
    if(r.t<=0){r.phase='run';ST.freeze=0;
      for(const q of r.parts){q.car.frozen=0}
      ND.cdText('');ND.snd(880,.3)}
    return;
  }
  if(r.phase==='run'){
    r.tm+=dt;
    for(const q of r.parts){
      if(q.ai){                                     // قيادة الخصم الذكي نحو نقطة التفافه
        const tp=CP[q.cp]||CP[CP.length-1];
        const th=Math.atan2(tp.x-q.car.x,tp.z-q.car.z);
        q.car.h+=wrap(th-q.car.h)*Math.min(1,3.4*dt);
        let v=40;
        if(Math.abs(wrap(th-q.car.h))>.55)v=21;     // يبطئ عند الالتفاف
        q.car.vx=Math.sin(q.car.h)*v;q.car.vz=Math.cos(q.car.h)*v;
        ND.moveCar(q.car,dt);
      }
      const tp=CP[q.cp];
      if(tp&&dist(q.car.x,q.car.z,tp.x,tp.z)<13){
        q.cp++;ND.snd(900,.12);
        if(q.cp>=CP.length)q.fin=1}
    }
    const first=r.parts.find(q=>q.fin);
    if(first){
      r.phase='end';r.t=5;r.win=r.parts.indexOf(first);ST.freeze=1;
      for(const q of r.parts){q.car.frozen=1;q.car.vx=q.car.vz=0}
      winMark(first.car);
      ND.burst(first.car.x,5,first.car.z,90,2.6,24,0xffd54a);
      if(first.p){                                   // فاز لاعب
        ND.gainTo(first.p.ki,600000);
        r.parts.forEach(q=>{if(q!==first&&q.p)ND.gainTo(q.p.ki,200000)});
        ND.toast('🏆 فاز '+first.p.nm+' بالسباق التحدي! +600,000 💰');
      }else{                                          // فاز الخصم: مكافأة مشاركة
        r.parts.forEach(q=>{if(q.p)ND.gainTo(q.p.ki,200000)});
        ND.toast('💀 فاز خصمكم… حاولوا مرة أخرى! +200,000 💰');
      }
      ND.snd(660,.4);ND.snd(990,.5);ND.save();
    }
    if(r.phase==='run'&&r.tm>160){ND.toast('⏰ انتهى وقت السباق');ND.endRace()}
    return;
  }
  if(r.phase==='end'){r.t-=dt;if(r.t<=0)ND.endRace()}
};

/* علامة نقطة التفاف التالية (تُعرض في حلقة التوهج) */
ND.raceMark=function(){
  const r=ST.race;if(!r||r.phase!=='run')return null;
  const lead=r.parts.find(q=>!q.fin)||r.parts[0];
  return CP[lead.cp]||null;
};
})();
