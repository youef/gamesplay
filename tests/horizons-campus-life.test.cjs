'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=__dirname+'/../nbu-campus-3d/';
const T=require(root+'vendor/three.min.js'),H=require(root+'horizons-world.js'),Roads=require(root+'horizons-roads.js');
const Campus=require(root+'horizons-campus.js'),Driving=require(root+'horizons-driving.js'),Life=require(root+'horizons-life.js');
const Stadium=require(root+'stadium-precinct.js'),Pro=require(root+'horizons-pro.js');
const canvas=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
 {get:(o,k)=>o[k]||(()=>{})});
global.document={createElement:()=>({getContext:()=>canvas})};
T.TextureLoader.prototype.load=()=>new T.Texture();
const mat=(color,opts={})=>new T.MeshStandardMaterial({color,...opts});
const scene=new T.Scene(),renderer={capabilities:{getMaxAnisotropy:()=>4}};
const world=H.createWorld({THREE:T,scene,renderer});
const context={window:{HorizonsLife:Life,HorizonsDriving:Driving},document};
vm.runInNewContext(fs.readFileSync(root+'horizons-districts.js','utf8'),context);
const districts=context.window.createHorizonsDistricts(T,scene,renderer,world);

test('sidewalks are raised beside the street with clear gaps at junctions',()=>{
 const roads=[{x1:-50,z1:0,x2:50,z2:0,width:10},{x1:0,z1:-30,x2:0,z2:30,width:12}];
 const tiles=Roads.sidewalkTiles(roads);
 assert.ok(tiles.length>4);
 for(const tile of tiles)for(const r of roads)assert.equal(Roads.overlaps(tile,Roads.bounds(r)),false);
 for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++)assert.equal(Roads.overlaps(tiles[i],tiles[j]),false);
});

test('university entrances connect to furnished rooms without crossing walls',()=>{
 for(const [index,n] of [[0,4],[1,3],[3,2],[4,2],[5,2],[6,3]]){
  const b={n:'مبنى الجامعة',labs:Array.from({length:n},(_,i)=>['القاعة '+i])};
  const parent=new T.Group(),plan=Campus.interior(T,parent,b,index,mat);
  assert.equal(plan.rooms.length,n);assert.ok(parent.children.length>50);
  for(let z=0;z<=16;z++)assert.equal(plan.blocked(750,z),false);
  for(const r of plan.rooms){
   for(let x=Math.min(r.x,750);x<=Math.max(r.x,750);x++)assert.equal(plan.blocked(x,0),false);
   for(let z=Math.min(r.entryZ,0);z<=Math.max(r.entryZ,0);z++)assert.equal(plan.blocked(r.x,z),false);
   assert.equal(plan.blocked(r.x+5,r.doorZ),true);
  }
 }
});

test('both stadium portals reach the touchline gallery without exposing the pitch',()=>{
 const ST={x:365,z:40},COL=[],labels=[];
 const precinct=global.buildCampusStadiumPrecinct({THREE:T,scene:new T.Scene(),ST,mat,lab:t=>{labels.push(t);return new T.Group()},COL});
 const clear=(x,z,r)=>!COL.some(([a,b,c,d])=>x+r>a&&x-r<c&&z+r>b&&z-r<d);
 for(const side of [-1,1]){
  for(let d=93;d>=39;d--)assert.ok(precinct.visitorZone(ST.x+side*d,ST.z,1.05)&&clear(ST.x+side*d,ST.z,1.05),`tunnel ${side},${d}`);
  for(let z=-51;z<=51;z++)assert.ok(precinct.visitorZone(ST.x+side*39,ST.z+z,1.05)&&clear(ST.x+side*39,ST.z+z,1.05));
  assert.equal(clear(ST.x+side*93,ST.z,1.9),false,'bollards stop cars');
 }
 assert.equal(Stadium.visitorZone(ST,365,40),false);
 assert.equal(Stadium.visitorZone(ST,425,60),false);
 assert.ok(labels.some(x=>x.includes('الممر الشرقي')));
});

test('spring and drift meetup are reachable with real scenery and animated spectators',()=>{
 assert.ok(districts.life.visitorCount>=50);
 const meet=scene.getObjectByName('Drift meetup and viewing stands'),spring=scene.getObjectByName('Northern Spring campground');
 assert.ok(meet&&spring);
 const player=new T.Vector3(970,0,2045);
 const demo=meet.children.find(o=>o.name==='datsun'&&o.position.x===0);
 assert.ok(demo);
 districts.update(1000,.04,player,15,false);const position=demo.position.clone();
 districts.update(1240,.04,player,15,false);
 assert.ok(demo.visible&&demo.position.distanceTo(position)>1.5);
 assert.ok(scene.children.some(o=>o.name==='Tire dust'&&o.visible));
 const spot=H.destinations.find(d=>d.id==='spring');
 assert.ok(world.isRoad(spot.x,spot.z)&&!world.blocked(spot.x,spot.z,2.4));
 assert.ok(world.blocked(-1910,1758)&&!world.blocked(-1910,1802));
 assert.equal(districts.heightAt(-1910,1802),.4);
 for(const r of world.roads)for(let t=0;t<=1;t+=.008){
  const x=r.x1+(r.x2-r.x1)*t,z=r.z1+(r.z2-r.z1)*t;
  assert.equal(world.blocked(x,z,1.6),false,`road blocked near ${x},${z}`);
 }
});

test('the Lexus has its own model, wheelbase and saved garage selection',()=>{
 const lx=Driving.model(T,'lexus');
 assert.ok(lx.root.getObjectByName('LX spindle grille'));
 assert.notEqual(Driving.fleet.lexus.wheelbase,Driving.fleet.hilux.wheelbase);
 assert.equal(Pro.validate({vehicle:'lexus'}).vehicle,'lexus');
});

test('startup reaches the game once even when the remote font is delayed',async()=>{
 const html=fs.readFileSync(root+'index.html','utf8');
 let ready,deadline,starts=0;
 const fonts={load:()=>new Promise(resolve=>{ready=resolve;})};
 const sandbox={document:{fonts},init:()=>{starts++;},setTimeout:fn=>{deadline=fn;return 1;},clearTimeout(){}};
 vm.runInNewContext(html.slice(html.indexOf('function startCampus(){'),html.indexOf('function loadThreeFallback(){'))+'startCampus();',sandbox);
 assert.equal(starts,0);
 deadline();assert.equal(starts,1);
 ready();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(starts,1);
 assert.doesNotMatch(html,/\$\("ld"\)\.remove\(\)/);
});
