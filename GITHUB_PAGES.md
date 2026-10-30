# Published GitHub Pages portfolio preview

**Live site:** [https://yash301201.github.io/Brew-bit-website/](https://yash301201.github.io/Brew-bit-website/)

The public preview is served from the repository's `main` branch, root folder. It is intended to let recruiters and visitors browse the café storefront, menu, and photography without starting a local server.

## What works in the preview

- Browse the café homepage and photo gallery.
- Search, sort, and filter the bundled menu; view menu photos and prices.

## What needs the backend

GitHub Pages serves static files only. It cannot run the Node.js API or SQLite database, so ordering, table bookings, reviews, Razorpay payments, and the private owner dashboard are unavailable in the preview. The dashboard source is in [admin.html](admin.html), and the server implementation is in [server.mjs](server.mjs).

Do not use this static preview to accept real orders or payments. The menu prices and café details are illustrative.

## Run the full app locally

Install Node.js 22.13 or later, configure a local `.env` from `.env.example`, and run:

```sh
npm start
```

Then open [http://localhost:4173](http://localhost:4173) on the same computer. The local dashboard is at [http://localhost:4173/admin](http://localhost:4173/admin). These localhost addresses work only while the server is running; use the live GitHub Pages URL when sharing the project with recruiters.

For real ordering, bookings, and durable records, deploy the Node.js server with persistent database storage.