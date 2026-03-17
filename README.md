# Macroweaver — AI Economic Policy Advisor

An interactive web-based simulator where users adjust economic policy levers and observe real-time macroeconomic impacts, powered by AI-generated explanations.

## Features

- **Policy Simulation** — Adjust tax rates, subsidies, interest rates, government spending, and import tariffs
- **Economic Modeling** — Simplified Keynesian GDP framework with multiplier effects
- **AI Explanations** — Plain-language analysis of simulation results via LLM
- **Policy Comparison** — Side-by-side comparison of two policy scenarios
- **Interactive Charts** — Visual dashboard with real-time graph updates

## Architecture

```
Frontend (React)  ←→  Backend API (FastAPI)
                           ├── Economic Model
                           ├── AI Explanation Layer (Groq)
                           └── Data Layer (World Bank)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Pandas, NumPy |
| AI | Groq API (Llama 3) |
| Frontend | React, Vite, Chart.js |
| Data | World Bank economic indicators |
| Deployment | Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp ../.env.example ../.env   # Add your Groq API key
uvicorn main:app --reload
```

### API Docs

Once running, visit `http://localhost:8000/docs` for interactive Swagger documentation.

## Project Structure

```
Macroweaver/
├── backend/
│   ├── main.py              # FastAPI entrypoint
│   ├── requirements.txt
│   ├── models/
│   │   └── economic_model.py
│   ├── ai/
│   │   └── explainer.py
│   ├── data/
│   │   ├── economic_data.csv
│   │   └── loader.py
│   ├── api/
│   │   ├── routes.py
│   │   └── schemas.py
│   └── tests/
├── frontend/
├── README.md
└── .env.example
```

## License

MIT
