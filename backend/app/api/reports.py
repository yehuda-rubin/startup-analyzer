from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from ..database import get_db
from ..models.models import Startup, Score, Analysis, MarketAnalysis
from ..services.llm_service import llm_service

router = APIRouter()


class ReportRequest(BaseModel):
    startup_ids: List[int]
    report_type: str = "investor_report"


@router.post("/generate")
async def generate_report(
    request: ReportRequest,
    db: Session = Depends(get_db)
):
    """Generate investor report"""
    try:
        reports = []
        
        for startup_id in request.startup_ids:
            startup = db.query(Startup).filter(Startup.id == startup_id).first()
            if not startup:
                continue
            
            # Get latest data
            latest_score = db.query(Score).filter(
                Score.startup_id == startup_id
            ).order_by(Score.created_at.desc()).first()
            
            latest_analysis = db.query(Analysis).filter(
                Analysis.startup_id == startup_id
            ).order_by(Analysis.created_at.desc()).first()
            
            latest_market = db.query(MarketAnalysis).filter(
                MarketAnalysis.startup_id == startup_id
            ).order_by(MarketAnalysis.created_at.desc()).first()
            
            # Generate report
            report = await _generate_startup_report(
                startup,
                latest_score,
                latest_analysis,
                latest_market
            )
            
            reports.append(report)
        
        return {"reports": reports}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/startups")
async def list_startups(db: Session = Depends(get_db)):
    """List all startups"""
    startups = db.query(Startup).all()
    
    return [
        {
            "id": startup.id,
            "name": startup.name,
            "description": startup.description,
            "industry": startup.industry,
            "stage": startup.stage,
            "created_at": startup.created_at.isoformat() if startup.created_at else None
        }
        for startup in startups
    ]


async def _generate_startup_report(
    startup: Startup,
    score: Score,
    analysis: Analysis,
    market: MarketAnalysis
) -> dict:
    """Generate comprehensive report for a startup"""
    
    # Executive Summary
    exec_summary = f"""
{startup.name} - Investment Analysis Report

Overall Score: {score.overall_score if score else 'N/A'}/100
Confidence: {score.confidence_level if score else 'N/A'}

{analysis.summary if analysis else 'No analysis available'}
"""
    
    # Market Opportunity
    market_section = ""
    if market:
        market_section = f"""
Market Opportunity:
- TAM: ${market.tam:,.0f}
- SAM: ${market.sam:,.0f}
- SOM: ${market.som:,.0f}
- Growth Rate: {market.growth_rate}%

{market.market_size_reasoning}
"""
    
    # Category Breakdown
    score_section = ""
    if score:
        score_section = f"""
Score Breakdown:
- Team: {score.team_score}/100
- Product: {score.product_score}/100
- Market: {score.market_score}/100
- Traction: {score.traction_score}/100
- Financials: {score.financials_score}/100
- Innovation: {score.innovation_score}/100

{score.reasoning}
"""
    
    # SWOT
    swot_section = ""
    if analysis:
        swot_section = f"""
Key Insights:
{chr(10).join('- ' + i for i in (analysis.key_insights or [])[:5])}

Strengths:
{chr(10).join('- ' + s for s in (analysis.strengths or [])[:3])}

Weaknesses:
{chr(10).join('- ' + w for w in (analysis.weaknesses or [])[:3])}

Opportunities:
{chr(10).join('- ' + o for o in (analysis.opportunities or [])[:3])}
"""
    
    return {
        "startup_id": startup.id,
        "startup_name": startup.name,
        "executive_summary": exec_summary.strip(),
        "market_analysis": market_section.strip(),
        "score_breakdown": score_section.strip(),
        "swot_analysis": swot_section.strip(),
        "overall_score": score.overall_score if score else None,
        "recommendation": _get_recommendation(score.overall_score if score else 50)
    }


def _get_recommendation(score: float) -> str:
    """Get investment recommendation based on score"""
    if score >= 80:
        return "Strong Buy - Exceptional opportunity with minimal risks"
    elif score >= 70:
        return "Buy - Solid investment with good potential"
    elif score >= 60:
        return "Hold - Moderate potential, requires careful monitoring"
    elif score >= 50:
        return "Cautious - Significant risks, detailed due diligence needed"
    else:
        return "Pass - High risk, insufficient value proposition"