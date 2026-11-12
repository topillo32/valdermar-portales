let titleReq=0;
async function refreshTitle(){
  const my=++titleReq,info=$('contInfo'),btn=$('contBtn');
  // cuenta
  const t=$('acctTxt'),lb=$('loginBtn');
  if(fbState==='connecting'){t.textContent='Conectando con el servidor…';lb.hidden=true}
  else if(fbState==='offline'){t.textContent='Sin conexión al servidor · la partida se guarda en este navegador';lb.hidden=true}
  else if(account){t.innerHTML='Conectado como <b></b> · partida en la nube';t.querySelector('b').textContent=account.name;lb.hidden=false;lb.textContent='Cerrar sesión'}
  else{t.textContent='Jugando sin cuenta · la partida se guarda en este navegador';lb.hidden=false;lb.textContent='Iniciar sesión'}
  // partida guardada
  info.className='note';
  let d=null;try{d=await Store.load()}catch(e){if(my===titleReq){info.className='note err';info.textContent='No se pudo leer la partida guardada: '+e.message}}
  if(my!==titleReq)return;
  btn.hidden=!d;
  if(d){const C=CLASSES[d.P.cls]||CLASSES.guerrero;info.textContent='Partida guardada: '+C.name+' ('+C.title.toLowerCase()+'), nivel '+d.P.lvl+', profundidad '+d.depth+'.';$('startBtn').textContent='Nueva partida'}
  else if(!info.classList.contains('err'))info.textContent='';
}
function showTitle(){for(const id of['pause','dead','equip'])$(id).hidden=true;$('title').hidden=false;state='title';selectClass(selCls);refreshTitle()}

// pausa
let confirmAct=null;
function openPause(){if(state!=='play')return;state='pause';for(const k in keys)keys[k]=false;stick.id=null;$('stick').hidden=true;
  $('pauseSub').textContent=CLS().name+' · '+CLS().title+' · Nivel '+P.lvl+' · Profundidad '+depth;
  $('pauseMain').hidden=false;$('pauseConfirm').hidden=true;$('pauseNote').textContent='';$('pauseNote').className='note';
  $('pSave').textContent=Store.cloud()?'Guardar partida en la nube':'Guardar partida';
  $('pause').hidden=false;setTimeout(()=>$('pResume').focus(),30)}
function resumeGame(){if(state!=='pause')return;$('pause').hidden=true;state='play';cv.focus()}
function askConfirm(text,act){confirmAct=act;$('confirmTxt').textContent=text;$('pauseMain').hidden=true;$('pauseConfirm').hidden=false;$('pauseNote').textContent='';setTimeout(()=>$('cNo').focus(),30)}
async function doSave(btn){const n=$('pauseNote');btn.disabled=true;n.className='note';n.textContent='Guardando…';
  try{const w=await saveGame();n.className='note ok';n.textContent=w==='nube'?'Partida guardada en la nube.':'Partida guardada en este navegador.';return true}
  catch(e){n.className='note err';n.textContent='No se pudo guardar: '+e.message;return false}finally{btn.disabled=false}}
$('btnMenu').addEventListener('click',()=>{if(state==='play')openPause();else if(state==='pause')resumeGame()});
$('pResume').addEventListener('click',resumeGame);
$('pSave').addEventListener('click',e=>doSave(e.currentTarget));
$('pSaveQuit').addEventListener('click',async e=>{if(await doSave(e.currentTarget))showTitle()});
$('pRestart').addEventListener('click',()=>askConfirm('¿Empezar de nuevo desde el piso 1 con la misma clase? Perderás el progreso que no hayas guardado.',()=>{selCls=P.cls;$('pause').hidden=true;startGame()}));
$('pQuit').addEventListener('click',()=>askConfirm('¿Abandonar la partida y volver al menú? Se pierde lo que no hayas guardado; tu última partida guardada se mantiene.',()=>showTitle()));
$('cYes').addEventListener('click',()=>{const a=confirmAct;confirmAct=null;if(a)a()});
$('cNo').addEventListener('click',()=>{$('pauseMain').hidden=false;$('pauseConfirm').hidden=true;$('pResume').focus()});
$('contBtn').addEventListener('click',continueGame);

