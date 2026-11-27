const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const [,,file,out,chs]=process.argv;
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();await p.setViewport({width:1400,height:1000});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,800));fs.mkdirSync(out,{recursive:true});
const st=await p.$('#stage');const shot=async n=>{await st.screenshot({path:path.join(out,n+'.jpg'),type:'jpeg',quality:80})};
await p.evaluate(()=>{ARENA.pause(true)});
const ev=(f,...a)=>p.evaluate(f,...a);
if(chs.includes('t')){await ev(()=>ARENA.story.title());await new Promise(r=>setTimeout(r,200));await shot('00_title')}
for(const c of chs.split(',').filter(x=>/^\d$/.test(x)).map(Number)){
 await ev(i=>{ARENA.story.start(i);ARENA.story.god(true)},c);await shot(`${c}_a_card`);
 await ev(()=>{cardDone();for(let i=0;i<3;i++)advance();STORY.typed=999;$('dlgTxt').textContent=STORY.talk.text;render()});await shot(`${c}_b_talk`);
 await ev(()=>{ARENA.story.skip();});
 // waves: run and kill periodically
 let s=await ev(()=>{const L=[];for(let i=0;i<260;i++){simStep();render()}render();return ARENA.story.state()});await shot(`${c}_c_wave`);
 for(let k=0;k<40;k++){s=await ev(()=>{for(const e of enemies)if(!e.dead&&!e.boss)damage(e,e.hp+1,'',null);for(let i=0;i<60;i++){simStep();if(STORY.talk)break}render();return ARENA.story.state()});if(s.talk)break}
 await ev(()=>{if(STORY.talk){STORY.typed=999;$('dlgTxt').textContent=STORY.talk.text}});await shot(`${c}_d_bossintro`);
 await ev(()=>ARENA.story.skip());
 s=await ev(()=>{ARENA.aimAt(STORY.boss.pos.x,STORY.boss.pos.z);for(let i=0;i<150;i++){simStep();if(i%30===0){ARENA.aimAt(STORY.boss.pos.x,STORY.boss.pos.z);cds.Q=0;cast('Q')}}updateHUD();render();return ARENA.story.state()});await shot(`${c}_e_boss`);
 s=await ev(()=>{const r=[];for(let i=0;i<200;i++){simStep();if(STORY.boss&&STORY.boss.boss.pat)r.push(STORY.boss.boss.pat.type)}updateHUD();render();return [ARENA.story.state(),[...new Set(r)]]});await shot(`${c}_f_boss2`);console.log('ch',c,'boss patterns',JSON.stringify(s[1]),'hp',s[0].hp,'core',s[0].core);
 s=await ev(()=>{damage(STORY.boss,STORY.boss.hp+1,'big',null);for(let i=0;i<100;i++){simStep();if(STORY.talk)break}render();return ARENA.story.state()});
 await ev(()=>{if(STORY.talk){STORY.typed=999;$('dlgTxt').textContent=STORY.talk.text}});await shot(`${c}_g_outro`);
 await ev(()=>ARENA.story.skip());await new Promise(r=>setTimeout(r,150));await shot(`${c}_h_clear`);
 console.log('ch',c,JSON.stringify(await ev(()=>ARENA.story.state())));
}
console.log('errs',errs.slice(0,8));await b.close()})();
