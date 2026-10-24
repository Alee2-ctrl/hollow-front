import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
export {THREE};
const R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setSize(innerWidth,innerHeight);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=0.9;R.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(R.domElement);
const S=new THREE.Scene();const CAM=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,900);
S.fog=new THREE.FogExp2(0xc8865a,0.006);
// ---------- noise + textures ----------
const P=new Uint8Array(512);{const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=(Math.sin(i*91.7)*43758.5453%1+1)%1*(i+1)|0;[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)P[i]=p[i&255];}
const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+(b-a)*t;
function grad(h,x,y,z){const u=h<8?x:y,v=h<4?y:(h===12||h===14?x:z);return((h&1)?-u:u)+((h&2)?-v:v);}
function noise(x,y,z=0){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fade(x),v=fade(y),w=fade(z);const A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
return lerp(lerp(lerp(grad(P[AA]&15,x,y,z),grad(P[BA]&15,x-1,y,z),u),lerp(grad(P[AB]&15,x,y-1,z),grad(P[BB]&15,x-1,y-1,z),u),v),lerp(lerp(grad(P[AA+1]&15,x,y,z-1),grad(P[BA+1]&15,x-1,y,z-1),u),lerp(grad(P[AB+1]&15,x,y-1,z-1),grad(P[BB+1]&15,x-1,y-1,z-1),u),v),w);}
function fbm(x,y,z=0,o=5){let s=0,a=0.5,f=1;for(let i=0;i<o;i++){s+=a*noise(x*f,y*f,z*f);f*=2;a*=0.5;}return s;}
// generic procedural material set: fn(u,v)->[r,g,b,height]
function texSet(size,fn,{rep=1,nrm=2.5,rough=null}={}){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),im=g.createImageData(size,size),H=new Float32Array(size*size);
 const rc=document.createElement('canvas');rc.width=rc.height=size;const rg=rc.getContext('2d'),ri=rg.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=fn(x/size,y/size),i=(y*size+x);H[i]=r[3];im.data[i*4]=r[0];im.data[i*4+1]=r[1];im.data[i*4+2]=r[2];im.data[i*4+3]=255;const ro=rough?rough(x/size,y/size,r):220;ri.data[i*4]=ri.data[i*4+1]=ri.data[i*4+2]=ro;ri.data[i*4+3]=255;}
 g.putImageData(im,0,0);rg.putImageData(ri,0,0);const nc=document.createElement('canvas');nc.width=nc.height=size;const ng=nc.getContext('2d'),ni=ng.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const h=k=>H[((k[1]+size)%size)*size+(k[0]+size)%size];const dx=(h([x+1,y])-h([x-1,y]))*nrm,dy=(h([x,y+1])-h([x,y-1]))*nrm;const l=Math.hypot(dx,dy,1),i=(y*size+x)*4;ni.data[i]=(-dx/l*0.5+0.5)*255;ni.data[i+1]=(dy/l*0.5+0.5)*255;ni.data[i+2]=(1/l*0.5+0.5)*255;ni.data[i+3]=255;}
 ng.putImageData(ni,0,0);const mk=(cv,srgb)=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t;};
 return{map:mk(c,1),normalMap:mk(nc),roughnessMap:mk(rc)};}
const T={};
const tl=(u,v,f)=>[u*f,v*f];// tileable-ish noise via periodic sampling
function pn(u,v,f,z=0,o=5){// periodic fbm on torus
 const a=u*Math.PI*2,b=v*Math.PI*2;return fbm(Math.cos(a)*f/6+9,Math.sin(a)*f/6+3,Math.cos(b)*f/6+Math.sin(b)*f/6*0.7+z,o);}
