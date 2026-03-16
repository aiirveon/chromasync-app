# Functional Specification
## ChromaSync Story Engine
**Author:** Ogbebor Osaheni
**Last Updated:** March 2026
**Document Type:** Business Analysis

---

## Purpose

This document specifies the exact functional behaviour of every feature in the ChromaSync Story Engine. It is written for engineers implementing the system and for analysts verifying that the system behaves as specified. It is more granular than the PRD and describes edge cases, error states, and exact system responses.

---

## FS-01: Cold Open

### Normal flow
1. The user lands on the Generate tab in Story Mode.
2. A textarea with placeholder text is displayed. The textarea accepts any text input with no minimum character requirement other than at least one non-whitespace character to enable the Save and Begin button.
3. An optional title input field is displayed above the textarea.
4. Two format toggle buttons are displayed: Film and Short Story. Film is selected by default.
5. A framework picker is displayed showing the current selection. Default is Save the Cat. Expanding reveals three alternatives: Truby Moral Argument, Dan Harmon Story Circle, Short Story (5 beats).
6. The Save and Begin button is disabled until the textarea contains at least one non-whitespace character.
7. When the user clicks Save and Begin, a save modal opens showing the story name field (pre-populated with the title if entered), format badge, framework badge, and the raw idea in a styled block.
8. The user clicks Save and Continue. A Supabase INSERT is performed creating a new row in the stories table with stage 0, format, framework, raw_idea, title, and user_id.
9. On successful save, the modal closes and the user is taken to the Interrogation stage.
10. If the Supabase INSERT fails, the modal remains open and an error message is displayed.

### Edge cases
- If the user closes the modal without clicking Save and Continue, no database record is created and the user remains on Cold Open.
- If the user has typed a title but no raw idea, the Save and Begin button remains disabled.
- The raw idea field accepts up to 2000 characters. Characters beyond 2000 are not accepted.

---

## FS-02: Health Ping

### Normal flow
1. When the Cold Open component mounts, a GET request is sent silently to the backend /health endpoint.
2. The request fires in the background with no visible UI effect.
3. The purpose is to wake the Render server before the user needs an AI response.
4. No response handling is required. The request can succeed, fail, or time out without affecting the user experience.

---

## FS-03: Interrogation Stage

### Normal flow
1. Three questions are displayed sequentially. All three are visible but questions 2 and 3 are visually subdued until question 1 has a value.
2. Each question has a textarea input, a commit button, and an optional Suggest button.
3. Only question 1 is required. The Continue button is enabled as soon as question 1 has a committed value.

### Suggest button behaviour
1. When the user clicks Suggest for question 1, a POST request is sent to /api/story/interrogation-hints with question_number: 1, raw_idea, format, and framework.
2. Three suggestions are returned and displayed as clickable chips below the textarea.
3. Clicking a chip fills the textarea with that suggestion. The user can edit it before committing.
4. When the user clicks Suggest for question 2, the request includes all of: question_number: 2, raw_idea, format, framework, location (committed Q1 answer), and theme if already set.
5. When the user clicks Suggest for question 3, the request includes all of: question_number: 3, raw_idea, format, framework, location, broken_relationship (committed Q2 answer), private_behaviour (current Q3 value if any), and theme.
6. If the API call fails, a neutral error message is displayed inline and the Suggest button returns to its resting state.

### Commit behaviour
1. The commit button is visible on the same row as the Suggest button.
2. Clicking commit locks the textarea value and sets that question's answered state visually.
3. A committed answer can be edited by clicking directly in the textarea, which returns it to the uncommitted state.

### Continue behaviour
1. Clicking Continue sends a POST to the Supabase stories table updating: interrogation_location, interrogation_broken_relationship, interrogation_private_behaviour, and the stage marker to 0.5.
2. The user is taken to the Logline Forge stage.
3. The loglines generation API call is triggered immediately on transition.

---

## FS-04: Logline Forge

