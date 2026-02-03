"""
Chat API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.models import Analysis, ChatMessage
from ..services.chat_service import chat_service
from ..services.rate_limit_service import rate_limit_service, QuotaExceededError

router = APIRouter()


# ============================================
# REQUEST/RESPONSE MODELS
# ============================================
class ChatQuestionRequest(BaseModel):
    question: str
    user_id: str


class ChatMessageResponse(BaseModel):
    question: str
    answer: str
    tokens_used: Optional[int] = None
    estimated_cost: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]


class UsageLimitsResponse(BaseModel):
    tier: str
    analyses: dict
    questions: dict


class RemainingQuestionsResponse(BaseModel):
    per_analysis: dict
    daily: dict
    weekly: dict
    monthly: dict


# ============================================
# ENDPOINTS
# ============================================
@router.post("/analyses/{analysis_id}/chat", response_model=ChatMessageResponse)
async def ask_question(
    analysis_id: int,
    request: ChatQuestionRequest,
    db: Session = Depends(get_db)
):
    """Ask a question about an analysis"""
    try:
        # Call the chat service (async)
        result = await chat_service.ask_question(
            analysis_id=analysis_id,
            user_id=request.user_id,
            question=request.question,
            db=db
        )
        return result
    
    except QuotaExceededError as e:
        # Re-raise quota errors with proper status code
        raise e
    
    except Exception as e:
        print(f"Error in ask_question: {e}")
        raise HTTPException(
            status_code=500,
            detail="שגיאה בשליחת השאלה. נסה שוב."
        )


@router.get("/analyses/{analysis_id}/chat", response_model=ChatHistoryResponse)
async def get_chat_history(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Get chat history for an analysis"""
    try:
        messages = await chat_service.get_chat_history(analysis_id, db)
        return {"messages": messages}
    
    except Exception as e:
        print(f"Error in get_chat_history: {e}")
        raise HTTPException(
            status_code=500,
            detail="שגיאה בטעינת היסטוריית הצ'אט"
        )


@router.get("/usage/{user_id}", response_model=UsageLimitsResponse)
def get_usage_limits(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user's current usage limits"""
    try:
        # This is NOT async - rate_limit_service is regular
        limits = rate_limit_service.get_user_limits_status(user_id, db)
        return limits
    
    except Exception as e:
        print(f"Error in get_usage_limits: {e}")
        raise HTTPException(
            status_code=500,
            detail="שגיאה בטעינת מגבלות השימוש"
        )


@router.get("/analyses/{analysis_id}/remaining-questions", response_model=RemainingQuestionsResponse)
def get_remaining_questions(
    analysis_id: int,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get remaining questions for this analysis and user"""
    try:
        # Get analysis
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Get user usage (NOT async - rate_limit_service is regular)
        usage = rate_limit_service.get_or_create_user_usage(user_id, db)
        rate_limit_service.reset_usage_if_needed(usage, db)
        
        # Get limits for user's tier
        from ..services.rate_limit_service import TIER_LIMITS
        limits = TIER_LIMITS.get(usage.subscription_tier, TIER_LIMITS['free'])
        
        # Calculate remaining
        per_analysis_limit = limits['questions']['per_analysis']
        daily_limit = limits['questions']['daily']
        weekly_limit = limits['questions']['weekly']
        monthly_limit = limits['questions']['monthly']
        
        return {
            'per_analysis': {
                'current': analysis.chat_questions_count or 0,
                'limit': per_analysis_limit,
                'remaining': max(0, per_analysis_limit - (analysis.chat_questions_count or 0)) if per_analysis_limit else None
            },
            'daily': {
                'current': usage.daily_questions,
                'limit': daily_limit,
                'remaining': max(0, daily_limit - usage.daily_questions) if daily_limit else None,
                'reset_at': usage.daily_reset_at.isoformat()
            },
            'weekly': {
                'current': usage.weekly_questions,
                'limit': weekly_limit,
                'remaining': max(0, weekly_limit - usage.weekly_questions) if weekly_limit else None,
                'reset_at': usage.weekly_reset_at.isoformat()
            },
            'monthly': {
                'current': usage.monthly_questions,
                'limit': monthly_limit,
                'remaining': max(0, monthly_limit - usage.monthly_questions) if monthly_limit else None,
                'reset_at': usage.monthly_reset_at.isoformat()
            }
        }
    
    except Exception as e:
        print(f"Error in get_remaining_questions: {e}")
        raise HTTPException(
            status_code=500,
            detail="שגיאה בחישוב שאלות נותרות"
        )


@router.get("/admin/usage-stats")
def get_usage_stats(
    db: Session = Depends(get_db)
):
    """Admin endpoint for monitoring usage"""
    try:
        # Get all chat messages this month
        from sqlalchemy import func, extract
        from datetime import datetime, timezone
        
        now = datetime.now(timezone.utc)
        
        # Count messages this month
        messages_count = db.query(func.count(ChatMessage.id)).filter(
            extract('month', ChatMessage.created_at) == now.month,
            extract('year', ChatMessage.created_at) == now.year
        ).scalar()
        
        # Sum costs
        total_cost = db.query(func.sum(ChatMessage.estimated_cost)).filter(
            extract('month', ChatMessage.created_at) == now.month,
            extract('year', ChatMessage.created_at) == now.year
        ).scalar() or 0.0
        
        # Count analyses this month
        analyses_count = db.query(func.count(Analysis.id)).filter(
            extract('month', Analysis.created_at) == now.month,
            extract('year', Analysis.created_at) == now.year
        ).scalar()
        
        # Get top users
        from ..models.models import UserUsage
        top_users = db.query(UserUsage).order_by(
            UserUsage.monthly_questions.desc()
        ).limit(10).all()
        
        return {
            'period': f'{now.year}-{now.month:02d}',
            'total_analyses': analyses_count,
            'total_questions': messages_count,
            'total_cost': round(total_cost, 2),
            'avg_cost_per_question': round(total_cost / messages_count, 4) if messages_count > 0 else 0,
            'top_users': [
                {
                    'user_id': u.user_id,
                    'tier': u.subscription_tier,
                    'questions': u.monthly_questions,
                    'analyses': u.monthly_analyses
                }
                for u in top_users
            ]
        }
    
    except Exception as e:
        print(f"Error in get_usage_stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="שגיאה בטעינת סטטיסטיקות"
        )