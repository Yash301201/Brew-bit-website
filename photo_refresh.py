import hashlib
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path.cwd()
STAGE = Path.home() / ".copilot" / "session-state" / "2b9eede8-12e1-47cf-b1d5-2cd82138e306" / "files" / "photo-refresh-v2"
STAGE.mkdir(parents=True, exist_ok=True)
AGENT = "BrewBiteWebsite/1.0 (open-license image attribution)"
GROUPS = {
    "signature-coffee": ["coffee latte art", "coffee cup latte", "specialty coffee drink"],
    "espresso": ["espresso cappuccino cup", "espresso coffee drink", "flat white coffee"],
    "cold-coffee": ["iced coffee glass", "cold brew coffee", "iced latte drink"],
    "tea": ["tea cup drink", "matcha latte tea", "iced tea glass"],
    "brunch": ["breakfast eggs plate", "pancakes brunch", "shakshuka eggs"],
    "sandwiches": ["sandwich toast bread", "panini sandwich", "focaccia sandwich"],
    "bakery": ["bakery pastry", "croissant pastry", "scone bun bread"],
    "desserts": ["cake dessert slice", "tart cheesecake dessert", "pastry dessert"],
    "small-plates": ["appetizer snack plate", "hummus appetizer", "small plates food"],
    "bowls": ["granola yoghurt bowl", "smoothie bowl fruit", "grain salad bowl"],
}
ALLOWED_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_LICENSES = ("cc by", "cc0", "public domain")


def read_menu():
    text = (ROOT / "menu-data.js").read_text(encoding="utf-8")
    groups = re.findall(
        r'category:\s*"([^"]+)",\s*items:\s*\[(.*?)\n\s{4}\],\s*\n\s{2}\},',
        text,
        re.S,
    )
    records = []
    item_pattern = re.compile(r'\["([^"]+)",\s*(\d+),\s*"([^"]*)",\s*"([^"]*)"\]')
    for category, body in groups:
        for name, price, description, tag in item_pattern.findall(body):
            records.append({
                "category": category,
                "name": name,
                "description": description,
                "tag": tag,
                "price": int(price),
            })
    if len(records) != 100:
        raise RuntimeError(f"Expected 100 menu records; parsed {len(records)}")
    return records


def clean(value):
    return re.sub(r"<[^>]*>", " ", html.unescape(value or "")).strip()


def search(query):
    params = urllib.parse.urlencode({
        "action": "query",
        "generator": "search",
        "gsrsearch": "filetype:bitmap " + query,
        "gsrnamespace": "6",
        "gsrlimit": "50",
        "prop": "info|imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": "640",
        "format": "json",
    })
    request = urllib.request.Request(
        "https://commons.wikimedia.org/w/api.php?" + params,
        headers={"User-Agent": AGENT},
    )
    result = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                result = json.load(response)
            break
        except Exception as exc:
            if "429" not in str(exc) or attempt == 4:
                raise
            time.sleep((attempt + 1) * 8)
    if result is None:
        return []
    pages = sorted(
        (result.get("query") or {}).get("pages", {}).values(),
        key=lambda page: page.get("index", 9999),
    )
    candidates = []
    for page in pages:
        info = (page.get("imageinfo") or [{}])[0]
        metadata = info.get("extmetadata") or {}
        license_name = clean((metadata.get("LicenseShortName") or {}).get("value"))
        allowed_license = license_name.lower().startswith(ALLOWED_LICENSES)
        restricted_license = any(marker in license_name.lower() for marker in ("-nc", "-nd", " noncommercial", " no derivatives"))
        if (
            not info.get("thumburl")
            or Path(page.get("title", "")).suffix.lower() not in ALLOWED_TYPES
            or not allowed_license
            or restricted_license
        ):
            continue
        candidates.append({
            "pageid": page.get("pageid"),
            "title": clean(page.get("title", "").removeprefix("File:")),
            "url": info["thumburl"],
            "source": info.get("descriptionurl", ""),
            "license": license_name,
            "artist": clean((metadata.get("Artist") or {}).get("value")) or "Unknown author",
            "description": clean((metadata.get("ImageDescription") or {}).get("value")),
        })
    return candidates


def tokens(value):
    return set(re.findall(r"[a-z0-9]+", value.lower())) - {
        "the", "and", "with", "from", "our", "fresh", "house", "soft", "warm",
        "crisp", "classic", "cup", "plate", "little", "made", "served", "style",
    }


def score(item, candidate):
    title_words = tokens(candidate["title"])
    item_words = tokens(item["name"] + " " + item["description"])
    category_words = tokens(item["category"].replace("-", " "))
    metadata_words = tokens(candidate["title"] + " " + candidate["description"])
    overlap = len(title_words & item_words)
    category_hits = len(metadata_words & category_words)
    return overlap * 3 + category_hits


def download(candidate):
    request = urllib.request.Request(candidate["url"], headers={"User-Agent": AGENT})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read(6_000_001)
    if len(data) < 8_000 or len(data) > 6_000_000:
        raise ValueError(f"Unexpected image size: {len(data)}")
    digest = hashlib.sha256(data).hexdigest()
    return data, digest


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    items = read_menu()
    categories = {}
    queries = []
    for category, phrases in GROUPS.items():
        for phrase in phrases:
            queries.append((category, phrase))
    for category, phrase in queries:
        try:
            results = search(phrase)
        except Exception as exc:
            print(f"Search failed [{category}: {phrase}]: {exc}", flush=True)
            continue
        bucket = categories.setdefault(category, {})
        for candidate in results:
            bucket.setdefault(candidate["pageid"], candidate)
        print(f"Search [{category}: {phrase}] -> {len(results)} licensed images", flush=True)
        time.sleep(1.5)

    assigned = {}
    used_pages = set()
    used_hashes = set()
    for item in items:
        candidates = list(categories.get(item["category"], {}).values())
        candidates.sort(key=lambda candidate: (
            candidate["pageid"] in used_pages,
            -score(item, candidate),
            candidate["title"].lower(),
        ))
        selected = None
        errors = []
        for candidate in candidates:
            if candidate["pageid"] in used_pages:
                continue
            try:
                data, digest = download(candidate)
            except Exception as exc:
                errors.append(str(exc))
                continue
            if digest in used_hashes:
                continue
            selected = (candidate, data, digest)
            break
        if selected is None:
            raise RuntimeError(
                f"No unique licensed image for {item['name']} in {item['category']}; "
                f"{len(candidates)} candidates, download errors: {errors[:3]}"
            )
        candidate, data, digest = selected
        slug = re.sub(r"[^a-z0-9]+", "-", item["name"].lower()).strip("-")
        ext = Path(candidate["title"]).suffix.lower()
        filename = f"{slug}{ext}"
        (STAGE / filename).write_bytes(data)
        used_pages.add(candidate["pageid"])
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
        assigned[item["name"]] = item
        print(f"Assigned {item['category']}: {item['name']} <- {candidate['title']}", flush=True)
        (STAGE / "partial-menu-images.json").write_text(
            json.dumps({"items": [entry for entry in items if entry["name"] in assigned]}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    manifest = {
        "items": items,
        "categoryCounts": {key: sum(item["category"] == key for item in items) for key in GROUPS},
    }
    (STAGE / "menu-images.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"SUCCESS: {len(used_hashes)} unique menu images in {STAGE}", flush=True)


if __name__ == "__main__":
    main()
