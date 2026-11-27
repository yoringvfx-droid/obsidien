const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),path=require('path');
const [,,file,chs]=process.argv;
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],headless:true});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));await p.goto('file://'+path.resolve(file),{waitUntil:'load'});await new Promise(r=>setTimeout(r,800));
for(const c of chs.split(',').map(Number)){
 const r=await p.evaluate(c=>{ARENA.pause(true);ARENA.story.start(c);cardDone();ARENA.story.skip();let f=0,log=[];
  const bot=()=>{const al=enemies.filter(e=>!e.dead);if(!al.length)return;const t=al.sort((a,b)=>a.pos.distanceTo(player.pos)-b.pos.distanceTo(player.pos))[0];aim.copy(t.pos);
    let want=STORY.core.g.position.clone().lerp(t.pos,(W==='sword'||W==='hammer')?.9:.45);want.y=0;const B=STORY.boss;if(B&&!B.dead){const d=player.pos.clone().sub(B.pos).setY(0);if(d.length()<1e-3)d.set(1,0,0);want=B.pos.clone().add(d.normalize().multiplyScalar((W==='sword'||W==='hammer')?2.6:8.5));const P=B.boss.pat;if(P&&P.type==='slam'&&P.at&&player.pos.distanceTo(P.at)<3.4)want=player.pos.clone().add(player.pos.clone().sub(P.at).setY(0).normalize().multiplyScalar(4));if(P&&P.type==='dash'&&P.dir){const side=V3(-P.dir.z,0,P.dir.x);want=player.pos.clone().addScaledVector(side,4)}}if(want.length()>19)want.setLength(19);moveTo=want;['Q','R','F','E'].forEach(k=>{if(cds[k]<=0&&!player.cast&&!WS()[k].hold)cast(k)}); if(WS().E.hold&&!holdAct&&cds.E<=0&&t.pos.distanceTo(player.pos)<12){holdDown('E');setTimeout&&0} if(holdAct&&holdAct.t>50)holdUp('E')};
  while(f<60*240){f++;if(STORY.talk){if(STORY.phase==='bossintro'||STORY.phase==='intro')ARENA.story.skip();else break}if(['clear','fail','ending'].includes(STORY.phase))break;bot();simStep();if(f%600===0)log.push(f/60+'s:'+STORY.phase+' k'+STORY.kills+' core'+Math.round(STORY.core.hp)+' hp'+Math.round(player.hp)+(STORY.boss?' boss'+Math.round(STORY.boss.hp):''))}
  return {f,sec:Math.round(f/60),st:ARENA.story.state(),log}},c);
 console.log('CH',c+1,r.sec+'s',JSON.stringify(r.st),'\n  ',r.log.join(' | '))}
console.log('errs',errs.slice(0,5));await b.close()})();
