import {createUI} from './ui.js';
import {createWorld} from './world.js';
const ui=createUI();
try{createWorld(ui.inspect);}catch(error){
 console.error('Field lab initialization failed:',error);
 const loading=document.getElementById('scene-loading');
 loading.replaceChildren(document.createTextNode('The 3D scene could not initialize. Please reload. Dataset views remain available.'));
 document.getElementById('render-status').textContent='SCENE ERROR';
}
