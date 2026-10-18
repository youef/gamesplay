/* =========================================================
   player.js — اللاعبون: الحركة سيرًا وقيادة، الركوب/النزول،
   والتحكم الكامل بزاوية وتقريب وميلان الكاميرا
   (أزرار + سحب على الشاشة + مفاتيح لوحة المفاتيح)
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST,box,clamp,wrap,mkKid,PI}=ND, $=ND.$;

/* مفاتيح تحكم الكاميرا لكل لاعب */
const CK=ND.CAMKEYS=[
 {yawL:'KeyZ',   yawR:'KeyX',   zin:'KeyR', zout:'KeyF', tup:'KeyT', tdn:'KeyG'},
 {yawL:'Comma',  yawR:'Period', zin:'PageUp', zout:'PageDown', tup:'KeyI', tdn:'KeyK'}];

const mkP=(nm,c,gh,col,k,ki)=>({nm,k,ki,kid:mkKid(c,gh,nm,col),x:0,z:0,y:0,fl:0,ry:0,cy:0,
  car:null,jx:0,jy:0,drb:0,act:0,ds:0,sp:0,cbtn:{},
  cam:new THREE.PerspectiveCamera(62,1,.5,1400)});

const PL=ND.PL=[
 mkP('فواز',S.skin[0].c,S.skin[0].g,'#ffb347',{up:'KeyW',dn:'KeyS',lf:'KeyA',rt:'KeyD',ac:'KeyE',dr:'Space'},0),
 mkP('زياد',S.skin[1].c,S.skin[1].g,'#5eead4',{up:'ArrowUp',dn:'ArrowDown',lf:'ArrowLeft',rt:'ArrowRight',ac:'Enter',dr:'ShiftRight'},1)];

PL[0].x=ND.HX-3;PL[1].x=ND.HX+3;
PL.forEach(p=>{p.z=ND.HZ-14;p.cam.position.set(p.x,9,p.z-14)});

/* ---------- الكاميرا ---------- */
ND.camInput=(pi,kind,amt)=>{
  const c=S.cam[pi];
  if(kind==='yaw')c.yaw=clamp(c.yaw+amt,-2.6,2.6);
  else if(kind==='zoom')c.zoom=clamp(c.zoom*(1+amt),.5,2.3);
  else if(kind==='tilt')c.tilt=clamp(c.tilt+amt,0,1)};

/* معادلة موقع الكاميرا: التقريب × الميلان × الزاوية */
ND.camEq=function(pi){
  const c=S.cam[pi];
  const base=15;
  const d=base*c.zoom;
  const el=.18+c.tilt;
  return {d, dh:d*Math.cos(el), hv:d*Math.sin(el)+3, yaw:c.yaw, el};
};

ND.updCam=function(p,dt){
  const c=S.cam[p.ki],cam=p.cam;
  const base=p.car?15+p.sp*.15:14;
  const d=base*c.zoom;
  const el=.18+c.tilt;                                   // ميلان الكاميرا
  const dh=d*Math.cos(el),hv=d*Math.sin(el)+3;
  const ang=p.cy+c.yaw;                                  // زاوية الدوران
  const fx=Math.sin(ang),fz=Math.cos(ang);
  const q=Math.min(1,9*dt);
  cam.position.x+=(p.x-fx*dh-cam.position.x)*q;
  cam.position.y+=(hv+p.y-cam.position.y)*q;
  cam.position.z+=(p.z-fz*dh-cam.position.z)*q;
  cam.lookAt(p.x+fx*4,1.5+p.y,p.z+fz*4);
  cam.fov=58+p.sp*.32;
};

