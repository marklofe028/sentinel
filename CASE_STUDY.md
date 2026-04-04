# Why I Built a Security Auditor for the Vibe Coding Era — And What the Architecture Taught Me

**By Mark Lofe Bagamano** — Senior Software Engineer, 14 years experience

---

## The problem I kept seeing

In early 2025, a pattern started appearing in tech communities across Southeast Asia and globally: non-technical founders and junior developers were shipping full applications to production over a weekend — sometimes overnight — using AI tools like Cursor, Lovable, Bolt, and GitHub Copilot.

The applications *worked*. That was the point. The AI wrote functional code that did exactly what it was asked to do.

What it didn't do was everything it wasn't asked to do.

- Nobody asked it to rate-limit the authentication endpoint
- Nobody asked it to exclude `.env` from git
- Nobody asked it to pin dependency versions
- Nobody asked it to add security headers
- Nobody asked it to check whether `lodash@4.17.20` had a known prototype pollution CVE

The result: real applications, real users, real data — secured by vibes.

I've worked in software for 14 years, most recently in backend and cloud infrastructure supporting large-scale, high-availability systems on night shifts. I've seen what happens when deployment hygiene gets skipped at scale. When I started seeing the same patterns appearing in a new context — AI-assisted code that nobody was reviewing — I decided to build something about it.

---

## Decision 1: Three-tier pushback instead of a flat checklist

My first instinct was to build a flat checklist. A script that runs through a list of checks, prints pass/fail, exits.

I didn't build that. Here's why.

A flat checklist treats all problems as equal. A missing `.env.example` is not the same severity as a hardcoded Stripe live key. Flagging both at the same volume means developers learn to ignore the noise — and then they ignore the signal too.

I designed three tiers instead:

**Tier 1 — Advisory**: Flags the issue, executes anyway, appends a one-sentence note. Never interrupts flow. Example: an unpinned dependency version.

**Tier 2 — Friction gate**: Pauses before executing. States the specific issues. Asks: "Fix first, or proceed anyway?" If confirmed, executes immediately without re-warning. Example: audit score below threshold before a production deploy.

**Tier 3 — Hard block**: Refuses entirely. No override. Names the specific credential or risk — not a generic warning. Offers the safe path. Example: committing a `.env` file containing a live Stripe key.

The tiered model does something important: it teaches the developer what actually matters. By the time they've seen a few Tier 3 blocks and a dozen Tier 1 advisories, they understand the difference intuitively. The tool becomes educational without lecturing.

There's also a session memory concept: once a developer acknowledges a Tier 2 issue and proceeds anyway, it gets logged. The tool never re-raises the same warning in the same session. This is what separates a useful guardian from an annoying one.

---

## Decision 2: Monorepo with a shared core engine

I could have built this as a single Node.js CLI script. That would have been done in hours.

Instead I built a monorepo with five packages:

```
assay/
├── packages/core      # audit engine — rules, scoring, types
├── packages/cli       # assay audit .
├── packages/web       # Next.js dashboard
├── packages/vscode    # VS Code extension (in progress)
└── packages/voice     # voice co-pilot layer (in progress)
```

The reason: **the audit logic should be written once and available everywhere.**

If I write the secrets detection rule in the CLI, and then build the web dashboard, I have two choices: duplicate the code, or refactor. Duplication means drift — the web dashboard catches different things than the CLI. Refactoring under time pressure means bugs.

By making `@assay-dev/core` a proper package that the CLI, web dashboard, VS Code extension, and voice layer all import, I get a single source of truth. A CVE added to the dependency rule today automatically appears in every surface tomorrow. The scoring algorithm updates once and all outputs reflect it.

The tooling choice — pnpm workspaces with Turborepo — handles the dependency graph automatically. Turbo knows that if only `packages/core` changes, it needs to rebuild the CLI and VS Code extension but can skip the web dashboard if it hasn't changed. Build times stay fast as the project scales.

---

## Decision 3: The audit engine as a rule registry

Inside `packages/core`, every audit check follows a single interface:

```typescript
export interface Rule {
  id: string
  name: string
  tier: PushbackTier        // 1 | 2 | 3
  check: (ctx: ScanContext) => Issue[]
}
```

Every rule is pluggable. Adding a new check means dropping a new file into `packages/core/src/rules/` and adding it to the registry in `auditor.ts`. No other files change. No existing rules break.

This matters because the rule library will grow. The four rules I launched with — secrets detection, environment hygiene, dependency safety, deployment readiness — are the start, not the end. SQL injection patterns, missing authentication middleware, exposed stack traces — each is a new file, not a modification to existing code.

The scoring function is deliberately simple:

```
100 - (critical issues × 25) - (warning issues × 10) - (advisory issues × 3)
```

Simple scoring is honest scoring. You can explain to a non-technical founder exactly why their score is 58: "Two warnings and one critical. Fix the critical — that's the hardcoded API key — and you're at 83."

---

