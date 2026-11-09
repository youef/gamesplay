/* Shared road geometry for the world, map, editor and collision checks. */
(function(root){
 'use strict';
 function plan(){
  const roads=[];
  const add=(x1,z1,x2,z2,width,kind)=>roads.push({x1,z1,x2,z2,width,kind});
  const h=(z,x1,x2,width=16,kind='street')=>add(x1,z,x2,z,width,kind);
  const v=(x,z1,z2,width=16,kind='street')=>add(x,z1,x,z2,width,kind);
  for(const z of [-2450,-880,800,2450])h(z,-2450,2450,26,'arterial');
  for(const x of [-2450,-820,820,2450])v(x,-2450,2450,26,'arterial');

  // Connect to the actual lanes through the four campus gates.
  h(-88,-820,-260,18,'collector');
  h(-164,508,820,18,'collector');
  v(-9,-880,-260,18,'collector');
  v(-109,260,800,18,'collector');

  // Arar road, King Fahd neighbourhood, and the airport's landside frontage.
  h(20,-820,-260,12);v(-260,-88,20,12);
  for(const z of [-22,82])h(z,-525,-295,10);
  for(const x of [-525,-295])v(x,-22,82,10);
  v(600,-265,-164,16);h(-265,462,600,14);v(560,-164,-130,12);

  // Heritage and innovation blocks leave a street behind every front garden.
  for(const z of [-1430,-1320,-1220,-1120,-1020,-920])h(z,-1700,-1025);
  for(const x of [-1700,-1025])v(x,-1430,-880,18,'collector');
  v(-1350,-920,-680,18);
  for(const z of [-1555,-1430,-1290,-1150,-1000])h(z,1000,1750,18);
  for(const x of [1000,1450,1750])v(x,-1555,-880,20,'collector');
  v(1400,-880,-800,16);

  v(-1600,800,1475);h(1475,-1600,-1180);v(-1250,1370,1475,14);
  v(1300,800,1380,18);
  v(-115,-2450,-2095,18);h(-2095,-115,0,16);

  v(0,800,2450,24,'collector');
  for(const x of [-620,620])v(x,1680,2450,18,'collector');
  for(const z of [1680,1790,1890,1990,2090,2190,2290])h(z,-620,620,16);

  // District approaches end at the boundary of their pedestrian grounds.
  h(480,820,1400,18);v(1400,390,560,14);h(560,1400,1840,14);v(1840,560,800,16);
  v(-1480,-2450,-1930);v(-1310,-2280,-1930);
  for(const x of [-1650,-1150])v(x,-2280,-1930);
  for(const z of [-2280,-1930])h(z,-1650,-1150,18);
  h(-2040,-1480,-1310,16);
  h(2100,820,1120,24);v(1050,2100,2176);v(970,2035,2100,18);
  return roads;
 }
 function bounds(road,pad=0){
  const h=road.z1===road.z2,half=road.width/2+pad;
  return [Math.min(road.x1,road.x2)-(h?0:half),Math.min(road.z1,road.z2)-(h?half:0),
   Math.max(road.x1,road.x2)+(h?0:half),Math.max(road.z1,road.z2)+(h?half:0)];
 }
 const overlaps=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 function contains(road,x,z,pad=0){
  const [l,n,r,s]=bounds(road,pad);
  return x>=l-pad&&x<=r+pad&&z>=n-pad&&z<=s+pad;
 }
 function intersectsFootprint(road,x,z,w,d){
  const footprint=[x-w/2,z-d/2,x+w/2,z+d/2];
  if(road.x1===road.x2||road.z1===road.z2)return overlaps(bounds(road),footprint);
  // Separating axes for an oblique road and an axis-aligned building footprint.
  const dx=road.x2-road.x1,dz=road.z2-road.z1,length=Math.hypot(dx,dz);
  const u=dx/length,v=dz/length,px=x-(road.x1+road.x2)/2,pz=z-(road.z1+road.z2)/2;
  const l=length/2,t=road.width/2;
  return Math.abs(px)<Math.abs(u)*l+Math.abs(v)*t+w/2&&Math.abs(pz)<Math.abs(v)*l+Math.abs(u)*t+d/2&&
   Math.abs(px*u+pz*v)<l+Math.abs(u)*w/2+Math.abs(v)*d/2&&
   Math.abs(px*v-pz*u)<t+Math.abs(v)*w/2+Math.abs(u)*d/2;
 }
 function subtract(a,b){
  if(!overlaps(a,b))return [a];
  const [l,n,r,s]=a,x=Math.max(l,b[0]),z=Math.max(n,b[1]),xx=Math.min(r,b[2]),zz=Math.min(s,b[3]);
  return [[l,n,x,s],[xx,n,r,s],[x,n,xx,z],[x,zz,xx,s]].filter(p=>p[2]>p[0]&&p[3]>p[1]);
 }
 function roadTiles(roads){
  const used=[];
  return roads.map(road=>{
   const rectangle=bounds(road);
   const tiles=used.reduce((parts,other)=>parts.flatMap(p=>subtract(p,other)),[rectangle]);
   used.push(rectangle);
   return {road,tiles};
  });
 }
 const api={plan,bounds,contains,overlaps,intersectsFootprint,roadTiles};
 root.HorizonsRoads=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