// cuenta
let authMode='in';
function setAuthMode(m){authMode=m;$('tabIn').setAttribute('aria-selected',m==='in');$('tabUp').setAttribute('aria-selected',m==='up');
  $('nameRow').hidden=m!=='up';$('aSubmit').textContent=m==='up'?'Crear cuenta':'Entrar';$('aReset').hidden=m==='up';
  $('aPass').autocomplete=m==='up'?'new-password':'current-password';$('authNote').textContent='';$('authNote').className='note'}
function authNote(t,k){const n=$('authNote');n.className='note'+(k?' '+k:'');n.textContent=t}
function openAuth(){setAuthMode('in');$('auth').hidden=false;setTimeout(()=>$('aEmail').focus(),30)}
$('tabIn').addEventListener('click',()=>setAuthMode('in'));
$('tabUp').addEventListener('click',()=>setAuthMode('up'));
$('loginBtn').addEventListener('click',async()=>{
  if(account){try{await FB.signOut()}catch(e){}return}
  openAuth()});
$('authForm').addEventListener('submit',async e=>{e.preventDefault();
  const email=$('aEmail').value.trim(),pass=$('aPass').value,name=$('aName').value.trim(),b=$('aSubmit');
  if(!email||!pass){authNote('Escribe tu correo y tu contraseña.','err');return}
  if(authMode==='up'&&!name){authNote('Elige un nombre de aventurero.','err');$('aName').focus();return}
  b.disabled=true;authNote(authMode==='up'?'Creando la cuenta…':'Entrando…');
  try{if(authMode==='up')await FB.signUp(email,pass,name);else await FB.signIn(email,pass);$('aPass').value='';$('auth').hidden=true}
  catch(err){authNote(err.message,'err')}finally{b.disabled=false}});
$('aGoogle').addEventListener('click',async()=>{authNote('Abriendo Google…');try{await FB.google();$('auth').hidden=true}catch(err){authNote(err.message,'err')}});
$('aReset').addEventListener('click',async()=>{const email=$('aEmail').value.trim();if(!email){authNote('Escribe tu correo arriba y vuelve a pulsar.','err');$('aEmail').focus();return}
  try{await FB.reset(email);authNote('Te enviamos un correo para cambiar la contraseña.','ok')}catch(err){authNote(err.message,'err')}});
$('authClose').addEventListener('click',()=>{$('auth').hidden=true;$('loginBtn').focus()});

// récords
async function openScores(){const box=$('scoresBox'),body=$('scoresBody'),note=$('scoresNote');box.hidden=false;body.innerHTML='';note.className='note';note.textContent='Cargando…';
  try{const{rows,global}=await Store.scores();$('scoresSub').textContent=global?'Las 10 expediciones que llegaron más hondo, de todos los jugadores.':'Tus mejores expediciones en este navegador.';
    note.textContent=rows.length?'':'Todavía no hay récords. ¡Sé el primero en bajar!';
    rows.forEach((r,i)=>{const tr=document.createElement('tr');if(account&&r.uid===account.uid)tr.className='me';
      for(const[v,n]of[[i+1],[r.name||'—'],[(CLASSES[r.cls]||{}).title||'—'],[r.depth,1],[r.lvl,1],[r.kills,1]]){const td=document.createElement('td');td.textContent=v;if(n)td.className='n';tr.appendChild(td)}
      body.appendChild(tr)});
    setTimeout(()=>$('scoresClose').focus(),30)}
  catch(e){note.className='note err';note.textContent='No se pudieron cargar los récords: '+e.message}}
$('scoresBtn').addEventListener('click',openScores);
$('deadScores').addEventListener('click',openScores);
$('scoresClose').addEventListener('click',()=>{$('scoresBox').hidden=true});
function subOpen(){return !$('auth').hidden||!$('scoresBox').hidden}
function closeSub(){$('auth').hidden=true;$('scoresBox').hidden=true}

// conexión con Firebase (firebase.js); sin él, todo queda en este navegador
function fbReady(){fbState='ready';FB.onUser(u=>{account=u;if(state==='title')refreshTitle()})}
if(window.FB)fbReady();else{
  window.addEventListener('fb-ready',fbReady,{once:true});
  window.addEventListener('fb-failed',()=>{fbState='offline';if(state==='title')refreshTitle()},{once:true});
  setTimeout(()=>{if(fbState==='connecting'){fbState='offline';if(state==='title')refreshTitle()}},8000);
}
$('startBtn').addEventListener('click',startGame);
$('againBtn').addEventListener('click',()=>{showTitle();selectClass(selCls,true)});
