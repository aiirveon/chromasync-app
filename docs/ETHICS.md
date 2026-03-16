# Ethics Framework
## Ojuit
**Author:** Ogbebor Osaheni  
**Last Updated:** March 2026

---

## Core Principle

The story belongs to the writer. Always.

Ojuit Story Engine is a guided discovery tool. The AI asks questions, offers suggestions when invited, and surfaces structure. The writer commits every answer. No output from the AI is ever applied to the writer's story without an explicit action from the writer. This is not a design constraint imposed after the fact. It is the foundational product decision from which every other ethical consideration flows.

---

## Risk 1: AI Output Monoculture

**What it is**  
Large language models trained on vast amounts of human writing develop strong statistical preferences for certain story patterns. Without intervention, an AI asked to help develop a story will tend toward the same wounds (absent or dead parent, survivor's guilt), the same structures (chosen one accepts destiny, loner learns to love again) and the same resolutions (protagonist gives a speech, misunderstanding resolved by honest conversation). A product that reinforces these patterns at scale makes storytelling worse, not better.

**Why it matters for Ojuit**  
If every writer using Ojuit ends up with a story about an orphan who accepts their destiny and gives a speech at the end, the product has failed its core purpose. Diversity of story is the whole point.

**What we do about it**  
Every prompt sent to the AI includes the AVOID_LIST: a set of explicit negative constraints that block the most overused AI story defaults. The list covers overused wounds, overused structures, and overused resolution shapes. It is injected silently into every generation call, not shown to the user. The instruction is always the same: find the specific, surprising, human truth inside this writer's idea.

The AVOID_LIST is treated as a living document. As new overused patterns emerge, they get added. The list is already long and will grow.

---

## Risk 2: Writer Over-Reliance

**What it is**  
A writer who accepts every AI suggestion without engaging critically is not developing their story. They are curating AI output. Over time this could produce a class of filmmakers who are technically competent at using the tool but have no genuine creative voice of their own.

**What we do about it**  
Suggestions are never shown by default. The writer must actively request them by clicking a suggest button. This small friction is intentional. It ensures that suggestions are sought, not assumed.

Every generated field is editable. The writer is always one click away from replacing what the AI produced with something they actually believe. The UI language is consistent: suggestions, not answers. The beat board asks questions, it does not fill in answers.

The product does not generate story content unprompted. It only produces output when the writer asks for help.

---

## Risk 3: Sparse Input Producing Misleading Suggestions

**What it is**  
A writer who enters only a title (for example, The Wedding Party) at the Cold Open stage gives the AI very little to work with. Suggestions at the interrogation stage could be plausible but wildly misaligned with what the writer actually has in mind, and a writer without experience might not recognise this.

**What we do about it**  
Prompts at the interrogation stage are designed with title-awareness: the AI is instructed to treat sparse input as a seed, not a literal brief. For a bare title, it generates divergent, unexpected options rather than obvious ones, to open up the story rather than confirm what the title already implies.

The interrogation stage itself is the primary mitigation. By asking three specific questions about setting, broken relationship, and private behaviour, the product builds genuine context quickly. By question 3, the AI has enough specificity to produce grounded suggestions.

Writers are not blocked or warned about sparse input. The interrogation questions are the natural mechanism for gathering more context without friction.

---

## Risk 4: Loss of Colour Product Ethics Context

**What it is**  
The Colour product has its own ethics considerations around skin tone bias in colour correction models and the alignment problem between mathematically correct and creatively correct. These risks are not transferred to the Story product but they exist in the same codebase and the same portfolio.

**What we do about it**  
The Colour product ethics documentation addresses skin tone bias separately. Synthetic training data for the colour correction model is generated across the full 2700K to 8000K colour temperature spectrum. Full bias validation against real diverse footage is deferred to V2 with a documented roadmap. The SHAP explainability layer ensures no correction is applied without explanation. Manual override exists on every correction.

The two products share a philosophy but have distinct ethics surface areas. This document covers the Story Engine. The Colour product ethics documentation covers the colour pipeline.

---

## Guardrails in Production

**AVOID_LIST injection**  
Applied to every AI prompt in the story pipeline. Cannot be bypassed by any user action. Updated as new overused patterns are identified.

**Suggestions are always optional**  
No AI output is applied without explicit user action. This is enforced at the component level. There is no auto-complete, no auto-fill, and no silent application of AI output.

**Every field is editable**  
The lie, want, need, Save the Cat scene, theme, logline and each beat answer can all be edited or replaced after generation. There are no locked AI outputs.

**Suggest buttons, not auto-populate**  
Suggestions appear only when the writer clicks a suggest button. The default state of every field is empty, waiting for the writer.

---

## What This Framework Does Not Cover

This framework covers ethical risks in the design and operation of the product. It does not cover the content of stories that writers develop using Ojuit. Writers are free to develop stories about any subject. Ojuit does not moderate story content, and does not intend to.

**Colour product addition:** The XGBoost correction model is trained on synthetic colour drift data covering colour temperatures from 2700K to 8000K but has not been validated against real diverse footage across all skin tones. Full bias validation is deferred to V2. The LUT generation uses perceptually uniform CIE Lab space which treats all colours consistently regardless of skin tone, reducing but not eliminating potential bias.

This framework will be reviewed and updated after the first cohort of real users completes the full six-stage flow. Ethical risks that only become visible at scale cannot be anticipated in V1 documentation.
