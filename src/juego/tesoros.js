// ---------- Tesoros: llaves, salas secretas, mercader y cerradura ----------
// Nuevos valores de la capa 1:
//   5  · muro con grieta oculta: parece un muro agrietado normal, pero tras él hay una sala secreta.
//   14 · mercader: vende pociones, llaves, mejoras de equipo y fardos de botín.
//   16 · cofre sellado: está dentro de la sala secreta; se abre con el minijuego de la cerradura.
const O_SECRET=5, O_MERCHANT=14, O_SEALED=16;
const INTERACT_OBJ=[O_SECRET,11,13,O_MERCHANT,O_SEALED];

// Se llama al final de genLevel (con el generador con semilla), así un nivel guardado se regenera igual.
function addExtras(L){
  const d=L.d,start=L.start,rooms=L.rooms.filter(r=>r!==start);
  if(!rooms.length)return;
  if(R()<.6)trySecret(L,rooms);
  // si hay sala secreta, a menudo hay una llave tirada en alguna sala
  if(L.secret&&R()<.7){
    for(let k=0;k<40;k++){const rm=rooms[RI(0,rooms.length-1)],x=RI(rm.x,rm.x+rm.w-1),y=RI(rm.y,rm.y+rm.h-1),i=idx(x,y);
      if(L.col[i]||L.obj[i])continue;L.items.push({x:x+.5,y:y+.5,type:'key',bob:R()*6});break}}
  // mercader en la sala de inicio (desde el piso 2, y siempre antes del dragón)
  if(d>=2&&(R()<.55||isBossDepth(d+1))){
    const cand=[[start.x,start.y],[start.x+start.w-1,start.y],[start.x,start.y+start.h-1]];
    for(const[x,y]of cand){const i=idx(x,y);if(L.obj[i]||(x===start.cx&&y===start.cy))continue;L.obj[i]=O_MERCHANT;L.col[i]=1;L.decor[i]=0;L.merchant={x,y};break}}
}
// Sala secreta pegada a una sala, tras su muro del fondo (izquierdo o superior en pantalla, que es el que se ve de frente).
function trySecret(L,rooms){
  const open=L.open;
  for(let a=0;a<60;a++){
    const rm=rooms[RI(0,rooms.length-1)],w=RI(3,4),h=RI(3,4),north=R()<.5;let door,x0,y0;
    if(north){const dx=RI(rm.x+1,rm.x+rm.w-2);door=[dx,rm.y-1];y0=rm.y-1-h;x0=dx-RI(0,w-1)}
    else{const dy=RI(rm.y+1,rm.y+rm.h-2);door=[rm.x-1,dy];x0=rm.x-1-w;y0=dy-RI(0,h-1)}
    if(x0<2||y0<2||x0+w>MW-2||y0+h>MH-2)continue;
    let ok=true;
    for(let y=y0-1;y<=y0+h&&ok;y++)for(let x=x0-1;x<=x0+w;x++)if(open[idx(x,y)]&&!(x===door[0]&&y===door[1])){ok=false;break}
    // la puerta tampoco puede tocar un pasillo
    for(const[ax,ay]of north?[[door[0]-1,door[1]],[door[0]+1,door[1]]]:[[door[0],door[1]-1],[door[0],door[1]+1]])if(open[idx(ax,ay)])ok=false;
    const di=idx(door[0],door[1]);
    if(!ok||open[di]||!L.obj[di])continue;
    L.torches=L.torches.filter(t=>t.x!==door[0]||t.y!==door[1]);
    L.obj[di]=O_SECRET;
    L.secret={x:x0,y:y0,w,h,door:{x:door[0],y:door[1]},open:false};
    return;
  }
}
function useKey(n){
  if(!P.keys){msg('El muro suena hueco. Hay algo detrás, pero necesitas una llave para abrir la cerradura oculta.','#d8b25c');sfx('hit');return}
  P.keys--;openSecret();
}
function openSecret(){
  const s=G.secret;if(!s||s.open)return;s.open=true;
  const{x,y,w,h,door}=s;
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=idx(xx,yy),r=R();G.open[i]=4;G.col[i]=0;G.obj[i]=0;G.decor[i]=0;G.floor[i]=r<.55?3:r<.8?5:2}
  const di=idx(door.x,door.y);G.open[di]=4;G.col[di]=0;G.obj[di]=0;G.floor[di]=3;
  for(let yy=y-1;yy<=y+h;yy++)for(let xx=x-1;xx<=x+w;xx++){const i=idx(xx,yy);if(G.open[i]||G.obj[i])continue;G.obj[i]=R()<.3?4:1;G.col[i]=1}
  const cx=x+Math.floor(w/2),cy=y+Math.floor(h/2);G.obj[idx(cx,cy)]=O_SEALED;G.col[idx(cx,cy)]=1;
  for(let k=0;k<3;k++){const gx=RI(x,x+w-1),gy=RI(y,y+h-1);if(gx===cx&&gy===cy)continue;G.items.push({x:gx+.5,y:gy+.5,type:'gold',n:RI(6,14)*depth,bob:R()*6})}
  G.rooms.push({x,y,w,h,cx,cy,secret:true});
  buildCache(G);
  sfx('stairs');sfx('chest');shake=6;burst(door.x+.5,door.y+.5,'#9a8f80',26,3);burst(door.x+.5,door.y+.5,'#ffd36a',12,2);
  msg('La llave encaja en una grieta del muro. ¡La pared se derrumba y deja ver una sala secreta!','#ffd36a');
  addText(door.x+.5,door.y+.5,'¡Sala secreta!','#ffd36a',20);
}
function hintFor(n){
  if(n.o===11)return 'Abrir cofre';
  if(n.o===13)return 'Bajar a la profundidad '+(depth+1);
  if(n.o===O_SECRET)return P.keys?'Usar una llave en la grieta ('+P.keys+')':'Examinar el muro';
  if(n.o===O_MERCHANT)return 'Hablar con el mercader';
  if(n.o===O_SEALED)return 'Forzar la cerradura del cofre sellado';
  return '';
}

