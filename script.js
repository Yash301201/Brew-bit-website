const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const bagButton = document.querySelector(".bag-button");
const bagCount = document.querySelector(".bag-count");
const toast = document.querySelector(".toast");
const bagDrawer = document.querySelector(".bag-drawer");
const bagBackdrop = document.querySelector(".bag-backdrop");
const bagItems = document.querySelector(".bag-items");
const bagEmpty = document.querySelector(".bag-empty");
const bagTotalValue = document.querySelector(".bag-total-value");
const bookingForm = document.querySelector("#booking-form");
const checkoutForm = document.querySelector("#checkout-form");
const reviewForm = document.querySelector("#review-form");
const cart = new Map();
const menuGrid = document.querySelector(".menu-grid");
const homeMenuGrid = document.querySelector(".home-menu-grid");
const galleryGrid = document.querySelector(".gallery-grid");
const menuFilters = document.querySelector(".menu-filters");
const menuSearchInput = document.querySelector(".menu-search-input");
const menuSort = document.querySelector(".menu-sort");
const menuResults = document.querySelector(".menu-results");
const menuLoadMore = document.querySelector(".menu-load-more");
const menuCategories = window.BREW_MENU_CATEGORIES;
const menuItems = window.BREW_MENU_ITEMS;
const menuItemsByName = new Map((menuItems || []).map((item) => [item.name, item]));
const CART_STORAGE_KEY = "brew-and-bite-bag";
const FAVORITES_STORAGE_KEY = "brew-and-bite-favourites";
const favorites = new Set();
const menuCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const menuPageSize = 20;
let selectedCategory = "all";
let searchTerm = "";
let visibleMenuItems = menuPageSize;
let revealObserver = null;
let toastTimeout;
let previousFocus;
let cafeConfig = null;

if (!Array.isArray(menuCategories) || !Array.isArray(menuItems) || menuItems.length < 100) {
  throw new Error("The café menu could not load. Check that menu-data.js is available and includes at least 100 items.");
}
if (menuItemsByName.size !== menuItems.length) {
  throw new Error("The café menu contains duplicate item names. Give every item a unique name before loading it.");
}
if (menuItems.some((item) => typeof item.image !== "string" || !item.image.startsWith("images/"))) {
  throw new Error("A menu item is missing its local food photo. Check its image in menu-data.js.");
}

document.querySelector(".current-year").textContent = String(new Date().getFullYear());

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

  document.body.classList.add("motion-ready");
  document.querySelectorAll(
    ".hero-copy, .hero-art, .section-heading, .story-photo, .story-content, .quote-section blockquote, .visit-copy, .visit-card, .newsletter-inner"
  ).forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}

function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.category = item.category;
  card.dataset.item = item.name;

  const image = document.createElement("div");
  image.className = "menu-image";
  const photo = document.createElement("img");
  photo.src = item.image;
  photo.alt = item.name;
  photo.loading = "lazy";
  photo.decoding = "async";
  photo.width = 1024;
  photo.height = 1024;
  photo.addEventListener("error", () => {
    image.classList.add("menu-image--missing");
    photo.remove();
  }, { once: true });
  const tag = document.createElement("span");
  tag.className = "card-tag";
  tag.textContent = item.tag;
  const favoriteButton = document.createElement("button");
  favoriteButton.className = "favorite-button";
  favoriteButton.type = "button";
  favoriteButton.dataset.favoriteItem = item.name;
  favoriteButton.setAttribute("aria-pressed", String(favorites.has(item.name)));
  favoriteButton.setAttribute("aria-label", `${favorites.has(item.name) ? "Remove" : "Save"} ${item.name} ${favorites.has(item.name) ? "from" : "to"} favourites`);
  favoriteButton.textContent = favorites.has(item.name) ? "♥" : "♡";
  image.append(photo, tag, favoriteButton);

  const info = document.createElement("div");
  info.className = "menu-card-info";
  const description = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = item.name;
  const ingredients = document.createElement("p");
  ingredients.textContent = item.description;
  description.append(name, ingredients);
  const price = document.createElement("span");
  price.className = "price";
  price.textContent = menuCurrency.format(item.price);
  info.append(description, price);

  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.type = "button";
  addButton.dataset.item = item.name;
  addButton.setAttribute("aria-label", `Add ${item.name} to your bag`);
  addButton.textContent = "+";
  card.append(image, info, addButton);
  if (revealObserver) {
    card.classList.add("reveal");
    revealObserver.observe(card);
  }
  return card;
}

