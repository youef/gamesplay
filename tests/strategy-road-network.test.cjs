'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','nbu-campus-3d');
const src=fs.readFileSync(path.join(root,'strategy-road-network.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={window:{}};
vm.runInNewContext(src,context);
const {build}=context.window.CampusRoadNetwork;
function near(a,b,t=.01){return Math.abs(a-b)<t}
function pointOnRoad(p,r){
 if(r.z1===r.z2)return near(p[1],r.z1)&&p[0]>=Math.min(r.x1,r.x2)-.01&&p[0]<=Math.max(r.x1,r.x2)+.01;
 return near(p[0],r.x1)&&p[1]>=Math.min(r.z1,r.z2)-.01&&p[1]<=Math.max(r.z1,r.z2)+.01;
}
function assertRoutesFollowRoads(network,roads){
 for(const route of network.routes)for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i];
  assert.ok(roads.some(r=>pointOnRoad(a,r)&&pointOnRoad(b,r)),
   'traffic should traverse existing roads only: '+JSON.stringify([a,b]));
 }
}
test('crossroads become a continuous network with a real junction',()=>{
 const roads=[
  {x1:-50,z1:0,x2:50,z2:0,width:10},
  {x1:0,z1:-40,x2:0,z2:40,width:9}
 ];
 const plan=build(roads);
 assert.equal(plan.segments,2);
 assert.equal(plan.nodes,5);
 assert.equal(plan.junctions,1);
 assert.equal(plan.deadEnds,4);
 assert.ok(plan.routes.length>=1);
 assertRoutesFollowRoads(plan,roads);
 assert.ok(plan.routes.some(r=>r.some(p=>p[0]===0&&p[1]===0)));
});
test('deleting a default road removes it from every generated NPC route',()=>{
 const roads=[{x1:0,z1:0,x2:80,z2:0},{x1:80,z1:0,x2:160,z2:0}];
 const before=build(roads);
 assert.ok(before.routes.some(r=>r.some(p=>p[0]===160)));
 const after=build(roads.slice(0,1));
 assert.ok(after.routes.every(r=>r.every(p=>p[0]<=80)));
 assertRoutesFollowRoads(after,roads.slice(0,1));
});
test('no roads means no traffic instead of invisible legacy routes',()=>{
 const plan=build([]);
 assert.equal(plan.routes.length,0);
 assert.equal(plan.nodes,0);
 assert.equal(plan.segments,0);
});
test('disconnected street blocks are not bridged through empty land',()=>{
 const roads=[{x1:0,z1:0,x2:75,z2:0},{x1:300,z1:100,x2:450,z2:100}];
 const plan=build(roads,11);
 assert.ok(plan.routes.length>=2);
 assertRoutesFollowRoads(plan,roads);
 for(const r of plan.routes)assert.ok(r.every(p=>p[0]<100)||r.every(p=>p[0]>250));
});
test('collinear overlapping segments join at existing endpoints',()=>{
 const roads=[{x1:0,z1:0,x2:100,z2:0},{x1:60,z1:0,x2:160,z2:0}];
 const plan=build(roads);
 assert.ok(plan.nodes>=4);
 assertRoutesFollowRoads(plan,roads);
 assert.ok(plan.routes.some(r=>r[0][0]===0||r.at(-1)[0]===0));
});
test('strategy view and NPC routing are wired into the campus game',()=>{
 assert.match(index,/script src="\.\/strategy-road-network\.js\?v=/);
 assert.match(index,/CampusRoadNetwork\.build\(roadSegments\(\),11\)/);
 assert.match(index,/agent\.mesh\.visible=false/);
 assert.match(index,/for\(const a of agents\)if\(a\.mesh\.visible!==false\)moveAgent\(a,dt\)/);
 assert.match(index,/for\(const r of roadSegments\(\)\)\{/);
 assert.match(index,/Math\.max\(1,Math\.min\(5,r\.width\*k\)\)/);
});