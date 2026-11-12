// ---------- Selección de clase ----------
let selCls='guerrero';
try{const s=localStorage.getItem('varnhal-clase');if(CLASSES[s])selCls=s}catch(e){}
function buildClassPicker(){
  const box=$('classes');box.innerHTML='';
  CLS_KEYS.forEach((k,i)=>{const C=CLASSES[k],b=document.createElement('button');
    b.type='button';b.className='cls';b.dataset.k=k;b.setAttribute('role','radio');
    const cv2=document.createElement('canvas'),r=Math.max(1,window.devicePixelRatio||1);cv2.width=60*r;cv2.height=66*r;
    const c=cv2.getContext('2d');c.scale(r,r);drawHero(c,{cls:k,sx:30,sy:60,face:.8,walk:0,inv:0,swing:0,swingT:C.swing},0);
    const nb=document.createElement('b');nb.textContent=C.title;const ns=document.createElement('span');ns.textContent=(i+1)+' · '+C.name;
    b.append(cv2,nb,ns);b.addEventListener('click',()=>selectClass(k));box.appendChild(b)});
}
function selectClass(k,focus){selCls=k;try{localStorage.setItem('varnhal-clase',k)}catch(e){}
  for(const b of $('classes').children){const on=b.dataset.k===k;b.setAttribute('aria-checked',on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()}
  const C=CLASSES[k],info=$('clsInfo');info.innerHTML='';
  const p=document.createElement('p');p.innerHTML='<b></b> — ';p.querySelector('b').textContent=C.name+', '+C.title.toLowerCase();p.append(C.desc);
  const m=document.createElement('div');m.className='meters';
  [['Vida',C.m[0]],['Daño',C.m[1]],['Velocidad',C.m[2]],['Alcance',C.m[3]]].forEach(([l,v])=>{const s=document.createElement('span');s.textContent=l;const i=document.createElement('i');i.style.setProperty('--v',(v*100)+'%');m.append(s,i)});
  info.append(p,m);
}
buildClassPicker();selectClass(selCls);
