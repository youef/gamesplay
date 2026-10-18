/* =========================================================
   ui.js — الواجهة والقوائم الكاملة:
   المتجر، البناء، الديكور، العقارات، المحفظة، السباق، الإعدادات
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, {S,ST}=ND, $=ND.$;
const TH=[0xffffff,0x1f7a3d,0x2c5aa0,0x222222,0xb08a55];
let cur='set';

const ch=(l,a,v,on)=>`<button class="o${on?' on':''}" onclick="A('${a}','${v}')">${l}</button>`;
const TITLES={shop:'🛍 المتجر',build:'🔨 البناء الحر',decor:'🌿 ديكور الحديقة',
  prop:'🏠 العقارات والتطوير',wallet:'💼 المحافظ المالية',race:'🏁 سباق التحدي',set:'⚙️ الإعدادات'};
const TABS=[['shop','🛍 المتجر'],['build','🔨 البناء'],['decor','🌿 الديكور'],['prop','🏠 العقارات'],
  ['wallet','💼 المحفظة'],['race','🏁 السباق'],['set','⚙️ الإعدادات']];
const tabs=()=>TABS.map(t=>ch(t[1],'tab',t[0],cur==t[0])).join('');

function skinUI(){
  let s='';
  [0,1].forEach(i=>{
    s+=`<div>${ND.PL[i].nm}: `+TH.map((c,j)=>ch(['⚪','🟢','🔵','⚫','🟤'][j],'sk',i+':c:'+j,S.skin[i].c==c)).join('')
     +[[1,'🔴 شماغ'],[2,'⚪ غترة'],[0,'🧢 طاقية']].map(g=>ch(g[1],'sk',i+':g:'+g[0],S.skin[i].g==g[0])).join('')+'</div>';
  });
  return s;
}
const YN=['حوش فاضي','نخيل وعشب','بيت شعر','مسبح','ملعب كرة','نافورة وإضاءة وطنية'];
const YP=[0,120000,300000,600000,1100000,2000000];

function propRows(){
  let s='';
  ND.PLOTS.forEach((pl,i)=>{
    const st=ND.plotState(i);
    const stt=st.owner<0?'🟢 للبيع':('👑 ملك '+ND.walName(st.owner)+' — ⭐'+st.lv);
    s+=`<div class="row"><b>${pl.n}</b> — ${stt}<br>
      <span class="sm">السعر ${ND.fmt(pl.p)} | دخل المستوى ${ND.fmt(pl.inc)}/ث | قيمة البيع ${ND.fmt(ND.plotValue(i))}</span><br>
      ${st.owner<0?ch('🛒 شراء — '+ND.fmt(pl.p),'pb',i):''}
      ${st.owner>=0?ch('⬆ تطوير — '+ND.fmt(ND.plotDevCost(i)),'pd',i):''}
      ${st.owner>=0?ch('💰 بيع','ps',i):''}
    </div>`;
  });
  return s;
}

function menu(t){
  cur=t;
  let h='';
  if(t==='start'){
    h=`<h2>🇸🇦 فواز وزياد – اليوم الوطني 96</h2>
      <p>عالم مفتوح لمدينة عرعر: <b>واجهة شمالية جديدة فيها مطار ✈ وحي سكني وعقارات</b>،
      حديقة بمسار سباق دائري 🏁، محافظ مالية منفصلة 10 مليون لكل لاعب 💼، ديكور حر 🌿،
      مشاة وكرات وأطفال يلعبون ⚽.</p>
      <h3>عدد اللاعبين</h3>
      ${ch('لاعب واحد','pl',1,S.players==1)}${ch('لاعبين (شاشة مقسومة)','pl',2,S.players==2)}
      <h3>🎮 التحكم</h3>
      <div class="sm">
      📱 الآيباد: عصا يسار الشاشة للحركة + «ركوب/نزول» + «تفحيط»،
      اسحب بإصبعك على المشهد أو استخدم أزرار ⟲ ⟳ ➕ ➖ ⬆ ⬇ لضبط الكاميرا.<br>
      ⌨️ فواز: WASD + E + Space | زياد: الأسهم + Enter + Shift يمين<br>
      🎥 كاميرا فواز: Z/X تدوير، R/F تقريب، T/G ميلان | كاميرا زياد: ,/. تدوير، PageUp/PageDown تقريب، I/K ميلان
      </div>
      <p><button class="o go" onclick="A('close')">▶ ابدأ اللعب</button></p>`;
  }else{
    h=`<h2>${TITLES[t]}</h2><div class="tabs">${tabs()}</div>`;
    if(t==='shop'){
      h+=`<h3>💼 فواز: ${ND.fmt(S.wal[0])} | زياد: ${ND.fmt(S.wal[1])}</h3><h3>🚗 السيارات</h3>`;
      ND.CT.forEach((c,i)=>{
        h+=S.cars.includes(i)?`<button class="o on">${c.n} ✅</button>`
          :ch(c.n+' – '+ND.fmt(c.p),'buy',i);
      });
      h+=`<h3>🏡 تطوير الحوش (${YN[S.yard]})</h3>`
        +(S.yard<5?ch('ترقية: '+YN[S.yard+1]+' – '+ND.fmt(YP[S.yard+1]),'yard',0)
                  :'<button class="o on">الحوش مكتمل ✅</button>')
        +`<h3>📚 الدراسة: مستوى ${S.study}</h3>
          <p class="sm">قفوا في دائرة المدرسة لتزيد دخلكم 10% لكل مستوى على كل مصادر الأرباح.</p>`;
    }
    else if(t==='build'){
      h+=`<h3>💼 ${ND.fmt(S.wal[0])} | ${ND.fmt(S.wal[1])} — مبانيكم: ${S.builds.length}
          (إيجار ${ND.fmt(ND.rentPerSec())}/ث)</h3>
        <p class="sm">امشوا لمكان فاضي داخل أي حارة (مو بالشارع) واختاروا المبنى — يُبنى أمامكم مباشرة،
        والإيجار يوزَّع على المحفظتين.</p>`
        +ND.BT.map((b,i)=>ch(b.n+' – '+ND.fmt(b.p),'bd',i)).join('')
        +ch('↩ هدم آخر مبنى (استرجاع 50%)','bu',0);
    }
    else if(t==='decor'){
      h+=`<h3>💼 ${ND.fmt(S.wal[0])} | ${ND.fmt(S.wal[1])} — قطع الديكور: ${S.decor.length}</h3>
        <p class="sm">اختاروا عنصرًا ليوضع أمام فواز، وأي عنصر متداخل يُزال تلقائيًا بنصف القيمة.
        المواقف 🅿 تُستخدم لعودة السيارات إليها بعد الركن.</p>`
        +ND.DEC.map((d,i)=>ch(d.n+' – '+ND.fmt(d.p),'dc',i)).join('')
        +ch('↩ إزالة آخر عنصر (استرجاع 30%)','dr',0);
    }
    else if(t==='prop'){
      h+=`<h3>💼 فواز: ${ND.fmt(S.wal[0])} | زياد: ${ND.fmt(S.wal[1])}</h3>
        <p class="sm">قطع الواجهة الشمالية: اشترِ، طوّر حتى 3 مستويات، وبيع —
        الدخل التلقائي يُودَع في محفظة المالك فقط.</p>`+propRows();
    }
    else if(t==='wallet'){
      const inc=ND.propIncomePerSec();
      h+=`<h3>👤 فواز: ${ND.fmt(S.wal[0])} 💰</h3>
          <h3>👤 زياد: ${ND.fmt(S.wal[1])} 💰</h3>
          <h3>📊 مصادر الدخل</h3><div class="sm">
          • إيجار المباني: ${ND.fmt(ND.rentPerSec())}/ث (مقسم على المحفظتين)<br>
          • دخل العقارات: ${ND.fmt(inc)}/ث (لصاحب القطعة)<br>
          • المهام، العملات، الأعلام، التفحيط، الدراسة والسباق (تُوزَّع بالتساوي)</div>
          <h3>🔁 تحويل بين المحفظتين</h3>
          ${ch('فواز → زياد 250,000','tr','0,1,250000')}${ch('فواز → زياد 1,000,000','tr','0,1,1000000')}
          ${ch('زياد → فواز 250,000','tr','1,0,250000')}${ch('زياد → فواز 1,000,000','tr','1,0,1000000')}`;
    }
    else if(t==='race'){
      const r=ST.race;
      h+=`<p class="sm">سباق تحدٍ حول الحديقة الشمالية 🏁: عدّاد تنازلي يجمّد السيارتين،
        ثم 6 نقاط التفاف على المسار الدائري — علامة 🏆 للفائز.</p>
        <h3>🎁 الجوائز: الفائز 600,000 | الثاني 200,000 (للمحفظة)</h3>`
        +(r?`<button class="o on">السباق جارٍ… (${r.phase==='cd'?'عد تنازلي':'على الحلبة'})</button>`
           :ch('🏁 ابدأ سباق التحدي الآن','race',0))
        +`<p class="sm">تنطلق البداية من خط السباق شمال الحديقة، وإن كنتم سيرًا تُمنحوا سيارة سباق مؤقتة
        وتعودون إلى موقعكم بعد السباق. في اللاعب الواحد يواجه خصمًا ذكيًا،
        ولا يبدأ السباق تلقائيًا أثناء قيادتكم.</p>`;
    }
    else{
      h+=`<h3>اللاعبون</h3>${ch('1','pl',1,S.players==1)}${ch('2','pl',2,S.players==2)}
        <h3>تقسيم الشاشة</h3>${ch('جنب بعض','sp','h',S.split=='h')}${ch('فوق وتحت','sp','v',S.split=='v')}
        <h3>الجودة</h3>${ch('منخفضة','q',1,S.q==1)}${ch('متوسطة','q',2,S.q==2)}${ch('عالية','q',3,S.q==3)}
        <h3>👕 الشخصية</h3>${skinUI()}
        <h3>الصوت</h3>${ch('تشغيل','snd',1,S.sound)}${ch('إيقاف','snd',0,!S.sound)}
        <h3>🎮 مفاتيح الكاميرا</h3><div class="sm">
        فواز: Z/X تدوير • R/F تقريب • T/G ميلان<br>
        زياد: ,/. تدوير • PageUp/PageDown تقريب • I/K ميلان<br>
        أو اسحب بإصبعك على المشهد وستخدم أزرار ⟲⟳➕➖⬆⬇</div>
        <h3>البيانات</h3>${ch('🗑 مسح التقدم','reset',0)}`;
    }
  }
  $('card').innerHTML=h;
}
ND.menu=menu;

function A(a,v){
  let msg='';
  if(a==='tab'){ST.paused=1;$('menu').style.display='flex';menu(v);return}
  if(a==='close'){$('menu').style.display='none';ST.paused=0;
    if(!ST.run){ST.run=1;try{document.documentElement.requestFullscreen()}catch(e){}ND.snd(500,.1)}
    return}
  if(a==='pl'){S.players=+v;ND.applyQ()}
  if(a==='sp'){S.split=v;ND.applyQ()}
  if(a==='q'){S.q=+v;ND.applyQ()}
  if(a==='snd')S.sound=+v;
  if(a==='buy'){const c=ND.CT[+v];
    if(S.cars.includes(+v))msg='ℹ️ السيارة مملوكة';
    else if(ND.pay(c.p)<0)msg='💸 الرصيد لا يكفي ('+ND.fmt(c.p)+')';
    else{S.cars.push(+v);ND.spawnHome();msg='🚗 اشتريتم '+c.n;ND.snd(900,.3)}}
  if(a==='yard'){
    const nx=YP[S.yard+1];
    if(nx==null)msg='✅ الحوش مكتمل';
    else if(ND.pay(nx)<0)msg='💸 الرصيد لا يكفي';
    else{S.yard++;ND.yardBuild();msg='🏡 تم تطوير الحوش!';ND.snd(900,.3)}}
  if(a==='bd')msg=ND.buildAdd(+v,0);
  if(a==='bu')msg=ND.buildDel();
  if(a==='dc')msg=ND.placeDecor(+v,0);
  if(a==='dr')msg=ND.removeLastDecor();
  if(a==='pb')msg=ND.plotBuy(+v);
  if(a==='pd')msg=ND.plotDev(+v);
  if(a==='ps')msg=ND.plotSell(+v);
  if(a==='race'){msg=ND.startRace();$('menu').style.display='none';ST.paused=0;
    if(!ST.run)ST.run=1;}
  if(a==='tr'){const q=String(v).split(',');
    msg=ND.transfer(+q[0],+q[1],+q[2])?'✅ حوّلتم '+ND.fmt(+q[2])+' إلى محفظة '+ND.walName(+q[1]):'⚠️ تعذّر التحويل'}
  if(a==='sk'){
    const q=v.split(':'),i=+q[0],p=ND.PL[i];
    if(q[1]==='c')S.skin[i].c=TH[+q[2]];else S.skin[i].g=+q[2];
    ND.scene.remove(p.kid.g);
    p.kid=ND.mkKid(S.skin[i].c,S.skin[i].g,p.nm,i?'#5eead4':'#ffb347');
    p.kid.g.visible=!p.car;
    p.kid.g.position.set(p.x,.1+p.y,p.z);p.kid.g.rotation.y=p.ry;
    if(p.car)p.kid.g.visible=false}
  if(a==='reset'){try{localStorage.removeItem('nd96')}catch(e){}location.reload();return}
  if(msg)ND.toast(msg);
  ND.save();menu(cur);
}
ND.A=window.A=A;

/* شريط الأزرار العلوي */
document.querySelectorAll('#mb button').forEach(b=>{b.onclick=()=>A('tab',b.dataset.t)});

/* ---------- شريط الحالة ---------- */
ND.hud=function(){
  $('mny').textContent='👤 '+ND.fmt(S.wal[0])+'  |  👤 '+ND.fmt(S.wal[1])+'  |  📚 '+S.study;
  const m=ND.mis(),n=ND.need();
  $('ms').textContent=m.t.replace('{n}',n)
    +(m.n?' ('+Math.floor(ST.mp)+'/'+n+')':'')
    +(ST.studyT>0?' ⏳'+Math.ceil(6-ST.studyT):'')
    +(ST.race?' | 🏁 '+(ST.race.phase==='cd'?'استعدوا!':'جاري السباق'):'');
  ND.UI.forEach((d,i)=>{
    const p=ND.PL[i];
    d.querySelector('.hud').textContent=p.nm+(p.car?' 🚗 '+Math.round(p.sp*3.6)+' كم/س'
      +(p.ds>30?' 🔥'+Math.floor(p.ds):''):' 🚶');
    d.querySelector('[data-k=ac]').textContent=p.car?'نزول':'ركوب';
  });
};
})();