// ---------- Dibujo ----------
function drawSecretCrack(c,sx,sy,t){
  // brillo dorado en la grieta cuando llevas una llave y estás cerca: la pista para encontrarla
  const s=G.secret;if(!s||s.open||!P.keys)return;
  const d=Math.hypot(s.door.x+.5-P.x,s.door.y+.5-P.y);if(d>5)return;
  const north=G.open[idx(s.door.x,s.door.y+1)]>0, fx=north?sx-HW/2:sx+HW/2, fy=sy+2;
  const a=(1-d/5)*(.45+.3*Math.sin(t*4));
  c.save();c.globalAlpha=a;c.strokeStyle='#ffd36a';c.lineWidth=1.5;c.shadowColor='#ffb030';c.shadowBlur=8;
  c.beginPath();c.moveTo(fx-2,fy-14);c.lineTo(fx+2,fy-6);c.lineTo(fx-3,fy+1);c.lineTo(fx+1,fy+8);c.lineTo(fx-1,fy+14);c.stroke();
  c.beginPath();c.arc(fx,fy,2.2,0,7);c.fillStyle='#fff0b0';c.fill();c.restore();
}
function drawMerchant(c,x,y,t){
  // alfombra con mercancía
  c.fillStyle='#5a2430';c.beginPath();c.moveTo(x-22,y+2);c.lineTo(x,y-9);c.lineTo(x+22,y+2);c.lineTo(x,y+13);c.closePath();c.fill();
  c.strokeStyle='#d8b25c';c.lineWidth=1;c.stroke();
  c.fillStyle='#b8283a';c.beginPath();c.arc(x+11,y+1,3.5,0,7);c.fill();c.fillStyle='#d9d2c4';c.fillRect(x+10,y-5,2,3);
  c.fillStyle='#3a6fd8';c.beginPath();c.arc(x+15,y+4,3,0,7);c.fill();
  c.fillStyle='#e9c66a';c.beginPath();c.ellipse(x-12,y+3,4,2,0,0,7);c.fill();c.beginPath();c.ellipse(x-12,y+1,4,2,0,0,7);c.fill();
  // figura encapuchada sentada
  const b=Math.sin(t*1.8)*.8;
  shadow(c,x,y-2,11);
  c.fillStyle='#4a3a5a';c.beginPath();c.moveTo(x-11,y-2);c.quadraticCurveTo(x-12,y-24+b,x,y-30+b);c.quadraticCurveTo(x+12,y-24+b,x+11,y-2);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.moveTo(x,y-30+b);c.quadraticCurveTo(x+12,y-24+b,x+11,y-2);c.lineTo(x,y-2);c.closePath();c.fill();
  // capucha y rostro en sombra con ojos
  c.fillStyle='#3a2c48';c.beginPath();c.arc(x,y-33+b,8,0,7);c.fill();
  c.fillStyle='#120c16';c.beginPath();c.ellipse(x,y-31+b,5,4.5,0,0,7);c.fill();
  c.fillStyle='#ffd36a';c.fillRect(x-3,y-32+b,1.6,1.6);c.fillRect(x+1.5,y-32+b,1.6,1.6);
  // mochila enorme
  c.fillStyle='#6a4422';c.fillRect(x-16,y-30+b,8,18);c.fillStyle='#87592e';c.fillRect(x-17,y-33+b,10,4);
  // farol
  const f=.75+.25*Math.sin(t*7);
  c.strokeStyle='#2b1f14';c.lineWidth=1.5;c.beginPath();c.moveTo(x+9,y-20+b);c.lineTo(x+15,y-26);c.stroke();
  const g=c.createRadialGradient(x+15,y-20,0,x+15,y-20,14);g.addColorStop(0,`rgba(255,220,140,${.9*f})`);g.addColorStop(1,'rgba(255,160,60,0)');
  c.fillStyle=g;c.beginPath();c.arc(x+15,y-20,14,0,7);c.fill();c.fillStyle='#ffe8a8';c.fillRect(x+13,y-23,4,5);
  // monedita que gira sobre la cabeza si tienes oro de sobra
  if(P.gold>=shopPrice('pocion')){const w=Math.abs(Math.cos(t*3))*4+.5;c.fillStyle='#e9c66a';c.beginPath();c.ellipse(x,y-50+Math.sin(t*2)*2,w,4,0,0,7);c.fill()}
}
function drawSealedChest(c,x,y,t){
  const g=c.createRadialGradient(x,y-12,0,x,y-12,30);g.addColorStop(0,`rgba(255,180,80,${.25+.1*Math.sin(t*3)})`);g.addColorStop(1,'rgba(255,180,80,0)');
  c.fillStyle=g;c.beginPath();c.arc(x,y-12,30,0,7);c.fill();
  drawChest(c,x,y,false);
  // cadenas y candado
  c.strokeStyle='#9aa0a8';c.lineWidth=2;c.beginPath();c.moveTo(x-14,y-20);c.lineTo(x+14,y-6);c.moveTo(x+14,y-20);c.lineTo(x-14,y-6);c.stroke();
  c.fillStyle='#c9ced6';c.fillRect(x-4,y-15,8,7);c.strokeStyle='#c9ced6';c.lineWidth=1.5;c.beginPath();c.arc(x,y-15,3,Math.PI,0);c.stroke();
  c.fillStyle='#2a2420';c.fillRect(x-.8,y-13,1.6,3);
}
function drawKeyItem(c,x,y,b){
  const gl=c.createRadialGradient(x,y-10,0,x,y-10,16);gl.addColorStop(0,'rgba(255,211,106,.55)');gl.addColorStop(1,'rgba(255,211,106,0)');
  c.fillStyle=gl;c.beginPath();c.arc(x,y-10,16,0,7);c.fill();
  c.save();c.translate(x,y-10+b);c.rotate(-.5);
  c.strokeStyle='#e9c66a';c.lineWidth=2.5;c.beginPath();c.arc(-6,0,4,0,7);c.stroke();
  c.beginPath();c.moveTo(-2,0);c.lineTo(9,0);c.moveTo(6,0);c.lineTo(6,4);c.moveTo(9,0);c.lineTo(9,4);c.stroke();c.restore();
}

