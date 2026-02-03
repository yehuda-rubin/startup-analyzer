"""
Rate Limiting Service
Manages user quota tracking and rate limiting for analyses and chat questions
"""
from types import SimpleNamespace
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models.models import UserUsage
from fastapi import HTTPException


# ============================================
# TIER LIMITS CONFIGURATION
# ============================================
TIER_LIMITS = {
    'free': {
        'questions': {
            'per_analysis': 3,
            'daily': 7,
            'weekly': 20,
            'monthly': 50
        },
        'analyses': {
            'daily': 10,
            'weekly': None,  # No limit (soft monitoring at 50)
            'monthly': None  # No limit (soft monitoring at 100)
        }
    },
    'pro': {
        'questions': {
            'per_analysis': 10,
            'daily': 30,
            'weekly': 100,
            'monthly': 250
        },
        'analyses': {
            'daily': None,
            'weekly': None,
            'monthly': None
        }
    },
    'enterprise': {
        'questions': {
            'per_analysis': None,
            'daily': None,
            'weekly': None,
            'monthly': None
        },
        'analyses': {
            'daily': None,
            'weekly': None,
            'monthly': None
        }
    }
}


# ============================================
# EXCEPTIONS
# ============================================
class QuotaExceededError(HTTPException):
    """Custom exception for quota exceeded errors"""
    
    def __init__(
        self,
        limit_type: str,
        current: int,
        limit: int,
        reset_at: datetime = None,
        upgrade_cta: str = None
    ):
        detail = {
            "message": self._get_hebrew_message(limit_type, current, limit),
            "limit_type": limit_type,
            "current": current,
            "limit": limit,
            "reset_at": reset_at.isoformat() if reset_at else None,
            "upgrade_cta": upgrade_cta or "שדרג לתוכנית Pro לשאלות נוספות"
        }
        super().__init__(status_code=429, detail=detail)
    
    @staticmethod
    def _get_hebrew_message(limit_type: str, current: int, limit: int) -> str:
        """Generate Hebrew error message based on limit type"""
        messages = {
            'per_analysis': f'הגעת למגבלת {limit} שאלות לניתוח זה ({current}/{limit})',
            'daily': f'הגעת למגבלת {limit} שאלות ביום ({current}/{limit})',
            'weekly': f'הגעת למגבלת {limit} שאלות בשבוע ({current}/{limit})',
            'monthly': f'הגעת למגבלת {limit} שאלות בחודש ({current}/{limit})',
            'daily_analyses': f'הגעת למגבלת {limit} ניתוחים ביום ({current}/{limit})'
        }
        return messages.get(limit_type, f'הגעת למגבלה: {current}/{limit}')


# ============================================
# CORE RATE LIMITING FUNCTIONS
# ============================================
def get_or_create_user_usage(user_id: str, db: Session) -> UserUsage:
    """Get or create user usage record"""
    usage = db.query(UserUsage).filter(UserUsage.user_id == user_id).first()
    
    if not usage:
        # Create new user usage record with proper timezone-aware timestamps
        now = datetime.now(timezone.utc)
        usage = UserUsage(
            user_id=user_id,
            daily_questions=0,
            weekly_questions=0,
            monthly_questions=0,
            daily_analyses=0,
            weekly_analyses=0,
            monthly_analyses=0,
            daily_reset_at=now + timedelta(days=1),
            weekly_reset_at=_get_next_sunday_midnight(),
            monthly_reset_at=_get_next_month_start(),
            subscription_tier='free'
        )
        db.add(usage)
        db.commit()
        db.refresh(usage)
    
    return usage


def reset_usage_if_needed(usage: UserUsage, db: Session):
    """Reset counters if time windows have passed"""
    current_time = datetime.now(timezone.utc)
    
    # Reset daily
    if usage.daily_reset_at <= current_time:
        usage.daily_questions = 0
        usage.daily_analyses = 0
        usage.daily_reset_at = current_time + timedelta(days=1)
    
    # Reset weekly (Sunday midnight)
    if usage.weekly_reset_at <= current_time:
        usage.weekly_questions = 0
        usage.weekly_analyses = 0
        usage.weekly_reset_at = _get_next_sunday_midnight()
    
    # Reset monthly (1st of month)
    if usage.monthly_reset_at <= current_time:
        usage.monthly_questions = 0
        usage.monthly_analyses = 0
        usage.monthly_reset_at = _get_next_month_start()
    
    db.commit()


