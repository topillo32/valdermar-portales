// ---------- Utilidades de mundo ----------
function solid(x,y){const cx=Math.floor(x),cy=Math.floor(y);if(cx<0||cy<0||cx>=MW||cy>=MH)return true;return G.col[idx(cx,cy)]===1}
function hits(x,y,r){return solid(x-r,y-r)||solid(x+r,y-r)||solid(x-r,y+r)||solid(x+r,y+r)}
function moveEnt(e,dx,dy){if(!hits(e.x+dx,e.y,e.r))e.x+=dx;if(!hits(e.x,e.y+dy,e.r))e.y+=dy}
function los(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),n=Math.ceil(d*4);for(let i=1;i<n;i++){const x=a.x+dx*i/n,y=a.y+dy*i/n;if(G.floor[idx(Math.floor(x),Math.floor(y))]===255)return false}return true}
function addText(x,y,txt,color,size){G.texts.push({x,y,z:40,t:0,txt,color,size:size||15})}
function burst(x,y,color,n,spd){for(let k=0;k<n;k++){const a=R()*6.28,s=(.5+R())*(spd||2);G.parts.push({x,y,z:18,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:40+R()*60,life:.5+R()*.4,t:0,color,size:2+R()*2})}}
