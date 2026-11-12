// ---------- Generación de nivel ----------
function genLevel(d,s){
  rng=mulberry32(s);
  const N=MW*MH, open=new Uint8Array(N), floor=new Uint8Array(N).fill(255), obj=new Uint8Array(N), decor=new Uint8Array(N), col=new Uint8Array(N).fill(1), seen=new Uint8Array(N);
  const rooms=[], target=7+Math.min(d,5);
  for(let a=0;a<500&&rooms.length<target;a++){
    const w=RI(5,10),h=RI(5,10),x=RI(2,MW-w-3),y=RI(2,MH-h-3);
    if(rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;
    rooms.push({x,y,w,h,cx:Math.floor(x+w/2),cy:Math.floor(y+h/2)});
  }
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)open[idx(x,y)]=2;
  const carve=(a,b)=>{
    const y0=a.cy,x1=b.cx;
    for(let x=Math.min(a.cx,x1);x<=Math.max(a.cx,x1)+1;x++)for(const yy of[y0,y0+1])if(!open[idx(x,yy)])open[idx(x,yy)]=3;
    for(let y=Math.min(y0,b.cy);y<=Math.max(y0,b.cy)+1;y++)for(const xx of[x1,x1+1])if(!open[idx(xx,y)])open[idx(xx,y)]=3;
  };
  const conn=[rooms[0]], rest=rooms.slice(1);
  while(rest.length){let best=null,bd=1e9;for(const a of conn)for(const b of rest){const dd=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(dd<bd){bd=dd;best=[a,b]}}
    carve(best[0],best[1]);conn.push(best[1]);rest.splice(rest.indexOf(best[1]),1)}
  for(let k=0;k<2;k++){const a=rooms[RI(0,rooms.length-1)],b=rooms[RI(0,rooms.length-1)];if(a!==b)carve(a,b)}
  // Capa 0: suelo
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(!open[i])continue;col[i]=0;
    const r=R(); floor[i]= open[i]===3 ? (r<.5?4:0) : (r<.62?0:r<.76?1:r<.88?2:r<.97?4:5);}
  for(const rm of rooms)if(R()<.45)for(let y=rm.cy-1;y<=rm.cy+1;y++)for(let x=rm.cx-1;x<=rm.cx+1;x++)floor[idx(x,y)]=3;
  // Capa 1: muros
  const torches=[];
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=idx(x,y);if(open[i])continue;
    let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(open[idx(x+dx,y+dy)])near=true;
    if(!near)continue;
    let v=1;const r=R();
    if(open[idx(x,y+1)]&&r<.11){v=2;torches.push({x,y,face:'L'})}
    else if(open[idx(x+1,y)]&&r<.11){v=3;torches.push({x,y,face:'R'})}
    else if(r<.22)v=4;
    obj[i]=v;
  }
  const start=rooms[0];
  let far=rooms[1]||rooms[0],fd=-1;for(const r of rooms){const dd=Math.hypot(r.cx-start.cx,r.cy-start.cy);if(dd>fd){fd=dd;far=r}}
  obj[idx(far.cx,far.cy)]=13;
  const stairs={x:far.cx,y:far.cy};
  // Capa 2 y objetos
  for(const rm of rooms){
    for(let y=rm.y;y<rm.y+rm.h;y++)for(let x=rm.x;x<rm.x+rm.w;x++){const r=R();const i=idx(x,y);if(obj[i])continue;if(r<.035)decor[i]=1;else if(r<.06)decor[i]=2}
    if(rm===start)continue;
    const nb=RI(0,3);
    for(let k=0,placed=0;k<20&&placed<nb;k++){const edge=RI(0,3);let x,y,ox,oy;
      if(edge===0){x=rm.x;y=RI(rm.y,rm.y+rm.h-1);ox=x-1;oy=y}else if(edge===1){x=rm.x+rm.w-1;y=RI(rm.y,rm.y+rm.h-1);ox=x+1;oy=y}
      else if(edge===2){y=rm.y;x=RI(rm.x,rm.x+rm.w-1);ox=x;oy=y-1}else{y=rm.y+rm.h-1;x=RI(rm.x,rm.x+rm.w-1);ox=x;oy=y+1}
      const i=idx(x,y);if(open[idx(ox,oy)]||obj[i])continue;obj[i]=10;col[i]=1;decor[i]=0;placed++;}
    if(rm!==far&&R()<.5){const x=RI(rm.x+1,rm.x+rm.w-2),y=RI(rm.y+1,rm.y+rm.h-2),i=idx(x,y);if(!obj[i]&&!(x===rm.cx&&y===rm.cy)){obj[i]=11;col[i]=1;decor[i]=0}}
  }
  const th=THEMES[(d-1)%THEMES.length];
  const L={d,theme:th,tiles:buildTileset(th),open,floor,obj,decor,col,seen,rooms,stairs,torches,start,enemies:[],items:[],proj:[],pproj:[],parts:[],texts:[]};
  // Enemigos
  for(const rm of rooms){if(rm===start)continue;const n=RI(1,2)+Math.floor(d/2);
    for(let k=0;k<n;k++){const x=RI(rm.x,rm.x+rm.w-1)+.5,y=RI(rm.y,rm.y+rm.h-1)+.5;if(col[idx(Math.floor(x),Math.floor(y))])continue;
      const tk=pickType(d),T=ETYPES[tk],sc=1+.25*(d-1);
      L.enemies.push({t:T,x,y,r:T.r,hp:Math.round(T.hp*sc),maxhp:Math.round(T.hp*sc),dmg:Math.round(T.dmg*(1+.18*(d-1))),face:R()*6.28,walk:0,cd:R(),wind:0,flash:0,kx:0,ky:0,aggro:false,wander:0,wx:0,wy:0,sx:0,sy:0})}}
  buildCache(L);
  return L;
}

function buildCache(L){
  const w=(MW+MH)*HW, h=(MW+MH)*HH+TH;
  if(!L.cache){L.cache=document.createElement('canvas');L.cache.width=w;L.cache.height=h}
  const c=L.cache.getContext('2d'); c.clearRect(0,0,w,h); L.ox=MH*HW;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y),f=L.floor[i];if(f===255)continue;
    const sx=L.ox+isoX(x,y), sy=isoY(x,y);
    if(show.floor)c.drawImage(L.tiles.floor[f],sx-HW,sy);
    if(show.decor&&L.decor[i])drawDecor(c,L.decor[i],sx,sy+HH);}
}
