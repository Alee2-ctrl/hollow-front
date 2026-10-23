import {THREE,S,T,fbm,groundH,upd,loadSoldier} from './core.js';
import {rock,tube,MAT} from './world.js';
const sh=o=>{o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});return o;};
const put=(o,x,z=0,y=0)=>{o.position.set(x,groundH(x)+y,z);S.add(sh(o));return o;};
const glowM=(c,i=6)=>new THREE.MeshStandardMaterial({color:0x000000,emissive:c,emissiveIntensity:i});
const cap=(r,l,m)=>new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,14),m);
function limb(parent,a,b,r,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),c=cap(r,Math.max(0.01,d.length()-r*2),m);c.position.copy(A).add(B).multiplyScalar(0.5);c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(c);return c;}
let mixer;const F={};
function mouth(hd,mat,M,k){const dm=mat.clone();dm.side=THREE.DoubleSide;
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const pg=new THREE.CylinderGeometry(2.5*k,1.6*k,1.8*k,20,6,true,a+0.08,Math.PI*2/3-0.16);const pp=pg.attributes.position;for(let j=0;j<pp.count;j++){const y=pp.getY(j)/(1.8*k)+0.5,x=pp.getX(j),z=pp.getZ(j),f=1+y*y*0.5;pp.setX(j,x*f);pp.setZ(j,z*f);pp.setY(j,pp.getY(j)-y*y*0.3*k);}pg.computeVertexNormals();const pe=new THREE.Mesh(pg,dm);pe.position.y=0.9*k;pe.castShadow=true;hd.add(pe);}
 for(let r=0;r<4;r++)for(let i=0;i<18;i++){const a=i/18*Math.PI*2+r*0.17,R=(2.2-r*0.28)*k,y=(1.4-r*0.45)*k,t=new THREE.Mesh(new THREE.ConeGeometry(0.1*k,(0.75-r*0.1)*k,7),M.tooth);t.position.set(Math.sin(a)*R,y,Math.cos(a)*R);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-Math.sin(a),-0.45,-Math.cos(a)).normalize());hd.add(t);}
 const th=new THREE.Mesh(new THREE.CircleGeometry(1.5*k,32),new THREE.MeshStandardMaterial({color:0,emissive:0xff4a10,emissiveIntensity:5}));th.rotation.x=-Math.PI/2;th.position.y=-0.2*k;hd.add(th);
 const gul=new THREE.Mesh(new THREE.CylinderGeometry(1.5*k,1.2*k,0.6*k,24,1,true),new THREE.MeshStandardMaterial({color:0x2a0604,roughness:0.6,side:THREE.DoubleSide}));gul.position.y=0.05*k;hd.add(gul);}
