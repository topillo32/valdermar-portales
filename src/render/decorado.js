// ---------- Dibujo de objetos y personajes (procedural) ----------
function shadow(c,x,y,rx){c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.ellipse(x,y,rx,rx*.5,0,0,7);c.fill()}
function drawDecor(c,id,x,y){
  if(id===1){c.strokeStyle='#d9cfb6';c.lineWidth=2;c.lineCap='round';
    c.beginPath();c.moveTo(x-10,y+2);c.lineTo(x-1,y-2);c.moveTo(x+3,y+4);c.lineTo(x+11,y+1);c.moveTo(x-4,y+6);c.lineTo(x+2,y+7);c.stroke();
    c.fillStyle='#e4dbc4';c.beginPath();c.arc(x+5,y-3,4,0,7);c.fill();c.fillStyle='#2a2420';c.fillRect(x+3,y-4,1.5,1.5);c.fillRect(x+6,y-4,1.5,1.5)}
  if(id===2){c.fillStyle='rgba(18,26,40,.6)';c.beginPath();c.ellipse(x,y,15,6,0,0,7);c.fill();c.fillStyle='rgba(180,200,230,.15)';c.beginPath();c.ellipse(x-4,y-1,6,2,0,0,7);c.fill()}
}
function drawBarrel(c,x,y){
  shadow(c,x,y,13);
  c.fillStyle='#5f3d20';c.fillRect(x-11,y-26,22,24);
  c.beginPath();c.ellipse(x,y-2,11,5,0,0,Math.PI);c.fill();
  const g=c.createLinearGradient(x-11,0,x+11,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.4,'rgba(255,220,170,.10)');g.addColorStop(1,'rgba(0,0,0,.45)');
  c.fillStyle=g;c.fillRect(x-11,y-26,22,24);
  c.strokeStyle='#2b1f14';c.lineWidth=2;for(const yy of [y-8,y-20]){c.beginPath();c.ellipse(x,yy,11,5,0,0,Math.PI);c.stroke()}
  c.fillStyle='#87592e';c.beginPath();c.ellipse(x,y-26,11,5,0,0,7);c.fill();c.strokeStyle='#2b1f14';c.stroke();
}
function drawChest(c,x,y,open){
  shadow(c,x,y,16);
  c.fillStyle='#4f321a';c.fillRect(x-14,y-16,28,14);
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,y-16,14,14);
  if(open){c.fillStyle='#120b06';c.fillRect(x-13,y-19,26,4);c.fillStyle='#6a4422';c.fillRect(x-14,y-31,28,12);c.fillStyle='#d8b25c';c.fillRect(x-14,y-23,28,2);
    c.fillStyle='rgba(255,215,120,.6)';c.fillRect(x-6,y-18,3,2);c.fillRect(x+3,y-18,2,2)}
  else{c.fillStyle='#734a24';c.beginPath();c.moveTo(x-14,y-16);c.quadraticCurveTo(x,y-28,x+14,y-16);c.closePath();c.fill();
    c.fillStyle='#d8b25c';c.fillRect(x-14,y-17,28,2);c.fillRect(x-2,y-15,4,6);c.fillStyle='#3a2a12';c.fillRect(x-1,y-13,2,2)}
  c.fillStyle='#d8b25c';c.fillRect(x-14,y-16,2,14);c.fillRect(x+12,y-16,2,14);
}
function drawStairs(c,x,y,t){
  for(let k=0;k<4;k++){const s=1-k*.2;diamond(c,x-HW*.85*s,y-HH*.85*s+k*3,TW*.85*s,TH*.85*s);c.fillStyle=k===0?'#16121a':`rgba(${60-k*15},${50-k*12},${45-k*10},1)`;c.fill()}
  diamond(c,x-HW*.25,y-HH*.25+12,TW*.25,TH*.25);c.fillStyle='#000';c.fill();
  c.fillStyle=`rgba(229,138,60,${.12+.06*Math.sin(t*3)})`;c.beginPath();c.ellipse(x,y+4,22,10,0,0,7);c.fill();
}
function drawFlame(c,x,y,t,seed){
  const f=Math.sin(t*13+seed)*1.2+Math.sin(t*7.3+seed*2);
  const g=c.createRadialGradient(x,y-4,0,x,y-4,9+f);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(.4,'rgba(255,160,60,.9)');g.addColorStop(1,'rgba(255,90,20,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(x,y-4-f*.5,5+f*.3,9+f,0,0,7);c.fill();
}
function screenFacing(a){const fx=Math.cos(a),fy=Math.sin(a);const sx=(fx-fy)*HW,sy=(fx+fy)*HH;const l=Math.hypot(sx,sy)||1;return [sx/l,sy/l]}
