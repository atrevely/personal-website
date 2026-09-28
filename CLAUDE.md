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
- Single page `site/index.html` (inline CSS/JS, Google Fonts), tabs: experience / research / projects / contact.
  Research tab swaps images via JS (`ice water.png`, `Bridges_of_Konigsberg.png`, `erdos-renyi.png`, etc.).
- `site/dpr-scaling.png` is actually JPEG data (served as image/png; browsers cope).
- Preview: `.claude/launch.json` config `site` serves `site/` on http://127.0.0.1:8000.
- Check: `python scripts/check_site.py site`.

- `site/404.html` is served by CloudFront for *any* missing path, so it must use absolute URLs only.

## CloudFront behavior (configured in ajtrev-infra)
- Missing objects: S3 via OAC returns 403; CloudFront maps 403 and 404 to `/404.html` with status 404
  (errors cached 60s). This needs ajtrev-infra PR #1; before that, 403 mapped to `/index.html` with 200.
- Cache: default TTL 1h; the deploy workflow invalidates `/*` after every sync.