/* ---------- الركوب والنزول ---------- */
ND.action=function(p){
  if(p.car){
    const c=p.car;
    p.x=c.x-Math.cos(c.h)*3.3;p.z=c.z+Math.sin(c.h)*3.3;
    ND.push(p,1);c.occ=null;p.car=null;p.kid.g.visible=true;p.ds=0;
    /* إعادة السيارة تلقائيًا إلى أقرب موقف بعد الركن */
    if(Math.hypot(c.vx,c.vz)<3&&!c.ai&&!c.race&&!c.temp){
      const s=ND.nearParking(c.x,c.z,26);
      c.ret=s?{x:s.x,z:s.z}:{x:c.home.x,z:c.home.z};
      c.parked=0;ND.toast('🚗 عادت السيارة إلى الموقف تلقائيًا')}
    ND.snd(300,.1);return}
  let b=null,bd=36;
  for(const c of ND.cars)if(!c.occ){const d=(c.x-p.x)**2+(c.z-p.z)**2;if(d<bd){bd=d;b=c}}
  if(b){p.car=b;b.occ=p;b.ai=null;b.parked=0;b.ret=null;p.kid.g.visible=false;ND.snd(200,.12);return}
  if(ND.dist(p.x,p.z,ND.SP.shop.x,ND.SP.shop.z)<16)ND.A('tab','shop');
  else ND.toast('اقترب من سيارة للركوب 🚗')};

/* ---------- تحديث اللاعب ---------- */
ND.updP=function(p,dt){
  const k=p.k,K=ND.K;
  let ix=clamp(p.jx+(K[k.rt]?1:0)-(K[k.lf]?1:0),-1,1);
  let iy=clamp(p.jy+(K[k.up]?1:0)-(K[k.dn]?1:0),-1,1);
  let dr=p.drb||K[k.dr];
  /* إدخال الكاميرا المستمر (مفاتيح + أزرار مضغوطة) */
  const ck=CK[p.ki],h=p.cbtn;let a=0,b=0,c2=0;
  if(K[ck.yawL]||h.yawL)a-=1;
  if(K[ck.yawR]||h.yawR)a+=1;
  if(K[ck.zin]||h.zin)b+=1;
  if(K[ck.zout]||h.zout)b-=1;
  if(K[ck.tup]||h.tup)c2+=1;
  if(K[ck.tdn]||h.tdn)c2-=1;
  if(a)ND.camInput(p.ki,'yaw',a*1.6*dt);
  if(b)ND.camInput(p.ki,'zoom',-b*.9*dt);
  if(c2)ND.camInput(p.ki,'tilt',c2*.7*dt);

  if(p.act){p.act=0;ND.action(p)}
  const frozen=p.car&&p.car.frozen;
  if(p.car){
    const car=p.car;
    if(!frozen)ND.drive(car,p,ix,iy,dr,dt);
    else{car.vx*=Math.exp(-8*dt);car.vz*=Math.exp(-8*dt)}
    p.x=car.x;p.z=car.z;p.sp=Math.hypot(car.vx,car.vz);p.y=0;p.fl=0;
    p.cy+=wrap(car.h-p.cy)*Math.min(1,3*dt);
    p.kid.g.visible=false;
  }else{
    p.sp=0;
    const f=[Math.sin(p.cy),Math.cos(p.cy)],r=[-Math.cos(p.cy),Math.sin(p.cy)];
    const mx=f[0]*iy+r[0]*ix,mz=f[1]*iy+r[1]*ix,m=Math.hypot(mx,mz);
    if(m>.1){const s=Math.min(m,1)*7.5*dt;p.x+=mx/m*s;p.z+=mz/m*s;
      p.ry+=wrap(Math.atan2(mx,mz)-p.ry)*Math.min(1,14*dt)}
    ND.push(p,.9);ND.constrain(p,.9);
    /* درج البيت وسطح الدور الأول */
    {const rx=p.x-ND.HCX,rz=p.z-ND.HCZ;
     if(rx>-13.5&&rx<-10&&rz>-9&&rz<1){const h2=(rz+9)*.6;p.y=h2;p.fl=h2>5.8?1:h2<.3?0:p.fl}
     else if(p.fl&&rx>-13.5&&rx<13.5&&rz>1&&rz<9.8)p.y=6;
     else{p.fl=0;p.y=0}}
    p.kid.g.position.set(p.x,.1+p.y,p.z);
    p.kid.g.rotation.y=p.ry;
    ND.anim(p.kid,ST.T,m>.1);
    p.kick=m>.1?7.5:5;
  }
  ND.updCam(p,dt);
};

