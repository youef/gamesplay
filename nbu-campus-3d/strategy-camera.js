/* Pure sizing / gesture math for a touch-friendly strategic campus camera. */
(function(){
"use strict";
const MIN_HEIGHT=75,MAX_HEIGHT=6200;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function fit(world,width,height,fovDegrees=60,padding=90){
 if(!world||![world.minX,world.maxX,world.minZ,world.maxZ].every(Number.isFinite))
  throw Error("Invalid strategy world bounds");
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const fov=clamp(Number(fovDegrees)||60,25,100)*Math.PI/180;
 const vf=Math.tan(fov/2),aspect=w/h;
 const worldW=Math.max(1,world.maxX-world.minX+2*padding);
 const worldH=Math.max(1,world.maxZ-world.minZ+2*padding);
 return {
  x:(world.minX+world.maxX)/2,
  z:(world.minZ+world.maxZ)/2,
  height:clamp(Math.max(worldW/(2*vf*aspect),worldH/(2*vf))*1.055,MIN_HEIGHT,MAX_HEIGHT)
 };
}
function pan(center,dx,dy,height,screenHeight,fovDegrees=60,tilted=false,world){
 if(!center||![dx,dy,height].every(Number.isFinite))return center;
 const factor=2*Math.max(MIN_HEIGHT,height)*Math.tan((fovDegrees||60)*Math.PI/360)/Math.max(1,screenHeight);
 const pitchScale=tilted?1.2:1;
 const x=center.x-dx*factor,z=center.z-dy*factor*pitchScale;
 return world?{x:clamp(x,world.minX,world.maxX),z:clamp(z,world.minZ,world.maxZ)}:{x,z};
}
function zoom(height,ratio){
 if(!Number.isFinite(ratio)||ratio<=0)return clamp(height,MIN_HEIGHT,MAX_HEIGHT);
 return clamp(height*ratio,MIN_HEIGHT,MAX_HEIGHT);
}
function gestureMidpoint(points){
 if(!points||points.length<2)return null;
 return {x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2,
  gap:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)};
}
window.CampusStrategyCamera={MIN_HEIGHT,MAX_HEIGHT,fit,pan,zoom,gestureMidpoint};
})();