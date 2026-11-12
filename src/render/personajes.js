// Sprites por clase: atlas, metadatos, qué juego de animaciones usar y qué animaciones vienen mirando a la derecha.
const HERO_SPR={
  guerrero:{src:'guerrero.png',meta:WARRIOR,kit:e=>(e.eq&&e.eq.arma&&e.eq.arma.type==='hacha')?'hacha':'espada',rightFacing:{}},
  arquero:{src:'arquero.png',meta:ARCHER,kit:()=>'arco',rightFacing:{attack:true}},
  maga:{src:'maga.png',meta:MAGE,kit:()=>'baston',rightFacing:{idle:true}},
  paladin:{src:'paladin.png',meta:PALADIN,kit:()=>'paladin',rightFacing:{}},
  picara:{src:'picara.png',meta:ROGUE,kit:()=>'dagas',rightFacing:{}},
};
for(const k in HERO_SPR){const s=HERO_SPR[k];s.img=new Image();s.ok=false;
  s.img.onload=()=>{s.ok=true;if(typeof buildClassPicker==='function'&&$('classes')){buildClassPicker();selectClass(selCls)}};
  s.img.src=s.src}
const SPR_SCALE=.74;
function drawSpriteHero(c,e,t){
  const S0=HERO_SPR[e.cls];if(!S0||!S0.ok)return false;
  const kit=S0.meta[S0.kit(e)];
  const [fx,fy]=screenFacing(e.face),back=fy<-0.3;
  let fr,anim;
  if(e.deadAt!=null){anim='death';const a=kit.death;fr=a[Math.min(a.length-1,Math.floor((t-e.deadAt)/.22))]}
  else if(e.swing>0){anim='attack';const a=kit.attack,p=1-e.swing/(e.swingT||.22);fr=a[Math.min(a.length-1,Math.floor(p*a.length))]}
  else if(e.hurtT>0){anim='hurt';const a=kit.hurt;fr=a[Math.min(a.length-1,Math.floor((1-e.hurtT/.3)*a.length))]}
  else if(e.moving){anim=back?'back':'run';const a=kit[anim];fr=a[Math.floor(e.walk*.9)%a.length]}
  else{anim=back?'backIdle':'idle';const a=kit[anim];fr=a[Math.floor(t*1.6)%a.length]}
  // por defecto los sprites miran a la izquierda; se voltean para mirar a la derecha
  const flip=S0.rightFacing[anim]?fx<=0:fx>0;
  const [sx,sy,w,h,ax,ay]=fr,S=SPR_SCALE;
  c.save();
  if(e.inv>0&&e.deadAt==null&&Math.floor(t*20)%2===0)c.globalAlpha=.55;
  c.translate(e.sx,e.sy);if(flip)c.scale(-1,1);
  c.drawImage(S0.img,sx,sy,w,h,-ax*S,-ay*S,w*S,h*S);
  c.restore();
  return true;
}

