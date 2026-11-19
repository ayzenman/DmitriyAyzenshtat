import pickle, sys, os, io, weasyprint, fitz
from PIL import Image
PUB = sys.argv[1]
pages = pickle.load(open("/home/claude/build/pages.pkl", "rb"))
TPL = """<html><head><style>
@page{size:1200px 630px;margin:0}
body{margin:0;width:1200px;height:630px;background:#f3efe9;font-family:"DejaVu Sans",Arial,sans-serif;position:relative;overflow:hidden}
.w{position:absolute;left:96px;top:78px;width:880px}
.k{font-size:30px;font-weight:700;color:#d9773f;margin:0 0 22px}
.t{font-size:%(fs)dpx;line-height:1.12;font-weight:800;color:#17345f;margin:0}
.bar{width:96px;height:8px;background:#d9773f;border-radius:4px;margin:28px 0 22px}
.s{font-size:30px;line-height:1.3;color:#17345f;margin:0}
.f{position:absolute;left:96px;bottom:60px;font-size:22px;color:#7a7f8a}
.n{position:absolute;right:70px;bottom:20px;font-size:260px;font-weight:800;color:#e7dfd4;line-height:1}
</style></head><body>
<div class="n">%(num)s</div>
<div class="w"><div class="k">%(kick)s</div><div class="t">%(title)s</div><div class="bar"></div><div class="s">%(sub)s</div></div>
<div class="f">Дмитрий Айзенштат · ayzenshtat.ru</div>
</body></html>"""
import html as H
for k, (path, og) in pages.items():
    t, sub, kick = og["title"], og["sub"], "ИИ в работе"
    if k == "index":
        kick, t, sub = "Практическое руководство", "ИИ в работе", "22 типа задач руководителя: что поручить ИИ, что проверить и готовые промпты"
    fs = 64 if len(t) <= 52 else 50
    num = sub.split(" ")[1] if sub.startswith("Блок") else ""
    doc = TPL % dict(title=H.escape(t), sub=H.escape(sub), fs=fs, num=num, kick=kick)
    pdf = weasyprint.HTML(string=doc).write_pdf()
    pix = fitz.open(stream=pdf, filetype="pdf")[0].get_pixmap(dpi=72)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples).resize((1200, 630))
    out = os.path.join(PUB, path.strip("/"), "og.jpg")
    im.save(out, "JPEG", quality=85, optimize=True, progressive=True)
    print(out, os.path.getsize(out))
