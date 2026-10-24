import {THREE,S,CAM,skyMat,sun,clock,upd,C,grade,dust,N,haze} from './core.js';import * as world from './world.js';import * as actors from './actors.js';
await world.init();await actors.init();
// ---------- shots ----------
const SH=[
 {k:'player',t:'THE OPERATOR',s:'Your soldier: a detailed, artist-made 3D operator in full tactical gear. The red armored vehicle you can climb into is parked beside him.',x:4,cx:6,cy:1.8,cz:9,ly:1.7},
 {k:'dunes',t:'ZONE 1 · BONE DUNES',s:'A giant fossil skeleton and a horned beast skull half-buried in the sand. Two rotting mummies shamble toward you, and a giant scorpion crawls in from the right.',x:40,cx:41,cy:1.9,cz:9,ly:1.8},
 {k:'temple',t:'ZONE 2 · BURIED TEMPLE',s:'A crumbling sandstone temple tower. A long-limbed sand wraith floats in, an armored beetle crawls along the ground, and a winged demon circles overhead.',x:80,cx:80,cy:2.4,cz:11,ly:2.6},
 {k:'larva',t:'BURROWING LARVA',s:'A sandworm larva bursting out of the dunes, with a ringed, ridged body.',x:105,cx:106,cy:2.4,cz:11,ly:2.8},
 {k:'outpost',t:'ZONE 3 · ABANDONED OUTPOST · MINI-BOSS',s:'The Sand Golem: a hulking body of jagged rock with glowing lava cracks.',x:140,cx:140,cy:3,cz:13,ly:3.2},
 {k:'worm',t:'FINAL BOSS · THE DEVOURER',s:'A many-headed sandworm rising out of the Maw Pit, with toothed jaws and feelers. Each head has its own health.',x:200,cx:199,cy:4,cz:26,ly:6.5},
];
const nav=document.getElementById('nav');let cur=0,camT=new THREE.Vector3(),lookT=new THREE.Vector3(),camX=new THREE.Vector3(),lookX=new THREE.Vector3();
function go(i,snap){cur=i;const s=SH[i];for(const o of S.children)if(o.userData.cull)o.visible=Math.abs(o.position.x-s.x)<55;document.getElementById('t').textContent=s.t;document.getElementById('s').textContent=s.s;[...nav.children].forEach((b,j)=>b.classList.toggle('on',j===i));camT.set(s.cx,s.cy,s.cz);lookT.set(s.cx,s.ly,0);skyMat.uniforms.pit.value=s.k==='worm'?1:0;S.fog.color.set(s.k==='worm'?0x9a3a1e:0xc07a4a);sun.color.set(s.k==='worm'?0xff6a3a:0xffb070);sun.position.set(s.cx-30,26,28);sun.target.position.set(s.cx,0,0);actors.focus(s.k);if(snap){camX.copy(camT);lookX.copy(lookT);}}
SH.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.t.split('·').pop().trim();b.onclick=()=>go(i);nav.appendChild(b);});
addEventListener('keydown',e=>{if(e.key==='ArrowRight')go((cur+1)%SH.length);if(e.key==='ArrowLeft')go((cur+SH.length-1)%SH.length);if(e.key==='l')document.getElementById('ui').style.display=document.getElementById('ui').style.display?'':'none';});
const q=new URLSearchParams(location.search);go(+(q.get('s')||0));camX.copy(camT);lookX.copy(lookT);
document.getElementById('load')?.remove();window.__S=S;window.__p3={go,SH,ready:true};
function loop(){const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;camX.lerp(camT,1-Math.pow(0.02,dt));lookX.lerp(lookT,1-Math.pow(0.02,dt));CAM.position.set(camX.x+Math.sin(t*0.3)*0.4,camX.y+Math.sin(t*0.4)*0.15,camX.z);CAM.lookAt(lookX);
 const a=dust.geometry.attributes.position;for(let i=0;i<N;i++){let x=a.getX(i)+dt*(6+i%7);if(x>380)x=-20;a.setX(i,x);a.setY(i,a.getY(i)+Math.sin(t*2+i)*dt*0.4);}a.needsUpdate=true;for(const h of haze){h.position.x+=dt*2;if(h.position.x>380)h.position.x=-20;}
 for(const f of upd)f(dt,t);grade.uniforms.t.value=t;C.render();requestAnimationFrame(loop);}
loop();