T.sand=texSet(256,(u,v)=>{const n=pn(u,v,14,0,5),r=Math.sin((u*6+pn(u,v,4,5,3)*1.6)*Math.PI*2*3)*0.5+0.5,gr=Math.random()*0.18;const h=r*0.35+n*0.7+gr*0.25;const k=0.78+n*0.35+gr;return[214*k,150*k,96*k,h];},{rep:30,nrm:3,rough:()=>235});
T.bandage=texSet(256,(u,v)=>{const st=Math.abs(Math.sin((v*18+pn(u,v,3,1,2)*1.2)*Math.PI)),n=pn(u,v,30,2,4),dirt=pn(u,v,4,7,3);const k=0.55+st*0.35+n*0.25-Math.max(0,dirt)*0.5;const blood=dirt>0.32?1:0;return[200*k+blood*-60,176*k-blood*90,132*k-blood*90,st*0.6+n*0.4];},{rep:1,nrm:4,rough:()=>245});
T.chitin=texSet(256,(u,v)=>{const n=pn(u,v,8,3,5),c=pn(u,v,40,4,3);const k=0.45+n*0.4;return[90*k+20,52*k+8,30*k+4,n*0.5+c*0.25];},{rep:1,nrm:2,rough:(u,v,r)=>90+r[3]*80});
T.rock=texSet(256,(u,v)=>{const n=pn(u,v,6,5,6),c=Math.abs(pn(u,v,12,8,3));const k=0.55+n*0.5-(c<0.04?0.35:0);return[170*k,112*k,70*k,n-(c<0.04?0.3:0)];},{rep:1,nrm:5,rough:()=>240});
T.bone=texSet(256,(u,v)=>{const n=pn(u,v,10,6,5),p=pn(u,v,40,9,2);const k=0.82+n*0.25;return[236*k,222*k,190*k-Math.max(0,p)*40,n*0.6+p*0.3];},{rep:1,nrm:2.2,rough:()=>190});
T.flesh=texSet(256,(u,v)=>{const ring=Math.sin(v*Math.PI*2*10+pn(u,v,3,2,2)*2)*0.5+0.5,n=pn(u,v,16,11,5),vein=Math.abs(pn(u,v,5,13,4))<0.03?1:0;const k=0.5+n*0.4+ring*0.25;return[150*k+vein*40,96*k-vein*20,70*k-vein*20,ring*0.8+n*0.4];},{rep:1,nrm:5,rough:(u,v,r)=>140+r[3]*60});
T.metal=texSet(256,(u,v)=>{const n=pn(u,v,8,14,5),s=pn(u,v,60,3,2);const rust=n>0.18?1:0;const k=0.8+s*0.2;return rust?[120*k,52*k,30*k,n]:[170*k,26*k,20*k,n*0.3];},{rep:1,nrm:1.4,rough:(u,v,r)=>r[1]<40?150:110});
T.stone=texSet(256,(u,v)=>{const n=pn(u,v,7,17,6),br=(Math.abs(Math.sin(v*Math.PI*8))<0.05)||(Math.abs(Math.sin((u+(Math.floor(v*8)%2)*0.0625)*Math.PI*8))<0.04);const k=0.7+n*0.35-(br?0.35:0);return[196*k,150*k,104*k,n-(br?0.4:0)];},{rep:1,nrm:4,rough:()=>235});
export {R,S,CAM,T,noise,fbm,BGU};
// ---------- sky ----------
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{sun:{value:new THREE.Vector3(-0.35,0.13,-1).normalize()},pit:{value:0}},vertexShader:`varying vec3 d;void main(){d=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}`,
fragmentShader:`varying vec3 d;uniform vec3 sun;uniform float pit;void main(){float h=clamp(d.y,-.1,1.);vec3 top=mix(vec3(.16,.08,.16),vec3(.10,.01,.02),pit),hor=mix(vec3(1.,.58,.32),vec3(.85,.18,.06),pit),low=vec3(.75,.42,.25);vec3 c=mix(hor,top,pow(max(h,0.),.55));c=mix(c,low,smoothstep(.02,-.1,d.y));float s=max(dot(d,sun),0.);c+=vec3(1.,.75,.45)*pow(s,900.)*6.+vec3(1.,.5,.25)*pow(s,12.)*.55+vec3(1.,.4,.2)*pow(s,3.)*.2;gl_FragColor=vec4(c,1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(800,32,16),skyMat);S.add(sky);
// ---------- lights ----------
const hemi=new THREE.HemisphereLight(0xffc9a0,0x5a3020,0.75);S.add(hemi);
const sun=new THREE.DirectionalLight(0xffb070,3.2);sun.position.set(-40,22,-30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-40;sc.right=40;sc.top=30;sc.bottom=-20;sc.near=1;sc.far=150;sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;S.add(sun);S.add(sun.target);
const rim=new THREE.DirectionalLight(0x7a8cff,0.55);rim.position.set(30,15,40);S.add(rim);
export {sky,skyMat,sun,hemi};
{const pm=new THREE.PMREMGenerator(R);new RGBELoader().load('ph/sky.hdr',h=>{S.environment=pm.fromEquirectangular(h).texture;S.environmentIntensity=0.55;h.dispose();});}
// ---------- terrain ----------
export const groundH=x=>0.35*Math.sin(x*0.09)+0.25*Math.sin(x*0.031+1)+fbm(x*0.03,0.5,0,3)*0.8;
const TL=new THREE.TextureLoader();
function phTex(n,rep){const f=(k,srgb)=>{const t=TL.load('ph/'+n+'_'+k+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t;};return{map:f('diff',1),normalMap:f('nor'),roughnessMap:f('rough'),aoMap:f('ao')};}
export {phTex};
const sandMat=new THREE.MeshStandardMaterial({...phTex('aerial_sand',[90,24]),color:0xffe2c4,roughness:1,normalScale:new THREE.Vector2(1.4,1.4)});
{const g=new THREE.PlaneGeometry(520,140,520,90);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);let h=groundH(x);const back=Math.max(0,-z-4);h+=back*back*0.004*(1+fbm(x*0.02,z*0.03,1,4)*1.4)+Math.max(0,-z-8)*0.1*Math.max(0,fbm(x*0.012,z*0.012,3,4)+0.2)*4;h+=Math.max(0,z-6)*0.05;h+=fbm(x*0.4,z*0.4,2,2)*0.06;p.setY(i,h);}g.computeVertexNormals();
 const m=new THREE.Mesh(g,sandMat);m.position.x=180;m.receiveShadow=true;S.add(m);}
// far mesas
{const mm=new THREE.MeshStandardMaterial({...T.rock,color:0xc08060,roughness:1});for(let i=0;i<26;i++){const g=new THREE.CylinderGeometry(6+Math.random()*10,14+Math.random()*12,12+Math.random()*26,24,10);const p=g.attributes.position;for(let k=0;k<p.count;k++){const v=new THREE.Vector3().fromBufferAttribute(p,k),n=fbm(v.x*0.15,v.y*0.15,v.z*0.15+i,4);v.multiplyScalar(1).add(new THREE.Vector3(v.x,0,v.z).normalize().multiplyScalar(n*4));v.y+=Math.abs(n)*(v.y>0?2:0);p.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();const m=new THREE.Mesh(g,mm);m.position.set(-40+i*22+Math.random()*10,0,-150-Math.random()*90);S.add(m);}}
export {sandMat};
// ---------- sand storm particles ----------
function sprite(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,220,180,1)');gr.addColorStop(1,'rgba(255,220,180,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
export const SPR=sprite();
const N=5000,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3);for(let i=0;i<N;i++){pp[i*3]=Math.random()*400-20;pp[i*3+1]=Math.random()*14;pp[i*3+2]=Math.random()*50-35;}pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
const dust=new THREE.Points(pg,new THREE.PointsMaterial({map:SPR,size:0.12,color:0xffc890,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));S.add(dust);
const haze=[];{const hm=new THREE.SpriteMaterial({map:SPR,color:0xd89060,transparent:true,opacity:0.16,depthWrite:false});for(let i=0;i<120;i++){const s=new THREE.Sprite(hm);s.position.set(Math.random()*400-20,1+Math.random()*5,-6-Math.random()*40);s.scale.setScalar(10+Math.random()*16);S.add(s);haze.push(s);}}
// ---------- post ----------
const C=new EffectComposer(R);C.addPass(new RenderPass(S,CAM));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.35,0.5,0.96);C.addPass(bloom);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},t:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float t;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 q=vUv-.5;c.rgb*=1.-dot(q,q)*1.1;c.rgb+=(h(vUv*vec2(1920.,1080.)+t)-.5)*.035;c.rgb=mix(c.rgb,c.rgb*vec3(1.06,.98,.9),.5);gl_FragColor=c;}`});C.addPass(grade);C.addPass(new OutputPass());
addEventListener('resize',()=>{CAM.aspect=innerWidth/innerHeight;CAM.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);C.setSize(innerWidth,innerHeight);});
// ---------- shared ----------
export const upd=[];export const clock=new THREE.Clock();
export const M={sand:sandMat};
export function loadSoldier(){return new Promise(r=>new GLTFLoader().load('Soldier.glb',g=>r(g)));}
export {C,grade,dust,N,haze};
