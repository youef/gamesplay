/* In-game flyovers: sloped access ramps, elevated ring junction and live driving height. */
(function(){
"use strict";
function elevation(t,length){return .24+Math.min(5.7,Math.min(t,1-t)*length*.105)}
window.CampusBridgeKit=function({THREE,part,mat}){
 function section(group,p,q,width,color,rails){
  const dx=q.x-p.x,dz=q.z-p.z,dy=q.y-p.y,run=Math.hypot(dx,dz);
  if(run<.01)return;
  const a=Math.atan2(dx,dz),slope=-Math.atan2(dy,run);
  const deck=part(group,width,.38,run,color,(p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2);
  deck.rotation.set(slope,a,0,"YXZ");
  if(rails){
   for(const side of [-1,1]){
    const rail=part(group,.25,1.1,run,0xe0bd69,
      (p.x+q.x)/2+Math.cos(a)*side*(width/2-.3),
      (p.y+q.y)/2+.7,(p.z+q.z)/2-Math.sin(a)*side*(width/2-.3));
    rail.rotation.set(slope,a,0,"YXZ");
   }
  }
 }
 function buildFlyover(group,length,width,curve){
  const segments=Math.max(12,Math.ceil(length/4)),bend=curve?Math.min(28,length*.21):0;
  const at=t=>({x:bend*Math.sin(t*Math.PI),z:(t-.5)*length,y:elevation(t,length)});
  for(let k=0;k<segments;k++)section(group,at(k/segments),at((k+1)/segments),width,0x748a97,true);
  for(let t=.16;t<.89;t+=.18){
   const p=at(t);if(p.y<1.6)continue;
   for(const side of [-1,1])part(group,.8,p.y-.3,.8,0xb0bdc2,p.x+side*(width/2-1),p.y/2-.2,p.z);
  }
 }
 function buildCircle(group){
  const radius=26,width=10,segments=48,ringHeight=5.9;
  for(let i=0;i<segments;i++){
   const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
   section(group,{x:radius*Math.cos(a),z:radius*Math.sin(a),y:ringHeight},
    {x:radius*Math.cos(b),z:radius*Math.sin(b),y:ringHeight},width,0x788f9a,true);
  }
  for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
   const x=Math.cos(angle),z=Math.sin(angle);
   for(let k=0;k<9;k++){
    const a=radius+k*5,b=radius+(k+1)*5;
    section(group,{x:x*a,z:z*a,y:ringHeight-k*5.65/9},
     {x:x*b,z:z*b,y:ringHeight-(k+1)*5.65/9},width,0x748a97,true);
   }
   part(group,1,ringHeight-.5,1,0xa9b4bc,x*radius,(ringHeight-.5)/2,z*radius);
  }
  const island=new THREE.Mesh(new THREE.CylinderGeometry(14,14,.45,24),mat(0x4a8c65));
  island.position.y=.25;group.add(island);
 }
 function heightAt(x,z,objects){
  let result=0;
  for(const o of objects){
   if(["bridge","flyover"].includes(o.type)&&o.end){
    const dx=o.end.x-o.x,dz=o.end.z-o.z,len=Math.hypot(dx,dz);
    if(len<1)continue;
    const t=Math.max(0,Math.min(1,((x-o.x)*dx+(z-o.z)*dz)/(len*len)));
    const bend=o.type==="flyover"?Math.min(28,len*.21)*Math.sin(t*Math.PI):0;
    const nx=dz/len,nz=-dx/len;
    const xx=o.x+t*dx+nx*bend,zz=o.z+t*dz+nz*bend;
    if(Math.hypot(x-xx,z-zz)<=6)result=Math.max(result,elevation(t,len)-.25);
   }
   if(o.type==="bridgeCircle"){
    const dx=x-o.x,dz=z-o.z,r=Math.hypot(dx,dz);
    if(Math.abs(r-26)<=5.7)result=Math.max(result,5.6);
    const a=Math.min(Math.abs(dx),Math.abs(dz));
    if(r>=26&&r<=71&&a<5.7)result=Math.max(result,.25+(71-r)/45*5.5);
   }
  }
  return result;
 }
 return {buildFlyover,buildCircle,heightAt,elevation};
};
})();