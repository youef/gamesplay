/* Dedicated campus sports precinct. Lightweight static Three.js architecture. */
(function(root){
"use strict";
function visitorZone(ST,x,z,radius=0){
 const dx=Math.abs(x-ST.x),dz=Math.abs(z-ST.z);
 return dx-radius>=35&&(dx<=94&&dz+radius<=7||dx+radius<=43&&dz+radius<=54);
}
function buildCampusStadiumPrecinct({THREE,scene,ST,mat,lab,COL}){
 const root=new THREE.Group();root.name="Campus Stadium Sports Precinct";scene.add(root);
 const material={
  path:mat(0xc0c9c9,{roughness:.94}),plaza:mat(0xdfd4ba,{roughness:.89}),
  border:mat(0x365e72,{roughness:.78}),gold:mat(0xe6b933,{roughness:.52}),
  road:mat(0x353f48,{roughness:.98}),green:mat(0x3c704e,{roughness:1}),
  curb:mat(0xf3efe1,{roughness:.92}),steel:mat(0x627987,{metalness:.6,roughness:.47}),
  dark:mat(0x1e3645,{metalness:.24,roughness:.53}),glass:mat(0x83c3d3,{transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide}),
  lamp:mat(0xe8f3ff,{emissive:0xb6e0fc,emissiveIntensity:.55}),
  wood:mat(0x95724a,{roughness:.76})
 };
 function cube(w,h,d,m,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=false;
  root.add(mesh);return mesh;
 }
 const cx=ST.x,cz=ST.z;
 const pz=cz-132;
 // Curved pedestrian promenade follows the same fourth-power silhouette as the stadium.
 const vertices=[],indices=[],segments=96;
 function shape(a,rx,rz){
  const co=Math.cos(a),si=Math.sin(a);
  return [cx+rx*Math.sign(co)*Math.sqrt(Math.abs(co)),cz+rz*Math.sign(si)*Math.sqrt(Math.abs(si))];
 }
 for(let i=0;i<=segments;i++){
  const a=i*Math.PI*2/segments,inner=shape(a,96,98),outer=shape(a,114,116);
  vertices.push(inner[0],.092,inner[1],outer[0],.092,outer[1]);
  if(i<segments){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2)}
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
 geo.setIndex(indices);geo.computeVertexNormals();
 const walk=new THREE.Mesh(geo,material.path);walk.receiveShadow=true;root.add(walk);
 // Main northern event plaza: independent of other campus buildings and roads.
 cube(144,.14,70,material.plaza,cx,.085,pz);
 cube(146,.22,1.1,material.border,cx,.17,pz-35);
 for(const side of [-1,1]){
  cube(1.1,.25,70,material.border,cx+side*72,.17,pz);
  // Two information/ticket booths at the outer edges of the plaza.
  const bx=cx+side*60,bz=pz+10;
  cube(8,3.4,6.5,material.dark,bx,1.75,bz);
  cube(8.2,.24,7,material.gold,bx,3.57,bz);
  cube(5.9,1.65,.11,material.glass,bx,2.12,bz-3.3);
  COL.push([bx-4,bz-3.25,bx+4,bz+3.25]);
  for(const dx of [-23,-16,-9]){
   cube(5.2,.44,1.25,material.wood,cx+side*dx,.52,pz+17);
  }
 }
 // Clear axial path leading from the parking/campus access road to the north gate.
 cube(13,.12,19,material.path,cx,.13,pz-44);
 for(const side of [-1,1]){
  cube(.22,.1,63,material.gold,cx+side*10,.22,pz);
  // Keep a wide, direct route down the middle of the square.
  cube(2.5,.08,2.5,material.green,cx+side*45,.17,pz+26);
  for(const offset of [-27,5,29]){
   const x=cx+side*64,z=pz+offset;
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,6,6),material.steel);
   stem.position.set(x,3.1,z);root.add(stem);
   cube(2.5,.35,1.2,material.lamp,x,6.3,z);
  }
 }
 // Public seating remains in the plaza; entry to the bowl is through spectator mode.
 for(const side of [-1,1])for(const dz of [-24,-10,16]){
  const x=cx+side*32,z=pz+dz;
  cube(4.5,.22,1.15,material.wood,x,.64,z);
  cube(4.5,.72,.16,material.dark,x,1.02,z+.55);
  for(const dx of [-1.6,1.6])cube(.2,.6,.16,material.steel,x+dx,.33,z);
 }
 // Separate marked parking lot with pedestrian access; no parking on the pitch.
 const parkingX=cx+122,parkingZ=pz+4;
 cube(80,.12,36,material.road,parkingX,.09,parkingZ);
 cube(82,.2,.9,material.border,parkingX,.17,parkingZ+18);
 for(let i=0;i<9;i++){
  const x=parkingX-34+i*8.2;
  for(const z of [parkingZ-16,parkingZ+16])
   cube(.17,.025,4.2,material.curb,x,.178,z);
 }
 cube(14,.1,22,material.path,cx+77,.19,pz+4);
 // Crosswalk aligned with the plaza and sports access road.
 for(let i=0;i<7;i++)cube(1.1,.02,4,material.curb,cx-6+i*2,.17,pz-38);
 // Spectator gate landmark — visible from the plaza.
 for(const sx of [-21,21]){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.27,.4,9,8),material.steel);
  pole.position.set(cx+sx,4.5,pz+33);root.add(pole);
  cube(3.8,.6,1,material.gold,cx+sx,8.8,pz+33);
 }
 cube(46,.55,1.3,material.dark,cx,9,pz+33);
 const gateLabel=lab("بوابة الملعب • المدرجات","#1b4561",2.7);
 gateLabel.position.set(cx,10.5,pz+33);
 const welcome=lab("ساحة الملعب الرياضية","#1e4c62",2.6);
 welcome.position.set(cx,6.3,pz-22);
 const parkingLabel=lab("مواقف الملعب","#1d4762",1.9);
 parkingLabel.position.set(parkingX,4.3,parkingZ+13);
 // Actual visitor tunnels pass under the tiers to a fenced, playable touchline gallery.
 for(const side of [-1,1]){
  const x=cx+side*65;
  cube(61,.14,14,material.path,x,.08,cz);
  for(const offset of [-7.35,7.35]){
   cube(52,2.7,.34,material.dark,x+side*4,1.35,cz+offset);
   cube(52,.08,.3,material.lamp,x+side*4,2.71,cz+offset);
   const wall=[x-30,cz+offset-.17,x+30,cz+offset+.17];
   // Keep the gallery's two exits open at the inner end of the tunnel.
   if(side<0)wall[2]-=8;else wall[0]+=8;
   COL.push(wall);
  }
  cube(7.6,.16,108,material.path,cx+side*39.3,.22,cz);
  cube(.15,1.16,108,material.steel,cx+side*35.34,.7,cz);
  cube(.14,.11,108,material.gold,cx+side*35.34,1.33,cz);
  for(let z=-50;z<=50;z+=10)cube(.2,1.1,.22,material.steel,cx+side*35.34,.7,cz+z);
  const entrance=lab(side===1?"الممر الشرقي • دخول المشجعين":"الممر الغربي • دخول المشجعين","#145150",2.3);
  entrance.position.set(cx+side*98,6,cz);
  const sign=lab("الممر الأرضي • مشاهدة الملعب","#174459",1.5);
  sign.position.set(cx+side*54,3.7,cz);
  for(const offset of [-1.55,1.55]){
   const bx=cx+side*93,bz=cz+offset;
   cube(.32,1.05,.32,material.dark,bx,.54,bz);cube(.34,.13,.34,material.gold,bx,1,bz);
   COL.push([bx-.16,bz-.16,bx+.16,bz+.16]);
  }
 }
 for(const side of [-1,1]){
  const x=cx+side*48,z=pz-11;
  cube(14,4,5.2,material.dark,x,2,z);
  cube(14.5,.18,5.7,material.gold,x,4.1,z);
  cube(12,1.9,.2,material.glass,x,2.55,z-2.67);
  COL.push([x-7,z-2.6,x+7,z+2.6]);
  const banner=lab(side===1?"متجر المشجعين":"مقهى المدرّج","#235560",2);
  banner.position.set(x,5.2,z-3.1);
 }
 // Lightweight landscape planters kept away from the continuous central route.
 const trunk=material.wood,leaf=material.green;
 for(const side of [-1,1])for(const zOffset of [-25,-4,23]){
  const x=cx+side*81,z=pz+zOffset;
  cube(6,.42,6,material.border,x,.29,z);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.19,.25,2.4,7),trunk);
  stem.position.set(x,1.6,z);root.add(stem);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(2,4,7),leaf);
  crown.position.set(x,4.6,z);root.add(crown);
 }
 return {plaza:{x:cx,z:pz},parking:{x:parkingX,z:parkingZ},footprint:{cx,cz,halfWidth:135,north:177,south:123},
  visitorZone:(x,z,r)=>visitorZone(ST,x,z,r),
  heightAt:(x,z)=>visitorZone(ST,x,z)?Math.abs(x-cx)<=43?.3:.15:null};
}
root.buildCampusStadiumPrecinct=buildCampusStadiumPrecinct;
if(typeof module!=='undefined')module.exports={visitorZone};
})(typeof window==='undefined'?globalThis:window);
