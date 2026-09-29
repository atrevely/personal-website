# personal-website: context for Claude Code

Content repo for Alexander's site **ajtrev.com**. Infra lives in the sibling repo `ajtrev-infra`
(`C:\Users\atrev\Documents\ajtrev-website`); read its CLAUDE.md for AWS details.

## Rules
- Only `site/` is deployed. Keep repo tooling (README, scripts, workflows, CLAUDE.md) outside it.
- Never put Terraform files, state, `.env`, or keys anywhere in this repo. The site bucket leaked TF state once.
- Deploys happen only through CI (`.github/workflows/deploy.yml`) on push to `main`. Don't `aws s3 sync` by hand.
- `site/**` is marked `-text` in `.gitattributes` so bytes ship unchanged (index.html uses CRLF).
- Work on a branch and open a PR; merging to `main` deploys immediately.
- The repo is **public** (since 2026-09-28): never commit anything that isn't fine on the open web.
- `main` is protected: PR required (0 approvals), status check `check` must pass, admins included,
  no force-push or deletion. Direct pushes to `main` are rejected.

## Site
- Single scrolling page `site/index.html` (inline CSS, Google Fonts; redesigned 2026-09-29, aimed at recruiters):
  - Hero: full-width coastline photo (`coast.webp` 2000w, `coast-1200.webp` for phones) with the header on a
    frosted panel: headshot, name, headline "Biotech Software & Data Infrastructure", bio, and one row of buttons
    (Download CV, Email, LinkedIn, GitHub). The panel is 740px wide so the name and buttons stay on one line; below
    800px it becomes a card under the photo with a 2x2 button grid. Re-check both when changing header text.
  - Sticky section nav (Experience / Research / Projects / Contact, `#anchor` links, highlighted by `main.js`).
  - Experience cards (newest first, with tags), Skills & Education, Research (summary + paper, then the
    step-by-step story whose images `main.js` swaps), Projects (result tiles + collapsible full story), Contact.
  - Wording in the bio, Research summary, Projects tiles and tags was drafted by Claude from Alexander's own text;
    he approved it on 2026-09-29. Don't invent facts about him; ask.
- Coastline photo: "Oregon coastline near Cannon Beach" by Abhinaba Basu, CC BY 2.0
  (https://commons.wikimedia.org/wiki/File:Oregon_coastline_near_Cannon_Beach.jpg). Attribution is required:
  keep the footer `.credit` line, and the in-image credit on `og-image.jpg`, whenever the photo is used.
- `me.webp`: headshot re-cropped (centered on the face) from the original `me_alaska.png` in git history.
- `og-image.jpg` (1200x630 link preview): coastline + circular headshot + name/headline + photo credit, generated
  with Pillow. Regenerate it when the name, headline or photos change.
- Images are WebP (optimized 2026-09-29: page images went from 2.5 MB to 0.38 MB). For new images: export at about
  2x the displayed CSS size, save WebP (photos quality 75-80, charts and line art about 90), no spaces in filenames,
  and give every `<img>` `width`/`height` attributes; add `loading="lazy"` unless it's above the fold.
  `dpr-scaling.jpg` stays JPEG (already small).
- Caching (set by `deploy.yml`): HTML `max-age=300`, everything else `max-age=86400`. To force returning visitors to
  get a changed image/JS/PDF right away, rename the file.
- Preview: `.claude/launch.json` config `site` serves `site/` on http://127.0.0.1:8000 (no headers);
  `site-csp` on :8001 adds the production security headers.
- Check: `python scripts/check_site.py site` (also fails on any leftover `data-todo` placeholder).
- Monitoring: `scripts/smoke_test.sh [base_url]` checks the live site (title, main.js, http->https and www->apex
  301s, cv.pdf, 404 page, security headers, TLS cert >= 30 days left). It runs hourly (`.github/workflows/uptime.yml`,
  minute 17; failures email the repo owner) and as the last step of every deploy. Update it when you change URLs,
  headers or the page title. GitHub disables schedules in public repos after 60 days without activity; re-enable
  from the Actions tab if the hourly runs stop.

- `site/404.html` is served by CloudFront for *any* missing path, so it must use absolute URLs only.
- JS lives in `site/main.js` (section-nav highlighting + research-image scroller); `index.html` has no inline scripts.

## Content Security Policy (set by CloudFront, defined in ajtrev-infra `main.tf`)
`default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';
object-src 'none'; upgrade-insecure-requests`. Consequences when editing:
- No inline `<script>` blocks, `on*=` handlers, or `javascript:` URLs; put JS in `.js` files. Inline CSS is fine.
- No `fetch`/XHR (no `connect-src`), no forms, no iframes/embeds, no `data:` images.
- Any new third-party origin (analytics, CDN, embed) needs a CSP change in ajtrev-infra first.
- Test with the `site-csp` preview (`scripts/serve_with_headers.py`, port 8001), which sends the production headers;
  keep its `HEADERS` in sync with the Terraform policy.

## CloudFront behavior (configured in ajtrev-infra)
- Missing objects: S3 via OAC returns 403; CloudFront maps 403 and 404 to `/404.html` with status 404
  (errors cached 60s). This needs ajtrev-infra PR #1; before that, 403 mapped to `/index.html` with 200.
- Cache: default TTL 1h; the deploy workflow invalidates `/*` after every sync.