def validate_analysis_request(user_id: str, db: Session) -> UserUsage:
    """
    Validate if user can create a new analysis
    Returns UserUsage object if allowed, raises QuotaExceededError if not
    """
    usage = get_or_create_user_usage(user_id, db)
    reset_usage_if_needed(usage, db)
    
    tier = usage.subscription_tier
    limits = TIER_LIMITS.get(tier, TIER_LIMITS['free'])
    
    # Check daily analysis limit
    daily_limit = limits['analyses']['daily']
    if daily_limit is not None and usage.daily_analyses >= daily_limit:
        raise QuotaExceededError(
            limit_type='daily_analyses',
            current=usage.daily_analyses,
            limit=daily_limit,
            reset_at=usage.daily_reset_at,
            upgrade_cta="שדרג לתוכנית Pro לניתוחים ללא הגבלה"
        )
    
    # Anti-abuse: Check if user created 5+ analyses in last hour
    current_time = datetime.now(timezone.utc)
    one_hour_ago = current_time - timedelta(hours=1)
    
    # This is a simple check - in production you'd want to track timestamps
    # For now, we'll just check if daily count suggests abuse (5+ in short time)
    if usage.daily_analyses >= 5:
        # Add a small cooldown period
        print(f"⚠️ High analysis rate detected for user {user_id}")
    
    return usage


def validate_chat_request(
    user_id: str,
    analysis_id: int,
    current_questions_for_analysis: int,
    db: Session
) -> UserUsage:
    """
    Validate if user can ask a chat question
    Returns UserUsage object if allowed, raises QuotaExceededError if not
    """
    usage = get_or_create_user_usage(user_id, db)
    reset_usage_if_needed(usage, db)
    
    tier = usage.subscription_tier
    limits = TIER_LIMITS.get(tier, TIER_LIMITS['free'])
    question_limits = limits['questions']
    
    # Check per-analysis limit
    per_analysis_limit = question_limits['per_analysis']
    if per_analysis_limit is not None and current_questions_for_analysis >= per_analysis_limit:
        raise QuotaExceededError(
            limit_type='per_analysis',
            current=current_questions_for_analysis,
            limit=per_analysis_limit,
            reset_at=None,  # Per-analysis limit never resets
            upgrade_cta="שדרג לתוכנית Pro ל-10 שאלות לניתוח"
        )
    
    # Check daily limit
    daily_limit = question_limits['daily']
    if daily_limit is not None and usage.daily_questions >= daily_limit:
        raise QuotaExceededError(
            limit_type='daily',
            current=usage.daily_questions,
            limit=daily_limit,
            reset_at=usage.daily_reset_at
        )
    
    # Check weekly limit
    weekly_limit = question_limits['weekly']
    if weekly_limit is not None and usage.weekly_questions >= weekly_limit:
        raise QuotaExceededError(
            limit_type='weekly',
            current=usage.weekly_questions,
            limit=weekly_limit,
            reset_at=usage.weekly_reset_at
        )
    
    # Check monthly limit
    monthly_limit = question_limits['monthly']
    if monthly_limit is not None and usage.monthly_questions >= monthly_limit:
        raise QuotaExceededError(
            limit_type='monthly',
            current=usage.monthly_questions,
            limit=monthly_limit,
            reset_at=usage.monthly_reset_at
        )
    
    return usage


def increment_analysis_counter(user_id: str, db: Session):
    """Increment analysis counters after successful analysis creation"""
    usage = get_or_create_user_usage(user_id, db)
    
    usage.daily_analyses += 1
    usage.weekly_analyses += 1
    usage.monthly_analyses += 1
    
    db.commit()
    
    # Soft monitoring alerts (for admin dashboard)
    if usage.weekly_analyses >= 50:
        print(f"📊 Alert: User {user_id} reached {usage.weekly_analyses} analyses this week")
    if usage.monthly_analyses >= 100:
        print(f"📊 Alert: User {user_id} reached {usage.monthly_analyses} analyses this month")


