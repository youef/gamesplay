/* University IT Deanship: interactive architectural concept.
   Three floors (ground + first + second) and a working rooftop view.
   This is a fictional educational layout, not an official architectural plan. */
(function(){
"use strict";
const FLOOR_HEIGHT=5.4;
const TITLES=["الدور الأرضي","الدور الأول","الدور الثاني","السطح"];
const ROOMS=[
 [
  {n:"خدمة العملاء",ico:"🎫",info:"استقبال الطلبات وتذاكر الدعم الفني",x:-19,z:9,type:"service"},
  {n:"قسم الشبكات",ico:"🌐",info:"المبدلات والموجّهات والربط الشبكي",x:20,z:9,type:"network"},
  {n:"الأمن السيبراني",ico:"🛡️",info:"المراقبة الأمنية والاستجابة للحوادث",x:-19,z:-1,type:"cyber"},
  {n:"غرفة الاتصالات",ico:"📡",info:"الاتصالات وتوزيع الكوابل",x:20,z:-1,type:"network"},
  {n:"مركز البيانات (Data Center)",ico:"🗄️",info:"صفوف الخوادم ووحدات التخزين في الممر الخلفي",x:20,z:-15,type:"datacenter"},
  {n:"دورات المياه",ico:"🚻",info:"مرافق في نهاية الممر الخلفي",x:-29,z:-16,type:"bath"},
  {n:"غرفة عامل النظافة",ico:"🧹",info:"غرفة الأدوات بجوار دورات المياه",x:-19.5,z:-16,type:"cleaner"},
  {n:"غرفة الأعمال",ico:"📋",info:"متابعة العمليات والمهام الإدارية",x:-10,z:-16,type:"office"}
 ],
 [
  {n:"إدارة الخوادم والأنظمة",ico:"🖥️",info:"الخوادم والنسخ الاحتياطي والأنظمة الافتراضية",x:-19,z:9,type:"network"},
  {n:"الدعم الفني",ico:"🧰",info:"صيانة أجهزة المستخدمين ومتابعة بلاغاتهم",x:20,z:9,type:"service"},
  {n:"مختبر الشبكات",ico:"🔌",info:"تجارب المبدلات والموجهات",x:-19,z:-1,type:"network"},
  {n:"قاعة التدريب",ico:"🎓",info:"تدريب الموظفين والطلبة",x:20,z:-1,type:"training"},
  {n:"مكاتب المهندسين",ico:"💻",info:"فرق البنية التحتية والأنظمة",x:-19,z:-15,type:"office"},
  {n:"مركز المراقبة",ico:"📊",info:"مراقبة الخدمات والتنبيهات التشغيلية",x:20,z:-15,type:"cyber"}
 ],
 [
  {n:"مكتب العميد",ico:"🏢",info:"مكتب إدارة العمادة",x:-19,z:9,type:"office"},
  {n:"قاعة الاجتماعات",ico:"👥",info:"الاجتماعات الفنية والإدارية",x:20,z:9,type:"training"},
  {n:"إدارة المشاريع",ico:"📐",info:"متابعة المشاريع التقنية",x:-19,z:-1,type:"office"},
  {n:"تطوير البرمجيات",ico:"⌨️",info:"تطوير التطبيقات والخدمات الرقمية",x:20,z:-1,type:"office"},
  {n:"مركز الابتكار",ico:"💡",info:"تجارب وحلول تقنية جديدة",x:-19,z:-15,type:"training"},
  {n:"الأرشيف والخدمات",ico:"🗂️",info:"حفظ الوثائق التشغيلية",x:20,z:-15,type:"office"}
 ],
 [
  {n:"وحدات التكييف",ico:"❄️",info:"التبريد والتهوية",x:-20,z:-13,type:"roof"},
  {n:"هوائيات الاتصالات",ico:"📶",info:"أجهزة الاتصال الهوائي",x:20,z:-13,type:"roof"},
  {n:"الألواح الشمسية",ico:"☀️",info:"توليد الطاقة الشمسية",x:20,z:10,type:"roof"},
  {n:"غرفة صيانة السطح",ico:"🔧",info:"غرفة معدات السطح",x:-20,z:10,type:"roof"}
 ]
];
window.ITCampusFactory=function(options){
 const {THREE,interior,mat,lab,pl,onNotice,onChange}=options;
 const m={
  wall:mat(0xe7edf1,{roughness:.92}),floor:mat(0xb6c7d0,{roughness:.91}),
  roof:mat(0x8e9da8),ceiling:mat(0xf2f3ef),
  blue:mat(0x215b82,{metalness:.23}),steel:mat(0x5a6c78,{metalness:.45}),
  desk:mat(0x977454),seat:mat(0x273e52),glass:mat(0x71b7d2,{transparent:true,opacity:.33,depthWrite:false,side:THREE.DoubleSide}),
  screen:mat(0x1b4658,{emissive:0x188abb,emissiveIntensity:.48}),
  green:mat(0x348c6e)
 };
 let level=0,groups=[],colliders=[[],[],[],[]];
 function wipe(){
  interior.traverse(obj=>{
   if(obj.isMesh&&obj.geometry)obj.geometry.dispose();
   if(obj.isSprite&&obj.material){if(obj.material.map)obj.material.map.dispose();obj.material.dispose()}
  });
  while(interior.children.length)interior.remove(interior.children[0]);
 }
 function build(){
  wipe();level=0;groups=[];colliders=[[],[],[],[]];
  for(let i=0;i<4;i++){
   const group=new THREE.Group();group.position.set(750,i*FLOOR_HEIGHT,0);interior.add(group);groups.push(group);
   function shape(w,h,d,material,x,y,z,solid=false){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);mesh.receiveShadow=true;group.add(mesh);
    if(solid)colliders[i].push([x-w/2,z-d/2,x+w/2,z+d/2]);
    return mesh;
   }
   function wall(axis,c,start,end,doors=[]){
    let pos=start;
    const sorted=doors.slice().sort((a,b)=>a-b);
    function piece(a,b){
     if(b-a<.08)return;
     if(axis==="x")shape(.34,3.8,b-a,m.wall,c,1.9,(a+b)/2,true);
     else shape(b-a,3.8,.34,m.wall,(a+b)/2,1.9,c,true);
    }
    for(const d of sorted){
     const left=Math.max(start,d-1.9),right=Math.min(end,d+1.9);
     if(left>pos)piece(pos,left);
     pos=Math.max(pos,right);
    }
    if(end>pos)piece(pos,end);
   }
   shape(72,.36,48,i===3?m.roof:m.floor,0,-.18,0);
   if(i<3){
    shape(72,.22,48,m.ceiling,0,5.1,0);
    wall("x",-35,-23,23);wall("x",35,-23,23);
    wall("z",-23,-35,35);wall("z",23,-35,35,[0]);
    if(i===0){
     // Main hallway with customer service and cybersecurity to the left,
     // networks to the right, and datacenter and utilities at the back.
     wall("x",-6.5,-7,15,[-1,9]);
     wall("x",-6.5,-22,-11);
     wall("x",6.5,-22,15,[-15,-1,9]);
     wall("z",4,-35,-6.5);wall("z",-7,-35,-6.5);
     wall("z",4,6.5,35);wall("z",-7,6.5,35);
     // The rear cross-corridor leads to the restroom, cleaner and operations.
     wall("z",-11,-35,-6.5,[-29,-19.5,-10]);
     wall("x",-24,-22,-11);wall("x",-15,-22,-11);
    }else{
     for(const side of [-1,1]){
      wall("x",side*6.5,-22,15,[-15,-1,9]);
      wall("z",4,side<0?-35:6.5,side<0?-6.5:35);
      wall("z",-7,side<0?-35:6.5,side<0?-6.5:35);
     }
    }
    // Elevator directly beside the entrance, left of customer service.
    const ex=-28,ez=18;
    shape(6.4,.12,6,m.steel,ex,.05,ez);
    shape(.2,3.9,6,m.steel,ex-3.2,1.96,ez,true);
    shape(.2,3.9,6,m.steel,ex+3.2,1.96,ez,true);
    shape(6.4,3.9,.2,m.steel,ex,1.96,ez+3,true);
    shape(6.25,3.3,.09,m.glass,ex,1.8,ez-3.05);
    shape(6.4,.38,.3,m.blue,ex,4,ez-3);
    shape(.48,.75,.23,m.screen,ex+4.2,1.5,ez-3);
    const liftLabel=lab("🛗 المصعد","#224969",1.05);
    liftLabel.position.set(ex,4.35,ez-3.3);group.add(liftLabel);
    const floorLabel=lab("عمادة تقنية المعلومات - "+TITLES[i],"#174764",1.35);
    floorLabel.position.set(0,4.2,18);group.add(floorLabel);
    for(const x of [-23,-8,8,23]){
     const light=new THREE.PointLight(0xffeddf,.4,32);
     light.position.set(x,4.55,-2);group.add(light);
    }
    for(const side of [-1,1])shape(.13,.025,29,m.blue,side*5.55,.03,-4);
   }else{
    // Rooftop safety parapets and service infrastructure.
    for(const x of [-35,35])shape(.6,1.15,47,m.blue,x,.6,0,true);
    for(const z of [-23,23])shape(71,1.15,.6,m.blue,0,.6,z,true);
    for(const x of [-26,-19,-12]){
     shape(5,2.5,4,m.steel,x,1.28,-13,true);
     shape(4.3,.15,3.5,m.blue,x,2.58,-13);
    }
    for(const x of [12,19,26])for(const z of [7,13]){
     const panel=shape(5,.14,3,m.blue,x,1.25,z,true);panel.rotation.x=-.2;
     shape(.12,1.15,.8,m.steel,x,.57,z);
    }
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.14,.21,11,8),m.steel);
    mast.position.set(22,5.6,-13);group.add(mast);
    shape(4,.2,.2,m.blue,22,8.3,-13);
    const label=lab("سطح عمادة تقنية المعلومات","#174764",1.4);
    label.position.set(0,3.8,18);group.add(label);
   }
   function desk(x,z){
    shape(4,.23,1.6,m.desk,x,1.1,z);
    shape(1.7,.85,.12,m.screen,x,1.84,z-.4);
    shape(1.35,.3,1.2,m.seat,x,.55,z+1.9);
   }
   function rack(x,z){
    shape(1.65,3.2,1.3,m.steel,x,1.62,z);
    shape(1.25,2.7,.09,m.seat,x,1.55,z+.71);
    for(let h=.65;h<2.8;h+=.54)shape(1.02,.12,.09,m.screen,x,h,z+.79);
   }
   for(const room of ROOMS[i]){
    const {x,z,type}=room;
    if(type==="bath"){
     for(const dx of [-3,0,3]){
      shape(2.2,2.7,.12,m.wall,x+dx,1.4,z-1.6);
      shape(1,.6,1.2,m.ceiling,x+dx,.6,z);
      shape(.8,.3,.8,m.glass,x+dx,1.15,z+2);
     }
    }else if(type==="cleaner"){
     shape(2.2,2.8,.8,m.steel,x-1,1.45,z-2);
     shape(.8,1.1,.8,m.green,x+2,.57,z);
     shape(.12,2.7,.12,m.desk,x+2.5,1.35,z+2);
    }else if(["network","datacenter"].includes(type)){
     for(const dx of [-5,-1,3,7])for(const dz of [-1.5,2.1]){
      if(x+dx<34&&x+dx>-34)rack(x+dx,z+dz);
     }
    }else if(type==="cyber"){
     for(const dx of [-4,1,6]){
      desk(x+dx,z-2);
      shape(2.2,.8,.12,m.screen,x+dx,2.85,z-3);
     }
    }else if(type==="service"){
     for(const dx of [-5,1,7])desk(x+dx,z-1);
    }else if(type==="training"){
     shape(9,.37,3,m.desk,x,1.1,z);
     for(const dx of [-6,-2,2,6])for(const dz of [-2.8,2.8])shape(1,.72,1.1,m.seat,x+dx,.44,z+dz);
    }else if(type==="office"){
     for(const dx of [-3,3])desk(x+dx,z);
    }
    if(i!==3){
     const sign=lab(room.ico+" "+room.n,"#1b4963",.93);
     sign.position.set(x,3.53,z);group.add(sign);
    }
   }
   group.visible=i===0;
  }
 }
 function switchFloor(index){
  if(!groups.length)return;
  level=Math.max(0,Math.min(3,index));
  groups.forEach((g,i)=>g.visible=i===level);
  pl.position.set(750-28,level*FLOOR_HEIGHT,13.4);
  onNotice("🛗 عمادة تقنية المعلومات — "+TITLES[level]);
  onChange();
 }
 function visit(room){
  pl.position.set(750+room.x,level*FLOOR_HEIGHT,room.z);
  onNotice(room.ico+" "+room.n+" — "+room.info);
 }
 function blocked(x0,z0,x1,z1){
  const arr=colliders[level]||[],dx=x1-x0,dz=z1-z0;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.35)),radius=.62;
  for(let j=1;j<=steps;j++){
   const x=x0+dx*j/steps-750,z=z0+dz*j/steps;
   for(const [a,b,c,d] of arr)if(x+radius>a&&x-radius<c&&z+radius>b&&z-radius<d)return true;
  }
  return false;
 }
 function renderRooms(parent){
  const title=document.createElement("div");
  title.style.cssText="background:#12334e;color:#fff;padding:9px;border-radius:9px;text-align:center;font:800 13px Tajawal,Tahoma";
  title.textContent="🏢 عمادة تقنية المعلومات | "+TITLES[level];parent.append(title);
  const switcher=document.createElement("div");switcher.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:5px";
  TITLES.forEach((name,i)=>{
   const btn=document.createElement("button");btn.textContent="🛗 "+name;
   btn.style.cssText="font:700 11px Tajawal,Tahoma;padding:9px;border:1px solid #a9bdca;border-radius:9px;color:#fff;background:"+(i===level?"#148d82":"#284a63");
   btn.disabled=i===level;btn.onclick=()=>switchFloor(i);switcher.append(btn);
  });
  parent.append(switcher);
  ROOMS[level].forEach(room=>{
   const btn=document.createElement("button");btn.textContent=room.ico+" "+room.n;
   btn.onclick=()=>visit(room);parent.append(btn);
  });
  const elevator=document.createElement("button");elevator.textContent="📍 الذهاب إلى المصعد";
  elevator.onclick=()=>{pl.position.set(750-28,level*FLOOR_HEIGHT,13.4);onNotice("المصعد أمامك؛ اختر الطابق من القائمة")};
  parent.append(elevator);
 }
 return {build,switchFloor,visit,blocked,renderRooms,levels:TITLES,rooms:ROOMS,get level(){return level},height:FLOOR_HEIGHT};
};
})();
