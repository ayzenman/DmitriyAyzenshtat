"""Проверка сайта «ИИ в работе» по критериям TZ.md (1–6)."""
import sys, os, re, json, pickle, html as H
from html.parser import HTMLParser
SRC, PUB = sys.argv[1], sys.argv[2]
blocks = pickle.load(open("/home/claude/build/blocks.pkl", "rb"))
pages = pickle.load(open("/home/claude/build/pages.pkl", "rb"))
src = open(SRC, encoding="utf-8").read()
errs, info = [], []

def norm(s):
    s = H.unescape(re.sub(r"<[^>]+>", " ", s))
    s = re.sub(r"[*_`>#|\-–—«»\"“”.,:;!?()\[\]]", " ", s)
    s = re.sub(r"[/+=\\]", " ", s)
    s = re.sub(r"\s+", " ", s).strip().lower().replace("ё", "е")
    return " ".join(w for w in s.split() if not w.isdigit() and w not in ("коротко", "n"))

files = {k: os.path.join(PUB, p.strip("/"), "index.html") for k, (p, og) in pages.items()}
# 1. все страницы на месте
if len(files) != 24: errs.append(f"страниц {len(files)}, ожидалось 24")
for k, f in files.items():
    if not os.path.exists(f): errs.append(f"нет файла {f}")
    if not os.path.exists(os.path.join(os.path.dirname(f), "og.jpg")): errs.append(f"нет og.jpg у {k}")

html_by = {k: open(f, encoding="utf-8").read() for k, f in files.items()}
# 2. полнота текста: каждое слово источника блока есть на странице, число промптов совпадает
for b in blocks:
    h = html_by[b["key"]]
    main = h[h.find("<main"):h.find("</main>")]
    page_text = " " + norm(main) + " "
    units = [norm(u) for u in b["body"].split("\n") if norm(u)]
    miss_list = [u for u in units if " " + u + " " not in page_text]
    miss = len(miss_list); words_src = units
    for u in miss_list[:3]: info.append("   нет: " + u[:90])
    n_prompts_src = len(re.findall(r"^\*\*[^*\n]+\.\*\*\s*\n\s*\n    ", b["body"], re.M))
    n_pre_src = len(re.findall(r"(?:^|\n)\n    \S", re.sub(r"\n    [^\n]*\n\n(?=    )", "\n    x\n", b["body"])))
    n_pre = main.count('<div class="prompt">')
    n_btn = main.count('class="copy"')
    h2_src = len(re.findall(r"^### ", b["body"], re.M)); h2 = main.count("<h2 ")
    if miss: errs.append(f"{b['key']}: не найдено {miss} фрагментов текста")
    if n_pre != n_pre_src or n_btn != n_pre: errs.append(f"{b['key']}: промптов {n_pre}/{n_pre_src}, кнопок {n_btn}")
    if h2 != h2_src: errs.append(f"{b['key']}: разделов {h2}/{h2_src}")
    info.append(f"{b['num']:>2} {b['key']}: разделов {h2}, промптов {n_pre}, строк текста сверено {len(units)}")
# Основы, словарь, инструменты
osn = norm(html_by["osnovy"])
for part in ["ОСНОВЫ"]:
    body = (src + "\n# КОНЕЦ").split("\n# " + part + "\n")[1].split("\n# ")[0]
    if part == "ИСТОЧНИКИ": body = re.sub(r"^## Блок \d+\. ", "", body, flags=re.M)
    us = [norm(u) for u in body.split("\n") if norm(u)]; miss = sum(1 for u in us if u not in osn)
    if miss: errs.append(f"osnovy/{part}: не найдено {miss} фрагментов")
# 3. запрещённое
for k, h in html_by.items():
    for bad in ["служебное", "ищут:", "mcp-1c", "mcp 1c"]:
        if bad.lower() in h.lower(): errs.append(f"{k}: найдено «{bad}»")
    if re.search(r"[Бб]лок \d+\b", re.sub(r"Блок \d+ из 22", "", h[h.find("<main"):])): errs.append(f"{k}: ссылка вида «блок N»")
# 4. внутренние ссылки и якоря
for k, h in html_by.items():
    ids = set(re.findall(r'id="([^"]+)"', h))
    for href in re.findall(r'href="([^"]+)"', h):
        if href.startswith("#"):
            if href[1:] not in ids: errs.append(f"{k}: битый якорь {href}")
        elif href.startswith("/") and not href.startswith("//"):
            path = href.split("#")[0]
            target = os.path.join(PUB, path.strip("/"))
            if not (os.path.exists(os.path.join(target, "index.html")) or os.path.isfile(target)):
                errs.append(f"{k}: битая ссылка {href}")
            if "#" in href and path.startswith("/library/ai/"):
                t = open(os.path.join(target, "index.html"), encoding="utf-8").read()
                if f'id="{href.split("#")[1]}"' not in t: errs.append(f"{k}: битый якорь {href}")
# 5. метаданные и JSON-LD
need = ['rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:image"', 'property="og:url"',
        'property="article:published_time"', 'property="article:section"', 'name="description"', 'rel="manifest"',
        'name="theme-color"', 'href="/favicon.svg"', "ym(110737676, 'init', {ssr:true, webvisor:true, clickmap:true",
        "accurateTrackBounce:true, trackLinks:true", "ai_scroll_75", "ai_read_90s", "ai_prompt_copy", "cookie-banner"]
for k, h in html_by.items():
    for n in need:
        if n not in h: errs.append(f"{k}: нет {n}")
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
    types = []
    for l in lds:
        try: types.append(json.loads(l)["@type"])
        except Exception as e: errs.append(f"{k}: JSON-LD не парсится: {e}")
    if sorted(types) != ["Article", "BreadcrumbList"]: errs.append(f"{k}: JSON-LD {types}")
    can = re.search(r'rel="canonical" href="([^"]+)"', h).group(1)
    if can != "https://ayzenshtat.ru" + pages[k][0]: errs.append(f"{k}: canonical {can}")
    t = re.search(r"<title>(.*?)</title>", h).group(1)
    d = re.search(r'name="description" content="([^"]+)"', h).group(1)
    if len(t) > 90: info.append(f"{k}: title {len(t)} знаков")
    if not (50 <= len(d) <= 220): errs.append(f"{k}: description {len(d)} знаков")
    # HTML парсится
    class P(HTMLParser): pass
    P().feed(h)
# 6. поиск: каждое слово «ищут» находит свой блок
idx = html_by["index"]
items = re.findall(r'<li data-s="([^"]+)"><a href="/library/ai/([^/]+)/"', idx)
if len(items) != 22: errs.append(f"навигатор: {len(items)} пунктов")
for b in blocks:
    for w in [x.strip().lower().replace("ё", "е") for x in b["ishut"].split(",") if x.strip()]:
        if not any(H.unescape(s).find(w) > -1 and key == b["key"] for s, key in items):
            errs.append(f"поиск: «{w}» не находит {b['key']}")
print("\n".join(info))
print("\nОШИБОК:", len(errs)); print("\n".join(errs[:60]))
