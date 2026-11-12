// ---------- Render ----------
function render(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#060508';ctx.fillRect(0,0,vw,vh);
  if(!G)return;
  const sx0=(Math.random()-.5)*shake,sy0=(Math.random()-.5)*shake;
  const ox=vw/2-cam.x*zoom+sx0, oy=vh/2-cam.y*zoom+sy0;
  ctx.setTransform(dpr*zoom,0,0,dpr*zoom,dpr*ox,dpr*oy);
  ctx.drawImage(G.cache,-G.ox,0);
  const rad=Math.ceil(Math.max(vw,vh)/zoom/HH/2)+3,pcx=Math.floor(P.x),pcy=Math.floor(P.y);
  const x0=Math.max(0,pcx-rad),x1=Math.min(MW-1,pcx+rad),y0=Math.max(0,pcy-rad),y1=Math.min(MH-1,pcy+rad);
  // escaleras (planas)
  if(show.obj){const s=G.stairs;if(G.obj[idx(s.x,s.y)]===13)drawStairs(ctx,isoX(s.x+.5,s.y+.5),isoY(s.x+.5,s.y+.5),time)}
  if(G.fx.length)drawBossFloorFx(ctx,time);
  // overlays planos del inspector
  if(show.grid||show.col){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=idx(x,y),sx=isoX(x,y),sy=isoY(x,y);
      if(show.col&&G.col[i]&&G.floor[i]!==255||show.col&&G.obj[i]&&G.obj[i]<10){diamond(ctx,sx-HW,sy,TW,TH);ctx.fillStyle='rgba(230,60,50,.28)';ctx.fill()}
      else if(show.col&&!G.col[i]){diamond(ctx,sx-HW,sy,TW,TH);ctx.fillStyle='rgba(80,200,120,.12)';ctx.fill()}
      if(show.grid&&G.floor[i]!==255){diamond(ctx,sx-HW,sy,TW,TH);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.stroke()}}}
  // lista de dibujo ordenada por profundidad
  const list=[];
  if(show.obj)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const o=G.obj[idx(x,y)];if(o&&o!==13)list.push({k:x+y+1,kind:o<10?'wall':'obj',x,y,o})}
  for(const it of G.items)list.push({k:it.x+it.y,kind:'item',it});
  for(const k of G.corpses)list.push({k:k.x+k.y-.6,kind:'corpse',c:k});
  for(const e of G.enemies){e.sx=isoX(e.x,e.y);e.sy=isoY(e.x,e.y);list.push({k:e.x+e.y+.01,kind:'enemy',e})}
  P.sx=isoX(P.x,P.y);P.sy=isoY(P.x,P.y);list.push({k:P.x+P.y+.01,kind:'player'});
  for(const p of G.proj)list.push({k:p.x+p.y+.02,kind:'proj',p});
  for(const p of G.pproj)list.push({k:p.x+p.y+.02,kind:'pproj',p});
  list.sort((a,b)=>a.k-b.k);
  const pk=P.x+P.y;
  // sala actual: sus muros inferiores (borde x máx. y borde y máx.) se recortan
  const room=G.rooms.find(r=>P.x>=r.x&&P.x<r.x+r.w&&P.y>=r.y&&P.y<r.y+r.h);
  const isCut=(x,y)=>{
    if(room){const ex=room.x+room.w,ey=room.y+room.h,w=(a,b)=>{const o=G.obj[idx(a,b)];return o&&o<10};
      // borde inferior derecho (x máx.) e inferior izquierdo (y máx.), incluido un muro doble
      if(y>=room.y-1&&y<=ey+1&&(x===ex||x===ex+1&&w(ex,y)))return true;
      if(x>=room.x-1&&x<=ex+1&&(y===ey||y===ey+1&&w(x,ey)))return true;}
    // pasillos y bordes: muros frontales cercanos con suelo detrás
    return x+y>pk+.5&&Math.hypot(x+.5-P.x,y+.5-P.y)<6.5&&(G.open[idx(x-1,y)]||G.open[idx(x,y-1)]);
  };
  const ST=8; // altura del zócalo recortado
  for(const d of list){
    if(d.kind==='wall'){const sx=isoX(d.x,d.y),sy=isoY(d.x,d.y),img=G.tiles.wall[d.o];
      if(isCut(d.x,d.y)){
        ctx.drawImage(img,0,WH-ST,TW,TH+ST,sx-HW,sy-ST,TW,TH+ST);
        diamond(ctx,sx-HW,sy-ST,TW,TH);ctx.fillStyle=G.theme.top;ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.stroke();
        ctx.globalAlpha=.1;ctx.drawImage(img,sx-HW,sy-WH);ctx.globalAlpha=1;
        continue;}
      let a=1;if(d.k>pk+.3&&Math.abs(sx-P.sx)<TW*.9&&sy-WH<P.sy&&sy+TH>P.sy-52)a=.32;
      ctx.globalAlpha=a;ctx.drawImage(img,sx-HW,sy-WH);ctx.globalAlpha=1;
      if(d.o===2)drawFlame(ctx,sx-HW/2,sy+HH/2-WH/2+HH-12,time,d.x*7+d.y);
      if(d.o===3)drawFlame(ctx,sx+HW/2,sy+HH/2-WH/2+HH-12,time,d.x*5+d.y*3);}
    else if(d.kind==='obj'){const sx=isoX(d.x+.5,d.y+.5),sy=isoY(d.x+.5,d.y+.5);if(d.o===10)drawBarrel(ctx,sx,sy);else drawChest(ctx,sx,sy,d.o===12)}
    else if(d.kind==='item'&&d.it.type==='gear'){const it=d.it,g=it.item,sx=isoX(it.x,it.y),sy=isoY(it.x,it.y),b=Math.sin(it.bob)*2;
      if(g.rar>=1){const gr=ctx.createRadialGradient(sx,sy-8,0,sx,sy-8,18);gr.addColorStop(0,RCOL[g.rar]+'88');gr.addColorStop(1,RCOL[g.rar]+'00');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(sx,sy-8,18,0,7);ctx.fill()}
      if(g.rar>=2){ctx.fillStyle=RCOL[g.rar]+'40';ctx.fillRect(sx-2,sy-70,4,62)}
      shadow(ctx,sx,sy,8);ctx.save();ctx.translate(sx-12,sy-22+b);drawItemIcon(ctx,g,24);ctx.restore()}
    else if(d.kind==='item'){const it=d.it,sx=isoX(it.x,it.y),sy=isoY(it.x,it.y),b=Math.sin(it.bob)*2;shadow(ctx,sx,sy,6);
      if(it.type==='gold'){ctx.fillStyle='#a8822e';ctx.beginPath();ctx.ellipse(sx,sy-4+b,6,3,0,0,7);ctx.fill();ctx.fillStyle='#e9c66a';ctx.beginPath();ctx.ellipse(sx,sy-6+b,6,3,0,0,7);ctx.fill();ctx.fillStyle='#fff6d0';ctx.fillRect(sx-2,sy-7+b,2,1)}
      else{ctx.fillStyle='#d9d2c4';ctx.fillRect(sx-1.5,sy-17+b,3,4);ctx.fillStyle='#b8283a';ctx.beginPath();ctx.arc(sx,sy-9+b,5,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(sx-3,sy-11+b,2,2)}}
    else if(d.kind==='corpse')drawCorpse(ctx,d.c,time);
    else if(d.kind==='enemy'&&d.e.t.boss)d.e.t.draw(ctx,d.e,time);
    else if(d.kind==='enemy'){const e=d.e;e.t.draw(ctx,e,time);
      if(e.hp<e.maxhp){const w=26,h=4,bx=e.sx-w/2,by=e.sy-(e.t===ETYPES.bruto?62:e.t===ETYPES.rata?22:50);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(bx-1,by-1,w+2,h+2);ctx.fillStyle='#c4382d';ctx.fillRect(bx,by,w*e.hp/e.maxhp,h)}
      if(e.stun>0){const hy=e.sy-(e.t===ETYPES.bruto?66:e.t===ETYPES.rata?26:54);ctx.fillStyle='#ffe08a';
        for(let k=0;k<3;k++){const a=time*6+k*2.09;ctx.beginPath();ctx.arc(e.sx+Math.cos(a)*9,hy+Math.sin(a)*3,2,0,7);ctx.fill()}}
      if(e.wind>0){ctx.fillStyle='rgba(255,90,60,.9)';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('!',e.sx,e.sy-(e.t===ETYPES.bruto?68:56))}}
    else if(d.kind==='player')drawHero(ctx,P,time);
    else if(d.kind==='pproj'){const p=d.p,sx=isoX(p.x,p.y),sy=isoY(p.x,p.y)-20;
      if(p.kind==='arrow'){let dx=(p.vx-p.vy)*HW,dy=(p.vx+p.vy)*HH;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
        ctx.strokeStyle='#c9a26a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx-dx*14,sy-dy*14);ctx.lineTo(sx+dx*6,sy+dy*6);ctx.stroke();
        ctx.fillStyle='#e6ecf2';ctx.beginPath();ctx.moveTo(sx+dx*10,sy+dy*10);ctx.lineTo(sx+dx*4-dy*3,sy+dy*4+dx*3);ctx.lineTo(sx+dx*4+dy*3,sy+dy*4-dx*3);ctx.fill();
        ctx.strokeStyle='#e9dfc8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx-dx*14-dy*3,sy-dy*14+dx*3);ctx.lineTo(sx-dx*11,sy-dy*11);ctx.lineTo(sx-dx*14+dy*3,sy-dy*14-dx*3);ctx.stroke()}
      else{const g=ctx.createRadialGradient(sx,sy,0,sx,sy,11);g.addColorStop(0,'rgba(255,245,210,1)');g.addColorStop(.4,'rgba(255,150,50,.9)');g.addColorStop(1,'rgba(255,70,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,11,0,7);ctx.fill()}}
    else if(d.kind==='proj'&&d.p.kind==='fireball')drawFireball(ctx,d.p);
    else if(d.kind==='proj'){const sx=isoX(d.p.x,d.p.y),sy=isoY(d.p.x,d.p.y)-22;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,9);g.addColorStop(0,'rgba(240,210,255,1)');g.addColorStop(.5,'rgba(180,90,255,.8)');g.addColorStop(1,'rgba(120,40,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,9,0,7);ctx.fill()}
  }
  if(G.fx.length)drawBossFx(ctx,time);
  for(const p of G.parts){const sx=isoX(p.x,p.y),sy=isoY(p.x,p.y)-p.z;ctx.globalAlpha=Math.max(0,1-p.t/p.life);ctx.fillStyle=p.color;ctx.fillRect(sx-p.size/2,sy-p.size/2,p.size,p.size)}
  ctx.globalAlpha=1;
  // iluminación
  if(show.light){
    const lw=lightCv.width,lh=lightCv.height,s=.5;
    lctx.globalCompositeOperation='source-over';lctx.clearRect(0,0,lw,lh);lctx.fillStyle=`rgba(${G.theme.fog},.93)`;lctx.fillRect(0,0,lw,lh);
    lctx.globalCompositeOperation='destination-out';
    const hole=(x,y,r,a)=>{const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.55,`rgba(0,0,0,${a*.7})`);g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.beginPath();lctx.arc(x,y,r,0,7);lctx.fill()};
    const toL=(wx,wy)=>[(ox+wx*zoom)*s,(oy+wy*zoom)*s];
    let [lx,ly]=toL(P.sx,P.sy-20);hole(lx,ly,260*zoom*s,1);
    const glows=[];
    for(const t of G.torches){if(Math.abs(t.x-P.x)>rad||Math.abs(t.y-P.y)>rad)continue;const sx=isoX(t.x,t.y)+(t.face==='L'?-HW/2:HW/2),sy=isoY(t.x,t.y)+HH/2-WH/2+HH-16;
      const f=1+.08*Math.sin(time*9+t.x)+.05*Math.sin(time*23+t.y);[lx,ly]=toL(sx,sy);hole(lx,ly,150*zoom*s*f,.95);glows.push([sx,sy,f])}
    for(const p of G.proj){[lx,ly]=toL(isoX(p.x,p.y),isoY(p.x,p.y)-22);hole(lx,ly,(p.kind==='fireball'?90:60)*zoom*s,.85)}
    for(const f of G.fx){[lx,ly]=toL(isoX(f.x,f.y),isoY(f.x,f.y)-10);hole(lx,ly,(f.k==='boom'?130:70)*zoom*s,.9)}
    for(const e of G.enemies)if(e.t.boss){[lx,ly]=toL(e.sx,e.sy-50);hole(lx,ly,(e.mode==='breath'?260:190)*zoom*s,.8)}
    for(const k of G.corpses){[lx,ly]=toL(isoX(k.x,k.y),isoY(k.x,k.y)-20);hole(lx,ly,120*zoom*s,.6)}
    for(const p of G.pproj)if(p.kind==='fire'){[lx,ly]=toL(isoX(p.x,p.y),isoY(p.x,p.y)-20);hole(lx,ly,90*zoom*s,.9)}
    {const st=G.stairs;[lx,ly]=toL(isoX(st.x+.5,st.y+.5),isoY(st.x+.5,st.y+.5));hole(lx,ly,70*zoom*s,.6)}
    ctx.globalCompositeOperation='lighter';
    for(const[sx,sy,f]of glows){const g=ctx.createRadialGradient(sx,sy,0,sx,sy,120*f);g.addColorStop(0,`rgba(${G.theme.light},.16)`);g.addColorStop(1,`rgba(${G.theme.light},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,120*f,0,7);ctx.fill()}
    ctx.globalCompositeOperation='source-over';
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.drawImage(lightCv,0,0,vw,vh);
    ctx.setTransform(dpr*zoom,0,0,dpr*zoom,dpr*ox,dpr*oy);
  }
  // textos flotantes
  ctx.textAlign='center';
  for(const t of G.texts){const sx=isoX(t.x,t.y),sy=isoY(t.x,t.y)-t.z;ctx.globalAlpha=Math.max(0,1-t.t);ctx.font=`700 ${t.size}px 'Alegreya Sans', sans-serif`;ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(t.txt,sx,sy);ctx.fillStyle=t.color;ctx.fillText(t.txt,sx,sy)}
  ctx.globalAlpha=1;
  // viñeta
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const v=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.35,vw/2,vh/2,Math.max(vw,vh)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,vw,vh);
  if(P.hp/P.maxhp<.3&&state==='play'){ctx.fillStyle=`rgba(160,20,20,${.12+.08*Math.sin(time*5)})`;ctx.fillRect(0,0,vw,vh)}
  drawBossBar();
  drawMini();
}
function drawMini(){
  const w=mini.width,h=mini.height;mctx.clearRect(0,0,w,h);
  const big=mini.classList.contains('big');
  const s=big?w/(MW+MH)*1.9:9;
  const cx=big?w/2:w/2-(P.x-P.y)*s*.5, cy=big?(h-(MW+MH)*s*.25)/2:h/2-(P.x+P.y)*s*.25;
  const P2=(x,y)=>[cx+(x-y)*s*.5, cy+(x+y)*s*.25];
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(!G.seen[i])continue;const[px,py]=P2(x,y);
    mctx.fillStyle=G.floor[i]===255?'#9a90a6':G.obj[i]===13?'#e58a3c':'#5b5366';
    mctx.fillRect(px,py,Math.ceil(s*.6),Math.ceil(s*.35))}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(G.seen[i]&&G.obj[i]&&G.obj[i]<10){const[px,py]=P2(x,y);mctx.fillStyle='#b3a9c0';mctx.fillRect(px,py,Math.ceil(s*.6),Math.ceil(s*.35))}}
  const[px,py]=P2(P.x,P.y);mctx.fillStyle='#ffd36a';mctx.beginPath();mctx.arc(px,py,3.5,0,7);mctx.fill();
}
