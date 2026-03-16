# Product Requirements Document
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni  
**Status:** In Progress  
**Last Updated:** March 2026

---

## Problem

Solo indie filmmakers carry two burdens at once. The first is technical: keeping colour consistent across a shoot they are running alone. The second is creative: most of them have story ideas sitting unwritten because the path from a raw idea to a structured screenplay is unclear and intimidating without formal training or a development team.

Existing writing tools do not solve this. Final Draft and Celtx assume you already have a story and just need to format it. ChatGPT and similar AI tools generate a complete story for you, which removes the writer from the process entirely. Neither approach helps a filmmaker discover and develop their own story through their own voice.

ChromaSync Story Engine is built for the filmmaker who has an idea but does not yet know what their story is. It is a guided discovery tool, not a generator.

---

## Users

**Primary User: The Solo Indie Filmmaker**

This person shoots, directs, and edits alone or with a very small crew. They have a story they want to tell but lack the structural knowledge or development support to get from idea to screenplay. They are comfortable with creative tools but not necessarily with screenwriting craft. They want to own their story, not receive one from a machine.

**Secondary User: The First-Time Screenwriter**

This person has never written a screenplay before. They understand story instinctively from years of watching films but cannot translate that instinct into structure. They need guidance through the process, not instruction about the process.

---

## User Stories

**Cold Open**
As a filmmaker, I want to enter my raw story idea in any form (a title, a feeling, a sentence, a person) so that I can start the process without needing to have a formed concept already.

**Interrogation**
As a filmmaker, I want to be asked three specific questions about my story world so that the AI has enough grounding to give me suggestions that feel specific to my idea rather than generic.

**Logline Forge**
As a filmmaker, I want to see three different versions of my logline so that I can choose the angle that resonates most with what I am actually trying to say.

**Theme**
As a filmmaker, I want to see and edit the primal question underneath my story so that every suggestion from that point forward is oriented around the real emotional truth of my work.

**Character Forge**
As a filmmaker, I want to discover my protagonist's wound, lie, want and need through a guided process so that my character has psychological depth that came from my own thinking, not from a template.

**Beat Board**
As a filmmaker, I want to answer one specific question per beat so that I build my story structure incrementally rather than facing the whole thing at once.

**Story Bible**
As a filmmaker, I want to see everything I have built in one place at any stage so that I can review my story as a whole while I am still developing it.

**Resume**
As a filmmaker, I want to close the app and come back later and find my story exactly where I left it so that I can work on it across multiple sessions without losing anything.

---

## Functional Requirements

**FR-01: Progressive story flow**  
The app guides the user through six stages in order. No stage is skipped. Each stage is unlocked only after the previous one has a committed answer.

**FR-02: Context-aware suggestions**  
Every suggestion endpoint receives the full accumulated story state at the point it is called. Interrogation question 2 receives the committed answer from question 1. Character forge suggestions receive the logline, theme, interrogation answers, wound and character name. Beat suggestions receive all prior completed beats.

**FR-03: Negative constraint injection**  
Every prompt sent to the AI includes the AVOID_LIST, a set of explicit negative constraints blocking the most overused story defaults. This prevents the AI from pattern-matching to familiar tropes regardless of how sparse the writer's input is.

**FR-04: Incremental persistence**  
Every user action that commits an answer is saved to Supabase immediately. Interrogation answers are saved on continue. Wound and character name are saved on submit. Beats are saved after each individual beat submission. The user should never lose work because they closed the app.

**FR-05: Full resume from last action**  
When a user resumes a story, the app restores every piece of state from Supabase and routes them to the correct stage. Completed beats are pre-loaded into the beat board. The user resumes exactly where they stopped.

**FR-06: Story Bible always accessible**  
The Story Bible panel is available from stage 2 onwards. It shows the logline, theme, character profile (name, wound, lie, want, need, Save the Cat scene) and all completed beats. It does not require navigating away from the current stage.

**FR-07: No locked AI output**  
Every field that the AI generates can be edited by the writer. Every suggestion is optional. The writer commits answers, not the AI.

**FR-08: Multiple frameworks**  
The beat board supports four story frameworks: Save the Cat (15 beats), John Truby Moral Argument (18 beats), Dan Harmon Story Circle (8 beats), and Short Story (5 beats). The framework is selected at the Cold Open stage.

---

## Non-Functional Requirements

**NFR-01: Cold start handling**  
The backend runs on Render's free tier. The app sends a silent health ping to the API on component mount to wake the server before the user needs it.

**NFR-02: Mobile first**  
All stages are fully usable on mobile. The layout uses a bottom navigation bar, safe area insets, and a fixed top header. No horizontal scrolling. Touch targets meet WCAG AA minimum size.

**NFR-03: Design system**  
All colours, spacing, and layout values are defined as CSS custom properties in a single root declaration. No hardcoded values anywhere in the component tree.

**NFR-04: API response validation**  
Every AI response is validated against its expected JSON schema before being used. Malformed responses are caught and surfaced as user-facing error messages rather than silent failures.

---

## Success Metrics

**Primary**  
Resume completion rate: the percentage of resumed stories where the user completes at least one more stage after resuming. Target above 60%.

**Secondary**  
Suggestion adoption rate: the percentage of suggestion chips clicked at least once per session. Target above 40%. This is a proxy for whether the suggestions feel relevant and grounded rather than generic.

Beat board completion rate: the percentage of started beat boards where the user completes all beats. Target above 30% within 90 days of launch.

**Counter-metrics**  
Override rate per field: if more than 50% of users edit or replace a generated field immediately after it appears, the generation quality for that field needs to be investigated.

Drop-off rate by stage: if a disproportionate number of users stop at the same stage, that stage has a friction or value problem that needs addressing.

---

## Out of Scope for V1

Scene-level development beyond beats. First draft generation. Collaboration between multiple writers. Export to Final Draft or PDF screenplay format. Mobile app (native). Support for languages other than English.