// ---------- Vender ----------
function junkItems(){return P.bag.filter(it=>!isUpgrade(it))}
function sellItems(list){
  if(!list.length)return 0;let g=0;
  for(const it of list){const i=P.bag.indexOf(it);if(i<0)continue;P.bag.splice(i,1);g+=it.value}
  P.gold+=g;sfx('coin');if(eqSel&&!P.bag.some(x=>x.id===eqSel.id)&&eqSel.from==='bag')eqSel=null;
  return g;
}
// Botón con confirmación: el primer toque pregunta, el segundo vende.
function sellButton(btn,label,getList,after){
  let armed=0;
  const refresh=()=>{const l=getList(),g=l.reduce((s,it)=>s+it.value,0);btn.disabled=!l.length;
    btn.textContent=armed?'¿Seguro? Vender '+l.length+' por '+g+' oro':label+(l.length?' ('+l.length+' · '+g+' oro)':'');btn.classList.toggle('armed',!!armed)};
  btn.addEventListener('click',()=>{
    if(!armed){armed=setTimeout(()=>{armed=0;refresh()},3500);refresh();return}
    clearTimeout(armed);armed=0;const n=getList().length,g=sellItems(getList());
    if(g)msg('Vendes '+n+' objeto'+(n>1?'s':'')+' por '+g+' monedas de oro.','#d8b25c');after()});
  btn.refresh=()=>{if(armed){clearTimeout(armed);armed=0}refresh()};
  return btn;
}

