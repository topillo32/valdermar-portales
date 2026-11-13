// ---------- Entrada ----------
const keys={};
window.addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Escape')closeSub();return}
  keys[e.code]=true;
  if(subOpen()){if(e.code==='Escape'){e.preventDefault();closeSub()}return}
  if(state==='pause'){if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();resumeGame()}return}
  if(state==='play'&&(e.code==='Escape'||e.code==='KeyP')){e.preventDefault();openPause();return}
  if(state==='title'){
    const n=/^Digit([1-5])$/.exec(e.code)||/^Numpad([1-5])$/.exec(e.code);
    if(n){selectClass(CLS_KEYS[+n[1]-1]);return}
    if(e.code==='ArrowRight'||e.code==='ArrowLeft'){const i=CLS_KEYS.indexOf(selCls)+(e.code==='ArrowRight'?1:-1);selectClass(CLS_KEYS[(i+CLS_KEYS.length)%CLS_KEYS.length],true);e.preventDefault();return}
    if(e.code==='Enter'||e.code==='Space'){if(e.target&&e.target.classList&&e.target.classList.contains('cls')&&e.code==='Space')return;e.preventDefault();startGame();return}
    return}
  if(state==='shop'||state==='lock'){extraKey(e);return}
  if(state==='inv'){if(e.code==='KeyB'||e.code==='Escape'){e.preventDefault();toggleEquip()}return}
  if(state!=='play')return;
  if(e.code==='KeyB'){toggleEquip();return}
  if(e.code==='Space'||e.code==='KeyJ'){e.preventDefault();playerAttack()}
  if(e.code==='KeyQ')drinkPotion();
  if(e.code==='KeyE')interact();
  if(e.code==='KeyM')toggleMap();
  if(e.code==='KeyI')toggleInsp();
  if(e.code.startsWith('Arrow'))e.preventDefault();
});
window.addEventListener('keyup',e=>{keys[e.code]=false});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
function screenToWorld(sx,sy){const wx=(sx-vw/2)/zoom+cam.x,wy=(sy-vh/2)/zoom+cam.y;const a=wx/HW,b=wy/HH;return{x:(a+b)/2,y:(b-a)/2}}
let stick={id:null,ox:0,oy:0,dx:0,dy:0};
cv.addEventListener('pointerdown',e=>{
  if(state!=='play')return;
  if(e.pointerType==='touch'){document.body.classList.add('touch');
    if(stick.id===null&&e.clientX<vw*.55){stick={id:e.pointerId,ox:e.clientX,oy:e.clientY,dx:0,dy:0};const s=$('stick');s.hidden=false;s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.firstElementChild.style.transform='';cv.setPointerCapture(e.pointerId)}
    return}
  if(e.button===0){const w=screenToWorld(e.clientX,e.clientY);playerAttack(Math.atan2(w.y-P.y,w.x-P.x))}
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerId===stick.id){let dx=e.clientX-stick.ox,dy=e.clientY-stick.oy;const l=Math.hypot(dx,dy),m=45;if(l>m){dx=dx/l*m;dy=dy/l*m}stick.dx=dx/m;stick.dy=dy/m;$('stick').firstElementChild.style.transform=`translate(${dx}px,${dy}px)`;return}
  if(e.pointerType!=='touch'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.in=true}
});
const endStick=e=>{if(e.pointerId===stick.id){stick={id:null,ox:0,oy:0,dx:0,dy:0};$('stick').hidden=true}};
cv.addEventListener('pointerup',endStick);cv.addEventListener('pointercancel',endStick);
cv.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')mouse.in=false});
const tap=(id,fn)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();document.body.classList.add('touch');fn()})};
tap('tAtk',()=>playerAttack());tap('hint',()=>{if(state==='play')interact()});tap('tPot',drinkPotion);tap('tUse',interact);
window.addEventListener('touchstart',()=>document.body.classList.add('touch'),{once:true,passive:true});
// Teléfonos y tabletas: mostrar los controles táctiles desde el principio.
if(matchMedia('(hover:none) and (pointer:coarse)').matches)document.body.classList.add('touch');
