import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import {
  createHash, createHmac, randomBytes, scryptSync, timingSafeEqual, randomUUID,
} from "node:crypto";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
loadEnvironment(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 4173);
const APP_ORIGIN = process.env.APP_ORIGIN || "";
const CAFE_NAME = process.env.CAFE_NAME || "Brew & Bite";
const CAFE_TIME_ZONE = process.env.CAFE_TIME_ZONE || "Asia/Kolkata";
const CAFE_OPEN_TIME = process.env.CAFE_OPEN_TIME || "08:00";
const CAFE_CLOSE_TIME = process.env.CAFE_CLOSE_TIME || "20:00";
const CAFE_TABLE_CAPACITY = positiveInteger(process.env.CAFE_TABLE_CAPACITY, 32);
const BOOKING_DURATION_MINUTES = positiveInteger(process.env.BOOKING_DURATION_MINUTES, 60);
const MAX_BOOKING_DAYS = positiveInteger(process.env.MAX_BOOKING_DAYS, 60);
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";
const ONLINE_PAYMENTS_ENABLED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
const COOKIE_NAME = "brew_owner_session";
const SESSION_HOURS = 8;
const DB_PATH = path.resolve(ROOT, process.env.DATABASE_PATH || path.join("data", "brew-bite.sqlite"));
mkdirSync(path.dirname(DB_PATH), { recursive: true });

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function loadEnvironment(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

function positiveInteger(raw, fallback) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function constantTimeHexEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || !/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function passwordRecord(password) {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function checkPassword(password, salt, expectedHash) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, category TEXT NOT NULL,
    description TEXT NOT NULL, tag TEXT NOT NULL, image TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(email, phone)
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    service_date TEXT NOT NULL, service_time TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 8),
    notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'CONFIRMED',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS bookings_date_time_idx ON bookings(service_date, service_time, status);
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id), booking_id TEXT REFERENCES bookings(id),
    fulfillment TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING',
    payment_choice TEXT NOT NULL, subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at);
  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id), name_snapshot TEXT NOT NULL,
    unit_price_paise INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
    line_total_paise INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), provider TEXT NOT NULL,
    provider_order_id TEXT UNIQUE, provider_payment_id TEXT UNIQUE, method TEXT NOT NULL,
    status TEXT NOT NULL, amount_paise INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'INR',
    accounting_date TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status, accounting_date);
  CREATE TABLE IF NOT EXISTS webhook_events (
    event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, received_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, customer_id TEXT REFERENCES customers(id), order_id TEXT REFERENCES orders(id),
    display_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    email TEXT PRIMARY KEY, password_hash TEXT NOT NULL, salt TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY, csrf_token TEXT NOT NULL,
    admin_email TEXT NOT NULL REFERENCES admin_users(email) ON DELETE CASCADE,
    expires_at TEXT NOT NULL, created_at TEXT NOT NULL
  );
