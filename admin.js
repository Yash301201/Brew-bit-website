const loginPanel = document.querySelector("#login-panel");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const setupHint = document.querySelector("#setup-hint");
const dashboardMessage = document.querySelector("#dashboard-message");
const panels = [...document.querySelectorAll(".panel")];
let csrfToken = "";

function money(paise) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format((Number(paise) || 0) / 100);
}

function dateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function make(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (options.method && options.method !== "GET" && csrfToken) headers.set("X-CSRF-Token", csrfToken);
  const response = await fetch(url, { credentials: "same-origin", ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

function showMessage(message, isError = true) {
  dashboardMessage.textContent = message;
  dashboardMessage.hidden = !message;
  dashboardMessage.classList.toggle("notice-error", isError);
  if (message) window.scrollTo({ top: 0, behavior: "smooth" });
}

function setSignedIn(isSignedIn, email = "") {
  loginPanel.hidden = isSignedIn;
  dashboard.hidden = !isSignedIn;
  if (isSignedIn) {
    document.querySelector("#owner-email").textContent = email;
    refreshAll().catch((error) => showMessage(error.message));
  }
}

function selectPanel(name) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    const active = button.dataset.panel === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === "panel-" + name));
}

document.querySelectorAll(".tab-button").forEach((button) => button.addEventListener("click", () => {
  selectPanel(button.dataset.panel);
  refreshAll().catch((error) => showMessage(error.message));
}));

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "Signing in…";
  const data = Object.fromEntries(new FormData(loginForm));
  try {
    const result = await request("/api/admin/login", { method: "POST", body: JSON.stringify(data) });
    csrfToken = result.csrfToken;
    loginForm.reset();
    loginMessage.textContent = "";
    setSignedIn(true, result.email);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

async function refreshAll() {
  showMessage("");
  const [summaryResult, orderResult, bookingResult, reviewResult, menuResult, health] = await Promise.all([
    request("/api/admin/summary"),
    request("/api/admin/orders"),
    request("/api/admin/bookings"),
    request("/api/admin/reviews"),
    request("/api/admin/menu"),
    request("/api/health"),
  ]);
  document.querySelector("#payment-notice").hidden = health.onlinePayments;
  if (!health.onlinePayments) document.querySelector("#payment-notice").textContent = "Online checkout is not configured. Customers can place pay-at-café orders; add Razorpay test credentials to .env to try UPI, cards, net banking and enabled wallets.";
  renderSummary(summaryResult.summary, summaryResult.topItems);
  renderOrders(orderResult.orders);
  renderBookings(bookingResult.bookings);
  renderReviews(reviewResult.reviews);
  renderMenu(menuResult.items);
}

document.querySelector("#refresh-button").addEventListener("click", () => refreshAll().catch((error) => showMessage(error.message)));

function renderSummary(summary, popular) {
  document.querySelector("#sales-today").textContent = money(summary.today.salesPaise);
  document.querySelector("#captured-count").textContent = summary.today.capturedPayments + " captured payments";
  document.querySelector("#pending-orders").textContent = summary.pendingOrders;
  document.querySelector("#upcoming-bookings").textContent = summary.upcomingBookings;
  document.querySelector("#pending-reviews").textContent = summary.pendingReviews;
  const list = document.querySelector("#top-items");
  list.replaceChildren();
  if (!popular.length) list.append(make("li", "", "Sales will appear here after an order is paid."));
  popular.forEach((item) => {
    const row = make("li");
    row.append(document.createTextNode(item.name));
    row.append(make("span", "", item.quantity + " sold"));
    list.append(row);
  });
  drawSales(summary.days || []);
}

function drawSales(days) {
  const canvas = document.querySelector("#sales-chart");
  const width = Math.max(300, canvas.clientWidth || 600);
  const height = 240;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.height = height + "px";
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  const values = days.map((day) => day.salesPaise / 100);
  const max = Math.max(100, ...values);
  const left = 36, right = 12, top = 18, bottom = 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  context.font = "10px DM Sans, Arial";
  context.textAlign = "right";
  context.fillStyle = "#74685e";
  for (let tick = 0; tick <= 3; tick += 1) {
    const y = top + plotHeight - (plotHeight * tick / 3);
    context.strokeStyle = "rgba(36,27,20,.09)";
    context.beginPath(); context.moveTo(left, y); context.lineTo(width - right, y); context.stroke();
    context.fillText(tick === 0 ? "0" : "₹" + Math.round(max * tick / 3), left - 7, y + 3);
  }
  const barWidth = Math.min(38, plotWidth / Math.max(1, days.length) * .52);
  days.forEach((day, index) => {
    const x = left + plotWidth * (index + .5) / Math.max(1, days.length);
    const barHeight = plotHeight * (values[index] / max);
    context.fillStyle = "#a85f29";
    context.beginPath();
    if (context.roundRect) context.roundRect(x - barWidth / 2, top + plotHeight - barHeight, barWidth, barHeight, 5);
    else context.rect(x - barWidth / 2, top + plotHeight - barHeight, barWidth, barHeight);
    context.fill();
    context.textAlign = "center";
    context.fillStyle = "#74685e";
    context.fillText(day.date.slice(5), x, height - 10);
  });
}

function badge(text, paid = false) {
  return make("span", "payment-state" + (paid ? " is-paid" : ""), text);
}

function renderOrders(orders) {
  const body = document.querySelector("#orders-body");
  body.replaceChildren();
  document.querySelector("#orders-empty").hidden = orders.length > 0;
  orders.forEach((order) => {
    const row = make("tr");
    const ref = make("td");
    ref.append(make("strong", "", order.reference), make("small", "", dateTime(order.createdAt)));
    const customer = make("td");
    customer.append(make("strong", "", order.customer.name), make("small", "", order.customer.email), make("small", "", order.customer.phone));
    const items = make("td", "order-items");
    order.items.forEach((item) => items.append(make("div", "", item.quantity + " × " + item.name)));
    const payment = make("td");
    payment.append(make("strong", "", money(order.totalPaise)));
    const latestPayment = order.payments[0];
    payment.append(badge(latestPayment ? latestPayment.status.replaceAll("_", " ") : "NO PAYMENT", latestPayment?.status === "CAPTURED"));
    if (latestPayment) payment.append(make("small", "", latestPayment.method.replaceAll("_", " ") + (latestPayment.providerPaymentId ? " · " + latestPayment.providerPaymentId : "")));
    const service = make("td");
    const select = make("select", "status-select");
    ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].forEach((status) => {
      const option = make("option", "", status.replaceAll("_", " "));
      option.value = status; option.selected = status === order.status; select.append(option);
    });
    service.append(select);
    const actions = make("td");
    const actionWrap = make("div", "row-actions");
    const save = make("button", "small-button", "Update status");
    save.type = "button";
    save.addEventListener("click", async () => {
      try { await request("/api/admin/orders/" + order.id, { method: "PATCH", body: JSON.stringify({ status: select.value }) }); showMessage("Order updated."); await refreshAll(); }
      catch (error) { showMessage(error.message); }
    });
    actionWrap.append(save);
    if (latestPayment?.provider === "OFFLINE" && latestPayment.status === "PENDING") {
      const methodSelect = make("select", "status-select");
      [["CASH", "Cash"], ["UPI", "UPI"], ["CARD", "Card"]].forEach(([value, label]) => {
        const option = make("option", "", label); option.value = value; methodSelect.append(option);
      });
      const collect = make("button", "small-button", "Record payment");
      collect.type = "button";
      collect.addEventListener("click", async () => {
        try { await request("/api/admin/orders/" + order.id + "/collect", { method: "POST", body: JSON.stringify({ method: methodSelect.value }) }); showMessage("Payment recorded."); await refreshAll(); }
        catch (error) { showMessage(error.message); }
      });
      actionWrap.append(methodSelect, collect);
    }
    actions.append(actionWrap);
    row.append(ref, customer, items, payment, service, actions);
    body.append(row);
  });
}

