/* MyCinebox — onglet À voir v1.7.104. Sans dépendance externe. */
(function(){
'use strict';
const KEY='mycinebox_watchlist_preferences_v1';
const TYPES=['films','series','documentaires','animation','spectacles','theatre','humour'];
const TYPE_NAMES={films:'Films',series:'Séries',documentaires:'Documentaires',animation:'Animation',spectacles:'Spectacles',theatre:'Théâtre',humour:'Humour'};
const TYPE_ICONS={films:'🎬',series:'📺',documentaires:'🎥',animation:'🎨',spectacles:'🎭',theatre:'🎪',humour:'😄'};
const DEFAULT={sort:'ajout-a-voir',direction:'desc',group:true,types:TYPES.slice(),layout:'liste',size:'moyen'};
let prefs={...DEFAULT};
let draggedId=null, bound=false;
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const safeNum=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:0;};
const filmId=f=>String(f.id);
function getFilms(){try{return typeof films!=='undefined'&&Array.isArray(films)?films:[];}catch(_){return [];}}
function hasAvoir(f){try{return filmAStatut(f,'avoir');}catch(_){return Array.isArray(f.statuts)?f.statuts.includes('avoir'):f.statut==='avoir';}}
function remember(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
function load(){try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');if(p&&typeof p==='object')prefs={...DEFAULT,...p,types:Array.isArray(p.types)?p.types.filter(t=>TYPES.includes(t)):TYPES.slice()};}catch(_){prefs={...DEFAULT};}}
function dateStr(v){const n=safeNum(v);if(!n)return 'Non renseignée';const d=new Date(n);return Number.isNaN(d.getTime())?'Non renseignée':d.toLocaleDateString('fr-FR');}
function dateFilm(f){const text=String(f.dateSortie||'').slice(0,4);return Number(text)||0;}
function dateAvoir(f){return safeNum(f.dateAjoutAVoir);}
function order(f){return safeNum(f.ordreAVoir);}
function list(){const arr=getFilms().filter(f=>f&&hasAvoir(f));const collate=new Intl.Collator('fr',{numeric:true,sensitivity:'base'});
 arr.sort((a,b)=>{
  let n=0;
  if(prefs.sort==='manuel'){
   const aa=order(a),bb=order(b);n=aa&&bb?aa-bb:aa?-1:bb?1:0;
   if(!n)n=(dateAvoir(b)||safeNum(b.dateAjout))-(dateAvoir(a)||safeNum(a.dateAjout));
  }else if(prefs.sort==='date-film')n=dateFilm(a)-dateFilm(b);
  else if(prefs.sort==='date-videotheque')n=safeNum(a.dateAjout)-safeNum(b.dateAjout);
  else if(prefs.sort==='type')n=TYPES.indexOf(a.categorie)-TYPES.indexOf(b.categorie);
  else n=dateAvoir(a)-dateAvoir(b);
  if(prefs.sort!=='manuel'&&prefs.direction==='desc')n=-n;
  return n||collate.compare(String(a.titre||''),String(b.titre||''));
 });return arr;}
function click(name,cb,css){const b=el('button','wl-button '+(css||''),name);b.type='button';b.addEventListener('click',cb);return b;}
function select(options,value,cb,label){const container=el('label','wl-control');container.append(el('span','wl-control-label',label));const input=el('select','wl-select');options.forEach(([v,text])=>{const opt=el('option','',text);opt.value=v;input.append(opt);});input.value=value;input.addEventListener('change',()=>cb(input.value));container.append(input);return container;}
function setPref(field,val){prefs[field]=val;remember();render();}
function setSort(val){prefs.sort=val; if(val==='manuel')ensureOrder();remember();render();}
function ensureOrder(){let highest=0;getFilms().forEach(f=>{if(hasAvoir(f))highest=Math.max(highest,order(f));});let touched=false;list().forEach(f=>{if(!order(f)){highest++;f.ordreAVoir=highest;touched=true;}});if(touched)save();}
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
  const version=document.getElementById('app-version-label');if(version)version.textContent='v1.7.104';
  document.title='Vidéothèque v1.7.104';
 }
 if(typeof currentPage!=='undefined'&&currentPage==='a-voir')render();
}
function field(label,control){const group=el('div','wl-settings-field');group.append(el('h4','',label),control);return group;}
function showSettings(){const modal=document.getElementById('wl-overlay');const root=document.getElementById('wl-settings');if(!modal||!root)return;root.replaceChildren();
 const layout=el('div','wl-radio-grid');[['liste','☰ Liste horizontale'],['carre','▦ Cartes carrées'],['affiche','▤ Affiches verticales']].forEach(([v,label])=>{
  const item=el('label','wl-radio-item');const input=el('input');input.type='radio';input.name='wl-layout';input.value=v;input.checked=prefs.layout===v;input.addEventListener('change',()=>setPref('layout',v));item.append(input,el('span','',label));layout.append(item);
 });root.append(field('Format des fiches',layout));
 const sizes=el('div','wl-radio-grid');[['petit','Petit'],['moyen','Moyen'],['grand','Grand']].forEach(([v,label])=>{
  const item=el('label','wl-radio-item');const input=el('input');input.type='radio';input.name='wl-size';input.value=v;input.checked=prefs.size===v;input.addEventListener('change',()=>setPref('size',v));item.append(input,el('span','',label));sizes.append(item);
 });root.append(field('Taille des fiches',sizes));
 const group=el('label','wl-toggle');const togg=el('input');togg.type='checkbox';togg.checked=prefs.group;togg.addEventListener('change',()=>setPref('group',togg.checked));group.append(togg,el('span','','Séparer les types (Films, Séries, Documentaires…)'));root.append(field('Organisation',group));
 const cats=el('div','wl-type-grid');TYPES.forEach(t=>{const label=el('label','wl-toggle');const input=el('input');input.type='checkbox';input.checked=prefs.types.includes(t);input.addEventListener('change',()=>{if(input.checked&&!prefs.types.includes(t))prefs.types.push(t);if(!input.checked)prefs.types=prefs.types.filter(x=>x!==t);remember();render();});label.append(input,el('span','',TYPE_ICONS[t]+' '+TYPE_NAMES[t]));cats.append(label);});root.append(field('Catégories à afficher',cats));
 const defSort=select([['ajout-a-voir','Ajout à À voir (récent d’abord)'],['manuel','Ordre manuel'],['date-film','Date du film / série'],['date-videotheque','Ajout à la vidéothèque'],['type','Catégorie']],prefs.sort,setSort,'Tri par défaut');root.append(field('Tri',defSort));
 const actions=el('div','wl-modal-actions');actions.append(click('Réinitialiser',()=>{prefs={...DEFAULT,types:TYPES.slice()};remember();showSettings();render();}));actions.append(click('Appliquer',hideSettings,'wl-primary'));root.append(actions);
 modal.hidden=false;
}
function hideSettings(){const e=document.getElementById('wl-overlay');if(e)e.hidden=true;}
function metadata(f){const meta=el('div','wl-meta');
 meta.append(el('span','','📅 À voir : '+dateStr(f.dateAjoutAVoir)));
 meta.append(el('span','','📁 Vidéothèque : '+dateStr(f.dateAjout)));
 if(f.dateSortie)meta.append(el('span','','🎞️ '+String(f.dateSortie).slice(0,4)));
 return meta;
}
function card(f){const row=el('article','wl-card wl-'+prefs.layout+' wl-'+prefs.size);row.dataset.fid=filmId(f);
 const poster=el('div','wl-poster');if(f.affichePath){const img=el('img');img.src=f.affichePath;img.loading='lazy';img.alt='Affiche de '+(f.titre||'');img.onerror=()=>img.remove();poster.append(img);}else poster.append(el('div','wl-no-image',TYPE_ICONS[f.categorie]||'🎬'));
 const content=el('div','wl-card-main');const type=el('span','wl-chip wl-cat-'+(f.categorie||'autre'),(TYPE_ICONS[f.categorie]||'🎬')+' '+(TYPE_NAMES[f.categorie]||'Autre'));content.append(type);
 content.append(el('h3','',f.titre||'Sans titre'));content.append(metadata(f));
 const actions=el('div','wl-card-actions');
 const open=click('Ouvrir',()=>ouvrirDetail(f.id),'wl-open');open.setAttribute('aria-label','Ouvrir la fiche '+f.titre);actions.append(open);
 if(prefs.sort==='manuel'){
  const drag=el('button','wl-drag','⠿');drag.type='button';drag.draggable=true;drag.title='Maintenir puis glisser pour déplacer';drag.setAttribute('aria-label','Déplacer '+f.titre);actions.append(drag);
  drag.addEventListener('dragstart',ev=>{draggedId=filmId(f);row.classList.add('wl-dragging');ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',draggedId);});
  drag.addEventListener('dragend',()=>{draggedId=null;row.classList.remove('wl-dragging');});
  const arrows=el('div','wl-arrows');arrows.append(click('↑',()=>move(f,-1)));arrows.append(click('↓',()=>move(f,1)));actions.append(arrows);
 }
 row.append(poster,content,actions);
 if(prefs.sort==='manuel'){
  row.addEventListener('dragover',ev=>{if(draggedId){ev.preventDefault();row.classList.add('wl-drop-target');}});
  row.addEventListener('dragleave',()=>row.classList.remove('wl-drop-target'));
  row.addEventListener('drop',ev=>{ev.preventDefault();row.classList.remove('wl-drop-target');if(draggedId)placeBefore(draggedId,filmId(f));});
 }
 return row;
}
function orderedIds(){return list().map(f=>filmId(f));}
function storeOrder(ids){const rank=new Map(ids.map((id,i)=>[id,i+1]));getFilms().filter(hasAvoir).forEach(f=>{const r=rank.get(filmId(f));if(r!==undefined)f.ordreAVoir=r;});prefs.sort='manuel';remember();save();render();}
function move(f,delta){const ids=orderedIds();const from=ids.indexOf(filmId(f)),to=from+delta;if(from<0||to<0||to>=ids.length)return;[ids[from],ids[to]]=[ids[to],ids[from]];storeOrder(ids);}
function placeBefore(source,target){const ids=orderedIds();const from=ids.indexOf(source),to=ids.indexOf(target);if(from<0||to<0||from===to)return;ids.splice(from,1);ids.splice(ids.indexOf(target),0,source);storeOrder(ids);}
function makeGroup(parent,title,items){if(!items.length)return;
 const section=el('section','wl-section');if(title)section.append(el('h3','wl-section-title',title+' · '+items.length));
 const box=el('div','wl-card-container wl-layout-'+prefs.layout+' wl-size-'+prefs.size);
 items.forEach(f=>box.append(card(f)));section.append(box);parent.append(section);
}
function render(){const page=document.getElementById('page-a-voir');if(!page)return;
 const total=list(),visible=total.filter(f=>prefs.types.includes(f.categorie));
 const controls=document.getElementById('wl-controls');controls.replaceChildren();
 controls.append(select([['ajout-a-voir','Date d’ajout à À voir'],['manuel','Ordre manuel'],['date-film','Date du film / série'],['date-videotheque','Ajout à la vidéothèque'],['type','Catégorie']],prefs.sort,setSort,'Trier par'));
 if(prefs.sort!=='manuel')controls.append(click(prefs.direction==='desc'?'↓ Décroissant':'↑ Croissant',()=>setPref('direction',prefs.direction==='desc'?'asc':'desc')));
 controls.append(click('⚙️ Affichage',showSettings,'wl-settings-button'));
 const toolbar=document.getElementById('wl-subtoolbar');toolbar.replaceChildren();toolbar.append(el('span','wl-muted',visible.length+' titre(s) à voir'+(visible.length!==total.length?' · '+(total.length-visible.length)+' masqué(s)':'')));
 if(prefs.sort==='manuel')toolbar.append(el('span','wl-note','↕ Glisse les poignées ou utilise ↑ ↓ pour ordonner'));
 const root=document.getElementById('wl-results');root.replaceChildren();if(!visible.length){root.append(el('p','wl-empty',total.length?'Aucun titre dans les catégories affichées.':'Aucun titre « À voir ». Ajoute ce statut depuis une fiche.'));return;}
 if(prefs.group){const known=TYPES.filter(t=>prefs.types.includes(t));known.forEach(t=>makeGroup(root,(TYPE_ICONS[t]||'')+' '+TYPE_NAMES[t],visible.filter(f=>f.categorie===t)));const others=visible.filter(f=>!TYPES.includes(f.categorie));makeGroup(root,'Autres',others);}
 else makeGroup(root,'',visible);
}
function init(){setup();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.MycineboxWatchlist={render,showSettings};
})();
