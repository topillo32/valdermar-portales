// Icono de objeto (cuadro de 40×40) — también se usa en el suelo
function drawItemIcon(c,it,s){
  const T=ITYPES[it.type],col=RCOL[it.rar];c.save();c.lineCap='round';c.lineJoin='round';
  const L=(w,st,pts)=>{c.strokeStyle=st;c.lineWidth=w;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.stroke()};
  c.translate(s/2,s/2);c.scale(s/40,s/40);
  switch(it.type){
    case 'espada':L(3,'#dfe6ee',[-11,11,12,-12]);L(4,'#8a6a2e',[-14,6,-6,14]);L(3,'#5a3b1e',[-11,11,-15,15]);break;
    case 'hacha':L(3,'#7a5530',[-12,13,10,-11]);c.fillStyle='#c9ced6';c.beginPath();c.moveTo(4,-14);c.quadraticCurveTo(16,-10,14,2);c.lineTo(4,-6);c.closePath();c.fill();break;
    case 'dagas':L(2.5,'#e6ecf2',[-12,8,4,-10]);L(2.5,'#e6ecf2',[12,8,-4,-10]);L(3,'#6b5a3a',[-14,10,-10,6]);L(3,'#6b5a3a',[14,10,10,6]);break;
    case 'estoque':L(2,'#e6ecf2',[-8,8,14,-14]);c.strokeStyle='#d8b25c';c.lineWidth=2;c.beginPath();c.arc(-9,9,5,0,7);c.stroke();break;
    case 'arco':c.strokeStyle='#7a5530';c.lineWidth=3;c.beginPath();c.arc(-6,0,15,-1.2,1.2);c.stroke();L(1,'#e9dfc8',[-6+15*Math.cos(-1.2),15*Math.sin(-1.2),-6+15*Math.cos(1.2),15*Math.sin(1.2)]);break;
    case 'ballesta':L(4,'#6b4a2a',[-12,10,10,-8]);c.strokeStyle='#9aa1aa';c.lineWidth=3;c.beginPath();c.arc(4,-2,11,-2.6,.4);c.stroke();break;
    case 'baston':L(3,'#5b3d22',[-10,14,8,-10]);c.fillStyle='#ff9a3c';c.beginPath();c.arc(10,-12,5,0,7);c.fill();break;
    case 'varita':L(3,'#d9d2c4',[-10,10,8,-8]);c.fillStyle='#8fb3ff';c.beginPath();c.arc(10,-10,3.5,0,7);c.fill();break;
    case 'martillo':L(3,'#6b4a2a',[-12,13,6,-5]);c.save();c.translate(8,-8);c.rotate(-.78);c.fillStyle='#9aa1aa';c.fillRect(-9,-5,18,10);c.restore();break;
    case 'maza':L(3,'#6b4a2a',[-12,13,4,-3]);c.fillStyle='#9aa1aa';c.beginPath();c.arc(7,-7,7,0,7);c.fill();for(let k=0;k<6;k++){const a=k*1.05;L(2,'#c9ced6',[7+Math.cos(a)*7,-7+Math.sin(a)*7,7+Math.cos(a)*10,-7+Math.sin(a)*10])}break;
    case 'armadura':c.fillStyle='#8f969f';c.beginPath();c.moveTo(-13,-12);c.lineTo(-5,-14);c.lineTo(0,-10);c.lineTo(5,-14);c.lineTo(13,-12);c.lineTo(11,13);c.lineTo(-11,13);c.closePath();c.fill();c.fillStyle='#6b7178';c.fillRect(-10,0,20,3);break;
    case 'casco':c.fillStyle='#8f969f';c.beginPath();c.arc(0,4,13,Math.PI,0);c.lineTo(13,10);c.lineTo(-13,10);c.closePath();c.fill();c.fillStyle='#2a2630';c.fillRect(-8,2,16,3);break;
    case 'anillo':c.strokeStyle='#d8b25c';c.lineWidth=4;c.beginPath();c.arc(0,4,10,0,7);c.stroke();c.fillStyle=col;c.beginPath();c.arc(0,-7,4.5,0,7);c.fill();break;
  }
  c.restore();
}
