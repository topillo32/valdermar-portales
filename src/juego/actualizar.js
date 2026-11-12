// ---------- Actualización ----------
function update(dt){
  time+=dt;
  if(state!=='play'){return}
  P.cd-=dt;P.swing=Math.max(0,P.swing-dt);P.inv-=dt;P.hurtT=Math.max(0,(P.hurtT||0)-dt);P.moving=false;
  const PC=CLS();if(PC.regen&&P.hp<P.maxhp)P.hp=Math.min(P.maxhp,P.hp+PC.regen*dt);
  let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0), iy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
  if(stick.id!==null&&Math.hypot(stick.dx,stick.dy)>.2){ix=stick.dx;iy=stick.dy}
  if(ix||iy){let wx=ix+iy,wy=iy-ix;const l=Math.hypot(wx,wy);if(l>0){const sp=PC.spd*P.stats.mov*Math.min(1,Math.hypot(ix,iy))*dt;moveEnt(P,wx/l*sp,wy/l*sp);if(P.swing<=0)P.face=Math.atan2(wy,wx);P.walk+=dt*11;P.moving=true}}
  // visto
  const px=Math.floor(P.x),py=Math.floor(P.y);
  for(let y=py-7;y<=py+7;y++)for(let x=px-7;x<=px+7;x++)if(x>=0&&y>=0&&x<MW&&y<MH&&(x-px)**2+(y-py)**2<=49)G.seen[idx(x,y)]=1;
  // enemigos
  for(const e of G.enemies.slice()){
    e.cd-=dt;e.flash-=dt;
    if(e.kx||e.ky){moveEnt(e,e.kx*dt,e.ky*dt);const f=Math.pow(.002,dt);e.kx*=f;e.ky*=f;if(Math.abs(e.kx)<.05)e.kx=0;if(Math.abs(e.ky)<.05)e.ky=0}
    if(e.t.boss){updateBoss(e,dt);continue}
    if(e.stun>0){e.stun-=dt;continue}
    const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy);
    if(!e.aggro&&d<8&&los(e,P)){e.aggro=true;addText(e.x,e.y,'!','#ffb05a',18)}
    if(e.aggro&&d>16)e.aggro=false;
    if(e.aggro){
      e.face=Math.atan2(dy,dx);
      if(e.t.ranged){
        let mvx=0,mvy=0;if(d<3.5){mvx=-dx/d;mvy=-dy/d}else if(d>6||!los(e,P)){mvx=dx/d;mvy=dy/d}else{mvx=-dy/d*.6;mvy=dx/d*.6}
        moveEnt(e,mvx*e.t.spd*dt,mvy*e.t.spd*dt);e.walk+=dt*8;
        if(e.cd<=0&&d<7.5&&los(e,P)){e.cd=e.t.cdT;sfx('bolt');G.proj.push({x:e.x,y:e.y,vx:dx/d*5.5,vy:dy/d*5.5,life:2.2,dmg:e.dmg,src:e})}
      }else{
        const reach=e.r+P.r+.35;
        if(e.wind>0){e.wind-=dt;if(e.wind<=0){if(d<reach+.25)hurtPlayer(e.dmg,e);e.cd=e.t.cdT}}
        else if(d<reach&&e.cd<=0)e.wind=e.t.wind;
        else if(d>reach-.15){moveEnt(e,dx/d*e.t.spd*dt,dy/d*e.t.spd*dt);e.walk+=dt*e.t.spd*4}
      }
    }else{
      e.wander-=dt;if(e.wander<=0){e.wander=1+R()*2.5;const a=R()*6.28,go=R()<.5;e.wx=go?Math.cos(a):0;e.wy=go?Math.sin(a):0;if(go)e.face=a}
      if(e.wx||e.wy){moveEnt(e,e.wx*e.t.spd*.35*dt,e.wy*e.t.spd*.35*dt);e.walk+=dt*4}
    }
  }
  // separación
  const ents=G.enemies;
  for(let a=0;a<ents.length;a++)for(let b=a+1;b<ents.length;b++){const A=ents[a],B=ents[b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),m=A.r+B.r;
    if(d<m&&d>0){const p=(m-d)/2;moveEnt(A,-dx/d*p,-dy/d*p);moveEnt(B,dx/d*p,dy/d*p)}}
  for(const e of ents){const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy),m=e.r+P.r;if(d<m&&d>0)moveEnt(e,-dx/d*(m-d),-dy/d*(m-d))}
  // proyectiles
  for(const p of G.proj.slice()){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(p.kind==='fireball'){
      if(Math.random()<.8)G.parts.push({x:p.x,y:p.y,z:22,vx:(R()-.5)*.8,vy:(R()-.5)*.8,vz:12,life:.35,t:0,color:R()<.5?'#ffb050':'#ff5a1a',size:2+R()*2.5});
      if(solid(p.x,p.y)||p.life<=0||Math.hypot(P.x-p.x,P.y-p.y)<.5){fireballBoom(p.x-p.vx*dt,p.y-p.vy*dt,p.dmg,p.src);G.proj.splice(G.proj.indexOf(p),1)}
      continue}
    if(Math.random()<.5)G.parts.push({x:p.x,y:p.y,z:22,vx:0,vy:0,vz:10,life:.3,t:0,color:'#c48aff',size:2});
    if(solid(p.x,p.y)||p.life<=0){burst(p.x,p.y,'#b070ff',6,1.5);G.proj.splice(G.proj.indexOf(p),1);continue}
    if(Math.hypot(P.x-p.x,P.y-p.y)<.45){hurtPlayer(p.dmg,p.src);burst(p.x,p.y,'#b070ff',8,1.5);G.proj.splice(G.proj.indexOf(p),1)}}
  updatePlayerProj(dt);
  if(G.fx.length)updateFx(dt);
  // objetos
  for(const it of G.items.slice()){it.bob+=dt*4;if(Math.hypot(P.x-it.x,P.y-it.y)<.65){
    if(it.type==='gear'){if(P.bag.length>=BAG_MAX){if(time-(P.fullMsg||-9)>4){P.fullMsg=time;msg('La mochila está llena. Pulsa B para vender objetos.','#ff9a8a')}continue}
      P.bag.push(it.item);sfx('coin');msg('Recoges: '+it.item.name+(canUse(it.item,P.cls)?'':' (no es para tu clase)'),RCOL[it.item.rar]);
      if(isUpgrade(it.item))addText(P.x,P.y,'▲ Mejora','#7fe08a',15)}
    else if(it.type==='gold'){P.gold+=it.n;addText(it.x,it.y,'+'+it.n+' oro','#d8b25c',14);sfx('coin')}
    else{if(P.pot>=9)continue;P.pot++;addText(it.x,it.y,'+1 poción','#e08080',14);sfx('coin')}
    G.items.splice(G.items.indexOf(it),1)}}
  for(const p of G.parts.slice()){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vz-=220*dt;p.z+=p.vz*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6}if(p.t>p.life)G.parts.splice(G.parts.indexOf(p),1)}
  for(const t of G.texts.slice()){t.t+=dt;t.z+=30*dt;if(t.t>1)G.texts.splice(G.texts.indexOf(t),1)}
  // cámara
  const tx=isoX(P.x,P.y),ty=isoY(P.x,P.y)-14;const k=1-Math.pow(.0005,dt);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
  shake=Math.max(0,shake-dt*25);
  const near=nearInteract(),hint=$('hint');
  if(near){hint.hidden=false;hint.innerHTML=(document.body.classList.contains('touch')?'<kbd>Usar</kbd> · ':'<kbd>E</kbd> · ')+(near.o===11?'Abrir cofre':'Bajar a la profundidad '+(depth+1))}else hint.hidden=true;
  hudT-=dt;if(hudT<=0){hudT=.1;updHud()}
  inspT-=dt;if(inspT<=0){inspT=.15;updInspectorCell()}
}
