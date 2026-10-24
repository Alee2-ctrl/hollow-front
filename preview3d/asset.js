import {THREE,S,groundH,upd} from './core.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
const GL=new GLTFLoader(),cache={};
export function load(path){return cache[path]||(cache[path]=new Promise((r,j)=>GL.load(path,r,undefined,e=>{console.error('load fail',path,e);j(e);})));}
// place a model: h = target height, len = target longest horizontal size
export async function put(path,{h,len,x=0,z=0,y=0,ry=0,rx=0,rz=0,anim,speed=1,tint,tintAmt=1,clone=false,emis,mat,renorm}={}){
 const g=await load(path);const o=clone?SU.clone(g.scene):g.scene;
 o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(o,true),sz=b.getSize(new THREE.Vector3());
 const s=h?h/sz.y:len/Math.max(sz.x,sz.z);o.scale.multiplyScalar(s);
 o.position.set(o.position.x*s-(b.min.x+b.max.x)/2*s,o.position.y*s-b.min.y*s,o.position.z*s-(b.min.z+b.max.z)/2*s);
 const w=new THREE.Group();w.add(o);w.rotation.set(rx,ry,rz);w.position.set(x,groundH(x)+y,z);S.add(w);
 o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(m.isSkinnedMesh)m.frustumCulled=false;
  const fix=mt=>{if(mt.isMeshBasicMaterial){const n=new THREE.MeshStandardMaterial({map:mt.map,color:mt.color,transparent:mt.transparent,alphaTest:mt.alphaTest,side:mt.side,roughness:0.9});return n;}if(emis===undefined&&mt.emissive){mt.emissive.setHex(0);mt.emissiveMap=null;}if(mat){mt=new THREE.MeshStandardMaterial({map:mat.nomap?null:(mt.map||null),normalMap:mt.normalMap||null,aoMap:mt.aoMap||null,side:mt.side,transparent:mt.transparent,alphaTest:mt.alphaTest||0,color:mat.color??0xffffff,roughness:mat.roughness??0.8,metalness:mat.metalness??0});if(mt.map)mt.map.colorSpace=THREE.SRGBColorSpace;}else if(!mt.map&&mt.metalness>0.3){mt.metalness=0.1;}return mt;};
  if(m.geometry.attributes.tangent)m.geometry.deleteAttribute('tangent');if(renorm){m.geometry.deleteAttribute('normal');m.geometry.computeVertexNormals();}m.material=Array.isArray(m.material)?m.material.map(fix):fix(m.material);
  if(tint||emis){m.material=m.material.clone();if(tint)m.material.color.lerp(new THREE.Color(tint),tintAmt);if(emis!==undefined&&m.material.emissive)m.material.emissiveIntensity=emis;}}});
 if(anim!==undefined&&g.animations.length){const mx=new THREE.AnimationMixer(o);const c=(typeof anim==='string'&&THREE.AnimationClip.findByName(g.animations,anim))||g.animations[typeof anim==='number'?anim:0]||g.animations[0];mx.clipAction(c).play();upd.push(dt=>mx.update(dt*speed));w.userData.anims=g.animations.map(a=>a.name);}
 w.userData.size=sz.clone().multiplyScalar(s);w.userData.cull=true;return w;}