const homeMenuItemNames = [
  "Pistachio rose cortado",
  "Miso mushroom scramble",
  "Roasted pepper mozzarella melt",
  "Mango passionfruit tart",
];

const galleryItemNames = [
  "Pistachio rose cortado",
  "Cappuccino",
  "Miso mushroom scramble",
  "Roasted pepper mozzarella melt",
  "Mango passionfruit tart",
  "Dark chocolate olive oil cake",
];

const menuPhotoOverrides = {
  "Pistachio rose cortado": "images/menu/pistachio-rose-cortado-featured.png",
  "Miso mushroom scramble": "images/menu/miso-mushroom-scramble-featured.png",
  "Roasted pepper mozzarella melt": "images/menu/roasted-pepper-mozzarella-melt-featured.png",
  "Mango passionfruit tart": "images/menu/mango-passionfruit-tart-featured.png",
};

function renderHomeMenuGrid() {
  if (!homeMenuGrid) return;
  const picks = homeMenuItemNames.map((name) => menuItemsByName.get(name)).filter(Boolean);
  homeMenuGrid.replaceChildren(...picks.map((item) => {
    const card = createMenuCard(item);
    const photo = card.querySelector(".menu-image > img");
    if (photo && menuPhotoOverrides[item.name]) photo.src = menuPhotoOverrides[item.name];
    return card;
  }));
}

function renderGallery() {
  if (!galleryGrid) return;
  const figures = galleryItemNames.map((name) => {
    const item = menuItemsByName.get(name);
    if (!item) return null;
    const figure = document.createElement("figure");
    figure.className = "gallery-item";
    const photo = document.createElement("img");
    photo.src = menuPhotoOverrides[item.name] || item.image;
    photo.alt = item.name;
    photo.loading = "lazy";
    photo.decoding = "async";
    const caption = document.createElement("figcaption");
    caption.textContent = item.name;
    figure.append(photo, caption);
    return figure;
  }).filter(Boolean);
  galleryGrid.replaceChildren(...figures);
}

function getFilteredMenuItems() {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const categoryLabels = new Map(menuCategories.map((category) => [category.id, category.label]));
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all"
      || (selectedCategory === "saved" ? favorites.has(item.name) : item.category === selectedCategory);
    const searchContent = `${item.name} ${item.description} ${item.tag} ${categoryLabels.get(item.category) || ""}`;
    return matchesCategory && (!normalizedSearch || searchContent.toLocaleLowerCase().includes(normalizedSearch));
  });

  if (menuSort.value === "price-ascending") filteredItems.sort((a, b) => a.price - b.price);
  if (menuSort.value === "price-descending") filteredItems.sort((a, b) => b.price - a.price);
  if (menuSort.value === "name") filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  return filteredItems;
}

function renderMenuCatalog() {
  const filteredItems = getFilteredMenuItems();
  const displayedItems = filteredItems.slice(0, visibleMenuItems);
  menuGrid.replaceChildren(...displayedItems.map(createMenuCard));
  menuResults.textContent = filteredItems.length === 0
    ? selectedCategory === "saved" && !searchTerm.trim()
      ? "No saved favourites yet. Tap a heart on any menu item to keep it here."
      : "No menu items found. Try another search or category."
    : `Showing ${displayedItems.length} of ${filteredItems.length} café favourites`;
  menuLoadMore.hidden = displayedItems.length >= filteredItems.length;
  menuLoadMore.textContent = `Show ${Math.min(menuPageSize, filteredItems.length - displayedItems.length)} more favourites ↓`;
  savedFilterButton.textContent = favorites.size ? `Saved (${favorites.size})` : "Saved";
}

