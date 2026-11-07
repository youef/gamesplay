'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'../nbu-campus-3d');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const bridges=fs.readFileSync(path.join(base,'strategy-bridges.js'),'utf8');
const importer=fs.readFileSync(path.join(base,'strategy-blueprint-image.js'),'utf8');

test('bridge ramps connect to road level and rise to working deck height',()=>{
 const sandbox={window:{}};
 vm.runInNewContext(bridges,sandbox);
 assert.equal(typeof sandbox.window.CampusBridgeKit,'function');
 const parts=[];
 const kit=sandbox.window.CampusBridgeKit({
  THREE:{Mesh:class{constructor(){this.position={y:0}}},CylinderGeometry:class{}},
  part:(group,width,height,length,color,x,y,z)=>{
   const part={width,height,length,x,y,z,rotation:{set(a,b,c,order){this.x=a;this.y=b;this.order=order}}};
   parts.push(part);return part;
  },
  mat:()=>({})
 });
 const group={add(){}};
 kit.buildFlyover(group,160,11,false);
 assert.ok(parts.length>35,'bridge must have segmented ramps, safety rails and supports');
 assert.ok(Math.abs(kit.elevation(0,160)-.24)<1e-9,'start is at ground level');
 assert.ok(Math.abs(kit.elevation(1,160)-.24)<1e-9,'end is at ground level');
 assert.ok(kit.elevation(.5,160)>5.8,'center rises for underpass');
 const start=parts.filter(p=>p.width===11).sort((a,b)=>a.z-b.z);
 assert.ok(start[0].y<1,'entry ramp must begin near street level');
 assert.ok(start.at(-1).y<1,'exit ramp must return to street level');
 assert.ok(start[Math.floor(start.length/2)].y>5,'bridge middle is elevated');
 assert.ok(Math.abs(kit.heightAt(0,0,[{type:'bridge',x:0,z:-80,end:{x:0,z:80}}])-5.69)<.4);
 assert.equal(kit.heightAt(40,0,[{type:'bridge',x:0,z:-80,end:{x:0,z:80}}]),0);
});

test('curved flyover and elevated circle build independently',()=>{
 const sandbox={window:{}};
 vm.runInNewContext(bridges,sandbox);
 const parts=[];
 const kit=sandbox.window.CampusBridgeKit({
  THREE:{Mesh:class{constructor(){this.position={y:0}}},CylinderGeometry:class{}},
  part:(group,w,h,d,c,x,y,z)=>{const item={x,y,z,w,rotation:{set(){}}};parts.push(item);return item},
  mat:()=>({})
 });
 kit.buildFlyover({add(){}},130,10,true);
 assert.ok(parts.some(p=>p.x>10),'curved connector should bend laterally');
 const before=parts.length;
 kit.buildCircle({add(){}});
 assert.ok(parts.length-before>80,'roundabout needs a complete deck and four ramps');
 assert.ok(kit.heightAt(26,0,[{type:'bridgeCircle',x:0,z:0}])>5);
 assert.ok(kit.heightAt(71,0,[{type:'bridgeCircle',x:0,z:0}])<1);
});

test('original roads and buildings can be moved, hidden and restored persistently',()=>{
 assert.match(html,/const deletedFixedRoads=new Set\(\)/);
 assert.match(html,/function redrawFixedRoads\(\)/);
 assert.match(html,/function plannerObjectAt\(point\)/);
 assert.match(html,/function plannerDelete\(sel\)/);
 assert.match(html,/function plannerMoveTo\(sel,point\)/);
 assert.match(html,/function plannerRotateSelected\(\)/);
 assert.match(html,/defaultRoads:saveFixedRoads\(\)/);
 assert.match(html,/campusBuildingPositions/);
 assert.match(html,/function planningUndo\(\)/);
 assert.match(html,/function planningRedo\(\)/);
 assert.match(html,/campusStrategyEditor/);
 assert.match(html,/restoreFixedRoads\(data\.defaultRoads\)/);
});

test('image blueprints only add candidates after approval and support manual drafting',()=>{
 assert.doesNotThrow(()=>new vm.Script(importer,{filename:'strategy-blueprint-image.js'}));
 assert.match(html,/strategy-blueprint-image\.js/);
 assert.match(importer,/input\.type="file"/);
 assert.match(importer,/file\.accept="image\/png,image\/jpeg,image\/webp"/);
 assert.match(importer,/function autoTrace\(\)/);
 assert.match(importer,/function toWorld\(px,py\)/);
 assert.match(importer,/function place\(point\)/);
 assert.match(importer,/const commitBtn=button\("✅ اعتماد المقترحات"/);
 assert.match(importer,/if\(onRoad\(p,q,v\.type\|\|"road"\)\)/);
 assert.doesNotMatch(importer,/\bfetch\(/);
});