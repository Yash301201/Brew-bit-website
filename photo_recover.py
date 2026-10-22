import json
import sys
import time
from pathlib import Path

from photo_refresh import STAGE, download, search, tokens


TARGETS = {
    "Classic cold brew": {
        "queries": ["cold brew coffee glass", "cold brew coffee cup", "iced coffee cold brew drink"],
        "anchors": {"cold", "brew", "coffee"},
    },
    "Coconut cream iced coffee": {
        "queries": ["coconut iced coffee", "coconut milk coffee ice", "iced coffee coconut"],
        "anchors": {"coconut", "coffee", "latte"},
    },
    "Iced vanilla bean latte": {
        "queries": ["iced vanilla latte coffee", "iced latte vanilla", "vanilla iced coffee"],
        "anchors": {"vanilla", "latte", "coffee"},
    },
    "Mocha oat frappé": {
        "queries": ["oat mocha iced coffee", "iced mocha coffee", "oat milk mocha latte"],
        "anchors": {"oat", "mocha", "coffee"},
    },
    "Turmeric ginger milk": {
        "queries": ["turmeric ginger milk drink", "golden milk turmeric ginger", "turmeric latte drink"],
        "anchors": {"turmeric", "ginger", "milk", "latte"},
    },
    "Cardamom pear tea cake": {
        "queries": ["pear cardamom cake", "pear tea cake slice", "pear cake dessert"],
        "anchors": {"pear", "cake", "cardamom"},
    },
    "Cumin sweet potato wedges": {
        "queries": ["roasted sweet potato wedges", "sweet potato wedges dish", "sweet potato appetizer"],
        "anchors": {"sweet", "potato"},
    },
    "Chilli garlic edamame": {
        "queries": ["garlic chili edamame", "edamame appetizer bowl", "edamame pods snack"],
        "anchors": {"edamame"},
    },
    "Corn ribs with lime crema": {
        "queries": ["corn ribs grilled", "corn ribs appetizer", "grilled corn snack"],
        "anchors": {"corn"},
    },
    "Herb butter mushrooms": {
        "queries": ["herb butter mushrooms plate", "garlic butter mushrooms dish", "sauteed mushrooms toast"],
        "anchors": {"mushroom", "mushrooms"},
    },
    "Citrus beet & labneh bowl": {
        "queries": ["beetroot labneh salad", "beetroot salad bowl", "beet labneh bowl"],
        "anchors": {"beet", "beetroot", "labneh"},
    },
    "Sesame soba noodle bowl": {
        "queries": ["soba noodle bowl", "sesame soba noodles", "cold soba noodle salad"],
        "anchors": {"soba", "noodle", "noodles"},
    },
    "Miso avocado rice bowl": {
        "queries": ["miso avocado rice bowl", "avocado rice bowl", "miso rice avocado food"],
        "anchors": {"avocado", "rice", "miso"},
    },
}
FORBIDDEN = {
    "museum", "artifact", "ancient", "remains", "archeological", "archaeological",
    "china", "tableware", "grocery", "supermarket", "buffet", "sign", "menu",
    "logo", "display-case", "cbd", "martini", "starbucks", "chameleon",
    "tillamook", "stumptown", "rodd", "bottle", "aperitivo", "alcohol",
    "wine", "beer", "cocktail", "meatball", "chicken", "beef", "pork",
    "turkey", "sausage", "bacon", "ham", "anchovy", "nara", "relief",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    manifest_path = STAGE / "menu-images.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    by_name = {item["name"]: item for item in manifest["items"]}
    used_hashes = {item["sha256"] for item in manifest["items"]}
    for name, target in TARGETS.items():
        item = by_name[name]
        candidates = {}
        for query in target["queries"]:
            try:
                found = search(query)
            except Exception as exc:
                print(f"Search failed for {name} [{query}]: {exc}", flush=True)
                time.sleep(1.5)
                continue
            for candidate in found:
                candidates.setdefault(candidate["pageid"], candidate)
            print(f"Search [{name}: {query}] -> {len(found)} licensed images", flush=True)
            time.sleep(1.5)
        relevant = []
        for candidate in candidates.values():
            words = tokens(candidate["title"])
            if words & FORBIDDEN:
                continue
            if not words & target["anchors"]:
                continue
            relevant.append(candidate)
        relevant.sort(key=lambda candidate: (
            -len(tokens(candidate["title"]) & target["anchors"]),
            candidate["title"].lower(),
        ))
        selected = None
        for candidate in relevant:
            try:
                data, digest = download(candidate)
            except Exception:
                continue
            if digest in used_hashes:
                continue
            selected = candidate, data, digest
            break
        if selected is None:
            print(f"Kept {name} <- {item['commonsTitle']} (no distinct matching replacement found)", flush=True)
            continue
        candidate, data, digest = selected
        filename = Path(item["image"]).stem + Path(candidate["title"]).suffix.lower()
        (STAGE / filename).write_bytes(data)
        used_hashes.discard(item["sha256"])
        used_hashes.add(digest)
        item.update({
            "image": f"images/menu/{filename}",
            "pageid": candidate["pageid"],
            "credit": candidate["artist"],
            "license": candidate["license"],
            "source": candidate["source"],
            "commonsTitle": candidate["title"],
            "sha256": digest,
        })
        print(f"Replaced {name} <- {candidate['title']}", flush=True)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Finished replacing unsuitable menu photos.", flush=True)


if __name__ == "__main__":
    main()
