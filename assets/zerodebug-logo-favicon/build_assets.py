from pathlib import Path
from math import pi,cos,sin,tan,hypot
import json,fitz
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parent
N=1254
def point(p):return f'{p[0]:.5f},{p[1]:.5f}'
def rounded_hex():
    center=(626.5,619.0);radius=482.;fillet=28.
    v=[(center[0]+radius*cos(-pi/2+i*pi/3),center[1]+radius*sin(-pi/2+i*pi/3)) for i in range(6)]
    d=fillet/tan(pi/3)
    def towards(a,b):
        length=hypot(b[0]-a[0],b[1]-a[1]);return (a[0]+(b[0]-a[0])*d/length,a[1]+(b[1]-a[1])*d/length)
    incoming=[towards(v[i],v[(i-1)%6]) for i in range(6)]
    outgoing=[towards(v[i],v[(i+1)%6]) for i in range(6)]
    p='M'+point(outgoing[0])
    for j in range(1,7):
        i=j%6;p+=' L'+point(incoming[i])+f' A{fillet},{fillet} 0 0 1 '+point(outgoing[i])
    return p+' Z'

# The selected Soft Geometry mark, reconstructed as smooth native vector paths.
segments=[((304.,425.),(624.,237.)),((950.,438.),(950.,796.)),((307.,807.),(620.,993.))]
def logo_svg(favicon=False):
    stroke=56 if favicon else 42
    paths=[f'<path d="{rounded_hex()}" fill="none" stroke="#FFFFFF" stroke-width="{stroke}" stroke-linejoin="round"/>']
    for a,b in segments:
        if favicon:
            a,b=((a[0]+(b[0]-a[0])*.04,a[1]+(b[1]-a[1])*.04),(b[0]+(a[0]-b[0])*.04,b[1]+(a[1]-b[1])*.04))
        dx,dy=b[0]-a[0],b[1]-a[1];length=hypot(dx,dy);r=stroke/2
        nx,ny=-dy/length*r,dx/length*r
        ap=(a[0]+nx,a[1]+ny);am=(a[0]-nx,a[1]-ny)
        bp=(b[0]+nx,b[1]+ny);bm=(b[0]-nx,b[1]-ny)
        d=f'M{point(ap)} L{point(bp)} A{r},{r} 0 0 0 {point(bm)} L{point(am)} A{r},{r} 0 0 0 {point(ap)} Z'
        paths.append(f'<path d="{d}" fill="#FFFFFF"/>')
    background='<rect width="1254" height="1254" fill="#101722"/>' if favicon else ''
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" width="1254" height="1254" role="img" aria-labelledby="title">'
      '<title id="title">Zerodebug Soft Geometry logo</title>'+background+
      ''.join(paths)+'</svg>\n')

logo=ROOT/'zerodebug-logo-white-transparent.svg';logo.write_text(logo_svg())
fav=ROOT/'favicon.svg';fav.write_text(logo_svg(True))
def render(source,destination,size):
    svgdoc=fitz.open(stream=source.read_bytes(),filetype='svg')
    pdfdoc=fitz.open(stream=svgdoc.convert_to_pdf(),filetype='pdf')
    page=pdfdoc[0]
    page.get_pixmap(matrix=fitz.Matrix(size/page.rect.width,size/page.rect.height),alpha=True).save(destination)
    pdfdoc.close();svgdoc.close()
render(logo,ROOT/'zerodebug-logo-white-transparent.png',2048)
render(logo,ROOT/'zerodebug-logo-white-transparent-512.png',512)
for size in [16,32,48,64,128,180,192,512]:
    name='apple-touch-icon.png' if size==180 else f'favicon-{size}x{size}.png'
    render(fav,ROOT/name,size)
Image.open(ROOT/'favicon-512x512.png').convert('RGBA').save(ROOT/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64)])

# Validate transparency and pure-white ink. No raster background-removal operations.
import numpy as np
a=np.array(Image.open(ROOT/'zerodebug-logo-white-transparent.png').convert('RGBA'))
assert a[:,:,3].min()==0 and a[:,:,3].max()==255
assert all((a[y,x,3]==0) for x,y in [(0,0),(1024,1024),(2047,2047)])
assert np.all(a[:,:,:3][a[:,:,3]==255]==255)
assert np.all(a[:,:,:3][a[:,:,3]>0]>=254) # 1-LSB anti-alias rounding in PNG export
from scipy.ndimage import label
_,components=label(a[:,:,3]>127)
assert components==4,components
assert Image.open(ROOT/'favicon.ico').ico.sizes()=={(16,16),(32,32),(48,48),(64,64)}
for size in [16,32,48,64,128,192,512]:assert Image.open(ROOT/f'favicon-{size}x{size}.png').size==(size,size)

# Internal review sheet at actual favicon sizes and a large clean logo preview.
sheet=Image.new('RGB',(480,180),'#e7e9ed');d=ImageDraw.Draw(sheet)
for i,size in enumerate([16,32,48,64]):
    x=16+i*112;thumb=Image.open(ROOT/f'favicon-{size}x{size}.png').convert('RGB')
    sheet.paste(thumb,(x,38));d.text((x,13),str(size)+'px',fill='#152235')
    sheet.paste(thumb.resize((64,64),Image.Resampling.NEAREST),(x,108))
sheet.save(ROOT.parent/'favicon-qa-final.png')
print(json.dumps({'logoSize':a.shape[:2],'alpha':'transparent outside and center','ink':'pure #FFFFFF','foregroundComponents':components,'icoSizes':[16,32,48,64]}))
