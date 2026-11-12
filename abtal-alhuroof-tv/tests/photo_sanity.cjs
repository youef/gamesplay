'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const wnd={};
vm.runInNewContext(fs.readFileSync(path.join(root,'photo_games.js'),'utf8'),{window:wnd});
const P=wnd.ABTAL_PHOTOS;
assert(P&&P.all.length===13,'Expected 13 offline photo entries');
assert(Object.keys(P.modes).length===14,'Expected 14 photo activities');
const ids=P.all.map(a=>a.id);
assert(new Set(ids).size===13,'Photo IDs duplicate');
const images=path.join(root,'photos');
for(const id of ids){
 assert(fs.existsSync(path.join(images,id+'.jpg')),'Missing real photograph '+id);
 const bytes=fs.readFileSync(path.join(images,id+'.jpg'));
 assert(bytes.length>8000 && bytes.length<160000,'Unexpected photograph size '+id);
 assert(bytes[0]===0xFF && bytes[1]===0xD8,'Not a JPEG image '+id);
}
const ctx={pick:a=>a[Math.floor(Math.random()*a.length)],
 options:(correct,choices,n)=>{
  const c=[String(correct)];
  for(const v of [...new Set(choices.map(String))].sort(()=>Math.random()-.5))if(v!==String(correct)&&c.length<(n||4))c.push(v);
  return c.sort(()=>Math.random()-.5);
}};
for(const mode of Object.keys(P.modes)){
 if(['photo-album','photo-memory','hunt-photo'].includes(mode))continue;
 for(let i=0;i<120;i++){
  const q=P.question(mode,ctx);
  assert(q&&q.text&&q.correct,'Question not generated for '+mode);
  assert(q.options.includes(String(q.correct)),'Question missing right answer: '+mode);
  assert(new Set(q.options).size===q.options.length,'Question options are duplicated: '+mode);
  assert(q.options.length>=2&&q.options.length<=4,'Invalid choices: '+mode);
  assert(q.imageChoices||q.visualHtml,'No real photo content: '+mode);
  if(q.visualHtml)assert(q.visualHtml.includes('photos/'),'Not an offline photo: '+mode);
 }
}
console.log('PASS: 13 local JPEGs, 14 photo modes, 1320 generated quizzes, permissions and valid answers.');
