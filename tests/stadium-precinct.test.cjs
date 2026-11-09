'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','nbu-campus-3d');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'stadium-precinct.js'),'utf8');

test('stadium plaza factory parses and builds independent 3D grounds',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 class Vec{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
 class Node{
  constructor(){this.position=new Vec();this.children=[]}
  add(obj){this.children.push(obj)}
 }
 class Group extends Node{}
 class Geo{
  setAttribute(){return this}
  setIndex(){return this}
  computeVertexNormals(){}
 }
 class Mesh extends Node{constructor(geometry,material){super();this.geometry=geometry;this.material=material}}
 const THREE={
  Group,Mesh,BoxGeometry:Geo,CylinderGeometry:Geo,ConeGeometry:Geo,
  BufferGeometry:Geo,Float32BufferAttribute:class{constructor(values,size){this.values=values;this.size=size}},
  DoubleSide:2
 };
 const sb={window:{}};
 vm.runInNewContext(source,sb);
 assert.equal(typeof sb.window.buildCampusStadiumPrecinct,'function');
 const scene=new Group(),COL=[],labels=[];
 const ST={x:365,z:40};
 const out=sb.window.buildCampusStadiumPrecinct({
  THREE,scene,ST,COL,mat:(color,opts)=>({color,opts}),
  lab:(title)=>{labels.push(title);const n=new Node();scene.add(n);return n}
 });
 assert.equal(out.plaza.x,ST.x);
 assert.equal(out.plaza.z,ST.z-132);
 assert.equal(out.parking.x,ST.x+122);
 assert.ok(scene.children.length>=4,'visual elements exist');
 assert.ok(COL.length>=2,'ticket booths have collision footprints');
 assert.ok(labels.some(t=>t.includes('ساحة الملعب')),'stadium plaza is labeled');
 assert.ok(labels.some(t=>t.includes('مواقف')),'parking is labeled');
});
test('realistic stadium is isolated from campus road and buildings',()=>{
 assert.match(html,/const ST=\{n:"الملعب",x:365,z:40,rx:90,rz:92,precinct:\{halfW:135,north:177,south:123\}/);
 const cx=365,halfW=135,eastCampusWallX=200;
 assert.ok(cx-halfW>eastCampusWallX,'sports precinct must not touch campus fence');
 assert.match(html,/\{n:"المبنى الترفيهي",x:-140,z:135/);
 assert.match(html,/addV\(245,-164,-97,9\)/);
 assert.match(html,/addH\(-164,245,508,14\)/);
 assert.match(html,/addV\(487,-164,-106,9\)/);
 assert.match(html,/buildCampusStadiumPrecinct\(\{THREE,scene:S,ST,mat,lab,COL\}\)/);
 assert.match(html,/Math\.abs\(x-ST\.x\)<ST\.precinct\.halfW/);
});
test('pitch is rectangular 105 x 68 with correct corner and penalty arcs',()=>{
 assert.match(html,/new THREE\.BoxGeometry\(68,\.24,105\)/);
 assert.match(html,/new THREE\.BoxGeometry\(82,\.18,119\)/);
 assert.doesNotMatch(html,/const ell=\(rx,rz,c,y\)/);
 assert.match(html,/const a=Math\.asin\(5\.5\/9\.15\)/);
 assert.match(html,/Math\.PI\+a,Math\.PI\*2-a,32/);
 assert.match(html,/x>0\?\(sign>0\?Math\.PI:Math\.PI\/2\)/);
 assert.match(html,/stripe\.position\.set\(ST\.x,pitch\.y-\.004/);
});
test('viewers can reach the plaza via settings and cannot clip through stands',()=>{
 assert.match(html,/sportsVisit\.textContent="📍 اذهب للساحة"/);
 assert.match(html,/sportsWatch\.textContent="⚽ شاهد المباراة"/);
 assert.match(html,/tp\(ST\.x,ST\.z-132,0,1\)/);
 assert.match(html,/stadiumPerimeterBlocked\(x,z/);
 assert.match(html,/wallSweepBlocked\(pl\.position\.x/);
 assert.match(html,/if\(b===ST\)\{cl\(\);\$\("sitStand"\)\.click\(\)\}/);
 assert.match(html,/stadiumStatsBar\.style\.display=seated&&!inside/);
});
