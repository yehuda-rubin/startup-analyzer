from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models.models import Score
from ..services.scorer_service import scorer_service

router = APIRouter()


class ScoreRequest(BaseModel):
    startup_id: int


@router.post("/calculate")
async def calculate_score(
    request: ScoreRequest,
    db: Session = Depends(get_db)
):
    """Calculate startup score"""
    try:
        score = await scorer_service.score_startup(
            db=db,
            startup_id=request.startup_id
        )
        
        return {
            "id": score.id,
            "startup_id": score.startup_id,
            "overall_score": score.overall_score,
            "category_scores": {
                "team": score.team_score,
                "product": score.product_score,
                "market": score.market_score,
                "traction": score.traction_score,
                "financials": score.financials_score,
                "innovation": score.innovation_score
            },
            "score_breakdown": score.score_breakdown,
            "reasoning": score.reasoning,
            "confidence_level": score.confidence_level,
            "created_at": score.created_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/startup/{startup_id}")
async def get_startup_scores(
    startup_id: int,
    db: Session = Depends(get_db)
):
    """Get all scores for a startup"""
    scores = db.query(Score).filter(
        Score.startup_id == startup_id
    ).order_by(Score.created_at.desc()).all()
    
    return [
        {
            "id": score.id,
            "overall_score": score.overall_score,
            "category_scores": {  # ← הוסף!
                "team": score.team_score,
                "product": score.product_score,
                "market": score.market_score,
                "traction": score.traction_score,
                "financials": score.financials_score,
                "innovation": score.innovation_score
            },
            "reasoning": score.reasoning,  # ← הוסף!
            "confidence_level": score.confidence_level,
            "created_at": score.created_at.isoformat()
        }
        for score in scores
    ]


@router.get("/{score_id}")
async def get_score(
    score_id: int,
    db: Session = Depends(get_db)
):
    """Get specific score"""
    score = db.query(Score).filter(Score.id == score_id).first()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    
    return {
        "id": score.id,
        "startup_id": score.startup_id,
        "overall_score": score.overall_score,
        "category_scores": {
            "team": score.team_score,
            "product": score.product_score,
            "market": score.market_score,
            "traction": score.traction_score,
            "financials": score.financials_score,
            "innovation": score.innovation_score
        },
        "score_breakdown": score.score_breakdown,
        "reasoning": score.reasoning,
        "scoring_criteria": score.scoring_criteria,
        "confidence_level": score.confidence_level,
        "created_at": score.created_at.isoformat()
    }