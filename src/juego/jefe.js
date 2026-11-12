// ---------- Jefe: el Dragón tricéfalo (cada 10 profundidades) ----------
// Arena cuadrada con cuatro pilares. El dragón muerde de cerca, escupe fuego en cono,
// lanza ráfagas de bolas de fuego, hace caer meteoros y llama a orcos y brutos.
// Por debajo de la mitad de vida se enfurece: ataca más a menudo y con más bolas.
const BOSS_EVERY=10;
const isBossDepth=d=>d>0&&d%BOSS_EVERY===0;
const BREATH_T=2.1, BREATH_PREP=.5, BREATH_LEN=5.2, BREATH_ARC=.38;

function genArena(d,s){
  rng=mulberry32(s);
  const N=MW*MH, open=new Uint8Array(N), floor=new Uint8Array(N).fill(255), obj=new Uint8Array(N), decor=new Uint8Array(N), col=new Uint8Array(N).fill(1), seen=new Uint8Array(N);
  const A={x:12,y:12,w:24,h:24};A.cx=A.x+A.w/2;A.cy=A.y+A.h/2;
  for(let y=A.y;y<A.y+A.h;y++)for(let x=A.x;x<A.x+A.w;x++)open[idx(x,y)]=2;
  // pilares de 2×2 para cubrirse de las bolas de fuego
  const pillars=[[A.x+5,A.y+5],[A.x+A.w-7,A.y+5],[A.x+5,A.y+A.h-7],[A.x+A.w-7,A.y+A.h-7]];
  for(const[px,py]of pillars)for(let y=py;y<py+2;y++)for(let x=px;x<px+2;x++)open[idx(x,y)]=0;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(!open[i])continue;col[i]=0;
    const r=R();floor[i]=r<.55?0:r<.72?1:r<.84?4:r<.94?2:5;}
  // losa grande en el centro, donde aparecen las escaleras
  for(let y=A.cy-2;y<A.cy+2;y++)for(let x=A.cx-2;x<A.cx+2;x++)floor[idx(x,y)]=3;
  const torches=[];
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=idx(x,y);if(open[i])continue;
    let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(open[idx(x+dx,y+dy)])near=true;
    if(!near)continue;
    let v=1;
    if(open[idx(x,y+1)]&&x%4===1){v=2;torches.push({x,y,face:'L'})}
    else if(open[idx(x+1,y)]&&y%4===1){v=3;torches.push({x,y,face:'R'})}
    else if(R()<.25)v=4;
    obj[i]=v;
  }
  for(let y=A.y;y<A.y+A.h;y++)for(let x=A.x;x<A.x+A.w;x++){const i=idx(x,y);if(!open[i])continue;const r=R();if(r<.06)decor[i]=1;else if(r<.08)decor[i]=2}
  const start={x:A.x+1,y:A.y+A.h-4,w:3,h:3,cx:A.x+2,cy:A.y+A.h-3};
  const th=Object.assign({},THEMES[3],{name:'Guarida del Dragón'});
  const L={d,theme:th,tiles:buildTileset(th),open,floor,obj,decor,col,seen,rooms:[A],stairs:{x:Math.floor(A.cx),y:Math.floor(A.cy)},torches,start,
    enemies:[],items:[],proj:[],pproj:[],parts:[],texts:[],fx:[],corpses:[],arena:A,bossLevel:true};
  // el dragón
  const T=ETYPES.dragon,hp=Math.round(T.hp*(d/10)*(1+.05*(d-10)));
  L.enemies.push({t:T,x:A.cx+2,y:A.cy-2,r:T.r,hp,maxhp:hp,dmg:Math.round(T.dmg*(1+.18*(d-1))),face:Math.atan2(start.cy-A.cy,start.cx-A.cx),walk:0,cd:0,wind:0,flash:0,kx:0,ky:0,
    aggro:false,wander:0,wx:0,wy:0,sx:0,sy:0,mode:'sleep',mt:3,cdB:3,cdS:1.5,cdM:10,cdR:7,shots:0,shotT:0,aim:0,enraged:false});
  // primeros siervos, junto a los pilares del fondo
  const sv=(k,x,y)=>L.enemies.push(minion(k,x,y,d,false));
  sv('orco',A.x+A.w-5,A.y+4);sv('orco',A.x+4,A.y+4);sv('bruto',A.x+A.w-4,A.y+A.h-5);
  buildCache(L);
  return L;
}
function minion(k,x,y,d,aggro){const T=ETYPES[k],sc=1+.25*(d-1);
  return {t:T,x:x+.5,y:y+.5,r:T.r,hp:Math.round(T.hp*sc),maxhp:Math.round(T.hp*sc),dmg:Math.round(T.dmg*(1+.18*(d-1))),face:R()*6.28,walk:0,cd:R(),wind:0,flash:0,kx:0,ky:0,aggro,wander:0,wx:0,wy:0,sx:0,sy:0}}
