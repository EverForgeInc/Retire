# Project Connections Template

Copy this file to `.cursor/project-connections.md` inside each project and fill it out before using deployment skills.

## Project

Project name:

```text
PROJECT_NAME_HERE
```

Project type:

```text
React webapp
Next.js app
FastAPI backend
Python CLI
Full stack app
AI app
Dashboard app
Training simulator
Internal enterprise tool
Mobile PWA
Other
```

## GitHub

Repository:

```text
https://github.com/OWNER/REPO.git
```

Remote name:

```text
origin
```

Default branch:

```text
main
```

Protected branches:

```text
main
master
prod
production
release
```

## Deployment Provider

Provider:

```text
Vercel
Netlify
GitHub Actions
Render
Docker
Manual
None
```

Deployment mode:

```text
GitHub push triggers deployment
Manual deployment only
CI workflow handles deployment
Not configured
```

Production URL:

```text
https://YOUR-PRODUCTION-DOMAIN.com
```

Preview URL policy:

```text
Preview URLs are not production unless explicitly listed here.
```

Manual deploy allowed:

```text
No, unless explicitly requested by the user.
```

## Protected Files

Never commit:

```text
.env
.env.*
*.pem
*.key
*.p12
*.pfx
*.crt
*.cer
id_rsa
id_ed25519
*.sqlite
*.db
*.log
.DS_Store
node_modules/
dist/
build/
coverage/
.cache/
.vercel/
.netlify/
```

## Final Agent Report

After deployment or push workflows, report:

```text
Branch:
Commit:
Remote:
Checks:
Deployment provider:
Expected deployment behavior:
Production URL:
Warnings:
```
