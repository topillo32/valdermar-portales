// ---------- Guardado y récords (Firebase si hay sesión; si no, este navegador) ----------
const LS_SAVE='varnhal-partida',LS_REC='varnhal-records';
let account=null, fbState='connecting';
const Store={
  cloud(){return !!(account&&window.FB)},
  async load(){if(this.cloud())return await FB.loadSave();try{return JSON.parse(localStorage.getItem(LS_SAVE)||'null')}catch(e){return null}},
  async save(d){if(this.cloud()){await FB.writeSave(d);return 'nube'}try{localStorage.setItem(LS_SAVE,JSON.stringify(d))}catch(e){throw new Error('el navegador no permite guardar')}return 'local'},
  async clear(){if(this.cloud())await FB.deleteSave();try{localStorage.removeItem(LS_SAVE)}catch(e){}},
  localScores(){try{return JSON.parse(localStorage.getItem(LS_REC)||'[]')}catch(e){return[]}},
  async addScore(s){
    const row={...s,name:account?account.name:'Tú',at:Date.now()};
    try{const l=this.localScores();l.push(row);l.sort((a,b)=>b.depth-a.depth||b.lvl-a.lvl);localStorage.setItem(LS_REC,JSON.stringify(l.slice(0,10)))}catch(e){}
    if(this.cloud()){await FB.submitScore(s);return 'nube'}return 'local'},
  async scores(){if(window.FB&&fbState==='ready')return {rows:await FB.topScores(),global:true};return {rows:this.localScores(),global:false}},
};
function makeSave(){return JSON.parse(JSON.stringify({v:1,depth,seed,kills,at:Date.now(),P:{cls:P.cls,hp:Math.ceil(P.hp),lvl:P.lvl,xp:P.xp,gold:P.gold,pot:P.pot,eq:P.eq,bag:P.bag,alloc:P.alloc,pts:P.pts}}))}
function saveGame(){return Store.save(makeSave())}
function applySave(data){
  depth=data.depth;seed=data.seed;kills=data.kills||0;
  P=Object.assign(newPlayer(data.P.cls),data.P);P.maxhp=0;computeStats();P.hp=Math.max(1,Math.min(P.maxhp,data.P.hp));
  for(const it of [...P.bag,...Object.values(P.eq)])if(it&&it.id>=itemSeq)itemSeq=it.id+1;
  G=genLevel(depth,seed);placePlayer();refreshInspector();updHud();
}
async function continueGame(){
  const btn=$('contBtn');btn.disabled=true;
  try{const d=await Store.load();if(!d){refreshTitle();return}
    if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}
    applySave(d);$('title').hidden=true;state='play';cv.focus();
    msg('Retomas tu expedición en la profundidad '+depth+'.','#e58a3c')}
  catch(e){$('contInfo').className='note err';$('contInfo').textContent='No se pudo cargar la partida: '+e.message}
  finally{btn.disabled=false}
}
