const T=require(process.argv[2]),fs=require('fs'),path=require('path');const out=process.argv[3];fs.mkdirSync(out,{recursive:true});let n=0;
for(const id of T.ids)for(const ex of T.exprs){fs.writeFileSync(path.join(out,`${id}_${ex}.svg`),T.svg(id,ex));n++}
for(const id of T.foes){fs.writeFileSync(path.join(out,`${id}.svg`),T.svg(id,'normal'));n++}
console.log('svg',n)
