# System Architecture
## Ojuit
**Author:** Ogbebor Osaheni
**Last Updated:** March 2026

---

## Overview

Ojuit is a two-product platform built across two repositories and three cloud services. The frontend handles all user interaction and state management. The backend handles all AI prompt orchestration. The database handles persistence and authentication. The three services communicate over HTTPS and are deployed independently.

---

## System Diagram

```mermaid
graph TD
    User["User (Browser / Mobile)"]

    subgraph Frontend ["Frontend — ojuit-app (Vercel)"]
        NextJS["Next.js 15 / TypeScript"]
        CSS["Unified CSS Design System\n(CSS custom properties, :root)"]
        State["Component State\n(React useState, lifted to dashboard)"]
    end

    subgraph Backend ["Backend — ojuit-api (Render)"]
        FastAPI["FastAPI / Python"]
        Prompts["Prompt Chain Layer\n(AVOID_LIST, context assembly)"]
        XGB["XGBoost Colour Correction Model\n(trains at startup if not present)"]
        Health["Health Endpoint\n(/health — cold start wake)"]
    end

    subgraph Database ["Database — Supabase (Postgres)"]
        Stories["stories table\n(20+ columns, JSONB beats)"]
        Auth["Magic Link Auth\n(Supabase Auth)"]
    end

    Claude["Claude API\n(claude-opus-4-5)\nAnthropic"]

    User -->|"HTTPS"| NextJS
    NextJS --> CSS
    NextJS --> State
    NextJS -->|"REST API calls"| FastAPI
    NextJS -->|"Supabase client"| Stories
    NextJS -->|"Magic link"| Auth
    FastAPI --> Prompts
    FastAPI --> XGB
    FastAPI -->|"Silent ping on mount"| Health
    Prompts -->|"Structured JSON prompts"| Claude
    Claude -->|"JSON responses"| Prompts
    Prompts -->|"Validated responses"| NextJS
```

---

## Services

**Frontend: ojuit-app**
Repository: github.com/aiirveon/chromasync-app
Deployment: Vercel (automatic on push to main)
Stack: Next.js 15, TypeScript, Tailwind CSS, Supabase JS client
Responsibility: All user interaction, component state, CSS design system, routing between story stages, Supabase reads and writes, LUT file download, Delta E results display

**Backend: ojuit-api**
Repository: github.com/aiirveon/chromasync-api
Deployment: Render free tier (spins down after inactivity)
Stack: FastAPI, Python, Anthropic SDK, XGBoost, OpenCV, scikit-learn
Responsibility: All AI prompt orchestration, AVOID_LIST injection, context assembly per endpoint, JSON response validation, colour analysis, Delta E computation, LUT generation, XGBoost correction predictions

**Database: Supabase**
Project: zgzpaadvnzpbxrvgwvns
Stack: Postgres, Supabase Auth (magic link)
Responsibility: Story persistence, user authentication, row-level security

**AI: Anthropic Claude API**
Model: claude-opus-4-5
Responsibility: Logline generation, interrogation suggestions, character psychology, beat questions and suggestions, theme suggestions

**ML: XGBoost Colour Correction Model**
Training: 8,000 synthetic scenes across four drift types — standard, mixed lighting, LOG profile compression, harsh clipping
Features: 14 features covering scene and reference colour profiles
Targets: 6 correction values — correct_r, correct_g, correct_b, correct_exposure_ev, correct_temp_k, correct_saturation
Deployment: Trains automatically at API startup if model file is not present. Falls back to raw delta calculations if training fails.

---

## Key Architectural Decisions

**Two-repo separation**
The frontend and backend are separate repositories with separate deployments. This means either can be updated independently without redeploying the other. The backend can be swapped to a paid tier without touching the frontend.

**State lifted to dashboard**
All story state lives in the StoryDashboard component, not inside individual stage components. This means navigating back from character forge to interrogation does not lose any committed answers. Each stage component receives its state as props and writes changes back via callbacks.

**Supabase as the source of truth**
Every user action that commits an answer is saved to Supabase immediately. The frontend never relies on in-memory state surviving a page close. On resume, all state is reconstructed from Supabase and the user is routed to the correct stage.

**AVOID_LIST injection**
A negative constraint list is assembled as a Python string constant and injected into every prompt sent to the Claude API. It is not configurable by the user and cannot be bypassed. It forces the model away from overused story defaults on every single generation call.

**Cold start mitigation**
Render's free tier shuts down the API after inactivity. The frontend sends a silent GET request to /health on component mount to wake the server before the user needs it. The ping fires in the background with no visible UI effect.

**CSS design system**
All visual tokens (colours, spacing, border radius, layout heights) are defined as CSS custom properties in a single :root declaration in globals.css. No component contains hardcoded colour or spacing values. Changing a token in :root updates the entire application.

**CIE Lab Delta E**
All colour difference calculations use CIE Lab colour space, not RGB Euclidean distance. Lab space is perceptually uniform: equal numerical distances correspond to equal perceived colour differences. Delta E below 5 is the professional continuity threshold. The previous implementation using RGB Euclidean distance was replaced because it produced misleading scores — two similar images could score Delta E of 130 in RGB space while being visually close.

**Scene-to-reference LUT generation**
The LUT endpoint samples colour distributions from both scene and reference frames in Lab colour space. It fits a degree-2 polynomial mapping from scene Lab values to reference Lab values per channel. This captures non-linear colour relationships between frames. The output is a 33x33x33 `.cube` file — the industry standard format for DaVinci Resolve and Premiere Pro.

**Beta banner and cold start UX**
A persistent banner at the top of the app shows warming up state when the API is dormant and switches to live once the health ping responds. This sets user expectations correctly and reduces perceived failures on first load.

---

## Data Flow: Story Engine

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase
    participant Backend
    participant Claude

    User->>Frontend: Enters raw idea, clicks Save and Begin
    Frontend->>Supabase: INSERT story row (stage 0)
    User->>Frontend: Answers interrogation questions
    Frontend->>Backend: POST /interrogation-hints (idea + committed answers)
    Backend->>Claude: Prompt with full story context + AVOID_LIST
    Claude->>Backend: JSON suggestions
    Backend->>Frontend: Validated suggestions
    User->>Frontend: Commits answers, clicks Continue
    Frontend->>Supabase: UPDATE story (interrogation answers, stage 0.5)
    Frontend->>Backend: POST /logline (idea + all interrogation answers)
    Backend->>Claude: Prompt with full context
    Claude->>Backend: 3 loglines + primal question
    Backend->>Frontend: Logline response
    User->>Frontend: Selects and locks logline
    Frontend->>Supabase: UPDATE story (logline, theme, stage 1)
    Note over Frontend,Supabase: Pattern continues through character forge and beat board
    User->>Frontend: Completes all beats
    Frontend->>Supabase: UPDATE story (beats JSONB, stage 3)
```

---

## Environment Variables

**Frontend (Vercel)**
NEXT_PUBLIC_API_URL: URL of the deployed FastAPI backend
NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase public anon key

**Backend (Render)**
ANTHROPIC_API_KEY: Anthropic API key for Claude access

No secrets are stored in the repository. All environment variables are configured in the Vercel and Render dashboards respectively.
