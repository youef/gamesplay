'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../nbu-campus-3d/it-deanship.js'),'utf8');
const site=fs.readFileSync(path.join(__dirname,'../nbu-campus-3d/index.html'),'utf8');

test('iPhone-friendly navigator loads, opens, changes floors and frees resources on exit',()=>{
 class Coord{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
 class Node{
  constructor(){this.position=new Coord();this.rotation={x:0,y:0,z:0};this.children=[];this.visible=true}
  add(child){this.children.push(child);return child}
  remove(child){const i=this.children.indexOf(child);if(i>=0)this.children.splice(i,1)}
  traverse(fn){fn(this);this.children.slice().forEach(child=>child.traverse(fn))}
 }
 class BoxGeometry{dispose(){this.wasDisposed=true}}
 class CylinderGeometry extends BoxGeometry{}
 class Mesh extends Node{
  constructor(geo,material){super();this.geometry=geo;this.material=material;this.isMesh=true}
 }
 class PointLight extends Node{}
 const THREE={Group:Node,Mesh,BoxGeometry,CylinderGeometry,PointLight};
 const ctx={
  clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},fillText(){},
  set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set textAlign(v){},
  set textBaseline(v){},set font(v){}
 };
 class Element{
  constructor(tag){
   this.tag=tag;this.children=[];this.style={};this.className='';this.hidden=false;
   this.attributes={};this.listeners={};this.textContent='';this.disabled=false;
  }
  append(...items){this.children.push(...items)}
  appendChild(item){this.children.push(item)}
  replaceChildren(...items){this.children=items}
  setAttribute(k,v){this.attributes[k]=v}
  getContext(){return ctx}
  getBoundingClientRect(){return {left:0,top:0,width:280,height:210}}
  addEventListener(type,fn){this.listeners[type]=fn}
  querySelector(selector){
   const name=selector.startsWith('.')?selector.slice(1):selector;
   const match=(obj)=>obj.className.split(/\s+/).includes(name);
   const queue=[...this.children];
   while(queue.length){const x=queue.shift();if(match(x))return x;queue.push(...x.children)}
   return null;
  }
 }
 const body=new Element('body'),head=new Element('head');
 const document={body,head,createElement:tag=>new Element(tag)};
 const sandbox={window:{},document};
 vm.runInNewContext(code,sandbox);
 const notices=[],player=new Node(),interior=new Node();
 const campus=sandbox.window.ITCampusFactory({
  THREE,pl:player,interior,
  mat:()=>({color:{setHex(){}},emissiveIntensity:.1}),
  lab:()=>new Node(),
  onNotice:msg=>notices.push(msg),onChange:()=>{}
 });
 campus.build();
 assert.equal(interior.children.length,4);
 campus.setActive(true);
 assert.equal(body.children.length,1,'Navigator attaches once');
 const dock=body.children[0],toggle=dock.querySelector('.it-map-toggle');
 assert.ok(toggle,'Map toggle exists');
 assert.match(toggle.textContent,/مخطط/);
 toggle.onclick();
 assert.equal(toggle.attributes['aria-expanded'],'true');
 assert.equal(dock.querySelector('.it-map-sheet').hidden,false);
 campus.tick(200);
 campus.switchFloor(2);
 assert.equal(player.position.y,10.8);
 assert.equal(campus.level,2);
 // Approaching the lift on arrival must open the two sliding panels.
 const liftDoors=interior.children[2].children.filter(n=>n.userData&&n.userData.itElevatorDoor);
 assert.equal(liftDoors.length,2);
 const left=liftDoors.find(n=>n.userData.itElevatorDoor==='left');
 const oldLeftX=left.position.x;
 campus.tick(400);
 assert.ok(left.position.x<oldLeftX-.1,'elevator door slides open when the player approaches');
 assert.equal(interior.children.filter(n=>n.visible).length,1);
 // Drawn room pin is a working touch destination.
 const canvas=(function find(node){
  if(node.tag==='canvas')return node;
  for(const child of node.children){const hit=find(child);if(hit)return hit}
  return null;
 })(dock);
 assert.ok(canvas);
 canvas.listeners.click({clientX:14+(-19+36)*3.5,clientY:12+(9+24)*3.75});
 assert.equal(player.position.x,731);
 assert.equal(player.position.z,9);
 assert.equal(toggle.attributes['aria-expanded'],'false');
 campus.setActive(false);
 assert.equal(dock.style.display,'none');
 assert.equal(interior.children.length,0,'3D geometry is released on exit');
 campus.build();
 assert.equal(interior.children.length,4,'Re-entry rebuilds the four levels');
 campus.setActive(true);
 assert.equal(body.children.length,1,'Navigator is reused, not duplicated');
});

test('new department navigation is wired to the real game',()=>{
 assert.match(site,/itCampus\.setActive\(true\)/);
 assert.match(site,/itCampus\.setActive\(false\)/);
 assert.match(site,/itCampus\.tick\(t\)/);
 assert.match(site,/it-deanship\.js\?v=/);
});