function selectMenuCategory(categoryId) {
  selectedCategory = categoryId;
  visibleMenuItems = menuPageSize;
  menuFilters.querySelectorAll(".filter-button").forEach((button) => {
    const isSelected = button.dataset.filter === categoryId;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  renderMenuCatalog();
}

const allCategoryButton = menuFilters.querySelector('[data-filter="all"]');
allCategoryButton.setAttribute("aria-controls", "menu-grid");
menuGrid.id = "menu-grid";
menuCategories.forEach((category) => {
  const button = document.createElement("button");
  button.className = "filter-button";
  button.type = "button";
  button.dataset.filter = category.id;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-controls", "menu-grid");
  button.textContent = category.label;
  menuFilters.append(button);
});
const savedFilterButton = document.createElement("button");
savedFilterButton.className = "filter-button saved-filter-button";
savedFilterButton.type = "button";
savedFilterButton.dataset.filter = "saved";
savedFilterButton.setAttribute("aria-pressed", "false");
savedFilterButton.setAttribute("aria-controls", "menu-grid");
savedFilterButton.textContent = "Saved";
menuFilters.append(savedFilterButton);

function restoreFavorites() {
  try {
    const savedNames = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedNames)) return;
    savedNames.forEach((name) => {
      if (typeof name === "string" && menuItemsByName.has(name)) favorites.add(name);
    });
  } catch {
    // Keep favourites available for this page even when browser storage is unavailable.
  }
}

function persistFavorites() {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Keep the menu usable when browser storage is unavailable.
  }
}

restoreFavorites();
renderHomeMenuGrid();
renderGallery();
renderMenuCatalog();
const heroVideo = document.querySelector(".hero-photo");
if (heroVideo instanceof HTMLVideoElement && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

function getCartCount() {
  return [...cart.values()].reduce((total, item) => total + item.quantity, 0);
}

function formatPrice(price) {
  return menuCurrency.format(price);
}

function persistCart() {
  try {
    const savedItems = [...cart.values()].map(({ name, quantity }) => ({ name, quantity }));
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(savedItems));
  } catch {
    // Keep the bag usable when browser storage is unavailable.
  }
}

function restoreCart() {
  try {
    const savedItems = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedItems)) return;

    savedItems.forEach((savedItem) => {
      const name = typeof savedItem?.name === "string" ? savedItem.name : "";
      const quantity = Number(savedItem?.quantity);
      const price = getItemPrice(name);
      if (price === null || !Number.isInteger(quantity) || quantity < 1) return;
      cart.set(name, { name, price, quantity: Math.min(quantity, 99) });
    });
  } catch {
    // Ignore old or unavailable browser storage and start with an empty bag.
  }
}

function renderCart() {
  const count = getCartCount();
  bagCount.textContent = String(count);
  bagButton.setAttribute("aria-label", `Your bag, ${count} ${count === 1 ? "item" : "items"}`);
  bagItems.replaceChildren();
  bagEmpty.hidden = cart.size > 0;

  let total = 0;
  cart.forEach((item, name) => {
    total += item.price * item.quantity;
    const row = document.createElement("article");
    row.className = "bag-item";

    const details = document.createElement("div");
    details.className = "bag-item-details";
    const title = document.createElement("h3");
    title.textContent = name;
    const price = document.createElement("span");
    price.textContent = `${formatPrice(item.price)} each`;
    details.append(title, price);

    const controls = document.createElement("div");
    controls.className = "bag-item-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.item = name;
    decrease.setAttribute("aria-label", `Remove one ${name}`);
    decrease.textContent = "−";
    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);
    quantity.setAttribute("aria-label", `Quantity ${item.quantity}`);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.item = name;
    increase.setAttribute("aria-label", `Add one ${name}`);
    increase.textContent = "+";
    controls.append(decrease, quantity, increase);

    const lineTotal = document.createElement("strong");
    lineTotal.className = "bag-line-total";
    lineTotal.textContent = formatPrice(item.price * item.quantity);
    row.append(details, controls, lineTotal);
    bagItems.append(row);
  });

  bagTotalValue.textContent = formatPrice(total);
  checkoutForm.querySelector(".checkout-submit").disabled = cart.size === 0;
  if (cart.size === 0) document.querySelector("#checkout-message").textContent = "Add a menu item before placing an order.";
  persistCart();
}

