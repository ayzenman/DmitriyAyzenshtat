# -*- coding: utf-8 -*-
"""Сборка раздела «ИИ в работе» для ayzenshtat.ru из единого источника.

Запуск: python gen_site.py <ИИ в работе.md> <public-папка репозитория> <дата ГГГГ-ММ-ДД> [ключи...]
Пишет public/library/ai/... ; образец оформления — library/owner/manual-control-exit/index.html.
"""
import html, json, re, sys, os
import markdown

SRC, PUB, DATE = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = set(a for a in sys.argv[4:] if a != "--preview")
PREVIEW = "--preview" in sys.argv
BASE = "https://ayzenshtat.ru"
SECTION = "/library/ai/"
TITLE = "ИИ в работе: практическое руководство"
TG = "https://t.me/+gFDF8W4bWqQ4MmYy"
MONTHS = "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split()
y, m, d = DATE.split("-")
DATE_RU = f"{int(d)} {MONTHS[int(m)-1]} {y}"

sample = open(os.path.join(PUB, "library/owner/manual-control-exit/index.html"), encoding="utf-8").read()
METRIKA = re.search(r"<!-- Yandex\.Metrika counter -->.*?<!-- /Yandex\.Metrika counter -->", sample, re.S).group(0)
COOKIE = re.search(r"<!-- cookie-banner -->.*?(?=</body>)", sample, re.S).group(0).rstrip()
BASE_CSS = re.search(r"<style>(.*?)</style>", sample, re.S).group(1)

# Внешние материалы библиотеки (вариант 1: ссылки из руководства наружу, где тема совпадает)
PROMPT_NOTE = '<p class="prompt-note">В квадратных скобках — ваши данные. Нажмите «Копировать», вставьте промпт в чат с ИИ и заполните скобки.</p>'

EXTERNAL = {
    "resheniya-i-strategiya": [("/library/solutions/okr/", "OKR: цели и ключевые результаты", "как формулировать цели и ключевые результаты"),
                               ("/library/solutions/balanced-scorecard/", "Сбалансированная система показателей", "стратегия на одной карте")],
    "soveshchaniya": [("/library/solutions/eos/", "EOS: готовая система управления компанией", "в том числе ритм еженедельных совещаний"),
                      ("/library/solutions/scaling-up/", "Scaling Up: система управления ростом", "ежедневные, недельные и квартальные встречи")],
    "planirovanie-i-kontrol": [("/library/solutions/okr/", "OKR: цели и ключевые результаты", "цели на квартал и контроль по ключевым результатам")],
}

# ---------- разбор источника ----------
text = open(SRC, encoding="utf-8").read().replace("\r\n", "\n")
lines = text.split("\n")

def split_h1(lines):
    parts, cur = [], None
    for ln in lines:
        if ln.startswith("# "):
            cur = [ln[2:].strip(), []]; parts.append(cur)
        elif cur is not None:
            cur[1].append(ln)
    return parts

h1s = split_h1(lines)
intro_part = h1s[0]          # «ИИ в работе: …»
osnovy = next(p for p in h1s if p[0] == "ОСНОВЫ")
slovar = next(p for p in h1s if p[0] == "СЛОВАРЬ")
tools = next(p for p in h1s if p[0] == "ИНСТРУМЕНТЫ АВТОРА")
sources = next(p for p in h1s if p[0] == "ИСТОЧНИКИ")
groups = [p for p in h1s if p[0].startswith("ГРУППА")]

def split_h2(body):
    pre, parts, cur = [], [], None
    for ln in body:
        if ln.startswith("## "):
            cur = [ln[3:].strip(), []]; parts.append(cur)
        elif cur is None:
            pre.append(ln)
        else:
            cur[1].append(ln)
    return pre, parts

