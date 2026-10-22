import html
import json
from collections import defaultdict

from photo_refresh import STAGE


manifest = json.loads((STAGE / "menu-images.json").read_text(encoding="utf-8"))
groups = defaultdict(list)
for item in manifest["items"]:
    groups[item["category"]].append(item)
sections = []
for category, items in groups.items():
    cards = []
    for item in items:
        filename = html.escape(item["image"].rsplit("/", 1)[-1], quote=True)
        name = html.escape(item["name"])
        title = html.escape(item["commonsTitle"])
        cards.append(
            f'<figure><img src="{filename}" alt="{name}" loading="lazy">'
            f"<figcaption><strong>{name}</strong><small>{title}</small></figcaption></figure>"
        )
    sections.append(
        f'<section class="category" id="{category}"><h2>{category}</h2>'
        f'<div class="grid">{"".join(cards)}</div></section>'
    )
extra_manifest_path = STAGE / "extra-images.json"
if extra_manifest_path.exists():
    extras = json.loads(extra_manifest_path.read_text(encoding="utf-8"))
    cards = []
    for item in extras:
        filename = html.escape(item["filename"], quote=True)
        name = html.escape(item["label"])
        title = html.escape(item["commonsTitle"])
        cards.append(
            f'<figure><img src="{filename}" alt="{name}">'
            f"<figcaption><strong>{name}</strong><small>{title}</small></figcaption></figure>"
        )
    sections.append(
        f'<section class="category"><h2>Featured, café, and reel extras</h2>'
        f'<div class="grid">{"".join(cards)}</div></section>'
    )
page = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Brew &amp; Bite photo contact sheet</title>
<style>
body{{margin:0;padding:24px;font:14px Arial,sans-serif;background:#f7f4ec;color:#252d24}}
h1{{margin:0 0 22px}}h2{{margin:0 0 12px;text-transform:capitalize}}
.category{{margin:0 0 28px;padding:16px;background:#fffefa}}
.grid{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}}
figure{{margin:0;min-width:0}}img{{display:block;width:100%;height:145px;object-fit:cover;background:#ddd}}
figcaption{{padding-top:5px;line-height:1.3;overflow-wrap:anywhere}}
small{{display:block;margin-top:4px;color:#686a61;font-size:10px}}
</style><h1>100 menu photos — review for topic and variety</h1>{"".join(sections)}</html>'''
(STAGE / "contact-sheet.html").write_text(page, encoding="utf-8")
print(STAGE / "contact-sheet.html")