## Decision 4: Specificity over generics in issue output

Every `Issue` object requires a `detail` field that names the specific file, line, variable, or package involved — not a generic description.

```
// What most tools output:
"Hardcoded credential detected"

// What Assay outputs:
"src/config.ts contains what looks like a Stripe live key: 'sk_live_ab...'"
```

Generic warnings are ignorable. Specific warnings get fixed.

The same principle applies to fix suggestions. Every issue includes a `fix` field: one sentence, concrete action, copy-pasteable where possible.

```
Fix: Move to .env and add .env to .gitignore.
     Rotate the key immediately if already committed.
```

Not "review your security practices." One sentence. Do this.

---

## Decision 5: The voice layer and persona design

The voice layer is the expression of a specific thesis: **the interface that gets used is the one that requires the least friction to reach.**

A developer in flow doesn't want to alt-tab to a browser dashboard. They don't want to stop and run a CLI command. They want to continue working and have someone tap them on the shoulder when something needs attention.

The wake word is "Hey Assay." The persona has a specific character: direct, dry, never lectures, pushes back once and respects decisions, never apologizes for a hard block.

The system prompt governing this persona is production-grade. It includes:

- A two-mode operating model (working mode / guardian mode) with explicit instructions not to announce mode switches
- The three-tier pushback hierarchy translated into conversational behavior
- A `{{SESSION_ACKNOWLEDGED}}` runtime variable that prevents re-raising warnings the developer has already accepted
- Explicit tone rules: no filler openers, no passive voice, specificity over generality

The persona design is informed by one question: **what does a principal engineer who has been burned by bad deployments actually sound like when trying to stop you from making a mistake?**

Not bureaucratic. Not alarming. Dry, specific, and right.

---

## What GitHub taught me about my own tool

While pushing this project to GitHub, the push was rejected.

GitHub's secret scanning detected a Stripe live key pattern in `packages/core/src/rules/secrets.test.ts` — the test file where I'd written a fake key to verify the detection rule worked.

Assay caught the same pattern earlier in local testing. Then GitHub caught it independently.

The tool found a real vulnerability in its own test suite. This is the most honest validation a security tool can get: it found something real, in its own codebase, that a major platform also flagged independently.

This incident is now the lead of every demo I give.

---

## What I learned about architecture at this scale

**1. The interface is part of the architecture.** Deciding how a tool communicates its output is as important as what it checks. A flat list of findings is an architectural choice that shapes behavior. A tiered system with specific recommendations shapes different behavior.

**2. Pluggability is a forcing function for clean design.** Committing to a rule registry pattern forced a clean `Rule` interface early. That constraint made every subsequent rule easier to write because the contract was clear.

**3. Persona design is software design.** The system prompt governing the voice layer is code. It has logic, state, and contracts. Treating it as documentation produces a generic assistant. Treating it as a production artifact produces a consistent, reliable character.

**4. The monorepo pays for itself immediately.** The `@assay-dev/core` package is imported by four other packages. Every bug fix and every new rule propagates automatically. The overhead of setting up pnpm workspaces and Turborepo was a few hours. The payoff started on day two.

**5. Build for the person who needs it most, not the person who will understand it easiest.** The target user is someone who doesn't know what a CVE is. Every design decision — the scoring, the specific output, the plain-language fix suggestions, the voice layer — is optimized for that person, not the security professional who already knows what they're doing.

---

## Current state and what's next

Assay currently ships with:

- A working CLI: `assay audit .` produces a scored report on any project
- A web dashboard with live audit runs in the browser
- Four audit rules: secrets detection, environment hygiene, dependency CVEs, deployment readiness
- A documented voice persona and system prompt, ready for integration

In progress:

- `assay init <domain>` — domain-aware bootstrap templates
- VS Code extension — inline hints without leaving the editor
- Voice layer integration — ambient co-pilot with proactive alerts
- Additional audit rules — SQL injection patterns, auth middleware gaps, CORS policy depth

---

## The bigger point

AI coding tools are not going away. Vibe coding is not a phase. The pace of application development is going to keep accelerating, and the gap between "it works" and "it's safe to ship" is going to keep widening.

The tools that exist to close that gap are mostly built for enterprise security teams — complex, expensive, and aimed at codebases that already have a security culture. They are not built for the solo founder who shipped their app over the weekend and is about to give 10,000 users access to it.

Assay is built for that person. Not to replace security expertise, but to make the most important parts of security expertise accessible to someone who doesn't have 14 years of it.

That's what I was trying to build. I think it's worth building.

---

*Mark Lofe Bagamano is a Senior Software Engineer with 14 years of experience in backend and cloud infrastructure, most recently in backend cloud infrastructure for enterprise-scale systems. He is based in Tacurong City, Sultan Kudarat, Philippines.*

*GitHub: [github.com/marklofe028](https://github.com/marklofe028)*  
*LinkedIn: [linkedin.com/in/mlbagamano](https://linkedin.com/in/mlbagamano)*