blocks = []
for gtitle, gbody in groups:
    gm = re.match(r"ГРУППА (\d+)\. (.+)", gtitle)
    gnum, gname = int(gm.group(1)), gm.group(2).capitalize()
    _, bl = split_h2(gbody)
    for btitle, bbody in bl:
        mm = re.match(r"Блок (\d+)\. (.+)", btitle)
        body = "\n".join(bbody)
        svc = re.search(r"<!-- служебное.*?-->", body, re.S).group(0)
        meta = dict(re.findall(r"^(\w+): (.+)$", svc, re.M))
        body = body.replace(svc, "")
        brief = re.search(r"((?:^> .*\n?)+)", body, re.M).group(1)
        body = body.replace(brief, "", 1)
        blocks.append(dict(num=int(mm.group(1)), title=mm.group(2), group=gnum, gname=gname,
                           key=meta["ключ"], ishut=meta.get("ищут", ""), svyazi=[s.strip() for s in meta.get("связи", "").split(",") if s.strip()],
                           tags=meta.get("теги", ""), brief=brief, body=body.strip("\n")))
assert len(blocks) == 22, len(blocks)
BYKEY = {b["key"]: b for b in blocks}
BYTITLE = {b["title"]: b for b in blocks}
src_pre, src_blocks = split_h2(sources[1])
SRC_BY_NUM = {}
for t, body in src_blocks:
    SRC_BY_NUM[int(re.match(r"Блок (\d+)", t).group(1))] = "\n".join(body).strip()
SRC_COMMON = "\n".join(src_pre).strip()

# навигатор из «Как читать»
nav_rows = re.findall(r"^\| (.+?) \| (\d+) \|$", "\n".join(intro_part[1]), re.M)
NAV = [(t, int(n)) for t, n in nav_rows if n.isdigit()]
assert len(NAV) == 22

def brief_parts(brief):
    t = re.sub(r"^> ?", "", brief, flags=re.M).strip()
    korotko = re.search(r"\*\*Коротко\.\*\* (.+)", t).group(1).strip()
    rezhim = re.search(r"\*\*Режим:\*\* (.+?)\s*\*\*Главный риск:\*\*", t, re.S).group(1).strip().rstrip(".")
    risk = re.search(r"\*\*Главный риск:\*\* (.+)", t).group(1).strip()
    start = re.search(r"\*\*С чего начать:\*\* (.+)", t).group(1).strip()
    return korotko, rezhim, risk, start

# ---------- markdown → html ----------
MD = markdown.Markdown(extensions=["tables", "sane_lists"])

def md(s):
    MD.reset()
    return MD.convert(s)

def slug_ru(s):
    tr = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюя", ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","c","ch","sh","sch","","y","","e","yu","ya"]))
    s = "".join(tr.get(c, c) for c in s.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]

def link_blocks(h, self_key=None):
    """«Название блока» → ссылка на страницу блока (вне <pre>)."""
    out = []
    for i, chunk in enumerate(re.split(r"(<pre>.*?</pre>)", h, flags=re.S)):
        if chunk.startswith("<pre>"):
            out.append(chunk); continue
        def rep(m):
            name = m.group(1)
            b = BYTITLE.get(name)
            if not b:   # короткие упоминания: «Отчёты и дашборды» и т.п.
                cand = [x for x in blocks if x["title"].startswith(name)]
                b = cand[0] if len(cand) == 1 else None
            if name == "Основы":
                return f'«<a href="{SECTION}osnovy/">Основы</a>»'
            if not b or b["key"] == self_key:
                return m.group(0)
            return f'«<a href="{SECTION}{b["key"]}/">{name}</a>»'
        out.append(re.sub(r"«([^«»<]{3,90})»", rep, chunk))
    return "".join(out)

def prompts(h, page):
    """Абзац-название промпта + <pre> → блок с кнопкой «Копировать», [поля] подсвечены."""
    def pre_rep(m):
        code = m.group(1)
        code = re.sub(r"\[([^\[\]\n]{1,200})\]", r'<span class="fld">[\1]</span>', code)
        return ('<div class="prompt"><button class="copy" type="button" aria-label="Скопировать промпт">Копировать</button>'
                f'<pre>{code}</pre></div>')
    h = re.sub(r"<pre><code>(.*?)</code></pre>", pre_rep, h, flags=re.S)
    def name_rep(m):
        name = m.group(1)
        return f'<p class="prompt-name" id="p-{slug_ru(name)}"><strong>{name}</strong></p>'
    h = re.sub(r"<p><strong>([^<]{2,120})\.</strong></p>(?=\s*<div class=\"prompt\">)", name_rep, h)
    return h

