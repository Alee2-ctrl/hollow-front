import {THREE,S,CAM,skyMat,sun,clock,upd,C,grade,dust,N,haze} from './core.js';import * as world from './world.js';import * as actors from './actors.js';
world.init();await actors.init();
// ---------- shots ----------
const SH=[
 {k:'player',t:'THE OPERATOR',s:'Your soldier as a real 3D human: animated run and aim, gun tracks where you point. The red R-7 tank you can climb into is parked beside him.',x:4,cx:4,cy:2.6,cz:15,ly:1.6},
 {k:'dunes',t:'ZONE 1 · BONE DUNES',s:'Giant fossil ribcage half-buried in the dunes. Mummified soldier (bandages, glowing eyes, arms reaching) and a giant scorpion with armored plates and a glowing venom stinger.',x:40,cx:40,cy:3.2,cz:19,ly:2},
 {k:'temple',t:'ZONE 2 · BURIED TEMPLE',s:'Sunken colonnade and a toppled god-statue head. Sand wraith (hooded skull spirit), armored beetle with a horn and shiny shell, and a vulture demon circling.',x:80,cx:80,cy:3.5,cz:20,ly:2.4},
 {k:'larva',t:'BURROWING LARVA',s:'Sandworm larva erupting from the sand: ringed flesh, a petal mouth with rows of teeth facing you.',x:105,cx:105,cy:2,cz:10,ly:1.8},
 {k:'outpost',t:'ZONE 3 · ABANDONED OUTPOST · MINI-BOSS',s:'The Bone Sand Golem: boulder body held together by a bone skeleton, glowing lava cracks, skull helmet with horns. Wrecked tank and watchtower behind.',x:140,cx:140,cy:5,cz:24,ly:4.5},
 {k:'worm',t:'FINAL BOSS · THE DEVOURER',s:'Three-headed sandworm bursting from the Maw Pit. Every mouth faces the player (left), petal jaws open with rings of teeth and a burning throat. Each head has its own health.',x:200,cx:197,cy:8,cz:40,ly:7},
];
const nav=document.getElementById('nav');let cur=0,camT=new THREE.Vector3(),lookT=new THREE.Vector3(),camX=new THREE.Vector3(),lookX=new THREE.Vector3();
function go(i){cur=i;const s=SH[i];document.getElementById('t').textContent=s.t;document.getElementById('s').textContent=s.s;[...nav.children].forEach((b,j)=>b.classList.toggle('on',j===i));camT.set(s.cx,s.cy,s.cz);lookT.set(s.cx,s.ly,0);skyMat.uniforms.pit.value=s.k==='worm'?1:0;S.fog.color.set(s.k==='worm'?0x9a3a1e:0xc07a4a);sun.color.set(s.k==='worm'?0xff6a3a:0xffb070);sun.position.set(s.cx-30,26,28);sun.target.position.set(s.cx,0,0);actors.focus(s.k);}
SH.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.t.split('·').pop().trim();b.onclick=()=>go(i);nav.appendChild(b);});
addEventListener('keydown',e=>{if(e.key==='ArrowRight')go((cur+1)%SH.length);if(e.key==='ArrowLeft')go((cur+SH.length-1)%SH.length);if(e.key==='l')document.getElementById('ui').style.display=document.getElementById('ui').style.display?'':'none';});
const q=new URLSearchParams(location.search);go(+(q.get('s')||0));camX.copy(camT);lookX.copy(lookT);
window.__S=S;window.__p3={go,SH,ready:true};
function loop(){const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;camX.lerp(camT,1-Math.pow(0.02,dt));lookX.lerp(lookT,1-Math.pow(0.02,dt));CAM.position.set(camX.x+Math.sin(t*0.3)*0.4,camX.y+Math.sin(t*0.4)*0.15,camX.z);CAM.lookAt(lookX);
 const a=dust.geometry.attributes.position;for(let i=0;i<N;i++){let x=a.getX(i)+dt*(6+i%7);if(x>380)x=-20;a.setX(i,x);a.setY(i,a.getY(i)+Math.sin(t*2+i)*dt*0.4);}a.needsUpdate=true;for(const h of haze){h.position.x+=dt*2;if(h.position.x>380)h.position.x=-20;}
 for(const f of upd)f(dt,t);grade.uniforms.t.value=t;C.render();requestAnimationFrame(loop);}
loop();
