# Insurance Underwriter Agent

An AI-powered insurance underwriting research tool built with [Tavily](https://tavily.com). Enter a company name and get a comprehensive underwriting report streamed in real time — covering company background, adverse news, risk assessment, products & services, and claims history.

## Tech Stack

| Layer    | Technologies                                      |
| -------- | ------------------------------------------------- |
| Backend  | Python, FastAPI, Uvicorn, httpx                   |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS          |
| API      | Tavily Research API (streaming)                   |
| UI       | Framer Motion, Lucide React                       |

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- A **Tavily API key** — get one at [app.tavily.com](https://app.tavily.com)

## Getting Started

### 1. Clone and configure environment

```bash
cp .env.sample .env
```

Open `.env` and set your Tavily API key:

```
TAVILY_API_KEY=tvly-your-key-here
```

### 2. Start the backend

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m backend.app
```

The API server starts at **http://localhost:8000**.

### 3. Start the frontend

In a separate terminal:

```bash
cd ui
npm install
npm run dev
```

The UI opens at **http://localhost:5173**.

## Usage

1. Open **http://localhost:5173** in your browser.
2. Enter a company name (and optional location).
3. Results stream in across five research categories:
   - **Company Information** — legal name, industry, NAICS code, employees, revenue, leadership
   - **Adverse News** — lawsuits, regulatory actions, negative press (last 5 years)
   - **Risk Assessment** — financial health, credit ratings, operational/compliance risks, ESG, overall rating
   - **Products & Services** — product lines, markets served, competitive position
   - **Claims History** — insurance claims, loss records, workplace safety, product liability

## Project Structure

```
├── .env.sample                  # Environment variable template
├── requirements.txt             # Python dependencies
├── backend/
│   ├── app.py                   # FastAPI entry point
│   ├── models.py                # Pydantic request/response models
│   ├── research_tasks.py        # Research category configurations
│   └── streaming/
│       ├── event_handler.py     # Processes Tavily stream events
│       ├── stream_orchestrator.py  # Parallel research orchestration
│       └── tavily_stream.py     # Tavily API streaming client
└── ui/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx             # React entry point
        ├── App.tsx              # Main application component
        ├── types.ts             # TypeScript type definitions
        └── components/
            ├── Header.tsx
            ├── SearchForm.tsx
            ├── ProgressTracker.tsx
            ├── ResultsDashboard.tsx
            ├── CategoryCard.tsx
            ├── CompanyInfo.tsx
            ├── AdverseNews.tsx
            ├── RiskAssessment.tsx
            ├── ProductsServices.tsx
            ├── ClaimsHistory.tsx
            └── SourcesList.tsx
```

## Environment Variables

| Variable         | Required | Description                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------------- |
| `TAVILY_API_KEY` | Yes      | Your Tavily API key. Can also be passed via the `Authorization` header.     |

## API

### `POST /api/underwrite/stream`

Streams underwriting research results as Server-Sent Events (SSE).

**Request body:**

```json
{
  "company_name": "Acme Corp",
  "location": "New York, NY"
}
```

**Response:** `text/event-stream` with real-time research updates per category.
