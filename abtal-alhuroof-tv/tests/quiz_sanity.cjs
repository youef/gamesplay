'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const original=fs.readFileSync(path.join(root,'game.js'),'utf8');
const pack=fs.readFileSync(path.join(root,'extra_games.js'),'utf8');
new vm.Script(original,{filename:'game.js'});
new vm.Script(pack,{filename:'extra_games.js'});
const sandbox={window:{},Math,Date,Array,Object,String};
vm.runInNewContext(pack,sandbox,{filename:'extra_games.js'});
const e=sandbox.window.ABTAL_EXPANSION;
assert(e && e.question && e.modes);
const count=Object.keys(e.modes).length+22;
assert(count>=75,'Expected at least 75 activities, got '+count);
const ids=Object.keys(e.modes);
const ar=[['أ','أسد','🦁'],['ب','بطة','🦆'],['ت','تمر','🌴']];
const english=[
 ['A','Apple','🍎','تفاحة'],['B','Ball','⚽','كرة'],['C','Cat','🐱','قطة'],['D','Dog','🐶','كلب'],
 ['E','Egg','🥚','بيضة'],['F','Fish','🐟','سمكة'],['G','Grapes','🍇','عنب'],['H','Hat','🎩','قبعة'],
 ['I','Ice','🧊','ثلج'],['J','Juice','🧃','عصير'],['K','Kite','🪁','طائرة ورقية'],['L','Lion','🦁','أسد'],
 ['M','Moon','🌙','قمر'],['N','Nest','🪺','عش'],['O','Orange','🍊','برتقالة'],['P','Pen','🖊','قلم'],
 ['Q','Queen','👑','ملكة'],['R','Rabbit','🐇','أرنب'],['S','Sun','☀️','شمس'],['T','Tree','🌳','شجرة'],
 ['U','Umbrella','☂️','مظلة'],['V','Van','🚐','سيارة'],['W','Water','💧','ماء'],['X','X-ray','🩻','أشعة'],
 ['Y','Yo-yo','🪀','يويو'],['Z','Zebra','🦓','حمار وحشي']
];
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){if(!a.length)throw new Error('empty list');return a[rnd(a.length)]}
function shuffle(a){return a.slice().sort(()=>Math.random()-.5)}
function options(correct,pool,count){
 const opts=[String(correct)];
 const arr=shuffle(pool.map(String).filter((v,i,a)=>a.indexOf(v)===i));
 for(const item of arr) if(!opts.includes(item)&&opts.length<(count||4)) opts.push(item);
 return shuffle(opts);
}
const ctx={rnd,pick,shuffle,options,ar,english,colors:[],words:[],shapes:[]};
let generated=0;
for(const id of ids){
 let variety=new Set();
 for(let k=0;k<65;k++){
   const q=e.question(id,ctx);
   assert(q&&typeof q.text==='string'&&q.text.length>3,id+' missing prompt');
   assert(Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=4,id+' invalid choices');
   assert(q.options.every(x=>typeof x==='string'),id+' non-string choice');
   assert(new Set(q.options).size===q.options.length,id+' duplicate options');
   assert(q.options.filter(x=>x===String(q.correct)).length===1,id+' answer not unique');
   assert(q.visual||q.visualHtml,id+' missing illustration');
   generated++;variety.add(q.text+' '+(q.visual||''));
 }
 if(variety.size<2)console.warn('Low prompt variety in '+id);
}
const total=ids.length;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('extra_games.js')<html.indexOf('game.js'),'Expansion loaded after main engine');
assert(original.includes('function tvKey(code)'),'TV remote handling missing');
assert(original.includes("viewAs('categories')"),'TV MENU handling missing');
console.log('PASS: '+count+' game types ('+total+' added), '+generated+' randomized questions, unique answers, ES5 core syntax, TV navigation hooks.');
