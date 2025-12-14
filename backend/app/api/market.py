from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models.models import MarketAnalysis
from ..services.market_analyzer import market_analyzer_service

router = APIRouter()


class MarketAnalysisRequest(BaseModel):
    startup_id: int


@router.post("/analyze")
async def analyze_market(
    request: MarketAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Perform TAM/SAM/SOM market analysis"""
    try:
        analysis = await market_analyzer_service.analyze_market(
            db=db,
            startup_id=request.startup_id
        )
        
        return {
            "id": analysis.id,
            "startup_id": analysis.startup_id,
            "tam": analysis.tam,
            "sam": analysis.sam,
            "som": analysis.som,
            "tam_description": analysis.tam_description,
            "sam_description": analysis.sam_description,
            "som_description": analysis.som_description,
            "market_size_reasoning": analysis.market_size_reasoning,
            "growth_rate": analysis.growth_rate,
            "market_trends": analysis.market_trends,
            "competitors": analysis.competitors,
            "competitive_advantages": analysis.competitive_advantages,
            "confidence_score": analysis.confidence_score,
            "created_at": analysis.created_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/startup/{startup_id}")
async def get_market_analyses(
    startup_id: int,
    db: Session = Depends(get_db)
):
    """Get all market analyses for a startup"""
    analyses = db.query(MarketAnalysis).filter(
        MarketAnalysis.startup_id == startup_id
    ).order_by(MarketAnalysis.created_at.desc()).all()
    
    return [
        {
            "id": analysis.id,
            "tam": analysis.tam,
            "sam": analysis.sam,
            "som": analysis.som,
            "tam_description": analysis.tam_description,  # ← הוספתי!
            "sam_description": analysis.sam_description,  # ← הוספתי!
            "som_description": analysis.som_description,  # ← הוספתי!
            "market_size_reasoning": analysis.market_size_reasoning,  # ← הוספתי!
            "growth_rate": analysis.growth_rate,
            "market_trends": analysis.market_trends,  # ← הוספתי!
            "competitors": analysis.competitors,  # ← הוספתי!
            "competitive_advantages": analysis.competitive_advantages,  # ← הוספתי!
            "confidence_score": analysis.confidence_score,  # ← הוספתי!
            "created_at": analysis.created_at.isoformat()
        }
        for analysis in analyses
    ]