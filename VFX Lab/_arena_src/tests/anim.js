const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const [,,file,out,spec]=process.argv; const S=JSON.parse(spec);
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,600));
fs.mkdirSync(out,{recursive:true});
for(const w of S){const r=await p.evaluate(w=>{ARENA.pause(true);ARENA.SC.enemyAttack=false;ARENA.SC.enemyMove=false;ARENA.SC.camH=w.cam||.55;ARENA.all(true);ARENA.weapon(w.w);ARENA.tp(...(w.tp||[3.6,-0.2]));ARENA.aimAt(...(w.aim||[5.5,-.6]));ARENA.run(20);
  const imgs={};let i=0;for(const st of w.steps){ if(st.key){if(st.down)keys.add(st.key);else keys.delete(st.key)} if(st.cast){ARENA.cast(st.cast)} if(st.hold!=null){ARENA.hold(st.k,st.hold)} if(st.aim)ARENA.aimAt(...st.aim);
   for(let n=0;n<(st.n||0);n++){i++;simStep();render();if((st.shots||[]).includes(n+1))imgs[w.w+'_'+(st.tag||'s')+'_'+String(n+1).padStart(2,'0')]=cv.toDataURL('image/jpeg',.8)}}
  return imgs},w);
 for(const [f,d] of Object.entries(r))fs.writeFileSync(path.join(out,f+'.jpg'),Buffer.from(d.split(',')[1],'base64'));}
console.log('errs',errs);await b.close()})();
