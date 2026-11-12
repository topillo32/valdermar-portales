// ---------- Sprites del dragón tricéfalo (atlas dragon.png) ----------
// Recortados de la hoja original. Cada fotograma: [x, y, ancho, alto, anclaX, anclaY].
// El ancla es el punto de las patas (o el centro, en bolas de fuego y explosiones).
// Los fotogramas de perfil miran a la derecha; se voltean para mirar a la izquierda.
const DRAGON={"idle":[[0,0,155,142,79.5,141.9],[157,0,156,142,72.9,141.9],[315,0,144,121,60.2,120.4],[157,0,156,142,72.9,141.9]],"breath":[[461,0,232,127,122.9,126.0],[695,0,237,134,118.0,133.1]],"spit":[[0,144,156,116,46.5,115.5],[158,144,196,111,98.2,110.0]],"back":[[356,144,169,119,93.5,118.3],[527,144,132,119,65.2,118.3]],"front":[[661,144,188,132,93.8,131.5],[851,144,136,98,68.2,97.9]],"death":[[0,278,164,86,82.0,85.8]],"ball":[[166,278,52,52,25.8,25.8]],"comet":[[220,278,89,82,44.6,41.0]],"boom":[[311,278,101,80,50.3,40.2],[414,278,124,111,62.2,55.6]],"portrait":[[540,278,223,222,111.4,110.8]]};
const DRAGON_IMG=new Image();let DRAGON_OK=false;
DRAGON_IMG.onload=()=>{DRAGON_OK=true};DRAGON_IMG.src='dragon.png';
// Dibuja un fotograma del atlas con el ancla en (x, y).
function dragonFrame(c,fr,x,y,s,flip,rot){
  const[sx,sy,w,h,ax,ay]=fr;c.save();c.translate(x,y);if(rot)c.rotate(rot);if(flip)c.scale(-1,1);
  c.drawImage(DRAGON_IMG,sx,sy,w,h,-ax*s,-ay*s,w*s,h*s);c.restore();
}
