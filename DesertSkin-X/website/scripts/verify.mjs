import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const context=vm.createContext({window:{}});
for(const file of ['data.js','core.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),context);
const data=context.window.DESERTSKIN_DATA,C=context.window.DesertSkinCore;
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
check('Global browser KPIs reconcile with the validated workbook',()=>{
  const actual=C.summarize(data.readings,data.settings.time_step_h,Object.keys(data.scenarios).length);
  near(actual.average_savings_pct,15.121282238095239);
  near(actual.water_saved_l,72.63730153416667);
  assert.equal(actual.record_count,168);assert.equal(actual.scenario_count,8);
});
check('Storage selection and reset preserve the calculation contract',()=>{
  const selected=C.select(data,'C05'),s=C.summarize(selected,1,1);
  assert.equal(s.record_count,21);assert.equal(s.average_savings_pct.toFixed(2),'16.39');
  assert.equal(s.water_saved_l.toFixed(2),'4.30');
  assert.equal(C.select(data,'all').length,168);
});
check('Unequal baselines use the mean of percentages, including valid zero savings',()=>{
  const s=C.summarize([{water_savings_pct:0,water_saved_lph:0},{water_savings_pct:50,water_saved_lph:100}],.5,2);
  near(s.average_savings_pct,25);near(s.water_saved_l,50);
});
check('Every exported alert reconciles with the threshold rules',()=>{
  for(const row of data.readings)assert.equal(C.classify(row,data.settings),row.alert);
  assert.equal(data.readings.filter(r=>r.alert==='CRITICAL').length,16);
  assert.equal(data.readings.filter(r=>r.alert==='WARNING').length,0);
  assert.equal(C.select(data,'C05').filter(r=>r.alert==='CRITICAL').length,5);
  const r=data.readings.find(r=>r.record_id==='T0005');
  assert.equal(r.humidity_risk,0);assert.match(C.triggers(r,data.settings)[0],/38.59 °C exceeds 38 °C/);
});
check('Threshold equality is normal; strictly greater temperature or risk triggers an event',()=>{
  const r={internal_rh_pct:75,temperature_c:38,humidity_risk:25};
  assert.equal(C.classify(r,data.settings),'NORMAL');
  assert.equal(C.classify({...r,temperature_c:38.0001},data.settings),'CRITICAL');
  assert.equal(C.classify({...r,humidity_risk:25.0001},data.settings),'WARNING');
});
check('Matched-RH materials keep the open-aperture reference separate',()=>{
  const m=C.materials(data,['S0','S4'],30);assert.equal(m.length,2);assert.ok(m.every(r=>r.rh_pct===30&&r.membrane_id!=='S7'));
  near(m[0].wvtr_g_m2_day,166.424);near(m[0].permeance_g_m2_day_kpa,524.9968454258674);near(m[0].swelling_pct,19.5);
  for(const r of data.materials){near(r.wvtr_g_m2_day,r.mass_change_g/r.area_m2/(r.duration_h/24));near(r.permeance_g_m2_day_kpa,r.wvtr_g_m2_day/r.vapor_delta_kpa);near(r.swelling_pct,100*(r.hydrated_mass_g-r.dry_mass_g)/r.dry_mass_g);}
  assert.equal(C.materials(data,['S7'],50).length,1);
});
check('Empty selections expose no unavailable average as a real zero',()=>{
  const s=C.summarize([],1,0);assert.equal(s.average_savings_pct,null);assert.equal(s.water_saved_l,0);assert.equal(C.materials(data,[],50).length,0);
});
check('The site is self-contained and works under a GitHub repository subpath',()=>{
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(dist,match[1])),match[1]);
  assert.ok(!/(?:src|href)="\//.test(html),'Root-relative assets break repository Pages paths');
  for(const file of fs.readdirSync(dist).filter(f=>/\.(js|css|html)$/.test(f))){const text=fs.readFileSync(path.join(dist,file),'utf8');assert.ok(!/https?:\/\/[^\s"']+\.(?:js|css)/.test(text),'No external runtime dependency');}
});
check('The export retains source precision, workbook times and provenance',()=>{
  assert.equal(data.fingerprint,'1a00e092329cbdeab485f6a89f3ace3ceb2eda8936d0700aa00799c5e9092519');
  assert.ok(data.readings.every(r=>!r.timestamp.endsWith('Z')&&!r.timestamp.includes('+')));
  assert.match(data.provenance,/synthetic/);assert.equal(data.materials.length,24);
});
console.log(`\n${checks} verification groups passed.`);
