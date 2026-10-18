/* =========================================================
   characters.js — الشخصيات: الأطفال والبالغون بملابس تقليدية،
   المشات، الكرات وفيزيتها، وملاحقة الأطفال للكرات
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,M,B,rnd,wrap,PI}=ND;
const SK=0xe3b183;

/* ---------- أدوات بناء الجسم ---------- */
function limbs(g,c,gh,scl){
  const L=(x,y,w,h,cc)=>{const q=new THREE.Group();q.position.set(x,y,0);
    box(w,h,w,cc,0,-h/2,0,q);g.add(q);return q};
  return {l:L(-.22,.55,.36,.55,SK), r:L(.22,.55,.36,.55,SK),
          al:L(-.62,2,.3,1.1,c),  ar:L(.62,2,.3,1.1,c)};
}
ND.anim=(o,t,m)=>{const a=m?Math.sin(t*11)*.8:0;
  o.l.rotation.x=a;o.r.rotation.x=-a;o.al.rotation.x=-a;o.ar.rotation.x=a};

function face(g,y){box(.12,.12,.05,0x222222,-.18,y+.05,.38,g);box(.12,.12,.05,0x222222,.18,y+.05,.38,g)}
function shadowBlob(g,s){const m=new THREE.Mesh(ND.SH,ND.blobM);m.rotation.x=-PI/2;
  m.position.y=.05;m.scale.set(s,s,1);g.add(m)}

/* ---------- طفل ---------- */
ND.mkKid=function(c,gh,nm,col){
  const g=new THREE.Group();
  box(.95,1.5,.55,c,0,1.3,0,g);box(.75,.75,.75,SK,0,2.45,0,g);face(g,2.45);
  if(gh){const m=gh==1?new THREE.MeshLambertMaterial({map:ND.GHT}):M(0xffffff);
    box(.85,.3,.85,m,0,2.95,0,g);box(.85,.7,.25,m,0,2.5,-.45,g)}
  else box(.8,.25,.8,[0xc0392b,0x2980b9,0xf1c40f,0x1f7a3d][c%4],0,2.9,0,g);
  const o=limbs(g,c,gh);shadowBlob(g,1.2);
  if(nm){const l=ND.lab(nm,col,.9);l.position.y=4.2;g.add(l)}
  g.scale.setScalar(.75);ND.scene.add(g);
  o.g=g;o.kid=1;return o};

/* ---------- بالغ بملابس تقليدية (ثوب + غترة/شماغ + عقال) ---------- */
ND.mkAdult=function(opt){
  opt=opt||{};
  const c=opt.c||0xffffff,g=new THREE.Group();
  box(1.2,2.3,.8,c,0,1.65,0,g);          // الثوب
  box(1.05,.45,.75,c,0,2.85,0,g);        // الكتفان
  box(.82,.82,.82,SK,0,3.55,0,g);        // الرأس
  face(g,3.55);
  const hm=opt.g==1?new THREE.MeshLambertMaterial({map:ND.GHT}):M(0xffffff);
  box(1.0,.3,1.0,hm,0,4.05,0,g);         // الغترة/الشماغ فوق الرأس
  box(1.02,.62,.3,hm,0,3.6,-.45,g);      // طرف الغترة خلف الرقبة
  box(1.05,.13,1.05,0x151515,0,4.16,0,g);// العقال الأسود
  const L=(x,y,w,h,cc)=>{const q=new THREE.Group();q.position.set(x,y,0);
    box(w,h,w,cc,0,-h/2,0,q);g.add(q);return q};
  const o={l:L(-.24,.6,.4,.6,SK), r:L(.24,.6,.4,.6,SK),
           al:L(-.72,2.7,.28,1.35,c),ar:L(.72,2.7,.28,1.35,c)};
  shadowBlob(g,1.4);ND.scene.add(g);
  o.g=g;o.kid=0;return o};

/* ---------- الكرة وفيزيتها ---------- */
const balls=ND.balls=[];
const ballGeo=new THREE.SphereGeometry(.62,10,8);
ND.mkBall=(x,z,c)=>{
  const g=new THREE.Group();
  const m=new THREE.Mesh(ballGeo,new THREE.MeshLambertMaterial({color:c||0xffffff}));
  m.castShadow=true;g.add(m);
  const s=new THREE.Mesh(ND.SH,ND.blobM);s.rotation.x=-PI/2;s.position.y=-.55;s.scale.set(.9,.9,1);g.add(s);
  g.position.set(x,1,z);ND.scene.add(g);
  const b={g,x,y:1,z,vx:0,vy:0,vz:0,r:.62,cool:0};
  balls.push(b);return b};
