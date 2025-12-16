from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models.models import Score
from ..services.scorer_service import scorer_service

router = APIRouter()


class ScoreRequest(BaseModel):
    startup_id: int


def format_score(score):
    """Format score with max 2 decimals, no trailing zeros"""
    if score is None:
        return 0
    rounded = round(score, 2)
    # Remove trailing zeros and decimal point if integer
    return float(f"{rounded:.2f}".rstrip('0').rstrip('.'))


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
            "overall_score": format_score(score.overall_score),
            "category_scores": {
                "team": format_score(score.team_score),
                "product": format_score(score.product_score),
                "market": format_score(score.market_score),
                "traction": format_score(score.traction_score),
                "financials": format_score(score.financials_score),
                "innovation": format_score(score.innovation_score)
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
            "overall_score": format_score(score.overall_score),
            "category_scores": {
                "team": format_score(score.team_score),
                "product": format_score(score.product_score),
                "market": format_score(score.market_score),
                "traction": format_score(score.traction_score),
                "financials": format_score(score.financials_score),
                "innovation": format_score(score.innovation_score)
            },
            "reasoning": score.reasoning,
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
        "overall_score": format_score(score.overall_score),
        "category_scores": {
            "team": format_score(score.team_score),
            "product": format_score(score.product_score),
            "market": format_score(score.market_score),
            "traction": format_score(score.traction_score),
            "financials": format_score(score.financials_score),
            "innovation": format_score(score.innovation_score)
        },
        "score_breakdown": score.score_breakdown,
        "reasoning": score.reasoning,
        "scoring_criteria": score.scoring_criteria,
        "confidence_level": score.confidence_level,
        "created_at": score.created_at.isoformat()
    }