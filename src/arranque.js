// Fondo de la pantalla de título: un nivel de muestra
function boot(data){
  if(data&&data.depth&&data.P){depth=data.depth;seed=data.seed;kills=data.kills||0;P=Object.assign(newPlayer(data.P.cls),data.P);P.maxhp=0;computeStats();P.hp=Math.min(P.maxhp,data.P.hp);
    for(const it of [...P.bag,...Object.values(P.eq)])if(it&&it.id>=itemSeq)itemSeq=it.id+1;G=genLevel(depth,seed);placePlayer();state='play';$('title').hidden=true;updHud()}
  else{P=newPlayer();computeStats();seed=12345;G=genLevel(1,seed);placePlayer();updHud();refreshTitle()}
  requestAnimationFrame(frame);
}
window.claude?.hot?.snapshot?.(()=>state==='play'?{depth,seed,kills,P:{cls:P.cls,hp:P.hp,lvl:P.lvl,xp:P.xp,gold:P.gold,pot:P.pot,eq:P.eq,bag:P.bag,alloc:P.alloc,pts:P.pts}}:{});
const hot=window.claude?.hot;
hot?.ready ? hot.ready(boot) : boot(hot?.data ?? {});