def increment_question_counters(user_id: str, db: Session):
    """Increment question counters after successful question"""
    usage = get_or_create_user_usage(user_id, db)
    
    usage.daily_questions += 1
    usage.weekly_questions += 1
    usage.monthly_questions += 1
    
    db.commit()


def get_user_limits_status(user_id: str, db: Session) -> dict:
    """Get current usage status for a user"""
    usage = get_or_create_user_usage(user_id, db)
    reset_usage_if_needed(usage, db)
    
    tier = usage.subscription_tier
    limits = TIER_LIMITS.get(tier, TIER_LIMITS['free'])
    
    return {
        'tier': tier,
        'analyses': {
            'daily': {
                'current': usage.daily_analyses,
                'limit': limits['analyses']['daily'],
                'remaining': _calculate_remaining(
                    usage.daily_analyses,
                    limits['analyses']['daily']
                ),
                'reset_at': usage.daily_reset_at.isoformat()
            },
            'weekly': {
                'current': usage.weekly_analyses,
                'limit': limits['analyses']['weekly'],
                'remaining': _calculate_remaining(
                    usage.weekly_analyses,
                    limits['analyses']['weekly']
                ),
                'reset_at': usage.weekly_reset_at.isoformat()
            },
            'monthly': {
                'current': usage.monthly_analyses,
                'limit': limits['analyses']['monthly'],
                'remaining': _calculate_remaining(
                    usage.monthly_analyses,
                    limits['analyses']['monthly']
                ),
                'reset_at': usage.monthly_reset_at.isoformat()
            }
        },
        'questions': {
            'daily': {
                'current': usage.daily_questions,
                'limit': limits['questions']['daily'],
                'remaining': _calculate_remaining(
                    usage.daily_questions,
                    limits['questions']['daily']
                ),
                'reset_at': usage.daily_reset_at.isoformat()
            },
            'weekly': {
                'current': usage.weekly_questions,
                'limit': limits['questions']['weekly'],
                'remaining': _calculate_remaining(
                    usage.weekly_questions,
                    limits['questions']['weekly']
                ),
                'reset_at': usage.weekly_reset_at.isoformat()
            },
            'monthly': {
                'current': usage.monthly_questions,
                'limit': limits['questions']['monthly'],
                'remaining': _calculate_remaining(
                    usage.monthly_questions,
                    limits['questions']['monthly']
                ),
                'reset_at': usage.monthly_reset_at.isoformat()
            }
        }
    }


# ============================================
# HELPER FUNCTIONS
# ============================================
def _get_next_sunday_midnight() -> datetime:
    """Get next Sunday at midnight UTC"""
    now = datetime.now(timezone.utc)
    days_ahead = 6 - now.weekday()  # Sunday is 6
    if days_ahead <= 0:
        days_ahead += 7
    next_sunday = now + timedelta(days=days_ahead)
    return next_sunday.replace(hour=0, minute=0, second=0, microsecond=0)


def _get_next_month_start() -> datetime:
    """Get first day of next month at midnight UTC"""
    now = datetime.now(timezone.utc)
    if now.month == 12:
        return datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        return datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)


def _calculate_remaining(current: int, limit: int = None) -> int:
    """Calculate remaining quota"""
    if limit is None:
        return None  # Unlimited
    return max(0, limit - current)

# ============================================
# SERVICE INSTANCE (for imports)
# ============================================
from types import SimpleNamespace

# Create service instance that can be imported
rate_limit_service = SimpleNamespace(
    get_or_create_user_usage=get_or_create_user_usage,
    reset_usage_if_needed=reset_usage_if_needed,
    validate_analysis_request=validate_analysis_request,
    validate_chat_request=validate_chat_request,
    increment_analysis_counter=increment_analysis_counter,
    increment_question_counters=increment_question_counters,
    get_user_limits_status=get_user_limits_status
)