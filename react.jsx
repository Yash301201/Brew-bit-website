const featureItems = [
  {
    name: "Kimchi cheddar scone",
    category: "Bakery",
    price: 225,
    description: "Flaky savoury scone with aged cheddar, kimchi, scallions, and toasted sesame.",
    photo: "images/featured/kimchi-cheddar-scone.jpg",
    note: "Baked in small batches",
  },
  {
    name: "Cardamom pear galette",
    category: "Cakes & desserts",
    price: 320,
    description: "Brown-butter pastry, ripe pear, cardamom, toasted walnuts, and fresh thyme.",
    photo: "images/featured/cardamom-pear-galette.jpg",
    note: "Sweet meets savoury",
  },
  {
    name: "Parmesan polenta bites",
    category: "Small plates",
    price: 340,
    description: "Crisp polenta with whipped ricotta, house tomato jam, and fresh basil.",
    photo: "images/menu/parmesan-polenta-bites.jpg",
    note: "Crisp & golden",
  },
  {
    name: "Coconut lime chia cup",
    category: "Bowls & yoghurt",
    price: 275,
    description: "Coconut cream, chia, ripe mango, lime zest, and toasted coconut.",
    photo: "images/menu/coconut-lime-chia-bowl.jpg",
    note: "Chilled & refreshing",
  },
];

const h = React.createElement;

function FeaturedSpecial() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const item = featureItems[activeIndex];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  React.useEffect(() => {
    if (paused || prefersReducedMotion.matches) return undefined;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((currentIndex) => (currentIndex + 1) % featureItems.length);
      }
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [paused]);

  function moveTo(offset) {
    setActiveIndex((currentIndex) => (
      (currentIndex + offset + featureItems.length) % featureItems.length
    ));
  }

  function addToBag() {
    window.dispatchEvent(new CustomEvent("brew:bag:add", {
      detail: { itemName: item.name },
    }));
  }

  return h("div", {
    className: "featured-showcase",
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
    },
  },
  h("div", { className: "featured-copy" },
    h("p", { className: "eyebrow" },
      h("span", { className: "eyebrow-line" }),
      "Fresh from our kitchen",
    ),
    h("h2", { id: "featured-heading" },
      "A little bite,",
      h("br"),
      h("em", null, "a lot of love."),
    ),
    h("p", { className: "featured-intro" },
      "Meet a Brew & Bite special: made in small batches, packed with flavour, and ready to brighten your coffee break.",
    ),
    h("div", { className: "featured-product", key: item.name },
      h("div", { className: "featured-product-topline" },
        h("span", { className: "featured-category" }, item.category),
        h("span", { className: "featured-price" }, `₹${item.price}`),
      ),
      h("h3", { className: "featured-name" }, item.name),
      h("p", { className: "featured-description" }, item.description),
      h("button", { className: "button button-dark featured-add", type: "button", onClick: addToBag },
        "Add to your bag ",
        h("span", { "aria-hidden": "true" }, "+"),
      ),
    ),
    h("div", { className: "featured-controls", "aria-label": "Featured café treats" },
      h("button", { className: "featured-arrow", type: "button", "aria-label": "Previous café favourite", onClick: () => moveTo(-1) }, "←"),
      h("div", { className: "featured-dots" },
        featureItems.map((feature, index) => h("button", {
          className: `featured-dot${index === activeIndex ? " is-active" : ""}`,
          type: "button",
          "aria-label": `Show ${feature.name}`,
          "aria-current": index === activeIndex ? "true" : undefined,
          key: feature.name,
          onClick: () => setActiveIndex(index),
        })),
      ),
      h("button", { className: "featured-arrow", type: "button", "aria-label": "Next café favourite", onClick: () => moveTo(1) }, "→"),
      h("span", { className: "featured-count", "aria-hidden": "true" }, `0${activeIndex + 1} / 0${featureItems.length}`),
    ),
  ),
  h("div", { className: "featured-art", key: item.name },
    h("div", { className: "featured-photo" },
      h("img", { src: item.photo, alt: item.name, loading: "lazy", decoding: "async", width: 1024, height: 1024 }),
    ),
    h("div", { className: "featured-sticker" },
      h("span", { className: "featured-sticker-star", "aria-hidden": "true" }, "✳"),
      h("span", null, item.note),
    ),
    h("a", { className: "featured-menu-link", href: "#menu" }, "Explore all the good stuff ", h("span", { "aria-hidden": "true" }, "↗")),
  ));
}

const featuredRoot = document.getElementById("featured-root");
if (featuredRoot && window.ReactDOM?.createRoot) {
  ReactDOM.createRoot(featuredRoot).render(h(FeaturedSpecial));
}
