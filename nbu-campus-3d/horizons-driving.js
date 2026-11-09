/* Original pickup models and the shared drive simulation. Forward is local +Z. */
(function(root){
 'use strict';
 const fleet={
  datsun:{name:'ددسن غمارة',badge:'CLASSIC 720',detail:'حوض مفتوح · انزلاق أسهل',paint:'#e6d6b9',speed:38,acceleration:28,grip:5.7,turn:1.13,slide:.81,track:1.56,wheelbase:1.97},
  hilux:{name:'تويوتا هايلكس',badge:'DOUBLE CAB',detail:'غمارتان · تماسك أقوى',paint:'#dddce2',speed:43,acceleration:33,grip:8.2,turn:.97,slide:.63,track:1.66,wheelbase:2.08},
  horizon:{name:'أفق 4×4',badge:'EXPEDITION',detail:'دفع رباعي · تسارع قوي',paint:'#bf4f3e',speed:39,acceleration:31,grip:7.2,turn:1,slide:.72,track:1.74,wheelbase:2.03},
 };
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 function advance(state,input,dt,limits){
  let {speed,heading,course}=state;
  const {gas,brake,steer,handbrake}=input;
  if(gas>0)speed+=gas*limits.acceleration*dt;
  else if(brake>0){
   speed=speed>0?Math.max(0,speed-brake*limits.braking*dt):speed-brake*11*dt;
  }else speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-8*dt);
  const driftInput=handbrake&&speed>8&&(Math.abs(steer)>.18||Math.abs(wrap(heading-course))>.18);
  if(handbrake)speed*=Math.exp(-(driftInput?.77:4.5)*dt);
  speed=clamp(speed,-9,limits.speed);
  const moving=Math.abs(speed)>.25;
  if(moving)heading=wrap(heading-steer*dt*(.42+Math.abs(speed)/36)*1.45*limits.turn*Math.sign(speed)*(driftInput?1+limits.slide:1));
  const grip=driftInput?1.7-limits.slide:limits.grip*2.5;
  course=moving?wrap(course+wrap(heading-course)*(1-Math.exp(-grip*dt))):heading;
  let slip=wrap(heading-course);
  // Keep the rear breaking loose while preventing the velocity from looping backwards.
  if(Math.abs(slip)>1.18){slip=clamp(slip,-1.18,1.18);course=wrap(heading-slip);}
  const distance=speed*dt,drifting=speed>8&&Math.abs(slip)>.19;
  return {speed,heading,course,slip,drifting,dx:Math.sin(course)*distance,dz:Math.cos(course)*distance};
 }

 function model(T,id,environment){
  const spec=fleet[id],truck=id!=='horizon',classic=id==='datsun';
  const root=new T.Group(),body=new T.Group(),wheels=[],kit=[];
  root.name=id;root.add(body);
  const metal=(color,metalness=.3,roughness=.45)=>new T.MeshStandardMaterial({color,metalness,roughness});
  const paint=metal(spec.paint,.45,.31),trim=metal(0x233039),dark=metal(0x181c21,.16,.82);
  const chrome=metal(classic?0xc4c3b6:0xa1adad,.83,.24),tire=metal(0x171b1d,0,.96);
  const glass=metal(0x365361,.48,.18);
  if(environment){glass.envMap=environment;paint.envMap=environment;paint.envMapIntensity=.65;}
  const lamp=new T.MeshStandardMaterial({color:0xe8f2f2,emissive:0xe2edf0,emissiveIntensity:.63,roughness:.26});
  const rear=new T.MeshStandardMaterial({color:0xa62922,emissive:0xff2012,emissiveIntensity:.21,roughness:.35});
  const amber=metal(classic?0xb86539:0xb08965,.28,.56),marker=metal(0xf5b35a,.1,.28);
  const blue=new T.MeshBasicMaterial({color:0x81e3f0,toneMapped:false});
  const cube=new T.BoxGeometry(1,1,1);
  function box(w,h,d,m,x,y,z,parent=body){
   const mesh=new T.Mesh(cube,m);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);
   mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  const width=classic?2.95:id==='hilux'?3.2:3.3,length=classic?6.05:6.38;
  box(width-.32,.48,length-.3,trim,0,.76,0);
  box(width,.65,length,paint,0,1.14,0);
  box(width-.06,.34,1.62,paint,0,1.62,2.13);
  box(width-.3,.06,1.22,paint,0,1.82,2.12);
  const cabZ=truck?(classic?.59:.46):-.56,cabDepth=classic?1.95:truck?2.83:3.29;
  box(width-.16,.39,cabDepth,paint,0,1.65,cabZ);
  const halfCab=cabDepth/2;
  const front=box(width-.27,.8,.12,glass,0,2.23,cabZ+halfCab-.06);front.rotation.x=-.25;
  const back=box(width-.35,.65,.12,glass,0,2.23,cabZ-halfCab+.09);back.rotation.x=.13;
  box(width-.07,.15,cabDepth-.09,paint,0,2.69,cabZ-.08);
  const bedBack=-length/2,bedFront=cabZ-halfCab;
  for(const side of [-1,1]){
   const edge=side*width/2;
   box(.08,.71,cabDepth-.19,glass,edge-side*.09,2.23,cabZ-.06);
   for(const z of classic?[cabZ-halfCab+.1,cabZ+halfCab-.12]:[cabZ-halfCab+.1,cabZ-.26,cabZ+halfCab-.12])
    box(.13,.83,.15,paint,edge-side*.08,2.22,z);
   for(const z of classic?[cabZ-.49]:[cabZ+.31,cabZ-.75]){
    box(.05,.045,.34,chrome,edge+side*.018,1.73,z);
    if(!classic)box(.028,.44,.026,trim,edge,1.49,z-.27);
   }
   box(.3,.11,.15,trim,edge+side*.11,2.08,cabZ+halfCab-.3);
   box(.17,.23,.37,chrome,edge+side*.25,2.12,cabZ+halfCab-.29);
   box(.035,.09,length-.3,amber,edge+side*.014,1.36,0);
   if(classic)box(.03,.048,length-.35,amber,edge+side*.016,1.23,0);
   for(const z of [-spec.wheelbase,spec.wheelbase]){
    box(.16,.13,1.65,trim,edge,1.43,z);
    box(.12,.31,.17,trim,edge,1.22,z-.8);box(.12,.31,.17,trim,edge,1.22,z+.8);
   }
   if(truck){
    const bedLength=bedFront-bedBack;
    box(.19,.48,bedLength,paint,edge-side*.08,1.67,(bedFront+bedBack)/2);
    box(.23,.068,bedLength,dark,edge-side*.08,1.93,(bedFront+bedBack)/2);
   }
   box(classic?.59:.68,classic?.32:.36,.13,lamp,side*(width/2-.43),1.58,length/2+.013);
   box(.25,.13,.12,marker,side*(width/2-.31),1.31,length/2+.025);
   box(classic?.36:.3,classic?.36:.49,.1,rear,side*(width/2-.25),1.52,-length/2-.06);
   box(.2,.082,.11,lamp,side*(width/2-.25),1.38,-length/2-.11);
  }
  if(truck){
   box(width-.43,.11,bedFront-bedBack-.19,dark,0,1.47,(bedFront+bedBack)/2+.04);
   for(let x=-(width-.58)/2;x<(width-.58)/2;x+=.2)box(.038,.043,bedFront-bedBack-.26,trim,x,1.55,(bedFront+bedBack)/2);
   box(width-.12,.48,.16,paint,0,1.66,bedBack+.06);
   box(width-.34,.11,.03,amber,0,1.65,bedBack-.04);
   box(.46,.083,.06,chrome,0,1.78,bedBack-.07);
  }else box(width-.2,1.02,1.35,paint,0,1.78,-2.36);
  box(width-.99,.38,.14,trim,0,1.59,length/2+.018);
  for(let i=0;i<(classic?4:3);i++)box(width-1.12,.028,.064,chrome,0,1.44+i*.095,length/2+.11);
  box(.23,.16,.06,chrome,0,1.61,length/2+.15);
  box(width+.09,.22,.29,classic?chrome:trim,0,1.005,length/2+.11);
  box(width+.03,.19,.28,chrome,0,.99,-length/2-.13);
  const plate=metal(0xe7dfc8,.16,.55);
  box(.64,.21,.07,plate,0,1.13,-length/2-.3);
  for(const x of [-.18,-.07,.05,.16])box(.046,.087,.015,trim,x,1.13,-length/2-.35);

  const radius=classic?.68:.77,tireDepth=classic?.44:.51;
  for(const side of [-1,1])for(const axle of [-1,1]){
   const pivot=new T.Group(),spin=new T.Group();pivot.position.set(side*spec.track,radius,axle*spec.wheelbase);root.add(pivot);pivot.add(spin);
   for(const [r,w,m] of [[radius,tireDepth,tire],[radius*.61,tireDepth+.026,chrome],[radius*.31,tireDepth+.056,trim]]){
    const wheel=new T.Mesh(new T.CylinderGeometry(r,r,w,20),m);wheel.rotation.z=Math.PI/2;wheel.castShadow=true;spin.add(wheel);
   }
   for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    box(.035,.1,.1,chrome,side*(tireDepth/2+.027),Math.cos(a)*radius*.42,Math.sin(a)*radius*.42,spin);
   }
   const ring=new T.Mesh(new T.TorusGeometry(radius*.68,.03,6,18),blue);
   ring.rotation.y=Math.PI/2;ring.position.x=side*(tireDepth/2+.04);spin.add(ring);kit.push({mesh:ring,rank:1});
   wheels.push({pivot,spin,front:axle===1,radius});
  }
  const guard=new T.Group();body.add(guard);
  for(const x of [-1.16,1.16])box(.12,.73,.16,chrome,x,1.22,length/2+.33,guard);
  box(2.5,.11,.13,chrome,0,1.57,length/2+.33,guard);kit.push({mesh:guard,rank:1});
  const bar=new T.Group();body.add(bar);
  for(const x of [-1.17,1.17])box(.12,.3,truck?1.2:2.9,trim,x,2.83,cabZ,bar);
  box(2.38,.12,.14,trim,0,2.96,cabZ+.4,bar);
  for(const x of [-.81,-.27,.27,.81])box(.32,.21,.16,lamp,x,3.02,cabZ+.48,bar);
  kit.push({mesh:bar,rank:2});
  const tray=new T.Group();body.add(tray);
  box(1.5,.34,.81,trim,0,truck?1.72:2.92,truck?-2.33:-.9,tray);kit.push({mesh:tray,rank:3});
  const flame=new T.Mesh(new T.ConeGeometry(.16,1.2,9),new T.MeshBasicMaterial({color:0x65d7fa,transparent:true,opacity:.8,toneMapped:false}));
  flame.rotation.x=-Math.PI/2;flame.position.set(.94,.71,-length/2-.58);flame.visible=false;root.add(flame);
  const shadow=new T.Mesh(new T.PlaneGeometry(width+1.1,length+.7),new T.MeshBasicMaterial({color:0x122221,transparent:true,opacity:.16,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.031;root.add(shadow);
  return {root,body,wheels,paint,rear,flame,setKit(rank){for(const part of kit)part.mesh.visible=rank>=part.rank;}};
 }

 function trails(T,scene){
  const count=260,positions=new Float32Array(count*3),vel=new Float32Array(count*3);
  const age=new Float32Array(count),life=new Float32Array(count),size=new Float32Array(count),opacity=new Float32Array(count),tone=new Float32Array(count);
  const geo=new T.BufferGeometry();
  for(const [key,array,components] of [['position',positions,3],['aSize',size,1],['aOpacity',opacity,1],['aTone',tone,1]])
   geo.setAttribute(key,new T.BufferAttribute(array,components).setUsage(T.DynamicDrawUsage));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{scale:{value:220}},
   vertexShader:`attribute float aSize,aOpacity,aTone;uniform float scale;varying float alpha,tone;
    void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*scale/max(1.,-p.z),1.,108.);alpha=aOpacity;tone=aTone;}`,
   fragmentShader:`varying float alpha,tone;void main(){vec2 p=gl_PointCoord-.5;float r=length(p);
    float cloud=1.-smoothstep(.1,.49,r+sin(p.x*28.+p.y*37.)*.019+sin(p.x*48.-p.y*16.)*.022);
    gl_FragColor=vec4(mix(vec3(.77,.73,.69),vec3(.78,.61,.41),tone),cloud*alpha);}`});
  const cloud=new T.Points(geo,material);cloud.frustumCulled=false;cloud.visible=false;cloud.name='Tire dust';scene.add(cloud);
  const marks=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:0x282c29,transparent:true,opacity:.27,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),160);
  marks.count=0;marks.frustumCulled=false;marks.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(marks);
  const stamp=new T.Object3D(),wheels=[-1,1];
  let cursor=0,stampCursor=0,dustBudget=0,markBudget=0;
  function update(dt,car,state,paved,spec,viewport){
   if(!dt)return;
   const speed=Math.abs(state.speed),sliding=state.driving&&state.sliding&&speed>8;
   const dust=state.driving&&(sliding||!paved&&speed>5);
   dustBudget+=dust?dt*(sliding?64:24):0;
   const h=car.rotation.y,s=Math.sin(h),c=Math.cos(h),x=car.position.x,y=car.position.y,z=car.position.z;
   while(dustBudget>=1){
    dustBudget--;const i=cursor++%count,j=i*3,side=wheels[i%2];
    positions.set([x+c*side*spec.track-s*spec.wheelbase,y+.24,z-s*side*spec.track-c*spec.wheelbase],j);
    vel.set([(Math.random()-.5)*3-s*1.3,.65+Math.random()*.75,(Math.random()-.5)*3-c*1.3],j);
    age[i]=0;life[i]=1.25+Math.random()*1.25;tone[i]=paved?(i%3===0?.44:.08):1;
   }
   let living=false;
   for(let i=0;i<count;i++){
    if(age[i]>=life[i]){opacity[i]=0;continue;}
    age[i]+=dt;living=true;
    const j=i*3,a=Math.min(1,age[i]/life[i]);
    for(let k=0;k<3;k++)positions[j+k]+=vel[j+k]*dt;
    size[i]=1.05+a*5.6;opacity[i]=Math.min(1,age[i]*9)*(1-a)*.39;
   }
   material.uniforms.scale.value=Math.max(180,viewport*.58);
   cloud.visible=living;
   if(living)for(const a of Object.values(geo.attributes))a.needsUpdate=true;
   if(!sliding||!paved){markBudget=0;return;}
   markBudget+=dt*speed;
   if(markBudget<1.05)return;
   const length=Math.min(2.7,markBudget+.3);markBudget=0;
   for(const side of wheels){
    stamp.position.set(x+c*side*spec.track-s*spec.wheelbase,y+.135,z-s*side*spec.track-c*spec.wheelbase);
    stamp.rotation.set(-Math.PI/2,0,-state.course,'YXZ');stamp.scale.set(.34,length,1);stamp.updateMatrix();
    marks.setMatrixAt(stampCursor++%marks.instanceMatrix.count,stamp.matrix);
   }
   marks.count=Math.min(stampCursor,marks.instanceMatrix.count);marks.instanceMatrix.needsUpdate=true;
  }
  return {update};
 }
 const api={fleet,advance,model,trails};
 root.HorizonsDriving=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
