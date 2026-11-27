const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const [,,file,out]=process.argv;
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();await p.setViewport({width:1400,height:1000});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,800));fs.mkdirSync(out,{recursive:true});
const st=await p.$('#stage');const shot=async n=>{await st.screenshot({path:path.join(out,n+'.jpg'),type:'jpeg',quality:80})};const W=ms=>new Promise(r=>setTimeout(r,ms));const S=()=>p.evaluate(()=>ARENA.story.state());
await p.click('#bStory');await W(300);await shot('r0_title');
await p.click('[data-act=start][data-arg="0"]');await W(500);console.log('after start',JSON.stringify(await S()));
await W(2600);console.log('after card',JSON.stringify(await S()));await W(700);await shot('r1_typing');
for(let i=0;i<30;i++){await p.keyboard.press('Space');await W(60)}console.log('after talk',JSON.stringify(await S()));
await W(3000);console.log('wave running',JSON.stringify(await S()));await shot('r2_wave_rt');
// pause menu
await p.keyboard.press('Escape');await W(200);await shot('r3_pause');console.log('pause',JSON.stringify(await S()));await p.keyboard.press('Escape');await W(200);
// fail by core
await p.evaluate(()=>{STORY.core.hp=5;biteCore(10,{pos:V3(0,0,0)})});await W(300);await shot('r4_fail');console.log('fail',JSON.stringify(await S()));
// ending sequence
await p.evaluate(()=>{startEnding()});for(let i=0;i<8;i++){await W(250);await shot('r5_end_'+i);await p.click('#menu')}
await W(300);console.log('after ending',JSON.stringify(await S()));await shot('r6_title_after');
// practice return
await p.click('[data-act=practice]');await W(400);console.log('practice',JSON.stringify(await S()), await p.evaluate(()=>enemies.length));await shot('r7_practice');
console.log('errs',errs.slice(0,8));await b.close()})();