### Normal flow
1. While loglines are being generated, a loading state is shown on the Continue button from the Interrogation stage.
2. When the API response arrives, three logline cards are displayed: External Stakes, Internal Stakes, and Tonal Shift.
3. Each card shows the label, the logline text, and the angle description.
4. Each card has an Edit button and a Refresh button.
5. Clicking a card body selects that logline. Selection is shown visually with a coloured border.
6. The Lock this logline button is disabled until a logline is selected, a logline is edited, or the Write your own field contains more than 10 characters.

### Edit behaviour
1. Clicking Edit on a card opens an edit panel below that card.
2. The edit panel contains a textarea pre-filled with the current logline text.
3. The user edits the text and clicks Use my version.
4. The card updates with the edited logline and is automatically selected.
5. Clicking Cancel closes the edit panel without changes.

### Refresh behaviour
1. Clicking Refresh on a card sends a POST to /api/story/logline-single with the label, raw_idea, format, framework, interrogation answers, and the text of all existing loglines to avoid duplication.
2. The card updates with the new logline.
3. If the refreshed card was selected, it is deselected.
4. Only one card can be refreshing at a time.

### Theme field behaviour
1. The theme textarea is pre-filled with the primal_question from the logline API response.
2. The user can edit the theme directly.
3. A Suggest button generates three alternative theme questions from /api/story/theme-suggestions, passing raw_idea, format, framework, interrogation answers, the current loglines, and the current theme.
4. Suggestion chips appear below the textarea. Clicking a chip fills the theme field.
5. Theme changes are reflected in real time in the textarea.

### Lock behaviour
1. Clicking Lock this logline sends a POST to Supabase updating: logline, logline_label, theme, stage: 1.
2. If the story has no ID yet (edge case), a new story record is created first.
3. The user is taken to the Character Forge stage.

---

## FS-05: Character Forge

### Normal flow
1. An optional character name input is displayed.
2. A wound textarea is displayed with a detailed placeholder example.
3. The Submit button is disabled until the wound textarea contains at least 10 non-whitespace characters.
4. Clicking Submit sends a POST to /api/story/character with logline, format, framework, wound_answer, and character_name.
5. Simultaneously, Supabase is updated with wound_answer and character_name.
6. The response contains lie, want, need, and two save_the_cat options.
7. Three editable field cards are shown: The Lie, What They Want, What They Need.
8. Two Save the Cat scene cards are shown: Option A (active) and Option B (passive).

### Field refresh behaviour
1. Each of the three character fields has a Refresh button.
2. Clicking Refresh sends a POST to /api/story/character-field with field, logline, format, framework, wound_answer, character_name, location, broken_relationship, private_behaviour, theme, current_lie, current_want, current_need.
3. The field updates with the new value.
4. Only one field can be refreshing at a time.

### Save the Cat refresh behaviour
1. Each Save the Cat scene card has a Refresh button.
2. Clicking Refresh sends a POST to /api/story/save-the-cat-single with option, framing, logline, format, framework, wound_answer, lie, the existing scene, and the other scene.
3. The card updates with the new scene.

### Lock behaviour
1. When the user selects a Save the Cat scene and clicks Lock, Supabase is updated with: character_lie, character_want, character_need, save_the_cat_scene, save_the_cat_framing, character_name, stage: 2.
2. The user is taken to the Beat Board stage.

---

## FS-06: Beat Board

### Normal flow
1. The beat list for the selected framework is displayed. Save the Cat has 15 beats. Truby has 18. Story Circle has 8. Short Story has 5.
2. Beat 1 is active. All other beats are locked.
3. For the active beat, a POST is sent immediately to /api/story/beat with beat_number, beat_name, format, framework, logline, character_lie, character_want, character_need, and completed_beats.
4. The response contains a question, a hint, and an emotional note.
5. The question is displayed above the textarea. The hint and emotional note are displayed below.

