from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config import settings
from .database import init_db
from .api import documents, analysis, scoring, market, reports, startups, users

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered startup analysis platform for investors",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()

# Health check
@app.get("/")
async def root():
    return {
        "message": "Startup Analyzer API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])
app.include_router(market.router, prefix="/api/market", tags=["Market Analysis"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(startups.router, prefix="/api/startups", tags=["Startups"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