`);

function loadMenuSeed() {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(path.join(ROOT, "menu-data.js"), "utf8"), context, { timeout: 3000 });
  return context.window.BREW_MENU_ITEMS;
}

const insertMenu = db.prepare(
  "INSERT OR IGNORE INTO menu_items (id, name, category, description, tag, image, price_paise, active, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)",
);
const updateMenuImage = db.prepare("UPDATE menu_items SET image = ? WHERE id = ?");
for (const item of loadMenuSeed()) {
  insertMenu.run(item.id, item.name, item.category, item.description, item.tag, item.image, Math.round(Number(item.price) * 100), nowIso());
  updateMenuImage.run(item.image, item.id);
}

const initialEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const initialPassword = process.env.ADMIN_PASSWORD || "";
if (initialEmail && initialPassword && !db.prepare("SELECT email FROM admin_users LIMIT 1").get()) {
  if (initialPassword.length < 14 || /replace|change-this|example/i.test(initialPassword)) {
    throw new Error("Set a unique ADMIN_PASSWORD of at least 14 characters in .env before starting.");
  }
  const record = passwordRecord(initialPassword);
  db.prepare("INSERT INTO admin_users (email, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
    .run(initialEmail, record.hash, record.salt, nowIso(), nowIso());
  console.log("Created the first owner login for " + initialEmail);
}

function localDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAFE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}

function localTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAFE_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.hour + ":" + values.minute;
}

function addCalendarDays(dateString, count) {
  const date = new Date(dateString + "T12:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

function publicConfig() {
  const today = localDate(new Date());
  return {
    cafeName: CAFE_NAME,
    payments: { onlineAvailable: ONLINE_PAYMENTS_ENABLED, currency: "INR" },
    booking: {
      openTime: CAFE_OPEN_TIME, closeTime: CAFE_CLOSE_TIME, slotMinutes: 30,
      durationMinutes: BOOKING_DURATION_MINUTES, capacity: CAFE_TABLE_CAPACITY,
      maxGuests: 8, maxDaysAhead: MAX_BOOKING_DAYS,
      today, latestDate: addCalendarDays(today, MAX_BOOKING_DAYS),
      currentLocalTime: localTime(new Date()), timeZone: CAFE_TIME_ZONE,
    },
  };
}

function publicMenu() {
  return db.prepare("SELECT * FROM menu_items WHERE active = 1 ORDER BY category, name").all().map((row) => ({
    id: row.id, name: row.name, category: row.category, description: row.description,
    tag: row.tag, image: row.image, price: row.price_paise / 100,
  }));
}

function json(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(body);
}

function addSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; form-action 'self' https://api.razorpay.com; base-uri 'self'; frame-ancestors 'self'");
}

async function rawBody(request, limit = 32_768) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "This request is too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function bodyJson(request) {
  const body = await rawBody(request);
  if (!body.length) return {};
  try { return JSON.parse(body.toString("utf8")); } catch { throw new HttpError(400, "Please send valid form data."); }
}

function text(value, max, field, required = true) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new HttpError(400, "Please enter " + field + ".");
  if (result.length > max) throw new HttpError(400, field + " is too long.");
  return result;
}

function emailAddress(value) {
  const result = text(value, 160, "your email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, "Please enter a valid email address.");
  return result;
}

function phoneNumber(value) {
  const result = text(value, 32, "your phone number");
  const digits = result.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) throw new HttpError(400, "Please enter a phone number with 10 to 15 digits.");
  return result;
}

function customerBody(body) {
  return { name: text(body.name, 80, "your name"), email: emailAddress(body.email), phone: phoneNumber(body.phone) };
}

function upsertCustomer(customer) {
  const row = db.prepare("SELECT id FROM customers WHERE email = ? AND phone = ?").get(customer.email, customer.phone);
  const timestamp = new Date().toISOString();
  if (row) {
    db.prepare("UPDATE customers SET name = ?, updated_at = ? WHERE id = ?").run(customer.name, timestamp, row.id);
    return row.id;
  }
  const id = randomUUID();
  db.prepare("INSERT INTO customers (id, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, customer.name, customer.email, customer.phone, timestamp, timestamp);
  return id;
}

function minuteOfDay(value) {
  const match = typeof value === "string" && value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function validateBookingTime(date, time) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, "Choose a valid booking date.");
  const requested = minuteOfDay(time);
  const opening = minuteOfDay(CAFE_OPEN_TIME);
  const closing = minuteOfDay(CAFE_CLOSE_TIME);
  if (requested === null || opening === null || closing === null) throw new HttpError(400, "Choose a valid booking time.");
  if (requested < opening || requested >= closing || (requested - opening) % 30 !== 0) throw new HttpError(400, "That time is outside the café's booking slots.");
  const today = localDate(new Date());
  if (date < today || date > addCalendarDays(today, MAX_BOOKING_DAYS)) throw new HttpError(400, "Choose a date from today through " + addCalendarDays(today, MAX_BOOKING_DAYS) + ".");
  if (date === today && requested <= minuteOfDay(localTime(new Date()))) throw new HttpError(400, "Choose a future time.");
}

function reference(prefix) {
  return prefix + "-" + randomBytes(5).toString("hex").toUpperCase();
}

function limitRequests(request, key, maximum, milliseconds) {
  const store = limitRequests.store || (limitRequests.store = new Map());
  const address = request.socket.remoteAddress || "unknown";
  const keyValue = key + ":" + address;
  const current = store.get(keyValue);
  const now = Date.now();
  if (!current || current.until <= now) {
    store.set(keyValue, { count: 1, until: now + milliseconds });
    return;
  }
  current.count += 1;
  if (current.count > maximum) throw new HttpError(429, "Too many attempts. Please wait a little and try again.");
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return;
  const expected = APP_ORIGIN
    ? APP_ORIGIN.replace(/\/$/, "")
    : (request.socket.encrypted ? "https" : "http") + "://" + request.headers.host;
  if (origin !== expected) throw new HttpError(403, "This request did not come from the café website.");
}

function cookies(header) {
  const result = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    try { result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim()); } catch { /* Ignore invalid values. */ }
  }
  return result;
}

function currentSession(request) {
  const token = cookies(request.headers.cookie)[COOKIE_NAME];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return db.prepare(
    "SELECT admin_sessions.token_hash, admin_sessions.csrf_token, admin_sessions.admin_email FROM admin_sessions JOIN admin_users ON admin_users.email = admin_sessions.admin_email WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > ?",
  ).get(digest(token), new Date().toISOString()) || null;
}

function requireOwner(request, csrf = false) {
  const session = currentSession(request);
  if (!session) throw new HttpError(401, "Please sign in again to continue.");
  if (csrf && !constantTimeHexEqual(request.headers["x-csrf-token"], session.csrf_token)) {
    throw new HttpError(403, "Your session token expired. Refresh the owner page and try again.");
  }
  return session;
}

function sessionCookie(request, value, clear = false) {
  const secure = process.env.NODE_ENV === "production" || request.socket.encrypted;
  return COOKIE_NAME + "=" + (clear ? "" : encodeURIComponent(value))
    + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" + (clear ? "0" : String(SESSION_HOURS * 3600))
    + (secure ? "; Secure" : "");
}

function createBooking(body) {
  const customer = customerBody(body);
  const date = text(body.date, 10, "a booking date");
  const time = text(body.time, 5, "a booking time");
  const guests = Number(body.guests);
  const notes = text(body.notes, 500, "booking notes", false);
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) throw new HttpError(400, "Choose between 1 and 8 guests.");
  validateBookingTime(date, time);
  const start = minuteOfDay(time);
  const id = randomUUID();
  const confirmation = reference("BB");
  const timestamp = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE;");
  try {
    const nearby = db.prepare("SELECT service_time, guests FROM bookings WHERE service_date = ? AND status IN ('CONFIRMED', 'SEATED')").all(date);
    const occupied = nearby.reduce((sum, row) =>
      Math.abs(minuteOfDay(row.service_time) - start) < BOOKING_DURATION_MINUTES ? sum + row.guests : sum, 0);
    if (occupied + guests > CAFE_TABLE_CAPACITY) throw new HttpError(409, "That time is full. Please choose another time.");
    const customerId = upsertCustomer(customer);
    db.prepare(
      "INSERT INTO bookings (id, reference, customer_id, service_date, service_time, guests, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?)",
    ).run(id, confirmation, customerId, date, time, guests, notes, timestamp, timestamp);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return { reference: confirmation, date, time, guests, status: "CONFIRMED", cafeName: CAFE_NAME };
}

function requestedItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 25) throw new HttpError(400, "Add between 1 and 25 menu items.");
  const requested = new Map();
  for (const item of items) {
    const name = text(item?.name, 100, "a menu item");
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new HttpError(400, "Each item quantity must be from 1 to 20.");
    requested.set(name, (requested.get(name) || 0) + quantity);
  }
  if ([...requested.values()].some((quantity) => quantity > 20)) throw new HttpError(400, "An item quantity cannot exceed 20.");
  let subtotal = 0;
  const rows = [];
  for (const [name, quantity] of requested) {
    const row = db.prepare("SELECT id, name, price_paise FROM menu_items WHERE name = ? AND active = 1").get(name);
    if (!row) throw new HttpError(400, name + " is unavailable. Please refresh the menu.");
    const lineTotal = row.price_paise * quantity;
    subtotal += lineTotal;
    rows.push({ id: row.id, name: row.name, quantity, price: row.price_paise, lineTotal });
  }
  if (subtotal < 100 || subtotal > 100_000_000) throw new HttpError(400, "The order total is outside the allowed range.");
  return { rows, subtotal };
}

async function gatewayOrder(receipt, amount) {
  const authorization = Buffer.from(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: "Basic " + authorization, "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt }),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) {
    console.error("Razorpay order creation failed with status " + response.status);
    throw new HttpError(502, "Online checkout could not start. Please choose pay at café or try again.");
  }
  return result;
}

async function createOrder(body) {
  const customer = customerBody(body);
  const fulfillment = body.fulfillment === "dine_in" ? "DINE_IN" : body.fulfillment === "pickup" ? "PICKUP" : "";
  if (!fulfillment) throw new HttpError(400, "Choose dine-in or pickup.");
  const paymentChoice = ["RAZORPAY", "PAY_AT_CAFE"].includes(body.paymentChoice) ? body.paymentChoice : "";
  if (!paymentChoice) throw new HttpError(400, "Choose an available payment option.");
  if (paymentChoice === "RAZORPAY" && !ONLINE_PAYMENTS_ENABLED) throw new HttpError(503, "Online checkout is not configured yet. Choose pay at café or contact the owner.");
  const items = requestedItems(body.items);
  let bookingId = null;
  const bookingReference = text(body.bookingReference, 30, "booking reference", false).toUpperCase();
  if (bookingReference) {
    const booking = db.prepare(
      "SELECT bookings.id FROM bookings JOIN customers ON customers.id = bookings.customer_id WHERE bookings.reference = ? AND customers.email = ? AND customers.phone = ? AND bookings.status IN ('CONFIRMED', 'SEATED')",
    ).get(bookingReference, customer.email, customer.phone);
    if (!booking) throw new HttpError(400, "That booking reference could not be matched to this email and phone number.");
    bookingId = booking.id;
  }

  const orderId = randomUUID();
  const orderReference = reference("ORD");
  const timestamp = new Date().toISOString();
  const gateway = paymentChoice === "RAZORPAY" ? await gatewayOrder(orderReference, items.subtotal) : null;
  db.exec("BEGIN IMMEDIATE;");
  try {
    const customerId = upsertCustomer(customer);
    db.prepare(
      "INSERT INTO orders (id, reference, customer_id, booking_id, fulfillment, status, payment_choice, subtotal_paise, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, 'INR', ?, ?)",
    ).run(orderId, orderReference, customerId, bookingId, fulfillment, paymentChoice, items.subtotal, timestamp, timestamp);
    const insertLine = db.prepare(
      "INSERT INTO order_items (id, order_id, menu_item_id, name_snapshot, unit_price_paise, quantity, line_total_paise) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    for (const item of items.rows) insertLine.run(randomUUID(), orderId, item.id, item.name, item.price, item.quantity, item.lineTotal);
    db.prepare(
      "INSERT INTO payments (id, order_id, provider, provider_order_id, method, status, amount_paise, currency, accounting_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, 'INR', NULL, ?, ?)",
    ).run(randomUUID(), orderId, paymentChoice === "RAZORPAY" ? "RAZORPAY" : "OFFLINE", gateway?.id || null,
      paymentChoice === "RAZORPAY" ? "RAZORPAY_CHECKOUT" : "PAY_AT_CAFE", items.subtotal, timestamp, timestamp);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return {
    order: { id: orderId, reference: orderReference, status: "PENDING", fulfillment, amountPaise: items.subtotal, currency: "INR" },
    paymentChoice,
    checkout: gateway ? {
      provider: "razorpay", keyId: RAZORPAY_KEY_ID, orderId: gateway.id, amount: gateway.amount,
      currency: gateway.currency, cafeName: CAFE_NAME, customer,
    } : null,
  };
}

function setPaymentStatus(rowId, status, providerPaymentId, method) {
  const timestamp = new Date().toISOString();
  const accountingDate = status === "CAPTURED" ? localDate(new Date()) : null;
  db.prepare(
    "UPDATE payments SET provider_payment_id = COALESCE(?, provider_payment_id), status = ?, method = ?, accounting_date = COALESCE(?, accounting_date), updated_at = ? WHERE id = ?",
  ).run(providerPaymentId || null, status, method || "RAZORPAY_CHECKOUT", accountingDate, timestamp, rowId);
}

async function verifyPayment(body) {
  const localOrderId = text(body.orderId, 50, "order ID");
  const providerOrderId = text(body.razorpay_order_id, 80, "payment order ID");
  const paymentId = text(body.razorpay_payment_id, 80, "payment ID");
  const signature = text(body.razorpay_signature, 128, "payment signature");
  const localPayment = db.prepare(
    "SELECT payments.*, orders.reference FROM payments JOIN orders ON orders.id = payments.order_id WHERE payments.order_id = ? AND payments.provider_order_id = ? AND payments.provider = 'RAZORPAY'",
  ).get(localOrderId, providerOrderId);
  if (!localPayment) throw new HttpError(404, "The payment could not be matched to this café order.");
  const expected = createHmac("sha256", RAZORPAY_KEY_SECRET).update(providerOrderId + "|" + paymentId).digest("hex");
  if (!constantTimeHexEqual(expected, signature)) throw new HttpError(400, "The payment confirmation could not be verified.");

  const authorization = Buffer.from(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId), {
    headers: { Authorization: "Basic " + authorization }, signal: AbortSignal.timeout(15_000),
  });
  const remote = await response.json().catch(() => ({}));
  if (!response.ok || remote.order_id !== providerOrderId || Number(remote.amount) !== localPayment.amount_paise || remote.currency !== "INR") {
    throw new HttpError(502, "The payment is still being checked. Keep order reference " + localPayment.reference + ".");
  }
  const status = remote.status === "captured" ? "CAPTURED"
    : remote.status === "authorized" ? "AUTHORIZED"
      : String(remote.status || "PENDING").toUpperCase();
  setPaymentStatus(localPayment.id, status, paymentId, remote.method || "RAZORPAY_CHECKOUT");
  return { reference: localPayment.reference, status, method: remote.method || "" };
}

function verifyWebhook(raw, signature) {
  if (!RAZORPAY_WEBHOOK_SECRET || typeof signature !== "string") return false;
  const expected = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(raw).digest("hex");
  return constantTimeHexEqual(expected, signature);
}

function applyPaymentEvent(type, entity) {
  if (!entity?.order_id) return;
  const localPayment = db.prepare("SELECT * FROM payments WHERE provider_order_id = ? AND provider = 'RAZORPAY'").get(entity.order_id);
  if (!localPayment) return;
  if (Number(entity.amount) !== localPayment.amount_paise || entity.currency !== localPayment.currency) {
    console.error("Ignoring a payment event with an amount mismatch for order " + localPayment.order_id);
    return;
  }
  const status = type === "payment.captured" || type === "order.paid" ? "CAPTURED"
    : type === "payment.authorized" ? "AUTHORIZED" : "FAILED";
  setPaymentStatus(localPayment.id, status, entity.id, entity.method || "RAZORPAY_CHECKOUT");
}

async function webhook(request, response) {
  const raw = await rawBody(request, 1_000_000);
  if (!verifyWebhook(raw, request.headers["x-razorpay-signature"])) throw new HttpError(400, "The payment webhook signature is invalid.");
  let event;
  try { event = JSON.parse(raw.toString("utf8")); } catch { throw new HttpError(400, "The webhook body is invalid."); }
  const eventType = String(event.event || "");
  const eventId = String(request.headers["x-razorpay-event-id"] || digest(raw));
  if (db.prepare("SELECT event_id FROM webhook_events WHERE event_id = ?").get(eventId)) return json(response, 200, { received: true, duplicate: true });
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare("INSERT INTO webhook_events (event_id, event_type, received_at) VALUES (?, ?, ?)").run(eventId, eventType, new Date().toISOString());
    if (["payment.captured", "payment.authorized", "payment.failed", "order.paid"].includes(eventType)) {
      applyPaymentEvent(eventType, event.payload?.payment?.entity);
    }
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return json(response, 200, { received: true });
}

function moneyToPaise(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) return null;
  return Math.round(amount * 100);
}

function dashboardSummary() {
  const today = localDate(new Date());
  const todaySales = db.prepare("SELECT COALESCE(SUM(amount_paise), 0) AS total, COUNT(*) AS count FROM payments WHERE status = 'CAPTURED' AND accounting_date = ?").get(today);
  const pendingOrders = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY')").get().count;
  const upcomingBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status IN ('CONFIRMED', 'SEATED') AND service_date >= ?").get(today).count;
  const pendingReviews = db.prepare("SELECT COUNT(*) AS count FROM reviews WHERE status = 'PENDING'").get().count;
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addCalendarDays(today, -offset);
    const row = db.prepare("SELECT COALESCE(SUM(amount_paise), 0) AS sales, COUNT(*) AS count FROM payments WHERE status = 'CAPTURED' AND accounting_date = ?").get(date);
    days.push({ date, salesPaise: row.sales, payments: row.count });
  }
  return { today: { salesPaise: todaySales.total, capturedPayments: todaySales.count }, pendingOrders, upcomingBookings, pendingReviews, days };
}

function dashboardOrders() {
  return db.prepare(
    "SELECT orders.*, customers.name AS customer_name, customers.email AS customer_email, customers.phone AS customer_phone, bookings.reference AS booking_reference FROM orders JOIN customers ON customers.id = orders.customer_id LEFT JOIN bookings ON bookings.id = orders.booking_id ORDER BY orders.created_at DESC LIMIT 100",
  ).all().map((order) => ({
    id: order.id, reference: order.reference,
    customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
    bookingReference: order.booking_reference, fulfillment: order.fulfillment, status: order.status,
    paymentChoice: order.payment_choice, totalPaise: order.subtotal_paise, createdAt: order.created_at,
    items: db.prepare("SELECT name_snapshot AS name, quantity, unit_price_paise AS unitPricePaise FROM order_items WHERE order_id = ?").all(order.id),
    payments: db.prepare("SELECT provider, provider_payment_id AS providerPaymentId, method, status, amount_paise AS amountPaise, currency, created_at AS createdAt FROM payments WHERE order_id = ? ORDER BY created_at DESC").all(order.id),
  }));
}

function dashboardBookings() {
  return db.prepare(
    "SELECT bookings.id, bookings.reference, bookings.service_date AS date, bookings.service_time AS time, bookings.guests, bookings.notes, bookings.status, bookings.created_at AS createdAt, customers.name, customers.email, customers.phone FROM bookings JOIN customers ON customers.id = bookings.customer_id WHERE bookings.service_date >= ? ORDER BY bookings.service_date, bookings.service_time LIMIT 200",
  ).all(localDate(new Date()));
}

function dashboardReviews() {
  return db.prepare(
    "SELECT reviews.id, reviews.display_name AS displayName, reviews.rating, reviews.comment, reviews.status, reviews.created_at AS createdAt FROM reviews ORDER BY CASE reviews.status WHEN 'PENDING' THEN 0 ELSE 1 END, reviews.created_at DESC LIMIT 200",
  ).all();
}

function dashboardMenu() {
  return db.prepare("SELECT id, name, category, price_paise AS pricePaise, active, image FROM menu_items ORDER BY category, name").all();
}

function topItems() {
  return db.prepare(
    "SELECT order_items.name_snapshot AS name, SUM(order_items.quantity) AS quantity, SUM(order_items.line_total_paise) AS salesPaise FROM order_items JOIN orders ON orders.id = order_items.order_id WHERE orders.id IN (SELECT DISTINCT order_id FROM payments WHERE status = 'CAPTURED') GROUP BY order_items.name_snapshot ORDER BY quantity DESC LIMIT 8",
  ).all();
}

function serveStatic(request, response, pathname) {
  let relative;
  let imageRequest = false;
  if (pathname === "/") relative = "index.html";
  else if (pathname === "/admin" || pathname === "/admin/") relative = "admin.html";
  else {
    const fixed = new Set(["index.html", "style.css", "script.js", "menu-data.js", "photo-credits.html", "admin.html", "admin.css", "admin.js"]);
    let candidate;
    try { candidate = decodeURIComponent(pathname.replace(/^\//, "")); } catch { return false; }
    if (fixed.has(candidate)) relative = candidate;
    else if (candidate.startsWith("images/")) {
      relative = candidate;
      imageRequest = true;
    }
    else return false;
  }
  const filePath = path.resolve(ROOT, relative);
  if (imageRequest) {
    if (!filePath.startsWith(path.resolve(ROOT, "images") + path.sep)) return false;
  } else if (!filePath.startsWith(path.resolve(ROOT) + path.sep)) return false;
  let content;
  try { content = readFileSync(filePath); } catch { return false; }
  const extension = path.extname(filePath).toLowerCase();
  const mime = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".mp4": "video/mp4",
  }[extension] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": content.length,
    "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=3600",
  });
  response.end(request.method === "HEAD" ? undefined : content);
  return true;
}

async function api(request, response, url) {
  const route = url.pathname;
  const method = request.method || "GET";
  if (route === "/api/health" && method === "GET") return json(response, 200, { status: "ok", database: "sqlite", onlinePayments: ONLINE_PAYMENTS_ENABLED });
  if (route === "/api/config" && method === "GET") return json(response, 200, publicConfig());
  if (route === "/api/menu" && method === "GET") {
    const context = { window: {} };
    vm.runInNewContext(readFileSync(path.join(ROOT, "menu-data.js"), "utf8"), context, { timeout: 3000 });
    return json(response, 200, { categories: context.window.BREW_MENU_CATEGORIES, items: publicMenu() });
  }
  if (route === "/api/bookings" && method === "POST") {
    sameOrigin(request);
    limitRequests(request, "booking", 8, 10 * 60 * 1000);
    return json(response, 201, { booking: createBooking(await bodyJson(request)) });
  }
  if (route === "/api/orders" && method === "POST") {
    sameOrigin(request);
    limitRequests(request, "order", 10, 10 * 60 * 1000);
    return json(response, 201, await createOrder(await bodyJson(request)));
  }
  if (route === "/api/payments/verify" && method === "POST") {
    sameOrigin(request);
    if (!ONLINE_PAYMENTS_ENABLED) throw new HttpError(503, "Online payments are not configured.");
    return json(response, 200, await verifyPayment(await bodyJson(request)));
  }
  if (route === "/api/payments/webhook" && method === "POST") return webhook(request, response);
  if (route === "/api/reviews" && method === "GET") {
    const reviews = db.prepare("SELECT display_name AS name, rating, comment, created_at AS createdAt FROM reviews WHERE status = 'APPROVED' ORDER BY created_at DESC LIMIT 12").all();
    return json(response, 200, { reviews });
  }
  if (route === "/api/reviews" && method === "POST") {
    sameOrigin(request);
    limitRequests(request, "review", 4, 60 * 60 * 1000);
    const body = await bodyJson(request);
    const customer = customerBody(body);
    const rating = Number(body.rating);
    const comment = text(body.comment, 1000, "your review");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Choose a rating from 1 to 5.");
    const customerId = upsertCustomer(customer);
    db.prepare("INSERT INTO reviews (id, customer_id, display_name, rating, comment, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)")
      .run(randomUUID(), customerId, customer.name, rating, comment, new Date().toISOString(), new Date().toISOString());
    return json(response, 201, { message: "Thank you. Your review is waiting for café approval before it appears publicly." });
  }
  if (route === "/api/admin/login" && method === "POST") {
    sameOrigin(request);
    limitRequests(request, "owner-login", 8, 15 * 60 * 1000);
    const body = await bodyJson(request);
    const email = emailAddress(body.email);
    const password = text(body.password, 256, "your password");
    const owner = db.prepare("SELECT email, password_hash, salt FROM admin_users WHERE email = ?").get(email);
    if (!owner || !checkPassword(password, owner.salt, owner.password_hash)) throw new HttpError(401, "Email or password is incorrect.");
    const token = randomBytes(32).toString("hex");
    const csrfToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
    db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(new Date().toISOString());
    db.prepare("INSERT INTO admin_sessions (token_hash, csrf_token, admin_email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(digest(token), csrfToken, email, expires, new Date().toISOString());
    return json(response, 200, { authenticated: true, email, csrfToken }, { "Set-Cookie": sessionCookie(request, token) });
  }
  if (route === "/api/admin/me" && method === "GET") {
    const session = currentSession(request);
    return json(response, 200, session
      ? { authenticated: true, email: session.admin_email, csrfToken: session.csrf_token }
      : { authenticated: false, configured: Boolean(db.prepare("SELECT email FROM admin_users LIMIT 1").get()) });
  }
  if (route.startsWith("/api/admin/")) {
    const session = requireOwner(request, method !== "GET");
    if (route === "/api/admin/logout" && method === "POST") {
      sameOrigin(request);
      db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(session.token_hash);
      return json(response, 200, { authenticated: false }, { "Set-Cookie": sessionCookie(request, "", true) });
    }
    if (route === "/api/admin/summary" && method === "GET") return json(response, 200, { summary: dashboardSummary(), topItems: topItems() });
    if (route === "/api/admin/orders" && method === "GET") return json(response, 200, { orders: dashboardOrders() });
    if (route === "/api/admin/bookings" && method === "GET") return json(response, 200, { bookings: dashboardBookings() });
    if (route === "/api/admin/reviews" && method === "GET") return json(response, 200, { reviews: dashboardReviews() });
    if (route === "/api/admin/menu" && method === "GET") return json(response, 200, { items: dashboardMenu() });
    if (route === "/api/admin/profile/password" && method === "PATCH") {
      const body = await bodyJson(request);
      const oldPassword = text(body.currentPassword, 256, "current password");
      const newPassword = text(body.newPassword, 256, "new password");
      if (newPassword.length < 14) throw new HttpError(400, "Choose a password with at least 14 characters.");
      const owner = db.prepare("SELECT email, password_hash, salt FROM admin_users WHERE email = ?").get(session.admin_email);
      if (!owner || !checkPassword(oldPassword, owner.salt, owner.password_hash)) throw new HttpError(403, "The current password is incorrect.");
      const record = passwordRecord(newPassword);
      db.prepare("UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = ? WHERE email = ?")
        .run(record.hash, record.salt, new Date().toISOString(), owner.email);
      db.prepare("DELETE FROM admin_sessions WHERE admin_email = ? AND token_hash <> ?").run(owner.email, session.token_hash);
      return json(response, 200, { message: "Owner password updated. Other sessions have been signed out." });
    }
    const collect = route.match(/^\/api\/admin\/orders\/([a-f0-9-]+)\/collect$/i);
    if (collect && method === "POST") {
      const body = await bodyJson(request);
      const paymentMethod = ["CASH", "UPI", "CARD"].includes(body.method) ? body.method : "";
      if (!paymentMethod) throw new HttpError(400, "Choose cash, UPI or card as the recorded payment method.");
      const order = db.prepare("SELECT id, status, subtotal_paise FROM orders WHERE id = ?").get(collect[1]);
      if (!order) throw new HttpError(404, "Order not found.");
      if (order.status === "CANCELLED") throw new HttpError(409, "A cancelled order cannot be marked paid.");
      const payment = db.prepare("SELECT id, amount_paise FROM payments WHERE order_id = ? AND provider = 'OFFLINE' AND status = 'PENDING' ORDER BY created_at DESC LIMIT 1").get(order.id);
      if (!payment || payment.amount_paise !== order.subtotal_paise) throw new HttpError(409, "This order has no matching unpaid at-café balance.");
      setPaymentStatus(payment.id, "CAPTURED", null, paymentMethod);
      return json(response, 200, { message: "Payment recorded." });
    }
    const orderRoute = route.match(/^\/api\/admin\/orders\/([a-f0-9-]+)$/i);
    if (orderRoute && method === "PATCH") {
      const body = await bodyJson(request);
      const status = ["ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].includes(body.status) ? body.status : "";
      if (!status) throw new HttpError(400, "Choose a valid order status.");
      const result = db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), orderRoute[1]);
      if (!result.changes) throw new HttpError(404, "Order not found.");
      return json(response, 200, { message: "Order status updated." });
    }
    const bookingRoute = route.match(/^\/api\/admin\/bookings\/([a-f0-9-]+)$/i);
    if (bookingRoute && method === "PATCH") {
      const body = await bodyJson(request);
      const status = ["CONFIRMED", "SEATED", "COMPLETED", "CANCELLED"].includes(body.status) ? body.status : "";
      if (!status) throw new HttpError(400, "Choose a valid booking status.");
      const result = db.prepare("UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), bookingRoute[1]);
      if (!result.changes) throw new HttpError(404, "Booking not found.");
      return json(response, 200, { message: "Booking status updated." });
    }
    const reviewRoute = route.match(/^\/api\/admin\/reviews\/([a-f0-9-]+)$/i);
    if (reviewRoute && method === "PATCH") {
      const body = await bodyJson(request);
      const status = ["APPROVED", "REJECTED"].includes(body.status) ? body.status : "";
      if (!status) throw new HttpError(400, "Choose approve or reject for this review.");
      const result = db.prepare("UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), reviewRoute[1]);
      if (!result.changes) throw new HttpError(404, "Review not found.");
      return json(response, 200, { message: "Review moderation saved." });
    }
    const menuRoute = route.match(/^\/api\/admin\/menu\/([a-z0-9-]+)$/i);
    if (menuRoute && method === "PATCH") {
      const body = await bodyJson(request);
      const updates = [];
      const params = [];
      if (Object.hasOwn(body, "price")) {
        const pricePaise = moneyToPaise(body.price);
        if (pricePaise === null) throw new HttpError(400, "Enter a valid menu price.");
        updates.push("price_paise = ?");
        params.push(pricePaise);
      }
      if (Object.hasOwn(body, "active")) {
        if (typeof body.active !== "boolean") throw new HttpError(400, "Menu availability must be on or off.");
        updates.push("active = ?");
        params.push(body.active ? 1 : 0);
      }
      if (!updates.length) throw new HttpError(400, "No menu changes were supplied.");
      updates.push("updated_at = ?");
      params.push(new Date().toISOString(), menuRoute[1]);
      const result = db.prepare("UPDATE menu_items SET " + updates.join(", ") + " WHERE id = ?").run(...params);
      if (!result.changes) throw new HttpError(404, "Menu item not found.");
      return json(response, 200, { message: "Menu item updated." });
    }
  }
  throw new HttpError(404, "That page or API route was not found.");
}

const server = createServer(async (request, response) => {
  addSecurityHeaders(response);
  try {
    const url = new URL(request.url || "/", "http://localhost");
    if (url.pathname.startsWith("/api/")) return await api(request, response, url);
    if (["GET", "HEAD"].includes(request.method) && serveStatic(request, response, url.pathname)) return;
    throw new HttpError(404, "That page was not found.");
  } catch (error) {
    if (response.headersSent) return response.destroy();
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error("Request failed:", error);
    return json(response, status, { error: status === 500 ? "The café server had a problem. Please try again." : error.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(CAFE_NAME + " is running at http://localhost:" + PORT);
  console.log("Database: " + DB_PATH);
  console.log("Online checkout: " + (ONLINE_PAYMENTS_ENABLED ? "configured" : "not configured; pay-at-café is available"));
  if (!db.prepare("SELECT email FROM admin_users LIMIT 1").get()) console.log("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to activate /admin.");
});

function closeDatabase() {
  try { db.close(); } catch { /* Already closed. */ }
}
process.on("SIGINT", () => { closeDatabase(); process.exit(0); });
process.on("SIGTERM", () => { closeDatabase(); process.exit(0); });
