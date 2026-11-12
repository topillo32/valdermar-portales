// ---------- Objetos ----------
const IR=()=>Math.random(), IRI=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const SLOTS=[['arma','Arma'],['armadura','Armadura'],['casco','Casco'],['anillo','Anillo']];
const ITYPES={
  espada:  {slot:'arma',cls:'guerrero',label:'Espada',  names:['Espada corta','Espada larga','Espada bastarda','Hoja rúnica'],min:10,max:16,spd:1},
  hacha:   {slot:'arma',cls:'guerrero',label:'Hacha',   names:['Hacha de mano','Hacha de guerra','Gran hacha','Hacha rúnica'],min:8,max:21,spd:.92},
  dagas:   {slot:'arma',cls:'picara',  label:'Dagas',   names:['Dagas de hierro','Dagas curvas','Colmillos gemelos','Dagas de sombra'],min:6,max:10,spd:1},
  estoque: {slot:'arma',cls:'picara',  label:'Estoque', names:['Estoque','Florete de duelo','Estoque fino','Aguijón de plata'],min:7,max:12,spd:.9},
  arco:    {slot:'arma',cls:'arquero', label:'Arco',    names:['Arco corto','Arco largo','Arco compuesto','Arco élfico'],min:8,max:13,spd:1},
  ballesta:{slot:'arma',cls:'arquero', label:'Ballesta',names:['Ballesta ligera','Ballesta','Ballesta pesada','Ballesta rúnica'],min:12,max:18,spd:.75},
  baston:  {slot:'arma',cls:'maga',    label:'Bastón',  names:['Bastón de fresno','Bastón de ébano','Bastón ígneo','Bastón del archimago'],min:12,max:18,spd:1},
  varita:  {slot:'arma',cls:'maga',    label:'Varita',  names:['Varita de roble','Varita de hueso','Varita de cristal','Varita astral'],min:9,max:13,spd:1.3},
  martillo:{slot:'arma',cls:'paladin', label:'Martillo',names:['Mazo','Martillo de guerra','Martillo sagrado','Martillo del alba'],min:13,max:20,spd:1},
  maza:    {slot:'arma',cls:'paladin', label:'Maza',    names:['Maza de hierro','Maza con pinchos','Lucero del alba','Maza bendita'],min:10,max:16,spd:1.18},
  armadura:{slot:'armadura',label:'Armadura',names:['Jubón acolchado','Cota de malla','Coraza','Armadura de placas'],def:6},
  casco:   {slot:'casco',label:'Casco',names:['Capucha de cuero','Yelmo de hierro','Yelmo con cimera','Yelmo rúnico'],def:3},
  anillo:  {slot:'anillo',label:'Anillo',names:['Anillo de cobre','Anillo de plata','Anillo de oro','Anillo de mithril'],def:0},
};
const RARITY=['Común','Mágico','Raro','Legendario'], RCOL=['#e9dfc8','#8fb3ff','#ffd36a','#ff9a4c'];
const AFFIXES=[
  {k:'fue', suf:'del oso',      txt:v=>'+'+v+' de Fuerza',              v:i=>IRI(1,2)+Math.floor(i/3)},
  {k:'des', suf:'del lince',    txt:v=>'+'+v+' de Destreza',            v:i=>IRI(1,2)+Math.floor(i/3)},
  {k:'con', suf:'del roble',    txt:v=>'+'+v+' de Constitución',        v:i=>IRI(1,2)+Math.floor(i/3)},
  {k:'int', suf:'del sabio',    txt:v=>'+'+v+' de Inteligencia',        v:i=>IRI(1,2)+Math.floor(i/3)},
  {k:'vida',suf:'de la vida',   txt:v=>'+'+v+' de vida máxima',         v:i=>IRI(6,12)+i*3},
  {k:'dmg', suf:'de la ruina',  txt:v=>'+'+v+' % de daño',              v:i=>IRI(5,10)+i},
  {k:'crit',suf:'certero',      txt:v=>'+'+v+' % de probabilidad de crítico', v:()=>IRI(2,5)},
  {k:'vel', suf:'veloz',        txt:v=>'+'+v+' % de velocidad de ataque',v:()=>IRI(4,10)},
  {k:'robo',suf:'vampírico',    txt:v=>v+' % del daño se convierte en vida',v:()=>IRI(2,4)},
  {k:'mov', suf:'del viento',   txt:v=>'+'+v+' % de velocidad de movimiento',v:()=>IRI(4,8)},
  {k:'def', suf:'protector',    txt:v=>'+'+v+' de defensa',             v:i=>IRI(2,4)+i},
];
const WEAPONS_OF=k=>Object.keys(ITYPES).filter(t=>ITYPES[t].cls===k);
let itemSeq=1;
function genItem(ilvl,opt={}){
  // tipo: 60 % armas de tu clase, 15 % de otras clases, 25 % armadura/casco/anillo
  let type=opt.type;
  if(!type){const r=IR();type=r<.6?pick(WEAPONS_OF(P?P.cls:'guerrero')):r<.75?pick(Object.keys(ITYPES).filter(t=>ITYPES[t].cls)):pick(['armadura','casco','anillo'])}
  const T=ITYPES[type];
  let rar=opt.rar;
  if(rar===undefined){const r=IR()-(opt.boost||0);rar=r<.025+ilvl*.003?3:r<.14?2:r<.45?1:0}
  const tier=Math.max(0,Math.min(3,Math.floor((ilvl-1+IRI(-1,1))/3)));
  const mult=(1+.2*(ilvl-1))*[1,1.12,1.25,1.45][rar]*(.92+IR()*.16);
  const it={id:itemSeq++,type,slot:T.slot,rar,ilvl,tier,aff:[]};
  if(T.slot==='arma'){it.min=Math.max(1,Math.round(T.min*mult));it.max=Math.max(it.min+1,Math.round(T.max*mult));it.spd=T.spd}
  if(T.def){it.def=Math.round(T.def*(1+.25*(ilvl-1))*[1,1.12,1.25,1.45][rar])}
  let n=[0,IRI(1,2),3,4][rar];if(type==='anillo')n=Math.max(1,n);
  const pool=AFFIXES.slice();
  for(let k=0;k<n&&pool.length;k++){const a=pool.splice(Math.floor(IR()*pool.length),1)[0];it.aff.push({k:a.k,v:a.v(ilvl)})}
  const base=T.names[tier];
  if(rar===3)it.name='«'+pick(['Lamento','Furia','Susurro','Llama','Juramento','Ocaso','Eco','Colmillo'])+' de '+pick(['Varnhal','la Cripta','los Caídos','Ilmar','la Abadía','las Fosas'])+'»';
  else if(rar>=1&&it.aff.length)it.name=base+' '+AFFIXES.find(a=>a.k===it.aff[0].k).suf;
  else it.name=base;
  it.base=base;
  it.value=Math.round((8+ilvl*6)*[1,2,4,9][rar]);
  return it;
}
function starterWeapon(cls){const t=WEAPONS_OF(cls)[0],C=CLASSES[cls],it=genItem(1,{type:t,rar:0});it.tier=0;it.name=it.base=ITYPES[t].names[0];it.min=C.min;it.max=C.max;it.value=5;return it}
function canUse(it,cls){const T=ITYPES[it.type];return !T.cls||T.cls===cls}
function sumAff(k){let s=0;for(const[sl]of SLOTS){const it=P.eq[sl];if(it)for(const a of it.aff)if(a.k===k)s+=a.v}return s}
function attrTotal(k){return BASE_ATTR[P.cls][k]+(P.alloc[k]||0)+sumAff(k)}
function computeStats(){
  const C=CLS(),B=BASE_ATTR[P.cls],prim=PRIMARY[P.cls],w=P.eq.arma||starterWeapon(P.cls);
  const A={};for(const[k]of ATTRS)A[k]=attrTotal(k);
  const dmgMul=1+(A[prim]-B[prim])*.04+sumAff('dmg')/100;
  let def=sumAff('def');for(const[sl]of SLOTS){const it=P.eq[sl];if(it&&it.def)def+=it.def}
  const S={A,
    min:Math.max(1,Math.round(w.min*dmgMul)),max:Math.max(2,Math.round(w.max*dmgMul)),
    crit:C.crit+(A.des-B.des)*.004+sumAff('crit')/100,
    aspd:(w.spd||1)*(1+(A.des-B.des)*.01+sumAff('vel')/100),
    def,red:Math.min(.75,(C.armor||0)+def/(def+60)),
    maxhp:C.hp+(P.lvl-1)*C.lv[0]+(A.con-B.con)*6+sumAff('vida'),
    steal:sumAff('robo')/100,mov:1+sumAff('mov')/100,xp:1+A.int*.01};
  const ratio=P.maxhp?P.hp/P.maxhp:1;
  P.stats=S;P.atkMin=S.min;P.atkMax=S.max;
  if(P.maxhp!==S.maxhp){P.maxhp=S.maxhp;P.hp=Math.min(P.maxhp,Math.max(1,Math.round(ratio*P.maxhp)))}
  return S;
}
