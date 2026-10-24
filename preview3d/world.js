import {THREE,S,groundH,upd} from './core.js';
import {put} from './asset.js';
const ROCKS=['namaqualand_boulder_02','namaqualand_boulder_05','rock_07','boulder_01'];
const R=(a,b)=>a+Math.random()*(b-a);
export async function init(){
 const jobs=[];
 // photo-scanned rocks scattered behind the play lane and a few in front
 for(let i=0;i<70;i++){const n=ROCKS[i%4],x=R(-10,230),z=R(-22,-3),big=Math.random()<0.25;jobs.push(put(`ph/${n}/${n}.gltf`,{len:big?R(3,7):R(0.6,2.2),x,z,y:-0.15,ry:R(0,6.28),clone:true}));}
 for(let i=0;i<24;i++){const n=ROCKS[i%4],x=R(-10,230);jobs.push(put(`ph/${n}/${n}.gltf`,{len:R(0.25,0.7),x,z:R(1.2,3),y:-0.05,ry:R(0,6.28),clone:true}));}
 for(let i=0;i<12;i++){const x=i*20+R(-4,4);jobs.push(put('ph/namaqualand_cliff_02/namaqualand_cliff_02.gltf',{len:R(20,30),x,z:R(-70,-55),y:-3,ry:R(0,6.28),clone:true}));}
 // Bone Dunes: giant fossil skeleton + skull
 jobs.push(put('models/horseskel.glb',{h:8,x:36.5,z:-8,y:-1.4,ry:0.9,rz:0.1,mat:{color:0x8c7c62,roughness:0.8,metalness:0}}));
 jobs.push(put('models/dragonskull.glb',{len:3.2,x:47,z:-3.5,y:-0.4,ry:-0.9,rx:-0.15}));
 // Buried Temple ruins
 jobs.push(put('models/ruinsB.glb',{len:46,x:82,z:-16,y:-0.6,tint:0xa07850,tintAmt:0.45}));
 // Abandoned outpost
// jobs.push(put('models/tankwreck.glb',{len:9,x:134,z:-6,y:-0.3,ry:0.3,mat:{color:0x4a3a2c,roughness:0.95,metalness:0,nomap:1}}));
 // Maw pit ring of cliffs
 for(let i=0;i<8;i++){jobs.push(put('ph/namaqualand_cliff_02/namaqualand_cliff_02.gltf',{len:R(16,24),x:186+i*6,z:-22-R(0,6),y:-0.5,ry:R(0,6.28),clone:true}));}
 await Promise.allSettled(jobs);
}