/* ---------- عصا التحكم ---------- */
function joy(el,p){
  const kn=el.firstElementChild;let id=null,cx,cy;
  const set=e=>{let dx=e.clientX-cx,dy=e.clientY-cy;const m=Math.hypot(dx,dy);
    if(m>50){dx*=50/m;dy*=50/m}
    kn.style.transform=`translate(${dx}px,${dy}px)`;p.jx=dx/50;p.jy=-dy/50};
  el.addEventListener('pointerdown',e=>{id=e.pointerId;el.setPointerCapture(id);
    const r=el.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;set(e)});
  el.addEventListener('pointermove',e=>{if(e.pointerId===id)set(e)});
  const up=e=>{if(e.pointerId===id){id=null;p.jx=p.jy=0;kn.style.transform=''}};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)
}

/* ---------- واجهة كل لاعب ---------- */
const UI=ND.UI=PL.map(p=>{
  const d=document.createElement('div');d.className='pc';
  d.innerHTML='<div class="camsense"></div>'+
   '<div class="camctl">'+
     '<button data-c="yawL" title="تدوير يسار">⟲</button>'+
     '<button data-c="yawR" title="تدوير يمين">⟳</button>'+
     '<button data-c="zin" title="تقريب">➕</button>'+
     '<button data-c="zout" title="إبعاد">➖</button>'+
     '<button data-c="tup" title="رفع الكاميرا">⬆</button>'+
     '<button data-c="tdn" title="خفض الكاميرا">⬇</button>'+
   '</div>'+
   '<div class="joy"><i></i></div>'+
   '<div class="btns"><button class="b" data-k="dr">تفحيط</button><button class="b" data-k="ac">ركوب</button></div>'+
   '<div class="hud"></div>';
  $('ui').appendChild(d);
  joy(d.querySelector('.joy'),p);
  const bd=d.querySelector('[data-k=dr]');
  bd.onpointerdown=e=>{e.stopPropagation();p.drb=1};
  bd.onpointerup=bd.onpointercancel=bd.onpointerleave=()=>p.drb=0;
  d.querySelector('[data-k=ac]').onpointerdown=e=>{e.stopPropagation();p.act=1};
  d.querySelectorAll('.camctl button').forEach(bt=>{
    const key=bt.dataset.c;
    bt.onpointerdown=e=>{e.stopPropagation();p.cbtn[key]=1};
    const off=()=>p.cbtn[key]=0;
    bt.onpointerup=bt.onpointercancel=bt.onpointerleave=off});
  /* السحب على مساحة المشهد لتدوير وميلان الكاميرا */
  const cs=d.querySelector('.camsense');let id=null,px=0,py=0;
  cs.addEventListener('pointerdown',e=>{id=e.pointerId;px=e.clientX;py=e.clientY;
    try{cs.setPointerCapture(id)}catch(_){}});
  cs.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;
    const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;
    ND.camInput(p.ki,'yaw',dx*.006);ND.camInput(p.ki,'tilt',-dy*.004)});
  const up=e=>{if(e.pointerId===id)id=null};
  cs.addEventListener('pointerup',up);cs.addEventListener('pointercancel',up);
  cs.addEventListener('wheel',e=>{e.preventDefault();
    ND.camInput(p.ki,'zoom',-Math.sign(e.deltaY)*.12)},{passive:false});
  return d});

/* ---------- لوحة المفاتيح ---------- */
const K=ND.K={};
addEventListener('keydown',e=>{
  K[e.code]=1;
  PL.forEach(p=>{if(e.code==p.k.ac)p.act=1});
  if(/Arrow|Space|Page/.test(e.code))e.preventDefault()});
addEventListener('keyup',e=>K[e.code]=0);
})();
