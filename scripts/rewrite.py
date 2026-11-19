import sys, re
p = sys.argv[1]
s = open(p, encoding='utf-8').read()

def replace_block_body(s, num, new):
    a = s.index(f"## Блок {num}. ")
    a = s.index("### Примеры задач", a)
    b = s.index("### Готовые промпты", a)
    return s[:a] + new.strip("\n") + "\n\n" + s[b:]

def replace_section(s, start, end, new):
    a = s.index(start); b = s.index(end, a)
    return s[:a] + new.strip("\n") + "\n\n" + s[b:]

import importlib.util
spec = importlib.util.spec_from_file_location("texts", sys.argv[2]); t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
if hasattr(t, "OSNOVY"):
    s = replace_section(s, "# ОСНОВЫ\n", "# ГРУППА 1.", t.OSNOVY)
for num, body in getattr(t, "BLOCKS", {}).items():
    s = replace_block_body(s, num, body)
open(p, 'w', encoding='utf-8').write(s)
print("ok")

# FULL: заменить всё тело блока после «Коротко», промпты подставить из исходника дословно
s = open(p, encoding='utf-8').read()
for num, body in getattr(t, "FULL", {}).items():
    a = s.index(f"## Блок {num}. ")
    q = re.search(r"((?:^> .*\n)+)", s[a:], re.M)
    start = a + q.end()
    end = s.index("\n## Блок", start) + 1
    seg = s[start:end]
    def P(m):
        name = m.group(1)
        mm = re.search(r"^\*\*" + re.escape(name) + r"\.\*\*\n\n((?:    .*\n|\n(?=    ))+)", seg, re.M)
        assert mm, name
        return f"**{name}.**\n\n" + mm.group(1).rstrip("\n")
    new = re.sub(r"\{\{P:(.+?)\}\}", P, body)
    s = s[:start] + "\n" + new.strip("\n") + "\n\n" + s[end:]
open(p, 'w', encoding='utf-8').write(s)
print("full ok")