function setBagOpen(isOpen) {
  if (isOpen) previousFocus = document.activeElement;

  bagDrawer.classList.toggle("is-open", isOpen);
  bagDrawer.setAttribute("aria-hidden", String(!isOpen));
  bagDrawer.inert = !isOpen;
  bagBackdrop.hidden = !isOpen;
  bagButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("bag-open", isOpen);
  document.querySelectorAll("main, .site-footer").forEach((element) => {
    element.inert = isOpen;
  });

  if (isOpen) {
    bagDrawer.querySelector(".bag-close").focus();
  } else if (previousFocus instanceof HTMLElement) {
    previousFocus.focus();
  }
}

function getItemPrice(itemName) {
  const price = Number(menuItemsByName.get(itemName)?.price);
  return Number.isFinite(price) && price > 0 ? price : null;
}

restoreCart();
renderCart();

window.addEventListener("brew:bag:add", (event) => {
  const itemName = event.detail?.itemName;
  if (typeof itemName !== "string" || !itemName) {
    console.error("A menu item could not be added because its name is missing.");
    return;
  }

  const price = getItemPrice(itemName);
  if (price === null) {
    console.error(`Could not add "${itemName}" because its price is missing or invalid.`);
    return;
  }

  const item = cart.get(itemName) || { name: itemName, price, quantity: 0 };
  item.quantity += 1;
  cart.set(itemName, item);
  renderCart();
  showToast(`${itemName} added to your bag`);
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("is-open", !isExpanded);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("is-open");
  });
});

menuFilters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");
  if (button) selectMenuCategory(button.dataset.filter);
});

menuSearchInput.addEventListener("input", () => {
  searchTerm = menuSearchInput.value;
  visibleMenuItems = menuPageSize;
  renderMenuCatalog();
});
menuSort.addEventListener("change", renderMenuCatalog);
menuLoadMore.addEventListener("click", () => {
  visibleMenuItems += menuPageSize;
  renderMenuCatalog();
});
document.querySelector("#surprise-pick").addEventListener("click", () => {
  const filteredItems = getFilteredMenuItems();
  if (filteredItems.length === 0) {
    showToast("Save a favourite or change your filters to find a little surprise.");
    return;
  }

  const pickedIndex = Math.floor(Math.random() * filteredItems.length);
  const pickedItem = filteredItems[pickedIndex];
  visibleMenuItems = Math.max(visibleMenuItems, pickedIndex + 1);
  renderMenuCatalog();
  const pickedCard = [...menuGrid.querySelectorAll(".menu-card")].find((card) => card.dataset.item === pickedItem.name);
  if (!pickedCard) return;

  pickedCard.classList.add("is-picked");
  pickedCard.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  showToast(`Your little surprise: ${pickedItem.name}`);
  window.setTimeout(() => pickedCard.classList.remove("is-picked"), 2400);
});
document.querySelectorAll(".hero-shortcuts [data-quick-filter], .home-menu-shortcuts [data-quick-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    menuSearchInput.value = "";
    searchTerm = "";
    selectMenuCategory(button.dataset.quickFilter);
    document.querySelector("#menu").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  });
});
function handleMenuGridClick(event) {
  const favoriteButton = event.target.closest(".favorite-button");
  if (favoriteButton) {
    const focusGroup = favoriteButton.closest(".menu-grid, .home-menu-grid");
    const itemName = favoriteButton.dataset.favoriteItem;
    if (favorites.has(itemName)) favorites.delete(itemName);
    else favorites.add(itemName);
    persistFavorites();
    renderMenuCatalog();
    document.querySelectorAll(".favorite-button").forEach((button) => {
      const isSaved = favorites.has(button.dataset.favoriteItem);
      button.setAttribute("aria-pressed", String(isSaved));
      button.setAttribute("aria-label", `${isSaved ? "Remove" : "Save"} ${button.dataset.favoriteItem} ${isSaved ? "from" : "to"} favourites`);
      button.textContent = isSaved ? "♥" : "♡";
    });
    const nextFavoriteButton = [...(focusGroup?.querySelectorAll(".favorite-button") || [])].find((button) => button.dataset.favoriteItem === itemName);
    (nextFavoriteButton || savedFilterButton).focus();
    showToast(`${itemName} ${favorites.has(itemName) ? "saved to" : "removed from"} favourites`);
    return;
  }

  const button = event.target.closest(".add-button");
  if (!button) return;
  window.dispatchEvent(new CustomEvent("brew:bag:add", {
    detail: { itemName: button.dataset.item },
  }));
}

