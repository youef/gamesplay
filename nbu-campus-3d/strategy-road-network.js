/* Pure, browser-safe road graph used by the editable campus strategy map. */
(function(){
"use strict";
function build(roads,requested=11){
 const lines=(Array.isArray(roads)?roads:[]).slice(0,280).filter(r=>{
  if(!r||![r.x1,r.z1,r.x2,r.z2].every(Number.isFinite))return false;
  return (r.x1===r.x2)!==(r.z1===r.z2)&&Math.hypot(r.x2-r.x1,r.z2-r.z1)>=.5;
 });
 const cuts=lines.map(r=>[{x:r.x1,z:r.z1},{x:r.x2,z:r.z2}]);
 const horizontal=r=>r.z1===r.z2;
 const within=(v,a,b)=>v>=Math.min(a,b)-.01&&v<=Math.max(a,b)+.01;
 for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){
  const a=lines[i],b=lines[j],ah=horizontal(a),bh=horizontal(b);
  if(ah!==bh){
   const h=ah?a:b,v=ah?b:a,ix=v.x1,iz=h.z1;
   if(within(ix,h.x1,h.x2)&&within(iz,v.z1,v.z2)){
    cuts[i].push({x:ix,z:iz});cuts[j].push({x:ix,z:iz});
   }
  }else if(ah&&Math.abs(a.z1-b.z1)<.01){
   for(const x of [a.x1,a.x2])if(within(x,b.x1,b.x2))cuts[j].push({x,z:a.z1});
   for(const x of [b.x1,b.x2])if(within(x,a.x1,a.x2))cuts[i].push({x,z:a.z1});
  }else if(!ah&&Math.abs(a.x1-b.x1)<.01){
   for(const z of [a.z1,a.z2])if(within(z,b.z1,b.z2))cuts[j].push({x:a.x1,z});
   for(const z of [b.z1,b.z2])if(within(z,a.z1,a.z2))cuts[i].push({x:a.x1,z});
  }
 }
 const key=(p)=>Number(p.x.toFixed(2))+","+Number(p.z.toFixed(2));
 const graph=new Map();
 function link(a,b){
  const ka=key(a),kb=key(b),len=Math.hypot(a.x-b.x,a.z-b.z);
  if(ka===kb||len<.25)return;
  if(!graph.has(ka))graph.set(ka,new Map());
  if(!graph.has(kb))graph.set(kb,new Map());
  graph.get(ka).set(kb,len);graph.get(kb).set(ka,len);
 }
 for(let i=0;i<lines.length;i++){
  const h=horizontal(lines[i]),unique=new Map(cuts[i].map(p=>[key(p),p]));
  const points=[...unique.values()].sort((a,b)=>h?a.x-b.x:a.z-b.z);
  for(let j=1;j<points.length;j++)link(points[j-1],points[j]);
 }
 const keys=[...graph.keys()],limit=Math.max(1,Math.min(15,Math.floor(requested)));
 const result=[],signatures=new Set();
 // Shortest-path trees from dispersed endpoints and junctions keep routes contiguous.
 const endKeys=keys.filter(k=>graph.get(k).size===1);
 const origins=[...endKeys,...keys.filter((_,i)=>i%Math.max(1,Math.floor(keys.length/18))===0)];
 function shortest(start){
  const distance=new Map([[start,0]]),parent=new Map(),heap=[[0,start]];
  function push(item){heap.push(item);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let l=i*2+1,r=l+1,m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[i],heap[m]]=[heap[m],heap[i]];i=m}}return first}
  while(heap.length){
   const [d,node]=pop();if(d>distance.get(node)+.001)continue;
   for(const [other,w] of graph.get(node)){
    const nd=d+w;if(nd<(distance.get(other)??Infinity)-.001){
     distance.set(other,nd);parent.set(other,node);push([nd,other]);
    }
   }
  }
  let far=null,best=0;
  for(const [node,d] of distance)if(d>best){far=node;best=d}
  if(!far||best<10)return null;
  const nodes=[far],visited=new Set([far]);
  while(nodes[0]!==start&&parent.has(nodes[0])&&nodes.length<2000){
   const prev=parent.get(nodes[0]);if(visited.has(prev))break;nodes.unshift(prev);visited.add(prev);
  }
  if(nodes.length<2)return null;
  const signature=[nodes.join("|"),nodes.slice().reverse().join("|")].sort()[0];
  if(signatures.has(signature))return null;
  signatures.add(signature);
  return {length:best,nodes,points:nodes.map(v=>v.split(",").map(Number))};
 }
 const pool=[];
 for(let i=0;i<origins.length&&i<65;i++){const r=shortest(origins[i]);if(r)pool.push(r)}
 pool.sort((a,b)=>b.length-a.length);
 const used=[];
 for(const r of pool){
  if(result.length>=limit)break;
  // Avoid nearly identical itineraries while retaining disconnected districts.
  const signature=r.nodes.join("|");let bestOverlap=0;
  for(const prior of used){
   const same=r.nodes.filter(n=>prior.has(n)).length/Math.max(1,Math.min(r.nodes.length,prior.size));
   bestOverlap=Math.max(bestOverlap,same);
  }
  if(bestOverlap>.92&&result.length>0)continue;
  result.push(r.points);used.push(new Set(r.nodes));
 }
 if(!result.length&&pool.length)result.push(pool[0].points);
 // In a tiny single-road layout, duplicate routes deliberately so vehicles can be spread out.
 return {routes:result,nodes:graph.size,segments:lines.length,
  junctions:[...graph.values()].filter(edges=>edges.size>=3).length,
  deadEnds:[...graph.values()].filter(edges=>edges.size===1).length};
}
window.CampusRoadNetwork={build};
})();