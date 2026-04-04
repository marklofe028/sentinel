# Sentinel

**The senior engineer watching every line you ship.**

Sentinel is a security auditor built for the AI-assisted development era. It catches what vibe coding misses — hardcoded secrets, vulnerable dependencies, missing environment hygiene, and deployment anti-patterns — before they hit production.

---

## The problem

AI coding tools have made it possible for anyone to ship a working application over a weekend. That's genuinely exciting. It's also dangerous.

Working is not the same as secure. A vibe-coded app can pass every manual test and still have a hardcoded Stripe key, a CORS wildcard, a known CVE in a dependency, and no rate limiting on the auth route — all at the same time.

Sentinel exists to be the senior dev in the room when there isn't one.

---

## Demo

While building Sentinel, GitHub blocked our own push because the test file contained a fake Stripe key pattern used to verify the detection rule. Sentinel caught it. Then GitHub caught it. That's the point.

---

## What it catches

| Rule | Tier | Example |
|------|------|---------|
| Hardcoded secrets | BLOCK | `sk_live_` keys, GitHub PATs, AWS access keys in source |
| `.env` not in `.gitignore` | BLOCK | Credentials committed to version control |
| Known CVEs | WARN | `lodash@4.17.20`, `jsonwebtoken<9.0.0` |
| DEBUG flag in source | WARN | `DEBUG=true` hardcoded outside `.env` |
| CORS wildcard | WARN | `origin: "*"` in production server config |
| No rate limiting on auth | WARN | `/auth` routes without brute-force protection |
| Unpinned dependencies | ADVISORY | `^` and `~` ranges in `package.json` |
| Missing `.env.example` | ADVISORY | No reference for required environment variables |
| No security headers | ADVISORY | Server initialized without `helmet` |

---

## Scoring

Every issue reduces the score from 100:
```
Critical (Tier 3 — BLOCK)    -25 points each
Warning  (Tier 2 — WARN)     -10 points each
Advisory (Tier 1 — ADVISORY)  -3 points each
```

Default deployment threshold: **70/100**. Below that, Sentinel blocks and tells you exactly what to fix.

---

## Getting started

### CLI
```bash
npm install -g @sentinel-dev/cli

# audit any project
sentinel audit .

# audit a specific path
sentinel audit ~/projects/my-app
```

### Web dashboard

Visit the live dashboard to run an audit in the browser:
**[sentinel.vercel.app](https://sentinel.vercel.app)** ← update with your real URL

---

## Output
```
SENTINEL AUDIT REPORT
────────────────────────────────────────
Score:    58 / 100
Files:    42
Issues:   6
Status:   [SENTINEL:BLOCK] Below threshold — review issues first
────────────────────────────────────────

[BLOCK] Hard blocks (1)
  ✕ Stripe live key detected in source file
    src/config.ts contains what looks like a Stripe live key: "sk_live_..."
    Fix: Move to .env and add .env to .gitignore. Rotate the key immediately.

[WARN] Friction gates (3)
  ⚠ DEBUG=true found in source file
  ⚠ CORS wildcard origin detected
  ⚠ Auth route has no rate limiting

[ADVISORY] Advisories (2)
  · Unpinned dependency: lodash
  · No .env.example file found
```

---

## Architecture

Sentinel is a TypeScript monorepo built with pnpm workspaces and Turborepo.
```
sentinel/
├── packages/
│   ├── core/      # audit engine — rules, scoring, types
│   ├── cli/       # sentinel audit . command
│   ├── web/       # Next.js dashboard
│   ├── vscode/    # VS Code extension (coming soon)
│   └── voice/     # "Hey Sentinel" voice layer (coming soon)
```

The core engine is shared across all surfaces. A rule written once runs in the CLI, the web dashboard, the VS Code extension, and the voice layer.

---

## Roadmap

- [x] Core audit engine
- [x] CLI — `sentinel audit .`
- [x] Web dashboard
- [ ] `sentinel init <domain>` — bootstrap templates (SaaS, API, mobile)
- [ ] VS Code extension — inline hints as you type
- [ ] Voice layer — "Hey Sentinel" Jarvis-style co-pilot
- [ ] GitHub URL scanner — audit any public repo
- [ ] CI/CD integration — GitHub Actions, GitLab CI

---

## The vision

Sentinel is two things with one name.

A **sentinel** watches for danger and raises the alarm before damage is done.

Something **sentient** understands context, reasons about risk, and responds with judgment — not just rules.

Most security tools are pure sentinel: pattern match, flag, exit. Sentinel aims to be both: the rule-based audit layer AND the intelligent co-pilot that explains why something is dangerous, offers the fix in the same breath, and remembers what you've already acknowledged.

The voice layer — currently in development — brings this to life. Think Jarvis from Iron Man: ambient awareness, proactive alerts, and a persona that pushes back when you're about to do something you'll regret.

---

## Built by

Mark Lofe Bagamano — Senior Software Engineer  
[GitHub](https://github.com/marklofe028) · [LinkedIn](https://linkedin.com/in/your-handle)

---

*"You are not here to be liked. You are here to be right."*  
— Sentinel system prompt
