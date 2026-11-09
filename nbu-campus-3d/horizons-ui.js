(function(){
 'use strict';
 window.createHorizonsUI=function(api){
  const {world}=api,$=id=>document.getElementById(id),names={fawaz:'فواز',zyad:'زياد',noura:'نورة'},roles={fawaz:'حارس الشمال · وتيرة إطلاق أسرع',zyad:'مستكشف البر · ركض أسرع وقفزة أعلى',noura:'مهندسة الميدان · تلقيم أسرع'};
  const face=id=>'./assets/'+id+'.png';
  let selected='fawaz',visited=new Set(),lastTick=0,toastTimer,modal=null,lastFocus=null,atlasMode="world";
  try{selected=localStorage.getItem('horizons-avatar-v2')||selected;if(!names[selected])selected='fawaz';const v=JSON.parse(localStorage.getItem('horizons-discovered-v1')||'[]');if(Array.isArray(v))visited=new Set(v.filter(id=>world.destinations.some(d=>d.id===id)));}catch(e){}
  const ui=document.createElement('div');ui.id='horizons-ui';ui.dir='rtl';
  ui.innerHTML=`
   <div id="hz-brand"><span class="hz-symbol">✦</span><div><b>آفاق الشمال</b><small>NORTHERN HORIZONS</small></div></div>
   <div id="hz-place">واحة السدر · عالم مفتوح ٣٦ كم²</div>
   <nav id="hz-dock" aria-label="أدوات الاستكشاف">
    <button id="hz-map-button" aria-label="خريطة العالم والتنقل السريع"><span>⌘</span>العالم</button>
    <button id="hz-drive"><span>▰</span>قيادة</button>
    <button id="hz-run"><span>↟</span>ركض</button>
    <button id="hz-camera"><span>◎</span>الكاميرا</button>
   </nav>
   <button id="hz-profile" aria-label="اختيار الشخصية"><img id="hz-face" alt="" src="${face(selected)}"><span class="name"><b id="hz-name">${names[selected]}</b><small>غيّر شخصيتك</small></span></button>
   <div id="hz-help">WASD حركة · Space قفز · Q تصويب · F إطلاق · M العالم</div>
   <div id="hz-toast" role="status" hidden></div>
   <section id="hz-map" class="hz-overlay" role="dialog" aria-modal="true" aria-labelledby="hz-map-title" hidden>
    <div class="hz-sheet"><div class="hz-head"><div><small>EXPLORE THE NORTH</small><h2 id="hz-map-title">العالم بين يديك</h2></div><button class="hz-close" aria-label="إغلاق الخريطة">×</button></div>
     <p class="hz-sub">٦ × ٦ كم من الحكايات. اختر منطقة للانتقال إليها، أو استمتع بالطريق. <span id="hz-discovered"></span></p>
     <div class="hz-atlas-toolbar"><button type="button" data-atlas="world" aria-pressed="true">العالم</button><button type="button" data-atlas="campus" aria-pressed="false">تفاصيل الحرم</button><span><i></i> طريق رئيسي <i></i> شارع محلي <i></i> ممر مدخل</span></div>
     <div id="hz-map-body"><canvas id="hz-atlas" width="720" height="720" aria-label="خريطة المناطق وشبكة الطرق وموقع اللاعب"></canvas><div class="hz-regions"></div></div>
    </div>
   </section>
   <section id="hz-characters" class="hz-overlay" role="dialog" aria-modal="true" aria-labelledby="hz-char-title" hidden>
    <div class="hz-sheet"><div class="hz-head"><div><small>YOUR STORY, YOUR CHARACTER</small><h2 id="hz-char-title">من سيبدأ الرحلة؟</h2></div><button class="hz-close" aria-label="إغلاق الشخصيات">×</button></div>
     <p class="hz-sub">ثلاث شخصيات من آفاق الشمال. اختيارك يُحفظ تلقائيًا.</p><div class="hz-characters">${Object.keys(names).map(id=>`<button class="hz-card" data-character="${id}" aria-pressed="${id===selected}"><img src="${face(id)}" alt="تصميم شخصية ${names[id]}"><b>${names[id]}</b><small>${roles[id]}</small></button>`).join('')}</div>
    </div>
   </section>
   <section id="hz-intro" class="hz-overlay" role="dialog" aria-modal="true" aria-label="مرحبًا بك في آفاق الشمال">
    <div class="hz-welcome"><div class="hz-eyebrow">A WORLD BEYOND THE CAMPUS</div><h1>آفاق<br> <em>الشمال.</em></h1>
     <p>خارج حدود الحرم، تبدأ الحكاية.<br>تجوّل في ساحة النخيل، قد مركبتك في الحلبة، وشاهد الأفق من سطح الفندق.</p>
     <div class="hz-stats"><div><strong>36</strong><small>كيلومترًا مربعًا</small></div><div><strong>${world.destinations.length}</strong><small>وجهات للاستكشاف</small></div><div><strong>03</strong><small>شخصيات قابلة للعب</small></div></div>
     <button id="hz-start" class="hz-start">ابدأ رحلتك <span aria-hidden="true">←</span></button>
     <p class="hz-footnote">عالم تخيّلي مستوحى من الشمال · يدعم اللمس ولوحة المفاتيح</p>
    </div>
   </section>`;
  document.body.appendChild(ui);
  function toast(text){$('hz-toast').textContent=text;$('hz-toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('hz-toast').hidden=true,4000);}
  function setCharacter(id){selected=id;api.setCharacter(id);$('hz-face').src=face(id);$('hz-name').textContent=names[id];for(const b of ui.querySelectorAll('[data-character]')){b.classList.toggle('active',b.dataset.character===id);b.setAttribute('aria-pressed',String(b.dataset.character===id));}try{localStorage.setItem('horizons-avatar-v2',id);}catch(e){}}
  function close(){if(modal){$(modal).hidden=true;modal=null;}document.body.classList.remove('hz-modal');api.pause(false);if(lastFocus)lastFocus.focus();}
  function open(id){if(modal)$(modal).hidden=true;lastFocus=document.activeElement;modal=id;$(id).hidden=false;document.body.classList.add('hz-modal');api.pause(true);if(id==='hz-map'){drawMap();refreshRegions();}$ (id).querySelector('button').focus();}
  ui.querySelectorAll('.hz-close').forEach(b=>b.onclick=close);
  ui.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{setCharacter(b.dataset.character);close();toast('تبدأ الرحلة مع '+names[selected]);});
  $('hz-start').onclick=()=>{close();toast('أهلًا بك! افتح «العالم» لاكتشاف الوجهات الجديدة.');};
  $('hz-profile').onclick=()=>open('hz-characters');$('hz-map-button').onclick=()=>open('hz-map');
  $('hz-drive').onclick=()=>{api.drive();sync();};$('hz-run').onclick=()=>{api.run();sync();};$('hz-camera').onclick=()=>{api.camera();sync();};
  function sync(){const s=api.state();$('hz-drive').classList.toggle('active',s.driving);$('hz-run').classList.toggle('active',s.running);$('hz-camera').classList.toggle('active',s.overview);}
  for(const b of ui.querySelectorAll('[data-atlas]'))b.onclick=()=>{
   atlasMode=b.dataset.atlas;
   for(const c of ui.querySelectorAll('[data-atlas]'))c.setAttribute('aria-pressed',String(c===b));
   drawMap();
  };
  const destinations=ui.querySelector('.hz-regions');
  for(const d of world.destinations){const b=document.createElement('button');b.dataset.destination=d.id;b.innerHTML=`<span class="icon" style="color:${d.color}">${d.icon}</span><span>${d.name}<small>${d.tag}</small></span><span class="distance"></span>`;b.onclick=()=>{api.travel(d);close();toast('وصلت إلى '+d.name);};destinations.appendChild(b);}
  function refreshRegions(){const p=api.state().position;for(const d of world.destinations){const b=destinations.querySelector('[data-destination="'+d.id+'"]'),dist=Math.hypot(d.x-p.x,d.z-p.z);b.querySelector('.distance').textContent=(visited.has(d.id)?'✓ ':'')+(dist>999?(dist/1000).toFixed(1)+' كم':Math.round(dist)+' م');}$('hz-discovered').textContent='اكتشفت '+visited.size+' من '+world.destinations.length+' وجهة.';}
  function drawMap(){
   const c=$('hz-atlas'),g=c.getContext('2d'),W=c.width,campus=atlasMode==='campus';
   const extent=campus?650:3000,scale=W/(extent*2),centerX=campus?-110:0;
   const px=x=>(x-centerX+extent)*scale,pz=z=>(z+extent)*scale;
   const line=(x1,z1,x2,z2,color,width)=>{
    g.beginPath();g.strokeStyle=color;g.lineWidth=width;g.moveTo(px(x1),pz(z1));g.lineTo(px(x2),pz(z2));g.stroke();
   };
   g.fillStyle='#e8dec7';g.fillRect(0,0,W,W);
   const grid=campus?100:500;
   for(let p=-3000;p<=3000;p+=grid){line(p,-3000,p,3000,'#b4a78950',1);line(-3000,p,3000,p,'#b4a78950',1);}
   g.fillStyle='#b4c4a1';g.beginPath();g.ellipse(px(-1250),pz(1200),285*scale,235*scale,0,0,Math.PI*2);g.fill();
   g.fillStyle='#78a8ad';g.beginPath();g.ellipse(px(-1250),pz(1200),150*scale,100*scale,0,0,Math.PI*2);g.fill();
   g.fillStyle='#c1af95';g.fillRect(px(-200),pz(-200),400*scale,400*scale);
   g.fillStyle='#96ab85';g.fillRect(px(287),pz(-26),156*scale,132*scale);
   if(campus)for(const b of api.campusBuildings?.()||[]){
    g.fillStyle='#938474';g.fillRect(px(b.x-b.w/2),pz(b.z-b.d/2),b.w*scale,b.d*scale);
   }
   for(const path of api.walkways?.()||[])line(path.x,path.z,path.roadX,path.roadZ,'#a26d51',Math.max(.65,path.width*scale));
   for(const r of api.roads?.()||world.roads){
    const arterial=r.kind==='arterial',width=Math.max(1.4,r.width*scale);
    line(r.x1,r.z1,r.x2,r.z2,'#f8f0db',width+1.7);
    line(r.x1,r.z1,r.x2,r.z2,arterial?'#6f805c':'#777b71',width);
   }
   if(!campus){
    g.beginPath();g.strokeStyle='#6c7474';g.lineWidth=3.6;g.ellipse(px(1500),pz(2100),380*scale,210*scale,0,0,Math.PI*2);g.stroke();
    g.fillStyle='#87908a';g.fillRect(px(905),pz(1935),130*scale,100*scale);
   }
   const marks=campus?[{name:'الحرم الجامعي',x:0,z:-218},{name:'الملعب',x:365,z:-86},{name:'المطار',x:510,z:-308},{name:'ضاحية الملك فهد',x:-410,z:100}]:world.destinations;
   g.textAlign='center';g.font='bold 14px Tahoma';
   for(const d of marks){
    g.fillStyle='#244e43';g.beginPath();g.arc(px(d.x),pz(d.z),5.5,0,Math.PI*2);g.fill();g.strokeStyle='#faf0da';g.lineWidth=2;g.stroke();
    g.lineWidth=3;g.strokeText(d.name,px(d.x),pz(d.z)-12);g.fillText(d.name,px(d.x),pz(d.z)-12);
   }
   const p=api.state().position;g.fillStyle='#bd6043';g.beginPath();g.arc(px(p.x),pz(p.z),8,0,Math.PI*2);g.fill();g.strokeStyle='#fff8e5';g.lineWidth=3;g.stroke();
   g.fillStyle='#496851';g.font='bold 13px Arial';g.fillText('N ↑',W-29,32);g.textAlign='left';
   const distance=campus?200:1000;g.fillRect(18,W-26,distance*scale,2);g.fillText(campus?'200 m':'1 km',18,W-31);
  }
  document.addEventListener('keydown',e=>{if(document.body.classList.contains('pro-modal'))return;if(e.target.matches('input,textarea,select'))return;if(e.code==='Escape'&&modal){e.preventDefault();close();}else if(e.code==='KeyM'&&modal!=='hz-intro'){e.preventDefault();modal==='hz-map'?close():open('hz-map');}if(e.code==='Tab'&&modal){const buttons=[...$(modal).querySelectorAll('button')],first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  setCharacter(selected);open('hz-intro');
  return {toast,update(t){if(t-lastTick<650)return;lastTick=t;const p=api.state().position;let nearest=null,dist=Infinity;for(const d of world.destinations){const r=Math.hypot(p.x-d.x,p.z-d.z);if(r<dist){nearest=d;dist=r;}if(r<140&&!visited.has(d.id)){visited.add(d.id);try{localStorage.setItem('horizons-discovered-v1',JSON.stringify([...visited]));}catch(e){}if(modal!=='hz-intro')toast(visited.size===world.destinations.length?'اكتملت الرحلة! اكتشفت كل وجهات الشمال.':'اكتشفت '+d.name+' · '+visited.size+' / '+world.destinations.length);}}$('hz-place').textContent=(dist<550?nearest.name:'طريق الأفق')+' · '+visited.size+' / '+world.destinations.length+' وجهة';sync();if(modal==='hz-map'){drawMap();refreshRegions();}}};
 };
})();
