const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(process.env.FW_BUTTON_SOURCE||path.join(__dirname,'../assets/app.js'),'utf8');
const fn=source.slice(source.indexOf('function buttonAwardUpdate()'),source.indexOf('let timerId='));
for(const seed of ['null','[]','true','42','"text"','{broken','{"gold":true}']){
 let saved=seed;const el={textContent:''};
 vm.runInNewContext('"use strict";'+fn+';buttonAwardUpdate()', {score:800,buttonAwards:[['first','첫 완주'],['bronze','800점'],['gold','1800점']],localStorage:{getItem:()=>seed,setItem:(_,v)=>saved=v},document:{getElementById:()=>el}});
 const awards=JSON.parse(saved);assert.equal(awards.first,true,seed);assert.equal(awards.bronze,true,seed);assert.equal(awards.gold,seed==='{"gold":true}'?true:undefined,seed);assert.match(el.textContent,/첫 완주 ✅/);
}
for(const operation of ['getItem','setItem']){
 const storage={getItem:()=>'{"gold":true}',setItem:()=>{}};storage[operation]=()=>{throw new Error('storage unavailable')};
 assert.doesNotThrow(()=>vm.runInNewContext('"use strict";'+fn+';buttonAwardUpdate()', {score:0,buttonAwards:[],localStorage:storage,document:{getElementById:()=>null}}));
}
console.log('PASS invalid award values recover, existing awards persist, denied storage does not interrupt results');
