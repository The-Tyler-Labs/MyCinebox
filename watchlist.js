/* MyCinebox v1.7.110 — mise à jour autonome. CSS intégré : un seul JS à la racine avec sw.js. */
(function(){
  if(!document.getElementById('mycinebox-watchlist-css-v110')){
    const style=document.createElement('style');style.id='mycinebox-watchlist-css-v110';
    style.textContent="/* MyCinebox v1.7.108 : vue À voir, tris indépendants, mini-liste. */\n.bottom-nav{overflow-x:auto;scrollbar-width:none;white-space:nowrap;justify-content:flex-start}\n.bottom-nav::-webkit-scrollbar{display:none}\n.bottom-nav .nav-btn{flex:1 0 60px;min-width:60px}\n#page-a-voir{padding-bottom:30px}\n.wl-header{margin:2px 0 17px}.wl-header h2{font-size:24px;color:var(--text);margin:0 0 4px}\n.wl-muted{font-size:12px;color:var(--text2)}.wl-header p{font-size:12px;color:var(--text2)}\n.wl-controls{display:flex;gap:9px;align-items:end;flex-wrap:wrap;margin-bottom:10px}\n.wl-control{display:flex;flex-direction:column;gap:5px;min-width:190px;flex:1}\n.wl-control-label{font-size:11px;color:var(--text2)}\n.wl-select{background:var(--surface2);border:1px solid #505050;color:var(--text);border-radius:9px;padding:10px 9px;min-height:41px;width:100%}\n.wl-button{background:var(--surface2);border:1px solid #444;border-radius:9px;color:var(--text);padding:9px 12px;min-height:40px;font-size:12px;cursor:pointer}\n.wl-button:hover,.wl-button:focus-visible{border-color:var(--green-light)}\n.wl-primary{background:var(--green-light);color:#fff;border-color:var(--green-light)}\n.wl-subtoolbar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:5px 0 13px}\n.wl-note{font-size:11px;color:#94d1b7}\n.wl-section{margin-bottom:24px}.wl-section-title{font-size:16px;font-weight:700;color:var(--text);margin:0 0 10px}\n.wl-card-container{display:grid;gap:11px}\n.wl-layout-liste{grid-template-columns:1fr}\n.wl-layout-carre.wl-size-petit{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}\n.wl-layout-carre.wl-size-moyen{grid-template-columns:repeat(auto-fill,minmax(165px,1fr))}\n.wl-layout-carre.wl-size-grand{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}\n.wl-layout-affiche.wl-size-petit{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}\n.wl-layout-affiche.wl-size-moyen{grid-template-columns:repeat(auto-fill,minmax(155px,1fr))}\n.wl-layout-affiche.wl-size-grand{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}\n.wl-card{min-width:0;position:relative;background:var(--surface);border:1px solid #383838;border-radius:11px;overflow:hidden;display:flex;color:var(--text);box-shadow:0 2px 8px #0002}\n.wl-card.wl-liste{flex-direction:row;align-items:stretch;min-height:108px}\n.wl-card.wl-liste.wl-petit{min-height:80px}.wl-card.wl-liste.wl-grand{min-height:156px}\n.wl-card.wl-carre,.wl-card.wl-affiche{flex-direction:column}\n.wl-card .wl-poster{background:var(--surface2);flex-shrink:0;position:relative;overflow:hidden}\n.wl-card.wl-liste .wl-poster{width:80px}.wl-card.wl-liste.wl-petit .wl-poster{width:60px}.wl-card.wl-liste.wl-grand .wl-poster{width:110px}\n.wl-card.wl-carre .wl-poster{aspect-ratio:1/1;width:100%}\n.wl-card.wl-affiche .wl-poster{aspect-ratio:2/3;width:100%}\n.wl-card .wl-poster img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0}\n.wl-card .wl-no-image{width:100%;height:100%;min-height:70px;display:grid;place-items:center;font-size:28px}\n.wl-card-main{min-width:0;flex:1;padding:10px}\n.wl-card-main h3{font-size:14px;line-height:1.3;margin:6px 0 7px;overflow-wrap:anywhere}\n.wl-card.wl-petit .wl-card-main h3{font-size:12px}.wl-card.wl-grand .wl-card-main h3{font-size:16px}\n.wl-chip{border:1px solid #49775e;border-radius:7px;font-size:10px;padding:2px 6px;color:#a4e6bd;display:inline-block;line-height:1.4}\n.wl-cat-series{color:#d9b6ff;border-color:#8e4bc9}.wl-cat-animation{color:#a7d9ff;border-color:#2878c6}.wl-cat-documentaires{color:#ffdc96;border-color:#bf9630}\n.wl-meta{display:flex;flex-direction:column;gap:4px;font-size:10px;color:var(--text2);line-height:1.25}\n.wl-card-actions{display:flex;align-items:center;gap:4px;padding:8px;flex-shrink:0}\n.wl-card.wl-carre .wl-card-actions,.wl-card.wl-affiche .wl-card-actions{padding-top:0;justify-content:space-between}\n.wl-open,.wl-drag,.wl-arrows button{background:var(--surface2);color:var(--text);font-size:11px;border:1px solid #444;border-radius:6px;padding:7px 9px;cursor:pointer}\n.wl-drag{font-size:20px;cursor:grab;touch-action:none;line-height:1}.wl-arrows{display:flex;gap:3px}.wl-arrows button{padding:6px 7px}\n.wl-card.wl-dragging{opacity:.45}.wl-card.wl-drop-target{outline:3px solid var(--green-light)}\n.wl-empty{padding:24px;color:var(--text2);background:var(--surface);border-radius:10px;text-align:center;font-size:13px}\n.wl-overlay{position:fixed;inset:0;z-index:1200;background:#000b;display:flex;align-items:center;justify-content:center;padding:12px}\n.wl-overlay[hidden]{display:none!important}\n.wl-modal{background:var(--surface);border:1px solid #444;border-radius:14px;padding:15px;max-height:90vh;overflow:auto;width:min(530px,100%);box-shadow:0 12px 42px #0009}\n.wl-modal-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:15px}.wl-modal-heading h3{font-size:17px}\n.wl-close{width:33px;min-height:33px;padding:5px;font-size:18px}\n.wl-settings-field{padding:13px 0;border-top:1px solid #444}.wl-settings-field h4{font-size:13px;margin:0 0 9px}\n.wl-radio-grid{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}\n.wl-radio-item,.wl-toggle{display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;line-height:1.4}\n.wl-radio-item input,.wl-toggle input{accent-color:var(--green-light)}\n.wl-type-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}\n.wl-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:15px}\n@media(max-width:420px){.bottom-nav .nav-btn{flex:0 0 59px}.wl-controls .wl-control{min-width:100%;}.wl-card.wl-liste .wl-poster{width:75px}.wl-card.wl-liste .wl-card-actions{flex-direction:column;justify-content:center}.wl-card.wl-liste .wl-arrows{flex-direction:column}.wl-card.wl-liste .wl-card-main{padding:7px}}\n\n/* v1.7.107 : CATÉGORIES CÔTE À CÔTE, de gauche à droite, jamais empilées. */\n#wl-results.wl-columns{\n  display:grid;\n  grid-template-columns:repeat(var(--wl-group-count,1),minmax(300px,1fr));\n  grid-auto-flow:column;\n  gap:12px;\n  width:100%;min-width:0;max-width:100%;overflow-x:auto;overflow-y:visible;\n  align-items:start;scrollbar-width:thin;scrollbar-color:var(--green-light) var(--surface2);\n  padding-bottom:12px;\n}\n#wl-results.wl-columns>.wl-section{\n  min-width:0;width:auto;margin:0;\n  padding:11px 10px 15px;\n  background:var(--surface2);border:1px solid #444;\n  border-top:3px solid var(--green-light);border-radius:12px;\n}\n#wl-results.wl-columns .wl-section-title{\n  position:sticky;top:0;z-index:1;font-size:15px;padding:2px 0 10px;\n  margin:0 0 11px;border-bottom:1px solid #494949;\n  background:var(--surface2);\n}\n/* Dans chaque catégorie : les fiches vont de gauche à droite, PUIS à la ligne. */\n#wl-results.wl-columns .wl-card-container{\n  display:grid;grid-auto-flow:row;gap:9px;\n  justify-content:stretch;align-content:start;align-items:start;min-width:0;\n}\n#wl-results.wl-columns .wl-layout-liste{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))}\n#wl-results.wl-columns .wl-layout-liste.wl-size-mini{grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr))}\n#wl-results.wl-columns .wl-layout-carre.wl-size-mini,\n#wl-results.wl-columns .wl-layout-affiche.wl-size-mini{grid-template-columns:repeat(auto-fill,minmax(min(100%,86px),1fr))}\n#wl-results.wl-columns .wl-layout-carre.wl-size-petit,\n#wl-results.wl-columns .wl-layout-affiche.wl-size-petit{grid-template-columns:repeat(auto-fill,minmax(min(100%,120px),1fr))}\n#wl-results.wl-columns .wl-layout-carre.wl-size-moyen,\n#wl-results.wl-columns .wl-layout-affiche.wl-size-moyen{grid-template-columns:repeat(auto-fill,minmax(min(100%,160px),1fr))}\n#wl-results.wl-columns .wl-layout-carre.wl-size-grand,\n#wl-results.wl-columns .wl-layout-affiche.wl-size-grand{grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))}\n#wl-results.wl-columns .wl-card{width:100%;min-width:0;max-width:none;margin:0}\n/* En mode non séparé, grille de miniatures sur toute la largeur également. */\n#wl-results:not(.wl-columns){width:100%;min-width:0}\n.wl-card-container.wl-size-mini.wl-layout-carre,.wl-card-container.wl-size-mini.wl-layout-affiche{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))}\n.wl-card-container.wl-size-mini.wl-layout-liste{grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))}\n.wl-card.wl-liste.wl-mini{min-height:72px}\n.wl-card.wl-liste.wl-mini .wl-poster{width:54px}\n.wl-card.wl-mini .wl-card-main{padding:6px}\n.wl-card.wl-mini .wl-card-main h3{font-size:11px}\n@media(max-width:700px){\n  #wl-results.wl-columns{gap:9px;grid-template-columns:repeat(var(--wl-group-count,1),minmax(255px,1fr));}\n  #wl-results.wl-columns>.wl-section{padding:8px 6px 12px}\n  #wl-results.wl-columns .wl-card-container{gap:7px}\n}\n/* Minimal : une affiche + le titre, pas les trois dates ni le badge de type. */\n.wl-card.wl-compact .wl-chip,.wl-card.wl-compact .wl-meta,.wl-card.wl-compact .wl-open,.wl-card.wl-compact .wl-arrows{display:none!important}\n.wl-card.wl-compact{cursor:pointer}\n.wl-card.wl-compact .wl-card-main h3{font-size:11px;line-height:1.2;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.wl-card.wl-compact.wl-liste .wl-card-main{display:flex;align-items:center}\n.wl-card.wl-compact.wl-liste .wl-card-actions{padding:3px}\n.wl-card.wl-compact.wl-liste .wl-drag{min-width:32px;min-height:35px}\n.wl-card.wl-compact.wl-carre .wl-card-main,.wl-card.wl-compact.wl-affiche .wl-card-main{position:absolute;left:0;right:0;bottom:0;z-index:2;background:linear-gradient(transparent,rgba(0,0,0,.9));color:white;padding:25px 5px 6px;pointer-events:none}\n.wl-card.wl-compact.wl-carre .wl-card-actions,.wl-card.wl-compact.wl-affiche .wl-card-actions{position:absolute;right:3px;top:3px;z-index:3;padding:0}\n.wl-card.wl-compact.wl-carre .wl-drag,.wl-card.wl-compact.wl-affiche .wl-drag{font-size:18px;min-width:30px;min-height:34px;padding:3px;background:#111b;color:#fff;border:1px solid #888;border-radius:6px}\n.wl-card.wl-compact.wl-affiche .wl-poster{aspect-ratio:2/3}\n.wl-card.wl-compact.wl-carre .wl-poster{aspect-ratio:1/1}\n\n.wl-drag{touch-action:none;user-select:none;-webkit-user-select:none;min-width:37px;min-height:38px;font-size:24px;cursor:grab;position:relative;z-index:3}\n.wl-reordering .wl-drag{cursor:grabbing}\n.wl-reordering{user-select:none;-webkit-user-select:none}\n.wl-reordering .wl-card{transition:opacity .1s}\n.wl-card.wl-drop-target{outline:3px solid #4fda92;outline-offset:-3px;box-shadow:0 0 0 2px #4fda9260}\n.wl-card.wl-drop-target[data-wl-drop-side=\"after\"]{border-bottom:5px solid #4fda92}\n.wl-card.wl-drop-target[data-wl-drop-side=\"before\"]{border-top:5px solid #4fda92}\n@media(max-width:700px){.wl-drag{min-width:42px;min-height:44px}}\n/* « Carré » désigne la fiche entière et pas uniquement la miniature. */\n.wl-card.wl-carre{aspect-ratio:1/1;display:block;position:relative;min-height:0!important}\n.wl-card.wl-carre .wl-poster{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;background:var(--surface2)}\n.wl-card.wl-carre .wl-poster img{object-fit:cover}\n.wl-card.wl-carre .wl-card-main{position:absolute;z-index:1;left:0;right:0;bottom:0;padding:12px 9px 9px;background:linear-gradient(0deg,rgba(0,0,0,.97),rgba(0,0,0,.78) 65%,transparent);color:#fff;pointer-events:none}\n.wl-card.wl-carre .wl-card-main h3{margin:5px 0 4px;font-size:clamp(11px,1.1vw,14px);line-height:1.18;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.wl-card.wl-carre .wl-meta{font-size:9px;gap:2px;color:#ddd}\n.wl-card.wl-carre .wl-meta span:nth-child(2){display:none}\n.wl-card.wl-carre .wl-chip{font-size:9px}\n.wl-card.wl-carre .wl-card-actions{position:absolute;right:6px;top:6px;z-index:2;display:flex;gap:4px;flex-direction:row;align-items:flex-start;padding:0;max-width:calc(100% - 12px)}\n.wl-card.wl-carre .wl-open,.wl-card.wl-carre .wl-drag{background:rgba(9,9,9,.87);color:#fff;border:1px solid #777}\n.wl-card.wl-carre .wl-arrows{display:none}\n@media(pointer:coarse){.wl-card.wl-carre .wl-drag{min-width:44px;min-height:44px}}\n\n/* v1.7.107 : détails et titre minimisés dans tous les formats */\n.wl-card.wl-compact.wl-carre .wl-card-main h3,.wl-card.wl-compact.wl-affiche .wl-card-main h3{font-size:11px!important;line-height:1.16!important;margin:0!important}\n.wl-card.wl-compact.wl-carre .wl-card-actions,.wl-card.wl-compact.wl-affiche .wl-card-actions{justify-content:flex-end!important}\n.wl-card.wl-compact.wl-affiche .wl-poster{width:100%}\n\n/* v1.7.108 — en-têtes indépendants par catégorie */\n.wl-section-heading{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:9px;margin:0 0 11px;padding-bottom:9px;border-bottom:1px solid #484848}\n.wl-section-heading .wl-section-title{position:static!important;margin:0!important;padding:0!important;border:0!important;background:none!important;white-space:nowrap}\n.wl-category-controls{display:flex;gap:6px;align-items:end;flex-wrap:wrap;min-width:0}\n.wl-category-controls .wl-control{flex:1 1 155px;min-width:140px}\n.wl-category-controls .wl-control-label{font-size:10px}\n.wl-category-controls .wl-select{min-height:34px;padding:5px 7px;font-size:11px}\n.wl-category-controls .wl-button{min-height:34px;padding:6px 8px;font-size:10px}\n.wl-global-hint{font-size:12px;color:var(--green-light);padding:8px 0;flex:1}\n#wl-results.wl-columns .wl-section-heading{position:sticky;top:0;z-index:2;background:var(--surface2)}\n/* Mini-liste : une petite affiche et un titre par ligne, sans les métadonnées. */\n.wl-card-container.wl-layout-mini-liste,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste{display:grid;grid-template-columns:minmax(0,1fr);gap:4px}\n.wl-card.wl-mini-liste{display:flex;flex-direction:row;align-items:center;min-height:44px!important;height:44px;aspect-ratio:auto!important;cursor:pointer;border-radius:7px}\n.wl-card.wl-mini-liste .wl-poster{position:relative;inset:auto;flex:0 0 30px;width:30px;height:42px;aspect-ratio:auto!important;}\n.wl-card.wl-mini-liste .wl-poster img{object-fit:cover}\n.wl-card.wl-mini-liste .wl-card-main{position:static;background:none;min-width:0;flex:1;padding:3px 8px;pointer-events:none}\n.wl-card.wl-mini-liste .wl-card-main h3{font-size:11px!important;font-weight:600;line-height:1.25;margin:0!important;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.wl-card.wl-mini-liste .wl-chip,.wl-card.wl-mini-liste .wl-meta,.wl-card.wl-mini-liste .wl-open,.wl-card.wl-mini-liste .wl-arrows{display:none!important}\n.wl-card.wl-mini-liste .wl-card-actions{position:static;padding:1px 3px;max-width:none;flex:0 0 auto}\n.wl-card.wl-mini-liste .wl-drag{min-width:34px;min-height:40px;padding:4px;font-size:19px;z-index:2}\n@media(pointer:coarse){.wl-card.wl-mini-liste{height:48px;min-height:48px!important}.wl-card.wl-mini-liste .wl-poster{height:46px}.wl-card.wl-mini-liste .wl-drag{min-height:44px;min-width:42px}}\n\n/* v1.7.110 — liste vraiment fine : une seule ligne par titre, miniature 22px. */\n.wl-card-container.wl-layout-mini-liste,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste{\n  display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:2px!important;\n}\n.wl-card.wl-mini-liste{\n  box-sizing:border-box!important;display:flex!important;flex-direction:row!important;\n  height:34px!important;min-height:34px!important;max-height:34px!important;\n  border-radius:5px!important;align-items:center!important;aspect-ratio:auto!important;\n  box-shadow:none!important;\n}\n.wl-card.wl-mini-liste .wl-poster{\n  position:relative!important;flex:0 0 22px!important;width:22px!important;\n  height:32px!important;min-height:0!important;inset:auto!important;aspect-ratio:auto!important;\n}\n.wl-card.wl-mini-liste .wl-card-main{\n  position:static!important;background:none!important;flex:1!important;min-width:0!important;\n  padding:0 6px!important;pointer-events:none!important;\n}\n.wl-card.wl-mini-liste .wl-card-main h3{\n  font-size:11px!important;line-height:1.15!important;white-space:nowrap!important;\n  text-overflow:ellipsis!important;display:block!important;overflow:hidden!important;\n  margin:0!important;\n}\n.wl-card.wl-mini-liste .wl-chip,.wl-card.wl-mini-liste .wl-meta,\n.wl-card.wl-mini-liste .wl-open,.wl-card.wl-mini-liste .wl-arrows{display:none!important}\n.wl-card.wl-mini-liste .wl-card-actions{\n  position:static!important;flex:0 0 auto!important;padding:0 2px!important;\n  max-width:none!important;\n}\n.wl-card.wl-mini-liste .wl-drag{\n  min-height:28px!important;height:28px!important;min-width:28px!important;width:28px!important;\n  padding:0!important;font-size:17px!important;\n}\n@media(pointer:coarse){\n  .wl-card.wl-mini-liste{height:42px!important;min-height:42px!important;max-height:42px!important}\n  .wl-card.wl-mini-liste .wl-poster{height:40px!important;width:27px!important;flex-basis:27px!important}\n  .wl-card.wl-mini-liste .wl-drag{min-width:42px!important;width:42px!important;min-height:40px!important;height:40px!important}\n}\n/* En-têtes : format, taille et tri propres à chaque catégorie. */\n.wl-category-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:end;min-width:0}\n.wl-category-controls .wl-control{flex:1 1 125px;min-width:115px}\n.wl-category-controls .wl-control .wl-select{font-size:11px;padding:5px 6px;min-height:34px}\n.wl-category-controls .wl-control .wl-control-label{font-size:10px}\n.wl-category-view-settings{display:grid;gap:8px}\n.wl-view-setting-row{display:flex;gap:7px;align-items:end;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid #404040}\n.wl-view-setting-row>strong{flex:1 0 100px;align-self:center;font-size:12px}\n.wl-view-setting-row .wl-control{flex:1 1 130px;min-width:115px}\n.wl-view-setting-row .wl-control .wl-select{min-height:36px;padding:6px;font-size:11px}\n.wl-view-setting-row .wl-toggle{flex:0 0 auto;padding-bottom:8px}\n.wl-view-setting-row .wl-button{min-height:34px;padding:6px;font-size:10px}\n\n/* MyCinebox v1.7.110 — mini-liste = vignettes carrées placées côte à côte. */\n/* La taille de chaque tuile dépend de la catégorie (Films / Séries / ...). */\n.wl-card-container.wl-layout-mini-liste,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste{\n  --wl-mini-side:88px;\n  display:grid!important;\n  grid-template-columns:repeat(auto-fill,var(--wl-mini-side))!important;\n  grid-auto-flow:row!important;\n  gap:7px!important;\n  justify-content:start!important;\n  justify-items:start!important;\n  align-content:start!important;\n  min-width:0;\n}\n.wl-card-container.wl-layout-mini-liste.wl-size-mini,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste.wl-size-mini{--wl-mini-side:88px}\n.wl-card-container.wl-layout-mini-liste.wl-size-petit,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste.wl-size-petit{--wl-mini-side:110px}\n.wl-card-container.wl-layout-mini-liste.wl-size-moyen,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste.wl-size-moyen{--wl-mini-side:132px}\n.wl-card-container.wl-layout-mini-liste.wl-size-grand,\n#wl-results.wl-columns .wl-card-container.wl-layout-mini-liste.wl-size-grand{--wl-mini-side:158px}\n.wl-card.wl-mini-liste{\n  box-sizing:border-box!important;\n  position:relative!important;\n  display:block!important;\n  width:100%!important;\n  height:auto!important;\n  min-height:0!important;\n  max-height:none!important;\n  aspect-ratio:1/1!important;\n  overflow:hidden!important;\n  border-radius:9px!important;\n  cursor:pointer;\n}\n.wl-card.wl-mini-liste .wl-poster{\n  position:absolute!important;\n  inset:0!important;\n  display:block!important;\n  width:100%!important;\n  height:100%!important;\n  min-height:0!important;\n  flex:none!important;\n  aspect-ratio:auto!important;\n}\n.wl-card.wl-mini-liste .wl-poster img{width:100%!important;height:100%!important;object-fit:cover!important}\n.wl-card.wl-mini-liste .wl-card-main{\n  position:absolute!important;\n  z-index:2!important;\n  left:0!important;right:0!important;bottom:0!important;\n  display:block!important;\n  padding:19px 5px 5px!important;\n  background:linear-gradient(0deg,rgba(0,0,0,.98),rgba(0,0,0,.67) 60%,transparent)!important;\n  color:#fff!important;\n  min-width:0!important;\n  pointer-events:none!important;\n}\n.wl-card.wl-mini-liste .wl-card-main h3{\n  display:-webkit-box!important;\n  -webkit-box-orient:vertical!important;\n  -webkit-line-clamp:2!important;\n  white-space:normal!important;\n  overflow:hidden!important;\n  text-overflow:ellipsis!important;\n  font-size:10px!important;\n  line-height:1.17!important;\n  font-weight:700!important;\n  color:#fff!important;\n  margin:0!important;\n}\n.wl-card.wl-mini-liste .wl-chip,.wl-card.wl-mini-liste .wl-meta,\n.wl-card.wl-mini-liste .wl-open,.wl-card.wl-mini-liste .wl-arrows{\n  display:none!important;\n}\n.wl-card.wl-mini-liste .wl-card-actions{\n  position:absolute!important;\n  z-index:4!important;\n  right:3px!important;top:3px!important;\n  display:flex!important;\n  width:auto!important;max-width:none!important;\n  padding:0!important;\n  flex:none!important;\n}\n.wl-card.wl-mini-liste .wl-drag{\n  min-width:29px!important;width:29px!important;\n  min-height:29px!important;height:29px!important;\n  font-size:17px!important;\n  padding:1px!important;\n  background:rgba(10,10,10,.86)!important;\n  border:1px solid rgba(255,255,255,.52)!important;\n  border-radius:7px!important;\n  color:white!important;\n  touch-action:none;\n}\n@media(pointer:coarse){\n  .wl-card.wl-mini-liste{\n    height:auto!important;min-height:0!important;max-height:none!important;\n  }\n  .wl-card.wl-mini-liste .wl-poster{\n    height:100%!important;width:100%!important;flex:none!important;\n  }\n  .wl-card.wl-mini-liste .wl-drag{\n    min-width:36px!important;width:36px!important;\n    min-height:36px!important;height:36px!important;\n  }\n}\n@media(max-width:390px){\n  .wl-card-container.wl-layout-mini-liste.wl-size-grand{--wl-mini-side:126px}\n}\n";document.head.append(style);
  }
})();
/* MyCinebox — onglet À voir v1.7.110. Formats + tailles indépendants par catégorie, vraies listes fines. */
(function(){
'use strict';
const KEY='mycinebox_watchlist_preferences_v1';
const TYPES=['films','series','documentaires','animation','spectacles','theatre','humour','autres'];
const TYPE_NAMES={films:'Films',series:'Séries',documentaires:'Documentaires',animation:'Animation',spectacles:'Spectacles',theatre:'Théâtre',humour:'Humour',autres:'Autres'};
const TYPE_ICONS={films:'🎬',series:'📺',documentaires:'🎥',animation:'🎨',spectacles:'🎭',theatre:'🎪',humour:'😄',autres:'🎞️'};
const DEFAULT={sort:'ajout-a-voir',direction:'desc',group:true,types:TYPES.slice(),layout:'liste',size:'moyen',compact:false,categorySorts:{},categoryViews:{}};
const LAYOUTS=[['mini-liste','▦ Mini-carrés'],['liste','☰ Liste détaillée'],['carre','▦ Carrés'],['affiche','▤ Affiches']];
const SIZES=[['mini','Mini'],['petit','Petit'],['moyen','Moyen'],['grand','Grand']];
const VALID_LAYOUTS=new Set(LAYOUTS.map(x=>x[0]));
const VALID_SIZES=new Set(SIZES.map(x=>x[0]));
const SORTS=[['ajout-a-voir','Ajout au statut À voir'],['manuel','Ordre manuel'],['date-film','Date du film / série'],['date-videotheque','Ajout à la vidéothèque'],['type','Catégorie']];
const SORT_IDS=new Set(SORTS.map(x=>x[0]));
let prefs={...DEFAULT};
let bound=false;
let pointerDrag=null; // Un seul glisser-déposer, compatible souris et tactile Android.
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const safeNum=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:0;};
const filmId=f=>String(f.id);
function getFilms(){try{return typeof films!=='undefined'&&Array.isArray(films)?films:[];}catch(_){return [];}}
function hasAvoir(f){try{return filmAStatut(f,'avoir');}catch(_){return Array.isArray(f.statuts)?f.statuts.includes('avoir'):f.statut==='avoir';}}
function remember(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
function load(){
 try{
  const p=JSON.parse(localStorage.getItem(KEY)||'{}');
  if(p&&typeof p==='object'){
   const sorts={};
   if(p.categorySorts&&typeof p.categorySorts==='object'){
    TYPES.forEach(t=>{const v=p.categorySorts[t];if(v&&SORT_IDS.has(v.sort))sorts[t]={sort:v.sort,direction:v.direction==='asc'?'asc':'desc'};});
   }
   const categoryViews={};
   if(p.categoryViews&&typeof p.categoryViews==='object'){
    TYPES.forEach(t=>{
     const v=p.categoryViews[t];
     if(v&&VALID_LAYOUTS.has(v.layout)&&VALID_SIZES.has(v.size)){
      categoryViews[t]={layout:v.layout,size:v.size,compact:!!v.compact};
     }
    });
   }
   prefs={...DEFAULT,...p,types:Array.isArray(p.types)?p.types.filter(t=>TYPES.includes(t)):TYPES.slice(),categorySorts:sorts,categoryViews};
   if(!VALID_LAYOUTS.has(prefs.layout))prefs.layout='liste';
   if(!VALID_SIZES.has(prefs.size))prefs.size='moyen';
  }
 }catch(_){prefs={...DEFAULT,categorySorts:{},categoryViews:{}};}
}
function dateStr(v){const n=safeNum(v);if(!n)return 'Non renseignée';const d=new Date(n);return Number.isNaN(d.getTime())?'Non renseignée':d.toLocaleDateString('fr-FR');}
function dateFilm(f){const text=String(f.dateSortie||'').slice(0,4);return Number(text)||0;}
function dateAvoir(f){return safeNum(f.dateAjoutAVoir);}
function order(f){return safeNum(f.ordreAVoir);}
function typeOf(f){return TYPES.includes(f.categorie)?f.categorie:'autres';}
// Chaque catégorie a son propre tri en vue séparée ; les autres restent intactes.
function sortConfig(category){
 const custom=category&&prefs.group?prefs.categorySorts?.[category]:null;
 return custom||{sort:prefs.sort,direction:prefs.direction};
}
function sortFilms(items,config){
 const arr=[...items];const collate=new Intl.Collator('fr',{numeric:true,sensitivity:'base'});
 arr.sort((a,b)=>{
  let n=0;
  if(config.sort==='manuel'){
   const aa=order(a),bb=order(b);
   n=aa&&bb?aa-bb:aa?-1:bb?1:0;
   if(!n)n=(dateAvoir(b)||safeNum(b.dateAjout))-(dateAvoir(a)||safeNum(a.dateAjout));
  }else if(config.sort==='date-film')n=dateFilm(a)-dateFilm(b);
  else if(config.sort==='date-videotheque')n=safeNum(a.dateAjout)-safeNum(b.dateAjout);
  else if(config.sort==='type')n=TYPES.indexOf(typeOf(a))-TYPES.indexOf(typeOf(b));
  else n=dateAvoir(a)-dateAvoir(b);
  if(config.sort!=='manuel'&&config.direction==='desc')n=-n;
  return n||collate.compare(String(a.titre||''),String(b.titre||''));
 });
 return arr;
}
function list(){return sortFilms(getFilms().filter(f=>f&&hasAvoir(f)),sortConfig(null));}
function categoryList(category){return sortFilms(getFilms().filter(f=>f&&hasAvoir(f)&&typeOf(f)===category),sortConfig(category));}
function categorySort(category,sort){
 if(!TYPES.includes(category)||!SORT_IDS.has(sort))return;
 if(sort==='manuel')ensureOrder(category);
 prefs.categorySorts={...prefs.categorySorts,[category]:{sort,direction:sortConfig(category).direction}};
 remember();render();
}
function categoryDirection(category){
 if(!TYPES.includes(category))return;
 const old=sortConfig(category);
 prefs.categorySorts={...prefs.categorySorts,[category]:{sort:old.sort,direction:old.direction==='desc'?'asc':'desc'}};
 remember();render();
}
function categoryDefault(category){
 if(!TYPES.includes(category))return;
 const previous={...prefs.categorySorts};delete previous[category];prefs.categorySorts=previous;
 remember();render();
}
function click(name,cb,css){const b=el('button','wl-button '+(css||''),name);b.type='button';b.addEventListener('click',cb);return b;}
function select(options,value,cb,label){const container=el('label','wl-control');container.append(el('span','wl-control-label',label));const input=el('select','wl-select');options.forEach(([v,text])=>{const opt=el('option','',text);opt.value=v;input.append(opt);});input.value=value;input.addEventListener('change',()=>cb(input.value));container.append(input);return container;}
function setPref(field,val){prefs[field]=val;remember();render();}
// Les choix d'affichage des films, séries, documentaires... sont indépendants,
// exactement comme les tris par catégorie (préférences historiques préservées).
function displayConfig(category){
 const general={layout:prefs.layout,size:prefs.size,compact:!!prefs.compact};
 if(!category||!prefs.group)return general;
 return {...general,...(prefs.categoryViews[category]||{})};
}
function categoryView(category,field,val){
 if(!TYPES.includes(category))return;
 if(field==='layout'&&!VALID_LAYOUTS.has(val))return;
 if(field==='size'&&!VALID_SIZES.has(val))return;
 if(field==='compact'&&typeof val!=='boolean')return;
 const next={...displayConfig(category),[field]:val};
 prefs.categoryViews={...prefs.categoryViews,[category]:next};
 remember();render();
}
function categoryViewDefault(category){
 if(!TYPES.includes(category))return;
 const next={...prefs.categoryViews};delete next[category];prefs.categoryViews=next;
 remember();render();
}
function allMiniLists(){
 // Mini-vignettes côte à côte, sans changer les tris des catégories.
 prefs.layout='mini-liste';prefs.size='mini';prefs.compact=true;
 prefs.categoryViews={};remember();render();
}

function setSort(val){if(val==='manuel')ensureOrder();prefs.sort=val;remember();render();}
function ensureOrder(category=null){
 const source=category?categoryList(category):list();
 let highest=0;source.forEach(f=>highest=Math.max(highest,order(f)));
 let touched=false;
 source.forEach(f=>{if(!order(f)){f.ordreAVoir=++highest;touched=true;}});
 if(touched)save();
}
function save(){if(typeof sauvegarder==='function')sauvegarder();}
function dateWhenAdded(){return Date.now();}
function installStatusHook(){if(typeof definirStatutFilm!=='function')return;
 const old=definirStatutFilm;
 if(old.__wl_hook)return;
 const wrapper=function(f,statut,actif){
  const before=f&&hasAvoir(f);
  const outcome=old.apply(this,arguments);
  const after=f&&hasAvoir(f);
  if(outcome!==null&&f&&!before&&after){f.dateAjoutAVoir=dateWhenAdded();f.ordreAVoir=0;}
  if(outcome!==null&&f&&before&&!after){delete f.dateAjoutAVoir;delete f.ordreAVoir;}
  if(outcome!==null&&before!==after&&document.getElementById('page-a-voir')?.classList.contains('active'))queueMicrotask(render);
  return outcome;
 };
 wrapper.__wl_hook=true;
 definirStatutFilm=wrapper;
}
function installQuickActionHook(){
 if(typeof actionRapide!=='function')return;
 const original=actionRapide;
 if(original.__wl_hook)return;
 const wrapper=function(action){
  let f=null,before=false;
  try{f=getFilms().find(x=>x.id===_longPressId)||null;before=!!f&&hasAvoir(f);}catch(_){}
  const result=original.apply(this,arguments);
  if(f){const after=hasAvoir(f);
   if(!before&&after){f.dateAjoutAVoir=dateWhenAdded();f.ordreAVoir=0;save();}
   if(before&&!after){delete f.dateAjoutAVoir;delete f.ordreAVoir;save();}
  }
  return result;
 };
 wrapper.__wl_hook=true;actionRapide=wrapper;
}
function installNavigationHook(){if(typeof goPage!=='function')return;
 const original=goPage;
 if(original.__wl_hook)return;
 const wrapper=function(page,...args){const result=original.call(this,page,...args);if(page==='a-voir')render();return result;};
 wrapper.__wl_hook=true;
 goPage=wrapper;
}
function setup(){if(bound||!document.querySelector('.bottom-nav'))return;bound=true;load();
 const nav=document.querySelector('.bottom-nav'), collection=document.getElementById('nav-collection');
 const btn=el('button','nav-btn','');btn.type='button';btn.id='nav-a-voir';btn.innerHTML='<span aria-hidden="true" style="font-size:21px;height:22px;line-height:22px">🔖</span><span>À voir</span>';
 btn.addEventListener('click',()=>goPage('a-voir'));collection?.insertAdjacentElement('afterend',btn);
 const page=el('div','page');page.id='page-a-voir';page.setAttribute('aria-label','Liste À voir');
 const header=el('header','wl-header');header.append(el('h2','','🔖 À voir'));
 header.append(el('p','wl-muted','Organise les films, séries et autres titres que tu souhaites regarder.'));
 page.append(header);
 const controls=el('div','wl-controls');controls.id='wl-controls';page.append(controls);
 const toolbar=el('div','wl-subtoolbar');toolbar.id='wl-subtoolbar';page.append(toolbar);
 const results=el('div','wl-results');results.id='wl-results';page.append(results);
 nav.insertAdjacentElement('beforebegin',page);
 const overlay=el('div','wl-overlay');overlay.id='wl-overlay';overlay.hidden=true;
 overlay.addEventListener('click',ev=>{if(ev.target===overlay)hideSettings();});
 const modal=el('div','wl-modal');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
 const h=el('div','wl-modal-heading');h.append(el('h3','','⚙️ Affichage À voir'));h.append(click('✕',hideSettings,'wl-close'));modal.append(h);
 const settings=el('div','wl-settings');settings.id='wl-settings';modal.append(settings);overlay.append(modal);document.body.append(overlay);
 installStatusHook();installQuickActionHook();installNavigationHook();
 // Les anciennes fiches sans date d'activation gardent une date inconnue (pas de fausse date).
 // Pour les autres chemins de création de statuts (fusion, import, modification directe),
 // l'onglet les affiche quand même grâce à filmAStatut.
 if(typeof APP_VERSION!=='undefined'){
  const version=document.getElementById('app-version-label');if(version)version.textContent='v1.7.110';
  document.title='Vidéothèque v1.7.110';
 }
 if(typeof currentPage!=='undefined'&&currentPage==='a-voir')render();
}
function field(label,control){const group=el('div','wl-settings-field');group.append(el('h4','',label),control);return group;}
function showSettings(){const modal=document.getElementById('wl-overlay');const root=document.getElementById('wl-settings');if(!modal||!root)return;root.replaceChildren();
 const layout=el('div','wl-radio-grid');LAYOUTS.forEach(([v,label])=>{
  const item=el('label','wl-radio-item');const input=el('input');input.type='radio';input.name='wl-layout';input.value=v;input.checked=prefs.layout===v;input.addEventListener('change',()=>setPref('layout',v));item.append(input,el('span','',label));layout.append(item);
 });root.append(field('Format des fiches',layout));
 const sizes=el('div','wl-radio-grid');SIZES.forEach(([v,label])=>{
  const item=el('label','wl-radio-item');const input=el('input');input.type='radio';input.name='wl-size';input.value=v;input.checked=prefs.size===v;input.addEventListener('change',()=>setPref('size',v));item.append(input,el('span','',label));sizes.append(item);
 });root.append(field('Taille des fiches',sizes));
 const compact=el('label','wl-toggle');const checkCompact=el('input');checkCompact.type='checkbox';checkCompact.checked=!!prefs.compact;checkCompact.addEventListener('change',()=>setPref('compact',checkCompact.checked));compact.append(checkCompact,el('span','','Mode compact : affiche et titre seulement'));root.append(field('Informations affichées',compact));
 const group=el('label','wl-toggle');const togg=el('input');togg.type='checkbox';togg.checked=prefs.group;togg.addEventListener('change',()=>setPref('group',togg.checked));group.append(togg,el('span','','Séparer les types (Films, Séries, Documentaires…)'));root.append(field('Organisation',group));
 const cats=el('div','wl-type-grid');TYPES.forEach(t=>{const label=el('label','wl-toggle');const input=el('input');input.type='checkbox';input.checked=prefs.types.includes(t);input.addEventListener('change',()=>{if(input.checked&&!prefs.types.includes(t))prefs.types.push(t);if(!input.checked)prefs.types=prefs.types.filter(x=>x!==t);remember();render();});label.append(input,el('span','',TYPE_ICONS[t]+' '+TYPE_NAMES[t]));cats.append(label);});root.append(field('Catégories à afficher',cats));
 const displayByType=el('div','wl-category-view-settings');
 TYPES.forEach(t=>{
  const v=displayConfig(t);
  const line=el('div','wl-view-setting-row');
  line.append(el('strong','',TYPE_ICONS[t]+' '+TYPE_NAMES[t]));
  line.append(select(LAYOUTS,v.layout,x=>categoryView(t,'layout',x),'Format'));
  line.append(select(SIZES,v.size,x=>categoryView(t,'size',x),'Taille'));
  const simple=el('label','wl-toggle');const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=v.compact;
  checkbox.addEventListener('change',()=>categoryView(t,'compact',checkbox.checked));
  simple.append(checkbox,el('span','','Masquer les infos'));line.append(simple);
  if(prefs.categoryViews[t])line.append(click('Réglages globaux',()=>{categoryViewDefault(t);showSettings();},'wl-category-reset'));
  displayByType.append(line);
 });
 root.append(field('Affichage différent pour chaque catégorie',displayByType));
 const defSort=select(SORTS,prefs.sort,setSort,'Tri global (pour les catégories non personnalisées)');root.append(field('Tri global',defSort));
 root.append(el('p','wl-muted','Chaque catégorie possède aussi son propre tri, accessible directement dans son en-tête.'));
 const actions=el('div','wl-modal-actions');actions.append(click('Réinitialiser',()=>{prefs={...DEFAULT,types:TYPES.slice(),categorySorts:{},categoryViews:{}};remember();showSettings();render();}));actions.append(click('Appliquer',hideSettings,'wl-primary'));root.append(actions);
 modal.hidden=false;
}
function hideSettings(){const e=document.getElementById('wl-overlay');if(e)e.hidden=true;}
function metadata(f){const meta=el('div','wl-meta');
 meta.append(el('span','','📅 À voir : '+dateStr(f.dateAjoutAVoir)));
 meta.append(el('span','','📁 Vidéothèque : '+dateStr(f.dateAjout)));
 if(f.dateSortie)meta.append(el('span','','🎞️ '+String(f.dateSortie).slice(0,4)));
 return meta;
}
function card(f){const cfg=displayConfig(prefs.group?typeOf(f):null);const mini=cfg.layout==='mini-liste';const row=el('article','wl-card wl-'+cfg.layout+' wl-'+cfg.size+(cfg.compact||mini?' wl-compact':''));row.dataset.fid=filmId(f);
 const poster=el('div','wl-poster');if(f.affichePath){const img=el('img');img.src=f.affichePath;img.loading='lazy';img.alt='Affiche de '+(f.titre||'');img.onerror=()=>img.remove();poster.append(img);}else poster.append(el('div','wl-no-image',TYPE_ICONS[f.categorie]||'🎬'));
 const content=el('div','wl-card-main');const type=el('span','wl-chip wl-cat-'+(f.categorie||'autre'),(TYPE_ICONS[f.categorie]||'🎬')+' '+(TYPE_NAMES[f.categorie]||'Autre'));content.append(type);
 content.append(el('h3','',f.titre||'Sans titre'));content.append(metadata(f));
 const actions=el('div','wl-card-actions');
 const open=click('Ouvrir',()=>ouvrirDetail(f.id),'wl-open');open.setAttribute('aria-label','Ouvrir la fiche '+f.titre);actions.append(open);
 const drag=el('button','wl-drag','⠿');drag.type='button';drag.title='Maintenir puis déplacer à la souris ou au doigt';
 drag.setAttribute('aria-label','Déplacer '+f.titre+' dans la liste À voir');actions.append(drag);
 drag.addEventListener('pointerdown',ev=>commencerGlisserAVoir(ev,f,row,drag));
 drag.addEventListener('click',ev=>ev.preventDefault());
 if(sortConfig(prefs.group?typeOf(f):null).sort==='manuel'&&!mini){
  const arrows=el('div','wl-arrows');arrows.append(click('↑',()=>move(f,-1)));arrows.append(click('↓',()=>move(f,1)));actions.append(arrows);
 }
 row.append(poster,content,actions);
 if(cfg.compact||mini){row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label','Ouvrir '+(f.titre||'la fiche'));row.addEventListener('click',ev=>{if(!ev.target.closest('button'))ouvrirDetail(f.id);});row.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target===row){ev.preventDefault();ouvrirDetail(f.id);}});}
 return row;
}
// Ordre tactile : Pointer Events fonctionne sur souris, stylet et Android 10.
// On n'utilise pas le drag HTML natif, qui est peu fiable dans WebView.
function commencerGlisserAVoir(ev,film,row,poignee){
 if(ev.button!==undefined&&ev.button!==0)return;
 if(pointerDrag)terminerGlisserAVoir(null,true);
 const x=ev.clientX,y=ev.clientY;
 pointerDrag={pointerId:ev.pointerId,from:filmId(film),categorie:typeOf(film),row,poignee,
   startX:x,startY:y,x,y,started:false,targetId:null,after:false,
   timer:null,scrollView:document.querySelector('#wl-results'),scrollStamp:0};
 const d=pointerDrag;
 // Un appui long sur tactile évite de confondre le défilement avec le déplacement.
 if(ev.pointerType==='mouse'||ev.pointerType==='pen'){
  d.timer=null;
 }else{
  d.timer=setTimeout(()=>{if(pointerDrag===d)activerGlisserAVoir();},250);
 }
 try{poignee.setPointerCapture(ev.pointerId);}catch(_){}
 poignee.addEventListener('pointermove',bougerGlisserAVoir);
 poignee.addEventListener('pointerup',relacherGlisserAVoir,{once:true});
 poignee.addEventListener('pointercancel',annulerGlisserAVoir,{once:true});
 poignee.addEventListener('lostpointercapture',annulerGlisserAVoir,{once:true});
}
function activerGlisserAVoir(){
 const d=pointerDrag;if(!d||d.started)return;
 if(d.timer)clearTimeout(d.timer);d.timer=null;
 d.started=true;d.row.classList.add('wl-dragging');
 document.body.classList.add('wl-reordering');
 d.poignee.setAttribute('aria-grabbed','true');
 const e=document.getElementById('wl-drag-hint');
 if(e)e.textContent='Déplace la fiche puis relâche. Ton ordre manuel sera enregistré.';
}
function bougerGlisserAVoir(ev){
 const d=pointerDrag;if(!d||ev.pointerId!==d.pointerId)return;
 d.x=ev.clientX;d.y=ev.clientY;
 const distance=Math.hypot(d.x-d.startX,d.y-d.startY);
 if(!d.started&&ev.pointerType==='mouse'&&distance>5)activerGlisserAVoir();
 // Sur écran tactile, un glissement précoce sans appui long est un défilement normal.
 if(!d.started){if(distance>15&&d.timer){clearTimeout(d.timer);d.timer=null;}return;}
 ev.preventDefault();
 document.querySelectorAll('#wl-results .wl-drop-target').forEach(x=>x.classList.remove('wl-drop-target'));
 const underneath=document.elementFromPoint(ev.clientX,ev.clientY);
 const target=underneath?.closest?.('.wl-card[data-fid]');
 d.targetId=null;
 if(target&&target!==d.row){
  const f=getFilms().find(x=>filmId(x)===target.dataset.fid);
  if(f&&(!prefs.group||typeOf(f)===d.categorie)){
   d.targetId=target.dataset.fid;
   const rect=target.getBoundingClientRect();
   const parent=target.parentElement;
   const columns=parent?getComputedStyle(parent).gridTemplateColumns.split(' ').length:1;
   const horizontal=columns>1;
   d.after=horizontal?ev.clientX>rect.left+rect.width/2:ev.clientY>rect.top+rect.height/2;
   target.classList.add('wl-drop-target');
   target.dataset.wlDropSide=d.after?'after':'before';
  }
 }
 // Défilement doux au bord de l'écran pendant le déplacement.
 const zone=55;if(ev.clientY<zone)window.scrollBy(0,-12);
 else if(ev.clientY>window.innerHeight-zone)window.scrollBy(0,12);
}
function relacherGlisserAVoir(ev){terminerGlisserAVoir(ev,false);}
function annulerGlisserAVoir(ev){if(pointerDrag&&(!ev||ev.pointerId===pointerDrag.pointerId))terminerGlisserAVoir(null,true);}
function terminerGlisserAVoir(ev,cancelled){
 const d=pointerDrag;if(!d)return;
 pointerDrag=null;
 if(d.timer)clearTimeout(d.timer);
 d.poignee.removeEventListener('pointermove',bougerGlisserAVoir);
 d.poignee.removeEventListener('pointercancel',annulerGlisserAVoir);
 d.poignee.removeEventListener('lostpointercapture',annulerGlisserAVoir);
 try{d.poignee.releasePointerCapture(d.pointerId);}catch(_){}
 d.poignee.removeAttribute('aria-grabbed');
 d.row.classList.remove('wl-dragging');
 document.body.classList.remove('wl-reordering');
 document.querySelectorAll('#wl-results .wl-drop-target').forEach(x=>{x.classList.remove('wl-drop-target');delete x.dataset.wlDropSide;});
 const e=document.getElementById('wl-drag-hint');if(e)e.textContent='Maintiens ⠿ puis déplace une fiche avec la souris ou le doigt.';
 if(cancelled||!d.started)return;
 if(d.targetId&&d.from!==d.targetId)placeRelative(d.from,d.targetId,d.after);
}
function orderedIds(category=null){
 return (category?categoryList(category):list()).map(f=>filmId(f));
}
function storeOrder(ids,category=null){
 const rank=new Map(ids.map((id,i)=>[id,i+1]));
 getFilms().filter(f=>hasAvoir(f)&&(!category||typeOf(f)===category)).forEach(f=>{
  const r=rank.get(filmId(f));if(r!==undefined)f.ordreAVoir=r;
 });
 if(category&&prefs.group){
  const old=sortConfig(category);
  prefs.categorySorts={...prefs.categorySorts,[category]:{sort:'manuel',direction:old.direction}};
 }else prefs.sort='manuel';
 remember();save();render();
}
function move(f,delta){
 const cat=prefs.group?typeOf(f):null;
 const ids=orderedIds(cat),from=ids.indexOf(filmId(f)),to=from+delta;
 if(from<0||to<0||to>=ids.length)return;
 [ids[from],ids[to]]=[ids[to],ids[from]];storeOrder(ids,cat);
}
function placeRelative(source,target,after=false){
 // Déplacer une série ne change pas l'ordre des films, ni leur choix de tri.
 const src=getFilms().find(f=>filmId(f)===source),dst=getFilms().find(f=>filmId(f)===target);
 if(!src||!dst)return;
 if(prefs.group&&typeOf(src)!==typeOf(dst))return;
 const cat=prefs.group?typeOf(src):null;
 const ids=orderedIds(cat),from=ids.indexOf(source),to=ids.indexOf(target);
 if(from<0||to<0||from===to)return;
 ids.splice(from,1);
 const index=ids.indexOf(target)+(after?1:0);
 ids.splice(index,0,source);storeOrder(ids,cat);
}
function placeBefore(source,target){placeRelative(source,target,false);}
function makeGroup(parent,title,items,category=null){
 if(!items.length)return;
 const section=el('section','wl-section');
 if(title){
  const heading=el('div','wl-section-heading');heading.append(el('h3','wl-section-title',title+' · '+items.length));
  if(category){
   const catbar=el('div','wl-category-controls');
   catbar.append(select(SORTS,sortConfig(category).sort,v=>categorySort(category,v),'Trier '+TYPE_NAMES[category]));
   const config=sortConfig(category);
   if(config.sort!=='manuel')catbar.append(click(config.direction==='desc'?'↓ Décroissant':'↑ Croissant',()=>categoryDirection(category),'wl-direction'));
   if(prefs.categorySorts[category])catbar.append(click('↩ Tri global',()=>categoryDefault(category),'wl-reset-category'));
   const view=displayConfig(category);
   catbar.append(select(LAYOUTS,view.layout,v=>categoryView(category,'layout',v),'Affichage '+TYPE_NAMES[category]));
   catbar.append(select(SIZES,view.size,v=>categoryView(category,'size',v),'Taille'));
   if(view.layout!=='mini-liste')catbar.append(click(view.compact?'☑ Sans détails':'▢ Sans détails',()=>categoryView(category,'compact',!view.compact),'wl-category-compact'));
   if(prefs.categoryViews[category])catbar.append(click('↩ Format global',()=>categoryViewDefault(category),'wl-category-reset'));
   heading.append(catbar);
  }
  section.append(heading);
 }
 const format=displayConfig(category);const box=el('div','wl-card-container wl-layout-'+format.layout+' wl-size-'+format.size);
 items.forEach(f=>box.append(card(f)));section.append(box);parent.append(section);
}
function render(){
 const page=document.getElementById('page-a-voir');if(!page)return;
 const total=list(),visible=total.filter(f=>prefs.types.includes(typeOf(f)));
 const controls=document.getElementById('wl-controls');controls.replaceChildren();
 if(prefs.group){
  controls.append(el('span','wl-global-hint','Chaque catégorie a son propre tri, format et taille.'));
 }else{
  controls.append(select(SORTS,prefs.sort,setSort,'Trier par'));
  if(prefs.sort!=='manuel')controls.append(click(prefs.direction==='desc'?'↓ Décroissant':'↑ Croissant',()=>setPref('direction',prefs.direction==='desc'?'asc':'desc')));
 }
 controls.append(click('▦ Tout en mini-carrés',allMiniLists,'wl-mini-list-toggle'));
 if(!prefs.group)controls.append(select(LAYOUTS,prefs.layout,v=>setPref('layout',v),'Affichage'));

 controls.append(click('⚙️ Affichage',showSettings,'wl-settings-button'));
 const toolbar=document.getElementById('wl-subtoolbar');toolbar.replaceChildren();
 toolbar.append(el('span','wl-muted',visible.length+' titre(s) à voir'+(visible.length!==total.length?' · '+(total.length-visible.length)+' masqué(s)':'')));
 const hint=el('span','wl-note','Maintiens ⠿ puis déplace une fiche avec la souris ou le doigt.');hint.id='wl-drag-hint';toolbar.append(hint);
 if(!prefs.group&&prefs.sort==='manuel')toolbar.append(el('span','wl-note','✓ Ordre manuel mémorisé'));
 const root=document.getElementById('wl-results');root.replaceChildren();
 root.classList.remove('wl-columns','wl-sections','wl-size-mini','wl-size-petit','wl-size-moyen','wl-size-grand');
 root.classList.add('wl-size-'+prefs.size);root.style.removeProperty('--wl-group-count');
 if(!visible.length){root.append(el('p','wl-empty',total.length?'Aucun titre dans les catégories affichées.':'Aucun titre « À voir ». Ajoute ce statut depuis une fiche.'));return;}
 if(prefs.group){
  const groupes=TYPES.filter(t=>prefs.types.includes(t))
   .map(t=>({t,items:categoryList(t)})).filter(g=>g.items.length);
  root.classList.add('wl-columns');root.style.setProperty('--wl-group-count',String(groupes.length));
  groupes.forEach(g=>makeGroup(root,(TYPE_ICONS[g.t]||'')+' '+TYPE_NAMES[g.t],g.items,g.t));
 }else makeGroup(root,'',visible);
}
function init(){setup();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.MycineboxWatchlist={render,showSettings};
})();
