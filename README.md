# EduBox Agent Studio | EmpowerEd Nexus

AI-powered offline-ready lesson packs for low-connectivity schools.

## Problem

Teachers in low-connectivity and under-resourced schools struggle to prepare
high-quality, curriculum-aligned learning materials. Internet access is
intermittent or unavailable, commercial tools assume always-on connectivity,
and preparing a full lesson — objectives, quizzes, flashcards, and revision
notes — by hand is slow and inconsistent.

## Solution

EduBox Agent Studio is an AI agent that generates complete, classroom-ready
lesson packs from a single topic. Each pack is bundled into a lightweight
**EduBox offline package** that can be synced to devices and used in the
classroom without an internet connection. Teachers get a consistent,
standards-aligned starting point in seconds instead of hours.

## Features

- Generate a full lesson pack from a topic, subject, grade, language, and difficulty
- Learning objectives, a quiz with answer key, flashcards, and a revision summary
- EduBox offline package summary for low-connectivity classrooms
- Evidence/impact reporting for pilots and reviewers
- Save, browse, and revisit generated lesson packs
- Clean, responsive UI with a guided testing flow for reviewers

## Tech stack

- **React 19** + **TypeScript**
- **TanStack Start** & **TanStack Router** (file-based routing, SSR)
- **TanStack Query** for data fetching/state
- **Vite 7** build tooling
- **Tailwind CSS v4** + Radix UI primitives
- **Recharts** for impact visualizations
- **Zod** + **React Hook Form** for validation
- Planned: **Google Gemini** for generation

## Routes

| Route | Path |
| --- | --- |
| Home | `/` |
| Dashboard | `/dashboard` |
| Create | `/create` |
| Generated | `/generated` |
| Saved | `/saved` |
| Impact | `/impact` |
| Architecture | `/architecture` |
| Testing | `/testing` |

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# then add your Gemini API key to .env

# 3. Run the dev server
npm run dev
```

On Windows PowerShell use `npm.cmd run dev`.

Other useful scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
npm run format    # format with Prettier
```

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_GEMINI_API_KEY` | API key used for AI lesson-pack generation via Google Gemini |

See `.env.example` for the template.

## Hackathon

Prototype built for the **Google for Startups AI Agents Challenge**.

- **Live demo:** https://edubox-lesson-craft.lovable.app/ (no login required — try the topic "Photosynthesis")
- **Submission / devpost:** _TODO: add link_
- **Demo video:** _TODO: add link_
- **Team / contact:** info@empowerednexus.com — https://www.empowerednexus.com

## Future roadmap

- **Google Gemini** — wire live generation through the Gemini API for lesson packs, quizzes, and flashcards
- **Google Cloud Run** — deploy the SSR app as a containerized, autoscaling service
- **EduBox offline sync** — package and sync lesson packs to EduBox devices for fully offline classroom use
- **Production deployment** — host at [agents.empowerednexus.com](https://agents.empowerednexus.com)
- Multi-language and localized curriculum support
- Teacher accounts, collaboration, and shared lesson libraries