ND.kickBall=(b,fx,fz,pw)=>{b.vx+=fx*pw;b.vz+=fz*pw;b.vy+=Math.min(6,pw*.45);b.cool=.35;ND.snd(180,.06,.04)};

ND.updBalls=dt=>{
  for(const b of balls){
    b.cool=Math.max(0,b.cool-dt);
    b.vy-=26*dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
    const f=Math.exp(-(b.y<=.63?1.1:.05)*dt);
    b.vx*=f;b.vz*=f;
    if(b.y<.63){b.y=.63;if(b.vy<-1.4){b.vy=-b.vy*.55;ND.snd(220,.05,.025)}else b.vy=0}
    if(ND.push(b,.62)){b.vx*=-.35;b.vz*=-.35}
    ND.constrain(b,.6);
    b.g.position.set(b.x,b.y,b.z);
  }
};
/* تفاعل اللاعبين والسيارات مع الكرات */
ND.ballHit=(dt)=>{
  for(const b of balls){
    if(b.cool>0)continue;
    for(const p of ND.PL){
      if(p.car)continue;
      const d=Math.hypot(b.x-p.x,b.z-p.z);
      if(d<1.5){const a=Math.atan2(b.x-p.x,b.z-p.z);
        ND.kickBall(b,Math.sin(a),Math.cos(a),Math.max(5,p.kick||5))}
    }
    for(const c of ND.cars){
      const sp=Math.hypot(c.vx,c.vz);
      if(sp<4)continue;
      const d=Math.hypot(b.x-c.x,b.z-c.z);
      if(d<2.7){const a=Math.atan2(b.x-c.x,b.z-c.z);
        ND.kickBall(b,Math.sin(a),Math.cos(a),sp*1.2)}
    }
  }
};

/* ---------- المشاة ---------- */
const npcs=ND.npcs=[];
ND.spawnNPCs=function(n){
  for(let i=0;i<n;i++){
    const kid=i%2===0;
    const k=kid? ND.mkKid([0xffffff,0xf5f0e0,0x2c7a4b,0xdde6f0][i%4], i%3?0:(i%2?1:2))
               : ND.mkAdult({c:[0xffffff,0xf3f3f3,0xe8e2d0][i%3], g:i%2?1:2});
    const o={k,x:0,z:0,t:0,tx:0,tz:0,w:0,ph:rnd(0,9),kid,ball:null,search:0,ry:0};
    /* مواقع عشوائية في المدينة أو الواجهة الشمالية */
    if(i%5===0){o.x=rnd(-250,250);o.z=rnd(-545,-340)}
    else{o.x=rnd(-250,250);o.z=rnd(-250,250)}
    ND.push(o,1);npcs.push(o)}
};

ND.updNPCs=function(dt){
  for(const n of npcs){
    n.t-=dt;n.search-=dt;
    let tx=n.tx,tz=n.tz,run=2.2,active=0;
    if(n.kid&&balls.length){
      if(n.search<=0||!n.ball||balls.indexOf(n.ball)<0){
        n.search=.8;let bd=1e12;
        for(const b of balls){const d=(b.x-n.x)**2+(b.z-n.z)**2;if(d<bd){bd=d;n.ball=b}}
      }
      if(n.ball){tx=n.ball.x;tz=n.ball.z;run=4.8;active=1;
        const d=Math.hypot(tx-n.x,tz-n.z);
        if(d<1.8&&n.ball.cool<=0){const a=Math.atan2(tx-n.x,tz-n.z);
          ND.kickBall(n.ball,Math.sin(a),Math.cos(a),9+rnd(0,5));n.t=.4}}
    }else{
      if(n.t<=0){n.tx=n.x+rnd(-25,25);n.tz=n.z+rnd(-25,25);n.t=rnd(2,7);n.w=Math.random()<.75}
      active=n.w?1:0}
    let dx=tx-n.x,dz=tz-n.z,m=Math.hypot(dx,dz);
    if(active&&m>1.2){n.x+=dx/m*run*dt;n.z+=dz/m*run*dt;n.ry=Math.atan2(dx,dz)}
    else active=0;
    /* تجنب السيارات السريعة */
    for(const c of ND.cars){
      const ex=n.x-c.x,ez=n.z-c.z;
      if(ex*ex+ez*ez<40&&c.vx*c.vx+c.vz*c.vz>25){const d=Math.hypot(ex,ez)||1;
        n.x+=ex/d*14*dt;n.z+=ez/d*14*dt;active=1}}
    if(ND.push(n,.8))n.t=0;
    ND.constrain(n,.8);
    n.k.g.position.set(n.x,.1,n.z);n.k.g.rotation.y=n.ry||0;
    ND.anim(n.k,ST.T+n.ph,active);
  }
};
})();
