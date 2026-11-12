// ---------- Bucle ----------
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(G)update(dt);render();requestAnimationFrame(frame)}

function startGame(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}
  $('title').hidden=true;$('dead').hidden=true;newGame();state='play';cv.focus();
}
