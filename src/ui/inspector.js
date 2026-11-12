function toggleMap(){const b=$('btnMap'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);mini.classList.toggle('big',on)}
function toggleInsp(){const b=$('btnInsp'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);$('insp').hidden=!on;if(on)refreshInspector()}
$('btnMap').addEventListener('click',toggleMap);$('btnInsp').addEventListener('click',toggleInsp);
$('btnMute').addEventListener('click',()=>{muted=!muted;$('btnMute').setAttribute('aria-pressed',muted);$('btnMute').textContent=muted?'Sonido':'Silenciar'});
for(const[id,k,rebuild]of[['lyFloor','floor',1],['lyObj','obj',0],['lyDecor','decor',1],['lyCol','col',0],['lyGrid','grid',0],['lyLight','light',0]])
  $(id).addEventListener('change',e=>{show[k]=e.target.checked;if(rebuild&&G)buildCache(G)});

function refreshInspector(){
  if(!G||$('insp').hidden)return;
  const tl=$('tileList');tl.innerHTML='';
  const add=(cvs,label)=>{const f=document.createElement('figure');f.appendChild(cvs);const cap=document.createElement('figcaption');cap.textContent=label;f.appendChild(cap);tl.appendChild(f)};
  const mk=(fn)=>{const c=document.createElement('canvas');c.width=TW;c.height=TH+WH-24;const x=c.getContext('2d');fn(x);return c};
  G.tiles.floor.forEach((t,i)=>add(mk(x=>x.drawImage(t,0,(TH+WH-24-TH)/2)),'S'+i+' · '+FLOOR_NAMES[i]));
  [1,2,3,4].forEach(v=>add(mk(x=>{x.drawImage(G.tiles.wall[v],8,0,48,57)}),'O'+v+' · '+OBJ_NAMES[v].replace(' (cara izq.)',' izq.').replace(' (cara der.)',' der.')));
  add(mk(x=>drawBarrel(x,32,42)),'O10 · Barril');add(mk(x=>drawChest(x,32,40,false)),'O11 · Cofre');add(mk(x=>drawStairs(x,32,24,0)),'O13 · Escaleras');
  add(mk(x=>drawDecor(x,1,32,30)),'D1 · Huesos');add(mk(x=>drawDecor(x,2,32,30)),'D2 · Charco');
  const pl=$('palList');pl.innerHTML='';const th=G.theme;
  for(const c of[...th.floor,th.mortar,th.top,th.left,th.right,th.brick,th.moss]){const s=document.createElement('span');s.style.background=c;s.title=c;pl.appendChild(s)}
}
let inspT=0;
function updInspectorCell(){
  if($('insp').hidden)return;
  let x,y,src;
  if(mouse.in&&!document.body.classList.contains('touch')){const w=screenToWorld(mouse.x,mouse.y);x=Math.floor(w.x);y=Math.floor(w.y);src='Casilla bajo el cursor'}
  else{x=Math.floor(P.x);y=Math.floor(P.y);src='Casilla del personaje'}
  $('cellTitle').textContent=src;
  const ok=x>=0&&y>=0&&x<MW&&y<MH, i=ok?idx(x,y):0, f=ok?G.floor[i]:255, o=ok?G.obj[i]:0, d=ok?G.decor[i]:0;
  const rows=[['Posición',ok?`x ${x} · y ${y}`:'fuera del mapa'],['Capa 0',f===255?'vacío (255)':`S${f} · ${FLOOR_NAMES[f]}`],['Capa 1',o?`O${o} · ${OBJ_NAMES[o]}`:'0'],['Capa 2',d?`D${d} · ${DECOR_NAMES[d]}`:'0'],['Colisión',ok&&G.col[i]?'sólida':'libre'],['Byte en memoria',ok?`índice ${i} (y × ${MW} + x)`:'—']];
  const dl=$('cellInfo');dl.innerHTML='';for(const[k,v]of rows){const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)}
}
