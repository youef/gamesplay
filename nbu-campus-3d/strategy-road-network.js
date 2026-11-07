/* Editable campus street graph: at-grade intersections + grade-separated real flyover routes.
   Only physically connected bridge ramps join ground roads; no fake junctions under bridges. */
(function(){
"use strict";
function build(roads,requested=11,structures=[]){
 const lines=(Array.isArray(roads)?roads:[]).slice(0,280).filter(r=>{
  if(!r||![r.x1,r.z1,r.x2,r.z2].every(Number.isFinite))return false;
  return (r.x1===r.x2)!==(r.z1===r.z2)&&Math.hypot(r.x2-r.x1,r.z2-r.z1)>=.5;
 });
 const cuts=lines.map(r=>[{x:r.x1,z:r.z1,y:0},{x:r.x2,z:r.z2,y:0}]);
 const horizontal=r=>r.z1===r.z2;
 const within=(v,a,b)=>v>=Math.min(a,b)-.01&&v<=Math.max(a,b)+.01;
 for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){
  const a=lines[i],b=lines[j],ah=horizontal(a),bh=horizontal(b);
  if(ah!==bh){
   const h=ah?a:b,v=ah?b:a,ix=v.x1,iz=h.z1;
   if(within(ix,h.x1,h.x2)&&within(iz,v.z1,v.z2)){
    cuts[i].push({x:ix,z:iz,y:0});cuts[j].push({x:ix,z:iz,y:0});
   }
  }else if(ah&&Math.abs(a.z1-b.z1)<.01){
   for(const x of [a.x1,a.x2])if(within(x,b.x1,b.x2))cuts[j].push({x,z:a.z1,y:0});
   for(const x of [b.x1,b.x2])if(within(x,a.x1,a.x2))cuts[i].push({x,z:a.z1,y:0});
  }else if(!ah&&Math.abs(a.x1-b.x1)<.01){
   for(const z of [a.z1,a.z2])if(within(z,b.z1,b.z2))cuts[j].push({x:a.x1,z,y:0});
   for(const z of [b.z1,b.z2])if(within(z,a.z1,a.z2))cuts[i].push({x:a.x1,z,y:0});
  }
 }
 const key=p=>[p.x,p.z,p.y||0].map(v=>(Math.round(v*100)/100).toFixed(2)).join(",");
 const graph=new Map();
 function link(a,b){
  const ka=key(a),kb=key(b),len=Math.hypot(a.x-b.x,a.z-b.z,(a.y||0)-(b.y||0));
  if(ka===kb||len<.22)return;
  if(!graph.has(ka))graph.set(ka,new Map());
  if(!graph.has(kb))graph.set(kb,new Map());
  graph.get(ka).set(kb,len);graph.get(kb).set(ka,len);
 }
 function closestGround(x,z,maxDistance=2.5){
  let best=null,distance=maxDistance;
  for(let i=0;i<lines.length;i++){
   const r=lines[i],dx=r.x2-r.x1,dz=r.z2-r.z1,den=dx*dx+dz*dz;
   const t=Math.max(0,Math.min(1,((x-r.x1)*dx+(z-r.z1)*dz)/den));
   const projected={x:r.x1+t*dx,z:r.z1+t*dz,y:0};
   const d=Math.hypot(x-projected.x,z-projected.z);
   if(d<distance+1e-7){best={point:projected,segment:i};distance=d}
  }
  if(best)cuts[best.segment].push(best.point);
  return best&&best.point;
 }
 // Attach ramps before splitting surface segments, allowing endpoints in the middle of a street.
 const bridgePaths=[],circleParts=[],featuredPaths=[];
 function recordPath(points){bridgePaths.push(points);for(let i=1;i<points.length;i++)link(points[i-1],points[i]);}
 for(const s of (Array.isArray(structures)?structures:[]).slice(0,80)){
  if(!s)continue;
  if((s.type==="bridge"||s.type==="flyover")&&s.end&&
    [s.x,s.z,s.end.x,s.end.z].every(Number.isFinite)){
   const dx=s.end.x-s.x,dz=s.end.z-s.z,L=Math.hypot(dx,dz);
   if(L<12||L>230)continue;
   const start=closestGround(s.x,s.z,3),end=closestGround(s.end.x,s.end.z,3);
   if(!start||!end)continue;
   const a=Math.atan2(dx,dz),bend=s.type==="flyover"?Math.min(28,L*.21):0;
   const points=[start,{x:s.x,z:s.z,y:0}],N=Math.max(14,Math.ceil(L/5));
   for(let j=1;j<N;j++){
    const t=j/N,off=bend*Math.sin(Math.PI*t),rise=Math.min(5.7,Math.min(t,1-t)*L*.105);
    points.push({x:s.x+dx*t+Math.cos(a)*off,z:s.z+dz*t-Math.sin(a)*off,y:rise});
   }
   points.push({x:s.end.x,z:s.end.z,y:0},end);
   recordPath(points);featuredPaths.push(points);
  }else if(s.type==="bridgeCircle"&&Number.isFinite(s.x)&&Number.isFinite(s.z)){
   const exits=[];
   for(let k=0;k<4;k++){
    const a=k*Math.PI/2,nx=Math.cos(a),nz=Math.sin(a);
    const end={x:s.x+nx*71,z:s.z+nz*71};
    const surface=closestGround(end.x,end.z,4);
    if(surface)exits.push({k,nx,nz,surface,end});
   }
   if(exits.length<2)continue; // disconnected decorative circle must not spawn fake traffic
   circleParts.push({center:s,exits});
  }
 }
 for(let i=0;i<lines.length;i++){
  const h=horizontal(lines[i]),unique=new Map(cuts[i].map(p=>[key(p),p]));
  const points=[...unique.values()].sort((a,b)=>h?a.x-b.x:a.z-b.z);
  for(let j=1;j<points.length;j++)link(points[j-1],points[j]);
 }
 for(const {center,exits} of circleParts){
  const ring=[],N=48,R=26,H=5.65;
  for(let j=0;j<N;j++){
   const a=j*2*Math.PI/N;
   ring.push({x:center.x+Math.cos(a)*R,z:center.z+Math.sin(a)*R,y:H});
  }
  for(let j=0;j<N;j++)link(ring[j],ring[(j+1)%N]);
  for(const {k,nx,nz,surface,end} of exits){
   const steps=9,points=[surface,{x:end.x,z:end.z,y:0}];
   for(let j=steps-1;j>=0;j--){
    const t=j/steps;
    const radius=R+(71-R)*t;
    points.push({x:center.x+nx*radius,z:center.z+nz*radius,y:H*(1-t)});
   }
   recordPath(points);
  }
  if(exits.length>=2){
   const start=exits[0],finish=exits[1],part=[];
   const entrance=bridgePaths.find(p=>key(p[0])===key(start.surface));
   const exit=bridgePaths.find(p=>key(p[0])===key(finish.surface));
   if(entrance&&exit){
    part.push(...entrance);
    const a=start.k*12,b=finish.k*12;
    for(let j=a+1;j<=b;j++)part.push(ring[j%N]);
    part.push(...exit.slice().reverse());
    featuredPaths.push(part);
   }
  }
 }
 const keys=[...graph.keys()],limit=Math.max(1,Math.min(15,Math.floor(requested)));
 const result=[],signatures=new Set();
 // Prioritize visible, connected ramps so vehicles actually use the new bridges.
 for(const path of featuredPaths.slice(0,4)){
  if(result.length>=limit)break;
  const unique=[];
  for(const p of path){const k=key(p);if(!unique.length||key(unique[unique.length-1])!==k)unique.push(p)}
  if(unique.length<2)continue;
  const signature=[unique.map(key).join("|"),unique.map(key).reverse().join("|")].sort()[0];
  if(signatures.has(signature))continue;
  signatures.add(signature);
  result.push(unique.map(p=>[p.x,p.z,p.y||0]));
 }
 const allRoutes=[];
 const endKeys=keys.filter(k=>graph.get(k).size===1);
 const origins=[...endKeys,...keys.filter((_,i)=>i%Math.max(1,Math.floor(keys.length/18))===0)];
 function shortest(start){
  const distance=new Map([[start,0]]),parent=new Map(),heap=[[0,start]];
  function push(item){heap.push(item);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let l=i*2+1,r=l+1,m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[i],heap[m]]=[heap[m],heap[i]];i=m}}return first}
  while(heap.length){
   const [d,node]=pop();if(d>distance.get(node)+.001)continue;
   for(const [other,w] of graph.get(node)){
    const nd=d+w;if(nd<(distance.get(other)??Infinity)-.001){distance.set(other,nd);parent.set(other,node);push([nd,other])}
   }
  }
  let far=null,best=0;
  for(const [node,d] of distance)if(d>best){far=node;best=d}
  if(!far||best<10)return null;
  const nodes=[far],visited=new Set([far]);
  while(nodes[0]!==start&&parent.has(nodes[0])&&nodes.length<2000){
   const prev=parent.get(nodes[0]);if(visited.has(prev))break;nodes.unshift(prev);visited.add(prev)
  }
  if(nodes.length<2)return null;
  const signature=[nodes.join("|"),nodes.slice().reverse().join("|")].sort()[0];
  if(signatures.has(signature))return null;
  return {length:best,nodes,points:nodes.map(v=>v.split(",").map(Number)),signature};
 }
 for(let i=0;i<origins.length&&i<65;i++){const r=shortest(origins[i]);if(r)allRoutes.push(r)}
 allRoutes.sort((a,b)=>b.length-a.length);
 const used=result.map(r=>new Set(r.map(p=>key({x:p[0],z:p[1],y:p[2]}))));
 for(const r of allRoutes){
  if(result.length>=limit)break;
  if(signatures.has(r.signature))continue;
  const overlap=Math.max(0,...used.map(prior=>r.nodes.filter(n=>prior.has(n)).length/
    Math.max(1,Math.min(r.nodes.length,prior.size))));
  if(overlap>.92&&result.length>0)continue;
  result.push(r.points);used.push(new Set(r.nodes));signatures.add(r.signature);
 }
 if(!result.length&&allRoutes.length)result.push(allRoutes[0].points);
 return {routes:result,nodes:graph.size,segments:lines.length,
  junctions:[...graph.values()].filter(edges=>edges.size>=3).length,
  deadEnds:[...graph.values()].filter(edges=>edges.size===1).length,
  connectedBridges:featuredPaths.length};
}
window.CampusRoadNetwork={build};
})();