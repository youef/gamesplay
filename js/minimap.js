/* =========================================================
   minimap.js — الخريطة المصغرة بتصميم جديد:
   ألوان ومقاييس محدّثة، الطرق والتقاطعات، العقارات ملوّنة
   حسب المالك، الحلبة الشمالية، المدرج، واللاعبون
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S}=ND;
const W=110,H=178,X0=-272,X1=272,Z0=-608,Z1=278;
const sx=W/(X1-X0),sz=H/(Z1-Z0);
const X=x=>(x-X0)*sx, Z=z=>(z-Z0)*sz;

/* مواقع تقاطعات الشوارع (تُحسب مرة واحدة) */
const cross=ND.cross=[];
ND.buildCross=function(){
  cross.length=0;
  const rs=ND.roads;
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){
    const a=rs[i],b=rs[j];
    const ox1=Math.max(a.x-a.w/2,b.x-b.w/2),ox2=Math.min(a.x+a.w/2,b.x+b.w/2);
    const oz1=Math.max(a.z-a.d/2,b.z-b.d/2),oz2=Math.min(a.z+a.d/2,b.z+b.d/2);
    if(ox2>ox1&&oz2>oz1)cross.push({x:(ox1+ox2)/2,z:(oz1+oz2)/2});
  }
};

ND.miniDraw=function(){
  const cv=ND.$('mini');if(!cv)return;
  const mg=cv.getContext('2d');
  mg.fillStyle='#12281c';mg.fillRect(0,0,W,H);
  /* بقع: المدينة | الحديقة الشمالية | ساحة المطار */
  mg.fillStyle='#274a33';mg.fillRect(X(-266),Z(-266),532*sx,532*sz);
  mg.fillStyle='#2f6b3d';mg.beginPath();mg.arc(X(150),Z(-455),112*sx,0,7);mg.fill();
  mg.fillStyle='#3c4148';mg.fillRect(X(-258),Z(-548),216*sx,192*sz);
  mg.fillStyle='#22252b';mg.fillRect(X(-250),Z(-467),200*sx,30*sz);   // المدرج
  /* الطرق */
  mg.fillStyle='#5a6068';
  for(const r of ND.roads)
    mg.fillRect(X(r.x-r.w/2),Z(r.z-r.d/2),Math.max(2,r.w*sx),Math.max(2,r.d*sz));
  /* مسار السباق الدائري */
  mg.strokeStyle='#7a828c';mg.lineWidth=4;mg.beginPath();mg.arc(X(150),Z(-455),100*sx,0,7);mg.stroke();
  /* التقاطعات */
  mg.fillStyle='#8a9099';
  for(const c of cross)mg.fillRect(X(c.x)-1.2,Z(c.z)-1.2,2.4,2.4);
  /* العقارات: أصفر للبيع، برتقالي لفواز، فيروزي لزياد */
  if(ND.PLOTS)ND.PLOTS.forEach((pl,i)=>{
    const st=S.plot[i]||{lv:0,owner:-1};
    mg.fillStyle=st.owner<0?'#ffd54a':(st.owner?'#5eead4':'#ffb347');
    mg.fillRect(X(pl.x-pl.w/2),Z(pl.z-pl.d/2),pl.w*sx,pl.d*sz);
    if(st.lv){mg.fillStyle='#0009';mg.fillRect(X(pl.x)-3.5,Z(pl.z)-3.5,7,7);
      mg.fillStyle='#fff';mg.font='6px sans-serif';mg.textAlign='center';
      mg.fillText(String(st.lv),X(pl.x),Z(pl.z)+2)}
  });
  /* الطائرة */
  if(ND.plane){mg.fillStyle='#fff';mg.fillRect(X(ND.plane.x)-2,Z(ND.plane.z)-2,4,4)}
  /* حلقة نقطة التفاف السباق */
  const cp=ND.raceMark&&ND.raceMark();
  if(cp){mg.strokeStyle='#ff3df0';mg.lineWidth=2;mg.beginPath();mg.arc(X(cp.x),Z(cp.z),5,0,7);mg.stroke()}
  /* اللاعبون مع اتجاههم */
  ND.PL.slice(0,S.players).forEach((p,i)=>{
    mg.fillStyle=i?'#5eead4':'#ffb347';
    mg.strokeStyle=mg.fillStyle;mg.lineWidth=2;
    mg.beginPath();mg.moveTo(X(p.x),Z(p.z));
    mg.lineTo(X(p.x+Math.sin(p.cy)*9),Z(p.z+Math.cos(p.cy)*9));mg.stroke();
    mg.beginPath();mg.arc(X(p.x),Z(p.z),4.5,0,7);mg.fill();
  });
};
})();
