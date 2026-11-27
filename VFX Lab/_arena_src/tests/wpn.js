const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const [,,file,out,spec]=process.argv; const S=JSON.parse(spec);
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();await p.setViewport({width:1500,height:1000});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,600));
fs.mkdirSync(out,{recursive:true});
for(const w of S){const t0=Date.now();
 const r=await p.evaluate(w=>{ARENA.pause(true);ARENA.SC.enemyAttack=false;ARENA.SC.enemyMove=false;ARENA.all(w.off?false:true);ARENA.weapon(w.w);if(w.tp)ARENA.tp(...w.tp);ARENA.run(5);ARENA.demo();const res=ARENA.run(w.n,w.shots);return {...res,keys:document.getElementById('keysSk').textContent,mode:document.getElementById('modeTag').textContent,act:ARENA.actives()}},w);
 for(const [f,d] of Object.entries(r.imgs)){fs.writeFileSync(path.join(out,`${w.w}${w.off?'_off':''}_${String(f).padStart(3,'0')}.jpg`),Buffer.from(d.split(',')[1],'base64'))}
 delete r.imgs; console.log(w.w,(w.off?'OFF':''),JSON.stringify(r),(Date.now()-t0)+'ms');
 await p.evaluate(()=>{ARENA.run(160)});}
console.log('errs',errs.slice(0,10));await b.close()})();
