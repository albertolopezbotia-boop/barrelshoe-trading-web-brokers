# Deployment runbook — Barrelshoe Trading

Production domain: **`barrelshoetrading.com`**
Hosting: **Plesk** on a server at IP **`185.230.55.45`**
(Plesk temporary domain: `hardcore-gagarin.185-230-55-45.plesk.page`)
Mail: hosted on the **same Plesk** — leave it untouched, only the web hosting /
document root changes.

GitHub repo: `https://github.com/albertolopezbotia-boop/barrelshoe-trading-web-brokers`

Build: `npm ci && npm run build` → static output in `dist/` (21 pages).
Node: 22 LTS (Plesk needs Node **20+** for Path A).

---

## The open decision: does Plesk have Node?

Everything below forks on one question: **is the Node.js extension available in this
Plesk installation and usable from the deployment shell?**

Check any of:

- The domain's panel in Plesk shows a **"Node.js"** button/tile.
- `node -v` returns `v20.x` or newer from Plesk → **Tools & Settings → Scheduled
  Tasks** (add a task running `node -v`) or an SSH shell on the server.
- Plesk → **Extensions** lists "Node.js" as installed.

- **Yes** → use **Path A** (Plesk builds from Git). Preferred.
- **No**, and it can't be installed (shared hosting / provider restriction) → use
  **Path B** (GitHub Actions builds, Plesk serves the static output).

Do not assume — verify first.

---

## Path A — Plesk builds from Git (preferred, needs Node on Plesk)

1. **Plesk → domain `barrelshoetrading.com` → Git → Add Repository**
   - Repository type: **Remote (pull)**.
   - URL: `https://github.com/albertolopezbotia-boop/barrelshoe-trading-web-brokers.git`
   - Branch: **`main`**
   - Deployment mode: **Automatic** (deploy on every push; Plesk uses the GitHub
     webhook it registers, or polls).

2. **Enable "Additional deployment actions"** on that Git repository and set the
   shell command to:

   ```
   npm ci && npm run build
   ```

   This runs in the repo checkout directory after each pull, producing `dist/`.

3. **Point the document root at `dist/`.**
   Plesk → **Hosting & DNS → Hosting Settings → Document root** →
   `.../barrelshoe-trading-web-brokers/dist`
   (the exact path is shown by Plesk on the Git repository page as the checkout
   location, typically under `httpdocs/` or a sibling directory).

   If your Plesk build deploys the repo **into `httpdocs` directly** and won't let
   you nest the docroot, deploy the repo to a different directory (e.g.
   `/var/www/vhosts/barrelshoetrading.com/app`) and set the document root to that
   directory's `dist/` subfolder.

4. **Requirement check (Node.js extension).** Confirm before relying on step 2:
   the domain panel shows a **"Node.js"** button, or `node -v` works from a Plesk
   scheduled-task shell / SSH, and reports **Node 20+**. If not, switch to Path B.

5. **First deploy.**
   - Merge/push to `main`.
   - Plesk → Git → **"Pull now"** if automatic deployment doesn't fire.
   - Watch the deployment log for `npm ci && npm run build` success.
   - Open `https://barrelshoetrading.com` and confirm it serves the built site
     (styled pages), **not** a directory listing or the Plesk default page. A
     directory listing means the document root is wrong (step 3).

---

## Path B — build in GitHub Actions, Plesk serves static (fallback, no Node on Plesk)

1. **The workflow.** `.github/workflows/deploy.yml` (in this repo) builds on every
   push to `main` (and on manual `workflow_dispatch`) and **force-pushes the built
   `dist/`** to a branch named **`deploy`**. That branch contains only the static
   site at its root, plus a `.nojekyll` marker.

2. **Plesk → domain → Git → Add Repository**
   - Repository type: **Remote (pull)**.
   - URL: same repo URL as above.
   - Branch: **`deploy`**
   - Deployment mode: **Automatic**.
   - **Do NOT** add any "additional deployment action" — there is no build step;
     Plesk just checks out already-built files.

3. **Point the document root at the deployed directory root** (the `deploy` branch
   checkout location — Plesk shows it on the Git page). The branch's root *is* the
   site, so the docroot is the checkout directory itself, no `dist/` subfolder.

4. **First deploy.**
   - Push to `main` → GitHub Actions runs "Deploy (Plan B)" → creates/updates the
     `deploy` branch.
   - Plesk → Git → **"Pull now"** for the `deploy` repository if it doesn't fire.
   - Verify `https://barrelshoetrading.com` as in Path A step 5.

---

## DNS + TLS (either path)

DNS is managed wherever the registrar (Hostinger, or whoever holds
`barrelshoetrading.com`) points the nameservers.

1. **A record:** `barrelshoetrading.com` → **`185.230.55.45`**
2. **`www`:** a `CNAME` `www` → `barrelshoetrading.com`, or a second `A` record
   `www` → `185.230.55.45`.
3. Allow for DNS propagation (minutes to a few hours).
4. **Let's Encrypt SSL in Plesk:** Plesk → domain → **SSL/TLS Certificates** →
   **Install a free basic certificate provided by Let's Encrypt**, covering both
   `barrelshoetrading.com` and `www.barrelshoetrading.com`. Enable
   "Redirect from HTTP to HTTPS".
5. **Canonical host.** `astro.config.mjs` sets
   `site: 'https://barrelshoetrading.com'` and `trailingSlash: 'always'`, so the
   apex (`barrelshoetrading.com`) is canonical. In Plesk, add a **301 redirect from
   `www.barrelshoetrading.com` → `https://barrelshoetrading.com`** (Plesk → domain →
   Hosting Settings, or a "Permanent SEO-safe 301 redirect from www to non-www"
   apache/nginx directive) so URLs match the sitemap and canonical tags.
6. **Mail:** unchanged. Do not touch MX records or mailboxes — only the web
   document root and web A/CNAME records change.

---

## Which path?

**Try Path A first.** It is the least moving parts: Plesk pulls `main`, builds, and
serves `dist/`. If the Plesk has no Node.js extension and it can't be enabled, use
**Path B**.

`.github/workflows/deploy.yml` is **harmless if Path A is used** — it just keeps a
`deploy` branch that Plesk ignores. Once Path A is confirmed working, the workflow
can be deleted, or its `push:` trigger removed so it only runs on manual dispatch.

The existing `.github/workflows/ci.yml` (check + test + build) runs on `main`,
`feat/**` and PRs to `main`. It deliberately does **not** run on the `deploy`
branch, so the force-pushed build branch won't trigger a redundant CI run.
