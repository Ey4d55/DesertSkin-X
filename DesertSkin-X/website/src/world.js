import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {makeSoftwareRenderer} from './software.js';

export function createWorld(onSelect){
 const host=document.getElementById('viewport'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);
 scene.background=new THREE.Color('#0b151c');
 const specimen=new THREE.Group();scene.add(specimen);specimen.rotation.y=-.08;
 const groups={},anchors={},labels={},meshes=[];let seed=12345;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const mat=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.7,...extra});
 const fiber=mat('#a0b8b9',{roughness:.65,metalness:.12}),nodeMat=mat('#c7d6d2',{roughness:.6}),silica=mat('#dae7de',{roughness:.22,clearcoat:.8}),go=mat('#2a4e54',{metalness:.35,roughness:.6,side:THREE.DoubleSide}),gel=mat('#bd9064',{roughness:.22,clearcoat:1,clearcoatRoughness:.18,transparent:true,opacity:.62,side:THREE.DoubleSide,depthWrite:false}),gelSide=mat('#d48a4c',{roughness:.3,transparent:true,opacity:.89,side:THREE.DoubleSide}),polymer=mat('#f0bf7b',{roughness:.45,metalness:.05}),interfaceMat=mat('#659d9b',{roughness:.5,metalness:.12}),water=mat('#6acac6',{roughness:.12,clearcoat:1,metalness:.08});
 function group(id,parent=specimen){const g=new THREE.Group();parent.add(g);if(id){g.userData.component=id;groups[id]=g;}return g;}
 function add(geometry,material,position,parent){const m=new THREE.Mesh(geometry,material);if(position)m.position.set(...position);(parent||specimen).add(m);meshes.push(m);return m;}
 function strut(a,b,r,material,parent,sides=5){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const m=add(new THREE.CylinderGeometry(r,r*.92,v.length(),sides,1,false),material,p.clone().add(q).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 const aerogel=group('aerogel'),hydrogel=group('hydrogel'),inter=group('interface'),hydration=group('hydration');
 // A deterministic open-cell network: schematic porosity, not measured pore geometry.
 const points=[];
 for(let attempt=0;points.length<132&&attempt<8000;attempt++){
  const p=[(rand()-.5)*7.25,-.94+rand()*1.18,(rand()-.5)*4.35];
  if(points.every(q=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])>.46))points.push(p);
 }
 for(const p of points){const m=add(new THREE.IcosahedronGeometry(.067+rand()*.045,0),nodeMat,p,aerogel);m.scale.set(1.2,.9,1);}
 const edgeSet=new Set();
 for(let i=0;i<points.length;i++){
  const p=points[i],neighbors=points.map((q,j)=>({j,d:Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])})).filter(v=>v.j!==i&&v.d<1.65).sort((a,b)=>a.d-b.d).slice(0,4);
  for(const {j}of neighbors){const key=[Math.min(i,j),Math.max(i,j)].join('-');if(edgeSet.has(key))continue;edgeSet.add(key);const q=points[j],mid=p.map((v,k)=>(v+q[k])*.5+(rand()-.5)*.25),curve=new THREE.CatmullRomCurve3([new THREE.Vector3(...p),new THREE.Vector3(...mid),new THREE.Vector3(...q)]);add(new THREE.TubeGeometry(curve,3,.035+rand()*.026,5,false),fiber,null,aerogel);}
 }
 for(let i=0;i<24;i++){const p=[(rand()-.5)*7,-.85+rand()*1.2,(rand()-.5)*4.2];if(i%3===0){const m=add(new THREE.BoxGeometry(.28+rand()*.28,.015,.16+rand()*.2),go,p,aerogel);m.rotation.set(rand()*.9,rand()*Math.PI,rand()*.8);}else add(new THREE.IcosahedronGeometry(.04+rand()*.04,1),silica,p,aerogel);}
 // Thin interface bridges; intentionally distinct from either bulk layer.
 for(let i=0;i<18;i++){const x=-3.5+(i%9)*.88,z=i<9?-1.55:1.55;strut([x,.08,z],[x+.12,.55,z-.1],.022,interfaceMat,inter,5);}
 function topY(x,z){return .74+.055*Math.sin(x*1.8+z*.6)+.035*Math.cos(z*2.7)+.028*Math.sin(x*5.1-z*2.1);}
 function makeSheet(cut){const geo=new THREE.BufferGeometry(),positions=[],segmentsX=32,segmentsZ=20;
  const y=(x,z,bottom)=>topY(x,z)-(bottom?.23:0);
  const point=(i,j,bottom)=>[-3.75+i/segmentsX*7.5,y(-3.75+i/segmentsX*7.5,-2.3+j/segmentsZ*4.6,bottom),-2.3+j/segmentsZ*4.6];
  const tri=(a,b,c)=>positions.push(...a,...b,...c);
  for(let j=0;j<segmentsZ;j++)for(let i=0;i<segmentsX;i++){
   const x=-3.75+(i+.5)/segmentsX*7.5,z=-2.3+(j+.5)/segmentsZ*4.6;
   if(cut&&x>.25&&z>-.25)continue;
   const a=point(i,j,false),b=point(i+1,j,false),c=point(i,j+1,false),d=point(i+1,j+1,false);tri(a,c,b);tri(b,c,d);
   const aa=point(i,j,true),bb=point(i+1,j,true),cc=point(i,j+1,true),dd=point(i+1,j+1,true);tri(aa,bb,cc);tri(bb,dd,cc);
   // Every exposed edge, including the cutaway, has physical thickness.
   const edges=[];if(i===0)edges.push([a,c,aa,cc]);if(j===0)edges.push([a,b,aa,bb]);if(i===segmentsX-1||(cut&&x<=.25&&-3.75+(i+1.5)/segmentsX*7.5>.25&&z>-.25))edges.push([b,d,bb,dd]);if(j===segmentsZ-1||(cut&&z<=-.25&&-2.3+(j+1.5)/segmentsZ*4.6>-.25&&x>.25))edges.push([c,d,cc,dd]);for(const[u,v,w,q]of edges){tri(u,v,w);tri(v,q,w);}
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();return geo;
 }
 const full=group(null,hydrogel),cut=group(null,hydrogel);add(makeSheet(false),gel,null,full);add(makeSheet(true),gel,null,cut);full.visible=false;
 // Fine surface chains lend depth without importing biological cell structures.
 for(const parent of [full,cut]){
  const nodes=[];for(let i=0;i<70;i++)nodes.push([(rand()-.5)*7.1,(rand()-.5)*4.2]);
  for(let i=0;i<nodes.length;i++){
   const[x,z]=nodes[i];if(parent===cut&&x>.25&&z>-.25)continue;
   const nearest=nodes.map((p,j)=>({p,j,d:Math.hypot(p[0]-x,p[1]-z)})).filter(v=>v.j!==i&&v.d<.95).sort((a,b)=>a.d-b.d).slice(0,2);
   for(const {p:[xx,zz],j}of nearest){if(j<i||(parent===cut&&xx>.25&&zz>-.25))continue;strut([x,topY(x,z)+.018,z],[xx,topY(xx,zz)+.018,zz],.007,polymer,parent,4);}
  }
 }
 // Hydration particles illustrate water–polymer interaction, never calibrated flux.
 const droplets=[];for(let i=0;i<22;i++){const p=[(rand()-.5)*6.7,.8+rand()*.36,(rand()-.5)*4.0];const m=add(new THREE.SphereGeometry(.055+rand()*.045,8,5),water,p,hydration);m.userData.base=p;droplets.push(m);}
 // An understated frame around the coupon makes its two material regions legible.
 const frameMat=mat('#2a4b55',{roughness:.5,metalness:.2});for(const z of [-2.35,2.35])strut([-3.8,-1.06,z],[3.8,-1.06,z],.019,frameMat,specimen,4);for(const x of [-3.8,3.8])strut([x,-1.06,-2.35],[x,-1.06,2.35],.019,frameMat,specimen,4);
 scene.add(new THREE.HemisphereLight('#e8f4fa','#1c343d',2.0));const key=new THREE.DirectionalLight('#fff0d6',3.6);key.position.set(-4,8,6);scene.add(key);const cool=new THREE.DirectionalLight('#81dedb',2.4);cool.position.set(5,3,-5);scene.add(cool);const warm=new THREE.PointLight('#d88b4a',25,25);warm.position.set(-3,3,3);scene.add(warm);
 let renderer,software=false,canvas,width=0,height=0;try{canvas=document.createElement('canvas');const context=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!context)throw Error('WebGL unavailable');renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();host.append(canvas);}catch{software=true;renderer=makeSoftwareRenderer(scene,camera,host);canvas=renderer.canvas;}
 let theta=.68,phi=1.02,distance=15.8,tTheta=theta,tPhi=phi,tDistance=distance,target=new THREE.Vector3(0,.1,0),tTarget=target.clone();let mode='cutaway',modeGap=0,rh=50,tHydrate=.4,hydrate=.4,selected='hydrogel',hovered=null,auto=false,dirty=true,frame=0,drag=false,moved=false,last={x:0,y:0},origin={x:0,y:0},lastTime=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const anchorsBase={hydrogel:new THREE.Vector3(-2.2,.9,-.8),aerogel:new THREE.Vector3(2.5,-.35,1.2),interface:new THREE.Vector3(2.6,.38,-.7),hydration:new THREE.Vector3(-1.4,1.3,1.2)};
 const names={hydrogel:'01 / HYDROGEL',aerogel:'02 / AEROGEL',interface:'03 / INTERFACE',hydration:'04 / HYDRATION'};
 for(const id of Object.keys(anchorsBase)){const b=document.createElement('button');b.className='world-label'+(id===selected?' selected':'');b.dataset.component=id;b.setAttribute('aria-label','Inspect '+id);b.setAttribute('aria-pressed',String(id===selected));const dot=document.createElement('span');dot.className='label-dot';b.append(dot,document.createTextNode(names[id]));b.addEventListener('click',()=>select(id));b.addEventListener('pointerenter',()=>hover(id));b.addEventListener('pointerleave',()=>hover(null));labels[id]=b;document.getElementById('world-labels').append(b);}
 function select(id){selected=id;for(const[k,b]of Object.entries(labels)){b.classList.toggle('selected',k===id);b.setAttribute('aria-pressed',String(k===id));}onSelect(id);dirty=true;wake();}
 function hover(id){if(hovered===id)return;hovered=id;for(const[name,g]of Object.entries(groups))g.traverse(o=>{if(o.isMesh&&o.material.emissive){if(!o.userData.own){o.material=o.material.clone();o.userData.own=true;}o.material.emissive.set(name===id?(id==='hydrogel'?'#65350d':'#16504e'):'#000000');o.material.emissiveIntensity=.3;}});host.style.cursor=id?'pointer':drag?'grabbing':'grab';dirty=true;wake();}
 function projection(p){return p.clone().applyMatrix4(specimen.matrixWorld).project(camera);}
 function placeLabels(){const placed=[];for(const id of ['hydrogel','aerogel','interface','hydration']){const a=anchorsBase[id].clone();if(id==='hydrogel'||id==='hydration')a.y+=modeGap*1.75;const p=projection(a),w=labels[id].offsetWidth||110,h=labels[id].offsetHeight||24;let x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height-15;x=Math.max(w/2+15,Math.min(width-w/2-15,x));y=Math.max(110,Math.min(height-160,y));for(let pass=0;pass<3;pass++)for(const q of placed)if(Math.abs(x-q.x)<(w+q.w)/2+10&&Math.abs(y-q.y)<h+8)y+=h+13;labels[id].style.left=x+'px';labels[id].style.top=y+'px';placed.push({x,y,w});}}
 function resize(){const b=host.getBoundingClientRect();if(!b.width||!b.height)return;const w=Math.round(b.width),h=Math.round(b.height);if(w===width&&h===height)return;width=w;height=h;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);dirty=true;}
 function draw(time=0){frame=0;if(document.hidden||document.getElementById('panel-field').hidden)return;const delta=Math.min((time-lastTime)/1000,.05);lastTime=time;if(auto&&!reduced.matches){tTheta+=delta*.16;dirty=true;}const gap=mode==='exploded'?1:0;const remaining=Math.abs(tTheta-theta)+Math.abs(tPhi-phi)+Math.abs(tDistance-distance)+Math.abs(gap-modeGap)+Math.abs(tHydrate-hydrate)+target.distanceTo(tTarget);const smooth=reduced.matches?1:(software?.42:.14);theta+=(tTheta-theta)*smooth;phi+=(tPhi-phi)*smooth;distance+=(tDistance-distance)*smooth;modeGap+=(gap-modeGap)*smooth;hydrate+=(tHydrate-hydrate)*smooth;target.lerp(tTarget,smooth);
  hydrogel.position.y=modeGap*1.75;hydrogel.scale.y=.88+hydrate*.3;hydration.position.y=modeGap*1.75;for(let i=0;i<droplets.length;i++)droplets[i].visible=i<7+Math.round(hydrate*15);full.visible=mode!=='cutaway';cut.visible=mode==='cutaway';
  resize();if(dirty||remaining>.003){const framedDistance=distance+modeGap*2.8,framedTarget=target.clone().add(new THREE.Vector3(0,modeGap*.7,0));camera.position.set(framedTarget.x+framedDistance*Math.sin(phi)*Math.sin(theta),framedTarget.y+framedDistance*Math.cos(phi),framedTarget.z+framedDistance*Math.sin(phi)*Math.cos(theta));camera.lookAt(framedTarget);camera.updateMatrixWorld();scene.updateMatrixWorld(true);renderer.render(scene,camera);placeLabels();host.dataset.renderer=software?'software-3d':'webgl-3d';host.dataset.presentation=mode;host.dataset.visualRh=String(rh);document.getElementById('scene-loading').hidden=true;document.getElementById('render-status').textContent=software?'3D / COMPATIBILITY':'WEBGL / 3D';dirty=false;}if((auto&&!reduced.matches)||remaining>.003)frame=requestAnimationFrame(draw);
 }
 function wake(){if(!frame)frame=requestAnimationFrame(draw);}
 function pick(e){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObjects(Object.values(groups),true)){let o=hit.object,visible=true;while(o){if(!o.visible)visible=false;o=o.parent;}if(!visible)continue;o=hit.object;while(o&&!o.userData.component)o=o.parent;if(o)return o.userData.component;}return null;}
 let pointers=new Map(),pinch=0;host.addEventListener('pointerdown',e=>{host.focus({preventScroll:true});pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}drag=true;moved=false;origin=last={x:e.clientX,y:e.clientY};host.setPointerCapture(e.pointerId);});
 host.addEventListener('pointermove',e=>{if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(drag){if(Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>4)moved=true;if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);tDistance=THREE.MathUtils.clamp(tDistance-(d-pinch)*.025,6,25);pinch=d;}else{tTheta-=(e.clientX-last.x)*.007;tPhi=THREE.MathUtils.clamp(tPhi+(e.clientY-last.y)*.006,.3,1.5);}last={x:e.clientX,y:e.clientY};dirty=true;wake();}else if(e.pointerType!=='touch')hover(pick(e));});host.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);if(!moved&&drag){const id=pick(e);if(id)select(id);}drag=pointers.size>0;});host.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);drag=false;});host.addEventListener('pointerleave',()=>{if(!drag)hover(null);});host.addEventListener('wheel',e=>{e.preventDefault();tDistance=THREE.MathUtils.clamp(tDistance+e.deltaY*.009,6,25);dirty=true;wake();},{passive:false});
 function preset(id){if(id==='overview'){tTheta=.68;tPhi=1.02;tDistance=15.8;tTarget.set(0,.1,0);}if(id==='surface'){tTheta=.4;tPhi=.5;tDistance=10;tTarget.set(-1,.6,-.5);}if(id==='section'){tTheta=.75;tPhi=1.38;tDistance=12;tTarget.set(.5,0,0);}document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===id)));dirty=true;wake();}
 host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')tTheta-=.15;if(e.key==='ArrowRight')tTheta+=.15;if(e.key==='ArrowUp')tPhi=Math.max(.3,tPhi-.1);if(e.key==='ArrowDown')tPhi=Math.min(1.5,tPhi+.1);if(['+','='].includes(e.key))tDistance=Math.max(6,tDistance-1);if(['-','_'].includes(e.key))tDistance=Math.min(25,tDistance+1);if(e.key==='Home')preset('overview');dirty=true;wake();});
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));dirty=true;wake();}));document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.camera)));document.querySelectorAll('[data-rh]').forEach(b=>b.addEventListener('click',()=>{rh=Number(b.dataset.rh);tHydrate=(rh-30)/50;document.querySelectorAll('[data-rh]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));onSelect(selected);dirty=true;wake();}));
 document.getElementById('rotate-view').addEventListener('click',e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',String(auto));wake();});document.getElementById('zoom-in').addEventListener('click',()=>{tDistance=Math.max(6,tDistance-1.2);dirty=true;wake();});document.getElementById('zoom-out').addEventListener('click',()=>{tDistance=Math.min(25,tDistance+1.2);dirty=true;wake();});document.getElementById('reset-camera').addEventListener('click',()=>preset('overview'));
 new ResizeObserver(()=>{resize();wake();}).observe(host);document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{if(reduced.matches){auto=false;document.getElementById('rotate-view').setAttribute('aria-pressed','false');}dirty=true;wake();});
 if(!software)canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();software=true;renderer=makeSoftwareRenderer(scene,camera,host);canvas=renderer.canvas;width=0;dirty=true;wake();});
 const api={resume(){dirty=true;wake();},select,preset};window.DesertSkinWorld=api;select('hydrogel');wake();return api;
}
