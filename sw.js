// MyCinebox v1.7.110 — onglet À voir par catégorie, listes fines.
// Tout se dépose à la racine du dépôt : sw.js + watchlist.js.
const CACHE_NAME='mycinebox-v1.7.110';
const BASE='/MyCinebox/';
const SHELL=[BASE,BASE+'index.html',BASE+'manifest.json',BASE+'icon-192.png',BASE+'icon-512.png',BASE+'js/ai-connector.js',BASE+'watchlist.js'];
function isHtmlRequest(req){
  const u=new URL(req.url);
  return req.mode==='navigate'||u.pathname===BASE||u.pathname===BASE+'index.html';
}
async function addWatchlist(response){
  if(!response||!response.ok)return response;
  let html=await response.text();
  // Nettoyer d'anciennes injections si un ancien HTML provient du cache offline.
  html=html.replace(/<link\b[^>]*href=["']\/MyCinebox\/js\/watchlist\.css["'][^>]*>/gi,'');
  html=html.replace(/<script\b[^>]*src=["']\/MyCinebox\/js\/watchlist\.js["'][^>]*><\/script>/gi,'');
  // Strip any previous version's injected script to avoid executing 2 controllers.
  html=html.replace(/<script\b[^>]*data-mycinebox-watchlist-v\d+[^>]*><\/script>/gi,'');
  if(!html.includes('data-mycinebox-watchlist-v110')){
    html=html.replace(/<\/body>/i,'<script data-mycinebox-watchlist-v110 src="/MyCinebox/watchlist.js"></script>\n</body>');
  }
  const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.allSettled(SHELL.map(p=>cache.add(p)))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mycinebox-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
  event.respondWith((async()=>{
    const doc=isHtmlRequest(req);
    try{
      const response=await fetch(req);
      const result=doc?await addWatchlist(response):response;
      if(result?.ok){const copy=result.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)).catch(()=>{});}
      return result;
    }catch(_){
      const cached=await caches.match(req)||await caches.match(BASE);
      return cached?(doc?addWatchlist(cached):cached):Response.error();
    }
  })());
});
