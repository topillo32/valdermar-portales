// ---------- Constantes del motor ----------
const TW=64, TH=32, HW=32, HH=16, WH=44, MW=48, MH=48;
const cv=document.getElementById('game'), ctx=cv.getContext('2d');
const lightCv=document.createElement('canvas'), lctx=lightCv.getContext('2d');
const mini=document.getElementById('mini'), mctx=mini.getContext('2d');
let dpr=1, vw=0, vh=0, zoom=1;
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2); vw=window.innerWidth; vh=window.innerHeight;
  cv.width=Math.round(vw*dpr); cv.height=Math.round(vh*dpr);
  lightCv.width=Math.ceil(vw/2); lightCv.height=Math.ceil(vh/2);
  zoom = vw<700 ? 0.8 : 1;
}
window.addEventListener('resize',resize); resize();

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let rng=mulberry32(1);
const R=()=>rng(), RI=(a,b)=>a+Math.floor(R()*(b-a+1));
const isoX=(x,y)=>(x-y)*HW, isoY=(x,y)=>(x+y)*HH;
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
