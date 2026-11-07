'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','nbu-campus-3d');
const code=fs.readFileSync(path.join(root,'strategy-plan-json.js'),'utf8');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(code,sandbox);
const {parse,transform}=sandbox.window.CampusStrategyPlanJSON;
function normalize(v){return JSON.parse(JSON.stringify(v))}
test('AI road plan schema validates surface roads, bridges and elevated circles',()=>{
 const draft={version:1,roads:[
  {type:'road',from:[-100,0],to:[100,0]},
  {type:'avenue',x1:0,z1:-60,x2:0,z2:70},
  {type:'bridge',x1:-50,z1:-50,x2:50,z2:50},
  {type:'flyover',x1:30,z1:20,x2:80,z2:70},
  {type:'bridgeCircle',x:150,z:30}
 ]};
 const found=normalize(parse(JSON.stringify(draft)));
 assert.equal(found.length,5);
 assert.deepEqual(found[0],{type:'road',x1:-100,z1:0,x2:100,z2:0});
 assert.deepEqual(found[4],{type:'bridgeCircle',x:150,z:30,rot:0});
});
test('rotate, scale and center the uploaded plan without mutating the source',()=>{
 const original=normalize(parse(JSON.stringify({roads:[{type:'road',x1:0,z1:0,x2:20,z2:0}]})));
 const projected=normalize(transform(original,{centerX:300,centerZ:100,scale:2,angle:90}));
 assert.deepEqual(projected,[{type:'road',x:300,z:80,end:{x:300,z:120}}]);
 assert.equal(original[0].x1,0);
});
test('malformed, angled, unreasonable and untrusted plan input is rejected',()=>{
 const samples=[
  '{"roads":[]}', '{"roads":[{"type":"script","x1":0,"z1":0,"x2":40,"z2":0}]}',
  '{"roads":[{"type":"road","x1":0,"z1":0,"x2":40,"z2":20}]}',
  '{"roads":[{"type":"road","x1":0,"z1":0,"x2":1,"z2":0}]}',
  '{"roads":[{"type":"bridge","x1":0,"z1":0,"x2":100000,"z2":0}]}',
  '{"roads":[{"type":"bridgeCircle","x":null,"z":5000}]}'
 ];
 for(const s of samples)assert.throws(()=>parse(s));
 assert.throws(()=>transform([{type:'road',x1:0,z1:0,x2:10,z2:0}],{scale:-1}));
});
test('AI plans are previewed before user confirmation and imported in one undo step',()=>{
 assert.match(code,/if\(!confirm\("إضافة "/);
 assert.match(code,/onApprove\(items\.map/);
 assert.match(page,/strategy-plan-json\.js\?v=/);
 assert.match(page,/function addPlanItemsBatch\(items\)/);
 assert.match(page,/if\(added===0\)recordPlannerHistory\(\)/);
 assert.match(page,/setupPlanJsonImport\(\);setupStudents\(\)/);
});