const turnTo=(a,b,max)=>{const d=angDiff(b,a);return a+clamp(d,-max,max)};
const bossOf=()=>G&&G.bossLevel?G.enemies.find(e=>e.t.boss):null;

function updateBoss(e,dt){
  const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||.01,ang=Math.atan2(dy,dx);
  const rage=e.hp<e.maxhp*.5,k=rage?.65:1;
  if(rage&&!e.enraged){e.enraged=true;msg('¡El dragón se enfurece! Sus llamas arden con más fuerza.','#ff7a3c');shake=12;sfx('roar');burst(e.x,e.y,'#ff6a20',30,3.5)}
  e.cdB-=dt;e.cdS-=dt;e.cdM-=dt;e.cdR-=dt;e.mt-=dt;
  switch(e.mode){
    case 'sleep':
      if(e.mt<=0||d<5||e.hp<e.maxhp){e.mode='roar';e.mt=1.1;e.aggro=true;shake=10;sfx('roar');
        msg('¡El Dragón tricéfalo despierta!','#ff7a3c');addText(e.x,e.y,'¡GRRRAAAH!','#ff7a3c',22)}
      return;
    case 'roar':if(e.mt<=0)e.mode='walk';return;
    case 'breath':{
      const el=BREATH_T-e.mt;
      e.aim=turnTo(e.aim,ang,(rage?.9:.6)*dt);e.face=e.aim;
      if(el>BREATH_PREP){
        for(let n=0;n<5;n++){const r=.9+R()*(BREATH_LEN-.9),a=e.aim+(R()-.5)*BREATH_ARC*1.6*Math.min(1,r/2.5);
          G.parts.push({x:e.x+Math.cos(a)*r,y:e.y+Math.sin(a)*r,z:14+R()*14,vx:Math.cos(a)*2.5,vy:Math.sin(a)*2.5,vz:20+R()*30,life:.35+R()*.25,t:0,color:R()<.4?'#ffe08a':R()<.7?'#ff9a3c':'#ff5a1a',size:3+R()*3})}
        if(d<BREATH_LEN+P.r&&Math.abs(angDiff(ang,e.aim))<BREATH_ARC&&los(e,P))hurtPlayer(Math.round(e.dmg*.35),e);
      }else if(Math.random()<.5)G.parts.push({x:e.x+Math.cos(e.aim)*.9,y:e.y+Math.sin(e.aim)*.9,z:30,vx:0,vy:0,vz:15,life:.3,t:0,color:'#ffb050',size:2});
      if(e.mt<=0)e.mode='walk';return}
    case 'spit':
      e.face=turnTo(e.face,ang,3*dt);e.shotT-=dt;
      if(e.shotT<=0&&e.shots>0){e.shots--;e.shotT=.32;volley(e,e.face,rage)}
      if(e.mt<=0&&e.shots<=0)e.mode='walk';return;
  }
  // caminar y elegir ataque
  e.face=turnTo(e.face,ang,2.6*dt);
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){if(d<e.r+P.r+.9){hurtPlayer(e.dmg,e);burst(P.x,P.y,'#ff9a3c',10,2)}e.cd=1.3*k}return}
  if(d<e.r+P.r+.6&&e.cd<=0){e.wind=.55;return}
  const mins=G.enemies.length-1;
  if(e.cdM<=0&&mins<(rage?6:4)){e.cdM=rage?12:16;summon(e,rage?3:2);e.mode='roar';e.mt=1;return}
  if(e.cdB<=0&&d<BREATH_LEN-.5&&los(e,P)){e.mode='breath';e.mt=BREATH_T;e.aim=ang;e.cdB=(6+R()*2)*k;sfx('roar');return}
  if(e.cdR<=0){e.cdR=(9+R()*3)*k;meteors(e,rage?5:3);e.mode='roar';e.mt=.9;return}
  if(e.cdS<=0&&d>2.5&&los(e,P)){e.mode='spit';e.mt=1.1;e.shots=rage?3:2;e.shotT=.35;e.cdS=(4.5+R()*1.5)*k;return}
  if(d>e.r+P.r+.3){const sp=e.t.spd*(rage?1.25:1)*dt;moveEnt(e,Math.cos(e.face)*sp,Math.sin(e.face)*sp);e.walk+=dt*5}
}
function volley(e,a,rage){
  const n=rage?5:3,spread=.32;sfx('fire');
  for(let k=0;k<n;k++){const b=a+(k-(n-1)/2)*spread/(n>3?1.4:1);
    G.proj.push({kind:'fireball',x:e.x+Math.cos(a)*1.1,y:e.y+Math.sin(a)*1.1,vx:Math.cos(b)*6.2,vy:Math.sin(b)*6.2,life:2.6,dmg:Math.round(e.dmg*.65),src:e})}
}
function meteors(e,n){
  sfx('roar');msg('¡Caen bolas de fuego del techo!','#ff9a3c');
  for(let k=0;k<n;k++){let x=P.x,y=P.y;
    if(k){for(let t=0;t<8;t++){x=P.x+(R()-.5)*5;y=P.y+(R()-.5)*5;if(!solid(x,y))break}}
    G.fx.push({k:'meteor',x,y,t:-k*.25,delay:1.3,dmg:Math.round(e.dmg*.7),src:e})}
}
function summon(e,n){
  const A=G.arena;sfx('roar');shake=8;msg('El dragón ruge y llama a sus siervos.','#ff9a8a');
  const spots=[[A.x+1,A.y+1],[A.x+A.w-2,A.y+1],[A.x+1,A.y+A.h-2],[A.x+A.w-2,A.y+A.h-2],[A.x+A.w/2,A.y+1],[A.x+1,A.y+A.h/2],[A.x+A.w-2,A.y+A.h/2],[A.x+A.w/2,A.y+A.h-2]]
    .filter(([x,y])=>Math.hypot(x-P.x,y-P.y)>5).sort(()=>R()-.5);
  for(let k=0;k<n&&k<spots.length;k++){const[x,y]=spots[k],m=minion(R()<.3?'bruto':'orco',x,y,depth,true);
    G.enemies.push(m);burst(m.x,m.y,'#5a3a6a',16,2.5);addText(m.x,m.y,'!','#ffb05a',18)}
}
function fireballBoom(x,y,dmg,src,rad){
  rad=rad||1.1;sfx('boom');shake=Math.max(shake,5);
  G.fx.push({k:'boom',x,y,t:0,life:.45});burst(x,y,'#ff9a3c',16,3);burst(x,y,'#ffe08a',8,2);
  if(Math.hypot(P.x-x,P.y-y)<rad+P.r)hurtPlayer(dmg,src);
}
function updateFx(dt){
  for(const f of G.fx.slice()){f.t+=dt;
    if(f.k==='meteor'){if(f.t>=f.delay){fireballBoom(f.x,f.y,f.dmg,f.src,1.3);G.fx.splice(G.fx.indexOf(f),1)}}
    else if(f.t>f.life)G.fx.splice(G.fx.indexOf(f),1)}
}
function bossDefeated(e){
  G.enemies.splice(G.enemies.indexOf(e),1);kills++;
  G.corpses.push({x:e.x,y:e.y,face:e.face});G.proj.length=0;G.fx=G.fx.filter(f=>f.k!=='meteor');
  shake=16;sfx('roar');sfx('boom');
  for(let k=0;k<7;k++)G.fx.push({k:'boom',x:e.x+(R()-.5)*2.4,y:e.y+(R()-.5)*2.4,t:-k*.2,life:.5});
  burst(e.x,e.y,'#ff6a20',40,4);burst(e.x,e.y,'#ffd36a',24,3);
  // los siervos se desmoronan sin el dragón
  for(const m of G.enemies.slice()){burst(m.x,m.y,'#6e1812',12,2.5);kills++}
  G.enemies.length=0;
  gainXp(Math.round(e.t.xp*(1+.2*(depth-1))*P.stats.xp));
  // recompensa: arma legendaria de tu clase + otra pieza rara o legendaria + oro y pociones
  dropItem(e.x-.9,e.y+.9,dragonWeapon());
  dropItem(e.x+.9,e.y-.9,genItem(depth+2,{type:pick(['armadura','casco','anillo']),rar:R()<.5?3:2}));
  for(let k=0;k<6;k++){const a=k*1.05;G.items.push({x:e.x+Math.cos(a)*1.3,y:e.y+Math.sin(a)*1.3,type:'gold',n:RI(15,30)*depth,bob:R()*6})}
  for(let k=0;k<2;k++)G.items.push({x:e.x+(k?.5:-.5),y:e.y+(k?-.5:.5),type:'potion',bob:R()*6});
  for(const it of G.items)if(solid(it.x,it.y)){it.x=G.stairs.x+.5+(R()-.5);it.y=G.stairs.y+.5+(R()-.5)}
  G.obj[idx(G.stairs.x,G.stairs.y)]=13;
  P.dragons=(P.dragons||0)+1;
  msg('¡Has derrotado al Dragón tricéfalo! Su tesoro es tuyo.','#ffd36a');
  msg('Se abren unas escaleras en el centro de la arena.','#e58a3c');
  addText(e.x,e.y,'¡Victoria!','#ffd36a',24);
}
function dragonWeapon(){
  const it=genItem(depth+4,{type:pick(WEAPONS_OF(P.cls)),rar:3});
  it.min=Math.round(it.min*1.25);it.max=Math.round(it.max*1.25);
  const dmg=it.aff.find(a=>a.k==='dmg');if(dmg)dmg.v+=10;else it.aff.push({k:'dmg',v:15+depth});
  it.name='«'+it.base+' del Dragón»';it.value*=3;it.dragon=true;
  return it;
}

