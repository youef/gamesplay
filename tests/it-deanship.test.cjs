'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'nbu-campus-3d','it-deanship.js'),'utf8');
const html=fs.readFileSync(path.join(root,'nbu-campus-3d','index.html'),'utf8');

test('IT model JavaScript parses and is loaded by the game',()=>{
 assert.doesNotThrow(()=>new vm.Script(source,{filename:'it-deanship.js'}));
 assert.match(html,/script src="\.\/it-deanship\.js/);
 assert.match(html,/itCampus\.build\(\)/);
 assert.match(html,/itCampus\.renderRooms\(parent\)/);
 assert.match(html,/itCampus\.blocked\(/);
});
test('multi-level IT layout, elevator and interior walls work without WebGL',()=>{
 const sandbox={window:{}};
 vm.runInNewContext(source,sandbox);
 assert.equal(typeof sandbox.window.ITCampusFactory,'function');
 class Coord{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
 class Node{
  constructor(){this.position=new Coord();this.rotation={x:0,y:0,z:0};this.children=[];this.visible=true}
  add(child){this.children.push(child);return child}
  remove(child){const n=this.children.indexOf(child);if(n>=0)this.children.splice(n,1)}
  traverse(fn){fn(this);for(const child of this.children)child.traverse(fn)}
 }
 class Geo{dispose(){}}
 class Mesh extends Node{constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.isMesh=true}}
 class PointLight extends Node{}
 const THREE={Group:Node,Mesh,BoxGeometry:Geo,CylinderGeometry:Geo,PointLight};
 const interior=new Node(),player=new Node(),notices=[];
 let rendered=0;
 const factory=sandbox.window.ITCampusFactory;
 const plan=factory({THREE,interior,mat:()=>({}),lab:()=>new Node(),pl:player,
  onNotice:msg=>notices.push(msg),onChange:()=>rendered++});
 assert.deepEqual(Array.from(plan.levels),['الدور الأرضي','الدور الأول','الدور الثاني','السطح']);
 for(const name of ['خدمة العملاء','قسم الشبكات','الأمن السيبراني','مركز البيانات (Data Center)',
  'دورات المياه','غرفة عامل النظافة','غرفة الأعمال']){
  assert.ok(plan.rooms[0].some(r=>r.n===name),'Missing ground-floor room: '+name);
 }
 plan.build();
 assert.equal(interior.children.length,4);
 assert.equal(interior.children.filter(g=>g.visible).length,1);
 assert.equal(plan.level,0);
 // Solid side partition between the corridor and customer service.
 assert.equal(plan.blocked(748,6,738,6),true);
 // Correctly leave the service door open in the same partition.
 assert.equal(plan.blocked(748,9,738,9),false);
 plan.switchFloor(2);
 assert.equal(player.position.y,10.8);
 assert.equal(interior.children.filter(g=>g.visible).length,1);
 plan.switchFloor(3);
 assert.ok(Math.abs(player.position.y-16.2)<1e-8);
 plan.visit(plan.rooms[3][0]);
 assert.equal(player.position.x,730);
 assert.ok(rendered>=2);
 assert.ok(notices.some(s=>s.includes('السطح')));
 // Re-entering the building resets the model rather than leaving 8 floors in memory.
 plan.build();
 assert.equal(plan.level,0);
 assert.equal(interior.children.length,4);
});