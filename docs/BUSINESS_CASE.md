# Business Case
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni
**Last Updated:** March 2026
**Document Type:** Business Analysis

---

## Executive Summary

Solo indie filmmakers spend 20 to 40 hours developing a story from raw idea to structured beat sheet, using a fragmented collection of free tools that provide no AI guidance specific to their idea. Most story ideas that enter development are never completed. ChromaSync Story Engine reduces this time to 90 to 120 minutes by providing a guided six-stage development flow with context-aware AI suggestions grounded in the filmmaker's own committed answers.

This document sets out the problem, the opportunity, the proposed solution, the investment required, and the expected return.

---

## The Problem

### Who experiences it
Solo indie filmmakers, first-time screenwriters, and content creators transitioning to narrative film. This group operates without development budgets, without story editors, and without access to professional script development support.

### What the problem costs them

**Time:** 20 to 40 hours per story development cycle before a single scene is written. This time is spent on research, logline rewrites, framework application, and getting stuck on individual beats.

**Momentum:** The estimated abandonment rate for story ideas that enter the beat sheet stage is above 60%. Most ideas that a filmmaker commits to developing never reach a completed beat sheet. The primary cause is friction at key stages, particularly the logline and character development stages, where the filmmaker has no guidance specific to their idea.

**Quality:** Generic AI tools and downloaded templates produce suggestions that could fit any story. The resulting story development work lacks the specificity that makes a story compelling. Filmmakers know their output is generic but do not have the tools to make it otherwise.

**Opportunity cost:** Every hour a filmmaker spends on development overhead is an hour not spent shooting, editing, or developing their craft.

---

## The Opportunity

### Market

The UK and European indie filmmaker community is estimated at over 2 million active practitioners, the majority of whom operate without professional script development support. The global independent film market was valued at over 6 billion USD in 2023 and continues to grow, driven in part by the reduction in production costs from smartphone cameras and editing software.

The AI creative tools market is growing rapidly. Tools like Sudowrite and Jasper have demonstrated that creative practitioners will pay for AI assistance in their workflow. The gap in the market is a tool that keeps the creative in control rather than replacing them.

### The specific gap

No existing tool addresses the blank page problem for filmmakers with structured story methodology and context-aware AI. Final Draft and Celtx are formatting tools. Sudowrite writes for the creator. ChatGPT and general AI tools generate generic output without any structured framework. ChromaSync is the only tool that guides a filmmaker through professional story methodology using their own committed answers as the basis for every AI suggestion.

---

## The Proposed Solution

ChromaSync Story Engine is a six-stage guided story development tool. The stages are Cold Open, Interrogation, Logline Forge, Character Forge, Beat Board, and Story Bible. Each stage unlocks only after the previous one is completed. Every AI suggestion is generated from the full accumulated story context. Every answer is saved to the database immediately and the filmmaker can resume from the exact last action in any future session.

The product is live at chromasync-app.vercel.app. The full technical architecture is documented in ARCHITECTURE.md in this repository.

---

## Investment Required

### To reach current V1 state

| Item | Cost |
|---|---|
| Developer time (solo build, 4 months) | Sweat equity |
| Claude API usage during development | Under 50 GBP |
| Render backend hosting (free tier) | 0 GBP |
| Supabase database (free tier) | 0 GBP |
| Vercel frontend hosting (free tier) | 0 GBP |
| Domain and tooling | Under 20 GBP |
| Total V1 investment | Under 70 GBP cash |

### To reach production scale (V2)

| Item | Estimated Monthly Cost |
|---|---|
| Render paid tier (always-on server) | 25 USD per month |
| Supabase paid tier (production database) | 25 USD per month |
| Claude API at scale (1,000 active users) | 200 to 500 USD per month |
| Total estimated monthly at 1,000 users | 250 to 550 USD per month |

---

## Expected Return

### Direct revenue model

**Freemium subscription:** Free tier includes 3 stories per month. Paid tier at 12 GBP per month includes unlimited stories, advanced framework options, and export features. At 1,000 paying users this generates 12,000 GBP per month.

**One-time export fee:** 3 GBP per story export to PDF or Final Draft format. This monetises casual users who do not subscribe.

### Indirect return

**Portfolio value:** ChromaSync demonstrates full-stack AI product development, prompt engineering, ethical AI design, and production-grade engineering. This has direct commercial value in the job market for AI PM and AI BA roles, where projects of this depth are rare at the portfolio stage.

**Platform value:** The Story Engine adds a second product pillar to ChromaSync alongside the Colour product. A filmmaker who uses both products for a single project creates significantly more platform stickiness than a filmmaker who uses only one.

---

## Risk Summary

Full risk documentation is in RISK_REGISTER.md. The three highest priority risks for the business case are:

**Cold start latency:** The Render free tier causes API failures after inactivity. This is mitigated by a health ping on component mount but needs a paid tier upgrade before any public marketing.

**Free tier infrastructure limits:** Both Supabase and Render have usage limits that will be hit with real user growth. The migration path to paid tiers is a configuration change and costs under 600 USD per year at modest scale.

**AI output monoculture:** If all users receive similar suggestions, the product fails its core purpose and generates negative word of mouth. This is actively mitigated by the AVOID_LIST negative constraint injection, which is reviewed and updated as new patterns emerge.

---

## Recommendation

The V1 investment is under 70 GBP cash and 4 months of developer time. The product is live, functional, and demonstrably addresses a real problem experienced by a large and growing market. The next investment priority is upgrading to paid hosting tiers before any public marketing, estimated at under 600 USD per year. At 1,000 paying subscribers the product covers its infrastructure costs and generates positive unit economics at the 12 GBP per month price point.

The recommendation is to proceed to V2 with real user testing, paid tier infrastructure, and export functionality as the first three priorities.