def linkify_urls(h):
    def rep(m):
        u = m.group(0).rstrip(".,;")
        tail = m.group(0)[len(u):]
        return f'<a href="{u}" rel="noopener" target="_blank">{u}</a>{tail}'
    return re.sub(r"(?<![\"'>=])https?://[^\s<),]+", rep, h)

def headings_ids(h):
    seen, toc = {}, []
    def rep(m):
        lvl, inner = m.group(1), m.group(2)
        plain = re.sub(r"<[^>]+>", "", inner)
        sid = slug_ru(plain) or "s"
        if sid in seen:
            seen[sid] += 1; sid = f"{sid}-{seen[sid]}"
        else:
            seen[sid] = 1
        toc.append((int(lvl), sid, plain))
        return f'<h{lvl} id="{sid}">{inner}</h{lvl}>'
    h = re.sub(r"<h([23])>(.*?)</h\1>", rep, h)
    return h, toc

def toc_html(toc, max_lvl=3):
    items, open_sub = [], False
    for lvl, sid, t in toc:
        if lvl > max_lvl: continue
        if lvl == 2:
            if open_sub: items.append("</ul></li>"); open_sub = False
            elif items: items.append("</li>")
            items.append(f'<li><a href="#{sid}">{html.escape(t)}</a>')
        else:
            if not open_sub: items.append("<ul>"); open_sub = True
            items.append(f'<li><a href="#{sid}">{html.escape(t)}</a></li>')
    if open_sub: items.append("</ul></li>")
    elif items: items.append("</li>")
    return '<nav class="toc" aria-label="Содержание"><strong>Содержание</strong><ul>' + "".join(items) + "</ul></nav>"

def shift_headings(s, by):
    return re.sub(r"^(#{2,6}) ", lambda m: "#" * (len(m.group(1)) - by) + " ", s, flags=re.M)

