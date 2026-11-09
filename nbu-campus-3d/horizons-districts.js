/* Original detailed social square, rooftop hotel, driving circuit and training range. */
(function(){
 'use strict';
 window.createHorizonsDistricts=function(T,scene,renderer,world){
  let compactPlaza=true;
  function collider(x,z,w,d){if(compactPlaza){x=1400+(x-1400)*.48;z=300+(z-300)*.48;w*=.48;d*=.48;}world.addCollider(x,z,w,d);}
  const loader=new T.TextureLoader(),textures={},mats={},regions=[],lamps=[],targets=[],waters=[],fountainJets=[];
  const cubeFaces=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),grad=g.createLinearGradient(0,0,0,64);grad.addColorStop(0,'#719eaf');grad.addColorStop(.5,'#c7d6d2');grad.addColorStop(.53,'#d4c8b0');grad.addColorStop(1,'#8c9583');g.fillStyle=grad;g.fillRect(0,0,64,64);cubeFaces.push(c);}const environment=new T.CubeTexture(cubeFaces);environment.encoding=T.sRGBEncoding;environment.needsUpdate=true;
  function texture(id,kind){const key=id+kind;if(!textures[key]){const tx=loader.load('./assets/materials/'+id+'-'+kind+'.png');tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(kind==='color')tx.encoding=T.sRGBEncoding;textures[key]=tx;}return textures[key];}
  function material(name,color,tile,extra={}){const options={color,roughness:.82,metalness:0,...extra};if(tile){options.map=texture(tile,'color');options.normalMap=texture(tile,'normal');options.roughnessMap=texture(tile,'roughness');options.normalScale=new T.Vector2(.35,.35);}return mats[name]=new T.MeshStandardMaterial(options);}
  material('paving',0xffffff,'pavers');material('stone',0xffffff,'limestone');material('cream',0xfff8df,'stucco');material('mint',0xa5c7bd,'stucco');material('terracotta',0xc18465,'stucco');material('brick',0xffffff,'brick');material('wood',0xffffff,'wood');material('white',0xf4f1e8);material('green',0x1e493d);material('metal',0x283c3b,null,{roughness:.35,metalness:.65});material('glass',0x8ca9ad,null,{roughness:.1,metalness:.35,envMap:environment,envMapIntensity:.85});material('asphalt',0xffffff,'asphalt');material('grass',0x71885b);material('sand',0xc5b395);material('water',0x176a91,null,{roughness:.14,metalness:.08,transparent:true,opacity:.84,envMap:environment,envMapIntensity:.12});material('pool',0xffffff,'pool');material('roof',0xffffff,'roof');material('gold',0xd4aa62,null,{metalness:.58,roughness:.3});material('orange',0xdf7c45);material('tire',0x1c2324);material('neon',0x79d9ed,null,{emissive:0x42d0ef,emissiveIntensity:1.8});material('window',0xe2c48c,null,{emissive:0xffbf6b,emissiveIntensity:.05,roughness:.3,metalness:.08});material('lamp',0xffe7b5,null,{emissive:0xffd28c,emissiveIntensity:1.5});
  const geometries={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,12,8),cylinder:new T.CylinderGeometry(1,1,1,12),cone:new T.ConeGeometry(1,1,10)};
  class Builder{
   constructor(name,cx,cz){this.g=new T.Group();this.g.name=name;this.cx=cx;this.cz=cz;this.buffers=new Map();scene.add(this.g);regions.push(this);}
   add(kind,mat,x,y,z,w,h,d,ry=0,rz=0){const geo=geometries[kind],p=geo.attributes.position,n=geo.attributes.normal,index=geo.index,a=this.buffers.get(mat)||{p:[],n:[],uv:[]},matrix=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(0,ry,rz)),new T.Vector3(w,h,d)),normal=new T.Matrix3().getNormalMatrix(matrix),pv=new T.Vector3(),nv=new T.Vector3();
    for(let j=0;j<(index?index.count:p.count);j++){const i=index?index.getX(j):j;pv.fromBufferAttribute(p,i).applyMatrix4(matrix);nv.fromBufferAttribute(n,i).applyMatrix3(normal).normalize();a.p.push(pv.x,pv.y,pv.z);a.n.push(nv.x,nv.y,nv.z);const axis=Math.abs(nv.y)>.6?'y':Math.abs(nv.x)>.6?'x':'z';a.uv.push((axis==='x'?pv.z:pv.x)*.5,(axis==='y'?pv.z:pv.y)*.5);}this.buffers.set(mat,a);
   }
   box(mat,x,y,z,w,h,d,ry=0){this.add('box',mat,x,y,z,w,h,d,ry)}
   sphere(mat,x,y,z,r,sy=r){this.add('sphere',mat,x,y,z,r,sy,r)}
   cylinder(mat,x,y,z,r,h,ry=0,rz=0){this.add('cylinder',mat,x,y,z,r,h,r,ry,rz)}
   finish(){for(const [name,a] of this.buffers){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(a.uv,2));geo.computeBoundingSphere();const mesh=new T.Mesh(geo,mats[name]);mesh.castShadow=!['paving','grass','water'].includes(name);mesh.receiveShadow=true;this.g.add(mesh);}this.buffers.clear();}
  }
  function wall(b,mat,x,z,w,d,h,y=0){b.box(mat,x,y+h/2,z,w,h,d);collider(x,z,w,d);}
  function sign(parent,text,x,y,z,width=12,color='#ecdfbd',bg='#1d4238',angle=0){const c=document.createElement('canvas');c.width=1024;c.height=192;const g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.strokeStyle=color;g.lineWidth=3;g.strokeRect(10,10,1004,172);}else{g.shadowColor=color;g.shadowBlur=16;}g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.font='bold 68px Tajawal,Tahoma';g.fillText(text,512,100,970);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.PlaneGeometry(width,width*192/1024),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,toneMapped:false,transparent:!bg,alphaTest:.01}));m.position.set(x,y,z);m.rotation.y=angle;parent.add(m);return m;}
  function bench(b,x,z,ry=0){const p=(dx,dy,dz,w,h,d,mat)=>b.box(mat,x+Math.cos(ry)*dx+Math.sin(ry)*dz,dy,z-Math.sin(ry)*dx+Math.cos(ry)*dz,w,h,d,ry);for(const dx of [-1.1,1.1]){p(dx,.45,0,.13,.9,.85,'metal');p(dx,.95,-.35,.13,1.4,.13,'metal');}for(let i=0;i<5;i++)p(0,.88,-.4+i*.18,2.8,.1,.12,'wood');for(let i=0;i<4;i++)p(0,1.1+i*.18,-.39,2.8,.13,.09,'wood');collider(x,z,3,1.1);}
  function lamp(b,x,z,y=0){b.cylinder('metal',x,y+2.7,z,.075,5.4);b.box('metal',x+.3,y+5.4,z,.8,.1,.18);b.sphere('lamp',x+.65,y+5.23,z,.23,.1);const l=new T.PointLight(0xffd59a,0,24,2);l.position.set(x+.65,y+4.9,z);b.g.add(l);lamps.push(l);}
  function palm(b,x,z,h=11){
   for(let i=0;i<9;i++)b.cylinder('wood',x+Math.sin(i*.13)*.3,h*(i+.5)/9,z,.35-i*.012,h/9+.06);
   b.sphere('green',x,h,z,.65,.4);
   for(let k=0;k<9;k++){const a=k*Math.PI*2/9;for(let i=0;i<12;i++){const f=i/12,l=6*f,yy=h+Math.sin(f*Math.PI)*1.6-f*f*2,w=Math.sin(f*Math.PI)*1.45;for(const side of [-1,1]){const xx=x+Math.sin(a)*l+Math.cos(a)*side*w*.45,zz=z+Math.cos(a)*l-Math.sin(a)*side*w*.45;b.add('box',k%2?'grass':'green',xx,yy,zz,.2,.04,Math.max(.2,w*1.4),a+side*.8);}}}
   b.cylinder('stone',x,.45,z,1.8,.9);b.cylinder('sand',x,.94,z,1.55,.09);collider(x,z,1,1);
  }
  function cafeTable(b,x,z){b.cylinder('metal',x,.65,z,.07,1.3);b.cylinder('wood',x,1.33,z,.9,.1);for(const s of [-1,1]){b.box('wood',x+s*1.5,.65,z,.7,.12,.7);b.box('green',x+s*1.8,1,z,.13,.85,.7);for(const dx of [-.25,.25])for(const dz of [-.25,.25])b.box('metal',x+s*1.5+dx,.3,z+dz,.05,.6,.05);}b.cylinder('cream',x+.2,1.5,z,.12,.25);}
  function umbrella(b,x,z){b.cylinder('metal',x,1.8,z,.045,3.6);b.add('cone','cream',x,3.7,z,3,.8,3);}
  function shop(b,x,z,width,height,style,title){
   const d=17,front=z+d/2;
   b.box('paving',x,.1,z,width,.2,d);
   wall(b,style,x-width/2,z,.35,d,height);wall(b,style,x+width/2,z,.35,d,height);wall(b,style,x,z-d/2,width,.35,height);
   b.box(style,x,8.8,z,width,5.6,d);b.box('stone',x,height+.15,z,width+.6,.35,d+.6);b.box('white',x,6,z,width+.4,.3,d+.4);
   for(const side of [-1,1]){const wx=x+side*width*.29;b.box('glass',wx,2.5,front+.08,width*.3,4.4,.12);b.box('white',wx,4.8,front+.17,width*.32,.14,.18);b.box('white',wx-width*.16,2.5,front+.17,.13,4.7,.2);b.box('white',wx+width*.16,2.5,front+.17,.13,4.7,.2);collider(wx,front,width*.32,.3);}
   b.box('glass',x,2.5,z-d/2+.3,4,4,.1);
   for(const xx of [-width*.27,width*.27]){b.box('glass',x+xx,8.5,front+.09,4.4,3.4,.13);for(const s of [-1,1]){b.box('green',x+xx+s*2.7,8.5,front+.13,.8,3.8,.14);for(let y=7;y<10;y+=.3)b.box('metal',x+xx+s*2.7,y,front+.23,.7,.06,.04);}b.box('white',x+xx,6.75,front+.28,5,.18,.5);}
   sign(b.g,title,x,5.2,front+.24,width-.5);
   for(let i=0;i<12;i++){const aw=b.g; b.box(i%2?'cream':'green',x-width/2+(i+.5)*width/12,4.65,front+1.8,width/12,.12,3.4);b.box(i%2?'cream':'green',x-width/2+(i+.5)*width/12,4.25,front+3.4,width/12,.65,.12);}
   cafeTable(b,x,z+2);b.box('wood',x,1.1,z-5,width-3,2,1.5);b.box('stone',x,2.15,z-5,width-2.8,.15,1.8);
   for(const xx of [-4,0,4]){b.cylinder('metal',x+xx,4.9,z-.5,.025,1.7);b.add('cone','gold',x+xx,4,z-.5,.45,.35,.45);}
  }
  const plaza=new Builder('Palm Courtyard — original district',1400,300);
  plaza.box('paving',1400,.16,300,380,.3,360);plaza.box('stone',1400,.31,300,15,.03,320);
  const shopNames=['قهوة الفناء','دار الكتب','استوديو الشمال','رواق الفن','مخبز الساحة','رحّالة','ورشة الأفق','النخيل'];
  for(let i=0;i<8;i++)shop(plaza,1288+i*32,130,30,12,['cream','mint','terracotta'][i%3],shopNames[i]);
  for(let i=0;i<3;i++){
   // Side facades use narrower shops and leave the centre walkable.
   shop(plaza,1230,230+i*65,29,12,['mint','cream','terracotta'][i],shopNames[(i+3)%8]);
   shop(plaza,1570,230+i*65,29,12,['terracotta','cream','mint'][i],shopNames[(i+5)%8]);
  }
  for(const x of [1280,1520])for(const z of [210,300,410])palm(plaza,x,z,10+(z%3));
  for(const x of [1340,1460])for(const z of [230,370]){bench(plaza,x,z,x<1400?Math.PI/2:-Math.PI/2);lamp(plaza,x+8,z+7);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cafeTable(plaza,1400+Math.cos(a)*95,300+Math.sin(a)*80);if(i%2===0)umbrella(plaza,1400+Math.cos(a)*95,300+Math.sin(a)*80);}
  const fountainBase=new T.Mesh(new T.CylinderGeometry(15,16,.9,48),mats.stone);fountainBase.position.set(1400,.75,300);plaza.g.add(fountainBase);
  const fountainWater=new T.Mesh(new T.CircleGeometry(13.8,48),mats.water);fountainWater.rotation.x=-Math.PI/2;fountainWater.position.set(1400,1.24,300);plaza.g.add(fountainWater);waters.push(fountainWater);collider(1400,300,29,29);
  plaza.cylinder('gold',1400,4.3,300,.25,6);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;plaza.add('cone','gold',1400+Math.sin(a)*2.5,7.1,300+Math.cos(a)*2.5,.22,.2,4,a);}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const jet=new T.Mesh(new T.CylinderGeometry(.055,.1,3.5,6),new T.MeshBasicMaterial({color:0xacf0f4,transparent:true,opacity:.6}));jet.position.set(1400+Math.cos(a)*9,2.8,300+Math.sin(a)*9);jet.rotation.z=Math.cos(a)*.3;plaza.g.add(jet);fountainJets.push(jet);}
  sign(plaza.g,'ساحة النخيل',1400,3.2,463,17);plaza.finish();plaza.g.scale.set(.48,1,.48);plaza.g.position.set(1400*.52,0,300*.52);compactPlaza=false;
  // Access road from the existing east collector, ending before the pedestrian square.
  const access=new Builder('Social district approach',1100,480);access.box('asphalt',1110,.1,480,580,.15,18);access.box('stone',1110,.2,468,580,.35,4);access.box('stone',1110,.2,492,580,.35,4);for(let x=840;x<1390;x+=20)access.box('white',x,.2,480,8,.03,.2);
  access.box('asphalt',1400,.1,430,14,.15,100);access.box('asphalt',1400,.1,520,14,.15,80);access.box('asphalt',1620,.1,560,454,.15,14);access.finish();world.roads.push({x1:820,z1:480,x2:1400,z2:480,width:18},{x1:1400,z1:390,x2:1400,z2:560,width:14},{x1:1400,z1:560,x2:1840,z2:560,width:14});
  // Hotel: physical lobby at ground level and an accessible roof with a safe pool perimeter.
  const hotel=new Builder('Hotel Horizon and skyline',-1400,-2100),roofY=48.4;
  wall(hotel,'cream',-1449,-2100,2,70,48);wall(hotel,'cream',-1351,-2100,2,70,48);wall(hotel,'cream',-1400,-2134,100,2,48);
  for(const x of [-1430,-1370])wall(hotel,'cream',x,-2066,38,2,48);
  hotel.box('paving',-1400,.12,-2100,96,.24,67);hotel.box('glass',-1400,26,-2065,100,42,.15);
  for(let level=1;level<12;level++){hotel.box('white',-1400,level*4,-2064.7,102,.35,.5);for(let x=-1444;x<-1350;x+=8){hotel.box('metal',x,level*4+1.8,-2064.5,.25,3.6,.4);hotel.box('window',x+3,level*4+1.8,-2064.4,5,2.7,.05);}}
  hotel.box('roof',-1400,48,-2100,103,.6,73);hotel.box('paving',-1400,48.32,-2100,99,.04,69);
  for(const z of [-2134,-2066])hotel.box('glass',-1400,49.2,z,100,1.6,.12);for(const x of [-1449,-1351])hotel.box('glass',x,49.2,-2100,.12,1.6,68);
  hotel.box('pool',-1413,48.42,-2105,32,.08,20);for(const z of [-2116,-2094])hotel.box('stone',-1413,48.53,z,35,.1,1);for(const x of [-1430,-1396])hotel.box('stone',x,48.53,-2105,1,.1,21);
  const pool=new T.Mesh(new T.PlaneGeometry(31,19,24,16),mats.water);pool.rotation.x=-Math.PI/2;pool.position.set(-1413,48.68,-2105);hotel.g.add(pool);waters.push(pool);
  for(let i=0;i<6;i++){hotel.box('wood',-1437+i*9,48.9,-2082,2.4,.6,5);hotel.box('mint',-1437+i*9,49.25,-2083.8,2.3,.15,2.6);}
  for(const x of [-1440,-1360])for(const z of [-2126,-2075]){lamp(hotel,x,z,48.4);hotel.cylinder('stone',x,49,-2100,1,1.2);}
  for(const x of [-1380,-1368]){cafeTableRoof(hotel,x,-2120);}
  function cafeTableRoof(b,x,z){const start=new T.Object3D();b.cylinder('metal',x,49.1,z,.05,1.2);b.cylinder('wood',x,49.75,z,1,.1);for(const dz of [-1.6,1.6])b.box('mint',x,49,z+dz,.8,.2,.8);}
  // Lobby furnishings and an elevator alcove.
  hotel.box('wood',-1427,1.1,-2117,15,2.2,2.8);hotel.box('stone',-1427,2.3,-2117,15.5,.2,3);hotel.box('mint',-1425,.7,-2085,12,1,3);hotel.box('mint',-1425,1.5,-2086.5,12,1.8,.5);
  for(const x of [-1410,-1390])hotel.box('glass',x,2.3,-2065.2,4,4.5,.13);
  hotel.box('metal',-1365,2.5,-2117,9,5,.35);hotel.box('gold',-1365,2.6,-2116.7,.08,4.3,.1);
  sign(hotel.g,'فندق الأفق',-1400,7,-2064.5,26,'#fff3c9','#274c48');sign(hotel.g,'H O T E L   H O R I Z O N',-1400,53.2,-2133,58,'#ffcf83',null);sign(hotel.g,'مصعد السطح ↑',-1365,5.9,-2116.5,8);
  for(let i=0;i<30;i++){const a=i*Math.PI*2/30,r=155+(i%4)*32,x=-1400+Math.cos(a)*r,z=-2100+Math.sin(a)*r,h=30+(i*17)%75;hotel.box(i%2?'roof':'mint',x,h/2,z,24,h,25);for(let y=4;y<h;y+=4)for(let dx=-8;dx<=8;dx+=5)if((i+y+dx)%3!==0){hotel.box('window',x+dx,y,z+12.6,2.4,2.1,.08);hotel.box('window',x+dx,y,z-12.6,2.4,2.1,.08);hotel.box('window',x-12.1,y,z+dx,.08,2.1,2.4);hotel.box('window',x+12.1,y,z+dx,.08,2.1,2.4);}collider(x,z,24,25);}
  hotel.finish();world.roads.push({x1:-1480,z1:-2450,x2:-1480,z2:-2040,width:16},{x1:-1480,z1:-2040,x2:-1400,z2:-2040,width:16});
  const hotelRoad=new Builder('Hotel approach',-1400,-2300);hotelRoad.box('asphalt',-1480,.1,-2250,16,.15,400);hotelRoad.box('asphalt',-1440,.11,-2040,96,.15,16);hotelRoad.finish();
  // Circuit ribbon with red/white kerbs and eight visible checkpoint gates.
  const circuit=new Builder('Horizon driving circuit',1500,2100),checkpoints=[];
  const points=[],positions=[],normals=[],uvs=[],N=128,rx=380,rz=210;
  for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;for(const side of [-1,1]){const x=1500+Math.cos(a)*(rx+side*15),z=2100+Math.sin(a)*(rz+side*15);positions.push(x,.12,z);normals.push(0,1,0);uvs.push(side<0?0:3,i*1.6);}}
  const indices=[];for(let i=0;i<N;i++){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);const a=i/N*Math.PI*2;for(const s of [-1,1])circuit.box(i%4<2?'white':'orange',1500+Math.cos(a)*(rx+s*17),.2,2100+Math.sin(a)*(rz+s*17),14,.25,1.4,-a-Math.PI/2);}
  const trackGeo=new T.BufferGeometry();trackGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));trackGeo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));trackGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));trackGeo.setIndex(indices);const track=new T.Mesh(trackGeo,mats.asphalt);track.receiveShadow=true;circuit.g.add(track);
  for(let i=0;i<8;i++){const a=Math.PI+i*Math.PI/4,x=1500+Math.cos(a)*rx,z=2100+Math.sin(a)*rz;checkpoints.push({x,z});for(const s of [-1,1])circuit.box('neon',x+Math.cos(a)*s*17,4,z+Math.sin(a)*s*17,.4,8,.4);circuit.box('metal',x,8,z,34,.3,.3,-a);}
  circuit.box('asphalt',970,.1,2100,300,.15,24);world.roads.push({x1:820,z1:2100,x2:1120,z2:2100,width:24});
  // Garage beside the circuit. The entrance is clear and fully walkable.
  wall(circuit,'roof',1010,2200,1,48,8);wall(circuit,'roof',1090,2200,1,48,8);wall(circuit,'roof',1050,2224,80,1,8);circuit.box('roof',1050,8.3,2200,82,.6,50);circuit.box('paving',1050,.15,2200,80,.3,48);sign(circuit.g,'مرآب الأفق | UPGRADE',1050,6,2175,37,'#bceeff','#253d49');
  for(const x of [1025,1075]){circuit.box('orange',x,1,2215,12,2,2);circuit.box('metal',x,4,2222,16,.3,1);for(let i=0;i<5;i++)circuit.cylinder('tire',x-5+i*2.2,1,2220,.7,.4,0,Math.PI/2);}
  circuit.finish();
  // Training targets are objects, separate from the university and social areas.
  const range=new Builder('Training range',1840,450);range.box('sand',1840,.11,470,120,.12,130);range.box('wood',1840,3.5,415,110,7,.6);collider(1840,415,110,.6);
  for(let i=0;i<7;i++){const x=1795+i*15,z=430+(i%2)*8,g=new T.Group();g.position.set(x,0,z);range.g.add(g);const post=new T.Mesh(new T.BoxGeometry(.2,3,.2),mats.wood);post.position.y=1.5;g.add(post);for(let j=0;j<4;j++){const disk=new T.Mesh(new T.CircleGeometry(1.6-j*.35,24),j%2?mats.white:mats.orange);disk.position.set(0,2.8,.02+j*.015);g.add(disk);}targets.push({root:g,mesh:g.children[1],x,z,down:0});}
  sign(range.g,'ميدان التدريب',1840,4.5,540,20);range.finish();
  // Distant mountain silhouettes add depth without filling the playable centre.
  const mountains=new Builder('Northern mountain silhouettes',0,0),mountainMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
  for(let i=0;i<18;i++){const a=i*Math.PI*2/18,r=4200,x=Math.cos(a)*r,z=Math.sin(a)*r,h=170+(i*47)%190,geo=new T.PlaneGeometry(850,850,22,22);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[];
   for(let j=0;j<p.count;j++){const px=p.getX(j),pz=p.getZ(j),dist=Math.sqrt(px*px+pz*pz)/470,crinkle=Math.sin(px*.025+i)*Math.cos(pz*.019-i)*.13+Math.sin(px*.071+pz*.031)*.045,y=Math.max(-4,(1-Math.min(1,dist))*(h*(1+crinkle)))-10;p.setY(j,y);const c=new T.Color(y>h*.79?0xc6d0ce:y>h*.4?0x778c91:0x9ba99f);colors.push(c.r,c.g,c.b);}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mountain=new T.Mesh(geo,mountainMaterial);mountain.position.set(x,0,z);mountains.g.add(mountain);
  }mountains.always=true;
  // Procedural sky with soft clouds and a night sky, following the player.
  const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{time:{value:0},day:{value:1}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float time;uniform float day;varying vec3 vP;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec3 d=normalize(vP);float h=max(0.,d.y);vec3 daylight=mix(vec3(.78,.84,.82),vec3(.22,.45,.64),pow(h,.55));vec2 p=d.xz/max(.14,h)*1.6+time*.003;float n=noise(p)*.55+noise(p*2.1)*.28+noise(p*4.3)*.17;float cloud=smoothstep(.53,.72,n)*smoothstep(.15,.4,h);daylight=mix(daylight,vec3(.96,.94,.86),cloud*.85);vec3 night=mix(vec3(.045,.07,.12),vec3(.012,.025,.06),h);float stars=step(.997,hash(floor(d.xz/max(.1,h)*600.)))*smoothstep(.12,.5,h);gl_FragColor=vec4(mix(night+stars*.5,daylight,day),1.);
   #include <tonemapping_fragment>
   #include <encodings_fragment>
  }`});const sky=new T.Mesh(new T.SphereGeometry(11000,24,16),skyMaterial);sky.renderOrder=-1000;sky.frustumCulled=false;scene.add(sky);
  let fireUntil=0,fireBurst=-1;const fireCount=700,firePos=new Float32Array(fireCount*3),fireColors=new Float32Array(fireCount*3),fireVel=new Float32Array(fireCount*3),fireLife=new Float32Array(fireCount);firePos.fill(-10000);
  const fireGeo=new T.BufferGeometry();fireGeo.setAttribute('position',new T.BufferAttribute(firePos,3));fireGeo.setAttribute('color',new T.BufferAttribute(fireColors,3));const sparkCanvas=document.createElement('canvas');sparkCanvas.width=sparkCanvas.height=32;const sg=sparkCanvas.getContext('2d'),rad=sg.createRadialGradient(16,16,0,16,16,16);rad.addColorStop(0,'#fff');rad.addColorStop(.2,'#fff9');rad.addColorStop(1,'#fff0');sg.fillStyle=rad;sg.fillRect(0,0,32,32);const sparks=new T.Points(fireGeo,new T.PointsMaterial({size:1.1,map:new T.CanvasTexture(sparkCanvas),vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sparks.frustumCulled=false;scene.add(sparks);
  function fireworks(t){fireUntil=t+24000;}
  function update(t,dt,p,hour,overview,second){
   const day=Math.max(0,Math.min(1,(Math.sin((hour-6)/12*Math.PI)+.12)*1.1)),night=1-day;
   sky.position.copy(p);skyMaterial.uniforms.time.value=t*.001;skyMaterial.uniforms.day.value=day;
   for(const r of regions)r.g.visible=r.always||overview||Math.hypot(r.cx-p.x,r.cz-p.z)<1100||second&&Math.hypot(r.cx-second.x,r.cz-second.z)<1100;
   const nearLights=lamps.filter(l=>l.parent.visible&&l.position.distanceTo(p)<90).sort((a,b)=>a.position.distanceToSquared(p)-b.position.distanceToSquared(p)).slice(0,6);
   for(const l of lamps)l.intensity=nearLights.includes(l)?night*1.8:0;mats.window.emissiveIntensity=.03+night*1.6;mats.lamp.emissiveIntensity=.3+night*2.5;
   for(let i=0;i<fountainJets.length;i++)fountainJets[i].scale.y=.8+Math.sin(t*.002+i)*.15;
   mats.water.color.setHSL(.55,.65,.3+Math.sin(t*.001)*.015);mats.water.emissive.setHex(0x0c7182);mats.water.emissiveIntensity=night*.9;
   for(const target of targets){if(target.down>0)target.down-=dt;target.root.rotation.x+=( (target.down>0?Math.PI/2:0)-target.root.rotation.x)*Math.min(1,dt*8);}
   if(t<fireUntil&&Math.floor(t/1800)!==fireBurst){fireBurst=Math.floor(t/1800);const bx=-1400+(Math.random()-.5)*70,by=75+Math.random()*25,bz=-2100+(Math.random()-.5)*30,color=new T.Color().setHSL(Math.random(),.7,.7);for(let i=0;i<fireCount;i++){const a=Math.random()*Math.PI*2,b=Math.acos(Math.random()*2-1),v=4+Math.random()*15;firePos.set([bx,by,bz],i*3);fireVel.set([Math.cos(a)*Math.sin(b)*v,Math.cos(b)*v,Math.sin(a)*Math.sin(b)*v],i*3);fireLife[i]=1.5+Math.random()*2;fireColors.set([color.r,color.g,color.b],i*3);}fireGeo.attributes.color.needsUpdate=true;}
   sparks.visible=t<fireUntil+4000&&fireUntil>0;if(sparks.visible){for(let i=0;i<fireCount;i++){const j=i*3;if(fireLife[i]<=0){firePos[j+1]=-10000;continue;}fireLife[i]-=dt;fireVel[j+1]-=dt*4;for(let k=0;k<3;k++)firePos[j+k]+=fireVel[j+k]*dt;}fireGeo.attributes.position.needsUpdate=true;}
  }
  return {update,targets,fireworks,checkpoints,garage:{x:1050,z:2170},elevator:{x:-1365,z:-2110},hotelEntrance:{x:-1400,z:-2040},roof:{x:-1400,z:-2074,y:roofY,minX:-1446,maxX:-1354,minZ:-2131,maxZ:-2069},heightAt(x,z){if(x>1308&&x<1492&&z>213&&z<387)return .34;if(x>1010&&x<1090&&z>2175&&z<2225)return .32;if(x>-1448&&x<-1352&&z>-2133&&z<-2067)return .26;if(x>1780&&x<1900&&z>405&&z<535)return .19;return 0;},roofBlocked(x,z,r=1){return x-r<-1447||x+r>-1353||z-r<-2132||z+r>-2068||(x+r>-1431&&x-r<-1395&&z+r>-2117&&z-r<-2093);},materials:mats,environment};
 };
})();
