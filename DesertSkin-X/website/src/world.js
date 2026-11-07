import * as THREE from 'three';

// Original procedural concept site. No remote model, texture or runtime request.
export function createWorld(onSelect){
 const host=document.getElementById('viewport'),labelsHost=document.getElementById('world-labels');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e9eee2');
 const camera=new THREE.PerspectiveCamera(36,1,.1,140);
 const target=new THREE.Vector3(0,.5,0),clock=new THREE.Clock();
 const components={},anchors={},labels={},meshes=[];
 let renderer,canvas,ctx,software=false,width=0,height=0,dirty=true,auto=false,explode=false,explosion=0,selected='membrane',hovered=null;
 let theta=.79,phi=.93,distance=21.5,targetTheta=theta,targetPhi=phi,targetDistance=distance,frame=0,lastDraw=0,dragging=false,moved=false,pointerStart={x:0,y:0},lastPointer={x:0,y:0};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const sunDir=new THREE.Vector3(-5,10,7).normalize();
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.82,...extra});
 const mats={soil:material('#a3926f'),grass:material('#a8c56e'),edge:material('#c2d992'),frame:material('#e7ebd5',{roughness:.55,metalness:.12}),dark:material('#405a47'),wood:material('#b77d50'),terracotta:material('#c28559'),wall:material('#e8d9b6'),window:material('#507b72',{roughness:.2,metalness:.18}),glass:material('#bddccc',{transparent:true,opacity:.2,depthWrite:false,roughness:.15,side:THREE.DoubleSide}),water:material('#78aaa0',{roughness:.3,metalness:.1}),tank:material('#8ab4a0',{roughness:.6}),leaf:material('#7ca64c',{flatShading:true}),leafLight:material('#a0c75f',{flatShading:true}),leafDark:material('#668f42',{flatShading:true}),crops:material('#739744',{flatShading:true}),tomato:material('#d0a15f',{flatShading:true}),paver:material('#ddd8bd'),dirt:material('#725a3d'),solar:material('#507c87',{metalness:.25,roughness:.4}),solarLine:material('#8baeb0'),pot:material('#ba8056'),membrane:material('#dde9b5',{roughness:.7,side:THREE.DoubleSide}),lining:material('#91b38a',{transparent:true,opacity:.72,side:THREE.DoubleSide})};
 function group(name,parent=scene){const g=new THREE.Group();parent.add(g);if(name){g.userData.component=name;components[name]=g;}return g;}
 function add(geometry,mat,pos,parent=scene,rotation){const m=new THREE.Mesh(geometry,mat);if(pos)m.position.set(...pos);if(rotation)m.rotation.set(...rotation);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);meshes.push(m);return m;}
 function box(size,pos,mat,parent,rotation){return add(new THREE.BoxGeometry(...size),mat,pos,parent,rotation);}
 function cylinder(rt,rb,h,pos,mat,parent=scene,n=12){return add(new THREE.CylinderGeometry(rt,rb,h,n),mat,pos,parent);}
 function sphere(r,pos,mat,parent=scene,detail=0){return add(new THREE.IcosahedronGeometry(r,detail),mat,pos,parent);}
 function beam(a,b,r,mat,parent=scene){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const m=cylinder(r,r,v.length(),av.clone().add(bv).multiplyScalar(.5).toArray(),mat,parent,6);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 function roundedSlab(w,d,h,r,pos,mat){const shape=new THREE.Shape();shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);const geom=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:1,steps:1,curveSegments:5});geom.rotateX(-Math.PI/2);return add(geom,mat,pos);}
 const base=roundedSlab(10.8,8.5,.42,.6,[0,-.45,0],mats.soil);base.castShadow=true;
 roundedSlab(10.75,8.45,.045,.6,[0,-.015,0],mats.grass);
 // Low retaining edge and inset perimeter planting.
 box([.13,.15,6.7],[-4.9,.08,-.15],mats.edge);box([8.3,.13,.13],[0,.07,-3.8],mats.edge);
 const site=group();
 // Greenhouse: translucent walls, repeated structural bays, pitched membrane roof.
 const greenhouse=group(null,site);greenhouse.position.set(-1.0,.06,-.5);
 box([5.0,.14,4.05],[0,.07,0],mats.paver,greenhouse);
 box([4.7,.05,3.7],[0,.17,0],mats.dirt,greenhouse);
 const crops=group('crops',greenhouse);
 for(let row=0;row<3;row++){
  const z=-1.2+row*1.15;box([4.25,.23,.69],[0,.31,z],mats.wood,crops);box([4.05,.06,.54],[0,.45,z],mats.dirt,crops);
  for(let i=0;i<8;i++){const x=-1.75+i*.5;beam([x,.48,z],[x,.85,z],.025,mats.leafDark,crops);sphere(.2,[x,.72,z],i%2?mats.crops:mats.leafLight,crops);sphere(.15,[x+.075,.87,z+.03],mats.crops,crops);if((i+row)%3===0)sphere(.07,[x+.15,.76,z+.1],mats.tomato,crops);}
 }
 // Bays and glass wall panels, with an open central doorway.
 for(const x of [-2.3,-1.15,0,1.15,2.3]){
  for(const z of [-1.85,1.85])box([.065,2.05,.065],[x,1.2,z],mats.frame,greenhouse);
  beam([x,2.22,-1.85],[x,3.15,0],.038,mats.frame,greenhouse);beam([x,3.15,0],[x,2.22,1.85],.038,mats.frame,greenhouse);
 }
 for(const z of [-1.85,1.85])for(const y of [.2,1.17,2.22])box([4.68,.06,.06],[0,y,z],mats.frame,greenhouse);
 for(const x of [-2.3,2.3])for(const y of [.2,1.17,2.22])box([.06,.06,3.76],[x,y,0],mats.frame,greenhouse);
 for(const x of [-2.3,2.3])box([.025,1.94,3.65],[x,1.2,0],mats.glass,greenhouse);
 box([4.55,1.94,.025],[0,1.2,-1.85],mats.glass,greenhouse);
 for(const x of [-1.73,1.73])box([1.1,1.94,.025],[x,1.2,1.85],mats.glass,greenhouse);
 box([1.0,1.05,.025],[0,1.7,1.85],mats.glass,greenhouse);
 box([.055,1.8,.055],[-.55,1.1,1.9],mats.frame,greenhouse);box([.055,1.8,.055],[.55,1.1,1.9],mats.frame,greenhouse);
 // A closeable door angled away from the opening.
 const door=group(null,greenhouse);door.position.set(-.55,.2,1.9);door.rotation.y=-.6;box([1.03,1.86,.03],[.515,.93,0],mats.glass,door);for(const y of [0,1.86])box([1.03,.045,.045],[.515,y,0],mats.frame,door);box([.045,1.86,.045],[1.03,.93,0],mats.frame,door);
 const roof=group('membrane',greenhouse);
 const slope=Math.atan2(.93,1.85),slopeLen=Math.hypot(.93,1.85);
 for(const sign of [-1,1]){
  const z=sign*.925,y=2.685,rotation=[sign*slope,0,0];
  box([4.82,.028,slopeLen+.09],[0,y,z],mats.lining,roof,rotation);
  box([4.82,.035,slopeLen+.09],[0,y+.065,z],mats.membrane,roof,rotation);
  // Material seams reveal the roof as thin panels rather than a solid slab.
  for(let x=-2.4;x<=2.41;x+=.48)beam([x,3.25,.0],[x,2.31,sign*1.92],.011,mats.frame,roof);
  for(let j=1;j<6;j++){const t=j/6;beam([-2.4,3.25-t*.94,sign*t*1.92],[2.4,3.25-t*.94,sign*t*1.92],.006,mats.frame,roof);}
 }
 box([4.88,.055,.065],[0,3.28,0],mats.frame,roof);
 // A terracotta service building and roof-mounted solar array.
 const lab=group(null,site);lab.position.set(2.6,0,-1.5);
 box([2.15,3.05,2.75],[0,1.57,0],mats.terracotta,lab);box([2.25,.14,2.86],[0,.12,0],mats.paver,lab);box([2.32,.15,2.94],[0,3.13,0],mats.dark,lab);
 box([1.75,1.06,.035],[0,2.0,1.39],mats.window,lab);for(const x of [-.85,0,.85])box([.04,1.12,.05],[x,2,1.42],mats.frame,lab);for(const y of [1.45,2.55])box([1.8,.04,.05],[0,y,1.43],mats.frame,lab);
 box([.025,1.05,2.1],[1.09,2.0,0],mats.window,lab);for(const z of [-1,0,1])box([.04,1.12,.04],[1.12,2,z],mats.frame,lab);
 box([.64,1.14,.06],[.44,.73,1.43],mats.wood,lab);box([.44,.06,.07],[.44,1.05,1.48],mats.frame,lab);sphere(.028,[.65,.74,1.49],mats.frame,lab);
 for(let i=0;i<3;i++){box([2.2,.11,.4],[0,.08+i*.08,1.65-i*.18],mats.paver,lab);}
 const solar=group(null,lab);solar.position.set(0,3.26,0);solar.rotation.x=-.13;
 for(let r=0;r<2;r++)for(let c=0;c<3;c++){box([.63,.055,1.1],[-.68+c*.68,.04,-.59+r*1.16],mats.solar,solar);for(let i=1;i<4;i++)box([.005,.006,1.04],[-.99+c*.68+i*.155,.072,-.59+r*1.16],mats.solarLine,solar);for(let i=1;i<6;i++)box([.61,.006,.005],[-.68+c*.68,.073,-1.12+r*1.16+i*.175],mats.solarLine,solar);}
 // Monitoring mast and panel: separate powered system.
 const monitor=group('monitor',site);monitor.position.set(1.9,0,1.45);
 cylinder(.045,.065,2.0,[0,1.0,0],mats.dark,monitor,8);box([.5,.32,.14],[0,1.85,.03],mats.frame,monitor);box([.34,.18,.018],[0,1.86,.111],mats.window,monitor);sphere(.04,[.14,1.85,.13],mats.leafLight,monitor);beam([0,2.0,0],[.23,2.3,0],.018,mats.dark,monitor);sphere(.04,[.23,2.3,0],mats.frame,monitor);
 // Rainwater loop and pipe run. Blue-green water is deliberately visible.
 const water=group('water',site);
 cylinder(.51,.51,1.15,[-3.95,.64,.45],mats.tank,water,18);cylinder(.54,.54,.08,[-3.95,1.25,.45],mats.dark,water,18);cylinder(.18,.18,.05,[-3.95,1.32,.45],mats.frame,water,12);
 for(const y of [.26,.52,.85,1.09]){const torus=add(new THREE.TorusGeometry(.512,.018,4,18),mats.frame,[-3.95,y,.45],water,[Math.PI/2,0,0]);torus.castShadow=false;}
 beam([-3.95,.8,.45],[-3.4,.8,.45],.045,mats.dark,water);beam([-3.4,.8,.45],[-3.4,.25,1.9],.04,mats.dark,water);beam([-3.4,.25,1.9],[-2.7,.25,1.9],.04,mats.dark,water);
 const pondShape=new THREE.Shape();pondShape.absellipse(0,0,1.0,.67,0,Math.PI*2,false,0);const pondGeo=new THREE.ShapeGeometry(pondShape,24);pondGeo.rotateX(-Math.PI/2);add(pondGeo,mats.water,[-3.3,.095,2.53],water);
 for(let i=0;i<17;i++){const a=i/17*Math.PI*2;const stone=sphere(.15,[-3.3+Math.cos(a)*1.05,.12,2.53+Math.sin(a)*.73],mats.paver,water);stone.scale.set(1,.5,.8);}
 for(const [x,z] of [[-3.75,2.5],[-3.12,2.7],[-2.9,2.34]]){const lily=cylinder(.17,.17,.012,[x,.105,z],mats.leafDark,water,8);lily.castShadow=false;sphere(.05,[x+.02,.14,z],mats.tomato,water);}
 // Courtyard pavers and outdoor demonstration beds.
 box([3.8,.065,1.05],[.5,.08,2.43],mats.paver,site);
 for(let i=0;i<5;i++)box([.43,.07,.34],[-1.7+i*.6,.09,1.9],mats.paver,site);
 for(let r=0;r<3;r++){
  const z=1.35+r*.85;box([1.85,.25,.57],[3.42,.2,z],mats.wood,site);box([1.69,.025,.44],[3.42,.34,z],mats.dirt,site);
  for(let c=0;c<5;c++){const x=2.72+c*.35;sphere(.17,[x,.49,z],c%2?mats.crops:mats.leafLight,site);if((c+r)%3===0)sphere(.06,[x+.1,.52,z+.12],mats.tomato,site);}
 }
 // Faceted trees with clustered crowns and deliberate negative space.
 function tree(x,z,scale=1){const t=group(null,site);t.position.set(x,0,z);t.scale.setScalar(scale);cylinder(.09,.16,1.25,[0,.65,0],mats.wood,t,7);beam([0,.8,0],[.4,1.4,.1],.055,mats.wood,t);for(const [dx,dy,dz,r,mat]of [[0,1.72,0,.68,mats.leaf],[-.4,1.53,.1,.5,mats.leafDark],[.42,1.6,.1,.53,mats.leafLight],[.05,2.15,-.08,.48,mats.leafLight],[-.13,1.8,-.38,.47,mats.leaf]])sphere(r,[dx,dy,dz],mat,t,0);}
 tree(-4.15,-2.8,1.15);tree(4.3,-2.95,1.1);tree(-4.45,3.35,.85);tree(4.55,3.38,.73);
 // A few small plants and path markers, not a repeating decorative field.
 for(const [x,z]of [[-4.5,1.5],[-4.4,-1.1],[4.6,-.5],[-2.4,-3.55],[.7,3.55],[1.4,3.5]]){for(let i=0;i<3;i++){const leaf=add(new THREE.ConeGeometry(.065,.36,4),mats.leafDark,[x+(i-1)*.08,.19,z],site);leaf.rotation.z=(i-1)*.35;}}
 for(const [x,z]of [[-2.05,2.84],[-1.7,3.16],[-1.35,3.48]])cylinder(.18,.2,.045,[x,.06,z],mats.paver,site,7);
 // Low fence at the rear makes camera rotation reveal a complete model.
 for(let i=0;i<11;i++){const x=-4.6+i*.89;box([.045,.56,.045],[x,.3,-3.7],mats.dark,site);}for(const y of [.15,.55])box([9.0,.04,.035],[-.13,y,-3.7],mats.dark,site);
 const plane=add(new THREE.PlaneGeometry(200,200),material('#e9eee2'),[0,-.51,0],scene,[-Math.PI/2,0,0]);plane.receiveShadow=true;plane.castShadow=false;plane.userData.ground=true;
 const grid=new THREE.GridHelper(100,100,'#c6d1ba','#d5dec9');grid.position.y=-.5;grid.material.transparent=true;grid.material.opacity=.42;scene.add(grid);
 scene.add(new THREE.HemisphereLight('#f7ffdf','#8caa85',2.3));const light=new THREE.DirectionalLight('#fff6d7',3.0);light.position.set(-5,12,7);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:35});light.shadow.normalBias=.035;light.shadow.bias=-.0005;scene.add(light);
 // Shadows for the geometry fallback use the same world camera, never a flat placeholder.
 const shadowGeometry=[];
 for(const [x,z,rx,rz]of [[-1,-.5,3,2.2],[2.7,-1.4,1.4,1.7],[-4.1,-2.8,.9,.5],[4.3,-2.9,.9,.5],[-4.4,3.3,.7,.4]])shadowGeometry.push({x,z,rx,rz});
 anchors.membrane=new THREE.Vector3(-1.3,3.37,-.35);anchors.crops=new THREE.Vector3(-.9,.91,1.3);anchors.water=new THREE.Vector3(-3.95,1.4,.45);anchors.monitor=new THREE.Vector3(1.9,2.37,1.45);
 const labelText={membrane:'MEMBRANE ROOF',crops:'GROWING AREA',water:'WATER LOOP',monitor:'MONITORING'};
 Object.keys(anchors).forEach(id=>{const b=document.createElement('button');b.className='world-label'+(id==='membrane'?' selected':'');b.dataset.component=id;b.setAttribute('aria-label','Inspect '+labelText[id].toLowerCase());const dot=document.createElement('span');dot.className='label-dot';b.append(dot,document.createTextNode(labelText[id]));b.addEventListener('click',()=>select(id));b.addEventListener('pointerenter',()=>setHover(id));b.addEventListener('pointerleave',()=>setHover(null));labels[id]=b;labelsHost.append(b);});
 function select(id){selected=id;Object.entries(labels).forEach(([key,b])=>{b.classList.toggle('selected',key===id);b.setAttribute('aria-pressed',String(key===id));});onSelect(id);dirty=true;wake();}
 function setHover(id){if(hovered===id)return;hovered=id;for(const [name,g]of Object.entries(components))g.traverse(o=>{if(o.isMesh&&o.material.emissive){if(!o.userData.ownMaterial){o.material=o.material.clone();o.userData.ownMaterial=true;}o.material.emissive.set(name===id?'#263b0d':'#000000');o.material.emissiveIntensity=.16;}});host.style.cursor=id?'pointer':dragging?'grabbing':'grab';dirty=true;wake();}
 function makeSoftware(){software=true;canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');host.replaceChildren(canvas);ctx=canvas.getContext('2d',{alpha:false});document.getElementById('render-status').textContent='3D / COMPATIBILITY';}
 try{
  canvas=document.createElement('canvas');const context=canvas.getContext('webgl2',{antialias:true,alpha:false});
  if(!context)makeSoftware();else{renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;host.append(canvas);document.getElementById('render-status').textContent='WEBGL / 3D';canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;makeSoftware();width=0;dirty=true;wake();});}
 }catch{makeSoftware();}

 if(software){
  const contactMat=new THREE.MeshBasicMaterial({color:'#405f3d',transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
  for(const [x,z,rx,rz]of [[-4.05,-2.9,1.1,.65],[4.45,-3,1.0,.6],[-4.25,3.24,.75,.45],[4.58,3.2,.65,.4],[-.7,-.3,2.7,2.0]]){
   const shadow=add(new THREE.CircleGeometry(1,18),contactMat,[x+.25,.082,z-.2],scene,[-Math.PI/2,0,-.45]);shadow.scale.set(rx,rz,1);shadow.castShadow=false;
  }
 }
 const allTriangles=[];
 for(const mesh of meshes){if(mesh.userData.ground)continue;const geo=mesh.geometry,index=geo.index,position=geo.attributes.position;const count=index?index.count:position.count;const triangles=[];for(let i=0;i<count;i+=3){const vs=[];for(let k=0;k<3;k++){const j=index?index.getX(i+k):i+k;vs.push(new THREE.Vector3().fromBufferAttribute(position,j));}triangles.push(vs);}allTriangles.push({mesh,triangles});}
 const vp=new THREE.Matrix4(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),normal=new THREE.Vector3();
 function project(p){const v=p.clone().project(camera);return{x:(v.x*.5+.5)*width,y:(-v.y*.5+.5)*height,z:v.z};}
 function softwareRender(){
  const ratio=Math.min(devicePixelRatio||1,1.5);if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#e9eee2';ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#d4deca';ctx.lineWidth=.55;ctx.beginPath();for(let i=-25;i<=25;i++){for(const axis of [0,1]){const a=project(new THREE.Vector3(axis?i:-25,-.51,axis?-25:i)),b=project(new THREE.Vector3(axis?i:25,-.51,axis?25:i));ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}}ctx.stroke();
  const faces=[];
  // Ground is visible outside the island. A broad island shadow sits underneath it.
  {const pts=[];for(let j=0;j<24;j++){const a=j/24*Math.PI*2;pts.push(project(new THREE.Vector3(Math.cos(a)*5.7+.3,-.505,Math.sin(a)*4.5-.25)));}ctx.fillStyle='#c4cfb8';ctx.globalAlpha=.42;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
  scene.updateMatrixWorld(true);
  for(const entry of allTriangles){const mesh=entry.mesh;if(!mesh.visible)continue;for(const tri of entry.triangles){const world=tri.map(v=>v.clone().applyMatrix4(mesh.matrixWorld));normal.crossVectors(v1.subVectors(world[1],world[0]),v2.subVectors(world[2],world[0])).normalize();const ps=world.map(project);if(ps.some(p=>p.z<0||p.z>1))continue;const area=(ps[1].x-ps[0].x)*(ps[2].y-ps[0].y)-(ps[1].y-ps[0].y)*(ps[2].x-ps[0].x);if(area>=0&&mesh.material.side!==THREE.DoubleSide)continue;if(area>=0)normal.negate();const shade=.68+.32*Math.max(0,normal.dot(sunDir));const color=mesh.material.color.clone().multiplyScalar(shade);if(mesh.material.emissive)color.add(mesh.material.emissive.clone().multiplyScalar(mesh.material.emissiveIntensity||0));faces.push({points:ps,z:(ps[0].z+ps[1].z+ps[2].z)/3,color:color.getStyle(THREE.SRGBColorSpace),opacity:mesh.material.opacity});}}
  // Per-pixel depth avoids the occlusion errors of triangle-average painter sorting.
  // The exact same 3D geometry is used when GPU/WebGL is unavailable.
  const pixelW=canvas.width,pixelH=canvas.height;
  const image=ctx.getImageData(0,0,pixelW,pixelH),pixels=image.data;
  const depthBuffer=new Float32Array(pixelW*pixelH);depthBuffer.fill(Infinity);
  const opaque=faces.filter(f=>f.opacity===1&&f.points.length===3);
  const transparent=faces.filter(f=>f.opacity<1&&f.points.length===3).sort((a,b)=>b.z-a.z);
  function raster(f,blend){
   const p=f.points.map(v=>({x:v.x*ratio,y:v.y*ratio,z:v.z}));
   const a=p[0],b=p[1],c=p[2],den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
   if(Math.abs(den)<.001)return;
   const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(pixelW-1,Math.ceil(Math.max(a.x,b.x,c.x)));
   const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(pixelH-1,Math.ceil(Math.max(a.y,b.y,c.y)));
   const rgb=f.color.match(/[\d.]+/g).map(Number),alpha=blend?f.opacity:1,inv=1-alpha;
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const px=x+.5,py=y+.5,w0=((b.y-c.y)*(px-c.x)+(c.x-b.x)*(py-c.y))/den;
    const w1=((c.y-a.y)*(px-c.x)+(a.x-c.x)*(py-c.y))/den,w2=1-w0-w1;
    if(w0<-.0001||w1<-.0001||w2<-.0001)continue;
    const z=w0*a.z+w1*b.z+w2*c.z,index=y*pixelW+x;
    if(z>depthBuffer[index]+.000001)continue;
    const at=index*4;pixels[at]=rgb[0]*alpha+pixels[at]*inv;pixels[at+1]=rgb[1]*alpha+pixels[at+1]*inv;pixels[at+2]=rgb[2]*alpha+pixels[at+2]*inv;
    if(!blend)depthBuffer[index]=z;
   }
  }
  for(const f of opaque)raster(f,false);for(const f of transparent)raster(f,true);
  ctx.putImageData(image,0,0);ctx.globalAlpha=1;
 }
 function resize(){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;const w=Math.round(rect.width),h=Math.round(rect.height);if(width===w&&height===h)return;width=w;height=h;camera.aspect=w/h;camera.updateProjectionMatrix();if(renderer)renderer.setSize(w,h,false);dirty=true;}
 function placeLabels(){
  const placed=[];
  for(const id of ['membrane','water','monitor','crops']){
   const p=anchors[id].clone();if(id==='membrane')p.y+=explosion*.95;
   const c=project(p),dx={membrane:0,water:-12,monitor:32,crops:-35}[id];
   const w=labels[id].offsetWidth||90,h=labels[id].offsetHeight||22;
   let x=Math.max(w/2+10,Math.min(width-w/2-10,c.x+dx));
   let y=Math.max(92,Math.min(height-90,c.y-14));
   for(let pass=0;pass<4;pass++)for(const other of placed)if(Math.abs(x-other.x)<(w+other.w)/2+7&&Math.abs(y-other.y)<Math.max(h,other.h)+5)y=Math.min(height-85,other.y+h+13);
   labels[id].style.left=x+'px';labels[id].style.top=y+'px';placed.push({x,y,w,h});
  }
 }
 function draw(time=0){frame=0;if(document.hidden||document.getElementById('panel-field').hidden)return;const dt=Math.min(clock.getDelta(),.06);if(auto&&!reduced.matches){targetTheta+=dt*.14;dirty=true;}const smooth=reduced.matches?1:.16;const before=Math.abs(targetTheta-theta)+Math.abs(targetPhi-phi)+Math.abs(targetDistance-distance)+Math.abs((explode?1:0)-explosion);theta+=(targetTheta-theta)*smooth;phi+=(targetPhi-phi)*smooth;distance+=(targetDistance-distance)*smooth;explosion+=((explode?1:0)-explosion)*smooth;roof.position.y=explosion*.95;resize();if(dirty||before>.001){camera.position.set(target.x+distance*Math.sin(phi)*Math.sin(theta),target.y+distance*Math.cos(phi),target.z+distance*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);camera.updateMatrixWorld();if(renderer)renderer.render(scene,camera);else softwareRender();placeLabels();document.getElementById('scene-loading').hidden=true;host.dataset.renderer=software?'software-3d':'webgl-3d';dirty=false;lastDraw=time;}if(auto||before>.001)frame=requestAnimationFrame(draw);}
 function wake(){if(!frame)frame=requestAnimationFrame(draw);}
 function pick(e){const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(Object.values(components),true);for(const hit of hits){let o=hit.object;while(o&&!o.userData.component)o=o.parent;if(o)return o.userData.component;}return null;}
 const pointers=new Map();let pinchDistance=0;
 host.addEventListener('pointerdown',e=>{host.focus({preventScroll:true});pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}dragging=true;moved=false;pointerStart={x:e.clientX,y:e.clientY};lastPointer={...pointerStart};host.setPointerCapture(e.pointerId);host.style.cursor='grabbing';});
 host.addEventListener('pointermove',e=>{if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(dragging){if(Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>4)moved=true;if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);targetDistance=THREE.MathUtils.clamp(targetDistance-(d-pinchDistance)*.04,10,31);pinchDistance=d;}else{targetTheta-=(e.clientX-lastPointer.x)*.008;targetPhi=THREE.MathUtils.clamp(targetPhi+(e.clientY-lastPointer.y)*.006,.3,1.34);}lastPointer={x:e.clientX,y:e.clientY};dirty=true;wake();}else if(e.pointerType!=='touch')setHover(pick(e));});
 host.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);if(!moved&&dragging){const id=pick(e);if(id)select(id);}dragging=pointers.size>0;host.style.cursor=hovered?'pointer':'grab';});host.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);dragging=false;});host.addEventListener('pointerleave',()=>{if(!dragging)setHover(null);});
 host.addEventListener('wheel',e=>{e.preventDefault();targetDistance=THREE.MathUtils.clamp(targetDistance+e.deltaY*.012,10,31);dirty=true;wake();},{passive:false});
 function reset(){targetTheta=.79;targetPhi=.93;targetDistance=21.5;dirty=true;wake();}
 host.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')targetTheta-=.15;if(e.key==='ArrowRight')targetTheta+=.15;if(e.key==='ArrowUp')targetPhi=Math.max(.3,targetPhi-.1);if(e.key==='ArrowDown')targetPhi=Math.min(1.34,targetPhi+.1);if(['+','='].includes(e.key))targetDistance=Math.max(10,targetDistance-1.2);if(['-','_'].includes(e.key))targetDistance=Math.min(31,targetDistance+1.2);if(e.key==='Home')reset();dirty=true;wake();});
 document.getElementById('zoom-in').addEventListener('click',()=>{targetDistance=Math.max(10,targetDistance-1.5);dirty=true;wake();});document.getElementById('zoom-out').addEventListener('click',()=>{targetDistance=Math.min(31,targetDistance+1.5);dirty=true;wake();});document.getElementById('reset-camera').addEventListener('click',reset);
 document.getElementById('rotate-view').addEventListener('click',e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',String(auto));wake();});document.getElementById('explode-view').addEventListener('click',e=>{explode=!explode;e.currentTarget.setAttribute('aria-pressed',String(explode));select('membrane');dirty=true;wake();});
 new ResizeObserver(()=>{resize();wake();}).observe(host);document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{if(reduced.matches){auto=false;document.getElementById('rotate-view').setAttribute('aria-pressed','false');}dirty=true;wake();});
 const api={resume:()=>{dirty=true;wake();},select,diagnostics:()=>({renderer:software?'software-3d':'webgl-3d',meshCount:meshes.length,triangleCount:allTriangles.reduce((s,e)=>s+e.triangles.length,0),theta,phi,distance,explosion,selected})};
 window.DesertSkinWorld=api;select('membrane');wake();return api;
}