### Suggestion behaviour
1. A Suggest button is displayed.
2. Clicking Suggest sends a POST to /api/story/beat-suggestion with beat_number, beat_name, format, framework, logline, character_lie, character_want, character_need, and all completed_beats.
3. Three suggestion chips are displayed.
4. Clicking a chip fills the textarea.

### Commit behaviour
1. The Commit button is disabled until the textarea contains at least 5 non-whitespace characters.
2. Clicking Commit saves the beat to Supabase by updating the beats JSONB column with the full array of completed beats including the new one.
3. A brief saved confirmation is shown.
4. The next beat unlocks. If it is the last beat, the completion state is set.
5. The committed beat is marked visually as done in the beat list.

### Resume behaviour
1. When the beat board is loaded from a resume, completed beats are pre-loaded from Supabase.
2. The first incomplete beat is set as active automatically.
3. Completed beats are shown with a done visual state.
4. The beat question for the active beat is fetched from the API immediately on load.

---

## FS-07: Story Bible

### Normal flow
1. The Story Bible panel is accessible from stage 1 onwards.
2. On desktop it appears as a vertical tab on the right edge of the screen. Clicking it opens a 300px side panel.
3. On mobile it appears as a floating button above the bottom navigation. Clicking it opens a bottom sheet at 72% of screen height.
4. The panel shows: logline with logline label badge, theme, character section (name, wound, lie, want, need, Save the Cat scene), and beats section listing all completed beats.
5. Each section is collapsible. Logline is expanded by default.
6. Edit buttons on logline and character sections navigate back to the relevant stage. Edit buttons are not shown when the user is already on that stage.

### Edge cases
1. If no logline exists yet, the panel does not render and the trigger button is not shown.
2. If theme exists but no character, only logline and theme sections are shown.
3. Beats section shows a count in the section header and lists each beat with its number, name, and answer.

---

## FS-08: Story Library

### Normal flow
1. The Library tab shows all stories belonging to the authenticated user, sorted by updated_at descending.
2. Each story card shows: title or raw_idea fallback, logline preview if available, format badge, framework badge, stage label, and last updated date.
3. Each card has a Resume button and a Delete button.

### Resume behaviour
1. Clicking Resume reads the full story record from Supabase.
2. All React state is set atomically: story, format, framework, raw_idea, title, interrogation answers, wound, character name, logline, theme, character response, character fields, STC options, completed beats.
3. Stage routing: if beats array is non-empty, route to beat-board. If character_lie exists but no beats, route to beat-board. If logline exists but no character_lie, route to character-forge. If interrogation answers exist but no logline, route to interrogation. Otherwise route to interrogation.
4. The Generate tab is switched to active after state is set.

### Delete behaviour
1. Clicking Delete shows a confirmation dialog.
2. Confirming sends a Supabase DELETE for that story row.
3. The story is removed from the library list.
4. Cancelling closes the dialog with no action.

---

## FS-09: Authentication

### Normal flow
1. Unauthenticated users see the full UI but clicking Save and Begin prompts sign-in.
2. Sign-in uses Supabase magic link authentication.
3. The user enters their email address and receives a one-time link.
4. Clicking the link signs them in and returns them to the app.
5. The session is persisted in the browser. The user remains signed in until they sign out.

### Sign out
1. The sign out button appears in the sidebar on desktop and in the bottom navigation on mobile.
2. Clicking it calls supabase.auth.signOut and clears the session.
3. The user is returned to the unauthenticated state.

---

## Error Handling

| Error | System Response |
|---|---|
| API call fails (non-200) | Inline error message near the action that triggered it. Retry available. |
| Supabase save fails | Toast notification. No stage transition. User can retry. |
| API cold start timeout | The health ping on mount mitigates this. If a timeout occurs anyway, the error message prompts the user to try again. |
| Malformed AI JSON response | Backend catches parse errors and returns a 500. Frontend shows the generic error message. |
| Network offline | Browser-native offline behaviour. No custom handling in V1. |
