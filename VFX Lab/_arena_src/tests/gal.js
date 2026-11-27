const chromium=require('@sparticuz/chromium'),puppeteer=require('puppeteer-core'),fs=require('fs'),path=require('path');
const T=require(process.argv[2]);const out=process.argv[3];const mode=process.argv[4]||'cast';
let cells=[];
if(mode==='cast'){for(const id of T.ids)cells.push([id,'normal']);for(const id of T.foes)cells.push([id,'normal'])}
else if(mode==='faces'){for(const ex of T.exprs)cells.push([process.argv[5]||'fene',ex])}
const html=`<html><body style="margin:0;background:#2a2f3a;display:flex;flex-wrap:wrap;gap:6px;padding:6px;width:${mode==='faces'?1440:1600}px">${cells.map(([id,ex])=>`<div style="width:${mode==='faces'?280:300}px;height:${mode==='faces'?318:690}px;background:#3a4050;overflow:hidden;position:relative"><div style="position:absolute;left:0;top:0;width:${mode==='faces'?280:300}px;">${mode==='faces'?T.svg(id,ex).replace('viewBox="0 0 420 960"','viewBox="100 70 220 250"'):T.svg(id,ex)}</div><span style="position:absolute;left:4px;bottom:2px;color:#ff0;font:12px sans-serif">${id} ${ex}</span></div>`).join('')}</body></html>`;
fs.writeFileSync('/tmp/gal.html',html);
(async()=>{const b=await puppeteer.launch({executablePath:await chromium.executablePath(),args:chromium.args,headless:true});const p=await b.newPage();await p.setViewport({width:mode==='faces'?1460:1620,height:mode==='faces'?700:1420});await p.goto('file:///tmp/gal.html');await p.screenshot({path:out,fullPage:true});await b.close()})();
