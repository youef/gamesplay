const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const T=require('../nbu-campus-3d/vendor/three.min.js'),H=require('../nbu-campus-3d/horizons-world.js'),L=require('../nbu-campus-3d/horizons-pro.js');
test('upgrade purchases spend the displayed amount and change actual ranks',()=>{const s=L.defaults();assert.equal(L.upgrade(s,'engine'),true);assert.equal(s.engine,1);assert.equal(s.credits,1000);assert.equal(L.upgrade(s,'engine'),false);assert.equal(s.engine,1);assert.equal(L.upgrade(s,'unknown'),false);});
test('saved progression is bounded, levels advance, and malformed values recover',()=>{const s=L.validate({xp:900,credits:-1,engine:Infinity,handling:99,paint:'url(bad)',rewards:{drive:true}});assert.equal(L.level(s),4);assert.equal(s.credits,0);assert.equal(s.handling,3);assert.equal(s.engine,3);assert.equal(s.paint,L.defaults().paint);assert.equal(L.level({xp:1e9}),30);});
test('race completion requires all eight gates in sequence while driving',()=>{const points=Array.from({length:8},(_,i)=>({x:i*100,z:0})),race={start:1000,next:1};assert.equal(L.raceStep(race,points[0],points,2000,true).status,'running');assert.equal(L.raceStep(race,points[1],points,2000,false).status,'running');for(let i=1;i<8;i++){const s=L.raceStep(race,points[i],points,1000+i*1000,true);assert.equal(s.status,'checkpoint');race.next=s.next;}const done=L.raceStep(race,points[0],points,10000,true);assert.equal(done.status,'finished');assert.equal(done.time,9);});
test('all added game modules parse',()=>{for(const f of ['horizons-districts.js','horizons-pro.js','horizons-ui.js'])new vm.Script(fs.readFileSync(__dirname+'/../nbu-campus-3d/'+f,'utf8'));});
const context2d=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
global.document={createElement:()=>({width:0,height:0,getContext:()=>context2d})};
T.TextureLoader.prototype.load=function(url){const t=new T.Texture();t.userData={url};return t;};
const sandbox={THREE:T,window:{URL},URL,Blob,location:{href:'http://127.0.0.1:8765/'},console,document:global.document,TextDecoder,Uint8Array,ArrayBuffer,DataView,Map,Set,setTimeout};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/../nbu-campus-3d/horizons-districts.js','utf8'),sandbox);
const scene=new T.Scene(),renderer={capabilities:{getMaxAnisotropy:()=>4}},world=H.createWorld({THREE:T,scene,renderer}),districts=sandbox.window.createHorizonsDistricts(T,scene,renderer,world);
test('all fourteen destinations are clear after detailed architecture is installed',()=>{assert.equal(world.destinations.length,14);for(const d of world.destinations){assert.equal(world.blocked(d.x,d.z,2.4),false,d.id);assert.equal(world.blocked(d.x+5,d.z+5),false,d.id+' second player');}});
test('roof pool and edges block movement while the roof spawn and lobby remain clear',()=>{assert.equal(districts.roofBlocked(districts.roof.x,districts.roof.z),false);assert.equal(districts.roofBlocked(-1413,-2105),true);assert.equal(districts.roofBlocked(-1450,-2100),true);assert.equal(world.blocked(-1400,-2040),false);});
test('circuit checkpoints follow the physical track, and training targets really exist',()=>{assert.equal(districts.checkpoints.length,8);for(const p of districts.checkpoints){const normalized=((p.x-1500)/380)**2+((p.z-2100)/210)**2;assert.ok(Math.abs(normalized-1)<1e-8);}assert.equal(districts.targets.length,7);assert.ok(districts.targets.every(t=>t.mesh.geometry.isBufferGeometry));});
test('PBR assets ship complete color, normal and roughness maps at 512 pixels',()=>{for(const name of ['limestone','pavers','stucco','brick','wood','asphalt','pool','roof'])for(const type of ['color','normal','roughness']){const b=fs.readFileSync(__dirname+'/../nbu-campus-3d/assets/materials/'+name+'-'+type+'.png');assert.equal(b.readUInt32BE(16),512);assert.equal(b.readUInt32BE(20),512);}});

 test('public release ships only the three original characters',()=>{
   const assets=__dirname+'/../nbu-campus-3d/assets/';
   const manifest=JSON.parse(fs.readFileSync(assets+'manifest.json','utf8'));
   assert.deepEqual(manifest.characters,['fawaz','zyad','noura']);
   assert.equal(fs.existsSync(assets+'resistance'),false);
   for(const id of manifest.characters)for(const format of ['png','svg','gltf','bin']){
     assert.ok(fs.statSync(assets+id+'.'+format).size>0);
   }
 });
