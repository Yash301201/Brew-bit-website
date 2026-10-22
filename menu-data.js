window.BREW_MENU_CATEGORIES = [
  { id: "signature-coffee", label: "Signature coffee", image: "coffee" },
  { id: "espresso", label: "Espresso bar", image: "espresso" },
  { id: "cold-coffee", label: "Cold coffee", image: "cold-coffee" },
  { id: "tea", label: "Tea & refreshers", image: "tea" },
  { id: "brunch", label: "Brunch plates", image: "brunch" },
  { id: "sandwiches", label: "Toasties & sandwiches", image: "sandwiches" },
  { id: "bakery", label: "Bakery", image: "bakery" },
  { id: "desserts", label: "Cakes & desserts", image: "desserts" },
  { id: "small-plates", label: "Small plates", image: "small-plates" },
  { id: "bowls", label: "Bowls & yoghurt", image: "bowls" },
];

const menuGroups = [
  {
    category: "signature-coffee",
    items: [
      ["Pistachio rose cortado", 350, "Ristretto, silky pistachio milk, rose water, crushed pistachio.", "House favourite"],
      ["Orange cardamom tonic", 320, "Espresso, blood-orange cordial, green cardamom, sparkling tonic.", "Bright & bubbly"],
      ["Maple miso shaker", 340, "Double espresso, maple and white miso, oat milk, cinnamon.", "Stirred to order"],
      ["Pandan cascara fizz", 310, "Coffee-cherry tea, pandan syrup, coconut water, fresh lime.", "Garden fizz"],
      ["Honey lavender flat white", 315, "Double espresso, steamed milk, wildflower honey, a hint of lavender.", "Floral favourite"],
      ["Brown butter mocha", 365, "Dark chocolate, espresso, brown-butter milk, shaved chocolate.", "House special"],
      ["Rosemary caramel latte", 345, "Espresso, rosemary-steeped caramel, textured milk, sea salt.", "Sweet & savoury"],
      ["Coconut jaggery cappuccino", 330, "Espresso, coconut milk, slow-melted jaggery, toasted coconut.", "Cafe original"],
      ["Saffron almond piccolo", 290, "Short espresso, almond milk, saffron, crushed toasted almonds.", "Little & lovely"],
      ["Tahini date latte", 355, "Espresso, sesame tahini, date syrup, oat milk, sesame dust.", "Naturally sweet"],
    ],
  },
  {
    category: "espresso",
    items: [
      ["House espresso", 190, "A double shot of our rotating, freshly ground house beans.", "The foundation"],
      ["Ristretto", 190, "A short, concentrated pull with a rounded, caramel finish.", "Short & bold"],
      ["Long black", 210, "Double espresso topped with hot water for a clean finish.", "No fuss"],
      ["Flat white", 240, "Double espresso with silky, finely textured milk.", "Cafe classic"],
      ["Cappuccino", 250, "Rich espresso, airy steamed milk, and a soft cocoa finish.", "Foam-forward"],
      ["Cafe latte", 260, "A balanced double espresso with smooth, steamed milk.", "Easy favourite"],
      ["Piccolo latte", 220, "A short ristretto topped with a small pour of silky milk.", "Small cup"],
      ["Espresso macchiato", 205, "Double espresso marked with a spoonful of steamed milk foam.", "Just a touch"],
      ["Dark chocolate mocha", 310, "Espresso, melted dark chocolate, steamed milk, cocoa.", "Chocolate fix"],
      ["Vanilla bean latte", 295, "Espresso, real vanilla-bean syrup, and silky steamed milk.", "Soft & sweet"],
    ],
  },
  {
    category: "cold-coffee",
    items: [
      ["Classic cold brew", 275, "Slow-steeped house coffee over ice with a smooth finish.", "Slow steeped"],
      ["Orange cream cold brew", 325, "Cold brew, fresh orange syrup, softly whipped vanilla cream.", "Citrus cloud"],
      ["Coconut cream iced coffee", 310, "Chilled espresso, coconut cream, jaggery, crushed ice.", "Island inspired"],
      ["Salted maple shakerato", 315, "Shaken espresso, maple syrup, a pinch of sea salt, ice.", "Shake it up"],
      ["Mocha oat frappé", 340, "Blended espresso, oat milk, dark chocolate, coffee ice.", "Blended fresh"],
      ["Ginger lime espresso soda", 285, "A bright espresso shot with ginger, lime, and sparkling soda.", "A little sparkle"],
      ["Iced vanilla bean latte", 285, "Double espresso, cold milk, real vanilla, plenty of ice.", "Chilled classic"],
      ["Black sesame iced latte", 330, "Espresso, toasted black sesame paste, milk, sesame crumble.", "Nutty & smooth"],
      ["Cascara lemon cold brew", 300, "Cold brew and coffee-cherry tea lifted with fresh lemon.", "Crisp finish"],
      ["Banana bread iced latte", 335, "Espresso, ripe banana, cinnamon, milk, toasted oat crumb.", "Bakery in a cup"],
    ],
  },
  {
    category: "tea",
    items: [
      ["Masala chai", 190, "House-brewed Assam tea, ginger, cardamom, clove, milk.", "Brewed in house"],
      ["Kashmiri kahwa", 220, "Green tea, saffron, cinnamon, cardamom, toasted almonds.", "Gentle & aromatic"],
      ["Hibiscus lime cooler", 230, "Tart hibiscus tea, fresh lime, mint, a touch of cane sugar.", "Ruby red"],
      ["Mint green tea", 190, "Whole-leaf green tea steeped with garden mint.", "Freshly steeped"],
      ["Ginger lemongrass tea", 200, "Fresh ginger, lemongrass, black tea, a little honey.", "Bright & warming"],
      ["Peach oolong iced tea", 240, "Fragrant oolong tea, ripe peach, lemon, over ice.", "Stone-fruit notes"],
      ["Rose matcha latte", 320, "Ceremonial-style matcha, rose water, milk, rose petal.", "Whisked to order"],
      ["Classic iced matcha", 300, "Stone-ground matcha whisked smooth and poured over milk and ice.", "Green & mellow"],
      ["Turmeric ginger milk", 240, "Warm milk, turmeric, fresh ginger, cinnamon, black pepper.", "Golden cup"],
      ["Cucumber basil spritz", 220, "Cucumber, basil, lime, sparkling water, house-made syrup.", "Garden refresher"],
    ],
  },
  {
    category: "brunch",
    items: [
      ["Miso mushroom scramble", 420, "Soft scrambled eggs, miso mushrooms, chives, toasted sourdough.", "Brunch favourite"],
      ["Harissa baked eggs", 440, "Eggs baked in tomato harissa with whipped feta and flatbread.", "A little heat"],
      ["Sweet corn chilla plate", 350, "Golden corn and lentil chillas, mint yoghurt, tomato chutney.", "Fresh off the pan"],
      ["Ricotta lemon pancakes", 390, "Fluffy ricotta pancakes, lemon curd, seasonal berries, honey.", "Weekend mood"],
      ["Shakshuka with feta", 430, "Slow-cooked spiced tomato and peppers, baked eggs, warm bread.", "Made to share"],
      ["Spinach feta omelette", 365, "Three-egg omelette, baby spinach, feta, herbs, garden salad.", "Made to order"],
      ["Chilli crisp breakfast bowl", 410, "Brown rice, jammy egg, greens, pickled vegetables, chilli crisp.", "A savoury start"],
      ["Smashed pea & halloumi plate", 395, "Minted peas, seared halloumi, lemon yoghurt, toasted country bread.", "Bright & filling"],
      ["Baked beans on toast", 325, "Slow-cooked tomato beans, parmesan, herb oil, thick sourdough.", "Comfort on toast"],
      ["Apple cinnamon French toast", 380, "Brioche, cinnamon apples, vanilla cream, toasted pecans.", "Sweet brunch"],
    ],
  },
  {
    category: "sandwiches",
    items: [
      ["Za'atar mushroom tartine", 395, "Roasted mushrooms, whipped feta, za'atar, pickled shallots, sourdough.", "Savoury favourite"],
      ["Roasted pepper mozzarella melt", 380, "Roasted peppers, mozzarella, basil pesto, pressed country loaf.", "Golden & melty"],
      ["Smoky aubergine focaccia", 360, "Smoky aubergine, tahini yoghurt, rocket, soft focaccia.", "Plant-forward"],
      ["Pesto paneer toastie", 345, "Grilled paneer, basil pesto, tomato, multigrain bread.", "Cafe comfort"],
      ["Caramelised onion cheddar melt", 355, "Aged cheddar, slow onions, mustard, toasted sourdough.", "Crisp & gooey"],
      ["Herbed egg salad sandwich", 320, "Chopped eggs, dill, chives, mustard mayo, soft milk bread.", "Lunchbox classic"],
      ["Roasted pumpkin & feta wrap", 350, "Roasted pumpkin, whipped feta, baby spinach, seeded wrap.", "Seasonal pick"],
      ["Chilli crisp tofu sandwich", 365, "Crisp tofu, chilli crunch, crunchy slaw, sesame bun.", "A little kick"],
      ["Cucumber cream cheese rye", 290, "Cucumber ribbons, whipped herbed cream cheese, dark rye.", "Light & fresh"],
      ["Tomato ricotta focaccia", 335, "Whipped ricotta, slow-roasted tomatoes, basil, olive focaccia.", "Market fresh"],
    ],
  },
  {
    category: "bakery",
    items: [
      ["Kimchi cheddar scone", 225, "Flaky savoury scone with aged cheddar, kimchi, scallions, sesame.", "Baked in small batches"],
      ["Brown butter tahini cookie", 180, "Chewy brown-butter cookie with tahini, dark chocolate, sea salt.", "Baked today"],
      ["Pistachio orange morning bun", 240, "Laminated bun, orange sugar, crushed pistachio, light glaze.", "Morning treat"],
      ["Olive & rosemary focaccia", 195, "Olive-oil focaccia with green olives, fresh rosemary, flaky salt.", "Oven baked"],
      ["Cardamom pear tea cake", 210, "Tender pear cake scented with cardamom and topped with almond.", "A slice of home"],
      ["Spinach feta hand pie", 230, "Buttery pastry filled with spinach, feta, dill, and lemon.", "Warm from the oven"],
      ["Cinnamon knot", 175, "Soft twisted dough, cinnamon sugar, vanilla glaze.", "Coffee's best friend"],
      ["Seeded cheddar biscuit", 185, "Buttermilk biscuit with sharp cheddar and toasted mixed seeds.", "Savoury bake"],
      ["Lemon poppy loaf", 190, "Lemon-bright loaf with poppy seeds and a light citrus glaze.", "A sunny slice"],
      ["Tomato ricotta hand pie", 235, "Flaky pastry with roasted cherry tomato, lemon ricotta, fresh basil.", "Baked to golden"],
    ],
  },
  {
    category: "desserts",
    items: [
      ["Cardamom pear galette", 320, "Brown-butter pastry, ripe pear, cardamom, toasted walnuts, fresh thyme.", "Sweet & savoury"],
      ["Dark chocolate rye tart", 340, "Dark chocolate ganache in a rye pastry shell with toasted hazelnuts.", "Crisp & golden"],
      ["Coconut lime chia cup", 275, "Coconut cream, chia, ripe mango, lime zest, toasted coconut.", "Chilled & refreshing"],
      ["Dark chocolate olive oil cake", 290, "Deep cocoa cake, fruity olive oil, cocoa nib, softly whipped cream.", "Rich & tender"],
      ["Jaggery pecan blondie", 225, "Browned butter, jaggery, toasted pecans, white chocolate.", "Small-batch bake"],
      ["Mango passionfruit tart", 310, "Crisp pastry shell, mango cream, sharp passionfruit curd.", "Tropical finish"],
      ["Basque burnt cheesecake", 330, "Creamy baked cheesecake with a deeply caramelised top.", "Cafe classic"],
      ["Strawberry rose panna cotta", 285, "Vanilla-set cream, macerated strawberries, rose syrup.", "Silky & light"],
      ["Espresso tiramisu cup", 305, "Espresso-soaked sponge, mascarpone cream, cocoa dust.", "Coffee-led"],
      ["Date walnut loaf slice", 210, "Sticky dates, toasted walnuts, warm spice, cultured butter.", "Tea-time favourite"],
    ],
  },
  {
    category: "small-plates",
    items: [
      ["Parmesan polenta bites", 340, "Crisp polenta with whipped ricotta, house tomato jam, and fresh basil.", "Share a plate"],
      ["Crispy chickpea chaat", 270, "Crunchy chickpeas, tamarind yoghurt, mint, pomegranate.", "Sweet, tangy, crisp"],
      ["Whipped feta & flatbread", 295, "Lemon whipped feta, warm flatbread, chilli honey, herbs.", "Made for sharing"],
      ["Cumin sweet potato wedges", 255, "Roasted sweet potato, toasted cumin, lime yoghurt, coriander.", "Oven roasted"],
      ["Chilli garlic edamame", 235, "Steamed edamame tossed with chilli oil, garlic, sesame, lime.", "A little savoury"],
      ["Beetroot hummus plate", 285, "Beet hummus, crunchy vegetables, toasted seeds, warm pita.", "Colourful & fresh"],
      ["Corn ribs with lime crema", 265, "Charred corn, smoked paprika, lime crema, crumbled cotija.", "Finger food"],
      ["Crispy cauliflower bites", 280, "Golden cauliflower, tamarind glaze, coriander, sesame.", "Tangy crunch"],
      ["Herb butter mushrooms", 310, "Pan-seared mushrooms, thyme butter, lemon, grilled bread.", "From the skillet"],
      ["Olive & marinated feta bowl", 300, "Citrus-marinated olives, feta, oregano, warm flatbread.", "Mediterranean mood"],
    ],
  },
  {
    category: "bowls",
    items: [
      ["Stone fruit granola bowl", 310, "Thick yoghurt, toasted oat clusters, seasonal fruit, orange blossom.", "Bright start"],
      ["Coconut mango chia bowl", 295, "Coconut chia pudding, fresh mango, toasted coconut, lime.", "Plant-based"],
      ["Warm cinnamon oats", 265, "Creamy rolled oats, stewed apple, cinnamon, toasted pecans.", "Slow morning"],
      ["Berry almond yoghurt bowl", 320, "Greek yoghurt, seasonal berries, almond butter, crunchy granola.", "Fresh & filling"],
      ["Peanut butter banana oats", 285, "Warm oats, banana, peanut butter, cacao nibs, maple.", "A cosy classic"],
      ["Green goddess grain bowl", 380, "Herbed grains, avocado, cucumber, greens, lemon dressing.", "Lunch bowl"],
      ["Roasted pumpkin quinoa bowl", 395, "Quinoa, spiced pumpkin, greens, pumpkin seeds, tahini lemon.", "Plant-forward"],
      ["Citrus beet & labneh bowl", 355, "Roasted beetroot, creamy labneh, orange, lentils, dukkah.", "Seasonal colour"],
      ["Sesame soba noodle bowl", 370, "Chilled soba, sesame dressing, crisp vegetables, scallions.", "Cool & savoury"],
      ["Miso avocado rice bowl", 390, "Brown rice, avocado, greens, sesame, ginger-miso dressing.", "A nourishing bowl"],
    ],
  },
];

