import sys,glob,os
from PIL import Image,ImageDraw
d,pat,outp=sys.argv[1],sys.argv[2],sys.argv[3]; cols=int(sys.argv[4]) if len(sys.argv)>4 else 3; W=int(sys.argv[5]) if len(sys.argv)>5 else 560
fs=sorted(glob.glob(os.path.join(d,pat)))
ims=[Image.open(f) for f in fs]; H=int(W*ims[0].height/ims[0].width)
rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*W,rows*H),(0,0,0))
for i,(f,im) in enumerate(zip(fs,ims)):
    im=im.resize((W,H)); x,y=(i%cols)*W,(i//cols)*H; S.paste(im,(x,y)); dr=ImageDraw.Draw(S); dr.rectangle([x,y,x+90,y+18],fill=(0,0,0)); dr.text((x+4,y+3),os.path.basename(f)[:-4],fill=(255,255,0))
S.save(outp,quality=85); print(outp,S.size)
