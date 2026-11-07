/* AI-assisted road plans: local, review-first JSON blueprint importer.
   Never executes embedded code or edits the campus before explicit approval. */
(function(){
"use strict";
const TYPES=new Set(["road","avenue","mapRoad","mapAvenue","bridge","flyover","bridgeCircle"]);
// Approximate vector street schematic manually traced from four supplied Apple Maps
// screenshots around Al Nakheel, Dhahiyat King Fahd and Al Khaleej, Arar.
// There is NO georeferencing, GPS location, or Apple Maps imagery in this preset.
const ararScreenshotPreset=(()=>{
 const roads=[];
 const road=(type,a,b,group)=>{
  roads.push({type,x1:a[0],z1:a[1],x2:b[0],z2:b[1],group});
 };
 const avenue=(points,group)=>{for(let i=1;i<points.length;i++)road("mapAvenue",points[i-1],points[i],group)};
 const street=(points,group)=>{for(let i=1;i<points.length;i++)road("mapRoad",points[i-1],points[i],group)};
 // Route 85 and the eastern-side neighborhood are visually prominent in the screenshots.
 avenue([[-170,105],[-10,153],[170,214]],"85 / 25M — southern highway");
 // Route 80 is visible along the upper edge of the wide overview.
 avenue([[-170,-190],[-10,-190],[170,-190]],"80 — northern arterial");
 // Western edge of the serviced neighborhoods: leave the large vacant tract on
 // the WEST of this slanted corridor untouched.
 avenue([[-75,133],[20,-30],[115,-175]],"Al Nakheel western diagonal access");
 avenue([[-30,147],[62,-10],[151,-137]],"Al Nakheel central distributor");
 street([[35,168],[115,15],[176,-77]],"Al Nakheel eastern street");
 // Short links to the northern arterial.
 street([[115,-175],[115,-190]],"northern access link");
 street([[151,-137],[151,-190]],"northern district link");
 street([[176,-77],[176,-190]],"northern continuation");
 // Interior cross streets and blocks within the inhabited triangular strip.
 const western=[[-75,133],[20,-30],[115,-175]];
 const middle=[[-30,147],[62,-10],[151,-137]];
 const eastern=[[35,168],[115,15],[176,-77]];
 const position=(p,t)=>{
  if(t<=.5){const f=t*2;return [Math.round(p[0][0]+(p[1][0]-p[0][0])*f),Math.round(p[0][1]+(p[1][1]-p[0][1])*f)]}
  const f=(t-.5)*2;return [Math.round(p[1][0]+(p[2][0]-p[1][0])*f),Math.round(p[1][1]+(p[2][1]-p[1][1])*f)];
 };
 for(const t of [.09,.18,.27,.36,.45,.54,.63,.72,.81,.9]){
  const a=position(western,t),m=position(middle,t),b=position(eastern,t);
  street([a,m,b],"King Fahd / Al Nakheel block cross street");
 }
 // Narrow internal local streets in the district; not in the unbuilt central tract.
 street([[-53,140],[41,-23],[133,-156]],"local parallel 1");
 street([[5,159],[100,4],[164,-101]],"local parallel 2");
 // Eastern neighborhoods' side streets branch outward from the last built strip.
 street([[91,53],[145,75],[185,94]],"King Fahd east branch");
 street([[119,12],[161,29],[200,43]],"King Fahd branch");
 street([[148,-32],[182,-13],[215,3]],"Al Nakheel residential link");
 street([[176,-77],[210,-56]],"Al Nakheel north eastern link");
 // Southern Al Khaleej district: short streets beyond the 85 corridor, no invented bridges.
 street([[-130,117],[-155,155]],"Al Khaleej access 1");
 street([[-61,138],[-77,180]],"Al Khaleej access 2");
 street([[25,165],[9,203]],"Al Khaleej access 3");
 street([[95,189],[80,225]],"Al Khaleej access 4");
 street([[-155,155],[-77,180],[9,203],[80,225]],"Al Khaleej southern local street");
 return Object.freeze({
  version:1,
  title:"مخطط النخيل الجنوبي وضاحية الملك فهد — عرعر (تقريبي)",
  source:"رسم يدوي مشتق من الصور الأربع التي أرفقها المستخدم، غير معتمد مساحيًا",
  precision:"schematic-not-georeferenced",
  notes:"الخطوط القطرية للطرق الرئيسية والأحياء المأهولة فقط؛ المنطقة الرملية الكبيرة تبقى فارغة. لا يتضمن أي موقع GPS أو صور خرائط أو بيانات خاصة.",
  roads
 });
})();

function parse(text){
 if(typeof text!=="string"||text.length>250000)throw Error("ملف المخطط كبير أو غير صالح");
 const obj=JSON.parse(text);
 if(!obj||typeof obj!=="object"||!Array.isArray(obj.roads))throw Error("صيغة الملف يجب أن تحتوي على roads");
 if(obj.roads.length===0||obj.roads.length>80)throw Error("عدد عناصر المخطط يجب أن يكون بين 1 و80");
 const roads=[];
 for(let i=0;i<obj.roads.length;i++){
  const v=obj.roads[i],type=v&&v.type||"road";
  if(!TYPES.has(type))throw Error("نوع الطريق غير مدعوم عند العنصر "+(i+1));
  const coord=(key,fallback)=>Number(v[key]??fallback);
  if(type==="bridgeCircle"){
   const x=coord("x"),z=coord("z");
   if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>1400||Math.abs(z)>1400)
    throw Error("إحداثيات الجسر الدائري غير صالحة في العنصر "+(i+1));
   roads.push({type,x,z,rot:0});continue;
  }
  const x1=coord("x1",v.from?.[0]),z1=coord("z1",v.from?.[1]),
   x2=coord("x2",v.to?.[0]),z2=coord("z2",v.to?.[1]);
  if(![x1,z1,x2,z2].every(n=>Number.isFinite(n)&&Math.abs(n)<=1400))
   throw Error("إحداثيات غير صالحة عند العنصر "+(i+1));
  const length=Math.hypot(x2-x1,z2-z1);
  if(length<10||length>230)throw Error("طول الطريق خارج المدى 10–230 في العنصر "+(i+1));
  if((type==="road"||type==="avenue")&&x1!==x2&&z1!==z2)
   throw Error("الشارع "+(i+1)+" يجب أن يكون أفقيًا أو عموديًا، وليس مائلًا");
  roads.push({type,x1,z1,x2,z2});
 }
 return roads;
}
function transform(roads,{centerX=0,centerZ=0,scale=1,angle=0}={}){
 if(![centerX,centerZ,scale,angle].every(Number.isFinite)||scale<.4||scale>2)
  throw Error("موقع المخطط أو حجمه غير صالح");
 const all=[];
 for(const r of roads){
  if(r.type==="bridgeCircle")all.push([r.x,r.z]);
  else all.push([r.x1,r.z1],[r.x2,r.z2]);
 }
 const meanX=(Math.min(...all.map(p=>p[0]))+Math.max(...all.map(p=>p[0])))/2;
 const meanZ=(Math.min(...all.map(p=>p[1]))+Math.max(...all.map(p=>p[1])))/2;
 const a=angle*Math.PI/180;
 const point=(x,z)=>{
  const dx=(x-meanX)*scale,dz=(z-meanZ)*scale;
  return {x:Math.round((centerX+dx*Math.cos(a)-dz*Math.sin(a))*10)/10,
   z:Math.round((centerZ+dx*Math.sin(a)+dz*Math.cos(a))*10)/10};
 };
 return roads.map(r=>{
  if(r.type==="bridgeCircle"){const p=point(r.x,r.z);return {type:r.type,x:p.x,z:p.z,rot:0}}
  const p=point(r.x1,r.z1),q=point(r.x2,r.z2);
  return {type:r.type,x:p.x,z:p.z,end:{x:q.x,z:q.z}};
 });
}
const example={
 version:1,
 notes:"مخطط تخيلي: يمكنك توليده بالذكاء الاصطناعي بعد مراجعة الإحداثيات",
 roads:[
  {type:"road",x1:-80,z1:0,x2:80,z2:0},
  {type:"road",x1:0,z1:-65,x2:0,z2:65},
  {type:"avenue",x1:80,z1:-65,x2:80,z2:65},
  {type:"bridge",x1:-70,z1:-55,x2:70,z2:-55},
  {type:"bridgeCircle",x:110,z:0}
 ]
};
function createUI({host,onApprove,onNotice}){
 const section=document.createElement("section");section.dir="rtl";section.id="campus-ai-road-plan";
 section.style.cssText="display:grid;gap:8px;margin:8px 0;padding:12px;border:1px solid #84c6c6;border-radius:13px;background:#102e46;color:#fff;font:600 12px Tajawal,Tahoma";
 const title=document.createElement("strong");title.textContent="🤖 استيراد مخطط طرق من ملف AI / JSON";
 const intro=document.createElement("p");intro.style.cssText="margin:0;line-height:1.6;opacity:.87";
 intro.textContent="صمّم شبكة طرق كملف JSON باستخدام أي أداة ذكاء اصطناعي، وارفعها هنا. شاهد المعاينة، عدّل موقعها وحجمها، ثم اعتمدها يدويًا.";
 const file=document.createElement("input");file.type="file";file.accept=".json,application/json";
 file.setAttribute("aria-label","رفع مخطط طرق بصيغة JSON");file.style.cssText="max-width:100%;font:600 11px Tahoma";
 const inputs=document.createElement("div");
 inputs.style.cssText="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px";
 function field(label,initial,min,max,step){
  const holder=document.createElement("label");holder.textContent=label;
  holder.style.cssText="display:grid;gap:4px";
  const input=document.createElement("input");input.type="number";input.value=String(initial);
  input.min=String(min);input.max=String(max);input.step=String(step);
  input.style.cssText="width:100%;min-width:0;padding:7px;border-radius:8px;background:#e9f2f6;color:#123047;border:0";
  holder.append(input);inputs.append(holder);return input;
 }
 const cx=field("الموقع X",0,-1100,1100,5),cz=field("الموقع Z",0,-1100,1100,5),
 scale=field("التكبير (0.4–2)",1,.4,2,.1),angle=field("الدوران",0,0,270,90);
 const preview=document.createElement("canvas");preview.width=320;preview.height=205;
 preview.setAttribute("role","img");preview.setAttribute("aria-label","معاينة خطوط المخطط المستورد قبل اعتمادها");
 preview.style.cssText="display:block;width:100%;height:auto;background:#eaf1f3;border-radius:10px";
 const info=document.createElement("p");info.style.cssText="margin:0;line-height:1.6;color:#cbe6ef";
 info.textContent="لم يُرفع مخطط بعد";
 const buttons=document.createElement("div");buttons.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:6px";
 function btn(label,fn){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.onclick=fn;
  b.style.cssText="min-height:38px;border-radius:9px;background:#1a526e;color:white;border:1px solid #8ab8ca;font:700 12px Tajawal,Tahoma;padding:7px";
  buttons.append(b);return b;
 }
 let roads=[],items=[];
 function update(){
  const ctx=preview.getContext("2d"),w=320,h=205;
  if(!ctx)return;
  ctx.clearRect(0,0,w,h);ctx.fillStyle="#e7eef2";ctx.fillRect(0,0,w,h);
  try{
   items=roads.length?transform(roads,{centerX:Number(cx.value),centerZ:Number(cz.value),scale:Number(scale.value),angle:Number(angle.value)}):[];
  }catch(e){items=[];info.textContent=e.message}
  if(!items.length){ctx.fillStyle="#35617a";ctx.font="bold 13px Tahoma";ctx.fillText("حمّل مخطط JSON للمعاينة",85,100);return}
  const coords=items.flatMap(o=>o.end?[[o.x,o.z],[o.end.x,o.end.z]]:[[o.x,o.z]]);
  const minX=Math.min(...coords.map(p=>p[0]))-15,maxX=Math.max(...coords.map(p=>p[0]))+15,
    minZ=Math.min(...coords.map(p=>p[1]))-15,maxZ=Math.max(...coords.map(p=>p[1]))+15;
  const factor=Math.min(290/Math.max(1,maxX-minX),172/Math.max(1,maxZ-minZ));
  const tx=x=>15+(x-minX)*factor,tz=z=>16+(z-minZ)*factor;
  ctx.lineWidth=1;ctx.strokeStyle="#bdd0d9";
  for(let x=0;x<w;x+=25){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=25){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  for(const o of items){
   ctx.strokeStyle=o.type==="bridge"||o.type==="flyover"?"#da8f29":["avenue","mapAvenue"].includes(o.type)?"#185478":"#138d89";
   ctx.lineWidth=["avenue","mapAvenue"].includes(o.type)?5:3;ctx.beginPath();
   if(o.end){ctx.moveTo(tx(o.x),tz(o.z));ctx.lineTo(tx(o.end.x),tz(o.end.z));}
   else{ctx.arc(tx(o.x),tz(o.z),26*factor,0,Math.PI*2)}
   ctx.stroke();
  }
  info.textContent=items.length+" عنصرًا جاهزًا للمراجعة. الألوان: تركوازي شارع، أزرق شارع رئيسي، برتقالي جسر. لن يُنشر شيء قبل اعتمادك.";
 }
 for(const input of [cx,cz,scale,angle])input.oninput=update;
 file.onchange=async()=>{
  try{
   const source=file.files&&file.files[0];if(!source)return;
   if(source.size>250000)throw Error("حجم المخطط أكبر من 250 كيلوبايت");
   const text=typeof source.text==="function"?await source.text():await new Promise((ok,fail)=>{
    const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=()=>fail(Error("فشل قراءة الملف"));reader.readAsText(source,"UTF-8");
   });
   roads=parse(text);update();onNotice("✅ جاهز للمعاينة: "+roads.length+" عنصرًا");
  }catch(e){roads=[];items=[];info.textContent=e.message;onNotice("⚠️ "+e.message);update()}
  finally{file.value=""}
 };

 btn("🗺️ مخطط الصور الأربع — عرعر",()=>{
  roads=parse(JSON.stringify(ararScreenshotPreset));
  // A quiet, otherwise buildable corner is used for first preview only;
  // the player can move, rotate, zoom and review before any road gets built.
  cx.value="-425";cz.value="125";scale.value=".7";angle.value="0";
  update();
  info.textContent=roads.length+" مسارًا مستخرجًا يدويًا بصورة تقريبية. المقياس والموقع افتراضيان. عدّلهما قبل الاعتماد.";
  onNotice("🗺️ جاهز للمراجعة: مخطط تقريبي من صور النخيل وضاحية الملك فهد، وليس خريطة مساحية دقيقة");
 });
 btn("⬇️ تنزيل مخطط النخيل JSON",()=>{
  const blob=new Blob([JSON.stringify(ararScreenshotPreset,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download="arar-nakheel-king-fahd-schematic.json";
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 btn("📄 تنزيل قالب JSON",()=>{
  const blob=new Blob([JSON.stringify(example,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="campus-roads-ai-template.json";document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 btn("📋 نسخ برومبت تصميم الطرق",async()=>{
  const brief=[
   "أنت مهندس تصميم طرق ومخططات ثلاثية الأبعاد. حلّل صورة مخطط الطرق المرفقة، ثم أعطني ملف JSON صالحًا للاستيراد في لعبة الاستراتيجية الجامعية.",
   "المطلوب: شبكة طرق متصلة منطقيًا مع تقاطعات واضحة، وتجنّب عبور المباني أو تداخل الشوارع دون مبرر. أضف جسور صعود ونزول عند الحاجة، وجسور وصلات منحنية، وجسرًا دائريًا مع تحويلات عند الحاجة فقط.",
   "أخرج JSON فقط دون شرح أو Markdown، بالشكل:",
   JSON.stringify(example,null,2),
   "استخدم المفتاح roads كمصفوفة بحد أقصى 80 عنصرًا؛ الأنواع: road, avenue, mapRoad, mapAvenue, bridge, flyover, bridgeCircle.",
   "الشوارع road و avenue أفقية أو عمودية؛ mapRoad و mapAvenue للشوارع المائلة، والجسور bridge و flyover للطرق المرتفعة فقط.",
   "أطوال الطرق المستقيمة بين 10 و230 وحدة، والجسر الدائري يستخدم x و z كنقطة مركز.",
   "إذا كانت المسافة الفعلية مجهولة فلا تدّع دقة هندسية؛ اعمل بمقياس افتراضي واضح. لا تخترع طرقًا أو مداخل غير ظاهرة في الصورة.",
   "اجعل الإحداثيات نسبية حول المركز (0,0) حتى أستطيع وضع المخطط بمكانه وتدويره وتكبيره في اللعبة.",
   "ضع في الاعتبار أن المطابقة للصورة تقديرية وتتطلب مراجعة المستخدم قبل اعتماد الطرق."
  ].join("\n\n");
  try{
   if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error("clipboard unavailable");
   await navigator.clipboard.writeText(brief);
   onNotice("📋 نُسخ الطلب، أرفق صورة المخطط في أداة الذكاء ثم اطلب ملف JSON");
  }catch(e){
   const field=document.createElement("textarea");field.value=brief;field.rows=5;
   field.setAttribute("aria-label","انسخ برومبت تصميم الطرق");
   field.style.cssText="width:100%;border-radius:8px;color:#102e46;background:white;padding:7px";
   section.append(field);field.select();
   onNotice("📋 حدد النص الظاهر وانسخه لاستخدامه مع صورة المخطط");
  }
 });
 btn("✅ اعتماد المخطط",()=>{
  if(!items.length)return onNotice("أضف مخططًا صالحًا أولًا");
  if(!confirm("إضافة "+items.length+" طريقًا أو جسرًا إلى المخطط الحالي؟ ستبقى الطرق القديمة دون تغيير."))return;
  const result=onApprove(items.map(o=>JSON.parse(JSON.stringify(o))));
  info.textContent="أُضيف: "+result.added+"، تم تجاوز: "+result.skipped+" — يمكن التراجع عن الاستيراد دفعة واحدة.";
  onNotice("🗺️ تم اعتماد "+result.added+" من "+items.length+" عنصرًا بعد فحص التعارضات");
 });
 btn("🧽 مسح المعاينة",()=>{roads=[];items=[];update();info.textContent="تم مسح المعاينة دون تعديل اللعبة"});
 section.append(title,intro,file,inputs,preview,info,buttons);host.append(section);update();
 return {get count(){return items.length}};
}
window.CampusStrategyPlanJSON={parse,transform,createUI,example,ararScreenshotPreset};
})();