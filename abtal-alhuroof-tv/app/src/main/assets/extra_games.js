/* Abtal Academy expansion pack. ES5 only; bundled offline for Android 4.4 WebView. */
(function(root){
'use strict';
var E={};
E.modes={
 'arabic-last':['حرف النهاية','ما آخر حرف في الكلمة؟','📚','arabic'],
 'arabic-middle':['حرف الوسط','اكتشف حرف وسط الكلمة','✏️','arabic'],
 'arabic-order':['ترتيب الحروف','ما الحرف التالي في الأبجدية؟','🔠','arabic'],
 'arabic-vowels':['حركات الحروف','اختيار الفتحة والضمة والكسرة','🎵','arabic'],
 'arabic-tanween':['التنوين','اختر الكلمة المنونة','🧩','arabic'],
 'arabic-long':['المدود','تعرف على المد بالألف والواو والياء','📖','arabic'],
 'arabic-sun':['اللام الشمسية والقمرية','اقرأ الكلمة وحدد اللام','☀️','arabic'],
 'arabic-words-count':['عدد الكلمات','كم كلمة في الجملة؟','📚','arabic'],
 'arabic-opposites':['الكلمة وضدها','تعرف على الأضداد','🎯','arabic'],
 'arabic-join':['كوّن الكلمة','اجمع مقطعين لتكوين كلمة','🧩','arabic'],
 'arabic-odd':['الكلمة المختلفة','اختر الكلمة التي لا تنتمي','🧠','arabic'],
 'arabic-category':['عائلة الكلمات','صنّف الحيوانات والفواكه','🍎','arabic'],
 'arabic-syllables':['مقاطع الكلمة','اختر المقطع الذي يبدأ الكلمة','✏️','arabic'],
 'math-before':['العدد السابق','ما العدد قبل العدد؟','🔢','math'],
 'math-after':['العدد التالي','ما العدد بعد العدد؟','🔢','math'],
 'math-tens':['عد بالعشرات','10، 20، 30...','🧮','math'],
 'math-even':['الأعداد الزوجية','تمييز العدد الزوجي','🎯','math'],
 'math-odd':['الأعداد الفردية','تمييز العدد الفردي','⭐','math'],
 'math-between':['العدد المفقود','أكمل العدد بين عددين','🧩','math'],
 'math-bigger':['اختر الأكبر','أي عدد أكبر؟','🏆','math'],
 'math-smaller':['اختر الأصغر','أي عدد أصغر؟','🎯','math'],
 'math-double':['الضعف','ضعف العدد باستخدام الصور','🍎','math'],
 'math-half':['النصف','نصف عدد من الأشياء','🍓','math'],
 'math-story':['مسائل مصورة','قصص قصيرة للجمع والطرح','📖','math'],
 'math-places':['آحاد وعشرات','تركيب الأعداد حتى 99','🧮','math'],
 'math-time':['الساعة','تعرف على الساعة الكاملة','⏰','math'],
 'math-numberword':['اسم العدد','اربط العدد باسمه','🔠','math'],
 'english-upper':['Capital Letters','Choose the capital letter','🔤','english'],
 'english-lower':['Small Letters','Choose the small letter','🔤','english'],
 'english-animals':['Animal Friends','Choose the animal name','🦁','english'],
 'english-fruits':['Fruit Market','Name the tasty fruit','🍎','english'],
 'english-body':['My Body','Learn the body parts','✋','english'],
 'english-shape':['English Shapes','Circle, square, triangle','🔵','english'],
 'english-spellmissing':['Missing Letter','Fill in the missing letter','✏️','english'],
 'english-first':['First Sound','Find the starting letter','🎵','english'],
 'english-translate':['Picture Translator','What does the word mean?','🌍','english'],
 'english-next':['ABC Train','Which letter is next?','🚀','english'],
 'english-opposites':['Opposite Words','Hot / Cold, Big / Small','🎯','english'],
 'english-truefalse':['Yes or No','Is the statement true?','🏆','english'],
 'science-animals':['عالم الحيوانات','تعرّف على الحيوانات الجميلة','🦁','science'],
 'science-habitats':['بيوت الحيوانات','أين يعيش الحيوان؟','🌳','science'],
 'science-sounds':['أصوات الحيوانات','من يقول مواء أو نباح؟','🐱','science'],
 'science-weather':['الطقس','شمس ومطر وغيوم','☀️','science'],
 'science-seasons':['الفصول الأربعة','الصيف والشتاء والربيع والخريف','🌈','science'],
 'science-senses':['الحواس الخمس','العين والأذن والأنف','👁️','science'],
 'science-body':['جسم الإنسان','ما وظيفة كل عضو؟','✋','science'],
 'science-plants':['النباتات','ماذا تحتاج النبتة؟','🌳','science'],
 'science-life':['السلوك الصحيح','مواقف حياتية صغيرة','❤️','science'],
 'science-transport':['وسائل النقل','بر وبحر وجو','✈️','science'],
 'science-safety':['سلامتك أولاً','كيف نتصرف بأمان؟','🏠','science'],
 'science-food':['الغذاء الصحي','اختر العادة المفيدة','🍎','science'],
 'brain-pattern':['أنماط الألوان','أكمل النمط الملون','🌈','brain'],
 'brain-odd':['ابحث عن المختلف','أي عنصر لا ينتمي؟','🧠','brain'],
 'brain-memorylook':['ذاكرة الصورة','انظر، تذكر ثم أجب','⭐','brain'],
 'brain-categories':['صنّف الصور','اختر من المجموعة الصحيحة','🧩','brain'],
 'brain-direction':['الاتجاهات','يمين ويسار وفوق وتحت','🎯','brain'],
 'brain-compare':['قارن الأشياء','أيها أطول أو أصغر؟','🔺','brain'],
 'brain-story':['فكّر واحزر','ألغاز منطقية بسيطة','🧠','brain'],
 'hero-riddle':['لغز البطل','ألغاز خفيفة مع البطل','👑','adventure'],
 'challenge-truefalse':['صح أم خطأ','هل تعرف الحقيقة؟','🏆','adventure'],
 'challenge-speed':['السباق الذهبي','خمسة أسئلة سريعة متغيرة','🚀','adventure'],
 'challenge-super':['تحدي العوالم','أسئلة من كل المجالات','🌟','adventure']
};
E.groups={
 science:{title:'عالم الاكتشاف',desc:'الحيوانات • الطبيعة • جسم الإنسان',icon:'🌳',cls:'en',
 list:['science-animals','science-habitats','science-sounds','science-weather','science-seasons','science-senses','science-body','science-plants','science-life','science-transport','science-safety','science-food']},
 brain:{title:'مدينة الذكاء',desc:'ألغاز • أنماط • ملاحظة',icon:'🧠',cls:'ma',
 list:['brain-pattern','brain-odd','brain-memorylook','brain-categories','brain-direction','brain-compare','brain-story']}
};
E.additional={
 arabic:['arabic-last','arabic-middle','arabic-order','arabic-vowels','arabic-tanween','arabic-long','arabic-sun','arabic-words-count','arabic-opposites','arabic-join','arabic-odd','arabic-category','arabic-syllables'],
 math:['math-before','math-after','math-tens','math-even','math-odd','math-between','math-bigger','math-smaller','math-double','math-half','math-story','math-places','math-time','math-numberword'],
 english:['english-upper','english-lower','english-animals','english-fruits','english-body','english-shape','english-spellmissing','english-first','english-translate','english-next','english-opposites','english-truefalse'],
 adventure:['hero-riddle','challenge-truefalse','challenge-speed','challenge-super']
};
var animals=[
 ['أسد','Lion','🦁','الغابة','زئير'],['قطة','Cat','🐱','المنزل','مواء'],['كلب','Dog','🐶','المنزل','نباح'],['سمكة','Fish','🐟','الماء','لا صوت واضح'],
 ['فيل','Elephant','🐘','الغابة','نهيم'],['جمل','Camel','🐪','الصحراء','رغاء'],['حصان','Horse','🐎','المزرعة','صهيل'],
 ['خروف','Sheep','🐑','المزرعة','ثغاء'],['دب','Bear','🐻','الغابة','زمجرة'],['ثعلب','Fox','🦊','الغابة','عواء'],
 ['ضفدع','Frog','🐸','البركة','نقيق'],['نحلة','Bee','🐝','الحديقة','طنين'],['عصفور','Bird','🐦','الشجرة','زقزقة'],
 ['أرنب','Rabbit','🐇','الجحر','لا صوت واضح'],['بطّة','Duck','🦆','البركة','بطبطة'],['حوت','Whale','🐳','البحر','غناء']
];
var fruits=[['تفاح','Apple','🍎'],['موز','Banana','🍌'],['برتقال','Orange','🍊'],['ليمون','Lemon','🍋'],['عنب','Grapes','🍇'],['فراولة','Strawberry','🍓']];
var body=[['يد','Hand','✋','اللمس'],['عين','Eye','👁️','الرؤية'],['أذن','Ear','👂','السمع'],['أنف','Nose','👃','الشم'],['فم','Mouth','👄','الأكل والتحدث'],['قدم','Foot','🦶','المشي']];
var opposites=[['كبير','صغير','🐘'],['سريع','بطيء','🐎'],['طويل','قصير','🌳'],['فوق','تحت','🚀'],['حار','بارد','☀️'],['نظيف','متسخ','💧'],['ليل','نهار','🌙'],['مفتوح','مغلق','🚪'],['سعيد','حزين','⭐']];
var enOpp=[['Hot','Cold','☀️'],['Big','Small','🐘'],['Up','Down','🚀'],['Happy','Sad','⭐'],['Day','Night','🌙'],['Yes','No','✅'],['Open','Close','🚪']];
var simpleWords=[['بيت','بي','ت','🏠'],['قلم','قَ','لَم','✏️'],['كتاب','كِ','تاب','📚'],['موز','مو','ز','🍌'],['سمك','سَ','مَك','🐟'],['قمر','قَ','مَر','🌙'],['وردة','وَر','دَة','🌹'],['باب','با','ب','🚪'],['جمل','جَ','مَل','🐪'],['أسد','أَ','سَد','🦁']];
var trueFacts=[
 ['الشمس تضيء في النهار','صح','☀️'],['السمكة تعيش في الماء','صح','🐟'],['الطيور تطير بجناحيها','صح','🐦'],
 ['نستخدم الأذن للشم','خطأ','👂'],['نغسل أيدينا قبل الأكل','صح','✋'],['الثلج ساخن','خطأ','🧊'],
 ['القمر يظهر في السماء','صح','🌙'],['النبات يحتاج إلى ماء','صح','🌳'],['الأسد حيوان أليف يعيش عادة في المنزل','خطأ','🦁'],
 ['الرقم خمسة أكبر من الرقم سبعة','خطأ','🔢'],['نستخدم العين للرؤية','صح','👁️'],['المطر ينزل من الغيوم','صح','🌈'],
 ['الموز لونه أزرق دائمًا','خطأ','🍌'],['حرف ب يأتي بعد أ','صح','📚'],['اليد تساعدنا على الإمساك بالأشياء','صح','✋']
];
var activities=[
 ['أين نعبر الطريق بأمان؟','ممر المشاة',['في وسط السيارات','من خلف سيارة','عند الإشارة الحمراء للمشاة'],'🚦'],
 ['ما أول شيء تفعله قبل تناول الطعام؟','أغسل يدي',['ألعب بالطين','لا أفعل شيئًا','أرمي طعامي'],'✋'],
 ['ماذا نفعل عند سماع جرس إنذار الحريق؟','نبتعد ونتبع تعليمات الكبار',['نختبئ','نعود للألعاب','نقترب من النار'],'🏠'],
 ['ماذا تفعل إذا وجدت دواء؟','أطلب مساعدة شخص كبير',['أتذوقه','ألعب به','أشاركه مع صديقي'],'💊'],
 ['كيف نحافظ على أسناننا؟','نفرش أسناننا',['نأكل حلوى فقط','لا نشرب الماء','نتركها بلا تنظيف'],'🦷'],
 ['ماذا نقول عندما يساعدنا أحد؟','شكرًا',['وداعًا','لا شيء','ابتعد'],'❤️'],
 ['ماذا يحتاج النبات لينمو؟','الماء والضوء',['الثلج وحده','البلاستيك','الظلام فقط'],'🌳'],
 ['إذا رأيت قمامة على الأرض، أين نضعها؟','في سلة المهملات',['في النهر','تحت الطاولة','على الطريق'],'🏠'],
 ['كيف نعبر الطريق؟','مع شخص كبير ومن الممر',['نجري بين السيارات','دون أن ننظر','نقف في وسط الطريق'],'🚦'],
 ['ما الطعام المفيد لجسمك؟','الفاكهة والخضار',['الحلوى فقط','المشروبات الغازية فقط','رقائق البطاطس فقط'],'🍎']
];
var vocabAr=[['واحد','1'],['اثنان','2'],['ثلاثة','3'],['أربعة','4'],['خمسة','5'],['ستة','6'],['سبعة','7'],['ثمانية','8'],['تسعة','9'],['عشرة','10']];
var abj='أبتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
var alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var shapeEN=[['Circle','🔵'],['Triangle','🔺'],['Square','🟩'],['Star','⭐'],['Heart','❤️']];
var wheather=[['مشمس','☀️','الشمس ساطعة'],['ممطر','🌧️','ينزل المطر'],['غائم','☁️','الغيوم كثيرة'],['ثلجي','❄️','تسقط الثلوج']];
var season=[['الصيف','حار','☀️'],['الشتاء','بارد','❄️'],['الربيع','تتفتح الأزهار','🌺'],['الخريف','تتساقط أوراق بعض الأشجار','🍂']];
var senses=[['العين','نرى','👁️'],['الأذن','نسمع','👂'],['الأنف','نشم','👃'],['اللسان','نتذوق','👄'],['الجلد','نلمس','✋']];
var vehicles=[['طائرة','الجو','✈️'],['سيارة','البر','🚗'],['سفينة','البحر','🚢'],['دراجة','البر','🚲'],['قارب','الماء','🛶'],['قطار','البر','🚆']];
var logic=[['أحمر أحمر أزرق أحمر أحمر ؟','أزرق',['أخضر','أصفر','أسود'],'🌈'],
 ['دائرة مربع دائرة مربع ؟','دائرة',['مثلث','نجمة','مربع'],'🔵'],
 ['1 ، 2 ، 1 ، 2 ، ؟','1',['3','4','5'],'🔢'],
 ['⭐ 🌙 ⭐ 🌙 ؟','⭐',['🌙','🍎','🐟'],'🌈']];
function q(t,v,correct,pool,ctx,sub,lang,cls){
 return {text:t,visual:v,options:ctx.options(correct,pool,4),correct:String(correct),say:String(correct),sub:sub||'',lang:lang||'ar',visualClass:cls||''};
}
function numeric(t,v,ans,min,max,ctx){
 var pool=[];for(var i=min;i<=max;i++)if(i!==ans)pool.push(String(i));
 return q(t,v,String(ans),pool,ctx,'احسب ثم اضغط OK','ar','letters');
}
function sample(ctx,a){return ctx.pick(a);}
E.question=function(k,ctx){
 var a,b,c,i,n,m,answer,pool,all,idx,pair,other,word,op;
 var ar=ctx.ar, english=ctx.english,colors=ctx.colors;
 switch(k){
 case 'arabic-last':
  a=sample(ctx,ar); word=a[1]; answer=word.charAt(word.length-1);return q('بأي حرف تنتهي كلمة «'+word+'»؟',a[2],answer,abj,ctx);
 case 'arabic-middle':
  a=sample(ctx,[['بيت','ي','🏠'],['قلم','ل','✏️'],['جمل','م','🐪'],['شمس','م','☀️'],['قمر','م','🌙'],['حوت','و','🐳'],['موز','و','🍌']]);return q('ما الحرف الأوسط في كلمة «'+a[0]+'»؟',a[2],a[1],abj,ctx);
 case 'arabic-order':
  idx=ctx.rnd(abj.length-1);return q('ما الحرف الذي يأتي بعد «'+abj[idx]+'»؟',abj[idx]+' ← ؟',abj[idx+1],abj,ctx,'رتب الحروف الهجائية','ar','letters');
 case 'arabic-vowels':
  a=sample(ctx,['ب','ت','ج','د','س','م','ن','ف','ق','ر']);b=sample(ctx,[['َ','فتحة'],['ُ','ضمة'],['ِ','كسرة']]);
  return q('ما اسم حركة الحرف الملون؟',a+b[0],b[1],['فتحة','ضمة','كسرة'],ctx,'انظر إلى العلامة فوق الحرف أو تحته','ar','letters');
 case 'arabic-tanween':
  a=sample(ctx,[['كتابٌ','تنوين الضم'],['قلمًا','تنوين الفتح'],['بيتٍ','تنوين الكسر'],['وردٌ','تنوين الضم'],['بابًا','تنوين الفتح'],['نجمٍ','تنوين الكسر']]);
  return q('ما نوع التنوين في هذه الكلمة؟',a[0],a[1],['تنوين الضم','تنوين الفتح','تنوين الكسر'],ctx,'اقرأ الحركة في آخر الكلمة','ar','letters');
 case 'arabic-long':
  a=sample(ctx,[['باب','الألف','🚪'],['نور','الواو','⭐'],['فيل','الياء','🐘'],['كتاب','الألف','📚'],['عصفور','الواو','🐦'],['حليب','الياء','🥛'],['سماء','الألف','☀️']]);
  return q('ما حرف المد في كلمة «'+a[0]+'»؟',a[2],a[1],['الألف','الواو','الياء'],ctx);
 case 'arabic-sun':
  a=sample(ctx,[['الشمس','شمسية','☀️'],['السماء','شمسية','🌈'],['النجم','شمسية','⭐'],['القمر','قمرية','🌙'],['البيت','قمرية','🏠'],['الكتاب','قمرية','📚'],['الوردة','قمرية','🌹']]);
  return q('اللام في كلمة «'+a[0]+'» هي لام...؟',a[2],a[1],['شمسية','قمرية'],ctx);
 case 'arabic-words-count':
  a=sample(ctx,[['أنا أحب أمي',3],['الطفل يقرأ كتابًا',3],['العصفور فوق الشجرة',3],['أبي يقود السيارة',3],['في البيت قطة جميلة',4],['ذهب محمد إلى المدرسة',4],['هذه وردة جميلة',3],['أنا ألعب في الحديقة',4]]);
  return numeric('كم كلمة في الجملة؟',a[0],a[1],1,5,ctx);
 case 'arabic-opposites':
  a=sample(ctx,opposites);return q('ما ضد كلمة «'+a[0]+'»؟',a[2],a[1],opposites.map(function(v){return v[1];}),ctx);
 case 'arabic-join':
  a=sample(ctx,simpleWords);return q('اجمع المقطعين: '+a[1]+' + '+a[2],a[3],a[0],simpleWords.map(function(v){return v[0];}),ctx);
 case 'arabic-odd':
  a=sample(ctx,[['🍎 تفاح','🍌 موز','🍇 عنب','🚗 سيارة'],['🐱 قطة','🦁 أسد','🐘 فيل','🍌 موز'],['🚗 سيارة','✈️ طائرة','🚢 سفينة','🍎 تفاح'],['📚 كتاب','✏️ قلم','📖 دفتر','🐟 سمك']]);
  return {text:'أي صورة لا تنتمي إلى المجموعة؟',visual:'🧠',options:a,correct:a[3],say:a[3]};
 case 'arabic-category':
  a=sample(ctx,animals.concat(fruits.map(function(v){return [v[0],v[1],v[2],'فاكهة'];})));answer=a.length>4?'حيوان':'فاكهة';return q('هذه الصورة من أي مجموعة؟',a[2],answer,['حيوان','فاكهة','وسيلة نقل','أداة مدرسية'],ctx);
 case 'arabic-syllables':
  a=sample(ctx,simpleWords);return q('بأي مقطع تبدأ كلمة «'+a[0]+'»؟',a[3],a[1],simpleWords.map(function(v){return v[1];}),ctx);
 case 'math-before':n=2+ctx.rnd(30);return numeric('ما العدد الذي يسبق '+n+' ؟',String(n),n-1,0,40,ctx);
 case 'math-after':n=1+ctx.rnd(30);return numeric('ما العدد الذي يأتي بعد '+n+' ؟',String(n),n+1,0,40,ctx);
 case 'math-tens':n=1+ctx.rnd(8);return numeric('عدّ بالعشرات: ماذا بعد '+n*10+' ؟',n*10+' ، ؟',n*10+10,10,100,ctx);
 case 'math-even':n=2+ctx.rnd(20);n=n-(n%2);return numeric('أي عدد زوجي يأتي بعد '+n+' ؟',n+' ، ؟',n+2,1,40,ctx);
 case 'math-odd':n=1+ctx.rnd(20);n=n%2?n:n+1;return numeric('أي عدد فردي يأتي بعد '+n+' ؟',n+' ، ؟',n+2,1,45,ctx);
 case 'math-between':n=1+ctx.rnd(30);return numeric('ما العدد بينهما؟',n+' ، ؟ ، '+(n+2),n+1,0,40,ctx);
 case 'math-bigger':n=2+ctx.rnd(30);m=n+1+ctx.rnd(9);return q('اختر العدد الأكبر',n+'   ↔   '+m,String(m),[String(n),String(n-1),String(m-1),String(m+1)],ctx,'قارن الرقمين','ar','letters');
 case 'math-smaller':n=1+ctx.rnd(30);m=n+1+ctx.rnd(9);return q('اختر العدد الأصغر',n+'   ↔   '+m,String(n),[String(m),String(n+1),String(m+1)],ctx,'قارن الرقمين','ar','letters');
 case 'math-double':n=1+ctx.rnd(9);return numeric('ما ضعف العدد '+n+' ؟',n+' + '+n+' = ؟',2*n,0,20,ctx);
 case 'math-half':n=2*(1+ctx.rnd(10));return numeric('ما نصف '+n+' ؟',n+' ÷ 2 = ؟',n/2,0,20,ctx);
 case 'math-story':n=2+ctx.rnd(8);m=1+ctx.rnd(6);answer=ctx.rnd(2)===0;return numeric(answer?'معك '+n+' تفاحات وأعطاك صديقك '+m+'. كم صار لديك؟':'معك '+(n+m)+' تفاحات أكلت '+m+'. كم بقي؟','🍎',answer?n+m:n,0,20,ctx);
 case 'math-places':n=1+ctx.rnd(9);m=ctx.rnd(10);return numeric('كم يساوي '+n+' عشرات و '+m+' آحاد؟',n+'0 + '+m,n*10+m,0,99,ctx);
 case 'math-time':n=1+ctx.rnd(12);return q('كيف نقرأ هذه الساعة؟',n+':00','الساعة '+n,['الساعة '+((n%12)+1),'الساعة '+((n+1)%12+1),'الساعة '+((n+3)%12+1)],ctx,'الوقت بالساعة الكاملة','ar','letters');
 case 'math-numberword':a=sample(ctx,vocabAr);return q('ما اسم هذا العدد؟',a[1],a[0],vocabAr.map(function(v){return v[0];}),ctx,'اقرأ العدد','ar','letters');
 case 'english-upper':idx=ctx.rnd(alpha.length);return q('Choose the CAPITAL letter',alpha[idx].toLowerCase(),alpha[idx],alpha,ctx,'اختر الحرف الكبير','en','letters');
 case 'english-lower':idx=ctx.rnd(alpha.length);return q('Choose the small letter',alpha[idx],alpha[idx].toLowerCase(),alpha.map(function(v){return v.toLowerCase();}),ctx,'اختر الحرف الصغير','en','letters');
 case 'english-animals':a=sample(ctx,animals);return q('What animal is this?',a[2],a[1],animals.map(function(v){return v[1];}),ctx,'اختر اسم الحيوان بالإنجليزية','en');
 case 'english-fruits':a=sample(ctx,fruits);return q('Name the fruit',a[2],a[1],fruits.map(function(v){return v[1];}),ctx,'اسم الفاكهة بالإنجليزية','en');
 case 'english-body':a=sample(ctx,body);return q('What body part is this?',a[2],a[1],body.map(function(v){return v[1];}),ctx,'تعرف على أجزاء الجسم','en');
 case 'english-shape':a=sample(ctx,shapeEN);return q('What shape is this?',a[1],a[0],shapeEN.map(function(v){return v[0];}),ctx,'الأشكال بالإنجليزية','en');
 case 'english-spellmissing':a=sample(ctx,english.filter(function(v){return v[1].length>=3&&v[1].length<=7;}));idx=1+ctx.rnd(a[1].length-2);return q('Complete the word: '+a[1].slice(0,idx)+'_'+a[1].slice(idx+1),a[2],a[1].charAt(idx),alpha,ctx,'املأ الحرف الناقص','en');
 case 'english-first':a=sample(ctx,english);return q('Which letter starts '+a[1]+'?',a[2],a[0],alpha,ctx,'الحرف الأول للكلمة','en');
 case 'english-translate':a=sample(ctx,fruits.concat(animals));return q('What does '+a[1]+' mean?',a[2],a[0],fruits.concat(animals).map(function(v){return v[0];}),ctx,'الترجمة العربية','en');
 case 'english-next':idx=ctx.rnd(alpha.length-1);return q('Which letter is next?',alpha[idx]+' → ?',alpha[idx+1],alpha,ctx,'ترتيب حروف ABC','en','letters');
 case 'english-opposites':a=sample(ctx,enOpp);return q('What is the opposite of '+a[0]+'?',a[2],a[1],enOpp.map(function(v){return v[1];}),ctx,'أضداد الإنجليزية','en');
 case 'english-truefalse':a=sample(ctx,animals);answer=ctx.rnd(2)===0;b=answer?a[1]:sample(ctx,animals.filter(function(v){return v[1]!==a[1];}))[1];
  return q('Is this a '+b+'?',a[2],answer?'Yes':'No',['Yes','No'],ctx,'هل الاسم يطابق الصورة؟','en');
 case 'science-animals':a=sample(ctx,animals);return q('ما اسم هذا الحيوان؟',a[2],a[0],animals.map(function(v){return v[0];}),ctx);
 case 'science-habitats':a=sample(ctx,animals);return q('أين يعيش «'+a[0]+'» عادة؟',a[2],a[3],['الغابة','المنزل','الماء','المزرعة','الصحراء','البركة','الشجرة','الجحر','البحر','الحديقة'],ctx);
 case 'science-sounds':a=sample(ctx,animals.filter(function(v){return v[4]!=='لا صوت واضح';}));return q('من يصدر صوت «'+a[4]+'»؟',a[2],a[0],animals.map(function(v){return v[0];}),ctx);
 case 'science-weather':a=sample(ctx,wheather);return q('ما حالة الطقس الظاهرة؟',a[1],a[0],wheather.map(function(v){return v[0];}),ctx);
 case 'science-seasons':a=sample(ctx,season);return q('في أي فصل: '+a[1]+'؟',a[2],a[0],season.map(function(v){return v[0];}),ctx);
 case 'science-senses':a=sample(ctx,senses);return q('ما العضو الذي به '+a[1]+'؟',a[2],a[0],senses.map(function(v){return v[0];}),ctx);
 case 'science-body':a=sample(ctx,body);return q('بماذا تساعدنا '+a[0]+'؟',a[2],a[3],body.map(function(v){return v[3];}),ctx);
 case 'science-plants':a=sample(ctx,[['ماء','💧'],['ضوء الشمس','☀️'],['هواء','🌳'],['تربة','🌹']]);return q('ما الذي تحتاجه النبتة للنمو؟',a[1],a[0],['ماء','ضوء الشمس','هواء','تربة','بلاستيك','حلوى'],ctx);
 case 'science-life':a=sample(ctx,activities);return q(a[0],a[3],a[1],a[2],ctx,'اختر التصرف الصحيح');
 case 'science-transport':a=sample(ctx,vehicles);return q('أين تتحرك '+a[0]+' عادة؟',a[2],a[1],['الجو','البر','البحر','الماء'],ctx);
 case 'science-safety':a=sample(ctx,activities.slice(0,4).concat(activities.slice(8)));return q(a[0],a[3],a[1],a[2],ctx);
 case 'science-food':a=sample(ctx,[['فواكه','🍎'],['خضار','🥕'],['ماء','💧'],['حليب','🥛']]);return q('ما الخيار المفيد من هذه المجموعة؟',a[1],a[0],['فواكه','خضار','ماء','حليب','مشروبات غازية فقط','حلوى فقط'],ctx);
 case 'brain-pattern':a=sample(ctx,logic);return q('أكمل النمط التالي',a[0],a[1],a[2],ctx,'انظر إلى ترتيب الأشكال','ar','letters');
 case 'brain-odd':a=sample(ctx,[['🍎','🍇','🍌','🚗'],['🐟','🐪','🐱','📖'],['🚗','🚐','✈️','🍋'],['🔺','🟩','🔵','🐶']]);return {text:'ابحث عن الصورة المختلفة',visual:'🧠',options:a,correct:a[3],say:a[3]};
 case 'brain-memorylook':a=sample(ctx,[['🍎 🍌 🍎','🍌',['🍋','🍇','🍓'],'🍎'],['🐱 🐱 🦁','🦁',['🐟','🐶','🐪'],'🦁'],['⭐ 🌙 ⭐','🌙',['☀️','🍎','🌈'],'🌙']]);return q('انظر جيدًا: أي رمز ظهر مرة واحدة؟',a[0],a[1],a[2],ctx,'استخدم قوة الملاحظة','ar','letters');
 case 'brain-categories':a=sample(ctx,animals.concat(fruits));answer=a.length>3?'حيوان':'فاكهة';return q('إلى أي عائلة تنتمي الصورة؟',a[2],answer,['حيوان','فاكهة','وسيلة نقل','شكل هندسي'],ctx);
 case 'brain-direction':a=sample(ctx,[['→','يمين'],['←','يسار'],['↑','أعلى'],['↓','أسفل']]);return q('ما اتجاه السهم؟',a[0],a[1],['يمين','يسار','أعلى','أسفل'],ctx,'حدد الاتجاه الصحيح','ar','letters');
 case 'brain-compare':a=sample(ctx,[['الفيل','أكبر','🐘'],['النملة','أصغر','🐞'],['الشجرة','أطول','🌳'],['الريشة','أخف','🪶']]);return q('أي وصف يناسب '+a[0]+' غالبًا؟',a[2],a[1],['أكبر','أصغر','أطول','أخف'],ctx);
 case 'brain-story':a=sample(ctx,[['إذا كان اليوم الاثنين، ما اليوم الذي يليه؟','الثلاثاء',['الأحد','الجمعة','الخميس'],'📅'],['لديك يدان، كم إصبعًا في اليد الواحدة؟','5',['2','7','10'],'✋'],['إذا فتحت المظلة في المطر، ماذا تمنع؟','بلل الرأس',['النوم','الجوع','القراءة'],'☂️'],['في الصباح نرى غالبًا...','الشمس',['القمر فقط','النجوم فقط','المصباح فقط'],'☀️']]);return q(a[0],a[3],a[1],a[2],ctx);
 case 'hero-riddle':a=sample(ctx,[['من يطير بين النجوم ويراقب الفضاء؟','رائد فضاء',['طباخ','رسام','سبّاح'],'🚀'],['له خرطوم طويل وأذنان كبيرتان، من هو؟','الفيل',['القطة','السمكة','العصفور'],'🐘'],['أطير ولدي جناحان وريش، من أنا؟','الطائر',['الجمل','الأسد','الحوت'],'🐦'],['أضيء السماء نهارًا، من أنا؟','الشمس',['الكرسي','السيارة','القلم'],'☀️'],['أعيش في البحر وأسبح، من أنا؟','السمكة',['الحصان','النحلة','النمر'],'🐟']]);return q(a[0],a[3],a[1],a[2],ctx);
 case 'challenge-truefalse':a=sample(ctx,trueFacts);return q('صح أم خطأ؟ '+a[0],a[2],a[1],['صح','خطأ'],ctx);
 case 'challenge-speed':
 case 'challenge-super':
  all=['arabic-last','arabic-middle','arabic-opposites','math-before','math-after','math-double','math-story','english-animals','english-fruits','english-upper','science-habitats','science-weather','science-senses','brain-pattern','brain-direction','hero-riddle','challenge-truefalse'];
  return E.question(sample(ctx,all),ctx);
 }
 return null;
};
root.ABTAL_EXPANSION=E;
})(window);
