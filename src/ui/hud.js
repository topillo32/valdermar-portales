// ---------- Mensajes / HUD ----------
const logEl=document.getElementById('log');
function msg(t,color){const d=document.createElement('div');d.textContent=t;if(color)d.style.color=color;logEl.appendChild(d);while(logEl.children.length>4)logEl.firstChild.remove();setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),700)},4200)}
const $=id=>document.getElementById(id);
let hudT=0;
function updHud(){
  $('hpFill').style.width=(100*Math.max(0,P.hp)/P.maxhp)+'%';
  $('hpTxt').textContent=Math.max(0,Math.ceil(P.hp))+' / '+P.maxhp;
  $('xpFill').style.width=(100*P.xp/xpNext(P.lvl))+'%';
  $('lvl').textContent='Nivel '+P.lvl+(P.pts?' · +'+P.pts+' pts':'');$('btnEquip').innerHTML='Equipo<kbd> (B)</kbd>'+(P.pts?' ●':'');$('heroName').textContent=CLS().name+' · '+CLS().title;
  $('gold').textContent=P.gold; $('pots').textContent=P.pot; $('atk').textContent=P.atkMin+'–'+P.atkMax;
  $('zone').textContent='Profundidad '+depth+' · '+G.theme.name;
}
