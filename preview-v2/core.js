/* Calculation contract shared by the dashboard and independent verification. */
(function(root){
  'use strict';
  const sum = values => values.reduce((total,value) => total+value,0);
  const select = (data,id) => data.readings.filter(row=>id==='all'||row.scenario_id===id);
  const summarize = (rows,step,scenarioCount) => ({
    average_savings_pct:rows.length?sum(rows.map(r=>r.water_savings_pct))/rows.length:null,
    water_saved_l:sum(rows.map(r=>r.water_saved_lph*step)),
    record_count:rows.length,scenario_count:scenarioCount
  });
  const classify=(r,s)=>r.internal_rh_pct>s.alert_rh_high_pct||r.temperature_c>s.alert_temperature_high_c?'CRITICAL':r.humidity_risk>25?'WARNING':'NORMAL';
  const triggers=(r,s)=>{
    const result=[];
    if(r.internal_rh_pct>s.alert_rh_high_pct)result.push(`Internal RH ${r.internal_rh_pct.toFixed(2)}% exceeds ${s.alert_rh_high_pct}%.`);
    if(r.temperature_c>s.alert_temperature_high_c)result.push(`Temperature ${r.temperature_c.toFixed(2)} °C exceeds ${s.alert_temperature_high_c} °C.`);
    if(!result.length&&r.humidity_risk>25)result.push(`Humidity risk ${r.humidity_risk.toFixed(2)} exceeds 25.`);
    return result;
  };
  const materials=(data,ids,rh)=>data.materials.filter(r=>ids.includes(r.membrane_id)&&r.rh_pct===Number(rh));
  root.DesertSkinCore={sum,select,summarize,classify,triggers,materials};
})(typeof window!=='undefined'?window:globalThis);
