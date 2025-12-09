# Startup Analyzer AI - Complete System

AI-powered startup analysis platform for investors, featuring RAG, TAM/SAM/SOM analysis, comprehensive scoring, and automated report generation.

## Features

- **Document Upload**: PDF, DOCX, PPTX, XLSX processing
- **RAG System**: Vector database (FAISS) for semantic search
- **AI Analysis**: Comprehensive startup evaluation using Google Gemini
- **Scoring System**: 6-category scoring (Team, Product, Market, Traction, Financials, Innovation)
- **Market Analysis**: TAM/SAM/SOM calculation and competitive landscape
- **Comparison Tools**: Side-by-side startup comparisons
- **Investor Reports**: Automated report generation

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Google Gemini API
- LangChain
- FAISS Vector Store
- Document Processing (PyPDF2, python-docx, openpyxl, python-pptx)

### Frontend
- React 18
- Recharts (data visualization)
- React Router
- Axios

### Infrastructure
- Docker & Docker Compose
- PostgreSQL Database

## Prerequisites

- Docker & Docker Compose
- Google Gemini API Key

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd startup-analyzer
```

2. **Set up environment variables**
```bash
# Create .env file in project root
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
```

3. **Build and start services**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Usage

### 1. Upload Documents
- Navigate to "Upload" page
- Enter startup name
- Select documents (PDF, DOCX, PPTX, XLSX)
- Click "Upload Documents"

### 2. Run Analysis
- Go to "Analysis" page
- Select a startup
- Click "Run Analysis" for comprehensive analysis
- Click "Calculate Score" for scoring

### 3. Market Analysis
- Navigate to "Market" page
- Select startup
- Click "Run Market Analysis"
- View TAM/SAM/SOM breakdown and trends

### 4. Compare Startups
- Go to "Compare" page
- Select multiple startups
- View radar chart and comparison table

### 5. Generate Reports
- Navigate to "Reports" page
- Select startups for report
- Click "Generate Reports"
- View/download investor reports

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/startup/{startup_id}` - Get startup documents
- `DELETE /api/documents/{document_id}` - Delete document

### Analysis
- `POST /api/analysis/analyze` - Analyze startup
- `GET /api/analysis/startup/{startup_id}` - Get analyses
- `GET /api/analysis/{analysis_id}` - Get specific analysis

### Scoring
- `POST /api/scoring/calculate` - Calculate score
- `GET /api/scoring/startup/{startup_id}` - Get scores
- `GET /api/scoring/{score_id}` - Get specific score

### Market
- `POST /api/market/analyze` - Analyze market
- `GET /api/market/startup/{startup_id}` - Get market analyses

### Reports
- `POST /api/reports/generate` - Generate reports
- `GET /api/reports/startups` - List all startups

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Migrations
```bash
docker-compose exec backend python -c "from app.database import init_db; init_db()"
```

## Architecture
```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│   React     │◄─────►│   FastAPI    │◄─────►│  PostgreSQL   │
│  Frontend   │       │   Backend    │       │   Database    │
└─────────────┘       └──────────────┘       └───────────────┘
                             │
                             ├──────►┌──────────────┐
                             │       │ Google Gemini│
                             │       │     LLM      │
                             │       └──────────────┘
                             │
                             └──────►┌──────────────┐
                                     │    FAISS     │
                                     │ Vector Store │
                                     └──────────────┘
```

## Project Structure