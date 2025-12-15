from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models.models import Analysis, Startup
from ..services.analyzer_service import analyzer_service

router = APIRouter()


class AnalysisRequest(BaseModel):
    startup_id: int
    analysis_type: str = "comprehensive"


@router.post("/analyze")
async def analyze_startup(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """Perform startup analysis"""
    try:
        analysis = await analyzer_service.analyze_startup(
            db=db,
            startup_id=request.startup_id,
            analysis_type=request.analysis_type
        )
        
        return {
            "id": analysis.id,
            "startup_id": analysis.startup_id,
            "analysis_type": analysis.analysis_type,
            "summary": analysis.summary,
            "key_insights": analysis.key_insights,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "opportunities": analysis.opportunities,
            "threats": analysis.threats,
            "confidence_score": analysis.confidence_score,
            "web_validation_summary": analysis.web_validation_summary,  # ← 🆕 הוסף!
            "created_at": analysis.created_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/startup/{startup_id}")
async def get_startup_analyses(
    startup_id: int,
    db: Session = Depends(get_db)
):
    """Get all analyses for a startup"""
    analyses = db.query(Analysis).filter(
        Analysis.startup_id == startup_id
    ).order_by(Analysis.created_at.desc()).all()
    
    return [
        {
            "id": analysis.id,
            "analysis_type": analysis.analysis_type,
            "summary": analysis.summary,  # ← הסרתי את החיתוך!
            "key_insights": analysis.key_insights,  # ← הוספתי!
            "strengths": analysis.strengths,  # ← הוספתי!
            "weaknesses": analysis.weaknesses,  # ← הוספתי!
            "opportunities": analysis.opportunities,  # ← הוספתי!
            "threats": analysis.threats,  # ← הוספתי!
            "risks": analysis.risks if hasattr(analysis, 'risks') else None,  # ← הוספתי!
            "confidence_score": analysis.confidence_score,  # ← הוספתי!
            "web_validation_summary": analysis.web_validation_summary,  # ← 🆕 הוסף!
            "created_at": analysis.created_at.isoformat()
        }
        for analysis in analyses
    ]


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Get specific analysis"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "id": analysis.id,
        "startup_id": analysis.startup_id,
        "analysis_type": analysis.analysis_type,
        "summary": analysis.summary,
        "key_insights": analysis.key_insights,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "opportunities": analysis.opportunities,
        "threats": analysis.threats,
        "confidence_score": analysis.confidence_score,
        "web_validation_summary": analysis.web_validation_summary,  # ← 🆕 הוסף!
        "created_at": analysis.created_at.isoformat()
    }