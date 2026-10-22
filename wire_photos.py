import hashlib
import html
import json
import re
import shutil
from pathlib import Path

from photo_refresh import ROOT, STAGE


def license_url(license_name):
    if re.search(r"\bCC BY-SA\b", license_name, re.I):
        version = re.search(r"(\d(?:\.\d+)?)", license_name)
        return f"https://creativecommons.org/licenses/by-sa/{version.group(1) if version else '4.0'}/"
    if re.search(r"\bCC BY\b", license_name, re.I):
        version = re.search(r"(\d(?:\.\d+)?)", license_name)
        return f"https://creativecommons.org/licenses/by/{version.group(1) if version else '4.0'}/"
    if re.search(r"\bCC0\b", license_name, re.I):
        return "https://creativecommons.org/publicdomain/zero/1.0/"
    return "https://commons.wikimedia.org/wiki/Commons:Licensing"


def escape(value):
    return html.escape(str(value), quote=True)


def copy_image(record):
    source_path = STAGE / Path(record["filename"] if "filename" in record else record["image"]).name
    target_path = ROOT / Path(record["image"])
    target_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source_path, target_path)
    return target_path


def main():
    menu_manifest = json.loads((STAGE / "menu-images.json").read_text(encoding="utf-8"))
    extra_manifest = json.loads((STAGE / "extra-images.json").read_text(encoding="utf-8"))
    menu_items = menu_manifest["items"]
    for item in menu_items:
        copy_image(item)
    for extra in extra_manifest:
        copy_image(extra)

    image_data = {
        item["name"]: {
            "image": item["image"],
            "photoCredit": item["credit"],
            "photoLicense": item["license"],
            "photoSource": item["source"],
            "photoTitle": item["commonsTitle"],
        }
        for item in menu_items
    }
    data_json = json.dumps(image_data, ensure_ascii=False, indent=2).replace("</", "<\\/")
    menu_path = ROOT / "menu-data.js"
    current = menu_path.read_text(encoding="utf-8")
    marker = "const menuImageUrls = {"
    if marker not in current:
        raise RuntimeError("The menu image map changed; refusing to rewrite menu-data.js.")
    prefix = current.split(marker, 1)[0]
    menu_data = f'''const menuImageData = {data_json};

window.BREW_MENU_ITEMS = menuGroups.flatMap(({{ category, items }}) => items.map(
  ([name, price, description, tag], index) => ({{
    id: `${{category}}-${{index + 1}}`,
    name,
    price,
    description,
    tag,
    category,
    ...menuImageData[name],
  }}),
));
'''
    menu_path.write_text(prefix + menu_data, encoding="utf-8")

    extras_by_id = {extra["id"]: extra for extra in extra_manifest}
    stylesheet = ROOT / "style.css"
    css = stylesheet.read_text(encoding="utf-8")
    feature_map = {
        "image-scone": "featured-scone",
        "image-galette": "featured-galette",
        "image-polenta": "featured-polenta",
        "image-chia": "featured-chia",
    }
    for css_class, extra_id in feature_map.items():
        selector = f".featured-photo.{css_class}::before"
        image = extras_by_id[extra_id]["image"]
        css, count = re.subn(
            rf'({re.escape(selector)} \{{ background-image: url\(")[^"]+("\); \}})',
            lambda match: match.group(1) + image + match.group(2),
            css,
            count=1,
        )
        if count != 1:
            raise RuntimeError(f"Could not update featured image rule for {extra_id}.")
    story_image = extras_by_id["cafe-story"]["image"]
    visit_image = extras_by_id["cafe-visit"]["image"]
    css, story_count = re.subn(
        r'(\.story-photo \{ position: relative; min-height: 535px; background: url\(")[^"]+("\) center / cover; \})',
        lambda match: match.group(1) + story_image + match.group(2),
        css,
        count=1,
    )
    css, visit_count = re.subn(
        r'(\.visit-card-photo \{ height: 330px; position: relative; background: url\(")[^"]+("\) center 55% / cover; \})',
        lambda match: match.group(1) + visit_image + match.group(2),
        css,
        count=1,
    )
    if story_count != 1 or visit_count != 1:
        raise RuntimeError("Could not update the café story and visit photos.")
    stylesheet.write_text(css, encoding="utf-8")

    credits = []
    for item in menu_items:
        credits.append((item["name"], item["commonsTitle"], item["credit"], item["license"], item["source"]))
    for extra in extra_manifest:
        credits.append((extra["label"], extra["commonsTitle"], extra["credit"], extra["license"], extra["source"]))
    rows = []
    for name, photo_title, artist, license_name, source in credits:
        rows.append(
            '<li class="photo-credit-row">'
            f"<strong>{escape(name)}</strong>"
            '<span><a href="'
            f'{escape(source)}" target="_blank" rel="noreferrer">{escape(photo_title)}</a>'
            f" by {escape(artist)} · <a href=\""
            f'{escape(license_url(license_name))}" target="_blank" rel="noreferrer">'
            f"{escape(license_name)}</a>"
            "</span>"
            "</li>"
        )
    credits_page = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Creators and open licenses for Brew &amp; Bite's café, food, and drink photographs." />
    <title>Brew &amp; Bite — Photo credits</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body class="photo-credits-page">
    <main class="photo-credits-main">
      <a class="text-link" href="index.html">← Back to Brew &amp; Bite</a>
      <p class="eyebrow"><span class="eyebrow-line"></span> With thanks to the photographers</p>
      <h1>Photo credits</h1>
      <p class="photo-credits-intro">The menu, featured specials, café scenes, and original promotional reel use individually selected photographs. Photos may be cropped, resized, or set in motion; each creator, license, and original file is credited below.</p>
      <ul class="photo-credits-list">
        {"".join(rows)}
      </ul>
    </main>
  </body>
</html>
'''
    (ROOT / "photo-credits.html").write_text(credits_page, encoding="utf-8")

    hashes = set()
    paths = [ROOT / Path(record["image"]) for record in menu_items + extra_manifest]
    for path in paths:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in hashes:
            raise RuntimeError(f"Repeated image content detected: {path}")
        hashes.add(digest)
    print(f"Wired {len(paths)} unique images and {len(credits)} attribution records.")


if __name__ == "__main__":
    main()
