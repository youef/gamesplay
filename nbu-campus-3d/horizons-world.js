/* آفاق الشمال — original, deterministic world and character kit. Three.js r128. */
(function(root){
 'use strict';
 const Roads=root.HorizonsRoads||(typeof module!=='undefined'?require('./horizons-roads.js'):null);
 const bounds={minX:-3000,maxX:3000,minZ:-3000,maxZ:3000,buildMinX:-2900,buildMaxX:2900,buildMinZ:-2900,buildMaxZ:2900};
 const destinations=[
  {id:'campus',name:'الحرم الجامعي',tag:'حيث بدأت الحكاية',x:0,z:-188,color:'#d2bb84',icon:'⌂'},
  {id:'heritage',name:'حي الطين',tag:'أروقة السوق والعمارة الشمالية',x:-1350,z:-680,color:'#cf9d72',icon:'▥'},
  {id:'innovation',name:'مدينة الابتكار',tag:'أبراج زجاجية وساحات مفتوحة',x:1400,z:-800,color:'#84babb',icon:'▤'},
  {id:'oasis',name:'واحة السدر',tag:'ماء ونخيل وممرات خضراء',x:-1250,z:1332,color:'#87b79c',icon:'♧'},
  {id:'reserve',name:'محمية الصخر',tag:'صخور منحوتة ومسارات صحراوية',x:1300,z:1380,color:'#dcac83',icon:'△'},
  {id:'observatory',name:'مرصد الشمال',tag:'قبة فلكية عند الأفق',x:0,z:-2095,color:'#b6bdca',icon:'✦'},
  {id:'gardens',name:'ضاحية الروابي',tag:'بيوت وحدائق ومتنزه مركزي',x:0,z:2290,color:'#b8c987',icon:'❀'},
  {id:'social',name:'ساحة النخيل',tag:'مقاهٍ ومحلات ونافورة وممرات',x:1407,z:350,color:'#8dbeb2',icon:'♧'},
  {id:'hotel',name:'فندق الأفق',tag:'بهو ومسبح على السطح وألعاب نارية',x:-1400,z:-2040,color:'#c7aa82',icon:'▥'},
  {id:'circuit',yaw:0,name:'حلبة الأفق والمرآب',tag:'سباق وتفحيط واختيار المركبة',x:1050,z:2170,color:'#72bed6',icon:'ϟ'},
  {id:'training',name:'ميدان التدريب',tag:'جرّب حركة الشخصية والتصويب',x:1840,z:520,color:'#d79871',icon:'◎'},
  {id:'stadium',yaw:Math.PI,name:'ملعب الجامعة',tag:'ساحة الجماهير والممرات والمدرجات',x:365,z:-133,color:'#d3ac57',icon:'⚽'},
  {id:'meet',yaw:0,name:'ملتقى التفحيط',tag:'جمهور ومعرض سيارات وعروض انزلاق',x:970,z:2045,color:'#d99a72',icon:'≋'},
  {id:'spring',yaw:0,name:'ربيع الشمال',tag:'بحيرة ومرج ومخيمات على الماء',x:-1810,z:1904,color:'#80a670',icon:'❀'}
 ];
 function random(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 function createWorld({THREE:T,scene,renderer}){
  const rng=random(96),textureLoader=new T.TextureLoader(),chunks=new Map(),colliders=new Map(),roads=Roads.plan(),accesses=[],markers=[],npcs=[];
  const unitBox=new T.BoxGeometry(1,1,1),unitSphere=new T.IcosahedronGeometry(1,1),trunkGeo=new T.CylinderGeometry(.18,.28,1,7),leafGeo=new T.BufferGeometry(),dummy=new T.Object3D();
  const leafVertices=[],leafIndices=[];
  for(let i=0;i<=10;i++){const f=i/10,w=Math.sin(f*Math.PI)*.48,y=Math.sin(f*Math.PI)*.55-f*f;leafVertices.push(-w,y,f*4.8,w,y,f*4.8);if(i<10){const j=i*2;leafIndices.push(j,j+1,j+2,j+1,j+3,j+2);}}
  leafGeo.setAttribute('position',new T.Float32BufferAttribute(leafVertices,3));leafGeo.setIndex(leafIndices);leafGeo.computeVertexNormals();
  const materials={},counts={buildings:0,trees:0,rocks:0,roads:0},landmarkRoots=[];
  function material(name,color,tex,extra){const o={color,roughness:.88,...extra};if(tex){o.map=textureLoader.load('./assets/'+tex+'.png');o.map.wrapS=o.map.wrapT=T.RepeatWrapping;o.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());o.map.encoding=T.sRGBEncoding;}return materials[name]=new T.MeshStandardMaterial(o);}
  material('sand',0xffffff,'sand');material('stone',0xffffff,'stone');material('plaster',0xf3e6c9,'stone');material('clay',0xc39370,'stone');material('clayDark',0xa57557,'stone');material('white',0xf7f0de);material('teal',0x315e59);material('glass',0x89bdc1,null,{roughness:.23,metalness:.28});material('asphalt',0xffffff,'asphalt');material('line',0xece1be);material('centerLine',0xe3be65);material('walk',0xd5c5ab,'stone');material('grass',0xffffff,'grass');material('bark',0xffffff,'bark');material('leaf',0x537b52,null,{side:T.DoubleSide});material('leafLight',0x789459,null,{side:T.DoubleSide});material('rock',0xb78c68,'stone');material('metal',0x374b4d,null,{metalness:.5,roughness:.45});material('water',0x479caa,null,{roughness:.24,metalness:.25});
  materials.sand.map.repeat.set(600,600);materials.asphalt.map.repeat.set(4,24);materials.grass.map.repeat.set(12,12);materials.stone.map.repeat.set(3,3);
  function chunk(x,z){const key=Math.floor(x/500)+','+Math.floor(z/500);if(!chunks.has(key)){const g=new T.Group();g.name='horizons-chunk-'+key;scene.add(g);chunks.set(key,{g,x:Math.floor(x/500)*500+250,z:Math.floor(z/500)*500+250,batches:new Map()});}return chunks.get(key);}
  function inst(geo,mat,x,y,z,sx,sy,sz,ry=0,rz=0){const c=chunk(x,z),key=geo.uuid+':'+mat;let b=c.batches.get(key);if(!b)c.batches.set(key,b={geo,mat:materials[mat],items:[]});b.items.push([x,y,z,sx,sy,sz,ry,rz]);}
  function box(mat,x,y,z,w,h,d,ry=0){inst(unitBox,mat,x,y,z,w,h,d,ry);}
  function block(x,z,w,d){const a=[x-w/2,z-d/2,x+w/2,z+d/2];for(let ix=Math.floor(a[0]/100);ix<=Math.floor(a[2]/100);ix++)for(let iz=Math.floor(a[1]/100);iz<=Math.floor(a[3]/100);iz++){const key=ix+','+iz;if(!colliders.has(key))colliders.set(key,[]);colliders.get(key).push(a);}}
  function blocked(x,z,r=1.05){const found=new Set();for(let ix=Math.floor((x-r)/100);ix<=Math.floor((x+r)/100);ix++)for(let iz=Math.floor((z-r)/100);iz<=Math.floor((z+r)/100);iz++)for(const b of colliders.get(ix+','+iz)||[]){if(found.has(b))continue;found.add(b);if(x+r>b[0]&&x-r<b[2]&&z+r>b[1]&&z-r<b[3])return true;}return false;}
  function sweep(x0,z0,x1,z1,r){const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/2));for(let i=1;i<=steps;i++)if(blocked(x0+(x1-x0)*i/steps,z0+(z1-z0)*i/steps,r))return true;return false;}
  const isRoad=(x,z,padding=0)=>roads.some(road=>Roads.contains(road,x,z,padding));
  function drawStreets(){
   for(const {road,tiles} of Roads.roadTiles(roads)){
    for(const [l,n,r,s] of tiles){
     const horizontal=r-l>s-n;
     const length=horizontal?r-l:s-n;
     for(let start=0;start<length;start+=160){
      const span=Math.min(160,length-start),mid=start+span/2;
      box('asphalt',horizontal?l+mid:(l+r)/2,.056,horizontal?(n+s)/2:n+mid,
       horizontal?span:r-l,.09,horizontal?s-n:span);
     }
    }
    const horizontal=road.z1===road.z2,start=horizontal?road.x1:road.z1,end=horizontal?road.x2:road.z2;
    const fixed=horizontal?road.z1:road.x1;
    for(let p=start+9;p<end-8;p+=16){
     const x=horizontal?p:fixed,z=horizontal?fixed:p;
     if(roads.some(other=>other!==road&&Roads.contains(other,x,z,6)))continue;
     box(road.kind==='arterial'?'centerLine':'line',x,.108,z,horizontal?6:.23,.016,horizontal?.23:6);
     if(road.width>=18)for(const side of [-1,1]){
      const offset=side*(road.width/2-.55),ex=x+(horizontal?0:offset),ez=z+(horizontal?offset:0);
      if(!roads.some(other=>other!==road&&Roads.contains(other,ex,ez,8)))
       box('line',ex,.108,ez,horizontal?12:.15,.014,horizontal?.15:12);
     }
    }
   }
   counts.roads=roads.length;
   for(const [l,n,r,s] of Roads.sidewalkTiles(roads)){
    const horizontal=r-l>s-n,length=horizontal?r-l:s-n;
    for(let start=0;start<length;start+=130){
     const span=Math.min(130,length-start),mid=start+span/2;
     box('walk',horizontal?l+mid:(l+r)/2,.101,horizontal?(n+s)/2:n+mid,horizontal?span:r-l,.14,horizontal?s-n:span);
    }
   }
  }
  function addAccess(x,z,roadX,roadZ,width=5){
   if(x===roadX&&z===roadZ)return;
   if(x!==roadX&&z!==roadZ)throw Error('Access paths must be axis aligned');
   accesses.push({x,z,roadX,roadZ,width});
   const path=new T.Mesh(unitBox,materials.walk);
   path.position.set((x+roadX)/2,.022,(z+roadZ)/2);
   path.scale.set(x===roadX?width:Math.abs(x-roadX),.075,z===roadZ?width:Math.abs(z-roadZ));
   path.name='entrance-walkway';path.receiveShadow=true;
   // Make late-added paths share the chunk culling of their district.
   chunk(path.position.x,path.position.z).g.add(path);
  }
  function tree(x,z,s=1,palm=false){
   if(isRoad(x,z,5)||accesses.some(a=>Math.abs(x-(a.x+a.roadX)/2)<Math.abs(a.x-a.roadX)/2+a.width/2+2&&Math.abs(z-(a.z+a.roadZ)/2)<Math.abs(a.z-a.roadZ)/2+a.width/2+2))return;counts.trees++;const h=(palm?8:5)*s;
   inst(trunkGeo,'bark',x,h/2,z,s,h,s);
   if(palm){for(let k=0;k<8;k++){const a=k*Math.PI/4;inst(leafGeo,k%2?'leaf':'leafLight',x,h+.4*s,z,s,s,s,a,0);}}
   else {inst(unitSphere,'leaf',x,h+.7*s,z,3.4*s,2.8*s,3*s);inst(unitSphere,'leafLight',x+1.4*s,h+2*s,z-.4*s,2.4*s,2*s,2.5*s);}
   block(x,z,.8*s,.8*s);
  }
  function building(x,z,w,d,h,kind=0){
   counts.buildings++;const wall=kind===1?'clay':kind===2?'white':'plaster';
   box(wall,x,h/2,z,w,h,d);box(kind===2?'teal':'clayDark',x,h+.4,z,w+1,.8,d+1);
   if(kind===1){for(let xx=-w/2;xx<=w/2;xx+=3.8){box('clay',x+xx,h+1.5,z-d/2,1.3,2,1.4);box('clay',x+xx,h+1.5,z+d/2,1.3,2,1.4);}box('clayDark',x,2,z+d/2+.08,2.2,4,.2);}
   else {for(let y=3;y<h-1;y+=4){box('glass',x,y,z+d/2+.09,w-2,2.2,.15);box('glass',x,y,z-d/2-.09,w-2,2.2,.15);box('glass',x-w/2-.09,y,z,.15,2.2,d-2);box('glass',x+w/2+.09,y,z,.15,2.2,d-2);for(let xx=-w/2+3;xx<w/2;xx+=6){box('stone',x+xx,y,z+d/2+.2,.35,2.4,.35);box('stone',x+xx,y,z-d/2-.2,.35,2.4,.35);}}}
   box('teal',x,2,z+d/2+.14,2,4,.3);box('stone',x,.17,z+d/2+3,8,.3,5);box('teal',x,4.5,z+d/2+2,8,.3,5);
   block(x,z,w,d);
  }
  function sign(text,x,z){x+=34;const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#203d3b';g.fillRect(0,0,512,128);g.strokeStyle='#cdb482';g.lineWidth=5;g.strokeRect(7,7,498,114);g.fillStyle='#f5ecd8';g.font='bold 43px Tahoma';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,65,480);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.PlaneGeometry(15,3.75),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));m.position.set(x,4,z);scene.add(m);box('metal',x-6,2,z,.25,4,.25);box('metal',x+6,2,z,.25,4,.25);markers.push(m);}
  function pavilion(x,z){
   box('stone',x,.3,z,48,.6,34);box('teal',x,9,z,51,.8,37);
   for(const dx of [-21,-7,7,21])for(const dz of [-14,14])box('stone',x+dx,4.5,z+dz,1.3,9,1.3);
   for(let i=-24;i<=24;i+=2)box('clayDark',x+i,9.6,z,.45,.5,36);
   for(const dx of [-16,16]){box('clayDark',x+dx,1,z-8,10,1,2);box('clayDark',x+dx,1.8,z-9,10,1.6,.4);}
  }
  // 6 km square, matching the navigation and building limits.
  const ground=new T.Mesh(new T.PlaneGeometry(6200,6200),materials.sand);ground.rotation.x=-Math.PI/2;ground.position.y=-.04;ground.receiveShadow=true;ground.name='horizons-ground';scene.add(ground);
  drawStreets();
  // Heritage neighbourhood: courtyard houses and a shaded market, all original forms.
  for(let r=0;r<5;r++)for(let c=0;c<6;c++){const x=-1625+c*105,z=-1370+r*100;building(x,z,36+rng()*10,34,8+rng()*7,1);addAccess(x,z+17,x,z+50);tree(x+31,z+25,1,true);}
  pavilion(-1280,-760);addAccess(-1304,-760,-1350,-760,8);sign('سوق حي الطين',-1350,-700);
  addAccess(-1460,-700,-1350,-700,6);addAccess(-1240,-700,-1350,-700,6);
  for(let k=0;k<10;k++){const x=-1450+k*22;if(Math.abs(x+1350)<23)continue;addAccess(x,-713,x,-700,4);box(k%2?'teal':'clayDark',-1450+k*22,4,-715,15,.4,12);box('clay',-1450+k*22,1.6,-717,13,3,4);}
  // Innovation district: stepped towers, louvers, solar canopies and a civic plaza.
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=1090+c*145,z=-1500+r*140,h=20+rng()*55;building(x,z,42,44,h,2);box('glass',x+8,h+8,z,24,16,26);addAccess(x,z+22,x,z+(r===3?80:70),7);for(const dx of [-37,-16,16,37])tree(x+dx,z+42,.9);}
  for(let i=-3;i<=3;i++){if(Math.abs(i)===3){box('metal',1400+i*19,6,-830,.4,12,.4);block(1400+i*19,-830,.4,.4);}box('glass',1400+i*19,12,-830,17,.25,25);}
  sign('مدينة الابتكار',1400,-805);
  // Oasis: broad water basin, a completely walkable ring, formal gardens and cafe.
  box('grass',-1250,.03,1200,570,.07,470);
  const lake=new T.Mesh(new T.CircleGeometry(150,64),materials.water);lake.rotation.x=-Math.PI/2;lake.scale.y=.67;lake.position.set(-1250,.16,1200);scene.add(lake);block(-1250,1200,250,165);
  const ring=new T.Mesh(new T.RingGeometry(165,177,64),materials.stone);ring.rotation.x=-Math.PI/2;ring.scale.y=.77;ring.position.set(-1250,.12,1200);scene.add(ring);
  addAccess(-1250,1332,-1250,1370,8);addAccess(-1180,1447,-1180,1475,7);addAccess(-1530,1442,-1530,1475,6);
  for(let i=0;i<100;i++){const a=i*Math.PI*2/100,r=185+rng()*95,x=-1250+Math.cos(a)*r,z=1200+Math.sin(a)*r*.8;tree(x,z,.8+rng()*.6,i%3!==0);}
  for(const dx of [-260,260]){box('grass',-1250+dx,.06,1200,100,.1,430);for(let i=0;i<18;i++)tree(-1250+dx+(rng()-.5)*65,1010+i*22,.85);}
  pavilion(-1180,1430);building(-1530,1430,32,24,7,1);sign('واحة السدر',-1250,1487);
  // Reserve: layered sandstone outcrops kept away from the marked hiking corridors.
  for(let i=0;i<150;i++){let x=940+rng()*800,z=930+rng()*700;if(Math.abs(x-1300)<70||(Math.abs(x-1370)<47&&Math.abs(z-1320)<43))continue;const s=8+rng()*20,h=12+rng()*42;counts.rocks++;inst(unitSphere,'rock',x,h*.48,z,s,h*.55,s*.7,rng()*6);block(x,z,s*1.3,s);}
  pavilion(1370,1320);addAccess(1346,1320,1300,1320,8);sign('محمية الصخر',1300,1395);
  // Observatory and terraced entry square.
  building(0,-2150,70,50,13,2);addAccess(0,-2125,0,-2095,10);const dome=new T.Mesh(new T.SphereGeometry(24,24,12,0,Math.PI*2,0,Math.PI/2),materials.white);dome.position.set(0,13,-2150);scene.add(dome);landmarkRoots.push(dome);box('metal',0,26,-2128,5,19,.5);
  for(const x of [-75,75])for(let z=-2250;z<-2020;z+=28)tree(x,z,1.1);
  sign('مرصد الشمال',0,-2092);
  // Garden city with residential blocks and a large, safe central promenade.
  for(let r=0;r<5;r++)for(let c=0;c<8;c++){const x=-480+c*135,z=1740+r*100;if(Math.abs(x)<85)continue;building(x,z,30,28,7+rng()*8,c%3===0?1:0);addAccess(x,z+14,x,z+50);tree(x+30,z+10,1);for(const side of [-1,1])box('grass',x+side*15,.012,z+30,23,.05,20);}
  pavilion(100,2230);addAccess(100,2247,100,2290,8);sign('ضاحية الروابي',0,2310);
  // Scrubland, dunes and a tree-lined travel network. Seeds keep reloads stable.
  for(let i=0;i<1900;i++){const x=(rng()-.5)*5700,z=(rng()-.5)*5700;if(Math.abs(x)<760&&z>-720&&z<650)continue;if((x>1000&&x<1980&&z>20&&z<650)||(x>-1850&&x<-950&&z>-2420&&z<-1700)||(x>870&&x<2100&&z>1800&&z<2400)||(x>-2075&&x<-1700&&z>1620&&z<1955))continue;if(isRoad(x,z,10)||blocked(x,z,6))continue;tree(x,z,.6+rng()*.9,i%4===0);}
  for(let i=0;i<90;i++){
   const a=rng()*Math.PI*2,r=2650+rng()*160,x=Math.sin(a)*r,z=Math.cos(a)*r,h=20+rng()*55;
   const sx=70+rng()*60,sz=60+rng()*50,angle=rng()*6,margin=Math.max(sx,sz)*2+12;
   if(roads.some(road=>Roads.intersectsFootprint(road,x,z,margin,margin)))continue;
   inst(unitSphere,'sand',x,h*.15,z,sx,h*.5,sz,angle);block(x,z,100,80);
  }
  // Shared instancing within spatial chunks limits draw calls even in a large map.
  for(const c of chunks.values()){for(const b of c.batches.values()){const m=new T.InstancedMesh(b.geo,b.mat,b.items.length);for(let i=0;i<b.items.length;i++){const [x,y,z,sx,sy,sz,ry,rz]=b.items[i];dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,rz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}m.instanceMatrix.needsUpdate=true;m.castShadow=b.mat!==materials.asphalt&&b.mat!==materials.grass;m.receiveShadow=true;m.frustumCulled=false;c.g.add(m);}c.batches.clear();}
  for(const d of destinations)if(d.id!=='campus'){const a=createAvatar(T,['fawaz','zyad','noura'][npcs.length%3]);a.root.position.set(d.x+11,0,d.z-12);scene.add(a.root);npcs.push({a,x:d.x+11,z:d.z-12,phase:rng()*6});}
  let lastCull=-1000;
  function update(t,dt,p,quality,overview,second){
   if(t-lastCull>300){lastCull=t;const range=overview?10000:quality==='low'?650:quality==='high'?1350:1000;for(const c of chunks.values())c.g.visible=Math.hypot(c.x-p.x,c.z-p.z)<range+360||!!second&&Math.hypot(c.x-second.x,c.z-second.z)<range+360;for(const m of markers)m.visible=overview||m.position.distanceTo(p)<700;}
   lake.position.y=.16+Math.sin(t*.0006)*.025;
   for(const n of npcs){n.a.root.visible=!overview&&Math.hypot(n.x-p.x,n.z-p.z)<250;if(n.a.root.visible){n.a.root.position.x=n.x+Math.sin(t*.00015+n.phase)*4;n.a.root.rotation.y=Math.cos(t*.00015+n.phase)>0?Math.PI/2:-Math.PI/2;n.a.animate(t*.002,.25);}}
  }
  return {blocked,sweep,roads,isRoad,addAccess,accesses,destinations,counts,update,materials,addCollider:block};
 }
 const profiles={
  fawaz:{sprint:12.3,fire:166,reload:1720,jump:7.5},
  zyad:{sprint:14.5,fire:205,reload:1650,jump:8.2},
  noura:{sprint:12.9,fire:184,reload:1120,jump:7.5},
 };
 function createAvatar(T,id='fawaz'){
  const root=new T.Group(),arms=[],legs=[],elbows=[],shins=[],hands=[],colors={fawaz:[0xeee7d7,0xb67c54,0xb65a4b],zyad:[0x326b69,0xc48c65,0x263238],noura:[0xc58c64,0xad7656,0xe0d1b5]},p=colors[id]||colors.fawaz;
  const profile=profiles[id]||profiles.fawaz;
  const armor=new T.MeshStandardMaterial({color:{fawaz:0x3f5050,zyad:0x233841,noura:0x674d40}[id]||0x374748,roughness:.7});
  const panel=new T.MeshStandardMaterial({color:{fawaz:0xa78b59,zyad:0x6a9890,noura:0x97663d}[id]||0xa78b59,roughness:.72,metalness:.16});
  const fabric=new T.MeshStandardMaterial({color:p[0],roughness:.95}),skin=new T.MeshStandardMaterial({color:p[1],roughness:.8}),dark=new T.MeshStandardMaterial({color:0x29332f}),accent=new T.MeshStandardMaterial({color:p[2],roughness:1}),gold=new T.MeshStandardMaterial({color:0xd3b677,metalness:.3,roughness:.5}),white=new T.MeshStandardMaterial({color:0xf3ead8});
  function mesh(g,m,x,y,z,parent=root){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
  function box(w,h,d,m,x,y,z,parent){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
  function sphere(r,m,x,y,z){return mesh(new T.SphereGeometry(r,12,8),m,x,y,z);}
  mesh(new T.CylinderGeometry(.25,.36,id==='zyad'?.65:1.05,12),fabric,0,id==='zyad'?1.12:.92,0);
  sphere(.16,skin,0,1.55,0);sphere(.25,skin,0,1.8,.025).scale.set(.86,1.13,.88);
  for(const s of [-1,1]){
   sphere(.05,skin,s*.22,1.8,.025);
   const cheek=sphere(.074,skin,s*.14,1.758,.188);cheek.scale.set(1,.6,.6);
   const eye=sphere(.027,white,s*.082,1.84,.223);eye.scale.set(1,.67,.45);
   sphere(.014,dark,s*.081,1.842,.246);sphere(.005,white,s*.082-.005,1.847,.259);
   const brow=box(.086,.018,.028,dark,s*.082,1.898,.231);brow.rotation.z=s*-.12;
   const arm=new T.Group();arm.position.set(s*.31,1.4,0);root.add(arm);arms.push(arm);
   const shoulder=sphere(.113,armor,0,-.048,0,arm);shoulder.scale.set(.98,1.16,.97);
   mesh(new T.CylinderGeometry(.09,.071,.29,10),fabric,0,-.138,0,arm);
   box(.097,.034,.147,panel,0,-.095,.024,arm);
   const elbow=new T.Group();elbow.position.y=-.267;arm.add(elbow);elbows.push(elbow);
   mesh(new T.CylinderGeometry(.071,.061,.244,10),fabric,0,-.12,0,elbow);
   box(.119,.12,.125,armor,0,-.13,.017,elbow);
   box(.127,.046,.122,panel,0,-.189,.016,elbow);
   const hand=new T.Group();hand.position.set(0,-.278,.007);elbow.add(hand);hands.push(hand);
   const glove=sphere(.076,dark,0,-.026,0,hand);glove.scale.set(.86,1.02,.8);
   sphere(.039,skin,-s*.044,-.025,.045,hand);
   const leg=new T.Group();leg.position.set(s*.14,.64,0);root.add(leg);legs.push(leg);
   mesh(new T.CylinderGeometry(.104,.089,.3,10),id==='zyad'?armor:fabric,0,-.15,0,leg);
   const shin=new T.Group();shin.position.y=-.31;leg.add(shin);shins.push(shin);
   mesh(new T.CylinderGeometry(.09,.078,.28,10),id==='zyad'?armor:fabric,0,-.122,0,shin);
   box(.154,.138,.07,panel,0,-.045,.085,shin);
   box(.191,.126,.283,dark,0,-.257,.049,shin);
   box(.205,.047,.3,armor,0,-.306,.055,shin);
   box(.148,.027,.12,panel,0,-.192,.1,shin);
  }
  sphere(.035,skin,0,1.77,.244).scale.set(.7,1,1.2);box(.1,.016,.02,accent,0,1.685,.207);
  if(id==='fawaz'){
   sphere(.265,white,0,1.94,-.02).scale.set(1,.5,1);box(.42,.37,.1,white,0,1.73,-.2);
   for(let i=0;i<6;i++){box(.025,.35,.012,accent,-.18+i*.07,1.73,-.258);box(.4,.017,.012,accent,0,1.58+i*.06,-.259);}
   const band=mesh(new T.TorusGeometry(.235,.022,6,18),dark,0,1.99,-.02);band.rotation.x=Math.PI/2;
  }else if(id==='zyad'){
   sphere(.26,dark,0,1.965,-.01).scale.set(1,.5,1);box(.08,.17,.25,dark,-.2,1.91,-.025);box(.08,.14,.25,dark,.2,1.92,-.025);box(.38,.48,.17,accent,0,1.12,-.23);for(const s of [-1,1])box(.045,.43,.04,dark,s*.2,1.22,.18);
  }else {
   sphere(.285,accent,0,1.92,-.04).scale.set(1,.8,1);box(.45,.44,.16,accent,0,1.65,-.18);for(const s of [-1,1]){const scarf=box(.13,.5,.25,accent,s*.22,1.68,-.025);scarf.rotation.z=s*.12;}box(.16,.46,.1,accent,.14,1.32,.2);
  }
  // Each expedition kit has an actual vest, belt and individual storage pieces.
  box(.45,.335,.09,armor,0,1.224,.246);
  box(.405,.088,.065,panel,0,1.33,.298);
  for(let i=0;i<3;i++){
   const x=-.151+i*.151;
   box(.12,.153,.077,armor,x,1.139,.303);
   box(.108,.032,.087,panel,x,1.192,.315);
   box(.017,.06,.014,dark,x,1.156,.353);
  }
  mesh(new T.CylinderGeometry(.318,.319,.085,12),armor,0,.95,0);
  for(const x of [-.258,.257])box(.125,.2,.138,armor,x,.944,.111);
  box(.126,.063,.035,gold,0,.951,.33);
  if(id==='fawaz'){
   const beard=sphere(.133,dark,0,1.704,.137);beard.scale.set(1,.59,.68);
   box(.115,.012,.018,skin,0,1.7,.232);
   box(.36,.38,.15,armor,0,1.13,-.236);
  }else if(id==='zyad'){
   for(const x of [-.083,.083])box(.131,.072,.032,panel,x,1.845,.255);
   box(.37,.023,.021,dark,0,1.865,.255);
   box(.14,.245,.066,panel,.146,1.17,-.324);
  }else{
   const wrap=sphere(.153,accent,0,1.61,.089);wrap.scale.set(1.19,.45,.9);
   box(.34,.29,.13,armor,0,1.12,-.252);
   box(.112,.142,.045,panel,.213,1.28,.25);
   box(.017,.22,.025,dark,.214,1.433,.25);
  }
  for(const s of [-1,1]){const cord=box(.018,.4,.018,gold,s*.11,1.15,.26);cord.rotation.z=s*-.3;}
  box(.14,.19,.025,white,0,.91,.32);box(.09,.07,.03,fabric,0,.94,.34);
  root.name='original-avatar-'+id;
  const shadow=new T.Mesh(new T.CircleGeometry(.44,20),new T.MeshBasicMaterial({color:0x233c32,transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;root.add(shadow);
  return {root,arms,legs,elbows,shins,hands,profile,animate(phase,moving=1,running=false){
   const gait=running?.83:.55;
   for(let i=0;i<2;i++){
    const stride=Math.sin(phase+i*Math.PI);
    arms[i].rotation.x=stride*gait*.74*moving;arms[i].rotation.z=0;
    elbows[i].rotation.x=-.15-(running?.67:.28)*moving*Math.max(0,-stride+.32);
    legs[i].rotation.x=-stride*gait*moving;
    shins[i].rotation.x=Math.max(0,stride)*(.2+gait)*moving;
   }
   root.position.y=Math.abs(Math.sin(phase))*(running?.043:.024)*moving;
  }};
 }
 const api={bounds,destinations,random,createWorld,createAvatar};root.Horizons=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