// ---------- Mercader ----------
const SHOP_UP_MAX=5;
function upCost(it){return Math.round((25+it.ilvl*9)*(1+.65*(it.up||0)))}
function shopPrice(k){
  if(k==='pocion')return 10+3*depth;
  if(k==='curar')return 6+3*depth;
  if(k==='llave')return 35+12*depth;
  if(k==='fardo')return 50+22*depth;
  if(k==='arma')return P.eq.arma?upCost(P.eq.arma):0;
  if(k==='armadura'){const a=P.eq.armadura||P.eq.casco;return a?upCost(a):0}
  return 0;
}
function upName(it){it.name=it.name.replace(/ \+\d+$/,'')+' +'+it.up}
const SHOP=[
  {k:'pocion',name:'Poción de vida',desc:()=>'Recupera el 45 % de la vida. Llevas '+P.pot+' de 9.',can:()=>P.pot<9||'Llevas el máximo',
    buy(){P.pot++}},
  {k:'curar',name:'Vendas y ungüento',desc:()=>'Te cura por completo ahora mismo.',can:()=>P.hp<P.maxhp||'Ya tienes la vida al máximo',
    buy(){P.hp=P.maxhp;burst(P.x,P.y,'#7fe08a',14,1.5)}},
  {k:'llave',name:'Llave de las criptas',desc:()=>'Abre las grietas de los muros que esconden salas secretas. Tienes '+(P.keys||0)+'.',can:()=>true,
    buy(){P.keys=(P.keys||0)+1}},
  {k:'arma',name:'Afilar el arma',desc:()=>{const w=P.eq.arma;return w?w.name+': daño '+w.min+'–'+w.max+' → '+Math.max(w.min+1,Math.round(w.min*1.1))+'–'+Math.max(w.max+1,Math.round(w.max*1.1)):''},
    can:()=>(P.eq.arma&&(P.eq.arma.up||0)<SHOP_UP_MAX)||'Ya está afilada al máximo (+'+SHOP_UP_MAX+')',
    buy(c){const w=P.eq.arma;w.min=Math.max(w.min+1,Math.round(w.min*1.1));w.max=Math.max(w.max+1,Math.round(w.max*1.1));w.up=(w.up||0)+1;w.value+=Math.round(c*.3);upName(w)}},
  {k:'armadura',name:'Reforzar la armadura',desc:()=>{const a=P.eq.armadura||P.eq.casco;return a?a.name+': defensa '+a.def+' → '+Math.max(a.def+1,Math.round(a.def*1.12)):'Necesitas llevar armadura o casco.'},
    can:()=>{const a=P.eq.armadura||P.eq.casco;return !a?'No llevas armadura ni casco':(a.up||0)<SHOP_UP_MAX||'Ya está reforzada al máximo (+'+SHOP_UP_MAX+')'},
    buy(c){const a=P.eq.armadura||P.eq.casco;a.def=Math.max(a.def+1,Math.round(a.def*1.12));a.up=(a.up||0)+1;a.value+=Math.round(c*.3);upName(a)}},
  {k:'fardo',name:'Fardo misterioso',desc:()=>'Un objeto al azar, de un nivel por encima de esta profundidad y con más suerte de ser raro.',can:()=>P.bag.length<BAG_MAX||'La mochila está llena',
    buy(){const r=R(),it=genItem(depth+1,{boost:.2,type:r<.6?pick(WEAPONS_OF(P.cls)):pick(['armadura','casco','anillo'])});P.bag.push(it);msg('Del fardo sale: '+it.name,RCOL[it.rar])}},
];
let shopSellAll=null,shopSellJunk=null;
function openShop(){
  if(state!=='play')return;state='shop';for(const k in keys)keys[k]=false;stick.id=null;$('stick').hidden=true;
  $('shop').hidden=false;$('shopNote').textContent='';renderShop();
  msg(pick(['«Bienvenido, viajero. El oro no sirve de nada en una tumba.»','«Pasa, pasa. Todo es de primera calidad... casi todo.»','«¿Llaves? Tengo llaves. Las grietas esconden cosas, ¿sabes?»']),'#c9b8e0');
  setTimeout(()=>$('shopClose').focus(),30);
}
function closeShop(){if(state!=='shop')return;$('shop').hidden=true;state='play';updHud();cv.focus()}
function renderShop(){
  computeStats();
  $('shopGold').textContent=P.gold;
  const list=$('shopList');list.innerHTML='';
  for(const o of SHOP){
    const price=shopPrice(o.k),can=o.can(),row=document.createElement('div');row.className='shop-row';
    const t=document.createElement('div');const h=document.createElement('b');h.textContent=o.name;const p=document.createElement('small');p.textContent=o.desc();t.append(h,p);
    const b=document.createElement('button');b.type='button';b.className='buy';
    const why=can!==true?can:P.gold<price?'Te faltan '+(price-P.gold)+' de oro':'';
    b.textContent=price+' oro';b.disabled=!!why;if(why)b.title=why;b.setAttribute('aria-label','Comprar '+o.name+' por '+price+' de oro'+(why?' ('+why+')':''));
    if(why){const w=document.createElement('small');w.className='why';w.textContent=why;t.appendChild(w)}
    b.addEventListener('click',()=>{const c=shopPrice(o.k);if(P.gold<c||o.can()!==true)return;P.gold-=c;o.buy(c);computeStats();sfx('coin');
      $('shopNote').className='note ok';$('shopNote').textContent='Compras: '+o.name.toLowerCase()+'.';renderShop()});
    row.append(t,b);list.appendChild(row)}
  if(!shopSellAll){shopSellAll=sellButton($('shopSellAll'),'Vender toda la mochila',()=>P.bag.slice(),renderShop);shopSellJunk=sellButton($('shopSellJunk'),'Vender lo que no es mejora',junkItems,renderShop)}
  shopSellAll.refresh();shopSellJunk.refresh();
}
$('shopClose').addEventListener('click',closeShop);