function renderBookings(bookings) {
  const body = document.querySelector("#bookings-body");
  body.replaceChildren();
  document.querySelector("#bookings-empty").hidden = bookings.length > 0;
  bookings.forEach((booking) => {
    const row = make("tr");
    const ref = make("td"); ref.append(make("strong", "", booking.reference), make("small", "", dateTime(booking.createdAt)));
    const when = make("td"); when.append(make("strong", "", booking.date), make("small", "", booking.time));
    const guest = make("td"); guest.append(make("strong", "", booking.name), make("small", "", booking.email), make("small", "", booking.phone));
    const party = make("td", "", booking.guests + (booking.guests === 1 ? " guest" : " guests"));
    const notes = make("td", "", booking.notes || "—");
    const statusCell = make("td");
    const select = make("select", "status-select");
    ["CONFIRMED", "SEATED", "COMPLETED", "CANCELLED"].forEach((status) => {
      const option = make("option", "", status); option.value = status; option.selected = status === booking.status; select.append(option);
    });
    const save = make("button", "small-button", "Save");
    save.type = "button";
    save.addEventListener("click", async () => {
      try { await request("/api/admin/bookings/" + booking.id, { method: "PATCH", body: JSON.stringify({ status: select.value }) }); showMessage("Booking updated."); await refreshAll(); }
      catch (error) { showMessage(error.message); }
    });
    statusCell.append(select, save);
    row.append(ref, when, guest, party, notes, statusCell);
    body.append(row);
  });
}

