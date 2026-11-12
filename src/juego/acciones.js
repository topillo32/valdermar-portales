// ---------- Acciones ----------
function rollDmg(){const C=CLS();let dmg=RI(P.atkMin,P.atkMax),crit=R()<P.stats.crit;if(crit)dmg=Math.round(dmg*C.critM);return[dmg,crit]}
function breakBarrel(x,y){const i=idx(x,y);if(G.obj[i]!==10)return;
  G.obj[i]=0;G.col[i]=0;burst(x+.5,y+.5,'#7a5230',14,2.5);sfx('hit');
  if(R()<.45)G.items.push({x:x+.5,y:y+.5,type:'gold',n:RI(3,8)*depth,bob:R()*6});else if(R()<.15)G.items.push({x:x+.5,y:y+.5,type:'potion',bob:R()*6})}
function playerAttack(aim){
  if(state!=='play'||P.cd>0)return;
  const C=CLS();
  if(aim!==undefined)P.face=aim;
  P.cd=C.cd/P.stats.aspd;P.swing=P.swingT=Math.min(C.swing,P.cd*.9);
  if(C.proj){const a=P.face,fire=C.weapon==='staff';sfx(fire?'fire':'bow');
    G.pproj.push({x:P.x+Math.cos(a)*.35,y:P.y+Math.sin(a)*.35,vx:Math.cos(a)*C.proj.speed,vy:Math.sin(a)*C.proj.speed,life:C.proj.life,kind:fire?'fire':'arrow',pierce:C.proj.pierce||0,hit:[]});
    return}
  sfx('swing');
  for(const e of G.enemies.slice()){const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);
    if(d<C.reach+e.r&&(Math.abs(angDiff(Math.atan2(dy,dx),P.face))<C.arc||d<.5)){
      const[dmg,crit]=rollDmg();hurtEnemy(e,dmg,dx/(d||1),dy/(d||1),crit,C.stun)}}
  const px=Math.floor(P.x),py=Math.floor(P.y);
  for(let y=py-2;y<=py+2;y++)for(let x=px-2;x<=px+2;x++){if(x<0||y<0||x>=MW||y>=MH)continue;
    const dx=x+.5-P.x,dy=y+.5-P.y,d=Math.hypot(dx,dy);if(d<C.reach+.15&&Math.abs(angDiff(Math.atan2(dy,dx),P.face))<C.arc+.05)breakBarrel(x,y)}
}
function explode(p){
  const C=CLASSES.maga,rad=C.proj.aoe;sfx('boom');shake=Math.max(shake,4);burst(p.x,p.y,'#ff9a3c',22,3.2);burst(p.x,p.y,'#ffe08a',10,2);
  for(const e of G.enemies.slice()){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d<rad+e.r){const[dmg,crit]=rollDmg();hurtEnemy(e,dmg,dx/(d||1),dy/(d||1),crit)}}
  for(let y=Math.floor(p.y-rad);y<=Math.floor(p.y+rad);y++)for(let x=Math.floor(p.x-rad);x<=Math.floor(p.x+rad);x++){if(x<0||y<0||x>=MW||y>=MH)continue;if(Math.hypot(x+.5-p.x,y+.5-p.y)<rad)breakBarrel(x,y)}
}
function updatePlayerProj(dt){
  for(const p of G.pproj.slice()){
    let dead=false;const sp=Math.hypot(p.vx,p.vy)||1;
    for(let s=0;s<3&&!dead;s++){p.x+=p.vx*dt/3;p.y+=p.vy*dt/3;
      if(solid(p.x,p.y)){const tx=Math.floor(p.x),ty=Math.floor(p.y);
        if(p.kind==='fire'){p.x-=p.vx*dt/3;p.y-=p.vy*dt/3;explode(p)}else{burst(p.x,p.y,'#a08060',5,1.2)}
        if(tx>=0&&ty>=0&&tx<MW&&ty<MH)breakBarrel(tx,ty);dead=true;break}
      for(const e of G.enemies.slice()){if(p.hit.includes(e))continue;
        if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+.22){
          if(p.kind==='fire'){explode(p);dead=true;break}
          const[dmg,crit]=rollDmg();hurtEnemy(e,dmg,p.vx/sp,p.vy/sp,crit);p.hit.push(e);
          if(p.pierce--<=0){dead=true;break}}}}
    p.life-=dt;
    if(!dead&&p.life<=0){if(p.kind==='fire')explode(p);dead=true}
    if(!dead&&p.kind==='fire'&&Math.random()<.7)G.parts.push({x:p.x,y:p.y,z:20,vx:(R()-.5)*.6,vy:(R()-.5)*.6,vz:15,life:.35,t:0,color:R()<.5?'#ffb050':'#ff6a20',size:2+R()*2});
    if(dead)G.pproj.splice(G.pproj.indexOf(p),1)}
}
function hurtEnemy(e,dmg,nx,ny,crit,stun){
  e.hp-=dmg;e.flash=.12;e.kx=nx*5;e.ky=ny*5;e.aggro=true;e.wind=Math.max(0,e.wind-.15);
  if(stun){e.stun=Math.max(e.stun||0,stun);e.wind=0}
  if(P.stats.steal&&P.hp<P.maxhp){P.hp=Math.min(P.maxhp,P.hp+dmg*P.stats.steal)}
  addText(e.x,e.y,(crit?'¡':'')+dmg+(crit?'!':''),crit?'#ffd36a':'#f3ead8',crit?20:15);
  burst(e.x,e.y,e.t===ETYPES.esqueleto?'#e6dcc4':'#8f1f18',8,2);sfx('hit');shake=Math.max(shake,crit?5:2);
  if(e.hp<=0){
    G.enemies.splice(G.enemies.indexOf(e),1);kills++;sfx('die');burst(e.x,e.y,e.t===ETYPES.esqueleto?'#e6dcc4':'#6e1812',18,3);
    gainXp(Math.round(e.t.xp*(1+.2*(depth-1))*P.stats.xp));
    if(R()<(e.t===ETYPES.bruto?.4:.13))dropItem(e.x-.2,e.y+.2,genItem(depth,{boost:e.t===ETYPES.bruto?.08:0}));
    if(R()<.4)G.items.push({x:e.x,y:e.y,type:'gold',n:RI(2,6)*depth+RI(0,4),bob:R()*6});
    if(R()<.13)G.items.push({x:e.x+.2,y:e.y-.2,type:'potion',bob:R()*6});
  }
}
function gainXp(n){P.xp+=n;while(P.xp>=xpNext(P.lvl)){P.xp-=xpNext(P.lvl);P.lvl++;P.pts+=3;computeStats();P.hp=P.maxhp;
  msg('Subes al nivel '+P.lvl+'. Tienes '+P.pts+' puntos de atributo: pulsa B para repartirlos.','#ffd36a');addText(P.x,P.y,'¡Nivel '+P.lvl+'!','#ffd36a',20);sfx('level');burst(P.x,P.y,'#ffd36a',24,3)}}
