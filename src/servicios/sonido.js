// ---------- Sonido ----------
let AC=null, muted=false;
function sfx(type){
  if(!AC||muted)return;
  const S={swing:['triangle',420,120,.08,.05],hit:['square',190,60,.1,.06],hurt:['sawtooth',140,40,.22,.08],coin:['sine',880,1400,.12,.06],
    potion:['sine',300,760,.3,.07],die:['sawtooth',220,45,.35,.06],stairs:['triangle',200,90,.6,.08],level:['triangle',440,880,.5,.07],chest:['square',300,520,.18,.04],bolt:['sine',600,200,.25,.05],
    bow:['triangle',900,300,.09,.05],fire:['sawtooth',260,520,.18,.035],boom:['sawtooth',120,35,.35,.08]}[type];
  if(!S)return;const[w,f0,f1,dur,vol]=S,o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;
  o.type=w;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02);
}
