/* Architecture, wayfinding and room plans for the university. */
(function(root){
 'use strict';
 const roomKinds=['medical','language','technology','library','workshop','administration','sport'];
 const colors=[0x467882,0xa47a52,0x2b7288,0x686b50,0x536b90,0x89734f,0x397362];
 function roomPlan(count){
  const centers=[726,750,774,726,774],walls=[],rooms=[];
  const wall=(x,z,w,d)=>walls.push({x,z,w,d});
  wall(750,-24,72,.6);wall(750,24,72,.6);wall(714,0,.6,48);wall(786,0,.6,48);
  for(const x of [738,762])for(const z of [-14,14])wall(x,z,.35,20);
  for(let i=0;i<5;i++){
   const x=centers[i],side=i<3?-1:1,z=side*4;
   if(i<count){
    rooms.push({x,z:side*14,doorZ:z,entryZ:side*7,side});
    wall(x-7.15,z,9.7,.35);wall(x+7.15,z,9.7,.35);
   }else wall(x,z,24,.35);
  }
  return {rooms,walls,blocked(x,z,r=.65){return walls.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);}};
 }
 function kit(T,mat){
  const cube=new T.BoxGeometry(1,1,1),materials=new Map();
  const material=(color,extra={})=>mat(color,extra);
  function box(parent,w,h,d,color,x,y,z){
   let m=color;
   if(typeof color==='number'){
    if(!materials.has(color))materials.set(color,material(color,{roughness:.77}));
    m=materials.get(color);
   }
   const mesh=new T.Mesh(cube,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  return {box,material};
 }
 function board(T,parent,{x,y,z,width=11,text,subtitle,angle=0,color='#1e4148',trim='#d9bb7a'}){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=384;
  const ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,1024,384);
  bg.addColorStop(0,color);bg.addColorStop(1,'#13292e');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,384);
  ctx.strokeStyle=trim;ctx.lineWidth=4;ctx.strokeRect(15,15,994,354);
  ctx.fillStyle=trim;ctx.font='700 37px Tajawal,Arial';ctx.textAlign='center';ctx.fillText('✦   آفاق الشمال   ✦',512,91);
  ctx.fillStyle='#fbf3dc';ctx.font='800 78px Tajawal,Tahoma';ctx.fillText(text,512,211,914);
  ctx.fillStyle=trim;ctx.font='700 39px Tajawal,Tahoma';ctx.fillText(subtitle,512,298,910);
  const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;
  const mesh=new T.Mesh(new T.PlaneGeometry(width,width*.375),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
  mesh.position.set(x,y,z);mesh.rotation.y=angle;parent.add(mesh);return mesh;
 }
 function facade(T,parent,b,index,mat){
  const {box,material}=kit(T,mat),front=b.ds==='n'?-1:1,z=front*b.d/2,accent=colors[index];
  const window=material(0x456a78,{roughness:.17,metalness:.43}),frame=material(0xe5d7bd,{roughness:.73});
  for(const side of [-1,1]){
   const px=side*(b.w/2-3.4);
   box(parent,2.4,b.h+.15,.8,frame,px,b.h/2,z+front*.31);
   box(parent,.29,b.h-.4,1,accent,px-side*1.5,b.h/2,z+front*.38);
   box(parent,1.65,.35,2.3,0x7d7560,side*6.3,.185,z+front*5.7);
   for(let i=0;i<5;i++)box(parent,.16,.78,.22,accent,side*6.3+(i-2)*.23,.77,z+front*5.7);
  }
  box(parent,10.7,4.6,.22,window,0,2.3,z+front*.32);
  box(parent,10.9,.2,.5,frame,0,4.6,z+front*.45);
  for(const px of [-5.1,-2.6,0,2.6,5.1])box(parent,.13,4.45,.38,accent,px,2.29,z+front*.48);
  for(const px of [-.57,.57])box(parent,.1,.54,.11,frame,px,1.49,z+front*.58);
  for(let y=7.1;y<b.h-1;y+=4.2)for(let px=-b.w/2+7;px<=b.w/2-6;px+=6.9){
   box(parent,4.5,2.25,.115,window,px,y,z+front*.2);
   box(parent,.08,2.25,.2,frame,px,y,z+front*.25);
   box(parent,4.7,.15,.45,accent,px,y-1.13,z+front*.3);
  }
  for(let i=0;i<4;i++){
   const px=-8+i*4.9,panel=box(parent,4.25,.11,5.7,window,px,b.h+1.15,-b.d*.19);panel.rotation.x=.17;
   box(parent,.15,.65,.15,frame,px,b.h+.79,-b.d*.19);
  }
  board(T,parent,{x:0,y:6.45,z:z+front*.55,width:10.5,angle:front===1?0:Math.PI,text:b.n,subtitle:'المدخل الرئيسي  •  '+String(index+1).padStart(2,'0')});
 }
 function interior(T,parent,b,index,mat){
  const plan=roomPlan(b.labs.length),{box,material}=kit(T,mat),accent=colors[index]||colors[0],kind=roomKinds[index];
  const glass=material(0x76a8b4,{roughness:.19,metalness:.34});
  const light=material(0xf3e8c9,{emissive:0xffdda8,emissiveIntensity:.65,roughness:.3});
  box(parent,72,.18,48,0xcec6b6,750,-.09,0);
  box(parent,72,.03,7.4,0xb3a992,750,.015,0);
  box(parent,22,.045,20,0xdcd0b9,750,.022,14);
  box(parent,72,.18,48,0xf4f0df,750,6.5,0);
  for(const {x,z,w,d} of plan.walls){
   box(parent,w,6.45,d,0xe5dccc,x,3.2,z);
   box(parent,w+.035,.18,d+.035,accent,x,.11,z);
  }
  for(let x=718;x<=782;x+=8){
   box(parent,.045,.012,7.3,0xa29886,x,.037,0);
   box(parent,3.3,.12,.48,light,x,6.36,0);
  }
  for(const x of [742,758]){
   box(parent,3.6,1.1,1.3,accent,x,.57,14.5);box(parent,3.8,.14,1.55,0xddc39b,x,1.19,14.5);
   box(parent,.9,.58,.15,glass,x,1.54,14.6);
  }
  board(T,parent,{x:750,y:4.47,z:23.59,width:9,text:b.n,subtitle:'الاستقبال  •  القاعات عبر الممر',angle:Math.PI});
  for(const [i,room] of plan.rooms.entries()){
   const {x,z,doorZ,side}=room;
   box(parent,4.6,.22,.48,accent,x,3.19,doorZ);
   for(const xx of [-2.27,2.27])box(parent,.2,3.16,.42,accent,x+xx,1.58,doorZ);
   board(T,parent,{x,y:3.78,z:doorZ-side*.24,width:5.2,text:b.labs[i][0],subtitle:'قاعة '+(i+1),angle:side===-1?0:Math.PI});
   box(parent,13,.02,12,0xd4c8b2,x,.014,z);
   for(const dx of [-4,4])box(parent,5,.14,.5,light,x+dx,6.35,z);
   const counter=(x,z,w=4,d=1.5)=>{
    box(parent,w,.12,d,0xb49a76,x,1.08,z);
    for(const s of [-1,1])box(parent,.18,1,d*.81,accent,x+s*(w/2-.17),.53,z);
   };
   if(kind==='library'||kind==='administration'){
    for(const xx of [-8,8]){
     box(parent,1.7,3.4,10.3,0x937551,x+xx,1.7,z);
     for(let j=0;j<4;j++)for(let k=0;k<8;k++)box(parent,1.79,.28,.62,[accent,0xaa7356,0xcfb283,0x5d777a][(j+k)%4],x+xx,.56+j*.66,z-3.6+k*.92);
    }
    counter(x,z-1,5);counter(x,z+4,5);
   }else if(kind==='medical'){
    for(const dx of [-6,0,6]){
     counter(x+dx,z+side*2.2,3.5,2);box(parent,3.2,.2,1.8,0x90b2b6,x+dx,1.22,z+side*2.2);
     box(parent,.75,.17,1.3,0xe2e0cf,x+dx-1.1,1.42,z+side*2.2);
     box(parent,.71,.63,.12,glass,x+dx,1.7,z+side*4);
    }
   }else if(kind==='sport'){
    for(const dx of [-6,0,6]){
     box(parent,3.2,.11,4.5,accent,x+dx,.12,z+side*2.2);
     box(parent,1.3,.6,1.25,0x38434b,x+dx,.41,z+side*3);
    }
    box(parent,11,.34,.25,0x967552,x,1.2,z+side*6);
   }else{
    for(const dx of [-6,0,6])for(const dz of [-2.8,3.3]){
     counter(x+dx,z+dz,4.5);
     box(parent,1.28,.72,.12,glass,x+dx,1.57,z+dz+side*.39);
     box(parent,.62,.06,.27,accent,x+dx,1.18,z+dz);
     box(parent,1.14,.27,1.02,0x506261,x+dx,.57,z+dz-side*1.42);
    }
   }
   // Desks and shelves remain solid, with a clear center aisle to each doorway.
   for(const item of parent.children){
    if(item.position.y<.55||item.position.y>1.2||item.scale.y<.09)continue;
    if(Math.abs(item.position.x-x)<11&&Math.abs(item.position.z-z)<8)
     plan.walls.push({x:item.position.x,z:item.position.z,w:item.scale.x,d:item.scale.z});
   }
  }
  return plan;
 }
 const api={roomPlan,facade,interior,board};root.HorizonsCampus=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
