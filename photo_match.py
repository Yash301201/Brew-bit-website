import json
import sys
import time
from pathlib import Path

from photo_refresh import STAGE, download, search, tokens


QUERY_BY_NAME = {
    "Classic cold brew": "cold brew coffee glass",
    "Long black": "long black espresso coffee cup",
    "Iced vanilla bean latte": "iced vanilla bean latte coffee",
    "Coconut cream iced coffee": "coconut iced coffee cup",
    "Roasted pepper mozzarella melt": "roasted pepper mozzarella sandwich",
    "Caramelised onion cheddar melt": "caramelized onion cheddar sandwich",
    "Herbed egg salad sandwich": "herbed egg salad sandwich",
    "Roasted pumpkin quinoa bowl": "roasted pumpkin quinoa bowl",
    "Turmeric ginger milk": "turmeric ginger milk drink",
    "Cucumber basil spritz": "cucumber basil sparkling drink",
    "Sweet corn chilla plate": "corn lentil chilla pancake",
    "Spinach feta omelette": "spinach feta omelette eggs",
    "Smashed pea & halloumi plate": "smashed peas halloumi toast",
    "Baked beans on toast": "baked beans toast",
    "Apple cinnamon French toast": "apple cinnamon french toast",
    "Za'atar mushroom tartine": "mushroom zaatar toast",
    "Roasted pepper mozzarella melt": "roasted pepper mozzarella sandwich",
    "Smoky aubergine focaccia": "aubergine focaccia sandwich",
    "Pesto paneer toastie": "paneer pesto grilled sandwich",
    "Caramelised onion cheddar melt": "caramelized onion cheddar sandwich",
    "Herbed egg salad sandwich": "herbed egg salad sandwich",
    "Roasted pumpkin & feta wrap": "roasted pumpkin feta wrap",
    "Chilli crisp tofu sandwich": "chili crisp tofu sandwich",
    "Cucumber cream cheese rye": "cucumber cream cheese rye sandwich",
    "Tomato ricotta focaccia": "tomato ricotta focaccia",
    "Kimchi cheddar scone": "kimchi cheddar savory scone",
    "Brown butter tahini cookie": "tahini chocolate chip cookie",
    "Pistachio orange morning bun": "pistachio orange pastry bun",
    "Olive & rosemary focaccia": "olive rosemary focaccia bread",
    "Cardamom pear tea cake": "pear cardamom tea cake",
    "Spinach feta hand pie": "spinach feta hand pie pastry",
    "Cinnamon knot": "cinnamon knot pastry roll",
    "Seeded cheddar biscuit": "cheddar seeded biscuit",
    "Lemon poppy loaf": "lemon poppy seed loaf cake",
    "Tomato ricotta hand pie": "tomato ricotta pastry pie",
    "Cardamom pear galette": "pear cardamom galette pastry",
    "Dark chocolate rye tart": "dark chocolate tart",
    "Coconut lime chia cup": "coconut lime chia pudding mango",
    "Dark chocolate olive oil cake": "dark chocolate olive oil cake",
    "Jaggery pecan blondie": "pecan blondie dessert",
    "Mango passionfruit tart": "mango passion fruit tart dessert",
    "Basque burnt cheesecake": "basque burnt cheesecake slice",
    "Strawberry rose panna cotta": "strawberry panna cotta dessert",
    "Espresso tiramisu cup": "espresso tiramisu dessert",
    "Date walnut loaf slice": "date walnut loaf cake",
    "Parmesan polenta bites": "parmesan polenta bites appetizer",
    "Crispy chickpea chaat": "crispy chickpea chaat",
    "Whipped feta & flatbread": "whipped feta flatbread",
    "Cumin sweet potato wedges": "cumin sweet potato wedges",
    "Chilli garlic edamame": "chili garlic edamame bowl",
    "Beetroot hummus plate": "beetroot hummus pita plate",
    "Corn ribs with lime crema": "corn ribs lime",
    "Crispy cauliflower bites": "crispy cauliflower bites",
    "Herb butter mushrooms": "herb butter mushrooms toast",
    "Olive & marinated feta bowl": "olives marinated feta mezze",
    "Stone fruit granola bowl": "stone fruit granola yogurt bowl",
    "Coconut mango chia bowl": "coconut mango chia pudding bowl",
    "Warm cinnamon oats": "warm cinnamon oats bowl",
    "Berry almond yoghurt bowl": "berry almond yogurt granola bowl",
    "Peanut butter banana oats": "peanut butter banana oatmeal",
    "Green goddess grain bowl": "green goddess grain bowl",
    "Roasted pumpkin quinoa bowl": "roasted pumpkin quinoa bowl",
    "Citrus beet & labneh bowl": "beetroot labneh citrus salad bowl",
    "Sesame soba noodle bowl": "sesame soba noodle bowl",
    "Miso avocado rice bowl": "miso avocado rice bowl",
}
FORBIDDEN_TITLE_WORDS = {
    "museum", "artifact", "ancient", "remains", "archeological", "archaeological",
    "china", "tableware", "grocery", "supermarket", "buffet", "sign",
    "menu", "logo", "display-case", "cbd", "martini", "starbucks",
    "aperitivo", "alcohol", "wine", "beer", "cocktail", "meatball",
    "chicken", "beef", "pork", "turkey", "sausage", "bacon", "ham",
    "anchovy", "tillamook", "stumptown",
}
GENERIC_QUERY_WORDS = {
    "food", "dish", "meal", "bowl", "plate", "cup", "drink", "coffee", "tea",
    "breakfast", "brunch", "dessert", "cake", "pastry", "bread", "snack",
    "appetizer", "sandwich", "toast", "bites", "slice", "fresh", "with",
    "and", "the", "a", "on", "of", "in",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    manifest_path = STAGE / "menu-images.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    existing_hashes = {item["sha256"] for item in manifest["items"]}
    existing_pages = {item.get("pageid") for item in manifest["items"]}
    for item in manifest["items"]:
        query = QUERY_BY_NAME.get(item["name"])
        if not query:
            continue
        if not (tokens(item["commonsTitle"]) & FORBIDDEN_TITLE_WORDS):
            continue
        try:
            candidates = search(query)
        except Exception as exc:
            print(f"Kept {item['name']} after search error: {exc}", flush=True)
            time.sleep(1.5)
            continue
        title_words = tokens(item["name"])
        query_words = tokens(query) - GENERIC_QUERY_WORDS
        candidates = [
            candidate for candidate in candidates
            if not (tokens(candidate["title"]) & FORBIDDEN_TITLE_WORDS)
            and (tokens(candidate["title"]) & (title_words | query_words))
        ]
        candidates.sort(key=lambda candidate: (
            -len(tokens(candidate["title"]) & title_words),
            -len(tokens(candidate["title"]) & query_words),
            candidate["title"].lower(),
        ))
        old_title_words = tokens(item["commonsTitle"])
        old_score = -1 if old_title_words & FORBIDDEN_TITLE_WORDS else len(old_title_words & title_words)
        replacement = None
        for candidate in candidates:
            if candidate["pageid"] in existing_pages and candidate["pageid"] != item.get("pageid"):
                continue
            try:
                data, digest = download(candidate)
            except Exception:
                continue
            if digest in existing_hashes and digest != item["sha256"]:
                continue
            new_score = len(tokens(candidate["title"]) & title_words)
            if new_score <= old_score:
                continue
            replacement = candidate, data, digest, new_score
            break
        if replacement:
            candidate, data, digest, new_score = replacement
            old_digest = item["sha256"]
            existing_hashes.discard(old_digest)
            existing_hashes.add(digest)
            old_page = item.get("pageid")
            existing_pages.discard(old_page)
            existing_pages.add(candidate["pageid"])
            filename = Path(item["image"]).name
            ext = Path(candidate["title"]).suffix.lower()
            if Path(filename).suffix.lower() != ext:
                filename = Path(filename).stem + ext
                item["image"] = f"images/menu/{filename}"
            (STAGE / filename).write_bytes(data)
            item.update({
                "pageid": candidate["pageid"],
                "credit": candidate["artist"],
                "license": candidate["license"],
                "source": candidate["source"],
                "commonsTitle": candidate["title"],
                "sha256": digest,
            })
            print(f"Replaced {item['name']} (match {new_score}) <- {candidate['title']}", flush=True)
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        else:
            print(f"Kept {item['name']} <- {item['commonsTitle']}", flush=True)
        time.sleep(1.5)
    print("Finished targeted image matches.", flush=True)


if __name__ == "__main__":
    main()
