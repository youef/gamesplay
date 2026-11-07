/* Client-only campus road blueprint import and drafting. No data leaves this browser. */
(function(){
"use strict";
window.CampusBlueprintImport=function(options){
 const {THREE,scene,host,onRoad,onNotice}=options;
 const KEY="nbu-campus-road-blueprint-v1";
 const root=new THREE.Group();root.name="Uploaded road blueprint reference";scene.add(root);
 const surface=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({
  color:0xffffff,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide
 }));
 surface.rotation.x=-Math.PI/2;surface.renderOrder=1;root.add(surface);root.visible=false;
 const state={x:0,z:0,size:180,opacity:.4,rotation:0,show:true,placing:false,hasImage:false};
 let picture=null,cacheURL="",proposals=[],start=null,manual=false,preview=null,summary=null,controls=null;
 const section=document.createElement("section");section.dir="rtl";section.id="strategy-blueprint-import";
 section.style.cssText="margin:8px 0;padding:10px;border-radius:13px;border:1px solid #75aaba;background:#102d43;color:white;font:700 12px Tajawal,Tahoma;display:grid;gap:7px";
 function button(label,handler){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.onclick=handler;
  b.style.cssText="min-height:39px;padding:8px;color:white;background:#205571;border:1px solid #94bccc;border-radius:8px;font:700 12px Tajawal,Tahoma;touch-action:manipulation";
  return b;
 }
 const headline=document.createElement("strong");headline.textContent="🗺️ صورة مخطط الطرق — تحويل ومطابقة";
 const description=document.createElement("p");description.style.cssText="margin:0;opacity:.82;font:500 11px Tajawal,Tahoma;line-height:1.6";
 description.textContent="ارفع صورة PNG/JPG لمخطط الطرق. ضعها على الخريطة، عدّل الحجم والاتجاه، واستخرج خطوطًا مستقيمة مقترحة أو ارسم المسارات بنقطتين.";
 const file=document.createElement("input");file.type="file";file.accept="image/png,image/jpeg,image/webp";file.setAttribute("aria-label","رفع مخطط طرق من الصور");
 file.style.cssText="font:600 11px Tahoma;width:100%;max-width:100%;color:white";
 const grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px";
 function numberField(title,initial,min,max,step,commit){
  const label=document.createElement("label");label.textContent=title;label.style.cssText="display:grid;gap:3px;font:600 11px Tahoma";
  const input=document.createElement("input");input.type="number";input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(initial);
  input.style.cssText="width:100%;min-width:0;padding:8px;border-radius:7px;background:white;color:#123148;border:0";
  input.onchange=()=>{const v=Number(input.value);if(Number.isFinite(v)){commit(Math.max(min,Math.min(max,v)));save();redraw()}};label.append(input);grid.append(label);return input;
 }
 const xField=numberField("X مركز الصورة",0,-1200,1200,5,v=>state.x=v);
 const zField=numberField("Z مركز الصورة",0,-1200,1200,5,v=>state.z=v);
 const sizeField=numberField("العرض على الأرض (م)",180,40,600,10,v=>state.size=v);
 const rotateField=numberField("تدوير المخطط (درجات)",0,0,270,90,v=>state.rotation=Math.round(v/90)*90);
 const opacityField=numberField("الشفافية %",40,10,85,5,v=>state.opacity=v/100);
 const panelButtons=document.createElement("div");panelButtons.style.cssText="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px";
 const positionBtn=button("📍 تحديد موقع بالخريطة",()=>{state.placing=true;onNotice("المس موقعًا على الأرض لتثبيت مركز الصورة")});
 const autoBtn=button("🔎 استخراج خطوط مقترحة",()=>{if(!state.hasImage)return onNotice("ارفع صورة أولًا");
  manual=false;start=null;autoTrace();drawPreview()});
 const manualBtn=button("✏️ رسم طرق فوق الصورة",()=>{if(!state.hasImage)return onNotice("ارفع صورة أولًا");
  manual=!manual;start=null;drawPreview();onNotice(manual?"اضغط على بداية ونهاية كل طريق في الصورة":"انتهى وضع رسم المسارات")});
 const commitBtn=button("✅ اعتماد المقترحات",()=>{
  if(!proposals.length)return onNotice("لا توجد خطوط مقترحة؛ جرّب الرسم اليدوي");
  const targets=proposals.slice(0,35);let accepted=0,failed=0;
  for(const v of targets){const p=toWorld(v.x1,v.y1),q=toWorld(v.x2,v.y2);
   if(onRoad(p,q,v.type||"road"))accepted++;else failed++;
  }
  proposals=[];manual=false;start=null;drawPreview();
  onNotice("✅ أضيف "+accepted+" طريق، وتم تجاهل "+failed+" مقترح متداخل أو غير صالح");
 });
 const toggleBtn=button("👁️ إخفاء الصورة",()=>{state.show=!state.show;root.visible=state.show&&state.hasImage;
  toggleBtn.textContent=state.show?"👁️ إخفاء الصورة":"👁️ إظهار الصورة";save()});
 const clearBtn=button("🧽 إزالة صورة المخطط",()=>{picture=null;state.hasImage=false;state.placing=false;proposals=[];start=null;
  root.visible=false;try{localStorage.removeItem(KEY)}catch(e){}drawPreview();onNotice("أزيلت صورة المرجع دون حذف الطرق المبنية")});
 panelButtons.append(positionBtn,autoBtn,manualBtn,commitBtn,toggleBtn,clearBtn);
 const canvas=document.createElement("canvas");canvas.width=320;canvas.height=220;canvas.setAttribute("aria-label","معاينة تخطيط الطرق وتحديد نقاط الرسم");
 canvas.style.cssText="background:#edf2f4;border-radius:8px;display:block;width:100%;max-height:220px;object-fit:contain;touch-action:manipulation";
 const tiny=document.createElement("p");tiny.style.cssText="font:500 10px Tahoma;line-height:1.6;opacity:.75;margin:0";
 tiny.textContent="الاستخراج الآلي تجريبي ويستهدف الخطوط الأفقية والعمودية الواضحة، وليس تحليلًا ذكيًا مضمونًا لصور Google Maps. راجع المقترحات قبل اعتمادها. الصور تبقى محليًا على جهازك.";
 summary=document.createElement("span");summary.style.cssText="display:block;font:600 11px Tahoma;color:#bce3f0";
 section.append(headline,description,file,grid,panelButtons,canvas,summary,tiny);host.append(section);
 preview=canvas;controls={xField,zField,sizeField,rotateField,opacityField};
 function save(){
  if(!cacheURL||!state.hasImage)return;
  try{localStorage.setItem(KEY,JSON.stringify({data:cacheURL,x:state.x,z:state.z,size:state.size,opacity:state.opacity,rotation:state.rotation,show:state.show}))}catch(e){}
 }
 function setTexture(image){
  const out=document.createElement("canvas"),maximum=512;
  const factor=Math.min(1,maximum/Math.max(image.width,image.height));
  out.width=Math.max(1,Math.round(image.width*factor));out.height=Math.max(1,Math.round(image.height*factor));
  const ctx=out.getContext("2d");ctx.drawImage(image,0,0,out.width,out.height);
  picture=out;cacheURL=out.toDataURL("image/jpeg",.77);
  const old=surface.material.map;surface.material.map=new THREE.CanvasTexture(out);
  if(old&&old.dispose)old.dispose();
  surface.material.needsUpdate=true;state.hasImage=true;proposals=[];start=null;drawPreview();redraw();save();
 }
 file.onchange=()=>{
  const input=file.files?.[0];if(!input)return;
  if(input.size>10*1024*1024){onNotice("الصورة كبيرة: الحد 10 ميجابايت");file.value="";return}
  const reader=new FileReader();
  reader.onload=()=>{
   const image=new Image();
   image.onload=()=>{setTexture(image);onNotice("✅ حمّلت الصورة؛ اختر موقعها على الخريطة واضبط الأبعاد")};
   image.onerror=()=>onNotice("تعذرت قراءة الصورة");
   image.src=reader.result;
  };
  reader.onerror=()=>onNotice("تعذر فتح الملف");
  reader.readAsDataURL(input);file.value="";
 };
 function toWorld(px,py){
  const a=state.rotation*Math.PI/180;
  const u=(px/picture.width-.5)*state.size;
  const v=(py/picture.height-.5)*state.size*picture.height/picture.width;
  return {x:state.x+u*Math.cos(a)-v*Math.sin(a),z:state.z+u*Math.sin(a)+v*Math.cos(a)};
 }
 function redraw(){
  root.visible=state.hasImage&&state.show;
  root.position.set(state.x,.13,state.z);root.rotation.y=-state.rotation*Math.PI/180;
  if(!picture)return;
  surface.scale.set(state.size,state.size*picture.height/picture.width,1);
  surface.material.opacity=state.opacity;
  drawPreview();
 }
 function drawPreview(){
  const ctx=canvas.getContext("2d"),w=320,h=220;
  ctx.clearRect(0,0,w,h);ctx.fillStyle="#e1e9ec";ctx.fillRect(0,0,w,h);
  if(!picture){ctx.fillStyle="#355c6d";ctx.font="bold 13px Tahoma";ctx.textAlign="center";ctx.fillText("ارفع صورة مخطط أولًا",w/2,h/2);summary.textContent="";return}
  const scale=Math.min(w/picture.width,h/picture.height),rw=picture.width*scale,rh=picture.height*scale;
  const ox=(w-rw)/2,oy=(h-rh)/2;ctx.drawImage(picture,ox,oy,rw,rh);
  for(const [i,s] of proposals.entries()){
   ctx.strokeStyle="#ff453a";ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(ox+s.x1*scale,oy+s.y1*scale);ctx.lineTo(ox+s.x2*scale,oy+s.y2*scale);ctx.stroke();
   if(i<20){ctx.fillStyle="#fff";ctx.fillRect(ox+s.x1*scale-3,oy+s.y1*scale-3,6,6)}
  }
  if(start){ctx.fillStyle="#2d6df5";ctx.beginPath();ctx.arc(ox+start.x*scale,oy+start.y*scale,5,0,2*Math.PI);ctx.fill()}
  summary.textContent=proposals.length+" مسار مقترح"+(manual?" · وضع الرسم اليدوي نشط":"")+" · راجع الخطوط الحمراء قبل الاعتماد";
 }
 canvas.addEventListener("click",e=>{
  if(!manual||!picture)return;
  const rect=canvas.getBoundingClientRect(),px=(e.clientX-rect.left)*canvas.width/rect.width,py=(e.clientY-rect.top)*canvas.height/rect.height;
  const scale=Math.min(320/picture.width,220/picture.height),ox=(320-picture.width*scale)/2,oy=(220-picture.height*scale)/2;
  const p={x:Math.min(picture.width,Math.max(0,(px-ox)/scale)),y:Math.min(picture.height,Math.max(0,(py-oy)/scale))};
  if(!start)start=p;
  else{
   // User-drawn segments are snapped to an orthogonal road network.
   const q=p;if(Math.abs(q.x-start.x)>=Math.abs(q.y-start.y))q.y=start.y;else q.x=start.x;
   if(Math.hypot(q.x-start.x,q.y-start.y)>10)proposals.push({x1:start.x,y1:start.y,x2:q.x,y2:q.y});
   start=null;
  }
  drawPreview();
 });
 function autoTrace(){
  if(!picture)return;
  const sample=document.createElement("canvas");sample.width=160;sample.height=160;
  const ctx=sample.getContext("2d");ctx.drawImage(picture,0,0,160,160);
  const {data}=ctx.getImageData(0,0,160,160);
  const mask=new Uint8Array(160*160);
  const mode=document.createElement("canvas"); // no external model: local pixel-line detection
  for(let i=0;i<mask.length;i++){
   const r=data[i*4],g=data[i*4+1],b=data[i*4+2];
   const lum=.2126*r+.7152*g+.0722*b,neutral=Math.max(r,g,b)-Math.min(r,g,b)<70;
   mask[i]=neutral&&lum<125?1:0;
  }
  const raw=[];
  for(const horizontal of [true,false]){
   for(let line=5;line<155;line+=4){
    let startAt=-1;
    for(let n=0;n<=160;n++){
     const hit=n<160&&mask[horizontal?line*160+n:n*160+line];
     if(hit&&startAt<0)startAt=n;
     else if(!hit&&startAt>=0){
      if(n-startAt>=29&&n-startAt<=152){
       raw.push(horizontal?{x1:startAt,y1:line,x2:n,y2:line}
                          :{x1:line,y1:startAt,x2:line,y2:n});
      }
      startAt=-1;
     }
    }
   }
  }
  const groups=[];
  for(const r of raw){
   const horizontal=r.y1===r.y2,axis=horizontal?r.y1:r.x1,
    startAt=horizontal?r.x1:r.y1,endAt=horizontal?r.x2:r.y2;
   const same=groups.find(g=>g.h===horizontal&&Math.abs(g.axis-axis)<=5
     &&Math.min(g.max,endAt)-Math.max(g.min,startAt)>15);
   if(same){same.axis=(same.axis*same.count+axis)/(same.count+1);same.min=Math.min(same.min,startAt);same.max=Math.max(same.max,endAt);same.count++}
   else groups.push({h:horizontal,axis,min:startAt,max:endAt,count:1});
  }
  proposals=groups.filter(g=>g.count>=2&&g.max-g.min>=28).sort((a,b)=>(b.max-b.min)-(a.max-a.min))
   .slice(0,30).map(g=>{
    const ratioX=picture.width/160,ratioY=picture.height/160;
    return g.h?{x1:g.min*ratioX,y1:g.axis*ratioY,x2:g.max*ratioX,y2:g.axis*ratioY}
              :{x1:g.axis*ratioX,y1:g.min*ratioY,x2:g.axis*ratioX,y2:g.max*ratioY};
   });
  onNotice(proposals.length?"اقتُرح "+proposals.length+" مسار. راجع المعاينة قبل الإضافة":"لم تُكتشف طرق واضحة؛ استخدم الرسم اليدوي أو صورة خطوط داكنة على خلفية فاتحة");
 }
 function place(point){
  if(!state.placing||!point)return false;
  state.x=Math.round(point.x/5)*5;state.z=Math.round(point.z/5)*5;
  xField.value=String(state.x);zField.value=String(state.z);state.placing=false;
  redraw();save();onNotice("📍 ثبت المخطط. يمكنك تغيير المقاس والاتجاه قبل اعتماد الطرق");return true;
 }
 function restore(){
  try{
   const saved=JSON.parse(localStorage.getItem(KEY)||"null");
   if(!saved||typeof saved.data!=="string"||!saved.data.startsWith("data:image/"))return;
   for(const key of ["x","z","size","opacity","rotation"]){
    if(Number.isFinite(saved[key]))state[key]=saved[key];
   }
   state.show=saved.show!==false;
   const image=new Image();image.onload=()=>{setTexture(image);cacheURL=saved.data;save();
    xField.value=String(state.x);zField.value=String(state.z);sizeField.value=String(state.size);
    rotateField.value=String(state.rotation);opacityField.value=String(Math.round(state.opacity*100));redraw()};
   image.src=saved.data;
  }catch(e){}
 }
 restore();
 return {place,setVisible:v=>{root.visible=Boolean(v)&&state.hasImage&&state.show},
  isPlacing:()=>state.placing,hide:()=>{root.visible=false},reset:()=>{state.placing=false;start=null;manual=false}};
};
})();