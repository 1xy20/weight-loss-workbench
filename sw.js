const CACHE="wb-v2";
const FILES=["./","index.html","weight.html","stock.html","icon-192.png","icon-512.png","manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  // 页面(.html / 导航)走网络优先，保证每次改动能立即看到；离线时再退回缓存
  if(e.request.mode==="navigate"||url.pathname.endsWith(".html")){
    e.respondWith(fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./"))));
  }else{
    // 图片/清单等静态资源：缓存优先，速度更快
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp;}).catch(()=>caches.match("./"))));
  }
});
