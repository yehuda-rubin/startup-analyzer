# 🚀 Startup Analyzer AI

A comprehensive AI-powered venture capital due diligence platform that automates startup analysis by processing pitch decks and generating professional investment reports with real-time web validation.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 📋 Overview

Startup Analyzer AI transforms the traditionally manual and time-intensive process of evaluating startups into an automated, data-driven workflow. The platform combines document analysis, vector search (RAG), and real-time web validation to generate comprehensive investment reports.

### Key Features

- **📄 Multi-Format Document Processing**: Upload and analyze PDF, DOCX, PPTX, and XLSX files
- **🧠 Advanced RAG (Retrieval Augmented Generation)**: FAISS vector database for intelligent context retrieval
- **🌐 Web Validation Layer**: Real-time validation of startup claims using Tavily Search API
- **📊 Intelligent Scoring System**: Weighted analysis across 6 investment categories
- **📑 Professional Reports**: Markdown-rendered investment reports ready for stakeholders
- **🔄 End-to-End Automation**: From pitch deck upload to final recommendation

## 🏗️ Architecture
```
┌─────────────────┐
│  Pitch Deck     │
│  (PDF/DOCX/PPTX)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│         Document Processing                 │
│  • Text Extraction                          │
│  • Chunking & Embedding (Gemini)            │
│  • FAISS Vector Storage                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│         Web Validation (Tavily)             │
│  • Market Size Verification                 │
│  • Competitor Discovery                     │
│  • Founder Reputation Check                 │
│  • Red Flag Detection                       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│      AI Analysis (Gemini 2.5 Flash)         │
│  • RAG Context Retrieval                    │
│  • Web Validation Integration               │
│  • Comprehensive Analysis Generation        │
│  • SWOT Analysis                            │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│         Scoring Algorithm                   │
│  • Team (25%)                               │
│  • Product (20%)                            │
│  • Market (20%)                             │
│  • Traction (15%)                           │
│  • Financials (10%)                         │
│  • Innovation (10%)                         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│      Professional Investment Report         │
│  • Executive Summary                        │
│  • Detailed Analysis                        │
│  • Risk Assessment                          │
│  • Final Recommendation                     │
└─────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Production-grade relational database
- **SQLAlchemy**: ORM for database operations
- **Google Gemini 2.5 Flash**: State-of-the-art LLM for analysis
- **FAISS**: Facebook AI Similarity Search for vector operations
- **Tavily Search API**: Enterprise web search for validation

### Frontend
- **React 18**: Modern UI framework
- **Axios**: HTTP client
- **React Router**: Navigation
- **React Markdown**: Report rendering
- **Chart Components**: Data visualization

### Infrastructure
- **Docker & Docker Compose**: Containerized deployment
- **Uvicorn**: ASGI server
- **PostgreSQL 15**: Alpine-based database

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Google API Key (Gemini)
- Tavily API Key (optional, for web validation)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/startup-analyzer.git
cd startup-analyzer
```

2. **Configure environment variables**

Create `backend/.env`:
```env
# Required
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://admin:password@db:5432/startup_analyzer

# Optional (Web Validation)
TAVILY_API_KEY=your_tavily_api_key_here

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=startup_analyzer
```

3. **Launch with Docker**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📖 Usage Guide

### 1. Upload Startup Documents

Navigate to the **Upload** page and upload pitch decks in supported formats:
- PDF presentations
- DOCX documents
- PPTX slides
- XLSX financial models

The system automatically:
- Extracts text content
- Generates embeddings
- Stores vectors in FAISS
- Metadata extraction (company name, etc.)

### 2. Run Analysis

Go to the **Analysis** page:

1. **Select a startup** from the dropdown
2. **Click "Run Analysis"**
   - System performs RAG retrieval
   - Executes web validation searches
   - Generates comprehensive analysis
3. **Click "Calculate Score"**
   - Applies weighted scoring algorithm
   - Generates category breakdowns
   - Provides confidence levels

