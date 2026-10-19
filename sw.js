const CACHE='nd96-v2';
const FILES=[
  './','./index.html','./tests.html','./manifest.json','./README.md',
  './js/core.js','./js/wallet.js','./js/vehicles.js','./js/characters.js','./js/decor.js',
  './js/buildings.js','./js/world.js','./js/north.js','./js/items.js','./js/player.js',
  './js/race.js','./js/properties.js','./js/minimap.js','./js/ui.js','./js/game.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))));self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));
});