// ---------- Cerradura del cofre sellado (minijuego) ----------
// Una aguja va y viene por una barra. Detenla dentro de la zona dorada para levantar cada pasador.
// Tres pasadores, cada uno con la zona más pequeña y la aguja más rápida. Tienes 3 ganzúas.
const LOCK_ZONES=[.2,.14,.09], LOCK_SPEED=[.85,1.2,1.6];
let lock=null;
function openLock(n){
  if(state!=='play')return;state='lock';for(const k in keys)keys[k]=false;stick.id=null;$('stick').hidden=true;
  lock={x:n.x,y:n.y,pin:0,picks:3,ph0:0,hold:performance.now()+400,zc:0,done:false};newZone();
  $('lockResult').textContent='';$('lockResult').className='note';$('lockGo').hidden=false;$('lockTake').hidden=true;
  $('lock').hidden=false;renderLock();requestAnimationFrame(lockFrame);setTimeout(()=>$('lockGo').focus(),30);
}
function newZone(){const w=LOCK_ZONES[lock.pin]||.1;lock.zc=w/2+.05+Math.random()*(.9-w)}
// La posición se calcula con el reloj (no por fotogramas): es justa aunque el móvil vaya a tirones.
function lockPhase(now){return lock.done||now<lock.hold?lock.ph0:lock.ph0+(now-lock.hold)/1000*LOCK_SPEED[Math.min(lock.pin,2)]}
function lockPos(now){const p=lockPhase(now)%2;return p<1?p:2-p}
function lockFrame(){
  if(!lock||state!=='lock')return;
  renderLock();requestAnimationFrame(lockFrame);
}
function renderLock(){
  const w=LOCK_ZONES[Math.min(lock.pin,2)];
  const z=$('lockZone');z.style.left=((lock.zc-w/2)*100)+'%';z.style.width=(w*100)+'%';z.hidden=lock.done;
  $('lockNeedle').style.left=(lockPos(performance.now())*100)+'%';
  $('lockPins').textContent='Pasadores: '+'●'.repeat(lock.pin)+'○'.repeat(3-lock.pin);
  $('lockPicks').textContent='Ganzúas: '+'✦'.repeat(lock.picks)+'·'.repeat(3-lock.picks);
}
function lockPress(){
  const now=performance.now();
  if(!lock||lock.done||now<lock.hold)return;
  const w=LOCK_ZONES[lock.pin],bar=$('lockBar'),pos=lockPos(now);
  lock.ph0=lockPhase(now);
  if(Math.abs(pos-lock.zc)<=w/2){lock.pin++;sfx('chest');bar.classList.remove('bad');bar.classList.add('good');setTimeout(()=>bar.classList.remove('good'),250);
    if(lock.pin>=3){finishLock();return}newZone();lock.hold=now+350}
  else{lock.picks--;sfx('hurt');bar.classList.remove('good');bar.classList.add('bad');setTimeout(()=>bar.classList.remove('bad'),300);lock.hold=now+500;
    if(lock.picks<=0){finishLock();return}}
  renderLock();
}
function finishLock(){
  lock.done=true;renderLock();
  const{pin,picks}=lock,res=$('lockResult');
  const g=RI(12,25)*depth*(pin+1);P.gold+=g;
  let it=null;
  if(pin>0){const r=R(),type=r<.6?pick(WEAPONS_OF(P.cls)):pick(['armadura','casco','anillo']);
    it=genItem(depth+(pin===3?2:1),{type,rar:pin===3?3:pin===2?2:1});
    if(pin===3&&picks===3){it.aff.push({k:'dmg',v:IRI(8,14)});it.value=Math.round(it.value*1.3)}}
  const C=G.obj[idx(lock.x,lock.y)]===O_SEALED;if(C)G.obj[idx(lock.x,lock.y)]=12;
  if(it)dropItem(lock.x+.5+(P.x<lock.x+.5?-.7:.7),lock.y+.5+(P.y<lock.y+.5?-.7:.7),it);
  burst(lock.x+.5,lock.y+.5,'#ffd36a',pin*8+8,2.5);sfx(pin===3?'level':'coin');
  res.className='note '+(pin===3?'ok':pin?'':'err');
  res.textContent=pin===3?(picks===3?'¡Perfecto! Sin romper ninguna ganzúa. ':'¡Abierto! ')+'Dentro hay un objeto legendario y '+g+' de oro.'
    :pin===2?'Se te rompió la última ganzúa, pero lograste entreabrirlo: un objeto raro y '+g+' de oro.'
    :pin===1?'La cerradura cede a medias: un objeto mágico y '+g+' de oro.'
    :'Se rompieron todas las ganzúas. Por la rendija solo sacas '+g+' de oro.';
  $('lockGo').hidden=true;$('lockTake').hidden=false;setTimeout(()=>$('lockTake').focus(),30);
}
function closeLock(){if(state!=='lock'||!lock||!lock.done)return;$('lock').hidden=true;state='play';lock=null;updHud();cv.focus()}
$('lockGo').addEventListener('pointerdown',e=>{e.preventDefault();lockPress()});
$('lockGo').addEventListener('keydown',e=>{if(e.code==='Enter'){e.preventDefault();e.stopPropagation();lockPress()}});
$('lockBar').addEventListener('pointerdown',e=>{e.preventDefault();lockPress()});
$('lockTake').addEventListener('click',closeLock);
// teclado de las ventanas nuevas (lo llama entrada.js)
function extraKey(e){
  if(state==='shop'){if(e.code==='Escape'||e.code==='KeyE'){e.preventDefault();closeShop()}return}
  if(state==='lock'){
    if(lock&&lock.done){if(e.code==='Escape'||e.code==='KeyE'||e.code==='Enter'||e.code==='Space'){e.preventDefault();closeLock()}return}
    if(e.code==='Space'||e.code==='KeyE'||e.code==='KeyJ'){e.preventDefault();if(!e.repeat)lockPress()}}
}
