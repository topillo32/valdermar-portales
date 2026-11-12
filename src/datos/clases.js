// ---------- Clases jugables ----------
// melee: reach/arc/swing; a distancia: proj. armor reduce el daño recibido; regen = vida/s; stun = segundos de aturdimiento.
const CLASSES={
  guerrero:{name:'Aldric',title:'Guerrero',weapon:'sword',hp:120,min:10,max:16,spd:3.6,cd:.4,swing:.22,reach:1.35,arc:1.25,crit:.1,critM:2,armor:.2,lv:[18,2,3],
    body:'#8a2f27',cape:'#22324f',head:'helm',trim:'#9aa1aa',
    desc:'Espada y escudo. Golpea en arco por delante y el escudo absorbe un 20 % del daño. El más fácil para empezar.',m:[.75,.5,.5,.4]},
  picara:{name:'Sera',title:'Pícara',weapon:'daggers',hp:85,min:6,max:10,spd:4.4,cd:.2,swing:.14,reach:1.15,arc:1.05,crit:.3,critM:2.5,armor:0,lv:[11,2,2],
    body:'#3c4a3a',cape:'#1b1f22',head:'hood',hood:'#2a3030',trim:'#6b5a3a',
    desc:'Dos dagas muy rápidas. Un 30 % de los golpes son críticos (×2,5) y es la que más corre, pero aguanta poco.',m:[.4,.45,1,.25]},
  arquero:{name:'Bran',title:'Arquero',weapon:'bow',hp:90,min:8,max:13,spd:3.9,cd:.5,swing:.2,proj:{speed:11,life:.85,pierce:1},crit:.15,critM:2,armor:0,lv:[12,2,3],
    body:'#4d5d2c',cape:'#3a2a1a',head:'hood',hood:'#3f4e22',trim:'#7a5a32',
    desc:'Dispara flechas hacia donde apuntas. Cada flecha atraviesa a un enemigo y alcanza unas 9 casillas.',m:[.45,.45,.7,1]},
  maga:{name:'Ilsa',title:'Maga',weapon:'staff',hp:75,min:12,max:18,spd:3.4,cd:.75,swing:.25,proj:{speed:7.5,life:1.1,aoe:1.4},crit:.1,critM:2,armor:0,lv:[9,3,4],
    body:'#3a2a6a',cape:'#1f1640',head:'hat',hood:'#2c1f55',trim:'#d8b25c',
    desc:'Lanza bolas de fuego que explotan y dañan a todos los enemigos cercanos. Frágil: mantén la distancia.',m:[.3,.85,.35,.8]},
  paladin:{name:'Doran',title:'Paladín',weapon:'hammer',hp:135,min:13,max:20,spd:3.1,cd:.65,swing:.3,reach:1.5,arc:1.6,crit:.08,critM:2,armor:.1,regen:1.2,stun:.7,lv:[20,2,4],
    body:'#c9c2b0',cape:'#7a1f1f',head:'helmGold',trim:'#d8b25c',
    desc:'Martillo pesado: golpe lento y amplio que aturde a los enemigos. Regenera vida poco a poco.',m:[1,.7,.25,.45]},
};
const CLS_KEYS=Object.keys(CLASSES);
const CLS=()=>CLASSES[P.cls]||CLASSES.guerrero;

// ---------- Atributos (estilo D&D) ----------
const ATTRS=[['fue','Fuerza'],['des','Destreza'],['con','Constitución'],['int','Inteligencia']];
const BASE_ATTR={guerrero:{fue:8,des:4,con:7,int:2},picara:{fue:3,des:9,con:5,int:4},arquero:{fue:4,des:8,con:5,int:3},maga:{fue:2,des:4,con:4,int:10},paladin:{fue:7,des:3,con:8,int:4}};
const PRIMARY={guerrero:'fue',picara:'des',arquero:'des',maga:'int',paladin:'fue'};
const ATTR_HELP={fue:'+4 % de daño por punto (guerrero, paladín)',des:'+4 % de daño (pícara, arquero), +0,4 % de crítico y +1 % de velocidad de ataque',con:'+6 de vida máxima por punto',int:'+4 % de daño (maga) y +1 % de experiencia por punto'};
