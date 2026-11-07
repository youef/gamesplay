'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../nbu-campus-3d');
const source=fs.readFileSync(path.join(root,'strategy-plan-json.js'),'utf8');
const graphSource=fs.readFileSync(path.join(root,'strategy-road-network.js'),'utf8');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox);
vm.runInNewContext(graphSource,sandbox);
const {ararScreenshotPreset,parse,transform}=sandbox.window.CampusStrategyPlanJSON;
const plan=JSON.parse(JSON.stringify(ararScreenshotPreset));
test('four screenshot preset is a schematic, not geolocated or a published map image',()=>{
 assert.equal(plan.version,1);
 assert.equal(plan.precision,'schematic-not-georeferenced');
 assert.match(plan.title,/النخيل/);
 assert.match(plan.notes,/فارغة/);
 assert.equal(plan.roads.length,51);
 assert.equal(plan.roads.filter(r=>r.type==='mapAvenue').length,8);
 assert.equal(plan.roads.filter(r=>r.type==='mapRoad').length,43);
 assert.ok(!JSON.stringify(plan).includes('latitude'));
 assert.ok(!JSON.stringify(plan).includes('longitude'));
 assert.ok(!JSON.stringify(plan).includes('data:image'));
});
test('all 51 streets are valid segments, with diagonal edges matching the screenshot orientation',()=>{
 const validated=JSON.parse(JSON.stringify(parse(JSON.stringify(plan))));
 assert.equal(validated.length,51);
 for(const item of validated){
  const len=Math.hypot(item.x2-item.x1,item.z2-item.z1);
  assert.ok(len>=10&&len<=230,'road segment length should fit strategy engine');
 }
 assert.ok(validated.filter(r=>r.x1!==r.x2&&r.z1!==r.z2).length>=38);
 assert.ok(validated.some(r=>r.group===undefined),'parsed roads do not require metadata');
});
test('the screenshot road plan can be placed safely within world bounds and builds a connected diagonal graph',()=>{
 const roads=parse(JSON.stringify(plan));
 const transformed=JSON.parse(JSON.stringify(transform(roads,{centerX:-425,centerZ:125,scale:.7,angle:0})));
 assert.equal(transformed.length,51);
 for(const r of transformed){
  for(const p of [[r.x,r.z],[r.end.x,r.end.z]]){
   assert.ok(p[0]>=-620&&p[0]<=620);
   assert.ok(p[1]>=-520&&p[1]<=420);
  }
 }
 const graph=sandbox.window.CampusRoadNetwork.build(
  transformed.map(r=>({x1:r.x,z1:r.z,x2:r.end.x,z2:r.end.z})),11);
 assert.equal(graph.segments,51,'diagonal segments should not be filtered out');
 assert.ok(graph.nodes>=50&&graph.routes.length>=5);
 assert.ok(graph.junctions>=10,'local street crossings are joined');
});
test('screenshot map is presented as a preview requiring user approval',()=>{
 assert.match(source,/مخطط الصور الأربع — عرعر/);
 assert.match(source,/تنزيل مخطط النخيل JSON/);
 assert.match(source,/if\(!confirm\("إضافة "/);
 assert.match(page,/mapRoad:\{label:/);
 assert.match(page,/mapAvenue:\{label:/);
 assert.match(page,/mapRoad","mapAvenue"\]\.includes\(r\.type\)/);
 assert.match(page,/strategy-plan-json\.js\?v=78295c3f/);
 assert.match(page,/strategy-road-network\.js\?v=6d11be6d/);
 assert.match(page,/roadPlanTool\.isPlacing\(\)/);
 assert.match(page,/roadPlanTool\.place\(p\)/);
 assert.match(source,/اختيار موضع المخطط باللمس/);
 assert.match(source,/isPlacing:\(\)=>placing/);
});