# ---------- шаблон ----------
EXTRA_CSS = """
.crumbs{font-size:12px;line-height:1.4;color:#888;margin:0 0 7px}.crumbs a{color:#888;text-decoration:none}.crumbs a:hover{color:#17345f;text-decoration:underline}
.brief{margin:6px 0 26px;padding:14px 18px;background:#f6f6f6;border-left:3px solid #d9773f;border-radius:2px}
.brief p{margin:0 0 7px;font-size:16px;line-height:1.5}.brief p:last-child{margin:0}
.brief .lead{font-weight:700;color:#17345f}
.brief .note{font-size:14px;color:#666}.brief a{color:#17345f}
.prompt-name{margin:22px 0 6px}
.prompt-note{font-size:15px;color:#666;margin:-2px 0 10px}
.modes{margin:22px 0 28px}.modes .axis{display:flex;justify-content:space-between;font-size:13px;color:#888;margin:0 0 8px;padding:0 2px}.modes .row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.modes .m{background:#f6f6f6;border-radius:6px;padding:12px 14px;border-top:4px solid #d9773f}.modes .m:nth-child(1){border-top-color:#f0c4a5}.modes .m:nth-child(2){border-top-color:#e39a68}.modes .m b{display:block;color:#17345f;font-size:17px;margin:0 0 4px}.modes .m span{display:block;font-size:14px;line-height:1.45;color:#444}.modes .bar{height:6px;border-radius:3px;background:linear-gradient(90deg,#f3dccb,#d9773f);margin:0 0 10px}.modes figcaption{font-size:13px;color:#888;text-align:center;margin-top:10px}
@media(max-width:620px){.modes .row{grid-template-columns:1fr}}
.prompt{position:relative;margin:0 0 20px}
.prompt pre{margin:0;padding:14px 16px 14px;padding-right:16px;background:#f7f8fa;border:1px solid #e3e6eb;border-radius:4px;white-space:pre-wrap;word-wrap:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.55;color:#222}
.prompt .fld{background:#fdecdf;color:#9a4a17;border-radius:3px;padding:0 2px}
.prompt .copy{position:absolute;top:8px;right:8px;font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;padding:7px 10px;border:1px solid #17345f;background:#fff;color:#17345f;border-radius:4px;cursor:pointer;opacity:.9}
.prompt .copy:hover{background:#f1f4f9}.prompt .copy.ok{background:#17345f;color:#fff}
.prompt:has(.copy) pre{padding-top:40px}
table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:14px}
th,td{border-bottom:1px solid #ddd;padding:8px 7px;text-align:left;vertical-align:top}th{background:#f6f6f6}
.table-wrap{overflow-x:auto}
.pager{display:flex;justify-content:space-between;gap:12px;margin:34px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;font-size:14px}
.pager a{color:#17345f;text-decoration:none;max-width:45%}.pager a:hover{text-decoration:underline}.pager .mid{text-align:center}.pager .next{text-align:right}
.sources h2{display:none}.sources ul{font-size:12px;line-height:1.5;padding-left:18px}.sources li{margin-bottom:4px}.sources a{color:#777;word-break:break-all}
.navsearch{margin:8px 0 18px}
.navsearch input{width:100%;font:inherit;font-size:16px;padding:11px 14px;border:1px solid #ccc;border-radius:4px}
.navsearch input:focus{outline:none;border-color:#17345f}
.navgrid{columns:2;column-gap:28px}
.navgroup{break-inside:avoid;margin:0 0 22px}
.navgroup h3{font-size:15px;text-transform:uppercase;letter-spacing:.04em;color:#17345f;margin:0 0 8px}
.navgroup ul{list-style:none;padding:0;margin:0}
.navgroup li{margin:0 0 9px;line-height:1.4}
.navgroup a{color:#222;text-decoration:none;font-size:16px}.navgroup a:hover{color:#17345f;text-decoration:underline}
.navgroup .bt{display:block;font-size:12px;color:#888}
.mode{display:inline-block;font-size:11px;line-height:1.3;padding:1px 6px;border-radius:9px;background:#eef1f6;color:#17345f;margin-left:4px;vertical-align:1px;white-space:nowrap}
.navempty{color:#888;font-size:15px}
.cta{display:inline-block;margin:6px 0 4px;padding:10px 18px;border-radius:4px;background:#17345f;color:#fff;text-decoration:none;font-weight:600;font-size:15px}
.cta:hover{background:#0f2748}
@media(min-width:1100px){.article.wide{max-width:1000px}.navgrid{columns:3}}
@media(max-width:620px){.navgrid{columns:1}.prompt pre{font-size:13px}.pager{flex-direction:column}.pager a{max-width:100%}.pager .next{text-align:left}}
"""

GOALS_JS = """<script>
(function(){
  var ID = 110737676, fired = {};
  function goal(name){ if(fired[name]) return; fired[name]=1; if(window.ym) ym(ID,'reachGoal',name); }
  var ticking = false;
  window.addEventListener('scroll', function(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if(h > 0 && (window.scrollY / h) >= 0.75) goal('ai_scroll_75');
    });
  }, {passive:true});
  setTimeout(function(){ goal('ai_read_90s'); }, 90000);
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if(href === 'https://ayzenshtat.ru/' || href === 'https://ayzenshtat.ru' || href === '/') { goal('ai_to_home'); return; }
    if(href === '/library/') { goal('ai_to_library'); return; }
    if(href.indexOf('t.me/') > -1) { goal('ai_to_telegram'); return; }
    if(/^https?:/.test(href) && href.indexOf('ayzenshtat.ru') < 0) goal('ai_outbound');
  }, true);
  // кнопка «Копировать»
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.prompt .copy');
    if(!b) return;
    var t = b.parentNode.querySelector('pre').innerText;
    function done(){ b.textContent = 'Скопировано'; b.classList.add('ok'); setTimeout(function(){ b.textContent = 'Копировать'; b.classList.remove('ok'); }, 1800); }
    function fallback(){ var ta = document.createElement('textarea'); ta.value = t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(err){} document.body.removeChild(ta); }
    if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(t).then(done, fallback); } else { fallback(); }
    if(window.ym) ym(ID,'reachGoal','ai_prompt_copy');
  });
})();
</script>
<script>
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('[data-ac],.meta a[href*="#about"]');
  if(!a||!window.ym)return;
  ym(110737676,'reachGoal',a.getAttribute('data-ac')||'article_meta_author');
},true);
</script>"""

