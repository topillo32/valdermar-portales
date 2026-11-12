// ---------- Panel de equipo ----------
const BAG_MAX=16;
let eqSel=null; // {from:'bag'|'eq', id}
function itemScore(it){if(!it)return 0;let s=0;if(it.min)s+=(it.min+it.max)/2*(it.spd||1)*3;if(it.def)s+=it.def*2;for(const a of it.aff)s+=a.k==='vida'?a.v*.5:a.k==='robo'?a.v*6:a.v*2;return s}
function isUpgrade(it){return canUse(it,P.cls)&&itemScore(it)>itemScore(P.eq[it.slot])*1.05}
function toggleEquip(){
  if(state==='play'){state='inv';for(const k in keys)keys[k]=false;stick.id=null;$('stick').hidden=true;$('equip').hidden=false;eqSel=null;eqTab(P.pts?'char':'bag');renderEquip();$('btnEquip').setAttribute('aria-pressed','true');setTimeout(()=>$('eqClose').focus(),30)}
  else if(state==='inv'){state='play';$('equip').hidden=true;$('btnEquip').setAttribute('aria-pressed','false');updHud();cv.focus()}
}
function itemCell(it,from,extra){
  const b=document.createElement('button');b.type='button';
  if(!it){b.className='it empty';b.disabled=true;if(extra){const s=document.createElement('small');s.textContent=extra;b.appendChild(s)}return b}
  b.className='it r'+it.rar+(canUse(it,P.cls)?'':' no')+(eqSel&&eqSel.id===it.id?' sel':'');
  b.title=it.name;b.setAttribute('aria-label',it.name+' · '+RARITY[it.rar]);
  const c=document.createElement('canvas'),r=Math.max(1,window.devicePixelRatio||1);c.width=c.height=40*r;const x=c.getContext('2d');x.scale(r,r);drawItemIcon(x,it,40);b.appendChild(c);
  if(extra){const s=document.createElement('small');s.textContent=extra;b.appendChild(s)}
  b.addEventListener('click',()=>{eqSel={from,id:it.id};renderEquip()});
  return b;
}
function statLines(it){
  const out=[];
  if(it.min)out.push(['Daño',it.min+'–'+it.max,(it.min+it.max)/2*(it.spd||1)]);
  if(it.spd&&it.spd!==1)out.push(['Velocidad del arma',(it.spd>1?'+':'')+Math.round((it.spd-1)*100)+' %',null]);
  if(it.def)out.push(['Defensa',it.def,it.def]);
  return out;
}
function renderEquip(){
  const S=computeStats(),C=CLS();
  $('eqHead').textContent=C.name+' · '+C.title+' · Nivel '+P.lvl;
  // atributos
  const at=$('attrs');at.innerHTML='';
  const ph=document.createElement('div');ph.style.gridColumn='1/-1';ph.innerHTML=P.pts?'<span class="pts"></span>':'<span style="color:var(--muted)">Ganas 3 puntos cada vez que subes de nivel.</span>';
  if(P.pts)ph.firstChild.textContent='Puntos por repartir: '+P.pts;at.appendChild(ph);
  for(const[k,label]of ATTRS){
    const n=document.createElement('span');n.textContent=label+(PRIMARY[P.cls]===k?' ★':'');
    const v=document.createElement('b');v.textContent=S.A[k];
    const btn=document.createElement('button');btn.type='button';btn.textContent='+';btn.disabled=!P.pts;btn.setAttribute('aria-label','Subir '+label);
    btn.addEventListener('click',()=>{if(!P.pts)return;P.pts--;P.alloc[k]++;computeStats();sfx('level');renderEquip()});
    const h=document.createElement('small');h.textContent=ATTR_HELP[k];
    at.append(n,v,btn,h)}
  // derivados
  const dv=$('derived');dv.innerHTML='';
  for(const[l,v]of[['Vida',Math.ceil(P.hp)+' / '+P.maxhp],['Daño',S.min+'–'+S.max],['Crítico',Math.round(S.crit*100)+' %'],['Vel. de ataque',Math.round(S.aspd*100)+' %'],
    ['Defensa',S.def+' (−'+Math.round(S.red*100)+' % daño)'],['Robo de vida',Math.round(S.steal*100)+' %'],['Movimiento',Math.round(S.mov*100)+' %'],['Oro',P.gold]]){
    const a=document.createElement('span');a.textContent=l;const b=document.createElement('b');b.textContent=v;dv.append(a,b)}
  // ranuras
  const sl=$('slots');sl.innerHTML='';
  for(const[k,label]of SLOTS)sl.appendChild(itemCell(P.eq[k],'eq',label));
  // mochila
  $('bagHead').textContent='Mochila · '+P.bag.length+' / '+BAG_MAX;
  const bag=$('bag');bag.innerHTML='';
  for(let i=0;i<BAG_MAX;i++){const it=P.bag[i];bag.appendChild(itemCell(it,'bag',it&&isUpgrade(it)?'▲':''))}
  // detalle
  $('eqTabChar').textContent=P.pts?'Personaje ●':'Personaje';
  const det=$('detail');det.innerHTML='';
  const it=eqSel&&(eqSel.from==='bag'?P.bag.find(x=>x.id===eqSel.id):Object.values(P.eq).find(x=>x&&x.id===eqSel.id));
  det.classList.toggle('open',!!it);
  if(!it){const p=document.createElement('p');p.className='meta';p.textContent='Los objetos caen de los enemigos y de los cofres. Cuanto más bajas, mayor es su nivel. Los marcados con ▲ son mejores que lo que llevas.';det.appendChild(p);return}
  const x=document.createElement('button');x.type='button';x.className='det-x';x.textContent='✕';x.setAttribute('aria-label','Cerrar detalle');
  x.addEventListener('click',()=>{eqSel=null;renderEquip()});det.appendChild(x);
  const h=document.createElement('h4');h.className='c'+it.rar;h.textContent=it.name;
  const m=document.createElement('div');m.className='meta';m.textContent=RARITY[it.rar]+' · '+ITYPES[it.type].label+(it.rar===3?' ('+it.base+')':'')+' · Nivel de objeto '+it.ilvl;
  det.append(h,m);
  const cur=eqSel.from==='bag'?P.eq[it.slot]:null;
  const curL=cur?Object.fromEntries(statLines(cur).map(l=>[l[0],l[2]])):{};
  for(const[l,v,score]of statLines(it)){const d=document.createElement('div');d.textContent=l+': '+v;
    if(cur&&score!=null&&curL[l]!=null&&Math.abs(score-curL[l])>.01){const s=document.createElement('span');const up=score>curL[l];s.className=up?'up':'down';s.textContent=up?'  ▲':'  ▼';d.appendChild(s)}
    det.appendChild(d)}
  if(it.aff.length){const ul=document.createElement('ul');for(const a of it.aff){const li=document.createElement('li');li.textContent=AFFIXES.find(x=>x.k===a.k).txt(a.v);ul.appendChild(li)}det.appendChild(ul)}
  if(!canUse(it,P.cls)){const w=document.createElement('div');w.className='warn';w.textContent='Solo puede usarlo: '+CLASSES[ITYPES[it.type].cls].title+'. Puedes venderlo.';det.appendChild(w)}
  if(cur){const c=document.createElement('div');c.className='meta';c.textContent='Llevas puesto: '+cur.name+(itemScore(it)>itemScore(cur)?' — este parece mejor.':' — el tuyo parece mejor.');det.appendChild(c)}
  const acts=document.createElement('div');acts.className='acts';
  if(eqSel.from==='bag'){
    const eb=document.createElement('button');eb.type='button';eb.className='pri';eb.textContent='Equipar';eb.disabled=!canUse(it,P.cls);
    eb.addEventListener('click',()=>{const i=P.bag.indexOf(it),old=P.eq[it.slot];P.eq[it.slot]=it;P.bag.splice(i,1);if(old)P.bag.splice(i,0,old);sfx('chest');eqSel={from:'eq',id:it.id};renderEquip()});
    const sb=document.createElement('button');sb.type='button';sb.textContent='Vender ('+it.value+' oro)';
    sb.addEventListener('click',()=>{P.bag.splice(P.bag.indexOf(it),1);P.gold+=it.value;sfx('coin');eqSel=null;renderEquip()});
    acts.append(eb,sb)}
  else{
    const ub=document.createElement('button');ub.type='button';ub.textContent='Quitar';ub.disabled=it.slot==='arma'||P.bag.length>=BAG_MAX;
    ub.addEventListener('click',()=>{P.eq[it.slot]=null;P.bag.push(it);eqSel={from:'bag',id:it.id};renderEquip()});
    acts.append(ub);
    if(it.slot==='arma'){const n=document.createElement('span');n.className='meta';n.style.alignSelf='center';n.textContent='El arma se cambia equipando otra.';acts.append(n)}}
  det.appendChild(acts);
}
$('btnEquip').addEventListener('click',()=>{if(state==='play'||state==='inv')toggleEquip()});
$('eqClose').addEventListener('click',toggleEquip);
$('eqX').addEventListener('click',toggleEquip);
// Pestañas del equipo (solo se ven en pantallas pequeñas)
function eqTab(t){$('equip').dataset.tab=t;$('eqTabBag').setAttribute('aria-selected',t==='bag');$('eqTabChar').setAttribute('aria-selected',t==='char');$('equip').scrollTop=0}
$('eqTabBag').addEventListener('click',()=>eqTab('bag'));
$('eqTabChar').addEventListener('click',()=>eqTab('char'));
