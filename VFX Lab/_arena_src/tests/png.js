const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'],headless:true});
const p=await b.newPage();await p.setViewport({width:1400,height:1000});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
await p.goto('file://'+path.resolve(process.argv[2]),{waitUntil:'load'});await new Promise(r=>setTimeout(r,1500));
const r=await p.evaluate(()=>{ARENA.pause(true);ARENA.story.start(0);cardDone();advance();STORY.typed=999;advance();const a=$('tcL').innerHTML.slice(0,60);STORY.typed=999;advance();STORY.typed=999;advance();return [Object.keys(TIMG),a,$('tcL').innerHTML.slice(0,60)]});
await new Promise(r=>setTimeout(r,500));await (await p.$('#stage')).screenshot({path:process.argv[3]});
console.log(JSON.stringify(r),errs);await b.close()})();
