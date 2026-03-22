# HaircutAI

Upload a selfie, get your face shape analyzed, and see what you'd look like with different haircuts.

## How it works

1. **Take or upload a selfie** — use your webcam or drop in a photo
2. **AI analyzes your face shape** — Claude figures out if you're oval, round, square, heart, etc. and recommends 6 haircut styles that suit you, along with reference photos pulled from the web so you can see what each style actually looks like
3. **Try it on yourself** — pick a style (or type in your own) and Nano Banana 2 generates a visualization of you with that haircut from 4 angles (front, back, both sides)

## Setup

You'll need two API keys:
- **Anthropic** (Claude) — [console.anthropic.com](https://console.anthropic.com)
- **Google** (Gemini / Nano Banana 2) — [aistudio.google.com](https://aistudio.google.com)

```
cp .env.example .env
```

Then paste your keys into `.env`.

## Run it

```
npm install
npm run dev
```

This starts both the frontend (Vite on port 5173) and the backend (Express on port 3001). Open [localhost:5173](http://localhost:5173).

## Tech stack

- React + TypeScript + Tailwind CSS (frontend)
- Express (backend API proxy)
- Claude Sonnet + web search (face analysis & haircut recommendations)
- Gemini 3.1 Flash Image / Nano Banana 2 with thinking (haircut visualization)
