import json
import sys
import time
from pathlib import Path

from photo_refresh import ROOT, STAGE, download, search


EXTRAS = [
    ("featured-scone", "Kimchi cheddar scone — featured", ["kimchi cheddar scone", "savoury cheese scone", "scone pastry"]),
    ("featured-galette", "Cardamom pear galette — featured", ["pear galette pastry", "fruit galette", "pear tart dessert"]),
    ("featured-polenta", "Parmesan polenta bites — featured", ["polenta parmesan appetizer", "polenta bites food", "polenta fritters"]),
    ("featured-chia", "Coconut lime chia cup — featured", ["mango coconut chia pudding", "chia pudding fruit", "coconut chia cup"]),
    ("cafe-story", "Café story photograph", ["cozy coffee shop interior", "cafe interior seating", "coffee shop atmosphere"]),
    ("cafe-visit", "Café visit photograph", ["coffee shop cafe exterior", "cafe seating storefront", "coffee bar interior"]),
    ("reel-cold-brew", "Orange cream cold brew — reel", ["orange cream cold brew", "cold brew orange coffee", "iced coffee drink orange"]),
    ("reel-scramble", "Miso mushroom scramble — reel", ["mushroom scrambled eggs breakfast", "mushroom egg scramble plate", "breakfast eggs mushrooms"]),
    ("reel-scone", "Kimchi cheddar scone — reel", ["kimchi cheddar scone pastry", "cheddar scone", "savoury scone bakery"]),
    ("reel-cake", "Dark chocolate olive oil cake — reel", ["chocolate olive oil cake", "dark chocolate cake slice", "chocolate cake dessert"]),
    ("reel-cafe", "Brew & Bite café moment — reel", ["barista coffee shop", "coffee barista cafe", "coffee shop counter"]),
]


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    menu_path = STAGE / "menu-images.json"
    if not menu_path.exists():
        raise RuntimeError("The menu photo manifest must be complete before fetching the additional photos.")
    menu_data = json.loads(menu_path.read_text(encoding="utf-8"))
    used_hashes = {item["sha256"] for item in menu_data["items"]}
    used_pages = {item.get("pageid") for item in menu_data["items"]}
    used_sources = {item["source"] for item in menu_data["items"]}
    results = []
    for slug, label, phrases in EXTRAS:
        candidates = {}
        for phrase in phrases:
            found = search(phrase)
            for candidate in found:
                candidates.setdefault(candidate["pageid"], candidate)
            print(f"Search [{slug}: {phrase}] -> {len(found)} licensed images", flush=True)
            time.sleep(1.5)
        selected = None
        for candidate in candidates.values():
            if candidate["pageid"] in used_pages or candidate["source"] in used_sources:
                continue
            try:
                data, digest = download(candidate)
            except Exception:
                continue
            if digest in used_hashes:
                continue
            selected = (candidate, data, digest)
            break
        if selected is None:
            raise RuntimeError(f"No distinct licensed image found for {label}")
        candidate, data, digest = selected
        filename = f"{slug}{Path(candidate['title']).suffix.lower()}"
        (STAGE / filename).write_bytes(data)
        used_hashes.add(digest)
        used_pages.add(candidate["pageid"])
        used_sources.add(candidate["source"])
        image_path = f"images/{filename}"
        if slug.startswith("featured-"):
            image_path = f"images/featured/{filename}"
        elif slug.startswith("reel-"):
            image_path = f"images/reel/{filename}"
        results.append({
            "id": slug,
            "label": label,
            "filename": filename,
            "image": image_path,
            "credit": candidate["artist"],
            "license": candidate["license"],
            "source": candidate["source"],
            "commonsTitle": candidate["title"],
            "sha256": digest,
        })
        print(f"Assigned {slug} <- {candidate['title']}", flush=True)
    (STAGE / "extra-images.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"SUCCESS: {len(results)} additional distinct photos staged", flush=True)


if __name__ == "__main__":
    main()