menuGrid.addEventListener("click", handleMenuGridClick);
homeMenuGrid?.addEventListener("click", handleMenuGridClick);

bagButton.addEventListener("click", () => {
  setBagOpen(true);
});

bagDrawer.querySelector(".bag-close").addEventListener("click", () => setBagOpen(false));
bagBackdrop.addEventListener("click", () => setBagOpen(false));
document.addEventListener("focusin", (event) => {
  if (bagDrawer.classList.contains("is-open") && !bagDrawer.contains(event.target)) {
    bagDrawer.querySelector(".bag-close").focus();
  }
});
bagItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-cart-action]");
  if (!button) return;

  const item = cart.get(button.dataset.item);
  if (!item) return;

  if (button.dataset.cartAction === "increase") {
    item.quantity += 1;
  } else {
    item.quantity -= 1;
    if (item.quantity <= 0) cart.delete(button.dataset.item);
  }
  renderCart();
});

document.addEventListener("keydown", (event) => {
  if (!bagDrawer.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    setBagOpen(false);
    return;
  }

  if (event.key === "Tab") {
    const focusableElements = [...bagDrawer.querySelectorAll("button:not([disabled]), a[href]")];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!bagDrawer.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? lastElement : firstElement).focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

bagDrawer.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setBagOpen(false));
});

function toLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const bookingMessage = document.querySelector(".booking-message");
const checkoutMessage = document.querySelector("#checkout-message");
const reviewMessage = document.querySelector("#review-form-message");
const onlinePaymentInput = checkoutForm.querySelector('input[value="RAZORPAY"]');
const onlinePaymentLabel = onlinePaymentInput.closest("label");

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Please try again in a moment.");
  return data;
}

function currentCafeTime() {
  const timeZone = cafeConfig?.booking?.timeZone || "Asia/Kolkata";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function setBookingTimeOptions() {
  const select = bookingForm.elements.time;
  const booking = cafeConfig?.booking;
  if (!booking) return;
  const opening = booking.openTime.split(":").map(Number);
  const closing = booking.closeTime.split(":").map(Number);
  const start = opening[0] * 60 + opening[1];
  const end = closing[0] * 60 + closing[1];
  const selectedDate = bookingForm.elements.date.value;
  const now = currentCafeTime();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a time";
  placeholder.selected = true;
  select.replaceChildren(placeholder);
  for (let minutes = start; minutes < end; minutes += booking.slotMinutes) {
    const hours = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = String(hours).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
    const option = document.createElement("option");
    option.value = value;
    option.textContent = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(2000, 0, 1, hours, minute));
    option.disabled = selectedDate === booking.today && minutes <= now;
    select.append(option);
  }
  if (!select.value) select.value = "";
}

function setBookingConfig(config) {
  cafeConfig = config;
  const date = bookingForm.elements.date;
  date.min = config.booking.today;
  date.max = config.booking.latestDate;
  setBookingTimeOptions();
  onlinePaymentInput.disabled = !config.payments.onlineAvailable;
  onlinePaymentLabel.classList.toggle("is-disabled", !config.payments.onlineAvailable);
  onlinePaymentLabel.title = config.payments.onlineAvailable ? "" : "Online payment is not configured yet.";
}

