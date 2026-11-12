// ---------- Generación del tileset ----------
function diamond(c,x,y,w,h){c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w,y+h/2);c.lineTo(x+w/2,y+h);c.lineTo(x,y+h/2);c.closePath()}
function poly(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath()}
function makeFloor(th,v){
  const t=document.createElement('canvas'); t.width=TW; t.height=TH; const c=t.getContext('2d');
  const r=mulberry32(900+v*131);
  diamond(c,0,0,TW,TH); c.save(); c.clip();
  c.fillStyle=th.mortar; c.fillRect(0,0,TW,TH);
  const L=(a,b)=>[(a-b)*HW+HW,(a+b)*HH];
  const n = v===3?1:2;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    let pts=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([a,b])=>L(a/n,b/n));
    const cx=pts.reduce((s,p)=>s+p[0],0)/4, cy=pts.reduce((s,p)=>s+p[1],0)/4;
    pts=pts.map(([x,y])=>[cx+(x-cx)*0.86, cy+(y-cy)*0.82]);
    poly(c,pts); c.fillStyle=th.floor[Math.floor(r()*3)]; c.fill();
    const g=c.createLinearGradient(0,cy-10,0,cy+10); g.addColorStop(0,'rgba(255,255,255,.07)'); g.addColorStop(1,'rgba(0,0,0,.10)');
    c.fillStyle=g; c.fill();
  }
  for(let k=0;k<70;k++){c.fillStyle=r()<.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.12)';c.fillRect(Math.floor(r()*TW),Math.floor(r()*TH),1,1)}
  if(v===1){c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1;c.beginPath();let x=14+r()*10,y=10+r()*4;c.moveTo(x,y);for(let k=0;k<5;k++){x+=5+r()*5;y+=(r()-.4)*6;c.lineTo(x,y)}c.stroke()}
  if(v===2){for(let k=0;k<7;k++){c.fillStyle=th.moss;c.globalAlpha=.35+r()*.3;c.beginPath();c.ellipse(10+r()*44,8+r()*16,3+r()*6,2+r()*3,0,0,7);c.fill()}c.globalAlpha=1}
  if(v===4){c.fillStyle=th.mortar;c.globalAlpha=.55;c.fillRect(0,0,TW,TH);c.globalAlpha=1;for(let k=0;k<16;k++){c.fillStyle=th.floor[Math.floor(r()*3)];c.beginPath();c.ellipse(8+r()*48,6+r()*20,1.5+r()*3,1+r()*2,0,0,7);c.fill()}}
  if(v===5){diamond(c,14,7,36,18);c.fillStyle='#08070a';c.fill();c.strokeStyle=th.brick;c.lineWidth=2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(14+k*9,7+k*4.5+0);c.lineTo(14+k*9-9+18,7+k*4.5+9);c.stroke()}diamond(c,14,7,36,18);c.strokeStyle=th.top;c.lineWidth=1.5;c.stroke()}
  c.restore(); return t;
}
function makeWall(th,v){
  const t=document.createElement('canvas'); t.width=TW; t.height=TH+WH; const c=t.getContext('2d');
  const r=mulberry32(300+v*17);
  poly(c,[[0,HH],[HW,TH],[HW,TH+WH],[0,HH+WH]]); c.fillStyle=th.left; c.fill();
  poly(c,[[HW,TH],[TW,HH],[TW,HH+WH],[HW,TH+WH]]); c.fillStyle=th.right; c.fill();
  c.strokeStyle=th.brick; c.lineWidth=1;
  for(let k=1;k<4;k++){const o=k*WH/4;
    c.beginPath();c.moveTo(0,HH+o);c.lineTo(HW,TH+o);c.lineTo(TW,HH+o);c.stroke();}
  for(let k=0;k<4;k++){const o=k*WH/4, ts=k%2?[.25,.75]:[.5];
    for(const s of ts){ c.beginPath();c.moveTo(s*HW,HH+s*HH+o);c.lineTo(s*HW,HH+s*HH+o+WH/4);c.stroke();
      c.beginPath();c.moveTo(HW+s*HW,TH-s*HH+o);c.lineTo(HW+s*HW,TH-s*HH+o+WH/4);c.stroke(); }}
  const sh=c.createLinearGradient(0,HH,0,TH+WH); sh.addColorStop(0,'rgba(255,255,255,.05)'); sh.addColorStop(1,'rgba(0,0,0,.35)');
  poly(c,[[0,HH],[HW,TH],[TW,HH],[TW,HH+WH],[HW,TH+WH],[0,HH+WH]]); c.fillStyle=sh; c.fill();
  diamond(c,0,0,TW,TH); c.fillStyle=th.top; c.fill(); c.strokeStyle='rgba(255,255,255,.10)'; c.stroke();
  for(let k=0;k<30;k++){c.fillStyle=r()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.12)';const x=4+r()*56,y=HH+r()*WH;c.fillRect(x,y+(x<HW?x/2:(TW-x)/2),1,1)}
  if(v===4){c.strokeStyle='rgba(0,0,0,.6)';c.beginPath();c.moveTo(10,HH+12);c.lineTo(15,HH+22);c.lineTo(12,HH+31);c.lineTo(18,HH+40);c.stroke()}
  if(v===2){c.fillStyle='#21180f';c.fillRect(HW/2-2,HH+HH/2+WH/2-6,4,10);c.fillRect(HW/2-4,HH+HH/2+WH/2-7,8,3)}
  if(v===3){c.fillStyle='#21180f';c.fillRect(HW+HW/2-2,HH+HH/2+WH/2-6,4,10);c.fillRect(HW+HW/2-4,HH+HH/2+WH/2-7,8,3)}
  return t;
}
function buildTileset(th){return {floor:[0,1,2,3,4,5].map(v=>makeFloor(th,v)), wall:[null,1,2,3,4].map(v=>v&&makeWall(th,v))}}
