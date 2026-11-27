const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));await p.goto('file://'+path.resolve(process.argv[2]),{waitUntil:'load'});await new Promise(r=>setTimeout(r,600));
const r=await p.evaluate(src=>eval(src),process.argv[3]);
const im=await p.evaluate(()=>window.__img||null);if(im)fs.writeFileSync(process.argv[4]||'/tmp/dbg.jpg',Buffer.from(im.split(',')[1],'base64'));
console.log(JSON.stringify(r),errs);await b.close()})();