bookingForm.elements.date.addEventListener("change", setBookingTimeOptions);
bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const submit = bookingForm.querySelector(".booking-submit");
  submit.disabled = true;
  bookingMessage.textContent = "Checking table availability…";
  const formData = new FormData(bookingForm);
  try {
    const result = await apiRequest("/api/bookings", { method: "POST", body: JSON.stringify(Object.fromEntries(formData)) });
    const booking = result.booking;
    bookingMessage.textContent = "Table confirmed for " + booking.guests + " guest" + (booking.guests === 1 ? "" : "s") + " on " + booking.date + " at " + booking.time + ". Your reference is " + booking.reference + ". Save it for your visit.";
    try { window.localStorage.setItem("brew-bite-last-booking", JSON.stringify({ reference: booking.reference, email: formData.get("email"), phone: formData.get("phone") })); } catch {}
    checkoutForm.elements.bookingReference.value = booking.reference;
    ["name", "email", "phone"].forEach((key) => {
      if (!checkoutForm.elements[key].value) checkoutForm.elements[key].value = String(formData.get(key) || "");
    });
    bookingForm.reset();
    setBookingTimeOptions();
    showToast("Your table is reserved.");
  } catch (error) {
    bookingMessage.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

async function loadRazorpayCheckout() {
  if (window.Razorpay) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Online checkout could not load. Please choose pay at café or try again."));
    document.head.append(script);
  });
}

function emptyCartAfterOrder() {
  cart.clear();
  renderCart();
  setBagOpen(false);
}

function showOrderConfirmation(reference, paymentState) {
  const notice = document.querySelector("#customer-order-confirmation");
  notice.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = paymentState === "CAPTURED" ? "Payment received — your order is confirmed." : "Your order is with the café.";
  const details = document.createElement("span");
  details.textContent = "Order reference " + reference + ". " + (paymentState === "CAPTURED"
    ? "Keep this reference for your visit."
    : "Payment is due at the café. Keep this reference for pickup or your table.");
  notice.append(title, details);
  notice.hidden = false;
  notice.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
}

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cart.size || !checkoutForm.reportValidity()) return;
  const submit = checkoutForm.querySelector(".checkout-submit");
  submit.disabled = true;
  checkoutMessage.textContent = "Saving your order…";
  const formData = Object.fromEntries(new FormData(checkoutForm));
  const items = [...cart.values()].map((item) => ({ name: item.name, quantity: item.quantity }));
  try {
    const result = await apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify({ ...formData, items }),
    });
    if (!result.checkout) {
      showOrderConfirmation(result.order.reference, "PAY_AT_CAFE");
      showToast("Order placed: " + result.order.reference);
      emptyCartAfterOrder();
      return;
    }
    checkoutMessage.textContent = "Order " + result.order.reference + " is ready. Complete payment in the secure checkout.";
    await loadRazorpayCheckout();
    const payment = new window.Razorpay({
      key: result.checkout.keyId,
      order_id: result.checkout.orderId,
      amount: result.checkout.amount,
      currency: result.checkout.currency,
      name: result.checkout.cafeName,
      description: "Café order " + result.order.reference,
      prefill: {
        name: result.checkout.customer.name,
        email: result.checkout.customer.email,
        contact: result.checkout.customer.phone,
      },
      theme: { color: "#244536" },
      handler: async (response) => {
        checkoutMessage.textContent = "Checking your payment with the café…";
        try {
          const verification = await apiRequest("/api/payments/verify", {
            method: "POST",
            body: JSON.stringify({ orderId: result.order.id, ...response }),
          });
          if (verification.status === "CAPTURED") {
            showOrderConfirmation(verification.reference, "CAPTURED");
            showToast("Payment received · " + verification.reference);
            emptyCartAfterOrder();
          } else {
            checkoutMessage.textContent = "Payment is " + verification.status.toLowerCase() + ". Keep order reference " + verification.reference + " and contact the café if it does not update.";
          }
        } catch (error) {
          checkoutMessage.textContent = error.message + " Keep order reference " + result.order.reference + ".";
        }
      },
      modal: {
        ondismiss: () => {
          checkoutMessage.textContent = "Checkout closed. Order " + result.order.reference + " is unpaid; you can retry with the same items or choose pay at café.";
          submit.disabled = false;
        },
      },
    });
    payment.on("payment.failed", (response) => {
      const description = response.error?.description || "Payment did not complete.";
      checkoutMessage.textContent = description + " Your order reference is " + result.order.reference + ".";
      submit.disabled = false;
    });
    payment.open();
  } catch (error) {
    checkoutMessage.textContent = error.message;
    submit.disabled = false;
  }
});

