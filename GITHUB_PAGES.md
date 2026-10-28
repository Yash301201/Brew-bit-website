# Free GitHub Pages portfolio preview

GitHub Pages is a free static host for this public repository. It can display the café website and its bundled menu, but it cannot run the Node.js server or SQLite database. The page is view-only: ordering, bookings, reviews, payments, and the owner dashboard require a backend and are disabled when the API is unavailable.

## Publish the site

1. Merge the GitHub Pages preview pull request into the main branch.
2. Open the repository on GitHub and choose **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select **main** as the branch and **/(root)** as the folder, then click **Save**.
5. Wait for the Pages build to finish. The Pages settings screen will show the public site URL. For this repository, it is normally https://yash301201.github.io/Brew-bit-website/.

## Check the preview

- Open the site URL shown in **Settings → Pages**.
- Confirm the homepage, menu photos, and menu filters load.
- Confirm booking, ordering, reviews, payments, and the owner dashboard are unavailable. This is expected for a static preview.
- Share the GitHub Pages URL, not http://localhost:4173.

This setup is for a portfolio preview only. GitHub Pages is not a backend host and must not be used to run a live café business or accept e-commerce transactions. Keep real credentials out of the repository. The .env file is ignored by Git; never remove that protection or commit its contents.

To run the full app locally, start the server with npm start and open http://localhost:4173 on the same computer. For live ordering, bookings, and durable records, deploy the Node.js server with persistent database storage instead of using this static preview.
