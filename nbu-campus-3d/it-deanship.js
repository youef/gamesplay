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
  green:mat(0x348c6e),
  amber:mat(0xe3a94e,{emissive:0x8d4e12,emissiveIntensity:.36}),
  white:mat(0xf8fafb),black:mat(0x1a2533),
  porcelain:mat(0xddebf0,{roughness:.35}),
  carpet:mat(0x1c6571,{roughness:1}),
  copper:mat(0x9a7b48,{metalness:.48}),
  livingGreen:mat(0x3c8d5e,{roughness:.97})
 };
 let level=0,groups=[],colliders=[[],[],[],[]];
 let active=false,mapOpen=false,mapDock=null,mapCanvas=null,mapList=null,mapFloorButtons=[],lastMapDraw=0;
 const navigableColors={service:"#0a9b92",network:"#256dba",datacenter:"#335ec8",cyber:"#6f55be",
  office:"#9c773b",bath:"#5497af",cleaner:"#738b4c",training:"#b87b36",roof:"#697f96"};
 const ledScreens=[];
 function addWallLabel(group,caption,x,y,z,size=1){
  const sign=lab(caption,"#173b54",size);sign.position.set(x,y,z);group.add(sign);
 }

 function wipe(){
  interior.traverse(obj=>{
   if(obj.isMesh&&obj.geometry)obj.geometry.dispose();
   if(obj.isSprite&&obj.material){if(obj.material.map)obj.material.map.dispose();obj.material.dispose()}
  });
  while(interior.children.length)interior.remove(interior.children[0]);
 }
 function build(){
  wipe();level=0;groups=[];colliders=[[],[],[],[]];ledScreens.length=0;
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
    // Corridor lighting, accessible navigation and professional wayfinding.
    for(const z of [-17,-7,3,13]){
     shape(6.8,.07,1.2,m.white,0,4.9,z);
     shape(.18,.045,1.1,m.green,-3.35,4.83,z);
     shape(.18,.045,1.1,m.green,3.35,4.83,z);
    }
    shape(9,.025,1,m.carpet,0,.025,18);
    addWallLabel(group,"← خدمة العملاء | الشبكات →",0,3.38,12,1.05);
    addWallLabel(group,"← المرافق | مركز البيانات →",0,3.38,-10,1.05);
    // An equipment point near the elevator, not a functioning real access terminal.
    shape(.85,1.15,.65,m.steel,-23.9,.6,15);
    shape(.55,.44,.08,m.screen,-23.9,1.58,14.62);
    shape(.24,.09,.09,m.green,-23.8,1.08,14.6);
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
    // Rooftop maintenance room, vent shafts and roof access safety route.
    shape(8,.25,7,m.roof,-20,3.4,11);
    shape(8,3.4,.28,m.wall,-20,1.7,14.5,true);
    shape(.27,3.4,7,m.wall,-24,1.7,11,true);
    shape(.27,3.4,7,m.wall,-16,1.7,11,true);
    shape(8,3.4,.27,m.wall,-20,1.7,7.5,true);
    shape(2.5,3.05,.11,m.glass,-20,1.65,7.34);
    for(const z of [-12,-5,2])shape(1.1,.18,2,m.green,0,.12,z);
    for(const z of [-14,-8,-2,4])shape(1,.2,.7,m.steel,-7,1.1,z);
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
    shape(1.45,.12,1.4,m.black,x,3.12,z);
    shape(.17,2.8,.11,m.copper,x-.85,1.55,z-.12);
    shape(.17,2.8,.11,m.copper,x+.85,1.55,z-.12);
    for(let h=.65;h<2.8;h+=.54)shape(1.02,.12,.09,m.screen,x,h,z+.79);
    const led=shape(.19,.1,.11,m.green,x+.47,2.85,z+.8);ledScreens.push(led);
   }
   for(const room of ROOMS[i]){
    const {x,z,type}=room;
    if(type==="bath"){
     for(const dx of [-3,0,3]){
      shape(2.2,2.7,.12,m.wall,x+dx,1.4,z-1.6);
      shape(1,.6,1.2,m.porcelain,x+dx,.6,z);
      shape(.5,.16,.48,m.white,x+dx,.95,z+.4);
      shape(.8,.3,.8,m.glass,x+dx,1.15,z+2);
     }
    }else if(type==="cleaner"){
     shape(2.2,2.8,.8,m.steel,x-1,1.45,z-2);
     shape(.8,1.1,.8,m.green,x+2,.57,z);
     shape(.12,2.7,.12,m.desk,x+2.5,1.35,z+2);
     shape(.8,.25,.8,m.amber,x+1.2,1.3,z+1.8);
    }else if(["network","datacenter"].includes(type)){
     for(const dx of [-5,-1,3,7])for(const dz of [-1.5,2.1]){
      if(x+dx<34&&x+dx>-34)rack(x+dx,z+dz);
     }
     if(type==="datacenter"){
      shape(17,.15,1.2,m.steel,x,3.65,z-.8);
      for(const dx of [-6,0,6])shape(1.1,.3,1.15,m.blue,x+dx,3.55,z-.8);
      shape(1.8,2.6,.7,m.steel,x+8,1.35,z+2.2);
      addWallLabel(group,"DATA CENTER • ZONE A",x,4,z-4,1.1);
     }
    }else if(type==="cyber"){
     for(const dx of [-4,1,6]){
      desk(x+dx,z-2);
      shape(2.2,.8,.12,m.screen,x+dx,2.85,z-3);
     }
     shape(9.8,.14,.3,m.blue,x,3.45,z-3.5);
     addWallLabel(group,"SOC • SECURITY",x,4,z-3.35,1.06);
    }else if(type==="service"){
     for(const dx of [-5,1,7])desk(x+dx,z-1);
     shape(11,.24,1.5,m.desk,x,1.12,z+3);
     addWallLabel(group,"استقبال وخدمة المستفيدين",x,4,z-3,1);
    }else if(type==="training"){
     shape(9,.37,3,m.desk,x,1.1,z);
     shape(6.4,2.9,.13,m.white,x,2.4,z-3.2);
     shape(5.4,2.1,.15,m.screen,x,2.4,z-3.1);
     for(const dx of [-6,-2,2,6])for(const dz of [-2.8,2.8])shape(1,.72,1.1,m.seat,x+dx,.44,z+dz);
    }else if(type==="office"){
     for(const dx of [-3,3])desk(x+dx,z);
     shape(1.2,2.6,.9,m.steel,x+7,1.33,z-3);
     shape(1.2,.14,1.2,m.livingGreen,x-6,1.8,z-2);
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
  onNotice("🛗 تم الوصول إلى "+TITLES[level]+" — يمكنك استخدام مخطط الطابق لاختيار القسم");
  onChange();refreshFloorNavigator();
 }
 function visit(room){
  pl.position.set(750+room.x,level*FLOOR_HEIGHT,room.z);
  onNotice(room.ico+" "+room.n+" — "+room.info);
  renderMiniMap();
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

 function mapX(x){return 14+(x+36)*3.5}
 function mapZ(z){return 12+(z+24)*3.75}
 function renderMiniMap(){
  if(!mapCanvas||!active||!mapOpen)return;
  const ctx=mapCanvas.getContext("2d");if(!ctx)return;
  const w=280,h=210;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#102639";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#d7e1e6";ctx.fillRect(mapX(-35),mapZ(-23),mapX(35)-mapX(-35),mapZ(23)-mapZ(-23));
  ctx.fillStyle="#b5ced8";ctx.fillRect(mapX(-6.5),mapZ(-23),mapX(6.5)-mapX(-6.5),mapZ(23)-mapZ(-23));
  if(level===0){
   ctx.fillStyle="#b5ced8";ctx.fillRect(mapX(-35),mapZ(-11),mapX(-6.5)-mapX(-35),mapZ(-7)-mapZ(-11));
  }
  // A north-up teaching floor map, not a surveyed or approved architectural drawing.
  for(const [index,room] of ROOMS[level].entries()){
   const x=mapX(room.x),y=mapZ(room.z);
   ctx.fillStyle=navigableColors[room.type]||"#4b7489";
   ctx.beginPath();ctx.arc(x,y,10.8,0,Math.PI*2);ctx.fill();
   ctx.lineWidth=1.3;ctx.strokeStyle="#e8f5ff";ctx.stroke();
   ctx.textAlign="center";ctx.textBaseline="middle";
   ctx.font="bold 11px Tahoma,Arial";ctx.fillStyle="#fff";ctx.fillText(String(index+1),x,y);
  }
  const elevatorX=mapX(-28),elevatorY=mapZ(18);
  ctx.fillStyle="#ffc857";ctx.fillRect(elevatorX-8,elevatorY-8,16,16);
  ctx.fillStyle="#142637";ctx.font="bold 11px Arial";ctx.fillText("L",elevatorX,elevatorY+1);
  const px=mapX(Math.max(-34,Math.min(34,pl.position.x-750)));
  const py=mapZ(Math.max(-22,Math.min(22,pl.position.z)));
  ctx.beginPath();ctx.arc(px,py,5.3,0,Math.PI*2);
  ctx.fillStyle="#f83f65";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#fff";ctx.stroke();
  ctx.textAlign="left";ctx.font="11px Tahoma";ctx.fillStyle="#b4d4e4";
  ctx.fillText("الخلف ↑",10,205);ctx.fillText("● أنت هنا",204,205);
 }
 function refreshFloorNavigator(){
  if(!mapDock)return;
  mapFloorButtons.forEach((b,index)=>{
   b.style.background=index===level?"#0a9287":"#254a63";
   b.setAttribute("aria-pressed",String(index===level));
  });
  const title=mapDock.querySelector(".it-floor-title");
  if(title)title.textContent="🗺️ "+TITLES[level]+" · "+ROOMS[level].length+" أقسام ومرافق";
  renderMiniMap();
  if(!mapList)return;
  mapList.replaceChildren();
  ROOMS[level].forEach((room,i)=>{
   const btn=document.createElement("button");
   btn.type="button";btn.className="it-room-choice";
   btn.textContent=(i+1)+" · "+room.ico+" "+room.n;
   btn.title=room.info;
   btn.onclick=()=>{visit(room);mapOpen=false;updateMapVisibility();};
   mapList.append(btn);
  });
 }
 function updateMapVisibility(){
  if(!mapDock)return;
  const panel=mapDock.querySelector(".it-map-sheet");
  const toggle=mapDock.querySelector(".it-map-toggle");
  panel.hidden=!mapOpen;
  toggle.setAttribute("aria-expanded",String(mapOpen));
  toggle.textContent=mapOpen?"✕ إغلاق المخطط":"🗺️ مخطط الطابق";
  if(mapOpen)refreshFloorNavigator();
 }
 function ensureNavigator(){
  if(mapDock||typeof document==="undefined")return;
  const dock=document.createElement("aside");
  dock.id="it-deanship-navigator";dock.dir="rtl";
  dock.style.cssText="position:fixed;left:calc(10px + env(safe-area-inset-left,0px));top:calc(70px + env(safe-area-inset-top,0px));z-index:69;width:min(290px,calc(100vw - 20px));font:600 12px Tajawal,Tahoma,sans-serif;max-height:calc(100dvh - 100px);color:#fff";
  const toggle=document.createElement("button");toggle.type="button";toggle.className="it-map-toggle";
  toggle.style.cssText="min-height:42px;border:1px solid #a4d5e5;border-radius:12px;background:#103b55ee;color:white;padding:9px 13px;font:800 13px Tajawal,Tahoma;box-shadow:0 4px 18px #0018;touch-action:manipulation";
  toggle.onclick=()=>{mapOpen=!mapOpen;updateMapVisibility()};
  const sheet=document.createElement("section");sheet.className="it-map-sheet";sheet.hidden=true;
  sheet.style.cssText="background:#092b41f5;border:1px solid #6495a9;padding:12px;margin-top:6px;border-radius:15px;box-shadow:0 12px 30px #0018;max-height:calc(100dvh - 160px);overflow-y:auto;overscroll-behavior:contain";
  const heading=document.createElement("strong");heading.className="it-floor-title";
  heading.style.cssText="display:block;text-align:center;margin:4px 0 8px";
  const floorButtons=document.createElement("div");floorButtons.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:5px 0 10px";
  TITLES.forEach((title,index)=>{
   const button=document.createElement("button");button.type="button";
   button.textContent=title;button.style.cssText="color:white;border:1px solid #7eb3bd;border-radius:9px;padding:7px 3px;font:700 11px Tajawal,Tahoma;touch-action:manipulation";
   button.onclick=()=>switchFloor(index);floorButtons.append(button);mapFloorButtons.push(button);
  });
  const canvas=document.createElement("canvas");canvas.width=280;canvas.height=210;
  canvas.setAttribute("role","img");canvas.setAttribute("aria-label","مخطط الطابق مع مواقع الأقسام والمصعد ومكانك الحالي");
  canvas.style.cssText="background:#102639;border-radius:9px;width:100%;height:auto;display:block;touch-action:manipulation";
  canvas.addEventListener("click",event=>{
   const rect=canvas.getBoundingClientRect();
   const x=(event.clientX-rect.left)*280/rect.width,y=(event.clientY-rect.top)*210/rect.height;
   const nearest=ROOMS[level].map((r,i)=>({room:r,index:i,d:Math.hypot(mapX(r.x)-x,mapZ(r.z)-y)})).sort((a,b)=>a.d-b.d)[0];
   if(Math.hypot(mapX(-28)-x,mapZ(18)-y)<12){pl.position.set(750-28,level*FLOOR_HEIGHT,13.4);onNotice("🛗 أنت أمام المصعد. اختر الطابق المطلوب");renderMiniMap()}
   else if(nearest&&nearest.d<15){visit(nearest.room);mapOpen=false;updateMapVisibility()}
  });
  const label=document.createElement("p");
  label.style.cssText="font-size:10px;opacity:.8;margin:6px 0;line-height:1.6";
  label.textContent="اضغط رقم القسم للانتقال إليه. L المصعد، والنقطة الوردية موقعك. مخطط تعليمي تصوّري.";
  const list=document.createElement("div");list.style.cssText="display:grid;grid-template-columns:1fr;gap:5px";
  const fine=document.createElement("p");fine.style.cssText="font-size:10px;opacity:.68;margin:8px 0 0";
  fine.textContent="هذا النموذج تخيّلي وليس مخططًا رسميًا للعمادة.";
  sheet.append(heading,floorButtons,canvas,label,list,fine);
  dock.append(toggle,sheet);document.body.append(dock);
  mapCanvas=canvas;mapDock=dock;mapList=list;
  const style=document.createElement("style");style.textContent="#it-deanship-navigator .it-room-choice{min-height:34px;text-align:right;border:1px solid #698a9c;border-radius:8px;background:#204964;color:#fff;padding:7px;font:600 11px Tajawal,Tahoma;touch-action:manipulation}#it-deanship-navigator .it-room-choice:focus-visible{outline:2px solid white}#it-deanship-navigator .it-map-sheet[hidden]{display:none!important}@media(max-width:650px){#it-deanship-navigator{top:calc(62px + env(safe-area-inset-top,0px))!important}}";
  document.head.append(style);
 }
 function setActive(enabled){
  active=Boolean(enabled);
  if(active){ensureNavigator();mapOpen=false;refreshFloorNavigator()}
  else{
   mapOpen=false;
   // Free the large 3D interior immediately on leaving to keep iPhones responsive.
   if(groups.length){wipe();groups=[];colliders=[[],[],[],[]];ledScreens.length=0}
  }
  if(mapDock){mapDock.style.display=active?"block":"none";updateMapVisibility()}
 }
 function tick(time){
  if(!active)return;
  if(time-lastMapDraw>=190){lastMapDraw=time;renderMiniMap()}
  // Lightweight shared-mesh indicator animation rather than individual lights.
  const pulse=Math.sin(time*.003);
  m.screen.emissiveIntensity=.4+.2*pulse;
  m.green.color.setHex(pulse>.2?0x41ba67:0x27764f);
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
 return {build,switchFloor,visit,blocked,renderRooms,setActive,tick,levels:TITLES,rooms:ROOMS,get level(){return level},height:FLOOR_HEIGHT};
};
})();
