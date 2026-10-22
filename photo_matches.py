import json
import re
import sys
import time
from pathlib import Path

from photo_refresh import STAGE, download, search, tokens


TARGETS = [
    ("menu", "Warm cinnamon oats", ["cinnamon oatmeal breakfast", "porridge bowl oats"], {"cinnamon", "oatmeal", "oats", "porridge"}),
    ("menu", "Roasted pumpkin quinoa bowl", ["vegetarian quinoa pumpkin bowl", "quinoa salad vegetarian bowl"], {"pumpkin", "quinoa", "vegetarian", "salad", "bowl"}),
    ("menu", "Miso avocado rice bowl", ["vegetarian avocado rice bowl", "vegan rice bowl avocado"], {"avocado", "rice", "vegetarian", "vegan", "bowl"}),
    ("menu", "Green goddess grain bowl", ["vegetarian grain bowl salad", "green goddess grain salad"], {"grain", "salad", "bowl", "vegetarian"}),
    ("menu", "Berry almond yoghurt bowl", ["berry yoghurt bowl", "berries yogurt bowl"], {"berry", "berries", "yogurt", "yoghurt", "bowl"}),
    ("menu", "Peanut butter banana oats", ["banana oatmeal bowl", "banana porridge oats"], {"banana", "oatmeal", "oats", "porridge"}),
    ("menu", "Classic cold brew", ["cold brew coffee glass", "black cold brew coffee"], {"cold", "brew", "coffee"}),
    ("menu", "Cascara lemon cold brew", ["cold brew lemon coffee", "cascara coffee drink"], {"cold", "brew", "coffee", "lemon", "cascara"}),
    ("menu", "Turmeric ginger milk", ["turmeric golden milk drink", "turmeric latte"], {"turmeric", "milk", "latte", "drink"}),
    ("menu", "Parmesan polenta bites", ["polenta fritters vegetarian", "fried polenta bites"], {"polenta", "fritter", "bites"}),
    ("menu", "Crispy chickpea chaat", ["chickpea chaat snack", "crispy chickpeas snack"], {"chickpea", "chickpeas", "chaat"}),
    ("menu", "Herb butter mushrooms", ["sauteed mushrooms butter", "garlic butter mushrooms"], {"mushroom", "mushrooms"}),
    ("menu", "Crispy cauliflower bites", ["roasted cauliflower bites", "crispy cauliflower appetizer"], {"cauliflower"}),
    ("menu", "Smashed pea & halloumi plate", ["peas halloumi toast", "smashed peas halloumi"], {"pea", "peas", "halloumi"}),
    ("menu", "Herbed egg salad sandwich", ["egg salad sandwich", "egg salad toast herbs"], {"egg", "salad", "sandwich"}),
    ("menu", "Cucumber cream cheese rye", ["cucumber cream cheese rye sandwich", "cucumber cream cheese sandwich"], {"cucumber", "cream", "cheese", "sandwich", "rye"}),
    ("menu", "Kimchi cheddar scone", ["cheddar scone savory", "cheese scone bakery"], {"scone", "cheddar", "cheese"}),
    ("menu", "Olive & rosemary focaccia", ["olive rosemary focaccia bread", "focaccia bread olives"], {"focaccia", "bread", "olive", "olives"}),
    ("menu", "Cardamom pear tea cake", ["pear tea cake cardamom", "pear cake dessert"], {"pear", "cake"}),
    ("menu", "Spinach feta hand pie", ["spinach feta hand pie pastry", "spinach feta pastry"], {"spinach", "feta", "pie", "pastry"}),
    ("menu", "Lemon poppy loaf", ["lemon poppy seed loaf cake", "lemon poppy loaf"], {"lemon", "poppy", "loaf", "cake"}),
    ("menu", "Tomato ricotta hand pie", ["tomato ricotta hand pie", "tomato ricotta pastry"], {"tomato", "ricotta", "pie", "pastry"}),
    ("menu", "Cardamom pear galette", ["pear galette pastry", "pear tart galette"], {"pear", "galette", "tart"}),
    ("menu", "Coconut lime chia cup", ["chia pudding coconut lime", "chia pudding fruit cup"], {"chia", "pudding"}),
    ("extra", "featured-scone", ["cheddar scone pastry", "savory scone bakery"], {"scone", "cheddar", "cheese"}),
    ("extra", "featured-polenta", ["vegetarian polenta fritter", "fried polenta cake"], {"polenta", "fritter", "cake"}),
    ("extra", "reel-cold-brew", ["iced coffee cold brew glass", "cold brew coffee ice"], {"coffee", "brew", "iced", "ice"}),
]

