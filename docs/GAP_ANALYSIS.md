# Gap Analysis
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni
**Last Updated:** March 2026
**Document Type:** Business Analysis

---

## Purpose

This document identifies the gaps between how solo indie filmmakers currently develop stories (as-is) and how they will develop stories using ChromaSync (to-be). Each gap is described, sized, and mapped to the specific ChromaSync feature that closes it.

---

## Summary Gap Table

| Gap | As-Is | To-Be | Feature That Closes It |
|---|---|---|---|
| Time to complete story development | 20 to 40 hours | 90 to 120 minutes | Full six-stage guided flow |
| Specificity of guidance | Generic frameworks from external sources | Suggestions grounded in filmmaker's own committed answers | Context-aware suggestion endpoints |
| State persistence | Scattered notes across multiple apps | Every action saved to Supabase immediately | Incremental Supabase persistence |
| Resumability | Manual reconstruction from memory | Resume from exact last action | Stage routing from Supabase state |
| AI monoculture risk | None. AI tools generate generic output | AVOID_LIST blocks overused story defaults | Negative constraint injection |
| Character development support | Generic worksheet applied in isolation | Character generated from specific wound and logline | Character Forge stage |
| Logline development | 5 to 20 manual rewrites over days | 3 grounded options generated in seconds | Logline Forge stage |
| Beat-level guidance | Generic beat description from a template | Specific question generated for this story and this beat | Beat Board AI questions |
| Story consolidation | Scattered notes, no single document | Story Bible showing everything built in one panel | Story Bible panel |
| Abandonment rate | High, estimated above 60% at beat stage | Targeted reduction through momentum mechanics | Progressive disclosure, beat unlocking |

---

## Gap 1: Time

**As-is:** A filmmaker who commits to developing a story from idea to completed beat sheet spends between 20 and 40 hours over multiple sessions spread across days or weeks. The time is consumed by research, logline rewrites, framework application, and getting stuck on individual beats.

**To-be:** The same process takes 90 to 120 minutes in a single focused session. Research is eliminated. Logline development takes 10 to 20 minutes. Character development takes 15 to 30 minutes. Beat board completion takes 60 to 90 minutes.

**Gap:** 18 to 38 hours per story development cycle.

**What closes it:** The guided six-stage flow removes research overhead entirely. The filmmaker never needs to find a framework, understand it, and apply it. The product embeds the framework in the questions it asks.

---

## Gap 2: Specificity

**As-is:** All guidance available to the filmmaker is generic. Beat sheet templates describe what each beat should accomplish in any story. YouTube tutorials explain character development in theory. AI chat tools generate suggestions that could fit any story rather than this story.

**To-be:** Every suggestion the ChromaSync Story Engine generates is produced using the full accumulated story context at that point in the flow. A suggestion for the private behaviour question in the interrogation stage uses the committed location answer. A character Lie suggestion uses the specific logline and wound the filmmaker has entered. A beat suggestion for beat 8 uses all seven prior completed beats plus the logline and character profile.

**Gap:** The difference between a suggestion that could fit any story and a suggestion that could only fit this story.

**What closes it:** Context assembly in the backend passes the full story state to every suggestion endpoint. The AVOID_LIST prevents convergence on generic defaults regardless of how sparse the input is.

---

## Gap 3: State Persistence

**As-is:** A filmmaker's story development work is distributed across a notes app, a downloaded template, a Final Draft or Celtx file, and possibly a browser history of research tabs. None of these systems talk to each other. If the filmmaker stops mid-process, reconstructing context for the next session requires effort and time.

**To-be:** Every committed answer in ChromaSync is saved to the Supabase database immediately. The filmmaker can close the browser at any stage and return days later. Nothing is lost.

**Gap:** Zero state persistence vs full state persistence.

**What closes it:** The Supabase stories table captures every column of story data as it is committed. The schema was designed to store every stage of the process, not just the final output.

---

## Gap 4: Resumability

**As-is:** When a filmmaker returns to a story development session after a break, they must reconstruct where they were. They may not remember which version of the logline they committed to, what wound they chose for the character, or how far through the beat sheet they got.

**To-be:** ChromaSync reads every column from the stories table and reconstructs the full application state. The filmmaker is routed directly to the first incomplete stage with all prior work visible. Completed beats are shown as done. The cursor lands on the first incomplete beat.

**Gap:** Manual reconstruction from memory vs automatic restoration of exact prior state.

**What closes it:** The resume logic in the Story Library reads the Supabase record and sets every piece of React state atomically before routing to the correct stage.

---

## Gap 5: Character Development Quality

**As-is:** A filmmaker applying a character development framework manually typically copies a Lie/Want/Need structure from a blog post or book and fills in the blanks without any connection to their specific logline or story world.

**To-be:** ChromaSync generates the Lie, Want, and Need from the specific wound the filmmaker has described and the logline they have locked. The character psychology is derived from this story, not applied to it from a generic template.

**Gap:** Generic framework application vs character psychology derived from story-specific inputs.

**What closes it:** The Character Forge stage passes the logline, interrogation answers, wound, character name, and theme to the character generation endpoint. The prompt explicitly instructs the model to avoid generic psychological defaults.

---

## Gap 6: AI Monoculture

**As-is:** Filmmakers who use general AI tools for story development receive suggestions that reflect the model's statistical preferences. These preferences converge on the most common story patterns in the training data: orphan protagonists, chosen one structures, redemption arcs, and speech-at-the-end resolutions.

**To-be:** ChromaSync injects a negative constraint list into every prompt sent to the AI. The AVOID_LIST explicitly blocks the most overused wounds, structures, and resolution shapes. The model is instructed to find the specific, surprising, human truth in this filmmaker's idea rather than defaulting to familiar patterns.

**Gap:** Uncontrolled convergence on AI monoculture vs actively blocked overused defaults.

**What closes it:** The AVOID_LIST Python constant injected at the backend prompt layer into every single generation call.

---

## Gap 7: Story Consolidation

**As-is:** A filmmaker who completes story development has their work spread across multiple files and apps. There is no single document that shows the logline, character profile, and full beat sheet together.

**To-be:** The Story Bible panel in ChromaSync shows everything the filmmaker has built in one place. Logline, theme, character name, wound, lie, want, need, Save the Cat scene, and all completed beats. It is accessible from the second stage onwards without navigating away from the current stage.

**Gap:** Scattered notes vs unified story development document.

**What closes it:** The Story Bible panel reads from the story state and renders all completed sections. It updates in real time as the filmmaker progresses.

---

## Residual Gaps After V1

These gaps exist in the to-be state and are not closed by V1.

**Export:** The Story Bible cannot be exported to PDF or Final Draft format. The filmmaker must manually transfer their story development work to their screenplay software.

**First draft generation:** ChromaSync ends at the beat sheet. Scene-level development and first draft writing are out of scope for V1.

**Colour and Story integration:** The Colour product and Story product share a platform but have no workflow connection. A filmmaker who completes their story bible cannot carry that context into their pre-shoot colour planning.

**Real user validation:** The to-be process improvements are based on design assumptions. The estimated time reductions and abandonment rate targets have not yet been validated against real filmmakers using the product in production conditions.
