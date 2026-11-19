import sys, pickle, re
PUB, DATE = sys.argv[1], sys.argv[2]
pages = pickle.load(open("/home/claude/build/pages.pkl", "rb"))
# 1) карточка в библиотеке — новый раздел в конце
p = f"{PUB}/library/index.html"
s = open(p, encoding="utf-8").read()
if "/library/ai/" not in s:
    card = """<div class="section">
<div class="max-w section-padding">
<div class="section-head"><h2>ИИ в работе</h2><span class="count">1 материал</span></div>
<div class="grid">
<a class="card" href="/library/ai/">
<span class="tag">Руководство · 22 типа задач</span>
<h3>ИИ в работе: практическое руководство</h3>
<p>Письма, договоры, отчёты, совещания, стратегия, 1С: как решать задачи руководителя с ИИ — режим, главный риск, проверки и готовые промпты.</p>
<span class="go">Открыть руководство →</span>
</a>
</div>
</div>
</div>

"""
    s = s.replace("<footer>", card + "<footer>", 1)
    s = s.replace("        '/library/crisis/turnaround/': 'library_to_turnaround'\n",
                  "        '/library/crisis/turnaround/': 'library_to_turnaround',\n        '/library/ai/': 'library_to_ai'\n", 1)
    assert "library_to_ai" in s
    open(p, "w", encoding="utf-8").write(s)
# 2) sitemap
p = f"{PUB}/sitemap.xml"
s = open(p, encoding="utf-8").read()
if "/library/ai/" not in s:
    order = ["index", "osnovy"] + [k for k in pages if k not in ("index", "osnovy")]
    urls = "".join(f"""  <url>

    <loc>https://ayzenshtat.ru{pages[k][0]}</loc>

    <lastmod>{DATE}</lastmod>

    <changefreq>monthly</changefreq>

    <priority>{'0.8' if k == 'index' else '0.7'}</priority>

  </url>

""" for k in order)
    s = s.replace("</urlset>", urls + "</urlset>")
    open(p, "w", encoding="utf-8").write(s)
print("ok")