function hurtPlayer(dmg,src){
  if(P.inv>0||state!=='play')return;
  dmg=Math.max(1,Math.round(dmg*(1-P.stats.red)));
  P.hp-=dmg;P.inv=.45;P.hurtT=.3;shake=7;sfx('hurt');addText(P.x,P.y,'-'+dmg,'#ff6a5a',16);burst(P.x,P.y,'#8f1f18',8,2);
  if(src){const dx=P.x-src.x,dy=P.y-src.y,d=Math.hypot(dx,dy)||1;moveEnt(P,dx/d*.25,dy/d*.25)}
  if(P.hp<=0){P.hp=0;die(src)}
}
function drinkPotion(){
  if(state!=='play')return;
  if(P.pot<=0){msg('No te quedan pociones.');return}
  if(P.hp>=P.maxhp){msg('Ya tienes la vida al máximo.');return}
  P.pot--;const h=Math.round(P.maxhp*.45);P.hp=Math.min(P.maxhp,P.hp+h);addText(P.x,P.y,'+'+h,'#7fe08a',17);sfx('potion');burst(P.x,P.y,'#c43a4a',12,1.5);
}
function nearInteract(){
  let best=null,bd=1.6;const px=Math.floor(P.x),py=Math.floor(P.y);
  for(let y=py-2;y<=py+2;y++)for(let x=px-2;x<=px+2;x++){if(x<0||y<0||x>=MW||y>=MH)continue;const o=G.obj[idx(x,y)];if(o!==11&&o!==13)continue;
    const d=Math.hypot(x+.5-P.x,y+.5-P.y);if(d<bd){bd=d;best={x,y,o}}}
  return best;
}
function interact(){
  if(state!=='play')return;const n=nearInteract();if(!n)return;
  if(n.o===11){G.obj[idx(n.x,n.y)]=12;sfx('chest');const g=RI(10,25)*depth;P.gold+=g;msg('Abres el cofre: '+g+' monedas de oro.','#d8b25c');
    const r=R();
    if(r<.65)dropItem(n.x+.5+(P.x<n.x+.5?-.7:.7),n.y+.5+(P.y<n.y+.5?-.7:.7),genItem(depth+1,{boost:.12}));
    if(r>.45){P.pot=Math.min(9,P.pot+1);msg('Dentro hay una poción.','#e08080')}
    burst(n.x+.5,n.y+.5,'#ffd36a',14,2)}
  else if(n.o===13)descend();
}
function descend(){
  depth++;seed=(Math.random()*1e9)|0;sfx('stairs');
  G=genLevel(depth,seed);placePlayer();P.hp=Math.min(P.maxhp,P.hp+Math.round(P.maxhp*.25));
  msg('Desciendes a la profundidad '+depth+': '+G.theme.name+'.','#e58a3c');refreshInspector();updHud();
  saveGame().then(w=>msg('Partida guardada '+(w==='nube'?'en la nube':'en este navegador')+'.','#a39aa9')).catch(e=>msg('No se pudo guardar: '+e.message,'#ff9a8a'));
}
function placePlayer(){P.x=G.start.cx+.5;P.y=G.start.cy+.5;cam.x=isoX(P.x,P.y);cam.y=isoY(P.x,P.y)}
function die(src){
  state='dead';P.deadAt=time;
  const who={'Rata de cripta':'una rata de cripta','Esqueleto':'un esqueleto','Cultista':'un cultista','Bruto de las fosas':'un bruto de las fosas'}[src&&src.t&&src.t.name];
  $('deadSub').textContent=(who?'Te ha derrotado '+who:'La oscuridad te ha alcanzado')+' en la profundidad '+depth+'.';
  $('deadStats').innerHTML='';
  for(const[l,v]of[['Clase',CLS().title],['Profundidad',depth],['Nivel',P.lvl],['Enemigos',kills],['Oro',P.gold]]){const d=document.createElement('div');d.innerHTML='<b></b><span></span>';d.querySelector('b').textContent=v;d.querySelector('span').textContent=l;$('deadStats').appendChild(d)}
  $('dead').hidden=false;setTimeout(()=>$('againBtn').focus(),50);
  // la muerte termina la expedición: se borra la partida guardada y se apunta el récord
  const note=$('deadNote');note.className='note';note.textContent='';
  Store.clear().catch(()=>{});
  Store.addScore({cls:P.cls,depth,lvl:P.lvl,kills,gold:P.gold}).then(where=>{
    note.textContent=where==='nube'?'Tu expedición quedó registrada en los récords.':'Récord guardado en este navegador. Inicia sesión para aparecer en la tabla de todos.'})
    .catch(e=>{note.className='note err';note.textContent='No se pudo guardar el récord: '+e.message});
}
function dropItem(x,y,it){if(solid(x,y)){x=P.x;y=P.y}G.items.push({x,y,type:'gear',item:it,bob:R()*6});
  if(it.rar>=2){addText(x,y,RARITY[it.rar]+'!',RCOL[it.rar],16)}}
function newGame(){depth=1;kills=0;seed=(Math.random()*1e9)|0;P=newPlayer(selCls);computeStats();G=genLevel(depth,seed);placePlayer();refreshInspector();updHud();
  msg('Entras en la '+G.theme.name+'. Busca las escaleras para bajar.','#e58a3c')}