// ---------- Dibujo ----------
function drawDragon(c,e,t){
  const x=e.sx,y=e.sy,[fx,fy]=screenFacing(e.face);
  shadow(c,x,y,58);
  if(!DRAGON_OK){c.fillStyle=e.flash>0?'#fff':'#b0201a';c.beginPath();c.ellipse(x,y-50,50,45,0,0,7);c.fill();return}
  const back=fy<-.45&&e.mode!=='sleep'&&e.mode!=='roar';let a,fr,bob=0;
  if(e.mode==='sleep'||e.mode==='roar'){a=DRAGON.front;fr=a[Math.floor(t*(e.mode==='roar'?6:1.5))%2]}
  else if(back){a=DRAGON.back;fr=a[Math.floor(e.walk*.6+t*2)%2]}
  else if(e.mode==='breath'){fr=BREATH_T-e.mt<BREATH_PREP?DRAGON.spit[0]:DRAGON.breath[Math.floor(t*8)%2]}
  else if(e.mode==='spit'){fr=DRAGON.spit[e.shotT>.2?1:0]}
  else if(e.wind>0){fr=DRAGON.spit[0]}
  else{a=DRAGON.idle;fr=a[Math.floor(e.walk*.8+t*2.5)%a.length];bob=Math.sin(t*3)*2}
  const flip=!back&&a!==DRAGON.front&&fx<0;
  dragonFrame(c,fr,x,y+bob,1,flip);
  if(e.flash>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.5;dragonFrame(c,fr,x,y+bob,1,flip);c.restore()}
}
function drawOrc(c,e,t){
  const x=e.sx,y=e.sy,[fx]=screenFacing(e.face),side=fx>=0?1:-1,st=Math.sin(e.walk)*2.5,wind=e.wind>0?-10:0;
  shadow(c,x,y,13);const skin=e.flash>0?'#fff':'#6f8a3a';
  c.fillStyle='#3b2a1c';c.fillRect(x-7,y-12-st*.5,6,12+st*.5);c.fillRect(x+1,y-12+st*.5,6,12-st*.5);
  c.fillStyle=e.flash>0?'#fff':'#5a3b26';c.beginPath();c.ellipse(x,y-24,11,12,0,0,7);c.fill();
  c.fillStyle='#2a1d14';c.fillRect(x-11,y-18,22,4);
  c.fillStyle=skin;c.beginPath();c.ellipse(x-side*12,y-23,4.5,8,0,0,7);c.fill();c.beginPath();c.ellipse(x+side*13,y-25+wind,4.5,8,0,0,7);c.fill();
  c.strokeStyle='#4b3522';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(x+side*14,y-19+wind);c.lineTo(x+side*20,y-42+wind*1.3);c.stroke();
  c.fillStyle='#b9c0c8';c.beginPath();c.moveTo(x+side*19,y-44+wind*1.3);c.quadraticCurveTo(x+side*30,y-42+wind*1.3,x+side*27,y-30+wind*1.3);c.lineTo(x+side*20,y-36+wind*1.3);c.closePath();c.fill();
  c.fillStyle=skin;c.beginPath();c.arc(x+side*2,y-39,7,0,7);c.fill();
  c.fillStyle='#efe6cf';c.fillRect(x+side*2-4,y-35,2,3);c.fillRect(x+side*2+2,y-35,2,3);
  c.fillStyle='#ff3a20';c.fillRect(x+side*2-3,y-41,2,2);c.fillRect(x+side*2+1,y-41,2,2);
}
function drawCorpse(c,k,t){const sx=isoX(k.x,k.y),sy=isoY(k.x,k.y),[fx]=screenFacing(k.face);
  shadow(c,sx,sy,60);if(DRAGON_OK)dragonFrame(c,DRAGON.death[0],sx,sy,1,fx<0)}
