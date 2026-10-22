import json
import sys
import time
from pathlib import Path

from photo_refresh import STAGE, download, search, tokens


TARGETS = {
    "Roasted pepper mozzarella melt": {
        "queries": [
            "roasted red pepper mozzarella panini vegetarian",
            "mozzarella roasted pepper sandwich",
            "roasted pepper vegetarian sandwich",
        ],
        "anchors": {"pepper", "mozzarella", "vegetarian", "sandwich", "panini"},
    },
    "Caramelised onion cheddar melt": {
        "queries": [
            "caramelized onion cheddar grilled cheese",
            "onion cheddar toast sandwich",
            "caramelized onion cheese sandwich vegetarian",
        ],
        "anchors": {"onion", "cheddar", "cheese", "vegetarian", "sandwich"},
    },
    "Herbed egg salad sandwich": {
        "queries": ["herbed egg salad sandwich dill", "egg salad sandwich chives", "vegetarian egg salad sandwich"],
        "anchors": {"egg", "salad", "sandwich"},
    },
    "Roasted pumpkin quinoa bowl": {
        "queries": [
            "roasted pumpkin quinoa bowl vegetarian",
            "roasted pumpkin quinoa salad",
            "quinoa pumpkin salad bowl",
            "vegan pumpkin quinoa salad",
            "quinoa roasted vegetables bowl",
        ],
        "anchors": {"pumpkin", "quinoa", "vegetarian", "vegan", "salad", "bowl"},
    },
    "Miso avocado rice bowl": {
        "queries": [
            "vegan miso avocado rice bowl",
            "vegetarian avocado rice bowl",
            "avocado brown rice bowl",
            "miso vegetable rice bowl",
            "vegetarian rice bowl avocado",
            "vegan sushi rice bowl avocado",
        ],
        "anchors": {"avocado", "rice", "miso", "vegetarian", "vegan", "bowl"},
    },
}
FORBIDDEN = {
    "meatball", "chicken", "beef", "pork", "turkey", "sausage", "bacon",
    "ham", "anchovy", "fish", "seafood", "shrimp", "prawn", "lobster",
    "salmon", "lachs", "tuna", "trout", "cod", "duck", "lamb", "venison",
    "squid", "octopus", "crab", "mussel", "oyster", "sardine",
    "museum", "artifact", "ancient", "remains", "china", "tableware",
    "grocery", "supermarket", "buffet", "sign", "menu", "logo",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    manifest_path = STAGE / "menu-images.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    by_name = {item["name"]: item for item in manifest["items"]}
    used_hashes = {item["sha256"] for item in manifest["items"]}
    for name, target in TARGETS.items():
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
        candidates = [
            candidate for candidate in candidates.values()
            if not (tokens(candidate["title"] + " " + candidate["description"]) & FORBIDDEN)
            and (tokens(candidate["title"]) & target["anchors"])
        ]
        candidates.sort(key=lambda candidate: (
            -len(tokens(candidate["title"]) & target["anchors"]),
            candidate["title"].lower(),
        ))
        selected = None
        for candidate in candidates:
            try:
                data, digest = download(candidate)
            except Exception:
                continue
            if digest in used_hashes:
                continue
            selected = candidate, data, digest
            break
        if selected is None:
            current = by_name[name]["commonsTitle"]
            print(f"Kept {name} <- {current} (no non-meat match available)", flush=True)
            continue
        candidate, data, digest = selected
        item = by_name[name]
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
    print("Finished selecting vegetarian dish photographs.", flush=True)


if __name__ == "__main__":
    main()
