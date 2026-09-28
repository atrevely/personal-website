# personal-website: context for Claude Code

Content repo for Alexander's site **ajtrev.com**. Infra lives in the sibling repo `ajtrev-infra`
(`C:\Users\atrev\Documents\ajtrev-website`); read its CLAUDE.md for AWS details.

## Rules
- Only `site/` is deployed. Keep repo tooling (README, scripts, workflows, CLAUDE.md) outside it.
- Never put Terraform files, state, `.env`, or keys anywhere in this repo. The site bucket leaked TF state once.
- Deploys happen only through CI (`.github/workflows/deploy.yml`) on push to `main`. Don't `aws s3 sync` by hand.
- `site/**` is marked `-text` in `.gitattributes` so bytes ship unchanged (index.html uses CRLF).
- Work on a branch and open a PR; merging to `main` deploys immediately.

## Site
- Single page `site/index.html` (inline CSS/JS, Google Fonts), tabs: experience / research / projects / contact.
  Research tab swaps images via JS (`ice water.png`, `Bridges_of_Konigsberg.png`, `erdos-renyi.png`, etc.).
- `site/dpr-scaling.png` is actually JPEG data (served as image/png; browsers cope).
- Preview: `.claude/launch.json` config `site` serves `site/` on http://127.0.0.1:8000.
- Check: `python scripts/check_site.py site`.

## CloudFront quirks (configured in ajtrev-infra)
- 403 -> `/index.html` with 200, so a missing file shows the home page instead of an error.
- 404 -> `/404.html`, which doesn't exist (and S3 via OAC returns 403 for missing keys anyway).
- Cache: default TTL 1h; the deploy workflow invalidates `/*` after every sync.