### 3. Generate Reports

Navigate to **Reports**:

1. Select one or multiple startups
2. Click **"Generate Reports"**
3. View professionally formatted investment reports
4. Export as PDF for stakeholders

## 🧪 Web Validation Features

The platform includes an enterprise-grade web validation layer that:

### Validation Process

1. **Smart Query Generation**: LLM generates targeted search queries
2. **Concurrent Search**: Tavily API executes multiple searches simultaneously
3. **Result Processing**: Extracts relevant information and relevance scores
4. **Integration**: Feeds validation results directly into analysis

### Validation Categories

- **Market Size Verification**: Cross-checks TAM/SAM/SOM claims
- **Competitor Discovery**: Identifies competitors not mentioned in deck
- **Founder Background**: Validates credentials and reputation
- **Red Flag Detection**: Searches for negative reviews, complaints, legal issues
- **Funding History**: Verifies claimed funding rounds

### Graceful Degradation

If Tavily API is unavailable:
- System continues with document-only analysis
- No user-facing errors
- Logs indicate web validation was skipped

## 📊 Scoring Methodology

### Weighted Categories

| Category | Weight | Key Factors |
|----------|--------|-------------|
| **Team** | 25% | Experience, domain expertise, track record, complementary skills |
| **Product** | 20% | Innovation, technical feasibility, competitive advantage, IP |
| **Market** | 20% | Market size, growth rate, timing, addressable segments |
| **Traction** | 15% | Revenue, user growth, key partnerships, milestones |
| **Financials** | 10% | Unit economics, burn rate, runway, projections |
| **Innovation** | 10% | Technology differentiation, scalability, barriers to entry |

### Score Interpretation

- **80-100**: High-Potential - Strong investment opportunity
- **60-79**: Promising - Warrants further due diligence
- **40-59**: Moderate - Significant risks identified
- **0-39**: Pass - Not recommended for investment

## 🔧 Development

### Project Structure
```
startup-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   │   ├── analyzer_service.py   # Main analysis orchestration
│   │   │   ├── llm_service.py        # Gemini integration
│   │   │   ├── rag_service.py        # FAISS vector operations
│   │   │   ├── search_service.py     # Tavily web validation
│   │   │   └── scoring_service.py    # Scoring algorithms
│   │   ├── config.py     # Configuration
│   │   └── main.py       # FastAPI app
│   ├── database/
│   │   └── schema.sql    # Database schema
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── services/     # API integration
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Running Locally (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Database:**
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=startup_analyzer \
  -p 5432:5432 \
  postgres:15-alpine
```

## 🔒 Security Considerations

- API keys stored in environment variables
- Database credentials not committed to version control
- CORS configured for production domains
- Input validation on file uploads
- SQL injection protection via SQLAlchemy ORM

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker logs startup-analyzer-backend-1 --tail 50

# Common issues:
# - Missing GOOGLE_API_KEY
# - Database connection failed
# - Port 8000 already in use
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:8000/api/reports/startups

# Check frontend API configuration
cat frontend/src/services/api.js
# Should show: API_BASE_URL = 'http://localhost:8000/api'
```

### Web Validation Not Working
```bash
# Check if Tavily API key is set
docker exec startup-analyzer-backend-1 env | grep TAVILY

# System will work without Tavily, but won't perform web validation
```

## 📈 Performance Optimization

- **Caching**: Analysis results cached in PostgreSQL
- **Concurrent Processing**: Tavily searches executed in parallel
- **Vector Search**: FAISS provides sub-second similarity search
- **Connection Pooling**: SQLAlchemy manages database connections efficiently

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Authors

**Yehuda Rubin, Ido Shamir, Uri Maged, Itamar Sorin**

## 🙏 Acknowledgments

- Google Gemini for state-of-the-art LLM capabilities
- Tavily for enterprise web search API
- FastAPI community for excellent documentation
- React team for robust frontend framework

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Built with ❤️ for the VC community**
