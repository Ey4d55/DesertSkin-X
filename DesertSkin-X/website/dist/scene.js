/* Self-contained WebGL specimen. Conceptual geometry, no physical prediction. */
(()=>{
  'use strict';
  const canvas=document.getElementById('membrane'),fallback=document.querySelector('.scene-fallback');
  if(!canvas)return;
  let gl;
  const fail=()=>{canvas.hidden=true;fallback.hidden=false;document.querySelector('.specimen-label').hidden=true;document.querySelector('.scene-controls').hidden=true;document.querySelector('.scene-tag').textContent='CONCEPTUAL STUDY';};
  try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl){fail();return;}}catch{fail();return;}
  const vertex=`
    attribute vec2 aPosition;
    uniform mat4 uProjection;
    uniform mat4 uModel;
    uniform float uLayer;
    uniform float uHumidity;
    uniform float uSeparation;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main(){
      float x=aPosition.x,y=aPosition.y;
      float amp=.8+uHumidity*.5;
      float z=sin(x*1.5+y*.35)*.18*amp+sin(y*2.7)*.075*amp;
      z+=uLayer*(.045+uSeparation*.46);
      float dx=cos(x*1.5+y*.35)*.27*amp;
      float dy=cos(x*1.5+y*.35)*.063*amp+cos(y*2.7)*.2025*amp;
      vec4 p=uModel*vec4(x,y,z,1.);
      vNormal=normalize(mat3(uModel)*vec3(-dx,-dy,1.));
      vPosition=p.xyz;vUv=(aPosition+vec2(1.75,1.08))/vec2(3.5,2.16);
      gl_Position=uProjection*p;
    }`;
  const fragment=`
    precision mediump float;
    uniform vec3 uColor;
    uniform float uLayer;
    uniform float uHumidity;
    uniform float uHover;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main(){
      vec2 uv=vUv*vec2(30.,19.);
      uv.x+=mod(floor(uv.y),2.)*.5;
      vec2 cell=fract(uv)-.5;
      float d=length(cell);
      float aperture=.17+uHumidity*.065;
      if(d<aperture)discard;
      vec3 n=normalize(vNormal);
      if(!gl_FrontFacing)n=-n;
      vec3 l=normalize(vec3(-.8,1.7,3.));
      float diffuse=max(dot(n,l),0.);
      vec3 view=normalize(-vPosition);
      float shine=pow(max(dot(n,normalize(l+view)),0.),40.);
      float rim=smoothstep(aperture,aperture+.075,d);
      float edge=pow(1.-max(dot(n,view),0.),2.);
      vec3 color=uColor*(.45+.6*diffuse)*(.7+.3*rim);
      color+=vec3(.92,.96,.7)*shine*.35;
      color+=vec3(.22,.32,.12)*edge*.24;
      color+=uHover*vec3(.025,.035,.012);
      gl_FragColor=vec4(color,1.);
    }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');}catch{fail();return;}
  gl.useProgram(program);
  const vertices=[],nx=80,ny=50;
  const point=(i,j)=>[i/nx*3.5-1.75,j/ny*2.16-1.08];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)vertices.push(...point(i,j),...point(i+1,j),...point(i,j+1),...point(i+1,j),...point(i+1,j+1),...point(i,j+1));
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uniforms={};['uProjection','uModel','uLayer','uColor','uHumidity','uSeparation','uHover'].forEach(n=>uniforms[n]=gl.getUniformLocation(program,n));
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let rx=-.59,ry=-.18,rz=-.45,sep=0,targetSep=0,rh=.5,hover=0,drag=false,lastX=0,lastY=0,visible=true,frame=0,lastTime=0;
  const multiply=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
  function model(ax,ay,az){const x=Math.cos(ax),X=Math.sin(ax),y=Math.cos(ay),Y=Math.sin(ay),z=Math.cos(az),Z=Math.sin(az);const a=[1,0,0,0,0,x,X,0,0,-X,x,0,0,0,0,1],b=[y,0,-Y,0,0,1,0,0,Y,0,y,0,0,0,0,1],c=[z,Z,0,0,-Z,z,0,0,0,0,1,0,0,0,-5.65,1];return multiply(c,multiply(b,a));}
  function projection(){const aspect=canvas.width/canvas.height,f=1/Math.tan(.64/2),near=.1,far=30;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
  function draw(time=0){frame=0;if(!visible||document.hidden)return;if(time-lastTime<30&&!reduced.matches){frame=requestAnimationFrame(draw);return;}lastTime=time;const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}sep=reduced.matches?targetSep:sep+(targetSep-sep)*.13;const idle=reduced.matches||drag?0:Math.sin(time*.00032)*.035;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uniforms.uProjection,false,projection());gl.uniformMatrix4fv(uniforms.uModel,false,model(rx,ry+idle,rz));gl.uniform1f(uniforms.uHumidity,rh);gl.uniform1f(uniforms.uSeparation,sep);gl.uniform1f(uniforms.uHover,hover);for(const layer of [-1,1]){gl.uniform1f(uniforms.uLayer,layer);gl.uniform3fv(uniforms.uColor,layer===1?[.62,.75,.37]:[.76,.69,.48]);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);}if(!reduced.matches)frame=requestAnimationFrame(draw);}
  function wake(){if(!frame)frame=requestAnimationFrame(draw);}
  canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);wake();});
  canvas.addEventListener('pointermove',e=>{if(drag){ry+=(e.clientX-lastX)*.008;rx=Math.max(-1.4,Math.min(.7,rx+(e.clientY-lastY)*.008));lastX=e.clientX;lastY=e.clientY;wake();}});
  const up=()=>{drag=false;wake();};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('pointerenter',()=>{hover=1;document.getElementById('layer-label').replaceChildren(document.createTextNode('Responsive layer / support layer'));wake();});canvas.addEventListener('pointerleave',()=>{hover=0;document.getElementById('layer-label').replaceChildren(document.createTextNode('Hover to inspect · drag to rotate'));wake();});
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')ry-=.15;if(e.key==='ArrowRight')ry+=.15;if(e.key==='ArrowUp')rx=Math.max(-1.4,rx-.15);if(e.key==='ArrowDown')rx=Math.min(.7,rx+.15);if(e.key==='Home'){rx=-.59;ry=-.18;rz=-.45;}wake();});
  document.getElementById('explode').addEventListener('click',e=>{targetSep=targetSep?0:1;e.currentTarget.setAttribute('aria-pressed',String(!!targetSep));e.currentTarget.firstChild.textContent=targetSep?'Join layers ':'Separate layers ';wake();});
  document.querySelectorAll('#scene-rh button').forEach(b=>b.addEventListener('click',()=>{rh=Number(b.dataset.rh)/100;document.querySelectorAll('#scene-rh button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));wake();}));
  new ResizeObserver(wake).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}}).observe(canvas);document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);fail();});wake();
})();
