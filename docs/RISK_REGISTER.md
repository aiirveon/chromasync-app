# Risk Register
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni  
**Last Updated:** March 2026  
**Framework:** ISO 31000

Likelihood: 1 (rare) to 5 (almost certain)  
Impact: 1 (negligible) to 5 (critical)  
Score: Likelihood x Impact

---

## RISK 001: Cold Start Latency Causes Silent Failure

**Category:** Technical  
**Likelihood:** 4  
**Impact:** 3  
**Score:** 12 (HIGH)

**Description**  
ChromaSync API runs on Render's free tier. After a period of inactivity, the server goes to sleep. When a user arrives and the server is dormant, the first API call fails silently. The user sees no error message and no loading state. They click Save and Continue and nothing happens, or the story fails to save.

**Current Mitigation**  
A silent health ping is sent to the API on component mount at the Cold Open stage. This wakes the server before the user needs it. The ping fires in the background and does not block the UI.

**Residual Risk**  
The health ping reduces cold start failures significantly but does not eliminate them. If a user navigates directly to a later stage, or if the server takes longer than usual to wake, failures can still occur.

**V2 Plan**  
Upgrade to a paid Render tier with always-on server instances. Add explicit loading states and retry logic to every API call so failures are visible and recoverable rather than silent.

---

## RISK 002: AI Output Monoculture

**Category:** Product Quality  
**Likelihood:** 3  
**Impact:** 4  
**Score:** 12 (HIGH)

**Description**  
Without intervention, large language models converge on the same story patterns regardless of the writer's input. If every writer using ChromaSync ends up with loglines about orphans accepting their destiny, the product has failed its purpose and will generate negative word of mouth among the creative community it is trying to serve.

**Current Mitigation**  
The AVOID_LIST is injected into every prompt. It explicitly blocks the most overused wounds, structures, and resolution shapes. It is treated as a living document and updated as new patterns are identified.

**Residual Risk**  
The AVOID_LIST blocks known overused patterns but cannot anticipate new ones. As more writers use the tool, new monoculture patterns may emerge that are not yet on the list.

**Monitoring**  
Review a sample of completed story bibles monthly. If more than 20% share structural patterns not on the AVOID_LIST, add those patterns to the list.

---

## RISK 003: Writer Drops Off at Character Forge

**Category:** Product  
**Likelihood:** 4  
**Impact:** 3  
**Score:** 12 (HIGH)

**Description**  
The Character Forge stage asks the writer to articulate their protagonist's wound: the formative experience that shaped the lie they believe. This is the most conceptually demanding stage in the flow. Writers without screenwriting craft knowledge may not understand what a wound is, may not be able to identify one for their protagonist, or may feel that the question is too personal or too difficult.

**Current Mitigation**  
The wound input has a detailed placeholder example explaining the kind of answer expected. Wound suggestions are generated from the logline and interrogation answers so the writer has options if they are stuck. The field is optional in the sense that the writer can write anything, not just a formally correct wound.

**Residual Risk**  
The conceptual difficulty of the wound question is real. A placeholder and suggestions reduce friction but do not eliminate the cognitive load.

**V2 Plan**  
Add a brief explainer inline at the wound input field that explains what a wound is in plain language with a concrete example. Consider adding a "not sure yet" option that lets the writer proceed and return to refine their wound later.

---

## RISK 004: State Loss on Navigation

**Category:** Technical  
**Likelihood:** 2  
**Impact:** 4  
**Score:** 8 (MEDIUM)

**Description**  
If a user navigates away from a stage before their answer is committed and saved, they lose their progress on that stage. This is most likely to happen during the Character Forge stage where multiple sub-steps exist before the final save occurs.

**Current Mitigation**  
All completed stages are saved to Supabase immediately on completion. Character forge state (wound input, character name, character fields, STC options) is lifted to the dashboard level so it persists across back-navigation within the session.

**Residual Risk**  
In-progress answers on the current stage are not saved to Supabase in real time, only on stage completion. A browser close or crash during an in-progress stage loses the current stage's unsaved work.

**V2 Plan**  
Add debounced autosave for in-progress text inputs so partial answers are also persisted to Supabase as the writer types.

---

## RISK 005: Suggestions Not Grounded in Story Context

**Category:** Product Quality  
**Likelihood:** 2  
**Impact:** 4  
**Score:** 8 (MEDIUM)

**Description**  
If suggestion endpoints receive incomplete story context, the suggestions feel generic and irrelevant. A writer who receives generic suggestions loses confidence in the tool and is less likely to continue.

**Current Mitigation**  
Every suggestion endpoint is designed to receive the full accumulated story state at the point it is called. The frontend passes interrogation answers, theme, logline, character name, wound answer, and completed beats to every relevant endpoint. This was a deliberate architectural decision and required significant refactoring to implement correctly.

**Residual Risk**  
If the frontend fails to pass certain context fields due to a state management error, suggestions degrade silently. There is no validation that the backend received the expected context.

**V2 Plan**  
Add server-side logging of received context per suggestion call. Alert if any primary context field (logline, wound, interrogation answers) is missing from a suggestion request.

---

## RISK 006: Over-Reliance on Free Tier Infrastructure

**Category:** Technical and Business  
**Likelihood:** 5  
**Impact:** 2  
**Score:** 10 (MEDIUM)

**Description**  
Both the API (Render free tier) and database (Supabase free tier) have usage limits that will be hit as the user base grows. Render free tier has bandwidth limits and limited concurrent requests. Supabase free tier has row limits and bandwidth caps. Neither is suitable for production scale.

**Current Mitigation**  
Free tiers are appropriate for a portfolio project with limited users. The architecture is designed to migrate without major changes: Render and Supabase both have paid tiers that offer the same APIs with higher limits.

**V2 Plan**  
Before any public launch or press coverage, upgrade to paid tiers. The migration path is a configuration change, not a rewrite.

---

## Risk Summary Table

| ID | Description | Score | Level |
|----|-------------|-------|-------|
| RISK-001 | Cold start silent failure | 12 | HIGH |
| RISK-002 | AI output monoculture | 12 | HIGH |
| RISK-003 | Character forge drop-off | 12 | HIGH |
| RISK-004 | State loss on navigation | 8 | MEDIUM |
| RISK-005 | Decontextualised suggestions | 8 | MEDIUM |
| RISK-006 | Free tier infrastructure limits | 10 | MEDIUM |
