'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../nbu-campus-3d/index.html'),'utf8');
const inline=[...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
test('all in-page game scripts are valid JavaScript after touch editor changes',()=>{
 for(const [i,m] of inline.entries())assert.doesNotThrow(()=>new Function(m[1]),'Inline script '+i);
});
test('strategy mode restores construction tools on every entry and supports toggling',()=>{
 assert.match(html,/#buildDock\{display:none!important\}/);
 assert.match(html,/body\.strategyEditing\.showBuildDock:not\(\.cleanUi\) #buildDock:not\(\.collapsed\)/);
 assert.match(html,/document\.body\.classList\.add\("showBuildDock"\)/);
 assert.match(html,/document\.body\.classList\.toggle\("strategyEditing",buildMode\)/);
 assert.match(html,/id="toggleStrategyTools"/);
 assert.match(html,/\$\("toggleStrategyTools"\)\.onclick=/);
 assert.match(html,/dock\.classList\.toggle\("collapsed",visible\)/);
 assert.match(html,/document\.body\.classList\.toggle\("showBuildDock",!visible\)/);
 assert.match(html,/max-height:46dvh/);
 assert.match(html,/env\(safe-area-inset-bottom,0px\)/);
});
test('selection drag uses anchored coordinates so picking a distant point does not jump the object',()=>{
 assert.match(html,/function plannerObjectAnchor\(sel\)/);
 assert.match(html,/draggedStrategyObject=\{id:e\.pointerId,item:picked,ground,anchor/);
 assert.match(html,/const target=\{x:drag\.anchor\.x\+\(end\.x-drag\.ground\.x\),z:drag\.anchor\.z\+\(end\.z-drag\.ground\.z\)\}/);
 assert.match(html,/const issue=plannerMoveTo\(drag\.item,target\)/);
 assert.match(html,/if\(drag\.moved&&!pinchMoved\)/);
 assert.match(html,/if\(draggedStrategyObject\?\.moved&&draggedStrategyObject\.id===e\.pointerId\)/);
 assert.match(html,/editMarker\.position\.x\+=point\.x-drag\.ground\.x/);
});
test('select mode prioritizes existing buildings and exposes original highways for editing',()=>{
 assert.match(html,/if\(d<threshold&&d<score&&chosen\?\.kind!=="building"\)/);
 assert.match(html,/if\(d<Math\.max\(3,road\.width\/2\+2\)&&d<score&&!/);
 assert.match(html,/function plannerObjectAt\(point\)/);
 assert.match(html,/for\(const road of campusRoads\)/);
 assert.match(html,/for\(const b of B\)/);
 assert.match(html,/if\(sel\.kind==="road"\)/);
 assert.match(html,/if\(sel\.kind==="building"\)/);
});
test('deleting or moving default roads and buildings persists through reload and can be undone',()=>{
 assert.match(html,/function plannerDelete\(sel\)/);
 assert.match(html,/deletedFixedRoads\.add\(r\.id\)/);
 assert.match(html,/removedCampusBuildings\.add\(b\.n\)/);
 assert.match(html,/function plannerMoveTo\(sel,point\)/);
 assert.match(html,/campusBuildingPositions\[b\.n\]=\{x,z,rot:b\.rot\|\|0\}/);
 assert.match(html,/recordPlannerHistory\(\)/);
 assert.match(html,/defaultRoads:saveFixedRoads\(\)/);
 assert.match(html,/campusBuildingPositions,defaultRoads:saveFixedRoads\(\)/);
 assert.match(html,/function planningUndo\(\)/);
});
test('pinching with two fingers cancels editing and cannot drag or delete accidental objects',()=>{
 assert.match(html,/draggedStrategyObject=null;return;/);
 assert.match(html,/pinchMoved=true;if\(mapDrag\)mapDrag\.moved=true;draggedStrategyObject=null/);
 assert.match(html,/if\(activePointers\.size>=2\)/);
 assert.match(html,/if\(buildMode&&draggedStrategyObject\?\.id===e\.pointerId\)/);
});
