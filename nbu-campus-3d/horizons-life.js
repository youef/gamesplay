/* The spring campground and the organized drift meetup. */
(function(root){
 'use strict';
 function build({T,scene,world,Builder,mats,sign,collider,bench,lamp,Driving,environment}){
  const meet=new Builder('Drift meetup and viewing stands',1000,1985);
  const spring=new Builder('Northern Spring campground',-1890,1815);
  const rng=root.Horizons.random(428);
  const visitors=[];
  const hair=new T.MeshStandardMaterial({color:0x30282a,roughness:1});
  const skinColors=[0xc98863,0x99654b,0xd6a47c].map(color=>new T.MeshStandardMaterial({color,roughness:.83}));
  const clothing=[0x995c45,0x537777,0xd8bd85,0x535880,0xf1e4c8,0x557146,0x637585].map(color=>new T.MeshStandardMaterial({color,roughness:.91}));
  const shoe=new T.MeshStandardMaterial({color:0x252e2f,roughness:.96});
  const boxGeo=new T.BoxGeometry(1,1,1),headGeo=new T.SphereGeometry(.22,9,7);
  function mesh(parent,geo,material,x,y,z,w=1,h=1,d=1){
   const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
  }
  function person(b,x,z,y,angle,cheer){
   const index=visitors.length,rig=new T.Group(),arms=[],legs=[];
   const shirt=clothing[index%clothing.length],skin=skinColors[index%skinColors.length];
   mesh(rig,boxGeo,shirt,0,1.03,0,.47,.63,.28);
   mesh(rig,headGeo,skin,0,1.56,.022,.94,1.12,.9);
   mesh(rig,headGeo,hair,0,1.68,-.027,.99,.57,.91);
   mesh(rig,boxGeo,hair,0,1.53,.205,.11,.017,.016);
   for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.263,1.28,.012);rig.add(arm);arms.push(arm);
    mesh(arm,boxGeo,shirt,0,-.175,0,.123,.33,.13);mesh(arm,boxGeo,skin,0,-.369,0,.1,.12,.1);
    const leg=new T.Group();leg.position.set(side*.125,.73,0);rig.add(leg);legs.push(leg);
    mesh(leg,boxGeo,index%3===0?shirt:shoe,0,-.33,0,.154,.61,.17);
    mesh(leg,boxGeo,shoe,0,-.671,.045,.16,.12,.26);
   }
   rig.position.set(x,y,z);rig.rotation.y=angle;b.g.add(rig);
   visitors.push({b,x,z,y,angle,rig,arms,legs,cheer,phase:rng()*Math.PI*2,walk:!cheer&&index%3===0});
  }
  function stall(b,x,z,label,color){
   b.box('wood',x,1.22,z,8,2.44,5);b.box(color,x,3.73,z,8.8,.24,5.6);
   b.box('stone',x,1.31,z+2.76,7.5,.22,.91);
   for(const s of [-1,1])b.box('metal',x+s*3.8,2.78,z+2.37,.17,2,.17);
   for(let k=0;k<5;k++)b.box(k%2?'white':color,x+(k-2)*1.62,3.45,z+3.1,1.6,.12,1.66);
   sign(b.g,label,x,3.1,z+2.65,6.6);collider(x,z,8,5);
  }
  // Spectator fences leave the paddock entrance and all road widths clear.
  for(const [x,angle] of [[894,Math.PI/2],[1046,-Math.PI/2]]){
   for(let z=1943;z<=2028;z+=5){
    meet.box('metal',x,.89,z,.22,1.78,.23);
    meet.box('white',x,1.25,z+2.5,.12,.13,4.87);
   }
   meet.box('metal',x,.55,1987,.14,.18,88);collider(x,1987,.24,88);
   const side=x<970?-1:1;
   for(let row=0;row<3;row++){
    const xx=x+side*(4+row*2.1);
    meet.box('roof',xx,.24+row*.29,1985,2.22,.48+row*.58,49);
    meet.box('orange',xx,.56+row*.58,1985,1.9,.13,48.8);
    for(let i=0;i<7;i++)person(meet,xx,1964+i*6.8,.65+row*.58,angle,true);
   }
  }
  meet.box('paving',1081,.06,2045,66,.14,29);
  for(let x=1056;x<=1103;x+=12)meet.box('white',x,.137,2045,.14,.022,20);
  for(const [i,id] of ['lexus','hilux','datsun'].entries()){
   const vehicle=Driving.model(T,id,environment,{traffic:true}),x=1063+i*14,z=2044;
   vehicle.root.position.set(x,.14,z);vehicle.root.rotation.y=Math.PI;meet.g.add(vehicle.root);
   collider(x,z,4.1,7.4);
  }
  stall(meet,1073,2021,'قهوة الحلبة','orange');stall(meet,1094,2021,'التسجيل في الملتقى','mint');
  lamp(meet,1053,2031);lamp(meet,903,1929);
  sign(meet.g,'ملتقى التفحيط',981,7,2043,27,'#ffe1a0','#38312b',Math.PI);
  sign(meet.g,'المدرّجات ←  |  ساحة السائقين ↑',1009,4.4,2052,22,'#ffe1a0','#273b40',Math.PI);
  world.addAccess(1042,2049,970,2049,5.5);world.addAccess(1042,2029,1042,2049,5);
  // Exhibition car slides in its own enclosed demonstration loop.
  const demoX=1095,demoZ=1909;
  const demoPad=new T.Mesh(new T.CircleGeometry(33,56),mats.asphalt);
  demoPad.rotation.x=-Math.PI/2;demoPad.position.set(demoX,.12,demoZ);demoPad.receiveShadow=true;meet.g.add(demoPad);
  for(let i=0;i<28;i++){
   const a=i*Math.PI*2/28,x=demoX+Math.sin(a)*34,z=demoZ+Math.cos(a)*34;
   meet.box(i%2?'white':'orange',x,.47,z,7.5,.94,.68,a+Math.PI/2);collider(x,z,2.2,2.2);
  }
  const demo=Driving.model(T,'datsun',environment,{traffic:true});demo.paint.color.set('#a95d40');
  const demoDust=Driving.trails(T,scene);meet.g.add(demo.root);
  sign(meet.g,'عرض الانزلاق',1095,5.4,1946,17,'#fff1c1','#253d42');
  meet.finish();

  // The camp has its own paved arrival, linked footpaths, tents and a lakefront deck.
  spring.box('grass',-1890,.022,1789,313,.08,221);
  spring.box('paving',-1810,.05,1898,43,.11,32);
  for(let x=-1827;x<=-1793;x+=7)spring.box('white',x,.117,1896,.13,.018,11);
  world.addAccess(-1964,1893,-1810,1893,6);world.addAccess(-1810,1893,-1810,1902,6);
  for(const [i,x] of [-1954,-1923,-1886,-1852,-1818].entries()){
   const z=1854+(i%2)*5,color=i%2?'terracotta':'cream',width=17,d=14,h=5.5;
   spring.box('wood',x,.18,z,width+.7,.36,d+.9);
   for(const side of [-1,1]){
    spring.add('box',color,x+side*width/4,2.9,z,Math.hypot(width/2,h),.15,d+.6,0,-side*Math.atan2(h,width/2));
    spring.box('wood',x+side*width/2,.85,z,.2,1.7,d);
    spring.box('gold',x+side*(width/2+.12),.75,z+d/2,.19,1.5,.19);
   }
   spring.box('wood',x,.68,z-3,9.8,.18,3.8);spring.box('mint',x,.5,z+1,9.8,.18,4);
   spring.box('wood',x,.65,z+d/2,.17,1.3,.17);
   world.addAccess(x,z+d/2,x,1893,3.9);
   for(const side of [-1,1])collider(x+side*width/2,z,.3,d);
   person(spring,x-3.2,z+d/2+2,0,0,false);person(spring,x+3.2,z+d/2+2,0,Math.PI,false);
  }
  const lakeMat=new T.MeshStandardMaterial({color:0x4e9f9c,metalness:.22,roughness:.24,envMap:environment,envMapIntensity:.62});
  const lake=new T.Mesh(new T.CircleGeometry(1,78),lakeMat);lake.rotation.x=-Math.PI/2;
  lake.scale.set(76,53,1);lake.position.set(-1910,.13,1758);spring.g.add(lake);
  const shore=new T.Mesh(new T.RingGeometry(.978,1.048,78),mats.sand);
  shore.rotation.x=-Math.PI/2;shore.scale.copy(lake.scale);shore.position.copy(lake.position);shore.position.y=.102;spring.g.add(shore);
  collider(-1910,1749,127,67);collider(-1948,1789,50,24);collider(-1872,1789,50,24);
  for(let z=1794;z<=1829;z+=.64)spring.box('wood',-1910,.29,z,8.2,.22,.62);
  for(const side of [-1,1])for(let z=1795;z<=1825;z+=5){
   spring.box('wood',-1910+side*4.08,.89,z,.15,1.2,.16);spring.box('wood',-1910+side*4.08,1.49,z+2.5,.14,.15,5.15);
  }
  world.addAccess(-1910,1828,-1910,1893,4);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,x=-1910+Math.cos(a)*102,z=1758+Math.sin(a)*74;
   if(i>1&&i<5)continue;
   spring.cylinder('wood',x,3,z,.32,6);spring.sphere(i%2?'green':'grass',x,6.1,z,3.25,2.72);collider(x,z,1,1);
  }
  const blossom=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),new T.MeshStandardMaterial({color:0xffffff,roughness:.85}),270);
  const flower=new T.Object3D(),pollen=[0xf1c663,0xece1d1,0xbda3c8,0xdb9384].map(c=>new T.Color(c));
  for(let i=0;i<270;i++){
   const a=rng()*Math.PI*2,r=1.045+rng()*.27,x=-1910+Math.cos(a)*76*r,z=1758+Math.sin(a)*53*r;
   flower.position.set(x,.29,z);flower.scale.set(.16+rng()*.19,.12,.21);flower.updateMatrix();
   blossom.setMatrixAt(i,flower.matrix);blossom.setColorAt(i,pollen[i%4]);
  }
  blossom.frustumCulled=false;spring.g.add(blossom);
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8,x=-1910+Math.cos(a)*81,z=1758+Math.sin(a)*58;
   if(i===4)continue;
   for(let j=0;j<5;j++)spring.add('cone','grass',x+j*.32,.42,z,.12,.84+(j%2)*.3,.1,0,(j-2)*.11);
  }
  for(const [x,z] of [[-1960,1822],[-1880,1824],[-1845,1828]]){
   bench(spring,x,z,Math.PI);lamp(spring,x+3,z+2);person(spring,x-2,z+3,0,.9,false);person(spring,x+2,z+5,0,-.85,false);
  }
  stall(spring,-1776,1871,'ضيافة ربيع الشمال','mint');
  sign(spring.g,'ربيع الشمال',-1802,5.8,1909,21,'#fff2cf','#2f543f',Math.PI);
  sign(spring.g,'البحيرة والمخيمات ↑',-1838,3.9,1890,14,'#fff2cf','#2f543f',Math.PI);
  spring.finish();

  function update(t,dt,p,second){
   for(const v of visitors){
    const near=v.b.g.visible&&(Math.hypot(v.x-p.x,v.z-p.z)<125||second&&Math.hypot(v.x-second.x,v.z-second.z)<125);
    v.rig.visible=!!near;if(!near)continue;
    const phase=t*.004+v.phase,wave=Math.sin(phase),step=v.walk?wave*.62:0;
    v.rig.position.set(v.x+(v.walk?Math.sin(t*.00055+v.phase)*1.3:0),v.y+(v.cheer?Math.max(0,wave)*.08:0),v.z);
    v.rig.rotation.y=v.angle+(v.walk?Math.sin(phase*.5)*.26:0);
    for(let i=0;i<2;i++){
     v.arms[i].rotation.x=v.cheer?-1.15+(i?1:-1)*wave*.56:step*(i?1:-1);
     v.arms[i].rotation.z=v.cheer?(i?-.54:.54)*(1+.2*wave):0;
     v.legs[i].rotation.x=step*(i?-1:1);
    }
   }
   if(spring.g.visible){lake.position.y=.131+Math.sin(t*.0011)*.018;lakeMat.roughness=.22+Math.sin(t*.0012)*.047;}
   const active=meet.g.visible&&(Math.hypot(p.x-demoX,p.z-demoZ)<185||second&&Math.hypot(second.x-demoX,second.z-demoZ)<185);
   demo.root.visible=!!active;
   if(active){
    const a=t*.00073,angle=a+Math.PI/2;
    demo.root.position.set(demoX+Math.sin(a)*21,.14,demoZ+Math.cos(a)*21);
    demo.root.rotation.y=angle-.55;
    for(const w of demo.wheels){w.spin.rotation.x+=dt*15.3/w.radius;w.pivot.rotation.y=w.front?-.36:0;}
    demoDust.update(dt,demo.root,{speed:15.3,driving:true,sliding:true,course:angle},true,Driving.fleet.datsun,550);
   }else demoDust.update(dt,demo.root,{speed:0,driving:false,sliding:false,course:0},true,Driving.fleet.datsun,550);
  }
  return {update,visitorCount:visitors.length,heightAt:(x,z)=>Math.abs(x+1910)<=4.1&&z>=1794&&z<=1829?.4:0};
 }
 root.HorizonsLife={build};
 if(typeof module!=='undefined')module.exports=root.HorizonsLife;
})(typeof window==='undefined'?globalThis:window);
