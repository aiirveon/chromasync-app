# Metrics Framework
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni  
**Last Updated:** March 2026

---

## North Star Metric

**Stories that reach the beat board.**

A story that reaches the beat board is one where the writer has committed a location, a broken relationship, a private behaviour, a logline, a theme, and a full character profile. That is a writer who has done real development work and is now building structure. Everything before that point is discovery. Everything after is execution. The beat board is where ChromaSync's value becomes concrete.

---

## Primary Metrics

**Beat board reach rate**  
The percentage of stories created that reach the beat board stage. Target: 25% within 60 days of launch. Low beat board reach indicates that users are dropping off during discovery phases. The interrogation or character forge stage is the most likely friction point.

**Resume rate**  
The percentage of stories that are resumed at least once after their first session. Target: 40%. A story that is only ever touched once was probably not compelling enough to return to. High resume rate means the product is part of the writer's actual workflow, not just a one-time experiment.

**Beat completion rate**  
Of stories that reach the beat board, the percentage that complete all beats. Target: 30%. This is the deepest signal of product value. A writer who completes all their beats has a full story outline built from their own committed answers.

---

## Secondary Metrics

**Suggestion adoption rate per stage**  
The percentage of sessions where the user clicks at least one suggestion chip before committing an answer. Target: 40% at interrogation, 50% at character forge, 55% at beat board. Low adoption at a specific stage indicates either the suggestions are too generic (prompt quality problem) or the UI is not surfacing them clearly enough (design problem).

**Theme edit rate**  
The percentage of sessions where the user edits the AI-generated primal question before locking the logline. Target: 30 to 50%. Too low means users are accepting the AI's framing without engaging with it. Too high means the AI is generating themes that are clearly wrong or unhelpful.

**Story Bible open rate**  
The percentage of sessions beyond stage 2 where the user opens the Story Bible at least once. Target: 35%. Low open rate means users either do not know it exists or do not find value in reviewing what they have built.

---

## Counter-metrics

**Immediate field edit rate**  
The percentage of generated fields (lie, want, need, Save the Cat scene) that the user edits within 30 seconds of generation. If above 50% for any field, the generation quality for that field is poor and the prompt needs investigation.

**Stage drop-off rate**  
The percentage of users who stop at each stage and never return. A spike at any single stage indicates a specific friction or value problem. Interrogation and character forge are the highest-risk stages because they require the most from the writer.

**Error rate per endpoint**  
The percentage of API calls that return a non-200 response or a malformed JSON payload. Target below 2%. Cold start failures from Render are the most common source and should be tracked separately from genuine API errors.

---

## Measurement Approach for V1

All primary and secondary metrics are measured through Supabase query analysis on the stories table. Stage completion is inferred from which columns are populated: a story with character_lie filled has passed character forge, a story with beats populated has at least started the beat board.

Suggestion adoption and theme edit rate require frontend event tracking, which is not implemented in V1. These will be estimated through user interviews until proper analytics are added.

Counter-metrics requiring timing data (immediate field edit rate) are deferred to V2.
