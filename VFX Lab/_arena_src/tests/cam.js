const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const [,,file,out,ws,style]=process.argv;
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,600));
fs.mkdirSync(out,{recursive:true});
for(const w of ws.split(',')){
 const r=await p.evaluate((w,style)=>{ARENA.pause(true);ARENA.SC.enemyAttack=false;ARENA.SC.enemyMove=false;ARENA.SC.camStyle=style||'cine';ARENA.all(true);ARENA.weapon(w);ARENA.tp(0,2);ARENA.run(30);
  const tg=ARENA.enemies().map((e,i)=>[i,Math.hypot(e[0],e[1]-2)]).sort((a,b)=>a[1]-b[1])[1][0], E=ARENA.enemies()[tg]; ARENA.aimAt(E[0],E[1]); ARENA.run(2); ARENA.cast('F');
  const imgs={},log=[];let boom=-1,fm=0;for(let i=1;i<=260;i++){simStep();render();fm=Math.max(fm,monLast.flashes);if(boom<0&&CD.insert>0)boom=i;
   const want=(boom<0&&i%14===0)||(boom>0&&i>=boom&&i<=boom+7)||(boom>0&&[boom+14,boom+40,boom+80].includes(i));
   log.push([i,+CD.push.toFixed(2),+CD.yaw.toFixed(2),+CD.lb.toFixed(2),+CD.vig.toFixed(2),CD.insert,+CD.ca.toFixed(2),invF,Math.round(monLast.cov)]);
   if(want)imgs[i]=cv.toDataURL('image/jpeg',.75)}
  return {boom,fm,imgs,log:log.filter((l,i)=>i%10===0||(boom>0&&l[0]>=boom-3&&l[0]<=boom+8))}},w,style);
 for(const [f,d] of Object.entries(r.imgs))fs.writeFileSync(path.join(out,`${w}_${String(f).padStart(3,'0')}.jpg`),Buffer.from(d.split(',')[1],'base64'));
 console.log(w,'boom',r.boom,'flashMax',r.fm);console.log(r.log.map(l=>l.join(' ')).join(' | '));
 await p.evaluate(()=>ARENA.run(200));}
console.log('errs',errs);await b.close()})();
