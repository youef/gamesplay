'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../nbu-campus-3d');
const T=require(path.join(root,'vendor/three.min.js'));
const H=require(path.join(root,'horizons-world.js'));
const Roads=require(path.join(root,'horizons-roads.js'));
const Driving=require(path.join(root,'horizons-driving.js'));
const Pro=require(path.join(root,'horizons-pro.js'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

const canvasContext=new Proxy({
 createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
},{get:(o,k)=>o[k]||(()=>{})});
global.document={createElement:()=>({getContext:()=>canvasContext})};
T.TextureLoader.prototype.load=()=>new T.Texture();
const scene=new T.Scene(),renderer={capabilities:{getMaxAnisotropy:()=>4}};
const world=H.createWorld({THREE:T,scene,renderer});
const districtContext={window:{},document};
vm.runInNewContext(fs.readFileSync(path.join(root,'horizons-districts.js'),'utf8'),districtContext);
const districts=districtContext.window.createHorizonsDistricts(T,scene,renderer,world);

const campusPlan=vm.runInNewContext(`
 ${html.slice(html.indexOf('const B=['),html.indexOf('const G=['))}
 const S={add(){}};const road=()=>({});
 ${html.slice(html.indexOf('const campusRoads=[];'),html.indexOf('// السور'))}
 ({roads:campusRoads,buildings:B})
`);
const allRoads=[...world.roads,...campusPlan.roads];
function connects(a,b){
 return Math.max(Math.min(a.x1,a.x2),Math.min(b.x1,b.x2))<=Math.min(Math.max(a.x1,a.x2),Math.max(b.x1,b.x2))&&
  Math.max(Math.min(a.z1,a.z2),Math.min(b.z1,b.z2))<=Math.min(Math.max(a.z1,a.z2),Math.max(b.z1,b.z2));
}

test('all regional streets, internal streets and gates form one connected centerline graph',()=>{
 const queue=[allRoads[0]],remaining=new Set(allRoads.slice(1));
 for(const a of queue)for(const b of remaining)if(connects(a,b)){remaining.delete(b);queue.push(b);}
 assert.deepEqual([...remaining],[]);
 assert.ok(allRoads.length>70);
 for(const [x,z] of [[-9,-200],[-109,200],[-200,-88],[200,-88],[487,-106],[462,-265],[560,-130],[1050,2176],[970,2035]]){
  assert.ok(allRoads.some(r=>Roads.contains(r,x,z)),`arrival point ${x},${z}`);
 }
});

test('the entire pavement width clears generated colliders and original campus building plots',()=>{
 for(const r of allRoads){
  for(const b of campusPlan.buildings)assert.equal(Roads.intersectsFootprint(r,b.x,b.z,b.w,b.d),false,`${b.n} intersects ${JSON.stringify(r)}`);
  const span=Math.hypot(r.x2-r.x1,r.z2-r.z1),steps=Math.ceil(span/2);
  const h=r.z1===r.z2;
  for(let i=0;i<=steps;i++){
   const x=r.x1+(r.x2-r.x1)*i/steps,z=r.z1+(r.z2-r.z1)*i/steps;
   for(const offset of [0,1-r.width/2,r.width/2-1]){
    const px=x+(h?0:offset),pz=z+(h?offset:0);
    if(world.blocked(px,pz,.45))assert.fail(`blocked at ${px}, ${pz} on ${JSON.stringify(r)}`);
   }
  }
 }
});

test('junction paving is tiled once and parallel roads have no shared pavement',()=>{
 const tiles=Roads.roadTiles(world.roads).flatMap(s=>s.tiles);
 for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++)assert.equal(Roads.overlaps(tiles[i],tiles[j]),false);
 for(let i=0;i<allRoads.length;i++)for(let j=i+1;j<allRoads.length;j++){
  const a=allRoads[i],b=allRoads[j];
  if((a.z1===a.z2)===(b.z1===b.z2))assert.equal(Roads.overlaps(Roads.bounds(a),Roads.bounds(b)),false,`${JSON.stringify(a)} overlaps ${JSON.stringify(b)}`);
 }
});

test('building approach walkways reach a road or another walkway',()=>{
 assert.ok(world.accesses.length>=100);
 const accessRoads=world.accesses.map(a=>({x1:a.x,z1:a.z,x2:a.roadX,z2:a.roadZ,width:a.width}));
 const pending=new Set(accessRoads),network=[...allRoads];
 for(const r of network)for(const a of pending)if(connects(r,a)){pending.delete(a);network.push(a);}
 assert.deepEqual([...pending],[]);
 for(const d of world.destinations){
  const distance=Math.min(...network.map(r=>Math.hypot(d.x-Math.max(Math.min(r.x1,r.x2),Math.min(d.x,Math.max(r.x1,r.x2))),d.z-Math.max(Math.min(r.z1,r.z2),Math.min(d.z,Math.max(r.z1,r.z2))))));
  assert.ok(distance<=50,`${d.id} is isolated by ${distance} m`);
 }
 assert.ok(districts.isPaved(970,1985));
});

test('handbrake builds sustained lateral slip, then road grip recovers',()=>{
 const s=Driving.fleet.datsun,limits={...s,braking:44};
 let state={speed:24,heading:0,course:0};
 for(let i=0;i<30;i++)state=Driving.advance(state,{gas:.65,brake:0,steer:.61,handbrake:true},1/60,limits);
 assert.ok(state.drifting&&Math.abs(state.slip)>.46&&state.speed>20);
 assert.ok(Math.abs(state.course-state.heading)>.4);
 for(let i=0;i<30;i++)state=Driving.advance(state,{gas:0,brake:0,steer:0,handbrake:false},1/60,limits);
 assert.ok(!state.drifting&&Math.abs(state.slip)<.01);
 const reverse=Driving.advance({speed:0,heading:0,course:0},{gas:0,brake:1,steer:0,handbrake:false},.04,limits);
 assert.ok(reverse.speed<0&&reverse.dz<0);
});

test('fleet selections and paints persist with distinct geometry and handling',()=>{
 const datsun=Driving.model(T,'datsun'),hilux=Driving.model(T,'hilux');
 assert.notEqual(Driving.fleet.datsun.grip,Driving.fleet.hilux.grip);
 assert.notEqual(datsun.wheels[0].radius,hilux.wheels[0].radius);
 assert.notEqual(datsun.body.children.length,hilux.body.children.length);
 assert.equal(Pro.validate({vehicle:'hilux',paints:{hilux:'#efeeee'},bestDrift:31}).bestDrift,31);
 assert.equal(Pro.validate({vehicle:'hilux',paints:{hilux:'#efeeee'}}).paints.hilux,'#efeeee');
 assert.equal(Pro.validate({vehicle:'constructor',paint:'#aabbcc'}).vehicle,'horizon');
 const a=H.createAvatar(T,'zyad'),b=H.createAvatar(T,'noura');
 assert.ok(a.profile.sprint>b.profile.sprint&&b.profile.reload<a.profile.reload);
 a.animate(1,1,true);
 assert.ok(a.elbows[1].rotation.x<-.4&&a.shins[0].rotation.x>.5);
});
