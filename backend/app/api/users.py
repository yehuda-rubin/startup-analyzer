from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models.models import User
from ..utils.auth import verify_firebase_token

router = APIRouter()

class UserCreate(BaseModel):
    firebase_uid: str
    email: str
    role: str

class UserResponse(BaseModel):
    firebase_uid: str
    email: str
    role: str

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user in the database.
    This should be called immediately after Firebase registration on the frontend.
    """
    db_user = db.query(User).filter(User.firebase_uid == user.firebase_uid).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    if user.role not in ['entrepreneur', 'investor']:
        raise HTTPException(status_code=400, detail="Invalid role")

    new_user = User(
        firebase_uid=user.firebase_uid,
        email=user.email,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = token.get("uid")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
