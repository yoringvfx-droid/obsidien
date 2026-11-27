const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();await p.setViewport({width:1500,height:1100});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
await p.goto('file://'+path.resolve(process.argv[2]),{waitUntil:'load'});await new Promise(r=>setTimeout(r,600));
await p.evaluate(()=>{ARENA.pause(true);ARENA.SC.enemyAttack=false;document.querySelector('[data-tab=sk]').click()});
await p.click('[data-wb=hammer]'); await p.evaluate(()=>{ARENA.tp(3.6,-.2);ARENA.aimAt(5.5,-.6);ARENA.cast('Q');ARENA.run(19)});
await p.screenshot({path:process.argv[3]+'/ui_hammer.png'});
await p.click('[data-w=sword]'); await p.evaluate(()=>{ARENA.cast('E');ARENA.run(14)});
await p.screenshot({path:process.argv[3]+'/ui_sword.png'});
// off mode for all weapons
const r=await p.evaluate(()=>{const out={};ARENA.all(false);for(const w of ['staff','sword','bow','hammer']){ARENA.weapon(w);ARENA.tp(3.6,-.2);ARENA.demo();const x=ARENA.run(560);out[w]=[x.flashMax,Math.round(x.covMax)]}ARENA.all(true);
 // json roundtrip
 ARENA.weapon('bow');ARENA.WEAPONS.bow.skills.Q.hue=33;document.querySelector('[data-tab=io]').click();const j=document.getElementById('ioTxt').value;ARENA.WEAPONS.bow.skills.Q.hue=125;ARENA.weapon('staff');document.getElementById('ioTxt').value=j;document.getElementById('bLoad').click();out.load=[ARENA.weapon(),ARENA.WEAPONS.bow.skills.Q.hue];
 // keyboard
 return out});
await p.focus('#cv'); await p.keyboard.press('Tab'); const w1=await p.evaluate(()=>ARENA.weapon()); await p.keyboard.press('5'); const w2=await p.evaluate(()=>ARENA.weapon());
await p.evaluate(()=>{ARENA.weapon('hammer')}); await p.keyboard.down('e'); await p.evaluate(()=>ARENA.run(30)); const spin=await p.evaluate(()=>[ARENA.actives(),holdAct&&holdAct.constructor.name]); await p.keyboard.up('e'); await p.evaluate(()=>ARENA.run(5)); const after=await p.evaluate(()=>[holdAct?1:0,ARENA.cds().E]);
console.log(JSON.stringify(r),w1,w2,JSON.stringify(spin),JSON.stringify(after),errs);await b.close()})();