onlinePaymentInput.addEventListener("change", () => {
  checkoutMessage.textContent = onlinePaymentInput.checked
    ? "The secure checkout will show payment methods enabled for the café's account."
    : "Your order will be recorded and the café will collect payment in person.";
});

async function loadGuestReviews() {
  const target = document.querySelector("#guest-review-list");
  try {
    const result = await apiRequest("/api/reviews");
    target.replaceChildren();
    if (!result.reviews.length) {
      const note = document.createElement("p");
      note.textContent = "Be the first guest to share a café moment.";
      target.append(note);
      return;
    }
    result.reviews.forEach((review) => {
      const card = document.createElement("article");
      card.className = "guest-review-card";
      const heading = document.createElement("div");
      heading.className = "guest-review-card-heading";
      const name = document.createElement("strong");
      name.textContent = review.name;
      const stars = document.createElement("span");
      stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      stars.setAttribute("aria-label", review.rating + " out of 5 stars");
      heading.append(name, stars);
      const comment = document.createElement("p");
      comment.textContent = review.comment;
      card.append(heading, comment);
      target.append(card);
    });
  } catch {
    target.textContent = "Guest reviews need the café server and are unavailable in this preview.";
    reviewForm.querySelector('button[type="submit"]').disabled = true;
  }
}

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!reviewForm.reportValidity()) return;
  const submit = reviewForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  reviewMessage.textContent = "Sending your review…";
  try {
    const result = await apiRequest("/api/reviews", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(reviewForm))),
    });
    reviewMessage.textContent = result.message;
    reviewForm.reset();
  } catch (error) {
    reviewMessage.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

async function syncMenuAndConfig() {
  try {
    const [menu, config] = await Promise.all([apiRequest("/api/menu"), apiRequest("/api/config")]);
    menuItems.splice(0, menuItems.length, ...menu.items);
    menuCategories.splice(0, menuCategories.length, ...menu.categories);
    menuItemsByName.clear();
    menuItems.forEach((item) => menuItemsByName.set(item.name, item));
    cart.forEach((item, name) => {
      const currentPrice = getItemPrice(name);
      if (currentPrice === null) cart.delete(name);
      else item.price = currentPrice;
    });
    setBookingConfig(config);
    renderHomeMenuGrid();
    renderGallery();
    renderMenuCatalog();
    renderCart();
    if (!config.payments.onlineAvailable) {
      checkoutMessage.textContent = "Online checkout is not set up yet. Choose pay at café to place an order.";
    }
  } catch {
    bookingMessage.textContent = "View-only preview: table bookings need the café server.";
    checkoutMessage.textContent = "View-only preview: orders need the café server.";
    bookingForm.querySelector(".booking-submit").disabled = true;
    checkoutForm.querySelector(".checkout-submit").disabled = true;
    reviewForm.querySelector('button[type="submit"]').disabled = true;
    onlinePaymentInput.disabled = true;
    onlinePaymentLabel.hidden = true;
    document.querySelector('.site-footer a[href="/admin"]')?.remove();
  }
}

syncMenuAndConfig();
loadGuestReviews();