function renderReviews(reviews) {
  const list = document.querySelector("#reviews-list");
  list.replaceChildren();
  document.querySelector("#reviews-empty").hidden = reviews.length > 0;
  reviews.forEach((review) => {
    const card = make("article", "review-card");
    const header = make("div", "review-card-header");
    const author = make("div"); author.append(make("strong", "", review.displayName), make("small", "", dateTime(review.createdAt)));
    header.append(author, make("span", "review-stars", "★".repeat(review.rating) + "☆".repeat(5 - review.rating)));
    const status = badge(review.status, review.status === "APPROVED");
    card.append(header, status, make("p", "review-comment", review.comment));
    if (review.status === "PENDING") {
      const actions = make("div", "review-actions");
      [["APPROVED", "Approve"], ["REJECTED", "Reject"]].forEach(([value, label]) => {
        const button = make("button", "small-button", label); button.type = "button";
        button.addEventListener("click", async () => {
          try { await request("/api/admin/reviews/" + review.id, { method: "PATCH", body: JSON.stringify({ status: value }) }); showMessage("Review moderation saved."); await refreshAll(); }
          catch (error) { showMessage(error.message); }
        });
        actions.append(button);
      });
      card.append(actions);
    }
    list.append(card);
  });
}

function renderMenu(items) {
  const list = document.querySelector("#menu-admin-list");
  list.replaceChildren();
  items.forEach((item) => {
    const row = make("article", "menu-admin-row");
    const image = make("img"); image.src = item.image; image.alt = "";
    const title = make("div"); title.append(make("strong", "", item.name), make("small", "", item.category.replaceAll("-", " ")));
    const price = make("input", "menu-price"); price.type = "number"; price.min = "1"; price.step = "1"; price.value = String(item.pricePaise / 100); price.setAttribute("aria-label", "Price for " + item.name);
    const priceButton = make("button", "small-button", "Save price"); priceButton.type = "button";
    priceButton.addEventListener("click", async () => {
      try { await request("/api/admin/menu/" + item.id, { method: "PATCH", body: JSON.stringify({ price: price.value }) }); showMessage(item.name + " price updated."); await refreshAll(); }
      catch (error) { showMessage(error.message); }
    });
    const availability = make("button", "small-button", item.active ? "Available" : "Paused");
    availability.type = "button";
    availability.setAttribute("aria-pressed", String(item.active));
    availability.addEventListener("click", async () => {
      try { await request("/api/admin/menu/" + item.id, { method: "PATCH", body: JSON.stringify({ active: !item.active }) }); showMessage(item.name + " availability updated."); await refreshAll(); }
      catch (error) { showMessage(error.message); }
    });
    row.append(image, title, price, priceButton, availability);
    list.append(row);
  });
}

document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await request("/api/admin/logout", { method: "POST", body: "{}" }); csrfToken = ""; setSignedIn(false); }
  catch (error) { showMessage(error.message); }
});

document.querySelector("#password-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#password-message");
  message.textContent = "Updating password…";
  try {
    const response = await request("/api/admin/profile/password", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    message.textContent = response.message; form.reset();
  } catch (error) { message.textContent = error.message; }
});

window.addEventListener("resize", () => {
  if (!dashboard.hidden) request("/api/admin/summary").then((data) => drawSales(data.summary.days)).catch(() => {});
});

request("/api/admin/me").then((result) => {
  if (result.authenticated) {
    csrfToken = result.csrfToken;
    setSignedIn(true, result.email);
  } else {
    setSignedIn(false);
    if (!result.configured) setupHint.hidden = false;
  }
}).catch((error) => {
  setSignedIn(false);
  loginMessage.textContent = error.message;
});