FORBIDDEN = {
    "chicken", "beef", "pork", "turkey", "sausage", "bacon", "ham", "quail",
    "anchovy", "fish", "seafood", "shrimp", "prawn", "lobster", "salmon",
    "lachs", "tuna", "trout", "cod", "duck", "lamb", "venison", "squid",
    "octopus", "crab", "mussel", "oyster", "sardine", "meatball", "human",
    "statue", "portrait", "logo", "menu", "hotel", "grocery", "supermarket",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    menu_path = STAGE / "menu-images.json"
    extra_path = STAGE / "extra-images.json"
    menu = json.loads(menu_path.read_text(encoding="utf-8"))
    extras = json.loads(extra_path.read_text(encoding="utf-8"))
    by_name = {item["name"]: item for item in menu["items"]}
    by_id = {item["id"]: item for item in extras}
    used_hashes = {item["sha256"] for item in menu["items"] + extras}
    used_pages = {item.get("pageid") for item in menu["items"] + extras}

    for kind, key, queries, anchors in TARGETS:
        record = by_name[key] if kind == "menu" else by_id[key]
        candidates = {}
        for query in queries:
            try:
                found = search(query)
            except Exception as exc:
                print(f"Search failed [{key}: {query}]: {exc}", flush=True)
                time.sleep(1.5)
                continue
            for candidate in found:
                candidates.setdefault(candidate["pageid"], candidate)
            print(f"Search [{key}: {query}] -> {len(found)} licensed images", flush=True)
            time.sleep(1.5)

        current_page = record.get("pageid")
        current_hash = record["sha256"]
        current_title = record["commonsTitle"]
        current_tokens = tokens(current_title)
        choices = []
        for candidate in candidates.values():
            title_tokens = tokens(candidate["title"])
            if candidate["pageid"] != current_page and candidate["pageid"] in used_pages:
                continue
            if title_tokens & FORBIDDEN:
                continue
            hits = title_tokens & anchors
            if len(hits) < 2:
                continue
            choices.append((candidate, len(hits)))
        choices.sort(key=lambda pair: (-pair[1], pair[0]["title"].lower()))
        selected = None
        for candidate, _ in choices:
            try:
                data, digest = download(candidate)
            except Exception:
                continue
            if digest != current_hash and digest in used_hashes:
                continue
            selected = candidate, data, digest
            break
        if selected is None:
            print(f"Kept {key} <- {current_title} (no distinct close match found)", flush=True)
            continue

        candidate, data, digest = selected
        filename = re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-") + Path(candidate["title"]).suffix.lower()
        if kind == "extra":
            filename = key + Path(candidate["title"]).suffix.lower()
            folder = "images/featured" if key.startswith("featured-") else "images/reel"
            record["image"] = f"{folder}/{filename}"
            record["filename"] = filename
        else:
            record["image"] = f"images/menu/{filename}"
        record.update({
            "pageid": candidate["pageid"],
            "credit": candidate["artist"],
            "license": candidate["license"],
            "source": candidate["source"],
            "commonsTitle": candidate["title"],
            "sha256": digest,
        })
        used_hashes.discard(current_hash)
        used_hashes.add(digest)
        used_pages.discard(current_page)
        used_pages.add(candidate["pageid"])
        (STAGE / filename).write_bytes(data)
        print(f"Replaced {key} <- {candidate['title']}", flush=True)
        menu_path.write_text(json.dumps(menu, ensure_ascii=False, indent=2), encoding="utf-8")
        extra_path.write_text(json.dumps(extras, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Finished replacing selected photo mismatches.", flush=True)


if __name__ == "__main__":
    main()
