# AI Job Marketplace

A full-stack application where users submit AI jobs, an autonomous agent selects
the best provider, and progress is tracked live on the dashboard.

---

## Project Structure

```
ai-job-marketplace/
├── backend/
│   ├── models/
│   │   └── jobStore.js          # In-memory DB (swap for MongoDB/Postgres)
│   ├── routes/
│   │   ├── jobs.js              # POST/GET /api/jobs
│   │   └── providers.js         # GET /api/providers
│   ├── services/
│   │   ├── agentService.js      # AI agent — scores & selects providers
│   │   └── providerService.js   # Provider registry
│   ├── server.js                # Express app entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Home.js          # Landing page + provider preview
    │   │   ├── SubmitJob.js     # Job submission form
    │   │   └── Dashboard.js     # Live job tracker (polls every 2 s)
    │   ├── services/
    │   │   └── api.js           # All API calls in one place
    │   ├── App.js               # Router + nav
    │   ├── index.js             # React entry point
    │   └── index.css            # Design system (CSS variables + utilities)
    └── package.json
```

---

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev       # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start         # starts on http://localhost:3000
```

Open **http://localhost:3000**

---

## API Reference

| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | /api/health          | Health check              |
| GET    | /api/providers       | List all AI providers     |
| GET    | /api/providers/:id   | Get provider details      |
| POST   | /api/jobs            | Submit a new job          |
| GET    | /api/jobs            | List all jobs             |
| GET    | /api/jobs/:id        | Get job + progress        |

### POST /api/jobs — Payload
```json
{
  "title": "Classify product images",
  "description": "Optional extra context",
  "jobType": "image-classification",
  "budget": "0.005",
  "requiredAccuracy": "95"
}
```

---

## Architecture Decisions

| Decision | Reason |
|----------|--------|
| Polling (not WebSockets) | Simple, works everywhere, easy to swap later |
| In-memory store | No DB setup needed; single file to swap |
| Agent as a service | Logic isolated — swap for real LLM later |
| CSS variables design system | Theme-able; no library needed |
| CRA proxy | Frontend calls `/api/…`, no CORS issues in dev |

---

## Next Steps (Hedera Integration)

When you're ready to add on-chain features:
1. `providerService.js` → fetch providers from HCS topic
2. `agentService.js` → log provider selection to HCS
3. `jobStore.js` → write completed job hash to HCS
4. Add HBAR payment flow in `routes/jobs.js`