AUTHOR = f"""<div class="author-card">
    <img src="/library/author.jpg" width="88" height="88" alt="Дмитрий Айзенштат" loading="lazy">
    <div>
      <p class="ac-label">Об авторе</p>
      <p class="ac-name">Дмитрий Айзенштат</p>
      <p class="ac-text">19 лет был финансовым руководителем в промышленных холдингах. Сейчас помогаю владельцам компаний с оборотом от 500 млн рублей выстроить систему управления.</p>
      <div class="ac-btns">
        <a class="ac-btn ac-main" href="https://ayzenshtat.ru/#contact" data-ac="article_author_contact">Обсудить задачу</a>
        <a class="ac-btn ac-sec" href="{TG}" rel="noopener" data-ac="article_author_channel">Ещё больше статей в Telegram-канале</a>
      </div>
    </div>
  </div>"""

def esc(s): return html.escape(s, quote=True)

ROBOTS = "noindex,follow" if PREVIEW else "index,follow,max-image-preview:large"

def page(path, title, description, section, tags, crumbs, body, keywords, wide=False, about=None):
    url = BASE + path
    og = url + "og.jpg"
    ld_article = {"@context": "https://schema.org", "@type": "Article", "headline": title, "description": description,
        "author": {"@type": "Person", "@id": "https://ayzenshtat.ru/#person", "name": "Дмитрий Айзенштат", "url": "https://ayzenshtat.ru/",
                   "jobTitle": "Консультант по системам управления бизнесом", "sameAs": ["https://t.me/AyzenshtatProBiznes", "https://t.me/DmitriyAyzenshtat"]},
        "publisher": {"@id": "https://ayzenshtat.ru/#person"}, "isPartOf": {"@id": "https://ayzenshtat.ru/#website"},
        "articleSection": section, "keywords": keywords, "datePublished": DATE, "dateModified": DATE,
        "mainEntityOfPage": {"@type": "WebPage", "@id": url}, "inLanguage": "ru-RU", "image": og}
    if about: ld_article["about"] = [{"@type": "Thing", "name": a} for a in about]
    items = [("Главная", BASE + "/"), ("Библиотека", BASE + "/library/")] + [(n, BASE + u) for n, u in crumbs]
    ld_bc = {"@context": "https://schema.org", "@type": "BreadcrumbList",
             "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}
    crumbs_html = '<div class="crumbs"><a href="/library/">Библиотека</a>' + "".join(
        f' · <a href="{u}">{esc(n)}</a>' for n, u in crumbs[:-1]) + "</div>"
    tag_meta = "\n".join(f'<meta property="article:tag" content="{esc(t)}">' for t in tags)
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="author" content="Дмитрий Айзенштат">
<meta name="robots" content="{ROBOTS}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ayzenshtat.ru">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="{esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{og}">
<meta property="og:locale" content="ru_RU">
<meta property="article:published_time" content="{DATE}">
<meta property="article:modified_time" content="{DATE}">
<meta property="article:author" content="Дмитрий Айзенштат">
<meta property="article:section" content="{esc(section)}">
{tag_meta}
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">

{METRIKA}

<script type="application/ld+json">
{json.dumps(ld_article, ensure_ascii=False, indent=1)}
</script>
<script type="application/ld+json">
{json.dumps(ld_bc, ensure_ascii=False, indent=1)}
</script>

<style>{BASE_CSS}{EXTRA_CSS}</style>
</head>
<body>
<header class="sitebar">
  <div class="sitebar-inner">
    <a class="logo" href="https://ayzenshtat.ru/">Ayzenshtat.ru</a>
    <a class="nav" href="/library/">Библиотека</a>
  </div>
</header>

<main class="article{' wide' if wide else ''}">
{crumbs_html}
<h1>{esc(title.split(' — ')[0])}</h1>
<div class="meta"><a href="https://ayzenshtat.ru/#about">Дмитрий Айзенштат</a> · {DATE_RU}</div>
{body}
</main>

<footer>
  Дмитрий Айзенштат · <a href="https://ayzenshtat.ru/">Ayzenshtat.ru</a> · <a href="/library/">Библиотека</a> · <a href="{TG}" rel="noopener">Telegram-канал</a>
</footer>

{GOALS_JS}
{COOKIE}
</body>
</html>
"""

def related_html(items):
    lis = "".join(f'<li><a href="{u}">{esc(t)}</a>{(" — " + esc(n)) if n else ""}</li>' for u, t, n in items)
    return f'<div class="related"><strong>Читайте также</strong><ul>{lis}</ul></div>'

def wrap_tables(h):
    return re.sub(r"(<table>.*?</table>)", r'<div class="table-wrap">\1</div>', h, flags=re.S)

def render_body(md_text, self_key, page_key):
    h = md(md_text)
    h = prompts(h, page_key)
    h = link_blocks(h, self_key)
    h = wrap_tables(h)
    return h

def brief_html(b, h_body):
    return ""
def _old_brief_html(b, h_body):
    korotko, rezhim, risk, start = brief_parts(b["brief"])
    # «С чего начать: промпт «X»» → якорь на промпт
    def st(m):
        name = m.group(1)
        aid = "p-" + slug_ru(name)
        if f'id="{aid}"' in h_body:
            return f'промпт «<a href="#{aid}">{name}</a>»'
        return m.group(0)
    start_h = re.sub(r"промпт «([^«»]+)»", st, esc(start).replace("&quot;", '"'))
    start_h = link_blocks(start_h, b["key"])
    return (f'<div class="brief"><p class="lead">{md(korotko)[3:-4]}</p>'
            f'<p><strong>Режим:</strong> {esc(rezhim)}. <strong>Главный риск:</strong> {md(risk)[3:-4]}</p>'
            f'<p><strong>С чего начать:</strong> {start_h}</p>'
            f'<p class="note">Режимы, общие проверки и шаблон запроса — в разделе «<a href="{SECTION}osnovy/">Основы</a>».</p></div>')

def mode_short(rezhim):
    return rezhim.split(",")[0].split(";")[0].strip()

out_pages = {}

# ---------- страницы блоков ----------
for i, b in enumerate(blocks):
    path = f"{SECTION}{b['key']}/"
    body_md = shift_headings(b["body"], 1)          # ### → h2, #### → h3
    h = render_body(body_md, b["key"], b["key"])
    h, toc = headings_ids(h)
    brief = brief_html(b, h)
    # первый абзац(ы) до первого h2 — вступление; оглавление ставим после него
    h = re.sub(r'(<h[23] id="gotovye-prompty">.*?</h[23]>)', r'\1' + PROMPT_NOTE, h, count=1)
    first_h2 = h.find("<h2")
    intro_h, rest_h = h[:first_h2], h[first_h2:]
    src_md = SRC_BY_NUM.get(b["num"], "")
    src_h = linkify_urls(md(src_md + "\n\n" + SRC_COMMON)) if src_md else ""
    sources_h = f'<div class="sources" id="istochniki"><p><strong>Источники</strong></p>{src_h}</div>' if src_h else ""
    prev_b = blocks[i - 1] if i > 0 else None
    next_b = blocks[i + 1] if i < 21 else None
    pager = ('<nav class="pager">'
             + (f'<a class="prev" href="{SECTION}{prev_b["key"]}/">← {esc(prev_b["title"])}</a>' if prev_b else f'<a class="prev" href="{SECTION}osnovy/">← Основы</a>')
             + f'<a class="mid" href="{SECTION}">Оглавление</a>'
             + (f'<a class="next" href="{SECTION}{next_b["key"]}/">{esc(next_b["title"])} →</a>' if next_b else '<span></span>')
             + "</nav>")
    rel = []
    for k in b["svyazi"]:
        if k in BYKEY:
            rb = BYKEY[k]
            rel.append((f"{SECTION}{k}/", rb["title"], brief_parts(rb["brief"])[0].split(":")[0] if False else ""))
    rel += EXTERNAL.get(b["key"], [])
    rel.append((SECTION, "ИИ в работе: все 22 типа задач", "найти свою задачу по словам"))
    korotko = brief_parts(b["brief"])[0]
    desc = re.sub(r"\*\*|\*", "", korotko)
    if len(desc) > 200: desc = desc[:197].rsplit(" ", 1)[0] + "…"
    title = f"{b['title']} — ИИ в работе"
    body = (brief + intro_h + toc_html(toc) + rest_h + AUTHOR + related_html(rel) + pager)
    tags = ["искусственный интеллект"] + [w.strip() for w in b["ishut"].split(",")[:4]]
    out_pages[b["key"]] = (path, page(path, title, desc, "ИИ в работе",
        tags, [("ИИ в работе", SECTION), (f"{b['gname']}", SECTION + f"#g{b['group']}"), (b["title"], path)],
        body, b["ishut"]), dict(title=b["title"], sub=f"Блок {b['num']} из 22 · {b['gname']}"))

# ---------- Основы ----------
os_md = "\n".join(osnovy[1]).strip()
sl_md = "## Словарь\n\n" + "\n".join(slovar[1]).strip()
tl_md = "## Инструменты автора\n\n" + "\n".join(tools[1]).strip()
h = render_body(os_md, None, "osnovy")
h, toc = headings_ids(h)
first_h2 = h.find("<h2")
intro_h, rest_h = h[:first_h2], h[first_h2:]
# в таблице инструментов — названия блоков ссылками (кратко записаны через «;»)
def tool_cell(m):
    cell = m.group(1)
    parts = [p.strip() for p in cell.split(";")]
    res = []
    for p in parts:
        cand = [x for x in blocks if x["title"].startswith(p.replace(" «как сделать»", "").split(",")[0].strip()) or x["title"] == p]
        res.append(f'<a href="{SECTION}{cand[0]["key"]}/">{p}</a>' if cand else p)
    return "<td>" + "; ".join(res) + "</td></tr>"
tl_start = rest_h.find('id="instrumenty-avtora"')
osn_src = "<p>HBR Guide to Generative AI for Managers (2025) и HBR Guide to Generative AI for Teams (2026); практика автора.</p>"
body = (intro_h + toc_html(toc, 2) + rest_h
        + f'<div class="sources"><p><strong>Источники</strong></p>{osn_src}</div>' + AUTHOR
        + related_html([(SECTION, "ИИ в работе: найти свою задачу", "22 типа задач по шести группам"),
                        (f"{SECTION}{blocks[0]['key']}/", blocks[0]["title"], "первый блок руководства"),
                        (f"{SECTION}promty/", BYKEY["promty"]["title"], "как формулировать запросы и копить удачные")])
        + f'<nav class="pager"><a class="prev" href="{SECTION}">← Оглавление</a><span></span><a class="next" href="{SECTION}{blocks[0]["key"]}/">{esc(blocks[0]["title"])} →</a></nav>')
path = SECTION + "osnovy/"
out_pages["osnovy"] = (path, page(path, "Основы работы с ИИ: режимы, установки, проверки — ИИ в работе",
    "Три режима работы с ИИ и как выбрать по цене ошибки, шаблон запроса, общие проверки, ведение длинной задачи и чек-лист перед использованием результата.",
    "ИИ в работе", ["искусственный интеллект", "промпты", "проверка результата"],
    [("ИИ в работе", SECTION), ("Основы", path)], body, "ИИ в работе, режимы работы с ИИ, промпт, проверка результата ИИ, чек-лист"),
    dict(title="Основы", sub="Режимы, установки, проверки, чек-лист"))

# ---------- Оглавление ----------
intro_text = "\n".join(intro_part[1])
lead = intro_text.split("## Как читать")[0].strip()
kak = intro_text.split("## Как читать")[1]
kak = kak.split("**Как пользоваться.**")[0].strip()
# адаптация к сайту: «в конце документа» → где это на сайте
kak = re.sub(r"\n\nПримеры задач и промпты показывают.*", "", kak.strip(), flags=re.S)
kak = re.sub(r"\n*В начале каждого блока — «Коротко».*?готовые промпты\.", "", kak, flags=re.S)
kak_h = link_blocks(md("## Как читать\n\n" + kak), None)
groups_nav = []
gnames = {}
for b in blocks: gnames.setdefault(b["group"], b["gname"])
for g in sorted(gnames):
    lis = []
    for task, n in NAV:
        b = blocks[n - 1]
        if b["group"] != g: continue
        rezhim = brief_parts(b["brief"])[1]
        words = (task + " " + b["title"] + " " + b["ishut"]).lower().replace("ё", "е")
        lis.append(f'<li data-s="{esc(words)}"><a href="{SECTION}{b["key"]}/">{esc(task)}</a></li>')
    groups_nav.append(f'<section class="navgroup" id="g{g}"><h3>{esc(gnames[g])}</h3><ul>{"".join(lis)}</ul></section>')
search_js = """<script>
(function(){
  var inp=document.getElementById('navq'); if(!inp) return;
  var items=[].slice.call(document.querySelectorAll('.navgroup li')), groups=[].slice.call(document.querySelectorAll('.navgroup')), empty=document.getElementById('navempty');
  inp.addEventListener('input',function(){
    var q=inp.value.toLowerCase().replace(/ё/g,'е').trim().split(/\\s+/).filter(Boolean), any=false;
    items.forEach(function(li){ var s=li.getAttribute('data-s'); var ok=q.every(function(w){return s.indexOf(w)>-1}); li.hidden=!ok; if(ok) any=true; });
    groups.forEach(function(g){ g.hidden=!g.querySelector('li:not([hidden])'); });
    empty.hidden=any;
  });
})();
</script>"""
body = (f'<p>{md(lead)[3:-4]}</p>'
        f'<p><a class="cta" href="{SECTION}osnovy/">Начать с «Основ»</a></p>'
        f'<h2 id="zadachi">Найдите свою задачу</h2>'
        f'<div class="navsearch"><input id="navq" type="search" placeholder="Что нужно сделать? Например: договор, отчёт, совещание" aria-label="Поиск задачи"></div>'
        f'<div class="navgrid">{"".join(groups_nav)}</div><p id="navempty" class="navempty" hidden>Ничего не нашлось. Попробуйте другое слово или откройте «<a href="{SECTION}osnovy/">Основы</a>».</p>'
        + kak_h.replace("<h2>", '<h2 id="kak-chitat">')
        + AUTHOR
        + related_html([(f"{SECTION}osnovy/", "Основы работы с ИИ", "режимы, проверки, шаблон запроса, чек-лист"),
                        ("/library/owner/manual-control-exit/", "Выход из ручного управления", "какие варианты есть у собственника")])
        + search_js)
out_pages["index"] = (SECTION, page(SECTION, TITLE,
    "22 типа рабочих задач руководителя и как решать их с ИИ: режим, главный риск, проверки и готовые промпты с кнопкой «Копировать».",
    "ИИ в работе", ["искусственный интеллект", "промпты", "руководитель"],
    [("ИИ в работе", SECTION)], body, "ИИ в работе, ИИ для руководителя, промпты для руководителя, ChatGPT, Claude", wide=True),
    dict(title="ИИ в работе", sub="Практическое руководство · 22 типа задач"))

# ---------- запись ----------
import pickle
for k, (path, h, og) in out_pages.items():
    if ONLY and k not in ONLY: continue
    d = os.path.join(PUB, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(h)
pickle.dump({k: (p, og) for k, (p, h, og) in out_pages.items()}, open("/home/claude/build/pages.pkl", "wb"))
pickle.dump(blocks, open("/home/claude/build/blocks.pkl", "wb"))
print("pages:", len(out_pages), "written:", len(ONLY) if ONLY else len(out_pages))
