import os,sys
D=os.path.dirname(os.path.abspath(__file__))
shell=open(os.path.join(D,'src','shell.html'),encoding='utf-8').read()
three=open(sys.argv[1] if len(sys.argv)>1 else '/tmp/three/node_modules/three/build/three.min.js',encoding='utf-8').read()
game=open(os.path.join(D,'src','game.js'),encoding='utf-8').read()
wpn=open(os.path.join(D,'src','weapons.js'),encoding='utf-8').read()
assert '/*WEAPONS*/' in game
game=game.replace('/*WEAPONS*/',wpn)
rig=open(os.path.join(D,'src','rig.js'),encoding='utf-8').read()
assert '/*RIG*/' in game
game=game.replace('/*RIG*/',rig)
story=open(os.path.join(D,'src','story.js'),encoding='utf-8').read()
assert '/*STORY*/' in game
tach=open(os.path.join(D,'src','tachie.js'),encoding='utf-8').read()
game=game.replace('/*STORY*/',tach+'\n'+story)
open(os.path.join(D,'src','_bundle.js'),'w',encoding='utf-8').write(game)
out=shell.replace('<script>/*THREE*/</script>','<script>'+three+'</script>').replace('<script>/*GAME*/</script>','<script>'+game+'</script>')
open(os.path.join(D,'이펙트_아레나.html'),'w',encoding='utf-8').write(out); print('built',len(out)//1024,'KB')
