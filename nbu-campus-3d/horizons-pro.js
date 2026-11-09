(function(){
 'use strict';
 const KEY='horizons-progression-v2';
 const Driving=globalThis.HorizonsDriving||(typeof module!=='undefined'?require('./horizons-driving.js'):null);
 const fleet=Driving.fleet;
 const knownVehicle=id=>Object.prototype.hasOwnProperty.call(fleet,id);
 const defaults=()=>({xp:0,credits:1500,engine:0,handling:0,kit:0,paint:fleet.horizon.paint,vehicle:'datsun',paints:{},
  distance:0,hits:0,laps:0,best:0,drift:0,bestDrift:0,rewards:{}});
 function validate(raw){
  const s=defaults();
  if(!raw||typeof raw!=='object')return s;
  for(const key of ['xp','credits','distance','hits','laps','best','drift','bestDrift'])
   if(Number.isFinite(raw[key]))s[key]=Math.max(0,Math.min(raw[key],1e8));
  for(const key of ['engine','handling','kit'])s[key]=Math.max(0,Math.min(3,Math.floor(Number(raw[key])||0)));
  const validColor=c=>typeof c==='string'&&/^#[\da-f]{6}$/i.test(c);
  if(validColor(raw.paint))s.paint=raw.paint;
  s.vehicle=knownVehicle(raw.vehicle)?raw.vehicle:'horizon';
  for(const id of Object.keys(fleet))if(validColor(raw.paints?.[id]))s.paints[id]=raw.paints[id];
  for(const id of ['drive','targets','race','drift'])if(raw.rewards?.[id]===true)s.rewards[id]=true;
  return s;
 }
 const level=s=>Math.min(30,1+Math.floor(s.xp/300));
 const upgradeCost=(rank)=>[500,1100,2200][rank]||0;
 function upgrade(s,key){if(!['engine','handling','kit'].includes(key)||s[key]>=3)return false;const cost=upgradeCost(s[key]);if(s.credits<cost)return false;s.credits-=cost;s[key]++;return true;}
 function raceStep(race,position,points,time,driving){const cp=points[race.next],distance=Math.hypot(position.x-cp.x,position.z-cp.z);if(!driving||distance>=31)return {status:'running',next:race.next,distance};return {status:race.next===0?'finished':'checkpoint',next:(race.next+1)%points.length,distance,time:Math.max(0,(time-race.start)/1000)};}
 const logic={defaults,validate,level,upgradeCost,upgrade,raceStep};if(typeof module!=='undefined')module.exports=logic;
 if(typeof window==='undefined')return;
 window.HorizonsProLogic=logic;
 window.createHorizonsPro=function(api){
  const {THREE:T,scene,car,player:pl,canvas,world,districts}=api,$=id=>document.getElementById(id);
  let saved;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}const progress=validate(saved);
  let avatar=null,blaster=null,onRoof=pl.position.y>40,aiming=false,crouching=false,jump=0,jumpVelocity=0,waveUntil=0,fireHeld=false,boostHeld=false,shotAt=-1000,ammo=30,reloadUntil=0,hitFlash=0,lastSave=0,lastHud=0,race=null,lastPosition=pl.position.clone(),nitro=100,garageOpen=false,lastUpdateTime=0,handbrakeHeld=false,combo=0,comboQuiet=0;
  const ui=document.createElement('div');ui.id='hz-pro';ui.dir='rtl';ui.innerHTML=`
   <div id="pro-progress"><span id="pro-level">LV 1</span><span id="pro-credits">١٬٥٠٠ رصيد</span><div class="pro-xp"><i id="pro-xp-bar"></i></div></div>
   <div id="pro-speed" hidden><b id="pro-speed-number">0</b><small>كم/س <span id="pro-gear">D</span></small><div class="pro-boost"><i id="pro-nitro-bar"></i></div></div>
   <div id="pro-drift-score" hidden aria-live="off"></div>
   <div id="pro-crosshair" hidden><i></i><b>+</b></div><div id="pro-ammo" hidden>30 / 30</div>
   <div id="pro-actions"><button id="pro-aim" aria-pressed="false">◎<small>تصويب</small></button><button id="pro-fire">✦<small>إطلاق F</small></button><button id="pro-jump">↟<small>قفز Space</small></button><button id="pro-crouch" aria-pressed="false">⌄<small>انحناء C</small></button><button id="pro-fireworks" hidden>✧<small>ألعاب نارية</small></button><button id="pro-boost" hidden>ϟ<small>نيترو Shift</small></button><button id="pro-drift" aria-label="فرامل يدوية وانزلاق" hidden>≋<small>تفحيط Space</small></button></div>
   <button id="pro-interact" hidden></button><div id="pro-race" hidden></div>
   <section id="pro-garage" role="dialog" aria-modal="true" aria-labelledby="pro-garage-title" hidden><div class="pro-garage-sheet"><div class="hz-head"><div><small>BUILD YOUR NEXT CHAPTER</small><h2 id="pro-garage-title">المرآب والتحديات</h2></div><button class="hz-close" id="pro-close" aria-label="إغلاق المرآب">×</button></div><p class="hz-sub">ارتقِ بمركبتك بمكافآت القيادة والسباق والتدريب. كل تطوير يغيّر أداء السيارة فعليًا.</p><div id="pro-balance"></div><h3>اختر مركبتك</h3><div id="pro-fleet"></div><div id="pro-upgrades"></div><div id="pro-paints"><b>لون المركبة</b>${['#bf4f3e','#376b68','#3b6383','#c0a567','#d7dcda'].map(c=>`<button data-paint="${c}" style="background:${c}" aria-label="لون ${c}"></button>`).join('')}</div><div id="pro-missions"></div><div class="pro-garage-links"><button id="pro-go-garage">انتقل إلى المرآب</button><button id="pro-start-race">ابدأ جولة السباق</button><button id="pro-start-drift">اذهب إلى ساحة التفحيط</button></div><p class="hz-sub">WASD للحركة، Space للقفز، C للانحناء، Q للتصويب، F للإطلاق، R للتلقيم، G للحركة التعبيرية. في القيادة: Shift للنيترو، S للفرملة والرجوع. للتفحيط، سرّع ثم لفّ واضغط Space أو اضغط مطولًا زر التفحيط مع التوجيه.</p></div></section>`;
  document.body.appendChild(ui);
  const missions=[{id:'drive',name:'رحّالة الشمال',detail:'قد السيارة لمسافة ١٫٥ كم',max:1500,value:()=>progress.distance},{id:'targets',name:'عين الصقر',detail:'أصب ١٥ هدفًا في ميدان التدريب',max:15,value:()=>progress.hits},{id:'race',name:'دورة الأفق',detail:'أكمل جولة عبر بوابات الحلبة الثماني',max:1,value:()=>progress.laps},{id:'drift',name:'ملك الانزلاق',detail:'اجمع ١٬٥٠٠ نقطة تفحيط متصلة أو عبر عدة جولات',max:1500,value:()=>progress.drift}];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(e){}}
  function reward(xp,credits){progress.xp+=xp;progress.credits+=credits;const previous=lastLevel;if(level(progress)>previous){lastLevel=level(progress);api.toast('وصلت إلى المستوى '+lastLevel+'!');}save();}
  let lastLevel=level(progress);
  function finishMissions(){for(const m of missions)if(!progress.rewards[m.id]&&m.value()>=m.max){progress.rewards[m.id]=true;reward(180,700);api.toast('اكتمل تحدي «'+m.name+'» · +٧٠٠ رصيد');}}
  car.traverse(node=>{
   if(!node.isMesh)return;
   node.geometry.dispose();
   for(const material of Array.isArray(node.material)?node.material:[node.material])material.dispose();
  });
  car.clear();
  const models=new Map(),previews=[],trails=Driving.trails(T,scene);
  let activeModel;
  function getModel(id){
   if(!models.has(id))models.set(id,Driving.model(T,id,districts.environment));
   return models.get(id);
  }
  function syncVehicle(){
   for(const id of Object.keys(fleet)){
    const model=getModel(id);
    model.paint.color.set(progress.paints[id]||(id==='horizon'?progress.paint:fleet[id].paint));
    model.setKit(progress.kit);
   }
   activeModel=getModel(progress.vehicle);
   if(activeModel.root.parent!==car){car.clear();car.add(activeModel.root);}
   for(const p of previews){
    if(p.root)scene.remove(p.root);
    p.root=getModel(p.id).root.clone(true);
    p.root.position.set(p.x,.29,p.z);p.root.rotation.y=Math.PI;p.root.visible=false;
    scene.add(p.root);
   }
  }
  for(const [id,x] of [['datsun',1025],['hilux',1050],['horizon',1075]]){
   const z=2206;previews.push({id,x,z,root:null});world.addCollider(x,z,4.1,7.2);
  }
  syncVehicle();
  const partGeometry=new T.BoxGeometry(1,1,1);
  function box(w,h,d,m,x,y,z,parent){
   const mesh=new T.Mesh(partGeometry.clone(),m);
   mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  function renderFleet(){
   const container=$('pro-fleet');container.replaceChildren();
   for(const [id,spec] of Object.entries(fleet)){
    const button=document.createElement('button');button.type='button';
    button.setAttribute('aria-pressed',String(progress.vehicle===id));
    button.innerHTML='<small>'+spec.badge+'</small><b>'+spec.name+'</b><span>'+spec.detail+'</span>';
    button.onclick=()=>{progress.vehicle=id;syncVehicle();save();renderFleet();api.toast('مركبتك الآن '+spec.name);};
    container.append(button);
   }
  }
  function renderGarage(){renderFleet();const inGarage=Math.hypot(pl.position.x-districts.garage.x,pl.position.z-districts.garage.z)<85;$('pro-balance').textContent='المستوى '+level(progress)+' · الرصيد '+Math.floor(progress.credits).toLocaleString('ar-SA');$('pro-upgrades').replaceChildren();for(const [key,label,desc] of [['engine','المحرك','تسارع أقوى وسرعة قصوى أعلى'],['handling','التماسك','استجابة أفضل للمقود والفرامل'],['kit','حزمة الرحلات','حماية أمامية، جنوط مضيئة وحامل سقف']]){const row=document.createElement('div');row.className='pro-upgrade';row.innerHTML='<div><b>'+label+' · '+progress[key]+'/3</b><small>'+desc+'</small></div>';const b=document.createElement('button');b.textContent=progress[key]>=3?'مكتمل':upgradeCost(progress[key]).toLocaleString('ar-SA')+' رصيد';b.disabled=progress[key]>=3||!inGarage||progress.credits<upgradeCost(progress[key]);b.onclick=()=>{if(upgrade(progress,key)){save();syncVehicle();renderGarage();api.toast('تم تطوير '+label);}};row.append(b);$('pro-upgrades').append(row);}$('pro-missions').innerHTML='<h3>تحدياتك</h3>'+missions.map(m=>'<div class="pro-mission"><b>'+(progress.rewards[m.id]?'✓ ':'')+m.name+'</b><small>'+m.detail+' · '+Math.floor(Math.min(m.max,m.value())).toLocaleString('ar-SA')+' / '+m.max.toLocaleString('ar-SA')+'</small><progress max="'+m.max+'" value="'+Math.min(m.max,m.value())+'"></progress></div>').join('')+(inGarage?'':'<p class="hz-sub">انتقل إلى المرآب لتركيب التطويرات. يمكنك اختيار اللون في أي وقت.</p>');}
  function openGarage(){garageOpen=true;$('pro-garage').hidden=false;document.body.classList.add('pro-modal');api.pause(true);renderGarage();$('pro-close').focus();}
  function closeGarage(){garageOpen=false;$('pro-garage').hidden=true;document.body.classList.remove('pro-modal');api.pause(false);save();}
  $('pro-close').onclick=closeGarage;$('pro-go-garage').onclick=()=>{closeGarage();api.travel(world.destinations.find(d=>d.id==='circuit'));};
  $('pro-start-race').onclick=()=>{closeGarage();api.travel({...world.destinations.find(d=>d.id==='circuit'),x:1120,z:2100,yaw:0});if(!api.state().driving)api.drive();race={start:performance.now(),next:1};api.toast('انطلق! اتبع بوابات الحلبة بالترتيب.');};
  $('pro-start-drift').onclick=()=>{
   closeGarage();api.travel(districts.driftPad);if(!api.state().driving)api.drive();
   api.toast('تقدّم، ثم لفّ مع Space لتبدأ الانزلاق.');
  };
  for(const b of ui.querySelectorAll('[data-paint]'))b.onclick=()=>{
   progress.paints[progress.vehicle]=b.dataset.paint;
   if(progress.vehicle==='horizon')progress.paint=b.dataset.paint;
   syncVehicle();save();
  };
  const garageButton=document.createElement('button');garageButton.id='pro-garage-button';garageButton.innerHTML='<span>⚙</span>التطوير';garageButton.onclick=openGarage;
  function mount(){const dock=$('hz-dock');if(dock&&!garageButton.parentElement)dock.append(garageButton);}
  let audio=null,engineOsc=null,engineGain=null;
  function initAudio(){if(audio||!api.soundEnabled())return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();engineOsc=audio.createOscillator();engineGain=audio.createGain();engineOsc.type='sawtooth';engineGain.gain.value=0;engineOsc.connect(engineGain).connect(audio.destination);engineOsc.start();}
  document.addEventListener('pointerdown',()=>{initAudio();audio?.resume();},{once:true});
  function shotSound(){if(!api.soundEnabled())return;initAudio();if(!audio)return;audio.resume();const buffer=audio.createBuffer(1,audio.sampleRate*.08,audio.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);const source=audio.createBufferSource(),gain=audio.createGain(),filter=audio.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1800;gain.gain.value=.075;source.connect(filter).connect(gain).connect(audio.destination);source.start();}
  const ray=new T.Raycaster(),tracerGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),tracer=new T.Line(tracerGeo,new T.LineBasicMaterial({color:0xffd27d,transparent:true,opacity:.85,depthWrite:false}));scene.add(tracer);tracer.visible=false;
  const flash=new T.Mesh(new T.SphereGeometry(.14,8,6),new T.MeshBasicMaterial({color:0xffd46c,toneMapped:false}));scene.add(flash);flash.visible=false;let tracerUntil=0;
  function setAiming(value){
   aiming=value;
   $('pro-aim').setAttribute('aria-pressed',String(aiming));
  }
  function setAvatar(next){
   avatar=next;
   setAiming(false);
   blaster=new T.Group();
   blaster.position.set(0,-.048,.086);
   blaster.visible=false;
   avatar.hands[0].add(blaster);
   const housing=new T.MeshStandardMaterial({color:0x29454b,metalness:.55,roughness:.42});
   const stripe=new T.MeshStandardMaterial({color:0xc38454,metalness:.3,roughness:.55});
   const emitter=new T.MeshBasicMaterial({color:0x9be8ea});
   box(.14,.46,.13,housing,0,-.1,0,blaster);
   box(.16,.2,.15,stripe,0,-.19,0,blaster);
   box(.1,.12,.1,emitter,0,-.35,0,blaster);
   box(.08,.12,.12,housing,0,.08,-.06,blaster);
  }
  const actionAllowed=state=>!state.driving&&!state.building&&!state.inside&&!state.seated;
  function poseAvatar(t,moving,phase,running){
   if(!avatar)return;
   avatar.animate(phase,moving?1:0,running&&!crouching&&!aiming);
   const shot=t-shotAt,reloading=reloadUntil>t;
   avatar.root.scale.y=crouching?.76:1;
   blaster.visible=aiming||shot<230||reloading;
   if(jump>0){
    avatar.legs[0].rotation.x=-.55;
    avatar.legs[1].rotation.x=.32;
    avatar.arms[1].rotation.x=-.6;
    avatar.shins[0].rotation.x=.45;avatar.shins[1].rotation.x=.89;
   }
   if(t<waveUntil){
    avatar.arms[1].rotation.x=-2.45;
    avatar.arms[1].rotation.z=.35+Math.sin(t*.018)*.24;
   }else avatar.arms[1].rotation.z=0;
   if(blaster.visible){
    avatar.arms[0].rotation.x=reloading?-.63:-1.42-(shot<180?.23*(1-shot/180):0);
    avatar.elbows[0].rotation.x=reloading?-.67:-.14;
    if(reloading){avatar.arms[1].rotation.x=-.89;avatar.elbows[1].rotation.x=-.61;}
   }
  }
  function shoot(t){const s=api.state();if(s.paused||!actionAllowed(s)||t-shotAt<(avatar?.profile.fire||190))return;if(reloadUntil>t)return;if(ammo<=0){reloadUntil=t+(avatar?.profile.reload||1800);api.toast('إعادة تلقيم…');return;}ammo--;shotAt=t;shotSound();ray.setFromCamera(new T.Vector2(0,0),api.camera);const pick=districts.targets.filter(a=>a.down<=0),hits=ray.intersectObjects(pick.map(a=>a.mesh),false);const end=hits[0]?.point||ray.ray.at(110,new T.Vector3()),start=pl.position.clone().add(new T.Vector3(0,1.45,0));const direction=ray.ray.direction;start.addScaledVector(direction,.9);tracer.geometry.setFromPoints([start,end]);tracer.visible=true;flash.position.copy(start);flash.visible=true;tracerUntil=t+80;if(hits[0]){const target=pick.find(a=>a.mesh===hits[0].object);target.down=3.2;progress.hits++;reward(18,25);hitFlash=t+150;finishMissions();}$('pro-ammo').textContent=ammo+' / 30';}
  function requestJump(){const s=api.state();if(s.paused||!actionAllowed(s)||jump>0)return;jumpVelocity=avatar?.profile.jump||7.4;jump=.01;}
  function toggleAim(){const s=api.state();if(s.paused||!actionAllowed(s))return;setAiming(!aiming);if(aiming)api.setAimView();}
  function interact(){const state=api.state();if(state.paused||!actionAllowed(state))return false;if(onRoof){onRoof=false;api.place(districts.hotelEntrance.x,0,districts.hotelEntrance.z);return true;}const hotel=districts.hotelEntrance;if(Math.hypot(pl.position.x-hotel.x,pl.position.z-hotel.z)<55||Math.hypot(pl.position.x-districts.elevator.x,pl.position.z-districts.elevator.z)<16){onRoof=true;setAiming(false);api.place(districts.roof.x,districts.roof.y,districts.roof.z);api.setRoofView();districts.fireworks(performance.now());api.toast('سطح فندق الأفق · المسبح والمدينة تحتك');return true;}if(Math.hypot(pl.position.x-districts.garage.x,pl.position.z-districts.garage.z)<85){openGarage();return true;}return false;}
  $('pro-interact').onclick=interact;$('pro-aim').onclick=toggleAim;$('pro-jump').onclick=requestJump;$('pro-crouch').onclick=()=>{crouching=!crouching;$('pro-crouch').setAttribute('aria-pressed',String(crouching));};
  $('pro-fire').onclick=e=>{if(e.detail===0)shoot(performance.now());};
  $('pro-fireworks').onclick=()=>districts.fireworks(performance.now());
  for(const [id,change] of [['pro-fire',v=>fireHeld=v],['pro-boost',v=>boostHeld=v],['pro-drift',v=>handbrakeHeld=v]]){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);change(true);if(id==='pro-fire')shoot(performance.now());});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>change(false));}
  canvas.addEventListener('pointerdown',e=>{if(aiming&&e.button===0){fireHeld=true;shoot(performance.now());}});window.addEventListener('pointerup',()=>fireHeld=false);
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(garageOpen){if(e.code==='Escape'){closeGarage();e.stopImmediatePropagation();}return;}if(api.state().paused)return;if(e.code==='KeyE'&&interact()){e.preventDefault();e.stopImmediatePropagation();}if(e.code==='Space'){e.preventDefault();requestJump();}if(e.code==='KeyQ'&&!e.repeat)toggleAim();if(e.code==='KeyC'&&!e.repeat){crouching=!crouching;$('pro-crouch').setAttribute('aria-pressed',String(crouching));}if(e.code==='KeyF'){fireHeld=true;shoot(performance.now());}if(e.code==='KeyR'&&ammo<30)reloadUntil=performance.now()+(avatar?.profile.reload||1800);if(e.code==='KeyG')waveUntil=performance.now()+3900;},true);
  window.addEventListener('keyup',e=>{if(e.code==='KeyF')fireHeld=false;});window.addEventListener('blur',()=>{fireHeld=false;boostHeld=false;handbrakeHeld=false;});
  function bankDrift(){
   const points=Math.floor(combo);combo=0;comboQuiet=0;
   if(points<12)return;
   progress.drift+=points;progress.bestDrift=Math.max(progress.bestDrift,points);
   reward(Math.min(120,Math.floor(points/8)),Math.min(250,Math.floor(points/4)));
  }
  function update(t,dt,moving=false,phase=0){const state=api.state(),action=actionAllowed(state);mount();if(!action&&aiming)setAiming(false);if(!onRoof&&action)pl.position.y=districts.heightAt(pl.position.x,pl.position.z);if(race&&state.paused&&lastUpdateTime)race.start+=t-lastUpdateTime;lastUpdateTime=t;
   if(state.paused){fireHeld=false;boostHeld=false;handbrakeHeld=false;}const dist=pl.position.distanceTo(lastPosition);if(state.driving&&dist<20&&dt>0){progress.distance+=dist;progress.xp+=dist*.025;progress.credits+=dist*.012;}lastPosition.copy(pl.position);
   if(jump>0&&dt){jumpVelocity-=20*dt;jump+=jumpVelocity*dt;if(jump<=0){jump=0;jumpVelocity=0;}}
   api.avatarRoot.position.y+=jump;
   poseAvatar(t,moving&&!state.driving,phase,state.running);
   for(const p of previews)p.root.visible=Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<170||state.building;
   const spec=fleet[progress.vehicle],{body,wheels,rear,flame}=activeModel;
   const paved=state.driving&&(api.isPaved?.(car.position.x,car.position.z)||districts.isPaved?.(car.position.x,car.position.z));
   trails.update(dt,car,state,paved,spec,canvas.clientHeight||420);
   if(state.driving&&state.sliding&&dt){combo+=Math.abs(state.slip)*Math.abs(state.speed)*dt*7;comboQuiet=0;}
   else if(combo){comboQuiet+=dt;if(!state.driving||comboQuiet>.72)bankDrift();}
   const boosted=state.driving&&(boostHeld||state.keys.ShiftLeft||state.keys.ShiftRight)&&nitro>1&&state.speed>3;
   nitro=Math.max(0,Math.min(100,nitro+(boosted?-24:9)*dt));flame.visible=boosted;flame.scale.y=.7+Math.sin(t*.08)*.15;
   for(const w of wheels){w.spin.rotation.x+=state.speed*dt/w.radius;if(w.front)w.pivot.rotation.y=-state.steer*.36+(state.slip||0)*.33;}
   body.rotation.z+=(state.steer*Math.min(.09,Math.abs(state.speed)*.002)-body.rotation.z)*Math.min(1,dt*7);body.position.y=Math.sin(t*.015)*Math.min(.045,Math.abs(state.speed)*.001);
   rear.emissiveIntensity=state.braking?2.4:.2;
   if(audio){engineGain.gain.setTargetAtTime(state.driving&&api.soundEnabled()&&!state.paused ? .014 : 0,audio.currentTime,.12);engineOsc.frequency.setTargetAtTime(35+Math.abs(state.speed)*3,audio.currentTime,.1);}
   if(reloadUntil&&t>=reloadUntil){ammo=30;reloadUntil=0;}
   if(fireHeld&&!state.paused)shoot(t);if(t>tracerUntil){tracer.visible=false;flash.visible=false;}
   $('pro-crosshair').hidden=!aiming||state.driving;$('pro-crosshair').classList.toggle('hit',t<hitFlash);$('pro-ammo').hidden=!action;$('pro-ammo').textContent=reloadUntil?'تلقيم…':ammo+' / 30';
   $('pro-aim').hidden=!action;$('pro-fire').hidden=!action;$('pro-jump').hidden=!action;$('pro-crouch').hidden=!action;$('pro-fireworks').hidden=!onRoof;$('pro-boost').hidden=!state.driving;$('pro-drift').hidden=!state.driving;$('pro-speed').hidden=!state.driving;
   $('pro-drift').setAttribute('aria-pressed',String(state.driving&&(handbrakeHeld||!!state.keys.Space)));
   $('pro-drift-score').hidden=!state.driving;
   $('pro-drift-score').textContent=combo>0?'تفحيط +'+Math.floor(combo).toLocaleString('ar-SA'):'أفضل تفحيط '+progress.bestDrift.toLocaleString('ar-SA');
   if(t-lastHud>250){lastHud=t;$('pro-level').textContent='LV '+level(progress);$('pro-credits').textContent=Math.floor(progress.credits).toLocaleString('ar-SA')+' رصيد';$('pro-xp-bar').style.width=(progress.xp%300)/3+'%';$('pro-speed-number').textContent=Math.round(Math.abs(state.speed)*3.6);$('pro-gear').textContent=state.speed<-.1?'R':state.speed<.1?'N':'D'+Math.min(6,1+Math.floor(state.speed/9));$('pro-nitro-bar').style.width=nitro+'%';const nearHotel=Math.hypot(pl.position.x-districts.hotelEntrance.x,pl.position.z-districts.hotelEntrance.z)<55||Math.hypot(pl.position.x-districts.elevator.x,pl.position.z-districts.elevator.z)<16,nearGarage=Math.hypot(pl.position.x-districts.garage.x,pl.position.z-districts.garage.z)<85;$('pro-interact').hidden=state.driving||state.building||(!onRoof&&!nearHotel&&!nearGarage);$('pro-interact').textContent=onRoof?'↓ العودة إلى البهو E':nearHotel?'↑ اصعد إلى سطح الفندق E':'⚙ المرآب والتطوير E';finishMissions();}
   if(race){const step=raceStep(race,pl.position,districts.checkpoints,t,state.driving);$('pro-race').hidden=false;$('pro-race').textContent='الحلبة · بوابة '+(race.next+1)+' / ٨ · '+((t-race.start)/1000).toFixed(1)+' ث · '+Math.round(step.distance)+' م';if(step.status==='finished'){const elapsed=step.time;progress.laps++;if(!progress.best||elapsed<progress.best)progress.best=elapsed;reward(200,500);api.toast('اكتملت الجولة في '+elapsed.toFixed(1)+' ثانية! +٥٠٠ رصيد');race=null;$('pro-race').hidden=true;finishMissions();}else race.next=step.next;}else $('pro-race').hidden=true;
   if(t-lastSave>4000){lastSave=t;save();}
  }
  return {update,progress,openGarage,interact,setAvatar,
   get onRoof(){return onRoof},get crouching(){return crouching},get aiming(){return aiming},
   get handbrake(){return handbrakeHeld},get sprint(){return avatar?.profile.sprint||12},
   get driveLimits(){
    const spec=fleet[progress.vehicle],keys=api.state().keys;
    const boosted=(boostHeld||keys.ShiftLeft||keys.ShiftRight)&&nitro>1;
    return {...spec,speed:spec.speed+progress.engine*7+(boosted?16:0),
     acceleration:spec.acceleration+progress.engine*7+(boosted?24:0),
     grip:spec.grip+progress.handling*.66,turn:spec.turn+progress.handling*.11,braking:44+progress.handling*8};
   },
   leaveRoof(){onRoof=false;jump=0;setAiming(false);race=null;bankDrift();lastPosition.copy(pl.position);},
   aimCamera(cam,yaw,pit){const p=pl.position,dir=new T.Vector3(-Math.sin(yaw)*Math.cos(pit-.1),-Math.sin(pit-.1),-Math.cos(yaw)*Math.cos(pit-.1)),right=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));cam.up.set(0,1,0);cam.position.copy(p).addScaledVector(dir,-3.3).addScaledVector(right,.75);cam.position.y+=1.65;cam.lookAt(cam.position.clone().addScaledVector(dir,80));api.face(yaw+Math.PI);}};
 };
})();