export function focus(k){}
export async function init(){
 const M={band:new THREE.MeshStandardMaterial({...T.bandage,roughness:0.95}),chit:new THREE.MeshPhysicalMaterial({...T.chitin,clearcoat:0.7,clearcoatRoughness:0.35,roughness:0.5}),flesh:new THREE.MeshStandardMaterial({...T.flesh,roughness:0.7}),
  dark:new THREE.MeshStandardMaterial({color:0x140a06,roughness:0.6}),feather:new THREE.MeshStandardMaterial({color:0x2a1c14,roughness:0.85,side:THREE.DoubleSide,normalMap:T.chitin.normalMap}),skin:new THREE.MeshStandardMaterial({color:0xb07060,roughness:0.6,normalMap:T.flesh.normalMap}),
  shell:new THREE.MeshPhysicalMaterial({color:0x1a2a2c,roughness:0.25,metalness:0.3,clearcoat:1,iridescence:1,iridescenceIOR:1.6,normalMap:T.chitin.normalMap}),tooth:new THREE.MeshStandardMaterial({color:0xf0e4c8,roughness:0.35}),lava:glowM(0xff5a10,5),eyeG:glowM(0x60ffd0,8),eyeR:glowM(0xff3010,8),eyeO:glowM(0xff9020,8),
  red:new THREE.MeshStandardMaterial({...T.metal,color:0xb01810,metalness:0.5,roughness:0.4}),gun:new THREE.MeshStandardMaterial({color:0x202226,metalness:0.85,roughness:0.35})};
 // ---------- PLAYER ----------
 const gl=await loadSoldier();const sol=gl.scene;sol.scale.setScalar(1.05);sol.rotation.y=-Math.PI/2;put(sol,2.4,0.4);mixer=new THREE.AnimationMixer(sol);mixer.clipAction(gl.animations.find(a=>a.name==='Run')).play();
 let hand;sol.traverse(o=>{if(o.isBone&&/RightHand$/.test(o.name))hand=o;if(o.isMesh)o.material.roughness=0.7;});
 if(hand){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.12,0.6),M.gun);b.position.z=0.2;g.add(b);const br=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.4,8),M.gun);br.rotation.x=Math.PI/2;br.position.z=0.65;g.add(br);const mg=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.2,0.08),M.gun);mg.position.set(0,-0.14,0.15);g.add(mg);g.scale.setScalar(55);g.rotation.set(0,Math.PI/2,Math.PI/2);hand.add(g);}
 upd.push(dt=>mixer.update(dt));
 const ml=new THREE.PointLight(0xffa040,0,6);ml.position.set(3.4,groundH(3.4)+1.4,0.6);S.add(ml);upd.push((dt,t)=>{ml.intensity=(Math.sin(t*40)>0.6)?18:0;});
 // ---------- TANK ----------
 {const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(4.4,1,2.4),M.red);hull.position.y=1.1;g.add(hull);const fr=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.8,2.3),M.red);fr.position.set(2.3,0.95,0);fr.rotation.z=0.6;g.add(fr);
  const tur=new THREE.Mesh(new THREE.SphereGeometry(1.05,32,16,0,Math.PI*2,0,Math.PI/2),M.red);tur.scale.set(1.2,0.7,1);tur.position.y=1.6;g.add(tur);const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,3,14),M.gun);bar.rotation.z=-1.35;bar.position.set(1.9,2.2,0);g.add(bar);
  const pod=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.5,0.6),M.gun);pod.position.set(-0.5,2.1,1.1);g.add(pod);for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.1,10),M.lava);m.rotation.z=Math.PI/2;m.position.set(-0.08,2.0+(i>>1)*0.2,1.0+(i&1)*0.2);g.add(m);}
  for(const s of[-1,1]){const tr=new THREE.Mesh(new THREE.CapsuleGeometry(0.5,3.8,6,16),new THREE.MeshStandardMaterial({color:0x1a1a1c,roughness:0.85,normalMap:T.stone.normalMap}));tr.rotation.z=Math.PI/2;tr.scale.set(1,1,0.9);tr.position.set(0,0.5,s*1.25);g.add(tr);for(let i=0;i<6;i++){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.5,18),M.gun);w.rotation.x=Math.PI/2;w.position.set(-1.8+i*0.72,0.5,s*1.3);g.add(w);}}
  put(g,7.5,-1.6,0);g.rotation.y=-0.25;}
 // ---------- MUMMY ----------
 const mummy=(x,z,ph)=>{const g=new THREE.Group();const torso=cap(0.26,0.55,M.band);torso.position.y=1.25;torso.rotation.z=0.25;g.add(torso);const pel=cap(0.22,0.15,M.band);pel.position.set(0.05,0.9,0);g.add(pel);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,24,16),M.band);head.scale.set(0.95,1.15,0.9);head.position.set(0.25,1.78,0);g.add(head);const jaw=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.05,0.14),M.dark);jaw.position.set(0.42,1.68,0);g.add(jaw);
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,6),M.eyeG);e.position.set(0.41,1.83,s*0.07);g.add(e);
   limb(g,[0.15,1.5,s*0.25],[0.55,1.48+s*0.05,s*0.3],0.07,M.band);limb(g,[0.55,1.48,s*0.3],[0.95,1.5-s*0.06,s*0.26],0.06,M.band);
   limb(g,[0.05,0.85,s*0.14],[0.1+s*0.18,0.45,s*0.15],0.1,M.band);limb(g,[0.1+s*0.18,0.45,s*0.15],[s*0.25-0.05,0.06,s*0.15],0.08,M.band);
   for(let k=0;k<3;k++){const st=tube([[0.1,1.2-k*0.3,s*0.2],[-0.2,1.0-k*0.3,s*0.3],[-0.45,0.8-k*0.25+Math.sin(k)*0.1,s*0.25]],0.025,M.band,10,4);g.add(st);}}
  const gl2=new THREE.PointLight(0x60ffd0,3,2.5);gl2.position.set(0.6,1.8,0);g.add(gl2);put(g,x,z);upd.push((dt,t)=>{g.rotation.z=Math.sin(t*1.8+ph)*0.05;g.position.y=groundH(x)+Math.abs(Math.sin(t*1.8+ph))*0.05;});return g;};
 mummy(34,0.5,0);mummy(37.5,-2,1.6);
 // ---------- SCORPION ----------
 {const g=new THREE.Group();const seg=[];for(let i=0;i<7;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.5,24,16),M.chit);s.scale.set(0.55,0.42-Math.abs(i-2)*0.03,0.75-Math.abs(i-2)*0.06);s.position.set(1.2-i*0.48,0.62,0);g.add(s);}
  const hd=new THREE.Mesh(new THREE.SphereGeometry(0.45,24,16),M.chit);hd.scale.set(0.9,0.5,0.85);hd.position.set(1.65,0.6,0);g.add(hd);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),M.eyeR);e.position.set(1.95,0.75,s*0.12);g.add(e);}
  for(let i=0;i<4;i++)for(const s of[-1,1]){const lx=1-i*0.42;limb(g,[lx,0.55,s*0.3],[lx-0.1,0.95,s*0.9],0.06,M.chit);limb(g,[lx-0.1,0.95,s*0.9],[lx-0.3,0,s*1.25],0.05,M.chit);}
  for(const s of[-1,1]){limb(g,[1.8,0.55,s*0.3],[2.3,0.7,s*0.75],0.11,M.chit);limb(g,[2.3,0.7,s*0.75],[2.8,0.75,s*0.6],0.1,M.chit);const cl=new THREE.Mesh(new THREE.SphereGeometry(0.4,24,16),M.chit);cl.scale.set(1.1,0.55,0.6);cl.position.set(3.1,0.75,s*0.6);g.add(cl);const f1=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.7,12),M.chit);f1.rotation.z=-Math.PI/2-0.25;f1.position.set(3.65,0.88,s*0.6);g.add(f1);const f2=f1.clone();f2.rotation.z=-Math.PI/2+0.3;f2.position.set(3.6,0.62,s*0.6);g.add(f2);}
  const tp=[[-1.8,0.65,0],[-2.6,1.2,0],[-2.9,2.1,0],[-2.6,2.9,0],[-1.9,3.3,0],[-1.2,3.2,0]];const tl=tube(tp,0.3,M.chit,60,14,u=>1-u*0.55);g.add(tl);for(let i=1;i<6;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(0.27-i*0.025,0.04,8,20),M.chit);r.position.set(...tp[i]);r.lookAt(new THREE.Vector3(...tp[Math.min(5,i+1)]).add(new THREE.Vector3(0.001,0,0)));g.add(r);}
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,14),glowM(0x9aff30,2.5));bulb.scale.set(1.2,0.9,0.9);bulb.position.set(-0.95,3.05,0);g.add(bulb);const sting=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.6,10),M.tooth);sting.position.set(-0.7,2.75,0);sting.rotation.z=2.5;g.add(sting);
  const vl=new THREE.PointLight(0x9aff30,6,5);vl.position.set(-0.9,3,0.4);g.add(vl);g.rotation.y=Math.PI;g.scale.setScalar(1.5);put(g,45,1);upd.push((dt,t)=>{tl.rotation.z=Math.sin(t*1.5)*0.05;});}
 // ---------- LARVA (shot 3) ----------
 const larva=(x,z,sc)=>{const g=new THREE.Group(),pts=[];for(let i=0;i<9;i++){const u=i/8;pts.push([-Math.sin(u*2.4)*0.6*u,u*3.4-0.6,0]);}const body=tube(pts,0.42,M.flesh,60,16,u=>1-u*0.25);g.add(body);
  for(let i=1;i<9;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(0.4-i*0.012,0.05,8,24),M.flesh);r.position.set(...pts[i]);r.rotation.x=Math.PI/2;g.add(r);}
  const hd=new THREE.Group();hd.position.set(...pts[8]);hd.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-0.35,0.55,0.75).normalize());mouth(hd,M.flesh,M,0.28);g.add(hd);g.scale.setScalar(sc);put(g,x,z,-0.2);
  const dr=new THREE.Group();for(let i=0;i<14;i++){const r=rock(0.15+Math.random()*0.2,i+500,MAT.rock);r.material=new THREE.MeshStandardMaterial({...T.sand,roughness:1});const a=i/14*Math.PI*2;r.position.set(Math.cos(a)*0.8*sc,0,Math.sin(a)*0.8*sc);dr.add(r);}put(dr,x,z,0);upd.push((dt,t)=>{g.rotation.z=Math.sin(t*2)*0.08;});};
 larva(105.5,0,1);larva(42,-3,0.7);
 // ---------- SAND WRAITH ----------
 {const g=new THREE.Group();const pr=[];for(let i=0;i<=20;i++){const u=i/20;pr.push(new THREE.Vector2(0.1+Math.sin(u*Math.PI*0.9)*0.7+u*0.25,2.4-u*2.6));}const cl=new THREE.Mesh(new THREE.LatheGeometry(pr,40),new THREE.MeshStandardMaterial({color:0x6a4a32,roughness:1,transparent:true,opacity:0.92,side:THREE.DoubleSide,normalMap:T.bandage.normalMap}));g.add(cl);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(0.45,24,16,0,Math.PI*2,0,Math.PI*0.65),cl.material);hood.position.y=2.3;hood.rotation.z=0.5;g.add(hood);const sk=new THREE.Mesh(new THREE.SphereGeometry(0.24,20,14),M.tooth);sk.scale.set(0.9,1.1,0.85);sk.position.set(0.22,2.18,0);g.add(sk);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,6),M.eyeO);e.position.set(0.43,2.24,s*0.08);g.add(e);limb(g,[0,1.9,s*0.4],[0.6,1.6,s*0.7],0.08,cl.material);for(let k=0;k<4;k++)limb(g,[0.6,1.6,s*0.7],[0.85,1.5-k*0.06,s*(0.6+k*0.07)],0.015,M.tooth);}
  const wl=new THREE.PointLight(0xff9020,5,4);wl.position.set(0.6,2.2,0);g.add(wl);put(g,76,0,1.4);upd.push((dt,t)=>{g.position.y=groundH(76)+1.4+Math.sin(t*1.6)*0.25;g.rotation.y=Math.sin(t*0.7)*0.2;});}
 // ---------- BEETLE ----------
 {const g=new THREE.Group();const sh2=new THREE.Mesh(new THREE.SphereGeometry(1.2,48,32,0,Math.PI*2,0,Math.PI/2),M.shell);sh2.scale.set(1.35,0.95,1);sh2.position.y=0.55;g.add(sh2);const seam=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.03,6,60,Math.PI),M.dark);seam.rotation.y=Math.PI/2;seam.scale.set(1,0.95,1.35);seam.position.y=0.55;g.add(seam);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(0.5,24,16),M.shell);hd.scale.set(1,0.75,1);hd.position.set(1.65,0.6,0);g.add(hd);const horn=tube([[1.9,0.7,0],[2.4,1.1,0],[2.6,1.8,0],[2.45,2.3,0]],0.16,M.tooth,30,10,u=>1-u*0.9);g.add(horn);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),M.eyeR);e.position.set(2.0,0.72,s*0.25);g.add(e);}
  for(let i=0;i<3;i++)for(const s of[-1,1]){const lx=0.8-i*0.8;limb(g,[lx,0.5,s*0.9],[lx+0.2,0.7,s*1.5],0.08,M.dark);limb(g,[lx+0.2,0.7,s*1.5],[lx-0.1,0,s*1.75],0.06,M.dark);}
  put(g,86,0.5,0);g.rotation.y=Math.PI;}
 // ---------- VULTURE ----------
 {const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(0.5,24,16),M.feather);b.scale.set(1.5,0.7,0.8);g.add(b);const ruff=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.14,10,20),new THREE.MeshStandardMaterial({color:0xe8dcc4,roughness:1}));ruff.position.set(0.65,0.15,0);ruff.rotation.y=Math.PI/2;g.add(ruff);
  const nk=tube([[0.7,0.15,0],[0.95,0.45,0],[1.15,0.5,0]],0.09,M.skin,12,8);g.add(nk);const hd=new THREE.Mesh(new THREE.SphereGeometry(0.17,16,12),M.skin);hd.position.set(1.22,0.52,0);g.add(hd);const bk=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.32,10),M.dark);bk.rotation.z=-Math.PI/2-0.4;bk.position.set(1.45,0.45,0);g.add(bk);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),M.eyeR);e.position.set(1.3,0.58,s*0.11);g.add(e);}
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();for(let i=0;i<14;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(0.28,1.1+i*0.04),M.feather);const u=i/13;f.position.set(0.3-u*0.3+(i>9?(i-9)*0.12:0),0,s*(0.2+u*2.3));f.rotation.x=-Math.PI/2;f.rotation.z=0.2+u*0.5;f.translateY(-0.4);w.add(f);}g.add(w);wings.push([w,s]);}
  const tail=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.6),M.feather);tail.rotation.x=-Math.PI/2;tail.position.set(-0.95,0,0);g.add(tail);
  g.position.set(82,8,-2);g.rotation.y=Math.PI*0.9;S.add(sh(g));upd.push((dt,t)=>{for(const[w,s]of wings)w.rotation.x=s*Math.sin(t*3)*0.45;g.position.x=82+Math.sin(t*0.4)*4;g.position.y=8+Math.sin(t*0.8)*0.6;g.rotation.y=Math.PI*0.9+Math.cos(t*0.4)*0.4;});}
 // ---------- GOLEM ----------
 {const g=new THREE.Group();const lava=M.lava;const add=(o,x,y,z)=>{o.position.set(x,y,z);g.add(o);return o;};
  for(const s of[-1,1]){add(rock(0.9,s+10,MAT.rock),0,1,s*0.9);add(rock(1.1,s+11,MAT.rock),0,2.6,s*0.95);}
  const ch=add(rock(2.4,20,MAT.rock),0,5.8,0);ch.scale.set(1,1.15,1.05);add(rock(1.7,21,MAT.rock),0.3,4,0);
  for(let i=0;i<4;i++)for(const s of[-1,1])g.add(tube([[1.9,7-i*0.7,0],[2.2,6.8-i*0.7,s*1.2],[1.4,6.5-i*0.7,s*2.2],[0,6.2-i*0.7,s*2.4]],0.14,MAT.bone,20,8));const spn=tube([[2.05,7.5,0],[2.2,5.5,0],[1.9,3.8,0]],0.2,MAT.bone,20,8);g.add(spn);
  for(let i=0;i<9;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9+Math.random(),0.06),lava);c.position.set(1.9+Math.random()*0.5,4+Math.random()*3.4,(Math.random()-0.5)*3);c.rotation.set(Math.random(),Math.random(),Math.random());g.add(c);}
  for(const s of[-1,1]){const shl=add(rock(1.1,s+30,MAT.bone),0,7.9,s*2.7);for(let k=0;k<3;k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.22,1.4,8),MAT.bone);sp.position.set(-0.3+k*0.4,8.8,s*(2.6+k*0.1));sp.rotation.x=-s*0.4;g.add(sp);}
   add(rock(0.8,s+40,MAT.rock),0.6,6.2,s*3.2);add(rock(0.75,s+41,MAT.rock),1.3,4.6,s*3.3);const fist=add(rock(1,s+42,MAT.rock),1.6,3,s*3.2);for(let k=0;k<4;k++){const cw=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.8,8),MAT.bone);cw.position.set(2.4,2.6-k*0.1,s*3.2+(k-1.5)*0.3);cw.rotation.z=-2.2;g.add(cw);}}
  const sk=add(rock(0.95,55,MAT.bone),0.4,8.9,0);sk.scale.set(1,1.15,0.9);for(const s of[-1,1]){const so=add(new THREE.Mesh(new THREE.SphereGeometry(0.25,12,10),M.dark),1.2,9.1,s*0.33);const e=add(new THREE.Mesh(new THREE.SphereGeometry(0.12,10,8),lava),1.3,9.1,s*0.33);const hn=tube([[0.4,9.6,s*0.6],[0.2,10.4,s*1.2],[0.7,11.3,s*1.5]],0.18,MAT.bone,16,8,u=>1-u*0.9);g.add(hn);}
  for(let i=0;i<6;i++)add(new THREE.Mesh(new THREE.ConeGeometry(0.05,0.25,6),M.tooth),1.22,8.45,(i-2.5)*0.11).rotation.z=Math.PI;
  const ll=new THREE.PointLight(0xff5a10,4,10);ll.position.set(4.5,6,1);g.add(ll);const el=new THREE.PointLight(0xff5a10,1,4);el.position.set(1.8,9.1,0);g.add(el);
  g.rotation.y=Math.PI;put(g,144,-0.5,-0.3);upd.push((dt,t)=>{ll.intensity=4+Math.sin(t*4)*1.5;lava.emissiveIntensity=4+Math.sin(t*4)*1.5;});}
 // ---------- DEVOURER ----------
 {const hx=[[188,7,-2],[195,10,-6],[201,8.5,1]],base=[[198,-1,-4],[205,-1,-9],[208,-1,-1]];
  for(let h=0;h<3;h++){const [bx,,bz]=base[h],[tx,ty,tz]=hx[h];const pts=[[bx,groundH(bx)-2,bz],[bx-1,groundH(bx)+ty*0.4,bz+0.5],[ (bx+tx)/2+1.5,ty*0.95,(bz+tz)/2],[tx+1.8,ty+0.6,tz],[tx,ty,tz]];
   const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const seg=120,rs=28,g=new THREE.TubeGeometry(c,seg,1.6,rs,false),p=g.attributes.position;
   for(let i=0;i<=seg;i++){const u=i/seg,cp=c.getPointAt(u),s=(1.15-u*0.25)*(1+0.09*Math.pow(Math.abs(Math.sin(u*Math.PI*22)),3));for(let j=0;j<=rs;j++){const k=i*(rs+1)+j,v=new THREE.Vector3().fromBufferAttribute(p,k).sub(cp);v.multiplyScalar(s*(1+fbm(u*20,j*0.3,h,3)*0.06));v.add(cp);p.setXYZ(k,v.x,v.y,v.z);}}
   g.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({...T.flesh,roughness:0.75});mat.map=mat.map.clone();mat.map.repeat.set(10,1);mat.normalMap=mat.normalMap.clone();mat.normalMap.repeat.set(10,1);mat.map.needsUpdate=mat.normalMap.needsUpdate=true;
   const body=new THREE.Mesh(g,mat);body.castShadow=body.receiveShadow=true;S.add(body);
   for(let i=4;i<seg-6;i+=7){const u=i/seg,cp=c.getPointAt(u),tg=c.getTangentAt(u);for(let k=0;k<5;k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.9,8),MAT.bone);const n=new THREE.Vector3(0,1,0).applyAxisAngle(tg,(k-2)*0.5).projectOnPlane(tg).normalize();sp.position.copy(cp).addScaledVector(n,1.75*(1.15-u*0.25));sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n);S.add(sp);sp.castShadow=true;}}
   // head facing player (-x)
   const hd=new THREE.Group();hd.position.set(tx,ty,tz);const dir=new THREE.Vector3(-0.75,-0.15-h*0.05,0.65).normalize();hd.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);S.add(hd);
   mouth(hd,mat,M,1);
   const thl=new THREE.PointLight(0xff6a20,40,12);thl.position.y=0.6;hd.add(thl);
   upd.push((dt,t)=>{hd.position.y=ty+Math.sin(t*1.2+h*2)*0.3;});}
  // spike projectiles
  for(let i=0;i<5;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.9,8),M.tooth);sp.rotation.z=Math.PI/2+0.3;sp.position.set(182-i*1.8,6-i*0.6,-1.8);S.add(sp);}
  const big=new THREE.Mesh(new THREE.ConeGeometry(0.5,4,12),MAT.bone);big.rotation.z=Math.PI/2+0.45;big.position.set(181,4.5,0.8);big.castShadow=true;S.add(big);}
}
