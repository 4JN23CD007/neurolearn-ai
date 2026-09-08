# NeuroLearn AI — Personalized Adaptive Learning System

A full-stack web application for neurodivergent learners featuring:
- Dyslexia & ADHD adaptive UI modes
- AI-powered text transformation (summarize, simplify, chunk, bullets)
- Three reading levels (Easy / Medium / Advanced)
- Text-to-Speech & Speech-to-Text
- Webcam-based attention detection (simulated)
- Focus timer with inactivity nudges
- Personalization engine with user preference memory
- Voice assistant for hands-free navigation
- Progress dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express 5 |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Auth | JWT (jsonwebtoken) |
| Storage | In-memory (easily swappable to MongoDB/PostgreSQL) |
| TTS | Web Speech API (browser native) |
| STT | Web Speech API (SpeechRecognition) |
| Webcam | MediaDevices API (simulated attention model) |

---

## Project Structure

```
neurolearn/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Global state (React Context)
│   │   ├── services/       # API client functions
│   │   ├── utils/          # Helper utilities
│   │   └── styles/         # Global CSS / Tailwind config
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Express API server
│   ├── routes/             # Express routers
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handling
│   ├── services/           # Business logic + Claude API
│   ├── models/             # Data models (in-memory store)
│   ├── config/             # App configuration
│   └── server.js
│
└── README.md
```

---

## Quick Start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # add your ANTHROPIC_API_KEY
node server.js                # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                   # runs on http://localhost:5173
```

### 3. Open http://localhost:5173

---

## Environment Variables (backend/.env)

```
PORT=5000
ANTHROPIC_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

---

## Features Deep-Dive

### AI Text Transformations
All transformations use Claude claude-sonnet-4-20250514 via the `/api/transform` endpoint:
- **Summarize** — concise paragraph summary
- **Simplify** — plain-language rewrite
- **Bullets** — key points as bullet list
- **Chunk** — labelled section-by-section breakdown
- **Keywords** — extract and highlight key terms

### Reading Levels
- **Easy** — Grade 5 reading level, short sentences
- **Medium** — Grade 9 reading level, standard academic
- **Advanced** — University level, full technical vocabulary

### Profile Modes
- **Default** — Standard reading layout
- **Dyslexia** — OpenDyslexic font, 2x line-height, cream bg, wide letter-spacing
- **ADHD** — Distraction-free, chunked, focus ruler, progress indicators

### Voice Assistant
- Reads content aloud via Web Speech API TTS
- Accepts microphone commands via SpeechRecognition API
- Supported commands: summarize, simplify, chunk, read, pause, next, easy, medium, advanced

### Focus Tracking
- Pomodoro-style session timer
- Inactivity detection via mouse/keyboard events
- Webcam presence simulation with attention score
- Smart nudges triggered by low attention or inactivity
