import sys, weasyprint, fitz
# shot.py <html> <width px> <out.png> [max pages]
src, w, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
maxp = int(sys.argv[4]) if len(sys.argv) > 4 else 3
css = weasyprint.CSS(string=f"@page{{size:{w}px 1800px;margin:0}} #cookie-banner{{display:none!important}}")
pdf = weasyprint.HTML(filename=src, base_url=src).write_pdf(stylesheets=[css])
doc = fitz.open(stream=pdf, filetype="pdf")
pages = min(maxp, len(doc))
import PIL.Image as I
imgs = []
for i in range(pages):
    pix = doc[i].get_pixmap(dpi=96 if w > 600 else 144)
    imgs.append(I.frombytes("RGB", (pix.width, pix.height), pix.samples))
W = imgs[0].width; H = sum(i.height for i in imgs)
canvas = I.new("RGB", (W, H), "white"); y = 0
for im in imgs: canvas.paste(im, (0, y)); y += im.height
canvas.save(out); print(out, len(doc), "pages total")
