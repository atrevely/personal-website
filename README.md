# personal-website

Content for **https://ajtrev.com**: a static, hand-written site with no build step.

## Layout
- `site/`: everything that gets deployed. It is synced as-is to `s3://ajtrev.com` and served by CloudFront.
- `scripts/check_site.py`: pre-deploy checks. It rejects Terraform, env or key files in `site/` and broken local links.
- `.github/workflows/deploy.yml`: on PRs, runs the check. On push to `main` (when `site/**` changes), it syncs
  `site/` to S3 with `--delete` and invalidates CloudFront.

## Editing
1. Branch, edit files under `site/`.
2. Preview locally: `python -m http.server 8000 --directory site`, then open http://127.0.0.1:8000.
3. Open a PR (the check runs), then merge to deploy.

## Infrastructure
Bucket, CloudFront, DNS and cert live in [`atrevely/ajtrev-infra`](https://github.com/atrevely/ajtrev-infra) (Terraform).
CI deploys with the OIDC role `ajtrev-site-deploy`, which is created by hand outside Terraform. It can only list, put, get
and delete objects in `ajtrev.com`, and invalidate distribution `E3PNNSDLVB4LOK`. It trusts pushes to `main` of this repo only.

The previous contents of this repo (an AI Studio "AWS Terraform Architect" app) are preserved at tag `archive/ai-studio-app`.
