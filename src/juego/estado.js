// ---------- Estado ----------
const show={floor:true,obj:true,decor:true,col:false,grid:false,light:true};
let G=null, P=null, depth=1, seed=0, state='title', time=0, shake=0, kills=0;
let cam={x:0,y:0}, mouse={x:0,y:0,in:false};
const idx=(x,y)=>y*MW+x;

function newPlayer(cls){const k=CLASSES[cls]?cls:'guerrero',C=CLASSES[k];
  return {cls:k,x:0,y:0,r:.28,face:0.8,walk:0,hp:C.hp,maxhp:C.hp,lvl:1,xp:0,gold:0,pot:2,atkMin:C.min,atkMax:C.max,cd:0,swing:0,swingT:C.swing,inv:0,sx:0,sy:0,
    eq:{arma:starterWeapon(k),armadura:null,casco:null,anillo:null},bag:[],alloc:{fue:0,des:0,con:0,int:0},pts:0}}
const xpNext=l=>Math.floor(40*Math.pow(1.45,l-1));
