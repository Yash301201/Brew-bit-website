# Deploy Brew & Bite

This is a full-stack Node.js app. GitHub stores the source code, but GitHub Pages cannot run its Node server or SQLite API. Deploy the complete app as a Render web service using the included render.yaml Blueprint.

## Deploy from GitHub

1. Merge the deployment pull request into the main branch.
2. Sign in to [Render](https://render.com) and choose **New → Blueprint**.
3. Connect the GitHub repository Yash301201/Brew-bit-website and select the main branch.
4. Review the Blueprint resources and create them. It uses a paid Starter web service and a 1 GB persistent disk so the SQLite database survives restarts and deployments. A free service cannot attach the disk this SQLite setup needs.
5. When prompted, enter the owner email and a unique password of at least 14 characters. Do not use the sample password from .env.example. Keep credentials in Render's environment settings, never in GitHub.
6. Wait for the deploy to report **Live**, then copy the service's public HTTPS URL.

Render can automatically redeploy the service when new commits reach the connected branch. The service listens on Render's PORT, uses /api/health as its health check, and stores the database at /var/data/brew-bite.sqlite on the persistent disk.

## Confirm the site is working

- Open the public HTTPS URL for the customer site.
- Open https://YOUR-SERVICE.onrender.com/api/health. A working service returns JSON with "status":"ok".
- Open https://YOUR-SERVICE.onrender.com/admin and sign in with the owner credentials you entered during setup.
- Place a clearly marked test order or reservation, redeploy, then confirm the record remains in the owner dashboard. The database file is on the persistent disk.
- Share the public HTTPS URL. Do not share http://localhost:4173; that address only works on the computer running npm start.

The site uses the X-Forwarded-Proto header from Render's HTTPS proxy for same-origin checks. Online payments remain off unless you add Razorpay credentials in Render's environment settings. Start with Razorpay test credentials and configure a webhook URL ending in /api/payments/webhook before enabling payments.

## If the deploy fails

Check the Render deploy logs and confirm:

- The service was created from the render.yaml Blueprint on main.
- Node.js 24.22.1 is selected from .node-version.
- Both ADMIN_EMAIL and ADMIN_PASSWORD were entered as Blueprint secrets.
- The health check path is /api/health.
- The disk mount is /var/data, and DATABASE_PATH is /var/data/brew-bite.sqlite.

For a local run, start the server from the project folder with npm start, then open http://localhost:4173 on that same computer.
