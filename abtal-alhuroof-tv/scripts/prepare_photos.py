#!/usr/bin/env python3
"""Fetch *licensed* Wikimedia Commons photos, optimise to small local JPEGs.
All filenames, authors and licence links are documented in PHOTO_CREDITS.md.
Offline APK will contain JPEGs; Android 4.4 WebView uses no network at runtime.
No fan-made art, game IP, channel thumbnails or unlicensed celebrity images.
"""
from __future__ import annotations
import hashlib, io, os, time, urllib.request, urllib.parse
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'app/src/main/assets/photos'
DEST.mkdir(parents=True,exist_ok=True)
FILES={
 'lion':'Lion_(cc).jpg',
 'cat':'A_pic_of_cat.jpg',
 'dog':'Dog_photos.jpg',
 'elephant':'Elephant.jpg',
 'horse':'Horse_Profile.JPG',
 'fish':'Fish_photo.jpg',
 'apple':'Nopple_apple.jpg',
 'banana':'Banana_picture.jpg',
 'orange':'Orange_fruit_(Citrus_×_sinensis).jpg',
 'grapes':'Grapes_1.jpg',
 'aboflah':'أبو_فلة.jpg',
 'mrbeast':'MrBeast_2023.jpg',
 'markrober':'Mark_Rober_September_2024.jpg',
}
UA='AbtalAcademyKidsTV/2.2 (educational offline bundle; https://github.com/youef/gamesplay)'
def urls(title):
 title=title.replace(' ','_')
 digest=hashlib.md5(title.encode('utf-8')).hexdigest()
 encoded=urllib.parse.quote(title,safe='()')
 return [
  'https://upload.wikimedia.org/wikipedia/commons/'+digest[0]+'/'+digest[:2]+'/'+encoded,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encoded
 ]
def get_file(title):
 error=None
 for url in urls(title):
  for n in range(3):
   try:
    r=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg,image/png,image/*'})
    with urllib.request.urlopen(r,timeout=35) as response:
     data=response.read(18_000_000)
     content_type=response.headers.get('Content-Type','')
    if not data.startswith((b'\xff\xd8',b'\x89PNG',b'GIF8',b'RIFF')):
     raise ValueError('Not image: '+content_type)
    return data
   except Exception as exc:
    error=exc
    print('RETRY',title,type(exc).__name__,str(exc)[:100],flush=True)
    time.sleep(3*(n+1))
 raise RuntimeError('Could not fetch licensed photo '+title+': '+repr(error))
for key,title in FILES.items():
 dest=DEST/(key+'.jpg')
 if dest.is_file() and dest.stat().st_size>3000:
  with Image.open(dest) as check:
   check.verify()
  print('CACHED',key,dest.stat().st_size)
  continue
 data=get_file(title)
 img=Image.open(io.BytesIO(data))
 img=ImageOps.exif_transpose(img)
 img=img.convert('RGB')
 # Preserve portrait aspect, padding rather than cutting faces/animals.
 canvas=Image.new('RGB',(380,260),(27,42,73))
 thumb=ImageOps.contain(img,(366,248),Image.Resampling.LANCZOS)
 canvas.paste(thumb,((380-thumb.width)//2,(260-thumb.height)//2))
 canvas.save(dest,format='JPEG',quality=72,optimize=True,progressive=False,subsampling=2)
 if dest.stat().st_size<3000 or dest.stat().st_size>320000:
  raise RuntimeError('Photo compression outside target range '+str(dest))
 print('PHOTO',key, title, dest.stat().st_size,flush=True)
 time.sleep(1.35)  # Be polite to Wikimedia and avoid rate limiting on CI.
print('PASS: '+str(len(FILES))+' verified offline licensed photography JPEGs')
