# Brew & Bite — full-stack café website

Yes, this is now a **full-stack project**: the customer website calls a Node.js API, the API stores bookings, orders, payments and reviews in SQLite, and the private owner dashboard reads and manages those records.

## Start it on this computer

Use Node.js 24 (or Node.js 22.13 or later). This project uses Node's built-in SQLite module and has no package install step.

1. Copy .env.example to .env in this folder.
2. Change ADMIN_EMAIL and ADMIN_PASSWORD. The owner password must be at least 14 characters; do not use the example value.
3. Review the café hours, time zone and table capacity in .env.
4. Open a terminal in this folder and run `node server.mjs`.
5. Open http://localhost:4173 for customers and http://localhost:4173/admin for the owner.

The database file is created at data/brew-bite.sqlite on first run. It is ignored by Git and must be included in a secure backup. The initial owner login is created only when the database has no owner yet. Change it later from Owner dashboard → Account.

## Customer features

- Reserve a table. The server checks opening hours, future dates, party size and overlapping seat capacity before it confirms the booking and returns a reference.
- Place a pickup or dine-in order. The server loads current menu prices, checks availability, recalculates the total and saves item snapshots.
- Pay at the café by cash, UPI or card; an owner records the collected method in the dashboard.
- Use Razorpay Standard Checkout for online payment when the café has configured keys. The payment provider collects the payment details; this website does not store card numbers or CVVs.
- Submit a review. A review stays private until an owner approves it.

## Owner features

The private /admin page shows captured sales, orders needing attention, upcoming bookings, review moderation, the seven-day sales chart, popular items and payment references. Owners can update order and booking status, record in-person payments, approve or reject reviews, change prices, pause menu items and update their password.

Sales include payments the provider confirms as captured and in-person payments the owner records as collected. Reconcile these totals against the café's payment provider and cash register. Refund initiation and tax invoice generation are not automated in this starter.

## Payment setup

Online checkout is deliberately off until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are supplied. Start with Razorpay test credentials and test transactions. The backend creates each provider order, checks the checkout signature, verifies payment amount and status with the provider, and accepts signed, deduplicated webhooks at /api/payments/webhook. Keep all secrets in .env; never put the secret or webhook secret in browser code.

Razorpay Checkout methods depend on the merchant account and enabled configuration. Its documentation describes UPI, cards, net banking and wallets for supported checkout configurations; some methods or instruments may need account enablement. See the official [Standard Checkout integration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/) and [payment method configuration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-dashboard/checkout/).

For test setup:

1. Add the Razorpay test Key ID and Key Secret to .env, then restart the server.
2. Use the test dashboard to configure a webhook pointing to your staging URL plus /api/payments/webhook. Keep a separate webhook secret in RAZORPAY_WEBHOOK_SECRET.
3. Subscribe to payment.captured, payment.authorized and payment.failed. Test the customer callback and webhook against the test account before any live use.
4. Use HTTPS and set APP_ORIGIN to the exact public website origin for a deployed site. Use live keys only after business verification and a successful staging review.

The local page can take bookings and pay-at-café orders without Razorpay credentials. A local server cannot receive gateway webhooks directly; test webhooks on a public staging endpoint or an approved HTTPS tunnel.

## Before a public launch

This gives you a working full-stack MVP and a safe test-payment path. Finish these business and deployment details before accepting real customer money:

- Replace sample menu prices with the café's approved prices, add tax treatment, allergen information, stock and service cut-off rules.
- Add the real café address, map pin, contact number, hours, table capacity, reservation duration and cancellation/no-show policy.
- Configure a durable server disk and encrypted database backups. This single-process SQLite setup suits a first café deployment. Move to managed PostgreSQL before running multiple app instances or when concurrent traffic and operational recovery needs outgrow one durable SQLite database.
- Set an HTTPS domain, APP_ORIGIN, secure environment secrets, monitoring, backups and a tested restore process.
- Complete Razorpay merchant onboarding, configure the enabled payment methods, test failures and refunds, and reconcile dashboard results against provider settlement reports.
- Publish the café's privacy, terms, refund, cancellation and contact information, and have the final flow reviewed against local business and payment requirements.

## Project files

- server.mjs — HTTP API, SQLite schema, bookings, orders, owner authentication and Razorpay integration.
- index.html, style.css, script.js, menu-data.js — customer experience.
- admin.html, admin.css, admin.js — private owner dashboard.
- data/brew-bite.sqlite — generated local database; excluded from source control.
- photo-credits.html and images/ — website photos and their attribution. Thirty-four selected menu photos are AI-generated and labeled on the credits page.

The earlier photo-refresh Python scripts are asset-preparation utilities. They are not needed to run the website.