const menuImageData = {
  "Pistachio rose cortado": {
    "image": "images/menu/pistachio-rose-cortado.jpg",
    "photoCredit": "Onpuichunsen",
    "photoLicense": "CC BY-SA 3.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:HK_Coffee_latte_art_milk_pattern_Aug-2013.JPG",
    "photoTitle": "HK Coffee latte art milk pattern Aug-2013.JPG"
  },
  "Orange cardamom tonic": {
    "image": "images/menu/orange-cardamom-tonic-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Maple miso shaker": {
    "image": "images/menu/maple-miso-shaker-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Pandan cascara fizz": {
    "image": "images/menu/pandan-cascara-fizz-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Honey lavender flat white": {
    "image": "images/menu/honey-lavender-flat-white.jpg",
    "photoCredit": "Steve Evans  from Citizen of the World",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_cup_of_coffee_(390063722).jpg",
    "photoTitle": "A cup of coffee (390063722).jpg"
  },
  "Brown butter mocha": {
    "image": "images/menu/brown-butter-mocha.jpg",
    "photoCredit": "Onpuichunsen",
    "photoLicense": "CC BY-SA 3.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:HK_Coffee_latte_art_sweet_milk_Aug-2013.JPG",
    "photoTitle": "HK Coffee latte art sweet milk Aug-2013.JPG"
  },
  "Rosemary caramel latte": {
    "image": "images/menu/rosemary-caramel-latte.jpg",
    "photoCredit": "Stevenndori289",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Steamed_milk_latte_Coffee.jpg",
    "photoTitle": "Steamed milk latte Coffee.jpg"
  },
  "Coconut jaggery cappuccino": {
    "image": "images/menu/coconut-jaggery-cappuccino.jpg",
    "photoCredit": "Aneth David (SLU)",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A-cup-of-cappuccino-coffee-dar-es-salaam-cafe.jpg",
    "photoTitle": "A-cup-of-cappuccino-coffee-dar-es-salaam-cafe.jpg"
  },
  "Saffron almond piccolo": {
    "image": "images/menu/saffron-almond-piccolo.jpg",
    "photoCredit": "GoDragonMO",
    "photoLicense": "CC BY-SA 3.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Macau_Taipa_Square_Hotel_Breakfast_buffet_Milk_Coffee.JPG",
    "photoTitle": "Macau Taipa Square Hotel Breakfast buffet Milk Coffee.JPG"
  },
  "Tahini date latte": {
    "image": "images/menu/tahini-date-latte.jpg",
    "photoCredit": "Kyu3a",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Blue_Bottle_Coffee_Caff%C3%A8_Latte_(Decaffeination).jpg",
    "photoTitle": "Blue Bottle Coffee Caffè Latte (Decaffeination).jpg"
  },
  "House espresso": {
    "image": "images/menu/house-espresso.jpg",
    "photoCredit": "Vee Satayamas",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_cup_of_espresso.jpg",
    "photoTitle": "A cup of espresso.jpg"
  },
  "Ristretto": {
    "image": "images/menu/ristretto.jpg",
    "photoCredit": "Sander van der Wel  from Netherlands",
    "photoLicense": "CC BY-SA 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_good_cappuccino_starts_with_a_perfect_espresso!!_(4441914182).jpg",
    "photoTitle": "A good cappuccino starts with a perfect espresso!! (4441914182).jpg"
  },
  "Long black": {
    "image": "images/menu/long-black.jpg",
    "photoCredit": "anthony_p_c",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Nero_Espresso_long_black_(3168418775).jpg",
    "photoTitle": "Nero Espresso long black (3168418775).jpg"
  },
  "Flat white": {
    "image": "images/menu/flat-white.jpg",
    "photoCredit": "DEEPAN RAJA .M",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Classic_espresso_and_milk_drink.jpg",
    "photoTitle": "Classic espresso and milk drink.jpg"
  },
  "Cappuccino": {
    "image": "images/menu/cappuccino.jpg",
    "photoCredit": "massage-techniques",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Espresso_shot_in_a_cappuccino_cup.jpg",
    "photoTitle": "Espresso shot in a cappuccino cup.jpg"
  },
  "Cafe latte": {
    "image": "images/menu/cafe-latte.jpg",
    "photoCredit": "Lukas Kolbe ( lukas2 )",
    "photoLicense": "CC BY-SA 2.5",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Cappuccino_latte_art_2006-04-14.jpg",
    "photoTitle": "Cappuccino latte art 2006-04-14.jpg"
  },
  "Piccolo latte": {
    "image": "images/menu/piccolo-latte.jpg",
    "photoCredit": "Julius Schorzman",
    "photoLicense": "CC BY-SA 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_small_cup_of_coffee.JPG",
    "photoTitle": "A small cup of coffee.JPG"
  },
  "Espresso macchiato": {
    "image": "images/menu/espresso-macchiato.jpg",
    "photoCredit": "Kritzolina",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Cup_of_espresso_02.jpg",
    "photoTitle": "Cup of espresso 02.jpg"
  },
  "Dark chocolate mocha": {
    "image": "images/menu/dark-chocolate-mocha.jpg",
    "photoCredit": "Vee Satayamas",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Espresso_%5EHowAboutYou_%5ECoffee_%5EDrink_-_Flickr_-_veer66.jpg",
    "photoTitle": "Espresso ^HowAboutYou ^Coffee ^Drink - Flickr - veer66.jpg"
  },
  "Vanilla bean latte": {
    "image": "images/menu/vanilla-bean-latte.jpg",
    "photoCredit": "MOs810",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Espresso_and_Rafaello_(Poznan).jpg",
    "photoTitle": "Espresso and Rafaello (Poznan).jpg"
  },
  "Classic cold brew": {
    "image": "images/menu/classic-cold-brew-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Orange cream cold brew": {
    "image": "images/menu/orange-cream-cold-brew.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Maple_Cream_Cold_Brew_-_Trading_Post_Coffee_Roasters_2026-07-16.jpg",
    "photoTitle": "Maple Cream Cold Brew - Trading Post Coffee Roasters 2026-07-16.jpg"
  },
  "Coconut cream iced coffee": {
    "image": "images/menu/coconut-cream-iced-coffee.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Vietnamese_Salted_Coffee_%26_Xin_chao%27s_coconut_Coffee_-_Xin_Chao,_Eastbourne_2026-08-14.jpg",
    "photoTitle": "Vietnamese Salted Coffee & Xin chao's coconut Coffee - Xin Chao, Eastbourne 2026-08-14.jpg"
  },
  "Salted maple shakerato": {
    "image": "images/menu/salted-maple-shakerato.jpg",
    "photoCredit": "PattayaPatrol",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:DFC_0816_A_close-up_of_a_hand_holding_a_plastic_cup_while_a_chocolatey_smoothie_is_poured_over_ice_from_a_blender.jpg",
    "photoTitle": "DFC 0816 A close-up of a hand holding a plastic cup while a chocolatey smoothie is poured over ice from a blender.jpg"
  },
  "Mocha oat frappé": {
    "image": "images/menu/mocha-oat-frappe.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Iced_mocha_-_Cafe_Rust_2025-03-31.jpg",
    "photoTitle": "Iced mocha - Cafe Rust 2025-03-31.jpg"
  },
  "Ginger lime espresso soda": {
    "image": "images/menu/ginger-lime-espresso-soda.jpg",
    "photoCredit": "Charles Haynes  from Hobart, Australia",
    "photoLicense": "CC BY-SA 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_glass_of_Ipoh_iced_white_coffee.jpg",
    "photoTitle": "A glass of Ipoh iced white coffee.jpg"
  },
  "Iced vanilla bean latte": {
    "image": "images/menu/iced-vanilla-bean-latte.jpg",
    "photoCredit": "Infrogmation of New Orleans",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Pandoras_Ice_Box_New_Orleans_May_2018_Orchid_Cream_Vanilla_and_Coffee_Cream.jpg",
    "photoTitle": "Pandoras Ice Box New Orleans May 2018 Orchid Cream Vanilla and Coffee Cream.jpg"
  },
  "Black sesame iced latte": {
    "image": "images/menu/black-sesame-iced-latte-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Cascara lemon cold brew": {
    "image": "images/menu/cascara-lemon-cold-brew-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Banana bread iced latte": {
    "image": "images/menu/banana-bread-iced-latte-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Masala chai": {
    "image": "images/menu/masala-chai.jpg",
    "photoCredit": "FHSING MAgasdk",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:HK_MK_%E6%97%BA%E8%A7%92_Mong_Kok_%E5%A5%B6%E8%B7%AF%E8%87%A3%E8%A1%97_6_Nelson_Street_%E5%BD%8C%E6%95%A6%E9%81%93_636_Nathan_Road_%E6%B0%B8%E9%9A%86%E9%8A%80%E8%A1%8C%E4%B8%AD%E5%BF%83_CMB_Wing_Lung_Bank_Centre_shop_%E8%8A%B1%E5%9C%92%E9%A4%90%E5%BB%B3_Sweetheart_Garden_Restaurant_drink_milk_tea_cup_October_2025_N13P_01.jpg",
    "photoTitle": "HK MK 旺角 Mong Kok 奶路臣街 6 Nelson Street 彌敦道 636 Nathan Road 永隆銀行中心 CMB Wing Lung Bank Centre shop 花園餐廳 Sweetheart Garden Restaurant drink milk tea cup October 2025 N13P 01.jpg"
  },
  "Kashmiri kahwa": {
    "image": "images/menu/kashmiri-kahwa.jpg",
    "photoCredit": "Gaurav Dhwaj Khadka",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Green_Lemon_Tea.jpg",
    "photoTitle": "Green Lemon Tea.jpg"
  },
  "Hibiscus lime cooler": {
    "image": "images/menu/hibiscus-lime-cooler.jpg",
    "photoCredit": "Jgsodre",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:A_bottle_of_an_ice_tea_variataion_of_mate_and_a_glass_of_it.jpg",
    "photoTitle": "A bottle of an ice tea variataion of mate and a glass of it.jpg"
  },
  "Mint green tea": {
    "image": "images/menu/mint-green-tea-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Ginger lemongrass tea": {
    "image": "images/menu/ginger-lemongrass-tea-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Peach oolong iced tea": {
    "image": "images/menu/peach-oolong-iced-tea.jpg",
    "photoCredit": "Editor at Large",
    "photoLicense": "CC BY-SA 2.5",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Iced_tea_with_ice_cubes.jpg",
    "photoTitle": "Iced tea with ice cubes.jpg"
  },
  "Rose matcha latte": {
    "image": "images/menu/rose-matcha-latte.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Superberry_Smoothie_%26_Bill%27s_Ceremonial_Matcha_Latte_-_Bill%27s,_Lewes_2026-07-03.jpg",
    "photoTitle": "Superberry Smoothie & Bill's Ceremonial Matcha Latte - Bill's, Lewes 2026-07-03.jpg"
  },
  "Classic iced matcha": {
    "image": "images/menu/classic-iced-matcha.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Iced_Hojicha_Latte_and_Iced_Matcha_Latte_-_Rawlab_Juice_%26_Tea_2025-07-12.jpg",
    "photoTitle": "Iced Hojicha Latte and Iced Matcha Latte - Rawlab Juice & Tea 2025-07-12.jpg"
  },
  "Turmeric ginger milk": {
    "image": "images/menu/turmeric-ginger-milk-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Cucumber basil spritz": {
    "image": "images/menu/cucumber-basil-spritz-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Miso mushroom scramble": {
    "image": "images/menu/miso-mushroom-scramble.jpg",
    "photoCredit": "HaJunkiyada",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Breakfast_in_Israel_scrambled_eggs_with_herbs_and_vegetables.jpg",
    "photoTitle": "Liat Portal for Foodie Disorder - Breakfast in Israel scrambled eggs with herbs and vegetables.jpg"
  },
  "Harissa baked eggs": {
    "image": "images/menu/harissa-baked-eggs.jpg",
    "photoCredit": "Shixart1985",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Fresh_breakfast_served_with_eggs,_sausage,_vegetables,_and_toast_in_a_cafe.jpg",
    "photoTitle": "Fresh breakfast served with eggs, sausage, vegetables, and toast in a cafe.jpg"
  },
  "Sweet corn chilla plate": {
    "image": "images/menu/sweet-corn-chilla-plate-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Ricotta lemon pancakes": {
    "image": "images/menu/ricotta-lemon-pancakes-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Shakshuka with feta": {
    "image": "images/menu/shakshuka-with-feta.jpg",
    "photoCredit": "Soumendrak",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Breakfast_of_bread_and_shakshuka_at_Artjuna_cafe,_Goa.jpg",
    "photoTitle": "Breakfast of bread and shakshuka at Artjuna cafe, Goa.jpg"
  },
  "Spinach feta omelette": {
    "image": "images/menu/spinach-feta-omelette-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Chilli crisp breakfast bowl": {
    "image": "images/menu/chilli-crisp-breakfast-bowl.jpg",
    "photoCredit": "HaJunkiyada",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Israeli_breakfast_plate_with_egg,_avocado,_vegetables,_and_bread.jpg",
    "photoTitle": "Liat Portal for Foodie Disorder - Israeli breakfast plate with egg, avocado, vegetables, and bread.jpg"
  },
  "Smashed pea & halloumi plate": {
    "image": "images/menu/smashed-pea-halloumi-plate-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Baked beans on toast": {
    "image": "images/menu/baked-beans-on-toast.jpg",
    "photoCredit": "Rahul Nadgauda",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Baked_Beans_On_Toast.jpg",
    "photoTitle": "Baked Beans On Toast.jpg"
  },
  "Apple cinnamon French toast": {
    "image": "images/menu/apple-cinnamon-french-toast.jpg",
    "photoCredit": "Vegan Feast Catering",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Vegan_Cinnamon_Raisin_French_Toast_with_Caramelized_Apples_(4975448107).jpg",
    "photoTitle": "Vegan Cinnamon Raisin French Toast with Caramelized Apples (4975448107).jpg"
  },
  "Za'atar mushroom tartine": {
    "image": "images/menu/za-atar-mushroom-tartine.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Aubergine_parmigiana_focaccia,_basil_pesto,_roasted_tomato,_mozzarella_-_Djanogly_Caf%C3%A9,_Tate_Britain_2026-03-24.jpg",
    "photoTitle": "Aubergine parmigiana focaccia, basil pesto, roasted tomato, mozzarella - Djanogly Café, Tate Britain 2026-03-24.jpg"
  },
  "Roasted pepper mozzarella melt": {
    "image": "images/menu/roasted-pepper-mozzarella-melt.jpg",
    "photoCredit": "Sodanie Chea  from Norwalk, Ca, United States",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Day_246-_Vegetarian_Shooter_Sandwich_(8045308361).jpg",
    "photoTitle": "Day 246- Vegetarian Shooter Sandwich (8045308361).jpg"
  },
  "Smoky aubergine focaccia": {
    "image": "images/menu/smoky-aubergine-focaccia.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Focaccia_sandwiches_for_sale_on_the_counter_of_Fabio%27s_2026-02-12.jpg",
    "photoTitle": "Focaccia sandwiches for sale on the counter of Fabio's 2026-02-12.jpg"
  },
  "Pesto paneer toastie": {
    "image": "images/menu/pesto-paneer-toastie.jpg",
    "photoCredit": "V Bhavya",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Grilled_bread_sandwich,_guntur,_andhra_pradesh-DSC_0022.jpg",
    "photoTitle": "Grilled bread sandwich, guntur, andhra pradesh-DSC 0022.jpg"
  },
  "Caramelised onion cheddar melt": {
    "image": "images/menu/caramelised-onion-cheddar-melt.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Four_cheese_%26_onion_toastie_and_vanilla_sea_salt_matcha_-_Bloom_Cafe,_Holy_Trinity_Brompton_2026-09-03.jpg",
    "photoTitle": "Four cheese & onion toastie and vanilla sea salt matcha - Bloom Cafe, Holy Trinity Brompton 2026-09-03.jpg"
  },
  "Herbed egg salad sandwich": {
    "image": "images/menu/herbed-egg-salad-sandwich-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Roasted pumpkin & feta wrap": {
    "image": "images/menu/roasted-pumpkin-feta-wrap.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Panini_(Spinach,_mushrooms_%26_fresh_tomato)_-_Breakfast_At_Tiffany%27s_Brighton_2023-11-23.jpg",
    "photoTitle": "Panini (Spinach, mushrooms & fresh tomato) - Breakfast At Tiffany's Brighton 2023-11-23.jpg"
  },
  "Chilli crisp tofu sandwich": {
    "image": "images/menu/chilli-crisp-tofu-sandwich.jpg",
    "photoCredit": "Chuq",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Toasted_sandwich_with_sesame_seed_bread.jpg",
    "photoTitle": "Toasted sandwich with sesame seed bread.jpg"
  },
  "Cucumber cream cheese rye": {
    "image": "images/menu/cucumber-cream-cheese-rye.jpg",
    "photoCredit": "Lillottama",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Cheese_and_tomato_sandwich,_waffles_with_Ice_cream,_and_coffee.jpg",
    "photoTitle": "Cheese and tomato sandwich, waffles with Ice cream, and coffee.jpg"
  },
  "Tomato ricotta focaccia": {
    "image": "images/menu/tomato-ricotta-focaccia.jpg",
    "photoCredit": "Anna Korcheva",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Sandwich_with_vegan_cheese,_tomatoes_and_basil.jpg",
    "photoTitle": "Sandwich with vegan cheese, tomatoes and basil.jpg"
  },
  "Kimchi cheddar scone": {
    "image": "images/menu/kimchi-cheddar-scone.jpg",
    "photoCredit": "David Adam Kess",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Photography_by_David_Adam_Kess,_Croissant_in_Madrid_A_croissant_is_a_buttery,_flaky,_viennoiserie-pastry_named_for_its_well-known_crescent_shape.jpg",
    "photoTitle": "Photography by David Adam Kess, Croissant in Madrid A croissant is a buttery, flaky, viennoiserie-pastry named for its well-known crescent shape.jpg"
  },
  "Brown butter tahini cookie": {
    "image": "images/menu/brown-butter-tahini-cookie.jpg",
    "photoCredit": "Atprls2016oer",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Salted_tahini_chocolate_chip_cookies.jpg",
    "photoTitle": "Salted tahini chocolate chip cookies.jpg"
  },
  "Pistachio orange morning bun": {
    "image": "images/menu/pistachio-orange-morning-bun.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Pistachio_Croissant_-_Caff%C3%A8_Nero_2025-12-28.jpg",
    "photoTitle": "Pistachio Croissant - Caffè Nero 2025-12-28.jpg"
  },
  "Olive & rosemary focaccia": {
    "image": "images/menu/olive-rosemary-focaccia-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Cardamom pear tea cake": {
    "image": "images/menu/cardamom-pear-tea-cake-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Spinach feta hand pie": {
    "image": "images/menu/spinach-feta-hand-pie.jpg",
    "photoCredit": "Biso",
    "photoLicense": "CC BY 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Pastry_with_spinach_and_feta_cheese.jpg",
    "photoTitle": "Pastry with spinach and feta cheese.jpg"
  },
  "Cinnamon knot": {
    "image": "images/menu/cinnamon-knot-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Seeded cheddar biscuit": {
    "image": "images/menu/seeded-cheddar-biscuit-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Lemon poppy loaf": {
    "image": "images/menu/lemon-poppy-loaf.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Bakery_products_on_the_counter_of_Jacob%27s_Bakery_%2B_Cafe_2024-04-15.jpg",
    "photoTitle": "Bakery products on the counter of Jacob's Bakery + Cafe 2024-04-15.jpg"
  },
  "Tomato ricotta hand pie": {
    "image": "images/menu/tomato-ricotta-hand-pie-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Cardamom pear galette": {
    "image": "images/menu/cardamom-pear-galette-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Dark chocolate rye tart": {
    "image": "images/menu/dark-chocolate-rye-tart.jpg",
    "photoCredit": "Gogerr",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Dark_Chocolate_Tart_from_the_Elora_Mill_Hotel_Restaurant.jpg",
    "photoTitle": "Dark Chocolate Tart from the Elora Mill Hotel Restaurant.jpg"
  },
  "Coconut lime chia cup": {
    "image": "images/menu/coconut-lime-chia-cup-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Dark chocolate olive oil cake": {
    "image": "images/menu/dark-chocolate-olive-oil-cake.jpg",
    "photoCredit": "Shixart1985",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Delicious_dessert_slices_with_whipped_cream_served_on_decorative_plates.jpg",
    "photoTitle": "Delicious dessert slices with whipped cream served on decorative plates.jpg"
  },
  "Jaggery pecan blondie": {
    "image": "images/menu/jaggery-pecan-blondie.jpg",
    "photoCredit": "Famartin",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:2022-05-22_21_35_55_An_Applebee%27s_Butter_Pecan_Blondie_at_the_Applebee%27s_along_U.S._Route_1_(Brunswick_Pike)_in_Lawrence_Township,_Mercer_County,_New_Jersey.jpg",
    "photoTitle": "2022-05-22 21 35 55 An Applebee's Butter Pecan Blondie at the Applebee's along U.S. Route 1 (Brunswick Pike) in Lawrence Township, Mercer County, New Jersey.jpg"
  },
  "Mango passionfruit tart": {
    "image": "images/menu/mango-passionfruit-tart.jpg",
    "photoCredit": "OKJaguar",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Strawberries_and_cream_dessert_pastry_in_Tokyo,_Japan.jpg",
    "photoTitle": "Strawberries and cream dessert pastry in Tokyo, Japan.jpg"
  },
  "Basque burnt cheesecake": {
    "image": "images/menu/basque-burnt-cheesecake-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Strawberry rose panna cotta": {
    "image": "images/menu/strawberry-rose-panna-cotta.jpg",
    "photoCredit": "lowsource",
    "photoLicense": "CC BY-SA 3.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Panna_Cotta_with_strawberry_sauce.jpg",
    "photoTitle": "Panna Cotta with strawberry sauce.jpg"
  },
  "Espresso tiramisu cup": {
    "image": "images/menu/espresso-tiramisu-cup.jpg",
    "photoCredit": "franzconde",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:001_Tiramisu.jpg",
    "photoTitle": "001 Tiramisu.jpg"
  },
  "Date walnut loaf slice": {
    "image": "images/menu/date-walnut-loaf-slice.jpg",
    "photoCredit": "Brassluff",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Slice_of_Heaven_Desserts_on_Display_At_Ferguson_Plarre%27s_Bakehouse_of_Southland.jpg",
    "photoTitle": "Slice of Heaven Desserts on Display At Ferguson Plarre's Bakehouse of Southland.jpg"
  },
  "Parmesan polenta bites": {
    "image": "images/menu/parmesan-polenta-bites-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Crispy chickpea chaat": {
    "image": "images/menu/crispy-chickpea-chaat-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Whipped feta & flatbread": {
    "image": "images/menu/whipped-feta-flatbread.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:3_small_plates_-_The_Bright_Helm_2024-09-02.jpg",
    "photoTitle": "3 small plates - The Bright Helm 2024-09-02.jpg"
  },
  "Cumin sweet potato wedges": {
    "image": "images/menu/cumin-sweet-potato-wedges.jpg",
    "photoCredit": "Karen and Brad Emerson",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Sesame-roasted_sweet_potato_wedges_with_Brocolli_(3257806891).jpg",
    "photoTitle": "Sesame-roasted sweet potato wedges with Brocolli (3257806891).jpg"
  },
  "Chilli garlic edamame": {
    "image": "images/menu/chilli-garlic-edamame.jpg",
    "photoCredit": "HaJunkiyada",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Edamame_with_Walnuts.jpg",
    "photoTitle": "Liat Portal for Foodie Disorder - Edamame with Walnuts.jpg"
  },
  "Beetroot hummus plate": {
    "image": "images/menu/beetroot-hummus-plate.jpg",
    "photoCredit": "cyclonebill",
    "photoLicense": "CC BY-SA 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Flickr_-_cyclonebill_-_Serranoskinke,_frugt,_p%C3%B8lse,_tortilla,_oliven,_manchego,_salat,_hummus_og_empanadas.jpg",
    "photoTitle": "Flickr - cyclonebill - Serranoskinke, frugt, pølse, tortilla, oliven, manchego, salat, hummus og empanadas.jpg"
  },
  "Corn ribs with lime crema": {
    "image": "images/menu/corn-ribs-with-lime-crema.jpg",
    "photoCredit": "TAPAS KUMAR HALDER",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Corn_on_the_Cob-_Kolkata_-_West_Bengal_-_DSC_0009.jpg",
    "photoTitle": "Corn on the Cob- Kolkata - West Bengal - DSC 0009.jpg"
  },
  "Crispy cauliflower bites": {
    "image": "images/menu/crispy-cauliflower-bites.jpg",
    "photoCredit": "Mohimahmed001",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Plates_of_Kindness.jpg",
    "photoTitle": "Plates of Kindness.jpg"
  },
  "Herb butter mushrooms": {
    "image": "images/menu/herb-butter-mushrooms-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Olive & marinated feta bowl": {
    "image": "images/menu/olive-marinated-feta-bowl.jpg",
    "photoCredit": "Contrapunctus-1",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Mezze_bowl_at_Hons_All-Day_Dining,_Le_Press,_Hazratganj,_Lucknow_(2025-08-03).jpg",
    "photoTitle": "Mezze bowl at Hons All-Day Dining, Le Press, Hazratganj, Lucknow (2025-08-03).jpg"
  },
  "Stone fruit granola bowl": {
    "image": "images/menu/stone-fruit-granola-bowl.jpg",
    "photoCredit": "Andy Li",
    "photoLicense": "CC0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Falafel_Super_Bowl_Salad_-_Leon_2025-10-27.jpg",
    "photoTitle": "Falafel Super Bowl Salad - Leon 2025-10-27.jpg"
  },
  "Coconut mango chia bowl": {
    "image": "images/menu/coconut-mango-chia-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Warm cinnamon oats": {
    "image": "images/menu/warm-cinnamon-oats.jpg",
    "photoCredit": "UserTwoSix",
    "photoLicense": "CC BY-SA 4.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Oatmeal_porridge_1-minute_with_additional_ingredients.jpg",
    "photoTitle": "Oatmeal porridge 1-minute with additional ingredients.jpg"
  },
  "Berry almond yoghurt bowl": {
    "image": "images/menu/berry-almond-yoghurt-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Peanut butter banana oats": {
    "image": "images/menu/peanut-butter-banana-oats.jpg",
    "photoCredit": "Ella Olsson  from Stockholm, Sweden",
    "photoLicense": "CC BY 2.0",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Banana_Oatmeal_Breakfast_Bowl_(44302857265).jpg",
    "photoTitle": "Banana Oatmeal Breakfast Bowl (44302857265).jpg"
  },
  "Green goddess grain bowl": {
    "image": "images/menu/green-goddess-grain-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Roasted pumpkin quinoa bowl": {
    "image": "images/menu/roasted-pumpkin-quinoa-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Citrus beet & labneh bowl": {
    "image": "images/menu/citrus-beet-labneh-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Sesame soba noodle bowl": {
    "image": "images/menu/sesame-soba-noodle-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  },
  "Miso avocado rice bowl": {
    "image": "images/menu/miso-avocado-rice-bowl-ai.jpg",
    "photoCredit": "AI-generated",
    "photoLicense": "AI-generated",
    "photoSource": "OpenAI ImageGen",
    "photoTitle": "AI-generated menu photograph"
  }
};

window.BREW_MENU_ITEMS = menuGroups.flatMap(({ category, items }) => items.map(
  ([name, price, description, tag], index) => ({
    id: `${category}-${index + 1}`,
    name,
    price,
    description,
    tag,
    category,
    ...menuImageData[name],
  }),
));
