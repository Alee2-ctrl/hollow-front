import {THREE,S,groundH,upd} from './core.js';
import {put} from './asset.js';
const RIGHT=Math.PI/2,LEFT=-Math.PI/2;
export function focus(k){}
export async function init(){
 const A={};const j=(k,p)=>p.then(o=>A[k]=o).catch(e=>console.error(k,e));
 await Promise.allSettled([
  j('player',put('models/soldier.glb',{h:1.85,x:4,ry:RIGHT,anim:0})),
  j('tank',put('models/btr.glb',{len:7,x:10.5,z:-1.5,mat:{color:0xd02818}})),
  j('mummyA',put('models/mummyA.glb',{h:1.9,x:37.5,z:0.3,ry:LEFT+0.3})),
  j('mummyB',put('models/mummyB.glb',{h:1.95,x:40.5,z:-0.8,ry:LEFT+0.2})),
  j('scorp',put('models/scorpionA.glb',{len:3.4,x:45,z:0.4,ry:LEFT,anim:0})),
  j('wraith',put('models/wraithB.glb',{h:2.7,x:76.5,z:0,y:0.5,ry:LEFT+0.3,anim:0,mat:{color:0x2b2520,roughness:0.85,metalness:0}})),
  j('beetle',put('models/beetle.glb',{len:2.8,x:83.5,z:0.5,ry:LEFT,renorm:1,mat:{color:0x24160c,roughness:0.32,metalness:0.25}})),
  j('vulture',put('models/dragon.glb',{len:6,x:81,z:-3,y:5.5,ry:LEFT,anim:0})),
  j('larva',put('models/wormA.glb',{len:10,x:107,z:-1,y:-0.6,rz:2.2,rx:0.35,anim:'Sandworm|SandwormIdle',mat:{color:0x9a6a52,roughness:0.55}})),
  j('golem',put('models/golemA.glb',{h:5.8,x:143,z:0,ry:LEFT,anim:0,emis:1})),
  j('worm',put('models/wormC.glb',{h:13,x:204,z:-3,y:-1,ry:LEFT,mat:{color:0x3e2a1e,roughness:0.6,metalness:0}})),
 ]);
 window.__A=A;
 // fire glow by the golem lava + muzzle light
 const gl=new THREE.PointLight(0xff5a10,8,9);gl.position.set(143,groundH(143)+3,2);S.add(gl);upd.push((dt,t)=>gl.intensity=6+Math.sin(t*7)*2);
}
