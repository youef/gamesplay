'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../nbu-campus-3d');
const source=fs.readFileSync(path.join(root,'strategy-road-network.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={window:{}};
vm.runInNewContext(source,context);
const {build}=context.window.CampusRoadNetwork;
const inclineRoads=[
 {x1:0,z1:-130,x2:0,z2:-60,width:10},
 {x1:0,z1:60,x2:0,z2:130,width:10},
 {x1:-100,z1:0,x2:100,z2:0,width:12}
];
test('flyover ramps connect two existing surface roads and NPC vehicles climb the actual deck',()=>{
 const bridge={type:'bridge',x:0,z:-60,end:{x:0,z:60}};
 const plan=build(inclineRoads,11,[bridge]);
 assert.equal(plan.connectedBridges,1);
 const elevated=plan.routes.filter(route=>route.some(p=>(p[2]||0)>4));
 assert.ok(elevated.length>=1,'one featured route includes the bridge');
 assert.ok(elevated.some(r=>r.some(p=>p[1]===-60&&(p[2]||0)===0)&&r.some(p=>p[1]===60&&(p[2]||0)===0)),
  'both ramp ends must connect to streets');
 const maxHeight=Math.max(...elevated.flatMap(r=>r.map(p=>p[2]||0)));
 assert.ok(maxHeight>=5.65&&maxHeight<=5.71,'physical deck is approximately 5.7 units high');
});
test('overpass crossing does not create a fake at-grade intersection',()=>{
 const bridge={type:'bridge',x:0,z:-60,end:{x:0,z:60}};
 const plan=build(inclineRoads,11,[bridge]);
 const crossingPoints=plan.routes.flat().filter(p=>Math.abs(p[0])<.01&&Math.abs(p[1])<.01);
 assert.ok(crossingPoints.some(p=>p[2]>4),'bridge crosses above surface');
 assert.ok(plan.junctions===0,'bridge underpass is not a drivable turn or junction');
});
test('detached flyovers never spawn cars floating over disconnected land',()=>{
 const plan=build([{x1:0,z1:-90,x2:0,z2:-60}],11,
  [{type:'bridge',x:0,z:-60,end:{x:0,z:60}}]);
 assert.equal(plan.connectedBridges,0);
 assert.ok(plan.routes.every(r=>r.every(p=>(p[2]||0)===0)));
});
test('curved connector uses the same bend and ramp profile as the rendered Three.js deck',()=>{
 const roads=[{x1:0,z1:-120,x2:0,z2:-60},{x1:0,z1:60,x2:0,z2:120}];
 const plan=build(roads,11,[{type:'flyover',x:0,z:-60,end:{x:0,z:60}}]);
 const elevated=plan.routes.find(r=>r.some(p=>(p[2]||0)>4));
 assert.ok(elevated);
 assert.ok(elevated.some(p=>p[0]>20),'flyover curves laterally');
 assert.ok(elevated.some(p=>Math.abs(p[0])<1&&Math.abs(p[1])<1&&p[2]>4),'center stays elevated');
});
test('elevated circular bridge joins four ramps to real nearby roads',()=>{
 const roads=[
  {x1:71,z1:0,x2:120,z2:0},
  {x1:-120,z1:0,x2:-71,z2:0},
  {x1:0,z1:71,x2:0,z2:120},
  {x1:0,z1:-120,x2:0,z2:-71}
 ];
 const plan=build(roads,11,[{type:'bridgeCircle',x:0,z:0,rot:0}]);
 assert.equal(plan.connectedBridges,1);
 assert.ok(plan.routes.some(route=>route.some(p=>Math.hypot(p[0],p[1])<27&&p[2]>5)),
   'a visible NPC route travels the circular elevated deck');
 assert.ok(plan.routes.some(route=>route.some(p=>Math.abs(Math.hypot(p[0],p[1])-71)<.5&&p[2]<.25)),
   'connector ramps terminate at ground street height');
});
test('traffic interpolation uses elevation and resets pitch without surface collisions',()=>{
 assert.match(html,/CampusRoadNetwork\.build\(roadSegments\(\),11,bridgeObjects\)/);
 assert.match(html,/nextY=\(start\[2\]\|\|0\)/);
 assert.match(html,/a\.mesh\.position\.set\(nextX,nextY,nextZ\)/);
 assert.match(html,/Math\.abs\(other\.mesh\.position\.y-nextY\)>2\.7/);
 assert.match(html,/a\.mesh\.rotation\.x=-Math\.atan2\(elevationDelta/);
});
