// ---------- Tipos de enemigo ----------
const ETYPES={
  rata:     {name:'Rata de cripta',     hp:14, spd:3.0, dmg:4,  xp:6,  r:.26, wind:.25, cdT:.9,  draw:drawRat},
  esqueleto:{name:'Esqueleto',          hp:30, spd:1.9, dmg:9,  xp:14, r:.3,  wind:.4,  cdT:1.1, draw:drawSkeleton},
  cultista: {name:'Cultista',           hp:22, spd:2.1, dmg:8,  xp:18, r:.3,  ranged:true, cdT:2.2, draw:drawCultist},
  bruto:    {name:'Bruto de las fosas', hp:80, spd:1.35,dmg:18, xp:40, r:.42, wind:.6,  cdT:1.6, draw:drawBrute},
};
function pickType(d){
  const pool=[['rata',4],['esqueleto',3+d],['cultista',d>=2?2+d:0],['bruto',d>=3?d-1:0]];
  let tot=pool.reduce((s,p)=>s+p[1],0),r=R()*tot;for(const[k,w]of pool){if((r-=w)<0)return k}return 'rata';
}
