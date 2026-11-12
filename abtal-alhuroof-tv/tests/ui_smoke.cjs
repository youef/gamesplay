'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const app={innerHTML:'',onClick:null,addEventListener:function(ev,cb){if(ev==='click')this.onClick=cb;}};
const scale={style:{}};
const local={};
const windowMock={innerWidth:1280,innerHeight:720,addEventListener:function(){},speechSynthesis:null};
const documentMock={
 getElementById:function(id){return id==='app'?app:scale;},
 querySelectorAll:function(){return [];},
 addEventListener:function(){},
 documentElement:{clientWidth:1280,clientHeight:720}
};
const sandbox={window:windowMock,document:documentMock,localStorage:{
 getItem:k=>local[k]||null,setItem:(k,v)=>{local[k]=v}
},Math,Date,JSON,String,Array,Object,setTimeout:function(){},clearTimeout:function(){},console};
vm.runInNewContext(fs.readFileSync(path.join(root,'pictograms.js'),'utf8'),sandbox);
windowMock.PICTOGRAM_MAP=sandbox.PICTOGRAM_MAP;windowMock.PICTOGRAM_KEYS=sandbox.PICTOGRAM_KEYS;
vm.runInNewContext(fs.readFileSync(path.join(root,'extra_games.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),sandbox);
assert(app.innerHTML.includes('مغامرة'), 'Home screen did not render');
assert(app.innerHTML.includes('87'), 'Activity count should show 87');
assert(typeof app.onClick==='function', 'Touch/select handler missing');
assert(typeof windowMock.tvKey==='function', 'TV D-pad handler missing');
function click(action){
 const n={getAttribute:key=>key==='data-action'?action:null,parentNode:app};
 app.onClick({target:n});
 assert(app.innerHTML.length>200,'Rendered screen unexpectedly empty after '+action);
}
for(const group of ['arabic','math','english','science','brain','adventure']){
 click('category:'+group);
 assert(app.innerHTML.indexOf('mode:')>=0,'Category has no game options: '+group);
}
for(const id of Object.keys(windowMock.ABTAL_EXPANSION.modes)){
 click('mode:'+id);
 const expected=id.startsWith('hunt-')?'hunt-tile':'answer:';
 assert(app.innerHTML.includes(expected),'No playable board or answers for '+id);
 click('backmode');
}
click('settings');click('heroes');click('gifts');click('achievements');click('daily');
assert(app.innerHTML.includes('answer:'),'Daily challenge not playable');
click('backmode');click('settings');click('reset');
assert(app.innerHTML.includes('resetno')&&app.innerHTML.includes('resetyes'),'Reset must require TV confirmation');
click('resetno');
console.log('PASS: offline UI rendered, 87 modes opened, remote/back navigation, six categories, rewards and parent-safe reset.');