function drawFireball(c,p){const sx=isoX(p.x,p.y),sy=isoY(p.x,p.y)-24;
  const g=c.createRadialGradient(sx,sy,0,sx,sy,20);g.addColorStop(0,'rgba(255,200,90,.6)');g.addColorStop(1,'rgba(255,80,10,0)');c.fillStyle=g;c.beginPath();c.arc(sx,sy,20,0,7);c.fill();
  if(DRAGON_OK){const sdx=(p.vx-p.vy)*HW,sdy=(p.vx+p.vy)*HH;dragonFrame(c,DRAGON.comet[0],sx,sy,.42,false,Math.atan2(sdy,sdx)-2.36)}}
// marcas en el suelo de los meteoros (se dibujan planas, antes de los personajes)
function drawBossFloorFx(c,t){
  for(const f of G.fx){if(f.k!=='meteor'||f.t<0)continue;const sx=isoX(f.x,f.y),sy=isoY(f.x,f.y),p=clamp(f.t/f.delay,0,1);
    c.strokeStyle=`rgba(255,${120-80*p},40,${.5+.4*p})`;c.lineWidth=2;c.beginPath();c.ellipse(sx,sy,1.3*HW*1.1,1.3*HH*1.1,0,0,7);c.stroke();
    c.fillStyle=`rgba(255,90,30,${.12+.25*p})`;c.beginPath();c.ellipse(sx,sy,1.3*HW*1.1*p,1.3*HH*1.1*p,0,0,7);c.fill()}
}
// meteoros cayendo y explosiones (encima de todo)
function drawBossFx(c,t){
  if(!DRAGON_OK)return;
  for(const f of G.fx){if(f.t<0)continue;const sx=isoX(f.x,f.y),sy=isoY(f.x,f.y);
    if(f.k==='meteor'){const p=clamp(f.t/f.delay,0,1);if(p>.35){const h=(1-p)*420;dragonFrame(c,DRAGON.comet[0],sx+h*.35,sy-20-h,.7,false,Math.atan2(1,-.35)-2.36)}}
    else{const p=f.t/f.life,fr=DRAGON.boom[p<.4?0:1];c.globalAlpha=Math.max(0,1-Math.max(0,p-.5)*2);dragonFrame(c,fr,sx,sy-20,.75,false);c.globalAlpha=1}}
}
function drawBossBar(){
  const e=bossOf();if(!e||e.mode==='sleep')return;
  const w=Math.min(440,vw*.46),h=12,x=(vw-w)/2,y=126,pr=40;
  ctx.fillStyle='rgba(10,6,8,.78)';ctx.fillRect(x-pr-10,y-6,w+pr+16,h+30);
  if(DRAGON_OK){const[sx,sy,fw,fh]=DRAGON.portrait[0];ctx.drawImage(DRAGON_IMG,sx,sy,fw,fh,x-pr-6,y-3,pr,pr)}
  ctx.fillStyle='#e9dfc8';ctx.font="700 14px 'Alegreya Sans', sans-serif";ctx.textAlign='left';
  ctx.fillText('Dragón tricéfalo'+(e.enraged?' · enfurecido':''),x,y+9);
  ctx.fillStyle='#2a1614';ctx.fillRect(x,y+14,w,h);
  ctx.fillStyle=e.enraged?'#ff5a1a':'#c4382d';ctx.fillRect(x,y+14,w*Math.max(0,e.hp)/e.maxhp,h);
  ctx.strokeStyle='rgba(216,178,92,.7)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+14.5,w-1,h-1);
}
