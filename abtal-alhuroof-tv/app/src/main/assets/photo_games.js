/* Offline educational photography pack. Photography credited in PHOTO_CREDITS.md.
 * Never link to YouTube or redirect to external websites. No endorsement implied.
 * All original images are resized and packaged during build.
 */
(function(root){
'use strict';
var P={};
P.animals=[
 {id:'lion',ar:'أسد',en:'Lion',sound:'زئير',habitat:'الغابة',emoji:'🦁'},
 {id:'cat',ar:'قطة',en:'Cat',sound:'مواء',habitat:'المنزل',emoji:'🐱'},
 {id:'dog',ar:'كلب',en:'Dog',sound:'نباح',habitat:'المنزل',emoji:'🐶'},
 {id:'elephant',ar:'فيل',en:'Elephant',sound:'نهيم',habitat:'الغابة',emoji:'🐘'},
 {id:'horse',ar:'حصان',en:'Horse',sound:'صهيل',habitat:'المزرعة',emoji:'🐎'},
 {id:'fish',ar:'سمكة',en:'Fish',sound:'هادئ',habitat:'الماء',emoji:'🐟'}
];
P.fruits=[
 {id:'apple',ar:'تفاح',en:'Apple',emoji:'🍎'},
 {id:'banana',ar:'موز',en:'Banana',emoji:'🍌'},
 {id:'orange',ar:'برتقال',en:'Orange',emoji:'🍊'},
 {id:'grapes',ar:'عنب',en:'Grapes',emoji:'🍇'}
];
P.creators=[
 {id:'aboflah',ar:'أبو فلة',en:'AboFlah',tag:'مغامرات وألعاب وتحديات',desc:'صانع محتوى معروف بفيديوهات الألعاب والتحديات والمبادرات الخيرية'},
 {id:'mrbeast',ar:'مستر بيست',en:'MrBeast',tag:'تحديات ومغامرات',desc:'صانع فيديوهات التحديات الضخمة والمغامرات'},
 {id:'markrober',ar:'مارك روبر',en:'Mark Rober',tag:'تجارب واختراعات',desc:'مهندس وصانع فيديوهات العلوم والتجارب'}
];
P.all=P.animals.concat(P.fruits).concat(P.creators);
P.byId={};for(var i=0;i<P.all.length;i++)P.byId[P.all[i].id]=P.all[i];
P.img=function(id,extra){var a=P.byId[id],label=a?a.ar:'صورة';
 return '<img class="'+(extra||'real-photo')+'" src="photos/'+String(id).replace(/[^a-z0-9-]/g,'')+'.jpg" alt="'+label+'" onerror="this.style.display=\'none\'">';
};
P.modes={
 'photo-animal-ar':['صورة الحيوان','أجب من الصورة الحقيقية','🦁','science'],
 'photo-animal-en':['Animals in Photos','English from real photos','🐶','english'],
 'photo-fruit-ar':['سوق الفواكه','تعرف على الفواكه بالصور','🍎','science'],
 'photo-fruit-en':['Fruit Photo Quiz','Name the fruit in English','🍌','english'],
 'photo-animal-sound':['صوت هذا الحيوان','حدد اسم صوت الحيوان','🐱','science'],
 'photo-animal-home':['بيت الحيوان','أين يعيش الحيوان الذي تراه؟','🌳','science'],
 'photo-whos':['من هذا اليوتيوبر؟','تعرّف على مشاهير صناعة المحتوى','🎥','adventure'],
 'photo-creators-work':['ما محتواه؟','تعرف على اهتمامات صانعي المحتوى','🎥','adventure'],
 'photo-choose-animal':['اختر صورة الحيوان','أربع صور، صورة واحدة صحيحة','🐘','science'],
 'photo-choose-fruit':['اختر صورة الفاكهة','ابحث عن الفاكهة المطلوبة','🍇','science'],
 'photo-mixed':['مغامرة المصور','مغامرات عشوائية بالصور','📸','adventure'],
 'photo-album':['متحف الصور','ألبوم الحيوانات والفواكه والمشاهير','📸','photos'],
 'photo-memory':['ذاكرة الصور','طابق صور الحيوانات الحقيقية','🧠','photos'],
 'hunt-photo':['اصطد الصورة','ابحث عن ثلاث صور متطابقة','🎯','photos']
};
P.groups={
 photos:{title:'استوديو الصور',desc:'صور حقيقية • مشاهير • ألعاب تفاعلية',icon:'📸',cls:'en',
 list:['photo-album','photo-animal-ar','photo-choose-animal','photo-fruit-ar','photo-choose-fruit','photo-whos','photo-creators-work','photo-memory','hunt-photo','photo-mixed']}
};
P.additional={
 science:['photo-animal-ar','photo-fruit-ar','photo-animal-sound','photo-animal-home','photo-choose-animal','photo-choose-fruit'],
 english:['photo-animal-en','photo-fruit-en'],
 adventure:['photo-whos','photo-creators-work','photo-mixed']
};
function pool(arr,key){return arr.map(function(v){return v[key];});}
function question(t,id,correct,choices,ctx,sub,lang,imageChoices){
 return {text:t,sub:sub||'انظر إلى الصورة الحقيقية',visualHtml:P.img(id,'photo-main'),
  options:ctx.options(correct,choices,4),correct:String(correct),say:String(correct),lang:lang||'ar',
  imageChoices:imageChoices||null};
}
P.question=function(mode,ctx){
 var item,c,choices,all;
 if(mode==='photo-mixed')return P.question(ctx.pick(['photo-animal-ar','photo-fruit-ar','photo-animal-en','photo-fruit-en','photo-choose-animal','photo-choose-fruit','photo-whos','photo-animal-home']),ctx);
 if(mode==='photo-animal-ar'){item=ctx.pick(P.animals);return question('ما اسم الحيوان الذي في الصورة؟',item.id,item.ar,pool(P.animals,'ar'),ctx);}
 if(mode==='photo-animal-en'){item=ctx.pick(P.animals);return question('What animal is in the picture?',item.id,item.en,pool(P.animals,'en'),ctx,'ما اسم الحيوان بالإنجليزية؟','en');}
 if(mode==='photo-fruit-ar'){item=ctx.pick(P.fruits);return question('ما اسم هذه الفاكهة؟',item.id,item.ar,pool(P.fruits,'ar'),ctx);}
 if(mode==='photo-fruit-en'){item=ctx.pick(P.fruits);return question('Name this fruit!',item.id,item.en,pool(P.fruits,'en'),ctx,'اختر اسم الفاكهة بالإنجليزية','en');}
 if(mode==='photo-animal-sound'){item=ctx.pick(P.animals.filter(function(a){return a.id!=='fish';}));return question('ما اسم صوت هذا الحيوان؟',item.id,item.sound,pool(P.animals,'sound'),ctx);}
 if(mode==='photo-animal-home'){item=ctx.pick(P.animals);return question('أين يعيش هذا الحيوان عادة؟',item.id,item.habitat,['الماء','المنزل','الغابة','المزرعة','الصحراء'],ctx);}
 if(mode==='photo-whos'){item=ctx.pick(P.creators);return question('من صاحب هذه الصورة الحقيقية؟',item.id,item.ar,pool(P.creators,'ar'),ctx,'صور مرخصة للتعرف على صناع المحتوى، دون ارتباط رسمي');}
 if(mode==='photo-creators-work'){item=ctx.pick(P.creators);return question('بماذا يشتهر صاحب الصورة؟',item.id,item.tag,pool(P.creators,'tag'),ctx,'تعرّف على مجالات إبداع صناع المحتوى');}
 if(mode==='photo-choose-animal'){
  item=ctx.pick(P.animals);choices=ctx.options(item.id,pool(P.animals,'id'),4);
  return {text:'أين صورة '+item.ar+' الحقيقية؟',sub:'اختر واحدة من الصور الأربع',visual:item.emoji,
   options:choices,correct:item.id,say:item.ar,imageChoices:true};
 }
 if(mode==='photo-choose-fruit'){
  item=ctx.pick(P.fruits);choices=ctx.options(item.id,pool(P.fruits,'id'),4);
  return {text:'أين صورة '+item.ar+'؟',sub:'انظر إلى الفواكه الأربعة واختر الصحيحة',visual:item.emoji,
   options:choices,correct:item.id,say:item.ar,imageChoices:true};
 }
 return null;
};
root.ABTAL_PHOTOS=P;
})(window);