function drawHero(c,e,t){
  const C=CLASSES[e.cls]||CLASSES.guerrero;
  if(drawSpriteHero(c,e,t))return;
  const x=e.sx,y=e.sy,[fx,fy]=screenFacing(e.face),side=fx>=0?1:-1,back=fy<-0.3;
  const st=Math.sin(e.walk)*3, base=Math.atan2(fy,fx), sw=e.swing>0?1-e.swing/(e.swingT||C.swing):-1;
  shadow(c,x,y,13);
  const flash=e.inv>0&&Math.floor(t*20)%2===0;
  const line=(col,w,x0,y0,x1,y1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke()};
  const trail=(rx,ry,a0,a1,alpha,w)=>{c.strokeStyle=`rgba(255,240,215,${alpha})`;c.lineWidth=w;c.beginPath();c.ellipse(x,y-18,rx,ry,0,a0,a1);c.stroke()};
  const weapon=()=>{
    switch(C.weapon){
      case 'sword':
        if(sw>=0){const a=base-1.3+sw*2.6;trail(34,22,base-1.3,a,.55*(1-sw),10);line('#dfe6ee',3,x+Math.cos(a)*8,y-20+Math.sin(a)*5,x+Math.cos(a)*34,y-20+Math.sin(a)*22)}
        else{line('#cfd6de',3,x+side*11,y-18,x+side*17,y-42);c.fillStyle='#8a6a2e';c.fillRect(x+side*11-3,y-21,6,3)}
        break;
      case 'hammer':{
        const a=sw>=0?base-1.7+sw*3.4:null;
        if(sw>=0){trail(38,25,base-1.7,a,.5*(1-sw),12)}
        const hx=sw>=0?x+Math.cos(a)*32:x+side*18, hy=sw>=0?y-20+Math.sin(a)*21:y-44, bx=sw>=0?x+Math.cos(a)*8:x+side*11, by=sw>=0?y-20+Math.sin(a)*5:y-16;
        line('#6b4a2a',3,bx,by,hx,hy);c.save();c.translate(hx,hy);c.rotate(Math.atan2(hy-by,hx-bx));c.fillStyle='#9aa1aa';c.fillRect(-4,-7,9,14);c.fillStyle='#d8b25c';c.fillRect(-4,-1,9,2);c.restore();
        break;}
      case 'daggers':
        if(sw>=0){const a=base-.9+sw*1.8;trail(24,15,base-.9,a,.6*(1-sw),6);
          line('#e6ecf2',2,x+Math.cos(a)*6,y-19+Math.sin(a)*4,x+Math.cos(a)*24,y-19+Math.sin(a)*15);
          const b=base+.9-sw*1.8;line('#e6ecf2',2,x+Math.cos(b)*6,y-17+Math.sin(b)*4,x+Math.cos(b)*20,y-17+Math.sin(b)*12)}
        else{line('#d8dee6',2,x+side*10,y-16,x+side*14,y-27);line('#d8dee6',2,x-side*10,y-16,x-side*13,y-26)}
        break;
      case 'bow':{
        const bx=x+fx*12,by=y-22+fy*7,pull=sw>=0?(1-sw)*7:0,ex=Math.cos(base+1.2)*14,ey=Math.sin(base+1.2)*14,gx=Math.cos(base-1.2)*14,gy=Math.sin(base-1.2)*14;
        c.strokeStyle='#7a5530';c.lineWidth=3;c.beginPath();c.moveTo(bx+gx-fx*6,by+gy-fy*6);c.quadraticCurveTo(bx+fx*8,by+fy*8,bx+ex-fx*6,by+ey-fy*6);c.stroke();
        c.strokeStyle='rgba(235,225,200,.8)';c.lineWidth=1;c.beginPath();c.moveTo(bx+gx-fx*6,by+gy-fy*6);c.lineTo(bx-fx*(4+pull),by-fy*(4+pull));c.lineTo(bx+ex-fx*6,by+ey-fy*6);c.stroke();
        // carcaj
        c.fillStyle='#5a3b1e';c.fillRect(x-side*8-2,y-36,5,16);line('#d9d2c4',1,x-side*8,y-36,x-side*8,y-40);line('#d9d2c4',1,x-side*8+2,y-36,x-side*8+3,y-40);
        break;}
      case 'staff':{
        const lift=sw>=0?Math.sin(sw*Math.PI)*6:0,sx=x+side*13+fx*(sw>=0?6:0),top=y-48-lift;
        line('#5b3d22',3,x+side*12,y-4,sx,top);
        const r=sw>=0?6+4*(1-sw):4.5+Math.sin(t*4)*.6;const g=c.createRadialGradient(sx,top,0,sx,top,r*2.2);g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(.35,'rgba(255,150,60,.9)');g.addColorStop(1,'rgba(255,90,20,0)');
        c.fillStyle=g;c.beginPath();c.arc(sx,top,r*2.2,0,7);c.fill();
        break;}
    }};
  const shield=()=>{if(C.weapon!=='sword'&&C.weapon!=='hammer')return;
    c.fillStyle=C.weapon==='hammer'?'#e3ddcc':'#5c3f22';c.beginPath();c.ellipse(x-side*12,y-22,6,10,0,0,7);c.fill();c.strokeStyle='#c9a45a';c.lineWidth=2;c.stroke();
    if(C.weapon==='hammer'){c.fillStyle='#a32626';c.fillRect(x-side*12-1,y-29,2,14);c.fillRect(x-side*12-4,y-24,8,2)}else{c.fillStyle='#c9a45a';c.beginPath();c.arc(x-side*12,y-22,2,0,7);c.fill()}};
  if(back){weapon();shield()}
  // capa
  c.fillStyle=C.cape;c.beginPath();c.moveTo(x-9,y-32);c.lineTo(x+9,y-32);c.lineTo(x+12+(back?0:2),y-6);c.lineTo(x-12,y-6);c.closePath();c.fill();
  // piernas
  c.fillStyle='#3a2c22';c.fillRect(x-6,y-13+(st>0?-st:0),5,13+(st>0?st:0));c.fillRect(x+1,y-13+(st<0?st:0),5,13-(st<0?st:0));
  // cuerpo (la maga lleva túnica larga)
  c.fillStyle=flash?'#fff':C.body;c.beginPath();
  if(C.weapon==='staff'){c.moveTo(x-12,y-3);c.lineTo(x+12,y-3);c.lineTo(x+8,y-31);c.lineTo(x-8,y-31)}else{c.moveTo(x-10,y-12);c.lineTo(x+10,y-12);c.lineTo(x+8,y-31);c.lineTo(x-8,y-31)}
  c.closePath();c.fill();
  c.fillStyle=C.trim;c.fillRect(x-9,y-31,18,4);
  c.fillStyle='#3b2a18';c.fillRect(x-10,y-17,20,3);
  // cabeza
  c.fillStyle=flash?'#fff':'#d8b08a';c.beginPath();c.arc(x,y-37,7,0,7);c.fill();
  if(C.head==='helm'){c.fillStyle='#8f969f';c.beginPath();c.arc(x,y-38,7.5,Math.PI,0);c.fill();c.fillRect(x-1,y-38,2,6)}
  else if(C.head==='helmGold'){c.fillStyle='#c9ccd2';c.beginPath();c.arc(x,y-37,8,Math.PI*.95,Math.PI*.05);c.fill();c.fillStyle='#d8b25c';c.fillRect(x-8,y-38,16,2);c.fillRect(x-1,y-46,2,8)}
  else if(C.head==='hood'){c.fillStyle=C.hood;c.beginPath();c.arc(x,y-38,8.5,Math.PI*.9,Math.PI*.1);c.lineTo(x+7,y-31);c.lineTo(x-7,y-31);c.closePath();c.fill();
    if(!back){c.fillStyle='#d8b08a';c.beginPath();c.arc(x+fx*2,y-36,4.5,0,7);c.fill()}}
  else if(C.head==='hat'){c.fillStyle=C.hood;c.beginPath();c.ellipse(x,y-40,12,3.5,0,0,7);c.fill();c.beginPath();c.moveTo(x-7,y-41);c.lineTo(x+7,y-41);c.lineTo(x+side*6,y-60);c.closePath();c.fill();c.fillStyle=C.trim;c.fillRect(x-7,y-43,14,2)}
  if(!back){weapon();shield()}
}
function drawSkeleton(c,e,t){
  const x=e.sx,y=e.sy,[fx]=screenFacing(e.face),side=fx>=0?1:-1,st=Math.sin(e.walk)*3;
  shadow(c,x,y,11); const bone=e.flash>0?'#fff':'#ddd3bb';
  c.strokeStyle=bone;c.lineWidth=2.5;c.lineCap='round';
  c.beginPath();c.moveTo(x-3,y-14);c.lineTo(x-4-st,y);c.moveTo(x+3,y-14);c.lineTo(x+4+st,y);c.stroke();
  c.beginPath();c.moveTo(x,y-14);c.lineTo(x,y-30);c.stroke();
  c.lineWidth=1.5;for(let k=0;k<3;k++){c.beginPath();c.ellipse(x,y-26+k*4,6-k,2,0,0,7);c.stroke()}
  const wind=e.wind>0?-8:0;
  c.lineWidth=2;c.beginPath();c.moveTo(x-6,y-28);c.lineTo(x-side*10,y-18);c.moveTo(x+6,y-28);c.lineTo(x+side*11,y-20+wind);c.stroke();
  c.strokeStyle='#8a6a4a';c.lineWidth=3;c.beginPath();c.moveTo(x+side*11,y-20+wind);c.lineTo(x+side*16,y-38+wind*1.5);c.stroke();
  c.fillStyle=bone;c.beginPath();c.arc(x,y-36,6,0,7);c.fill();c.fillRect(x-3,y-33,6,4);
  c.fillStyle='#1a1410';c.fillRect(x-3+side,y-38,2,2.5);c.fillRect(x+1+side,y-38,2,2.5);
  c.fillStyle='rgba(255,90,40,.8)';c.fillRect(x-2.5+side,y-37.5,1,1);c.fillRect(x+1.5+side,y-37.5,1,1);
}
function drawRat(c,e,t){
  const x=e.sx,y=e.sy,[fx]=screenFacing(e.face),side=fx>=0?1:-1,b=Math.sin(e.walk)*1.5;
  shadow(c,x,y,11);
  c.strokeStyle='#c99a8a';c.lineWidth=1.5;c.beginPath();c.moveTo(x-side*9,y-5);c.quadraticCurveTo(x-side*18,y-2+b,x-side*20,y-10);c.stroke();
  c.fillStyle=e.flash>0?'#fff':'#5a4434';c.beginPath();c.ellipse(x,y-6+b*.3,11,6.5,0,0,7);c.fill();
  c.beginPath();c.ellipse(x+side*10,y-8,5.5,4,side*.3,0,7);c.fill();
  c.fillStyle='#c99a8a';c.beginPath();c.arc(x+side*7,y-12,2.5,0,7);c.fill();
  c.fillStyle='#ff4a2a';c.fillRect(x+side*12-1,y-10,2,2);
}
function drawCultist(c,e,t){
  const x=e.sx,y=e.sy,[fx]=screenFacing(e.face),side=fx>=0?1:-1,sw=Math.sin(e.walk)*1.5;
  shadow(c,x,y,12);
  c.fillStyle=e.flash>0?'#fff':'#43264f';c.beginPath();c.moveTo(x,y-40);c.lineTo(x+12+sw,y);c.lineTo(x-12-sw,y);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.moveTo(x,y-40);c.lineTo(x+12+sw,y);c.lineTo(x+2,y);c.closePath();c.fill();
  c.fillStyle='#2a1733';c.beginPath();c.arc(x,y-36,7,0,7);c.fill();
  c.fillStyle='#ffb05a';c.fillRect(x-3+side*1.5,y-37,2,1.5);c.fillRect(x+1+side*1.5,y-37,2,1.5);
  c.strokeStyle='#5a4028';c.lineWidth=2.5;c.beginPath();c.moveTo(x+side*12,y-4);c.lineTo(x+side*12,y-44);c.stroke();
  const p=e.cd<.5?1:.4, g=c.createRadialGradient(x+side*12,y-47,0,x+side*12,y-47,9);g.addColorStop(0,`rgba(220,150,255,${p})`);g.addColorStop(1,'rgba(160,60,220,0)');
  c.fillStyle=g;c.beginPath();c.arc(x+side*12,y-47,9,0,7);c.fill();
}
function drawBrute(c,e,t){
  const x=e.sx,y=e.sy,[fx]=screenFacing(e.face),side=fx>=0?1:-1,st=Math.sin(e.walk)*3;
  shadow(c,x,y,18); const skin=e.flash>0?'#fff':'#5f6b50';
  c.fillStyle='#3a2f24';c.fillRect(x-10,y-16-st*.5,8,16+st*.5);c.fillRect(x+2,y-16+st*.5,8,16-st*.5);
  c.fillStyle=skin;c.beginPath();c.ellipse(x,y-30,17,17,0,0,7);c.fill();
  c.fillStyle='#4a3a28';c.fillRect(x-16,y-22,32,7);
  const wind=e.wind>0?-14:0;
  c.fillStyle=skin;c.beginPath();c.ellipse(x-side*18,y-24,6,10,0,0,7);c.fill();c.beginPath();c.ellipse(x+side*19,y-26+wind,6,10,0,0,7);c.fill();
  c.strokeStyle='#4b3522';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(x+side*20,y-20+wind);c.lineTo(x+side*30,y-44+wind*1.4);c.stroke();
  c.fillStyle=skin;c.beginPath();c.arc(x+side*3,y-48,7,0,7);c.fill();
  c.fillStyle='#ffd23a';c.fillRect(x+side*3-3,y-50,2,2);c.fillRect(x+side*3+1,y-50,2,2);
}
